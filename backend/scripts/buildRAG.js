const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const FILE_PATH = path.join(__dirname, "../data/WHO_Breastfeeding_Complete.docx");
const VECTOR_STORE_PATH = path.join(__dirname, "../vector_store");

async function buildVectorStore() {
  console.log("🚀 Starting RAG Build...");

  // 1. SELECT EMBEDDING MODEL (Must match your LLM_MODE)
  let embeddings;
  if (process.env.LLM_MODE === "LOCAL") {
    console.log("💻 Using Ollama Embeddings (llama3)");
    embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text", 
      baseUrl: "http://localhost:11434",
    });
  } else {
    console.log("🌐 Using Gemini Embeddings");
    embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001", // Standard Gemini embedding model
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  // 2. READ DOCX FILE
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Error: File not found at ${FILE_PATH}`);
    return;
  }
  console.log("📄 Reading WHO Document...");
  const buffer = fs.readFileSync(FILE_PATH);
  const result = await mammoth.extractRawText({ buffer: buffer });
  const text = result.value;
  console.log(`✅ Read ${text.length} characters.`);

  // 3. SPLIT TEXT INTO CHUNKS
  // We chop the document into pieces of 1000 characters so the AI can find specific paragraphs.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200, // Small overlap so context isn't lost
  });
  const docs = await splitter.createDocuments([text]);
  console.log(`🧩 Split into ${docs.length} chunks.`);

  // 4. CREATE VECTOR STORE & SAVE
  console.log("🧠 Vectorizing... (This may take a moment)");
  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
  
  await vectorStore.save(VECTOR_STORE_PATH);
  console.log(`💾 Vector Store saved to: ${VECTOR_STORE_PATH}`);
  console.log("🎉 RAG Build Complete!");
}

buildVectorStore().catch(console.error);