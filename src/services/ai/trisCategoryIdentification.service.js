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
    Map products to the correct ID from this list: ${JSON.stringify(validCategories)}. 
    Return the best leaf node ID. If unsure, use the ID for "Ostalo".`,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    },
});

async function processBatch(products) {
    try {
        const inputData = products.map(p => ({ code: p.code, name: p.product_name }));
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
        const productsPath = path.join(dataDir, 'pnv', 'products.json');
        const allProducts = JSON.parse(await fs.readFile(productsPath, 'utf-8'));

        const finalResults = [];

        for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
            const batch = allProducts.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

            const batchResults = await processBatch(batch);
            finalResults.push(...batchResults);
        }

        console.log(`Successfully categorized: ${finalResults.length} products`);

        const trisDataDir = path.join(dataDir, 'tris');
        await fs.mkdir(trisDataDir, { recursive: true });
        const savePath = path.join(trisDataDir, 'productCategories.json');
        await fs.writeFile(savePath, JSON.stringify(finalResults, null, 2));

        console.log(`Categorization results saved to: ${savePath}`);
    } catch (error) {
        console.error('Orchestrator Error:', error.message);
    }
}

module.exports = { identifyProductsTrisCategories };