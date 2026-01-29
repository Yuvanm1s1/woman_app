const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("@langchain/openai"); // 👈 Enterprise Mode
//const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "../.env") });

// --- CONFIGURATION ---
// We specifically target your WHO file
const FILE_PATH = path.join(__dirname, "../data/WHO_Breastfeeding_Complete.docx");
const VECTOR_STORE_PATH = path.join(__dirname, "../vector_store");

async function ingestDocs() {
  console.log("🚀 Starting Ingestion (Enterprise Mode - OpenAI)...");

  // 1. Validate API Key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: OPENAI_API_KEY is missing in .env");
    process.exit(1);
  }

  // 2. Read the DOCX File
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Error: File not found at ${FILE_PATH}`);
    return;
  }

  console.log("📄 Reading WHO Document (DOCX)...");
  const buffer = fs.readFileSync(FILE_PATH);
  
  // Extract text using Mammoth
  const result = await mammoth.extractRawText({ buffer: buffer });
  const text = result.value;
  
  console.log(`✅ Extracted ${text.length} characters.`);

  // 3. Split Text into Chunks
  // OpenAI allows larger chunks (1000 tokens is safe and efficient)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  console.log(`🧩 Split into ${docs.length} chunks.`);

  // 4. Create Embeddings (The Brain)
  console.log("🧠 Generating Embeddings (text-embedding-3-small)...");
  
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small" // Fast, cheap, and very accurate
  });

  // 5. Build and Save
  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
  await vectorStore.save(VECTOR_STORE_PATH);

  console.log(`💾 Vector Store saved to: ${VECTOR_STORE_PATH}`);
  console.log("🎉 Enterprise Ingestion Complete!");
}

ingestDocs().catch((err) => {
  console.error("❌ Ingestion Failed:", err);
});