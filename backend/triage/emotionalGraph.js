const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// --- NODE: EMOTIONAL ANALYZER ---
async function emotionalSupport(state, model) {
  const lastMsg = state.messages[state.messages.length - 1].content;
  
  const prompt = `
    You are a compassionate women's health counselor.
    User Input: "${lastMsg}"
    Context: The user is distressed, grieving, or asking about hormonal mental health.
    
    TASK:
    1. VALIDATE: Start by acknowledging their pain/worry warmly.
    2. SCREEN: If they seem hopeless or suicidal, give a suicide helpline immediately.
    3. EDUCATE: Explain the link between hormones and this feeling (e.g., postpartum drop, perimenopause).
    4. GUIDE: Suggest a "Symptom Log" or talking to a specialist.
    
    Do NOT ask for severity 1-10. Be a listener.
  `;

  const res = await model.invoke([new HumanMessage(prompt)]);
  return { messages: [res], diagnosis_given: true }; // End conversation after support
}

module.exports = { emotionalSupport };