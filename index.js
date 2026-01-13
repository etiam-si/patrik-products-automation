const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file to get potential DATA_PATH
dotenv.config();

// Determine the base path for .env files. Use DATA_PATH if defined, otherwise use the project root.
const envPath = process.env.DATA_PATH || process.cwd();

// 1. Load the default .env from the determined path, overriding any previous values.
dotenv.config({ path: path.resolve(envPath, '.env'), override: true });

// 2. If in development, load .env.development from the same path and override.
if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.resolve(envPath, '.env.development'), override: true });
}
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});