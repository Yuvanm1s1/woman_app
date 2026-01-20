// const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
// const { OllamaEmbeddings } = require("@langchain/ollama");
// const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const path = require("path");
// const { logTransaction } = require("../../utils/logger"); 

// // Path to the "Library" you just built
// const VECTOR_STORE_PATH = path.join(__dirname, "../../vector_store");

// async function runBreastfeedingAgent(state, model) {
//   const start = Date.now();
//   // Use the ID passed from the graph, or generate a temp one
//   const txnId = state.transactionId || "RAG_AGENT";
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   console.log(`🤱 [${txnId}] RAG AGENT: Researching -> "${lastMessage}"`);

//   // 1. Setup Embeddings (MUST match what you used in buildRAG.js)
//   let embeddings;
//   if (process.env.LLM_MODE === "LOCAL") {
//     embeddings = new OllamaEmbeddings({
//       model: "nomic-embed-text", // ✅ Using the fast model you just pulled
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

//     // 3. Retrieve (Search for top 3 paragraphs)
//     const retriever = vectorStore.asRetriever(3);
//     const docs = await retriever.invoke(lastMessage);
    
//     // Combine the paragraphs into one big text block
//     const context = docs.map(d => d.pageContent).join("\n\n");

//     console.log(`📄 Found ${docs.length} relevant paragraphs.`);

//     // 4. Generate Answer (The "Strict" Prompt)
//     const prompt = `
//       You are a Breastfeeding Specialist Assistant.
      
//       INSTRUCTIONS:
//       1. Answer the user's question using ONLY the context below.
//       2. If the answer is not in the context, say "I cannot find specific information on that in the WHO guidelines."
//       3. Do NOT use outside knowledge.
//       4. Cite the source context if possible.

//       CONTEXT from WHO Guidelines:
//       ${context}

//       USER QUESTION:
//       "${lastMessage}"
//     `;

//     // We use the main model (Llama3 or Gemini) to write the final answer
//     const response = await model.invoke([new HumanMessage(prompt)]);

//     // 5. Log & Return
//     logTransaction(txnId, "RAG_AGENT", "u1@gmail.com", { query: lastMessage }, { response: response.content }, start);
    
//     return { messages: [response], mode: "locked" };

//   } catch (error) {
//     console.error("❌ RAG Error:", error);
//     return { messages: [new SystemMessage("I am having trouble accessing the WHO guidelines right now.")] };
//   }
// }

// module.exports = { runBreastfeedingAgent };



const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const path = require("path");
const { logTransaction } = require("../../utils/logger"); 

// Path to the "Library"
const VECTOR_STORE_PATH = path.join(__dirname, "../../vector_store");

async function runBreastfeedingAgent(state, model) {
  const start = Date.now();
  const txnId = state.transactionId || "RAG_AGENT";
  const lastMessage = state.messages[state.messages.length - 1].content;
  
  console.log(`🤱 [${txnId}] RAG AGENT: Researching -> "${lastMessage}"`);

  // 1. Setup Embeddings
  let embeddings;
  if (process.env.LLM_MODE === "LOCAL") {
    embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text", 
      baseUrl: "http://localhost:11434",
    });
  } else {
    embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001",
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  try {
    // 2. Load the Vector Store
    const vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);

    // 3. Retrieve (Search for top 4 paragraphs to get more context)
    const retriever = vectorStore.asRetriever(4);
    const docs = await retriever.invoke(lastMessage);
    
    // Combine text
    const context = docs.map(d => d.pageContent).join("\n\n---\n\n");

    // 🕵️‍♂️ DEBUG: Print the first 150 chars of what it found.
    // If this prints nonsense, we know your database is empty/broken.
    if (docs.length > 0) {
        console.log(`📄 Found ${docs.length} docs. Top match: "${docs[0].pageContent.substring(0, 150)}..."`);
    } else {
        console.log("📄 ZERO documents found.");
    }

    // 4. Generate Answer (The "Smarter" Prompt)
    const prompt = `
      You are a specialized Breastfeeding Consultant.
      
      USER QUESTION: "${lastMessage}"
      
      RETRIEVED GUIDELINES (WHO/CDC):
      ${context}
      
      INSTRUCTIONS:
      1. Answer the question using the guidelines above.
      2. INTELLIGENT INFERENCE: If the text mentions "respiratory viruses", "infectious diseases", or "transmission risks", apply that logic to specific viruses like "Covid" or "Flu".
      3. If the text says mothers should continue breastfeeding with precautions (masks/hand washing), say that clearly.
      4. Only say "I don't know" if the text is completely unrelated (e.g., about food storage).
      
      Answer in a warm, helpful tone.
    `;

    const response = await model.invoke([new HumanMessage(prompt)]);

    logTransaction(txnId, "RAG_AGENT", "u1@gmail.com", { query: lastMessage }, { response: response.content }, start);
    
    return { messages: [response], mode: "locked" };

  } catch (error) {
    console.error("❌ RAG Error:", error);
    return { messages: [new SystemMessage("I am having trouble accessing the guidelines right now.")] };
  }
}

module.exports = { runBreastfeedingAgent };