const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { config } = require('./config');
const { getOne, query } = require('./db/pool');

const registerSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(120)
});

const loginSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(1).max(128)
});

function createToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name || user.displayName,
    role: user.role,
    status: user.status,
    createdAt: user.created_at
  };
}

function setAuthCookie(res, token) {
  res.cookie('ht_auth', token, {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie('ht_auth');
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.cookies.ht_auth;

    if (!token) return res.status(401).json({ ok: false, error: 'Not authenticated.' });

    const payload = jwt.verify(token, config.auth.jwtSecret);
    const user = await getOne(
      'SELECT id, email, display_name, role, status, created_at FROM users WHERE id = ? LIMIT 1',
      [payload.sub]
    );

    if (!user || user.status !== 'active') {
      return res.status(401).json({ ok: false, error: 'Account not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Invalid session.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden.' });
    }
    next();
  };
}

function registerAuthRoutes(app) {
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const input = registerSchema.parse(req.body);
      const existing = await getOne('SELECT id FROM users WHERE email = ? LIMIT 1', [input.email]);
      if (existing) return res.status(409).json({ ok: false, error: 'Email is already registered.' });

      const passwordHash = await bcrypt.hash(input.password, 12);
      const result = await query(
        'INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)',
        [input.email.toLowerCase(), passwordHash, input.displayName, 'user']
      );

      const user = await getOne(
        'SELECT id, email, display_name, role, status, created_at FROM users WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      const token = createToken(user);
      setAuthCookie(res, token);
      res.status(201).json({ ok: true, user: publicUser(user), token });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ ok: false, error: error.errors[0]?.message || 'Invalid input.' });
      next(error);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      const user = await getOne(
        'SELECT id, email, password_hash, display_name, role, status, created_at FROM users WHERE email = ? LIMIT 1',
        [input.email.toLowerCase()]
      );

      if (!user || user.status !== 'active') return res.status(401).json({ ok: false, error: 'Invalid login.' });

      const valid = await bcrypt.compare(input.password, user.password_hash);
      if (!valid) return res.status(401).json({ ok: false, error: 'Invalid login.' });

      const token = createToken(user);
      setAuthCookie(res, token);
      res.json({ ok: true, user: publicUser(user), token });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ ok: false, error: error.errors[0]?.message || 'Invalid input.' });
      next(error);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ ok: true, user: publicUser(req.user) });
  });
}

module.exports = { registerAuthRoutes, requireAuth, requireRole, publicUser };
