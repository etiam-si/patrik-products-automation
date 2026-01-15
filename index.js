const dotenv = require('dotenv');
const path = require('path');
const { execSync } = require('child_process');

// Determine the base path for .env files. Use DATA_PATH if defined, otherwise use the project root.
// In Docker, DATA_PATH will be '/data' from the Dockerfile. Locally, it will be the project directory.
const envPath = process.env.DATA_PATH || process.cwd();

console.log(`Loading environment files from: ${envPath}`);

// Load the default .env file from the determined path.
dotenv.config({ path: path.join(envPath, '.env') });

// If in development, load .env.development to override any default values.
// The 'override' option is only needed here to ensure development settings take precedence.
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.resolve(envPath, '.env.development'), override: true });
}
console.log(`App Started (${process.env.NODE_ENV})`)

const { app, initJobs } = require('./src/app');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // First, run initial setup jobs
  await initJobs();

  // Then, start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();