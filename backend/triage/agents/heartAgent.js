const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { logTransaction } = require("../../utils/logger"); 

// Import the NEW Hybrid Engine (Only looks at Heart Data)
const { hybridSearch } = require("../../utils/heartRetriever");

async function runHeartAgent(state, model) {
  const start = Date.now();
  const txnId = state.transactionId || "HEART_AGENT";
  const lastMessage = state.messages[state.messages.length - 1].content;
  
  console.log(`🫀 [${txnId}] HEART AGENT: Analyzing -> "${lastMessage}"`);

  try {
    // 1. Hybrid Search (Vector + Keyword)
    const docs = await hybridSearch(lastMessage);
    
    if (!docs || docs.length === 0) {
        return { messages: [new SystemMessage("I couldn't find specific heart guidelines for this.")] };
    }

    // 2. Format Context
    const context = docs.map(d => 
        `[Source: ${d.metadata.source}]\n${d.pageContent}`
    ).join("\n\n---\n\n");

    console.log(`📄 Found ${docs.length} hybrid results.`);

    // 3. Specialized Heart Prompt
    const prompt = `
      You are a Medical Specialist for High-Risk Pregnancy and Cardiology.
      
      USER QUESTION: "${lastMessage}"
      
      RETRIEVED GUIDELINES:
      ${context}
      
      INSTRUCTIONS:
      1. ANALYZE STRICTLY: Check for Drug Names (Acitrom, Meftal) or Conditions.
      2. SAFETY CHECK: Look for "Contraindications" or "Teratogenic" warnings.
      3. BE PRECISE: Quote the specific risk.
      4. TONE: Professional, Empathetic, but firm on safety.
      5. FORMAT: Keep it under 4 sentences.
    `;

    const response = await model.invoke([new HumanMessage(prompt)]);

    logTransaction(txnId, "HEART_RESPONSE", "u1@gmail.com", { prompt: lastMessage }, { response: response.content }, start);
    
    return { messages: [response], mode: "locked" };

  } catch (error) {
    console.error("❌ Heart Agent Error:", error);
    return { messages: [new SystemMessage("System Error: Could not access heart guidelines.")] };
  }
}

module.exports = { runHeartAgent };