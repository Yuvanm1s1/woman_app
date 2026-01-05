const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { findDoctors } = require("./searchTools");

// --- NODE: MEDICAL EXTRACTOR ---
async function medicalExtractor(state, model) {
  const messages = state.messages;
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  
  const prompt = `
    Analyze medical inputs. Update JSON.
    Input: "${lastMsg}"
    Current: ${JSON.stringify(state)}
    RULES: Update 'symptom', 'severity', 'duration', 'location' ONLY if explicitly mentioned.
    Return ONLY valid JSON.
  `;

  try {
    const res = await model.invoke([new HumanMessage(prompt)]);
    const clean = res.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1));
    
    // Sanitize
    const s = (v) => (v && !v.toLowerCase().includes("unknown") ? v : null);
    
    return {
      symptom: s(parsed.symptom) || state.symptom,
      severity: s(parsed.severity) || state.severity,
      duration: s(parsed.duration) || state.duration,
      location: s(parsed.location) || state.location
    };
  } catch (e) { return {}; }
}

// --- NODE: DOCTOR DIAGNOSIS ---
async function medicalDiagnosis(state, model) {
  const prompt = `
    Patient: ${state.symptom} (${state.location}, ${state.severity}, ${state.duration}).
    1. Explain condition.
    2. Give 3 remedies.
    3. END with "SPECIALIST: <Type>"
  `;
  
  let text = "Please see a doctor.";
  let spec = "General Physician";

  try {
    const res = await model.invoke([new HumanMessage(prompt)]);
    text = res.content;
    const match = text.match(/SPECIALIST:\s*(.*)/i);
    if (match && match[1]) spec = match[1].trim();
  } catch (e) {}

  const places = await findDoctors(spec, "Chennai");
  const finalMsg = `${text.replace(/SPECIALIST:.*$/i, "")}\n\n📍 **Nearby:**\n${places}`;
  
  return { messages: [new SystemMessage(finalMsg)], diagnosis_given: true };
}

// --- MEDICAL ROUTER ---
function medicalRoute(state) {
  if (!state.symptom) return "ask_symptom";
  if (!state.location) return "ask_location";
  if (!state.severity) return "ask_severity";
  if (!state.duration) return "ask_duration";
  return "diagnosis";
}

module.exports = { medicalExtractor, medicalDiagnosis, medicalRoute };