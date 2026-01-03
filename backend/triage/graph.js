const { StateGraph, END } = require("@langchain/langgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const dotenv = require("dotenv");

dotenv.config();

// 1. Initialize Gemini Model
// Note: We use "gemini-1.5-flash" as it is standard and fast.
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY, // Matches your .env variable
});

// 2. Define the State
// FIX: "default" must be a function (factory), not a static value.
const graphState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => [], 
  },
  symptom: { 
    value: (x, y) => y ?? x, 
    default: () => null 
  },
  severity: { 
    value: (x, y) => y ?? x, 
    default: () => null 
  },
  duration: { 
    value: (x, y) => y ?? x, 
    default: () => null 
  },
  location: { 
    value: (x, y) => y ?? x, 
    default: () => null 
  },
  next_step: { 
    value: (x, y) => y ?? x, 
    default: () => "ask" 
  },
};

// --- NODE A: The Screener (Extract Data) ---
// async function extractData(state) {
//   // Guard clause: If messages array is empty, handle gracefully
//   const messages = state.messages || [];
//   if (messages.length === 0) return {};

//   const lastMessage = messages[messages.length - 1].content;
  
//   const currentData = {
//     symptom: state.symptom,
//     severity: state.severity,
//     duration: state.duration,
//     location: state.location,
//   };

//   const extractionPrompt = `
//     You are a medical data extractor. 
//     Analyze the user's latest message: "${lastMessage}"
    
//     Current Known Data: ${JSON.stringify(currentData)}
    
//     Task:
//     1. Extract any NEW medical info (Symptom, Severity, Duration, Location) from the message.
//     2. If the user provided new info, update it. If not, keep the old value (null).
//     3. Return ONLY a JSON object. Do not say anything else.
    
//     Example Output:
//     { "symptom": "Headache", "severity": "8/10", "duration": null, "location": "Temples" }
//   `;

//   try {
//     const result = await model.invoke([new HumanMessage(extractionPrompt)]);
//     const cleanJson = result.content.replace(/```json|```/g, "").trim();
//     const extracted = JSON.parse(cleanJson);
//     console.log("📋 Clipboard Updated:", extracted);
//     return extracted;
//   } catch (e) {
//     console.error("Failed to parse extractor JSON", e);
//     return {}; 
//   }
// }
// --- NODE A: The Screener (Extract Data) ---
async function extractData(state) {
  const messages = state.messages || [];
  if (messages.length === 0) return {};

  const lastMessage = messages[messages.length - 1].content;
  console.log("🧐 Analyzing User Input:", lastMessage); // Debug Log

  const currentData = {
    symptom: state.symptom,
    severity: state.severity,
    duration: state.duration,
    location: state.location,
  };

  const extractionPrompt = `
    You are a medical data extractor. 
    Analyze the user's latest message: "${lastMessage}"
    
    Current Known Data: ${JSON.stringify(currentData)}
    
    Task:
    1. Extract any NEW medical info (Symptom, Severity, Duration, Location).
    2. If the user provided new info, update it. If not, keep the old value (null).
    3. Return ONLY a JSON object.
    
    Example Output:
    { "symptom": "Headache", "severity": "8/10", "duration": null, "location": "Temples" }
  `;

  try {
    const result = await model.invoke([new HumanMessage(extractionPrompt)]);
    const text = result.content;

    // 🛡️ ROBUST PARSING LOGIC 🛡️
    // Find the first '{' and the last '}' to ignore any extra text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = text.substring(jsonStart, jsonEnd + 1);
      const extracted = JSON.parse(jsonStr);
      console.log("📋 Clipboard Updated:", extracted);
      return extracted;
    } else {
      console.warn("⚠️ No JSON found in response:", text);
      return {}; 
    }

  } catch (e) {
    console.error("❌ Failed to parse extractor JSON:", e);
    return {}; 
  }
}
// --- LOGIC: The Traffic Cop ---
function routeStep(state) {
  const { symptom, severity, duration, location } = state;
  if (!symptom) return "ask_symptom";
  if (!location) return "ask_location";
  if (!severity) return "ask_severity";
  if (!duration) return "ask_duration";
  return "generate_diagnosis";
}

// --- Question Nodes ---
async function askSymptom(state) {
  return { messages: [new SystemMessage("I'm here to help. Could you tell me what main symptom you are experiencing?")] };
}
async function askLocation(state) {
  return { messages: [new SystemMessage(`Where exactly is the ${state.symptom} located?`)] };
}
async function askSeverity(state) {
  return { messages: [new SystemMessage("On a scale of 1 to 10, how severe is the pain/discomfort?")] };
}
async function askDuration(state) {
  return { messages: [new SystemMessage("How long have you been feeling this way?")] };
}

// --- NODE C: The Doctor (Final Output) ---
async function finalDiagnosis(state) {
  const diagnosisPrompt = `
    SAFE MODE ACTIVE.
    User Report:
    - Symptom: ${state.symptom}
    - Location: ${state.location}
    - Severity: ${state.severity}
    - Duration: ${state.duration}

    Task:
    1. Summarize the condition.
    2. Suggest general wellness advice (rest, hydration).
    3. Recommend the correct TYPE of specialist doctor (e.g., Neurologist, Cardiologist).
    4. DO NOT provide a specific medical diagnosis or prescription.
  `;
  
  const response = await model.invoke([new HumanMessage(diagnosisPrompt)]);
  return { messages: [response], next_step: "done" };
}

// 3. BUILD THE GRAPH
const workflow = new StateGraph({ channels: graphState })
  .addNode("extractor", extractData)
  .addNode("ask_symptom", askSymptom)
  .addNode("ask_location", askLocation)
  .addNode("ask_severity", askSeverity)
  .addNode("ask_duration", askDuration)
  .addNode("generate_diagnosis", finalDiagnosis)
  .setEntryPoint("extractor")
  .addConditionalEdges("extractor", routeStep, {
    ask_symptom: "ask_symptom",
    ask_location: "ask_location",
    ask_severity: "ask_severity",
    ask_duration: "ask_duration",
    generate_diagnosis: "generate_diagnosis",
  })
  .addEdge("ask_symptom", END)
  .addEdge("ask_location", END)
  .addEdge("ask_severity", END)
  .addEdge("ask_duration", END)
  .addEdge("generate_diagnosis", END);

const triageGraph = workflow.compile();

module.exports = { triageGraph };