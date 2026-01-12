const dotenv = require('dotenv');
const path = require('path');

// 1. Load the default .env first
dotenv.config(); 

// 2. If we are in development, load .env.development and override
if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.development'), override: true });
}
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});