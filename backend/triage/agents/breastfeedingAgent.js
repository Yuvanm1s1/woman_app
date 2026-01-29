


// const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
// const { OllamaEmbeddings } = require("@langchain/ollama");
// const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const path = require("path");
// const { logTransaction } = require("../../utils/logger"); 

// // Path to the "Library"
// const VECTOR_STORE_PATH = path.join(__dirname, "../../vector_store");

// async function runBreastfeedingAgent(state, model) {
//   const start = Date.now();
//   const txnId = state.transactionId || "RAG_AGENT";
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   console.log(`🤱 [${txnId}] RAG AGENT: Researching -> "${lastMessage}"`);

//   // 1. Setup Embeddings
//   let embeddings;
//   if (process.env.LLM_MODE === "LOCAL") {
//     embeddings = new OllamaEmbeddings({
//       model: "nomic-embed-text", 
//       baseUrl: "http://localhost:11434",
//     });
//   } else {
//     embeddings = new GoogleGenerativeAIEmbeddings({
//       model: "embedding-001",
//       apiKey: process.env.GEMINI_API_KEY,
//     });
//   }

//   try {
//     // 2. Load the Vector Store
//     const vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);

//     // 3. Retrieve (Search for top 4 paragraphs to get more context)
//     const retriever = vectorStore.asRetriever(4);
//     const docs = await retriever.invoke(lastMessage);
    
//     // Combine text
//     const context = docs.map(d => d.pageContent).join("\n\n---\n\n");

//     // 🕵️‍♂️ DEBUG: Print the first 150 chars of what it found.
//     // If this prints nonsense, we know your database is empty/broken.
//     if (docs.length > 0) {
//         console.log(`📄 Found ${docs.length} docs. Top match: "${docs[0].pageContent.substring(0, 150)}..."`);
//     } else {
//         console.log("📄 ZERO documents found.");
//     }

//     // 4. Generate Answer (The "Smarter" Prompt)
//     const prompt = `
//       You are a specialized Breastfeeding Consultant.
      
//       USER QUESTION: "${lastMessage}"
      
//       RETRIEVED GUIDELINES (WHO/CDC):
//       ${context}
      
//       INSTRUCTIONS:
//       1. Answer the question using the guidelines above.
//       2. INTELLIGENT INFERENCE: If the text mentions "respiratory viruses", "infectious diseases", or "transmission risks", apply that logic to specific viruses like "Covid" or "Flu".
//       3. If the text says mothers should continue breastfeeding with precautions (masks/hand washing), say that clearly.
//       4. Only say "I don't know" if the text is completely unrelated (e.g., about food storage).
      
//       Answer in a warm, helpful tone.
//     `;

//     const response = await model.invoke([new HumanMessage(prompt)]);

//     logTransaction(txnId, "RAG_AGENT", "u1@gmail.com", { query: lastMessage }, { response: response.content }, start);
    
//     return { messages: [response], mode: "locked" };

//   } catch (error) {
//     console.error("❌ RAG Error:", error);
//     return { messages: [new SystemMessage("I am having trouble accessing the guidelines right now.")] };
//   }
// }

// module.exports = { runBreastfeedingAgent };



//fast 
// const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
// const { OpenAIEmbeddings } = require("@langchain/openai"); // 👈 Switch to OpenAI Embeddings
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const path = require("path");
// const { logTransaction } = require("../../utils/logger"); 

// // Path to the "Library"
// const VECTOR_STORE_PATH = path.join(__dirname, "../../vector_store");

// async function runBreastfeedingAgent(state, model) {
//   const start = Date.now();
//   const txnId = state.transactionId || "RAG_AGENT";
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   console.log(`🤱 [${txnId}] RAG AGENT: Researching -> "${lastMessage}"`);

//   // 1. Setup Embeddings (Must match what you used to create the vector store!)
//   // Assuming you want to switch entirely to OpenAI now.
//   const embeddings = new OpenAIEmbeddings({
//       apiKey: process.env.OPENAI_API_KEY,
//       modelName: "text-embedding-3-small" // Fast & Cheap
//   });

//   try {
//     // 2. Load the Vector Store
//     // Note: If your existing vector store was built with Nomic/Gemini, 
//     // you MUST rebuild it with OpenAI embeddings, or this will fail.
//     const vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);

