require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  appName: process.env.APP_NAME || 'HexTactics API',
  publicAppUrl: process.env.PUBLIC_APP_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME')
  },
  auth: {
    jwtSecret: required('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || '',
    displayName: process.env.ADMIN_DISPLAY_NAME || 'HexTactics Admin'
  }
};

function assertSafeConfig() {
  const problems = [];

  if (config.auth.jwtSecret.includes('CHANGE_ME') || config.auth.jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters and not contain CHANGE_ME.');
  }

  if (config.db.password.includes('CHANGE_ME')) {
    problems.push('DB_PASSWORD still contains CHANGE_ME.');
  }

  if (config.admin.password && config.admin.password.includes('CHANGE_ME')) {
    problems.push('ADMIN_PASSWORD still contains CHANGE_ME.');
  }

  if (config.port < 1 || config.port > 65535) {
    problems.push('PORT must be a valid TCP port.');
  }

  if (config.nodeEnv === 'production' && problems.length > 0) {
    throw new Error(`Unsafe production config:\n- ${problems.join('\n- ')}`);
  }

  return problems;
}

module.exports = { config, assertSafeConfig };
