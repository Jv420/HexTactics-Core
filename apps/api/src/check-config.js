require('dotenv').config();

const { config, assertSafeConfig } = require('./config');

console.log('HexTactics API config check');
console.log('---------------------------');
console.log(`APP_NAME: ${config.appName}`);
console.log(`PORT: ${config.port}`);
console.log(`DB_HOST: ${config.db.host}`);
console.log(`DB_NAME: ${config.db.database}`);
console.log(`NODE_ENV: ${config.nodeEnv}`);

try {
  const warnings = assertSafeConfig();
  if (!warnings.length) {
    console.log('OK: config looks ready.');
  } else {
    for (const warning of warnings) console.log(`WARN: ${warning}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
