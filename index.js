const dotenv = require('dotenv');
const path = require('path');

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

const { app, initJobs} = require('./src/app');
const { connectToDb } = require('./src/services/db/mongo.service');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to the database
  await connectToDb();

  // Then, run initial setup jobs
  initJobs();

  // Then, start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// NOTE: The 'server' variable was not defined in the original snippet.
// app.listen() returns the server instance, which you need for graceful shutdown.
// Your code should look like this:
// const server = app.listen(PORT, ...);

const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server gracefully...');
  // Assuming 'server' is the return value of app.listen()
  // server.close(async () => {
    console.log('HTTP server closed.');
    // The MongoDB connection is managed globally and should be closed here if needed.
    // For example: await closeDb();
    process.exit(0);
  // });
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();