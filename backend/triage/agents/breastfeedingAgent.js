const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const path = require("path");
const { logTransaction } = require("../../utils/logger"); 

// Path to the "Library" you just built
const VECTOR_STORE_PATH = path.join(__dirname, "../../vector_store");

async function runBreastfeedingAgent(state, model) {
  const start = Date.now();
  // Use the ID passed from the graph, or generate a temp one
  const txnId = state.transactionId || "RAG_AGENT";
  const lastMessage = state.messages[state.messages.length - 1].content;
  
  console.log(`🤱 [${txnId}] RAG AGENT: Researching -> "${lastMessage}"`);

  // 1. Setup Embeddings (MUST match what you used in buildRAG.js)
  let embeddings;
  if (process.env.LLM_MODE === "LOCAL") {
    embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text", // ✅ Using the fast model you just pulled
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

    // 3. Retrieve (Search for top 3 paragraphs)
    const retriever = vectorStore.asRetriever(3);
    const docs = await retriever.invoke(lastMessage);
    
    // Combine the paragraphs into one big text block
    const context = docs.map(d => d.pageContent).join("\n\n");

    console.log(`📄 Found ${docs.length} relevant paragraphs.`);

    // 4. Generate Answer (The "Strict" Prompt)
    const prompt = `
      You are a Breastfeeding Specialist Assistant.
      
      INSTRUCTIONS:
      1. Answer the user's question using ONLY the context below.
      2. If the answer is not in the context, say "I cannot find specific information on that in the WHO guidelines."
      3. Do NOT use outside knowledge.
      4. Cite the source context if possible.

      CONTEXT from WHO Guidelines:
      ${context}

      USER QUESTION:
      "${lastMessage}"
    `;

    // We use the main model (Llama3 or Gemini) to write the final answer
    const response = await model.invoke([new HumanMessage(prompt)]);

    // 5. Log & Return
    logTransaction(txnId, "RAG_AGENT", "u1@gmail.com", { query: lastMessage }, { response: response.content }, start);
    
    return { messages: [response], mode: "locked" };

  } catch (error) {
    console.error("❌ RAG Error:", error);
    return { messages: [new SystemMessage("I am having trouble accessing the WHO guidelines right now.")] };
  }
}

module.exports = { runBreastfeedingAgent };