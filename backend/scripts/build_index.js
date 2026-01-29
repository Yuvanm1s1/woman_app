const fs = require('fs');
const path = require('path');
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const pdf = require('pdf-parse');
const mammoth = require('mammoth'); // <--- NEW: Reads Word Docs
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') }); 

// 📂 CONFIGURATION
const DATA_FOLDER = path.join(__dirname, '../data'); 
const OUTPUT_FOLDER = path.join(__dirname, '../vector_store');

async function run() {
  console.log("🚀 Starting RAG Indexing...");
  console.log(`📂 Looking for data in: ${DATA_FOLDER}`);

  if (!fs.existsSync(DATA_FOLDER)) {
      console.error("❌ ERROR: Data folder not found!");
      return;
  }

  // 1. READ FILES
  let rawText = "";
  const files = fs.readdirSync(DATA_FOLDER);
  console.log(`🔎 Found ${files.length} files:`, files);

  for (const file of files) {
    const filePath = path.join(DATA_FOLDER, file);
    const fileName = file.toLowerCase();
    
    try {
        if (fileName.endsWith('.pdf')) {
            console.log(`📖 Reading PDF: ${file}`);
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            rawText += data.text + "\n\n";
        } 
        else if (fileName.endsWith('.txt')) {
            console.log(`📖 Reading TXT: ${file}`);
            rawText += fs.readFileSync(filePath, 'utf-8') + "\n\n";
        }
        else if (fileName.endsWith('.docx')) {  // <--- NEW BLOCK
            console.log(`📖 Reading DOCX: ${file}`);
            const dataBuffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            rawText += result.value + "\n\n";
        } 
        else {
            console.log(`⚠️ Skipping unknown file: ${file}`);
        }
    } catch (err) {
        console.error(`❌ Failed to read ${file}: ${err.message}`);
    }
  }

  if (!rawText.trim()) {
      console.error("❌ ERROR: No text extracted! Check your files.");
      return;
  }

  // 2. CHUNK THE TEXT
  console.log("🔪 Splitting text into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,    
    chunkOverlap: 200, 
  });
  const docs = await splitter.createDocuments([rawText]);
  console.log(`📊 Created ${docs.length} chunks.`);

  // 3. CREATE VECTOR STORE 
  console.log("🧠 Generating Vectors (This uses OpenAI API)...");
  const vectorStore = await HNSWLib.fromDocuments(
    docs,
    new OpenAIEmbeddings()
  );

  // 4. SAVE TO DISK
  console.log(`💾 Saving Index to: ${OUTPUT_FOLDER}`);
  await vectorStore.save(OUTPUT_FOLDER);
  
  console.log("✅ RAG Indexing Complete! You can now search instantly.");
}

run().catch(console.error);