const { z } = require('zod');
const { query, getOne } = require('./db/pool');
const { requireAuth, requireRole } = require('./auth');

const projectSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  type: z.enum(['minecraft', 'fivem', 'website', 'other']),
  domain: z.string().max(190).optional().nullable(),
  status: z.enum(['planned', 'development', 'live', 'paused']),
  description: z.string().max(5000).optional().nullable()
});

async function writeAudit(userId, action, entityType, entityId, metadata = {}) {
  await query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?)',
    [userId || null, action, entityType || null, entityId || null, JSON.stringify(metadata)]
  );
}

function registerAdminRoutes(app) {
  const adminOnly = [requireAuth, requireRole('owner', 'admin')];

  app.get('/api/admin/summary', ...adminOnly, async (req, res, next) => {
    try {
      const users = await getOne('SELECT COUNT(*) AS total FROM users');
      const projects = await getOne('SELECT COUNT(*) AS total FROM projects');
      const products = await getOne('SELECT COUNT(*) AS total FROM products');
      const orders = await getOne('SELECT COUNT(*) AS total FROM orders');
      const recentLogs = await query(
        `SELECT action, entity_type, entity_id, created_at
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT 10`
      );

      res.json({
        ok: true,
        summary: {
          users: users.total,
          projects: projects.total,
          products: products.total,
          orders: orders.total
        },
        recentLogs
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/admin/users', ...adminOnly, async (req, res, next) => {
    try {
      const users = await query(
        `SELECT id, email, display_name, role, status, created_at, updated_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 100`
      );
      res.json({ ok: true, users });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/admin/projects', ...adminOnly, async (req, res, next) => {
    try {
      const projects = await query(
        `SELECT id, slug, name, type, domain, status, description, created_at, updated_at
         FROM projects
         ORDER BY name`
      );
      res.json({ ok: true, projects });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/admin/projects', ...adminOnly, async (req, res, next) => {
    try {
      const input = projectSchema.parse(req.body);
      await query(
        `INSERT INTO projects (slug, name, type, domain, status, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [input.slug, input.name, input.type, input.domain || null, input.status, input.description || null]
      );
      await writeAudit(req.user.id, 'project.created', 'project', input.slug, { name: input.name });
      res.status(201).json({ ok: true });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ ok: false, error: error.errors[0]?.message || 'Invalid input.' });
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ ok: false, error: 'Project slug already exists.' });
      next(error);
    }
  });

  app.put('/api/admin/projects/:slug', ...adminOnly, async (req, res, next) => {
    try {
      const input = projectSchema.parse({ ...req.body, slug: req.params.slug });
      const result = await query(
        `UPDATE projects
         SET name = ?, type = ?, domain = ?, status = ?, description = ?
         WHERE slug = ?`,
        [input.name, input.type, input.domain || null, input.status, input.description || null, req.params.slug]
      );

      if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Project not found.' });
      await writeAudit(req.user.id, 'project.updated', 'project', req.params.slug, { name: input.name });
      res.json({ ok: true });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ ok: false, error: error.errors[0]?.message || 'Invalid input.' });
      next(error);
    }
  });
}

module.exports = { registerAdminRoutes };
