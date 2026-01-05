const { HumanMessage } = require("@langchain/core/messages");

async function contextAnswer(state, model) {
  const lastMsg = state.messages[state.messages.length - 1].content;
  
  const prompt = `
    CONTEXT: User has a history of: ${state.symptom || "emotional distress"}.
    Diagnosis/Advice given previously: Yes.
    
    USER FOLLOW-UP: "${lastMsg}"
    
    TASK: Answer the question directly based on their previous context. Keep it conversational.
  `;

  const res = await model.invoke([new HumanMessage(prompt)]);
  return { messages: [res] };
}

module.exports = { contextAnswer };