// Load environment variables before anything else reads process.env.
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('  Melody API is running');
    console.log(`  -> http://localhost:${PORT}/api/health`);
    console.log(`  -> http://localhost:${PORT}/api/auth`);
    console.log(`  -> http://localhost:${PORT}/api/songs`);
    console.log('');
  });

  // Give in-flight requests a chance to finish on Ctrl+C.
  const shutdown = () => {
    console.log('\nShutting down Melody API...');
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
