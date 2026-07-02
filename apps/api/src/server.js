require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { config, assertSafeConfig } = require('./config');
const { getOne, query } = require('./db/pool');
const { registerAuthRoutes, requireAuth } = require('./auth');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

app.use(helmet());
app.use(cors({ origin: config.publicAppUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

registerAuthRoutes(app);

app.get('/api/health', async (req, res) => {
  let database = 'unknown';
  try {
    await getOne('SELECT 1 AS ok');
    database = 'online';
  } catch (error) {
    database = 'offline';
  }

  res.json({
    ok: database === 'online',
    service: config.appName,
    database,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/projects', async (req, res, next) => {
  try {
    const projects = await query(
      `SELECT slug, name, type, domain, status, description, created_at, updated_at
       FROM projects
       ORDER BY FIELD(slug, 'dynathismp', 'delfzijlrp', 'delfzijlcity', 'appingedamsco'), name`
    );
    res.json({ ok: true, projects });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/:slug', async (req, res, next) => {
  try {
    const project = await getOne(
      `SELECT slug, name, type, domain, status, description, created_at, updated_at
       FROM projects
       WHERE slug = ?
       LIMIT 1`,
      [req.params.slug]
    );

    if (!project) return res.status(404).json({ ok: false, error: 'Project not found.' });
    res.json({ ok: true, project });
  } catch (error) {
    next(error);
  }
});

app.get('/api/dashboard', requireAuth, async (req, res, next) => {
  try {
    const projectCount = await getOne('SELECT COUNT(*) AS total FROM projects');
    const orderCount = await getOne('SELECT COUNT(*) AS total FROM orders');
    res.json({
      ok: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.display_name,
        role: req.user.role
      },
      stats: {
        projects: projectCount.total,
        orders: orderCount.total
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/status/public', async (req, res, next) => {
  try {
    const projects = await query(
      `SELECT slug, name, type, domain, status
       FROM projects
       ORDER BY name`
    );

    res.json({
      ok: true,
      brand: 'HexTactics',
      message: 'Gaming, Development & Infrastructure',
      projects,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found.' });
});

app.use((error, req, res, next) => {
  req.log.error(error);
  res.status(500).json({ ok: false, error: 'Internal server error.' });
});

try {
  const warnings = assertSafeConfig();
  for (const warning of warnings) logger.warn(warning);
} catch (error) {
  logger.error(error.message);
  process.exit(1);
}

app.listen(config.port, () => {
  logger.info(`${config.appName} running on ${config.apiBaseUrl}`);
});
