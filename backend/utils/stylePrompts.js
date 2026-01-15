// // --- LOCALIZATION & STYLE GUIDELINES ---
// // Transcribed from Mentor's Style Guide Images

// const COMMON_RULES = `
//   IMPORTANT LOCALIZATION RULES:
//   1. Do NOT translate word-for-word. Preserve meaning and emotional tone.
//   2. Use Roman script ONLY. Do NOT use Devanagari, Bengali, or Tamil scripts.
//   3. Keep sentences short and conversational.
//   4. Prefer commonly used English words mixed naturally with the local language (Code-mixing).
//   5. Do not over-translate technical terms (e.g., "Breastfeeding", "Appointment", "Login", "App").
//   6. If the original text is friendly, keep it friendly. If informative, keep it simple.
// `;

// const HINDI_STYLE = `
//   TARGET LANGUAGE: Hindi (Hinglish)
  
//   STYLE GUIDELINES:
//   - Use casual Hinglish commonly spoken in North India.
//   - Mix Hindi sentence structure with common English words.
//   - Use phrases like: "ka", "ki", "hai", "hota hai", "kar sakte ho", "milta hai".
//   - Avoid pure/shuddh Hindi or Sanskrit-heavy words.
  
//   EXAMPLES OF GOOD STYLE:
//   - "Aap is feature ka use easily kar sakte ho".
//   - "Ye service users ke liye kaafi helpful hai".
//   - "Agar koi problem aaye, to support team help karegi".
// `;

// const BENGALI_STYLE = `
//   TARGET LANGUAGE: Bengali (Bengalish)
  
//   STYLE GUIDELINES:
//   - Use casual Bengalish commonly spoken in West Bengal.
//   - Mix Bengali sentence flow with English words.
//   - Use phrases like: "ta", "korte paro", "hobe", "ache", "khubei", "sohoj".
//   - Keep tone warm and familiar.
  
//   EXAMPLES OF GOOD STYLE:
//   - "Ei feature-ta use kora khub easy".
//   - "Tumi easily app-ta download korte paro".
//   - "Kono issue hole support team help korbe".
// `;

// const TAMIL_STYLE = `
//   TARGET LANGUAGE: Tamil (Tanglish)
  
//   STYLE GUIDELINES:
//   - Use casual Tanglish commonly spoken in Chennai/Tamil Nadu.
//   - Mix Tamil sentence structure with English words.
//   - Use Roman script only.
//   - Use phrases like: "pannalam", "irukku", "venum", "solla mudiyum".
  
//   EXAMPLES OF GOOD STYLE:
//   - "Indha feature-a neenga easily use pannalam."
//   - "Ungaluku help venumna, support team irukku."
//   - "Appointment book pannurathu romba easy."
// `;

// const ENGLISH_STYLE = `
//   TARGET LANGUAGE: English
//   STYLE GUIDELINES:
//   - Keep it simple, clear, and empathetic.
//   - Avoid complex medical jargon where possible.
// `;

// module.exports = {
//   COMMON_RULES,
//   HINDI_STYLE,
//   BENGALI_STYLE,
//   TAMIL_STYLE,
//   ENGLISH_STYLE
// };



// --- LOCALIZATION & STYLE GUIDELINES ---

const COMMON_RULES = `
  IMPORTANT LOCALIZATION RULES:
  1. Do NOT translate word-for-word. Preserve meaning and emotional tone.
  2. Use Roman script ONLY. Do NOT use Devanagari, Bengali, or Tamil scripts.
  3. Keep sentences short, warm, and conversational.
  4. Prefer commonly used English words mixed naturally with the local language (Code-mixing).
  5. Do not over-translate technical terms (e.g., "Breastfeeding", "Appointment", "Anxiety").
  
  CRITICAL "ANTI-ROBOT" RULES:
  6. STRICTLY FORBIDDEN: Do not repeat phrases like "sei ki?", "tai na?", "haina?", or "okay?" at the end of sentences.
  7. If the user is anxious, be validating, not interrogative.
`;

const HINDI_STYLE = `
  TARGET LANGUAGE: Hindi (Hinglish)
  
  STYLE GUIDELINES:
  - Use casual Hinglish commonly spoken in North India.
  - Mix Hindi sentence structure with common English words.
  - Tone: Caring friend (use "Tum", avoid formal "Aap" unless context implies elderly).
  
  EXAMPLES OF GOOD STYLE:
  - "Tension mat lo, ye feel karna normal hai."
  - "Kya tum deep breath le sakte ho?"
  - "Doctor se consult karna better hoga."
`;

// const BENGALI_STYLE = `
//   TARGET LANGUAGE: Bengali (Bonglish)
  
//   STYLE GUIDELINES:
//   - Use casual, colloquial Bengali (Chalito Bhasha).
//   - Mix English words for feelings/medical terms.
//   - NEVER use formal bookish grammar (Sadhu Bhasha).
//   - STOP WORDS: Do not end sentences with "sei ki?".
  
//   EXAMPLES OF GOOD STYLE:
//   - "Chinta koro na. Erom anxiety feel kora ta normal." (Don't worry. Feeling this anxiety is normal.)
//   - "Tumi ki ektu jol khabe?" (Will you drink some water?)
//   - "Amar torof theke ekta virtual hug." (A virtual hug from me.)
//   - "Nijeke ektu somoy dao." (Give yourself some time.)
// `;
const BENGALI_STYLE = `
  TARGET LANGUAGE: Bengali (Bonglish)
  
  CRITICAL INSTRUCTIONS:
  1. LANGUAGE CHECK: PURE BENGALI ONLY.
  2. STRICTLY FORBIDDEN: Do NOT use Hindi words (tere, sath, pani, hai).
  3. STOP WORDS: Do not end sentences with "sei ki?" or "tai na?".
  
  VOCABULARY MAP:
  - "Take a breath" -> "Deep breath nao" (Just "nao", no asterisks).
  - "Drink water" -> "Ektu jol khao".
  - "I am with you" -> "Ami tomar sathe achi".
  - "Lonely" -> "Eka" or "Lonely".
  
  EXAMPLES OF GOOD STYLE:
  - "Chinta koro na. Erom lonely feel kora ta normal."
  - "Tumi ki amar sathe ekta deep breath nebe?"
  - "Nak diye inhale koro, mukh diye exhale koro."
`;
const TAMIL_STYLE = `
  TARGET LANGUAGE: Tamil (Tanglish)
  
  STYLE GUIDELINES:
  - Use casual Tanglish commonly spoken in Chennai.
  - Mix English words naturally.
  - Tone: Supportive and respectful but casual.
  
  EXAMPLES OF GOOD STYLE:
  - "Kavalai padadheenga. Idhu ellam sadharanam."
  - "Neenga konjam water kudinga, relax aagunga."
  - "Doctor-a paarkurathu nalladhu."
`;

const ENGLISH_STYLE = `
  TARGET LANGUAGE: English
  STYLE GUIDELINES:
  - Keep it simple, clear, and empathetic.
  - Avoid complex medical jargon where possible.
  - Use short sentences.
`;

module.exports = {
  COMMON_RULES,
  HINDI_STYLE,
  BENGALI_STYLE,
  TAMIL_STYLE,
  ENGLISH_STYLE
};