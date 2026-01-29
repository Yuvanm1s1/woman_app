
const { HumanMessage } = require("@langchain/core/messages");
const { COMMON_RULES, HINDI_STYLE, BENGALI_STYLE, TAMIL_STYLE, ENGLISH_STYLE } = require("../../utils/stylePrompts");

// --- 1. INPUT TRANSLATOR ---
async function translateInput(state, model) {
  const lastMessage = state.messages[state.messages.length - 1].content;
  console.log(`🌐 TRANSLATOR (Input): Analyzing -> "${lastMessage}"`);

  // 🛑 KEY CHANGE: The Prompt now includes ENGLISH examples
  const prompt = `
    You are a Medical Translation Bot (v3).
    
    INPUT TEXT: "${lastMessage}"
    
    TASK:
    1. Detect language.
    2. If NOT English, translate to English.
    3. If English, RETURN EXACTLY AS IS.

    TRAINING EXAMPLES (Learn from these):
    
    -- Case 1: Foreign Inputs (Translate these) --
    Input: "Pet mein dard hai" -> Output: { "detected_language": "hindi", "english_text": "I have stomach pain" }
    Input: "Khub anxious lagche" -> Output: { "detected_language": "bengali", "english_text": "I feel very anxious" }
    
    -- Case 2: English Inputs (DO NOT TOUCH) --
    Input: "I have a headache" -> Output: { "detected_language": "english", "english_text": "I have a headache" }
    Input: "Leg pain" -> Output: { "detected_language": "english", "english_text": "Leg pain" }
    Input: "I feel sad" -> Output: { "detected_language": "english", "english_text": "I feel sad" }
    
    CURRENT INPUT: "${lastMessage}"

    OUTPUT JSON ONLY:
    { "detected_language": "...", "english_text": "..." }
  `;

  try {
    const response = await model.invoke([new HumanMessage(prompt)]);
    const cleanJson = response.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    console.log(`✅ Detected: ${parsed.detected_language} | English: "${parsed.english_text}"`);
    
    return { 
      translated_text: parsed.english_text, 
      user_language: parsed.detected_language.toLowerCase() 
    };

  } catch (e) {
    console.error("Translation Error:", e);
    return { translated_text: lastMessage, user_language: "english" };
  }
}

// --- 2. OUTPUT TRANSLATOR (Keep as is) ---
async function translateOutput(state, model) {
  const lastBotMessage = state.messages[state.messages.length - 1].content;
  const targetLang = state.user_language || "english";

  if (targetLang.includes("english")) return { output_text: lastBotMessage };

  console.log(`🎨 TRANSLATOR (Output): Converting to ${targetLang}...`);
  
  let stylePrompt = ENGLISH_STYLE;
  if (targetLang.includes("hindi")) stylePrompt = HINDI_STYLE;
  else if (targetLang.includes("bengali")) stylePrompt = BENGALI_STYLE;
  else if (targetLang.includes("tamil")) stylePrompt = TAMIL_STYLE;

  const prompt = `
    ${COMMON_RULES}
    ${stylePrompt}
    ORIGINAL TEXT: "${lastBotMessage}"
    TASK: Rewrite the text above in the TARGET LANGUAGE style.
    
    ⛔ STRICT CONSTRAINTS:
    1. OUTPUT ONLY THE TRANSLATED TEXT.
    2. DO NOT say "Here is the translation".
    3. DO NOT explain your thought process.
    4. DO NOT use bullet points explaining what you did.
    5. JUST RETURN THE FINAL STRING.
  `;

  try {
    const response = await model.invoke([new HumanMessage(prompt)]);
    return { output_text: response.content };
  } catch (e) {
    return { output_text: lastBotMessage };
  }
}

module.exports = { translateInput, translateOutput };