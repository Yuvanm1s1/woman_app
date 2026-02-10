const fs = require('fs');
const path = require('path');
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { DocxLoader } = require("@langchain/community/document_loaders/fs/docx");
const MiniSearch = require('minisearch');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// 1. Setup Paths
const DATA_DIR = path.join(__dirname, '../data/heart_docs'); // PUT YOUR 5 FILES HERE
const VECTOR_STORE_PATH = path.join(__dirname, '../vector_store_heart');
const KEYWORD_STORE_PATH = path.join(__dirname, '../keyword_store_heart.json');

async function runHybridIngest() {
    console.log("🫀 Starting Hybrid Ingestion (Heart Disease)...");

    // 2. Load the 5 Docx Files
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.docx'));
    let allDocs = [];

    for (const file of files) {
        console.log(`📄 Loading: ${file}`);
        const loader = new DocxLoader(path.join(DATA_DIR, file));
        const docs = await loader.load();
        // Add metadata so we know which file it came from
        docs.forEach(d => d.metadata.source = file);
        allDocs.push(...docs);
    }

    // 3. Split into Chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splits = await splitter.splitDocuments(allDocs);
    console.log(`✂️  Split into ${splits.length} chunks.`);

    // ==========================================
    // PART A: Build Vector Store (Concepts)
    // ==========================================
    console.log("🧠 Building Vector Store (HNSW)...");
    const vectorStore = await HNSWLib.fromDocuments(
        splits,
        new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY })
    );
    await vectorStore.save(VECTOR_STORE_PATH);

    // ==========================================
    // PART B: Build Keyword Index (Exact Words)
    // ==========================================
    console.log("🔎 Building Keyword Index (MiniSearch)...");
    
    // Configure MiniSearch
    const miniSearch = new MiniSearch({
        fields: ['pageContent'], // Search inside the text
        storeFields: ['pageContent', 'source', 'id'], // What to return
        idField: 'id'
    });

    // Prepare data for MiniSearch (Needs unique IDs)
    const keywordData = splits.map((doc, index) => ({
        id: index, // Simple numeric ID
        pageContent: doc.pageContent,
        source: doc.metadata.source
    }));

    // Index all chunks
    miniSearch.addAll(keywordData);

    // Save to JSON file
    fs.writeFileSync(KEYWORD_STORE_PATH, JSON.stringify(miniSearch.toJSON()));

    console.log("✅ Hybrid Ingestion Complete!");
    console.log(`📂 Vectors saved to: ${VECTOR_STORE_PATH}`);
    console.log(`📂 Keywords saved to: ${KEYWORD_STORE_PATH}`);
}

runHybridIngest();