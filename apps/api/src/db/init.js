require('dotenv').config();

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { config, assertSafeConfig } = require('../config');

async function main() {
  const warnings = assertSafeConfig();
  for (const warning of warnings) console.warn(`WARN: ${warning}`);

  const server = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true
  });

  await server.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  const db = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(120) NOT NULL,
      role ENUM('owner','admin','staff','user') NOT NULL DEFAULT 'user',
      status ENUM('active','disabled') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(80) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      type ENUM('minecraft','fivem','website','other') NOT NULL DEFAULT 'other',
      domain VARCHAR(190) NULL,
      status ENUM('planned','development','live','paused') NOT NULL DEFAULT 'planned',
      description TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      project_id BIGINT UNSIGNED NOT NULL,
      slug VARCHAR(80) NOT NULL,
      name VARCHAR(120) NOT NULL,
      description TEXT NULL,
      price_cents INT UNSIGNED NOT NULL DEFAULT 0,
      currency CHAR(3) NOT NULL DEFAULT 'EUR',
      status ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_project_product (project_id, slug),
      CONSTRAINT fk_products_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      project_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NULL,
      status ENUM('pending','paid','delivered','failed','refunded') NOT NULL DEFAULT 'pending',
      total_cents INT UNSIGNED NOT NULL DEFAULT 0,
      currency CHAR(3) NOT NULL DEFAULT 'EUR',
      external_reference VARCHAR(190) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_project FOREIGN KEY (project_id) REFERENCES projects(id),
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NULL,
      action VARCHAR(120) NOT NULL,
      entity_type VARCHAR(80) NULL,
      entity_id VARCHAR(80) NULL,
      metadata JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  const projects = [
    ['dynathismp', 'DynathiSMP', 'minecraft', 'dynathismp.nl', 'development', 'Minecraft SMP community by HexTactics.'],
    ['delfzijlrp', 'DelfzijlRP', 'fivem', 'delfzijlrp.nl', 'development', 'FiveM roleplay community by HexTactics.'],
    ['delfzijlcity', 'DelfzijlCity', 'fivem', 'delfzijlcity.nl', 'development', 'FiveM city project by HexTactics.'],
    ['appingedamsco', 'AppingedamSCO', 'fivem', 'appingedamsco.nl', 'planned', 'Future FiveM/project community by HexTactics.']
  ];

  for (const project of projects) {
    await db.execute(
      `INSERT INTO projects (slug, name, type, domain, status, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), domain=VALUES(domain), description=VALUES(description)`,
      project
    );
  }

  if (config.admin.password && !config.admin.password.includes('CHANGE_ME')) {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [config.admin.email]);
    if (!existing.length) {
      const passwordHash = await bcrypt.hash(config.admin.password, 12);
      await db.execute(
        'INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)',
        [config.admin.email, passwordHash, config.admin.displayName, 'owner']
      );
      console.log(`Created first owner user: ${config.admin.email}`);
    }
  }

  await db.end();
  console.log('HexTactics database initialized successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
