const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const categories = require('../../../data/tris/trisCategories.json');
const fs = require('fs/promises');
const path = require('path');

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = 'gemini-2.5-flash'; // Note: Ensure you use a supported model
const BATCH_SIZE = 30;

// 1. Minimized Category List
const validCategories = categories.items
    .filter(item => item.label.startsWith('Katalog'))
    .map(item => ({ id: item.id, label: item.label }));

// 2. Optimized Schema
const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        results: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    code: { type: SchemaType.STRING },
                    catId: { type: SchemaType.NUMBER }
                },
                required: ["code", "catId"]
            }
        }
    },
    required: ["results"]
};

// 3. Centralized Model Configuration
// By putting the categories in the system instruction here, 
// the API automatically handles the "context window" optimization.
const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `You are a Product Mapping Assistant. 
    You will be given a list of products. Some products may have a 'child_products' array which represent product variants.
    Use the information in 'child_products' to get more context about the parent product, but ONLY return a category for the parent product.
    Do NOT categorize items inside the 'child_products' array.
    Map each parent product to the most specific and correct category ID from this list: ${JSON.stringify(validCategories)}. 
    If you are unsure, use the ID for "Ostalo".`,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    },
});

async function processBatch(products) {
    try {
        // Create a focused input for the AI, including child products for context.
        // const inputData = products.map(p => ({ code: p.code, product_name: p.product_name, description: p.description, child_products: p.child_products }));
        const inputData = [...products];
        const prompt = `Categorize these products: ${JSON.stringify(inputData)}`;

        const result = await model.generateContent(prompt);
        const jsonResponse = JSON.parse(result.response.text());
        return jsonResponse.results;
    } catch (error) {
        console.error('Batch Error:', error.message);
        return [];
    }
}

async function identifyProductsTrisCategories() {
    try {
        const dataDir = process.env.DATA_PATH || path.join(__dirname, '..', '..', '..', 'data');
        const trisDataDir = path.join(dataDir, 'tris');
        const productsPath = path.join(dataDir, 'pnv', 'products.json');
        const categoriesPath = path.join(trisDataDir, 'productCategories.json');

        let existingCategories = [];
        let categorizedCodes = new Set();

        try {
            await fs.mkdir(trisDataDir, { recursive: true });
            const existingData = await fs.readFile(categoriesPath, 'utf-8');
            existingCategories = JSON.parse(existingData);
            categorizedCodes = new Set(existingCategories.map(p => p.code));
            console.log(`Found ${categorizedCodes.size} existing categorized products.`);
        } catch (error) {
            if (error.code !== 'ENOENT') { // ENOENT means file doesn't exist, which is fine on first run.
                console.warn(`Warning: Could not read or parse existing categories file: ${error.message}`);
            }
        }

        const allProducts = JSON.parse(await fs.readFile(productsPath, 'utf-8'));
        const productsToCategorize = allProducts.filter(p => !categorizedCodes.has(p.code));

        if (productsToCategorize.length === 0) {
            console.log('No new products to categorize. All products are up to date.');
            return;
        }

        console.log(`Found ${productsToCategorize.length} new products to categorize.`);
        const newResults = [];
        for (let i = 0; i < productsToCategorize.length; i += BATCH_SIZE) {
            const batch = productsToCategorize.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
            const batchResults = await processBatch(batch);
            newResults.push(...batchResults);
        }

        const finalResults = [...existingCategories, ...newResults];
        await fs.writeFile(categoriesPath, JSON.stringify(finalResults, null, 2));
        console.log(`Successfully categorized ${newResults.length} new products. Results saved to: ${categoriesPath}`);
    } catch (error) {
        console.error('Orchestrator Error:', error.message);
    }
}

module.exports = { identifyProductsTrisCategories };