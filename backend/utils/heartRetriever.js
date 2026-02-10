const fs = require('fs');
const path = require('path');
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("@langchain/openai");
const MiniSearch = require('minisearch');

let vectorStore = null;
let keywordStore = null;

const VECTOR_PATH = path.join(__dirname, '../vector_store_heart');
const KEYWORD_PATH = path.join(__dirname, '../keyword_store_heart.json');

async function initializeHeartEngine() {
    if (vectorStore && keywordStore) return; // Already loaded

    console.log("⏳ Loading Heart Engines (Hybrid)...");
    
    // 1. Load Vector Store
    vectorStore = await HNSWLib.load(
        VECTOR_PATH,
        new OpenAIEmbeddings()
    );

    // 2. Load Keyword Store
    const jsonStr = fs.readFileSync(KEYWORD_PATH, 'utf-8');
    keywordStore = MiniSearch.loadJSON(jsonStr, {
        fields: ['pageContent'],
        storeFields: ['pageContent', 'source', 'id']
    });
    
    console.log("✅ Heart Engines Ready.");
}

// 🔀 THE HYBRID ALGORITHM (Reciprocal Rank Fusion)
async function hybridSearch(query, k = 4) {
    await initializeHeartEngine();

    // Step A: Vector Search (Semantic)
    // "I have chest pain" -> Matches "Angina symptoms"
    const vectorResults = await vectorStore.similaritySearch(query, k);

    // Step B: Keyword Search (Exact)
    // "Acitrom" -> Matches "Acitrom"
    const keywordResultsRaw = keywordStore.search(query, { fuzzy: 0.2, boost: { pageContent: 2 } });
    const keywordResults = keywordResultsRaw.slice(0, k).map(res => ({
        pageContent: res.pageContent,
        metadata: { source: res.source, type: 'keyword_match' }
    }));

    // Step C: DEDUPLICATE & MERGE
    // We combine them. If a document appears in both, it's very important.
    // For simplicity, we just concatenate and remove exact duplicates.
    
    const allResults = [...vectorResults, ...keywordResults];
    const uniqueResults = [];
    const seenContent = new Set();

    for (const doc of allResults) {
        // Create a short signature to check duplicates
        const signature = doc.pageContent.substring(0, 50); 
        if (!seenContent.has(signature)) {
            seenContent.add(signature);
            uniqueResults.push(doc);
        }
    }

    console.log(`🔍 Hybrid Search: Found ${vectorResults.length} Vector + ${keywordResults.length} Keyword. Merged to ${uniqueResults.length}.`);
    return uniqueResults;
}

module.exports = { hybridSearch };