//     // 3. Retrieve (Search for top 4 paragraphs)
//     const retriever = vectorStore.asRetriever(4);
//     const docs = await retriever.invoke(lastMessage);
    
//     const context = docs.map(d => d.pageContent).join("\n\n---\n\n");

//     if (docs.length > 0) {
//         console.log(`📄 Found ${docs.length} docs. Top match: "${docs[0].pageContent.substring(0, 50)}..."`);
//     } else {
//         console.log("📄 ZERO documents found.");
//     }

//     // 4. Generate Answer (Using the Smart Model passed from graph.js)
//     const prompt = `
//       You are a specialized Breastfeeding Consultant.
      
//       USER QUESTION: "${lastMessage}"
      
//       RETRIEVED GUIDELINES (WHO/CDC):
//       ${context}
      
//       INSTRUCTIONS:
//       1. Answer the question using the guidelines above.
//       2. INTELLIGENT INFERENCE: If text mentions "respiratory viruses", apply logic to "Covid" or "Flu".
//       3. Only say "I don't know" if the text is completely unrelated.
      
//       Answer in a warm, helpful tone.
//     `;

//     // Uses GPT-4o (passed as 'model')
//     const response = await model.invoke([new HumanMessage(prompt)]);

//     logTransaction(txnId, "RAG_AGENT", "u1@gmail.com", { query: lastMessage }, { response: response.content }, start);
    
//     return { messages: [response], mode: "locked" };

//   } catch (error) {
//     console.error("❌ RAG Error:", error);
//     // If vector store fails, fallback to general knowledge but warn the user
//     return { messages: [new SystemMessage("I couldn't access the specific guidelines, but generally speaking: Please consult a doctor for specific medical advice.")] };
//   }
// }

// module.exports = { runBreastfeedingAgent };


//rag indexing
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const path = require("path");
const { logTransaction } = require("../../utils/logger"); 

const VECTOR_STORE_PATH = path.join(__dirname, "../../vector_store");

// 🧠 GLOBAL CACHE (The Fix)
// We store the loaded brain here so we don't read the file 
// from the hard drive on every single request.
let cachedVectorStore = null;

async function runBreastfeedingAgent(state, model) {
  const start = Date.now();
  const txnId = state.transactionId || "RAG_AGENT";
  const lastMessage = state.messages[state.messages.length - 1].content;
  
  console.log(`🤱 [${txnId}] RAG AGENT: Researching -> "${lastMessage}"`);

  // 1. Setup Embeddings
  const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY
  });

  try {
    // 2. Load Vector Store (WITH CACHING ⚡)
    if (!cachedVectorStore) {
        console.log("💿 Loading Index from Disk (First Time Only)...");
        cachedVectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
    } else {
        console.log("⚡ Using Cached Index (RAM)");
    }

    // 3. Retrieve
    const retriever = cachedVectorStore.asRetriever(4);
    const docs = await retriever.invoke(lastMessage);
    
    if (!docs || docs.length === 0) {
        return { messages: [new SystemMessage("I couldn't find specific info in my database.")] };
    }

    const context = docs.map(d => d.pageContent).join("\n\n---\n\n");
    console.log(`📄 Found ${docs.length} docs.`);

    // 4. Generate Answer
    // Added "CONCISE" instruction to stop it from writing essays
    const prompt = `
      You are a specialized Breastfeeding Consultant.
      
      USER QUESTION: "${lastMessage}"
      
      RETRIEVED GUIDELINES:
      ${context}
      
      INSTRUCTIONS:
      1. Answer based ONLY on the guidelines.
      2. BE CONCISE. Keep answer under 3 sentences if possible.
      3. Answer in a warm, helpful tone.
    `;

    const response = await model.invoke([new HumanMessage(prompt)]);

    logTransaction(txnId, "RAG_AGENT", "u1@gmail.com", { query: lastMessage }, { response: response.content }, start);
    
    return { messages: [response], mode: "locked" };

  } catch (error) {
    console.error("❌ RAG Error:", error);
    return { messages: [new SystemMessage("System Error: Could not access medical guidelines.")] };
  }
}

module.exports = { runBreastfeedingAgent };