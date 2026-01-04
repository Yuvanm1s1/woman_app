// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. Initialize Gemini Model
// // Note: We use "gemini-1.5-flash" as it is standard and fast.
// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-2.5-flash-lite",
//   temperature: 0,
//   apiKey: process.env.GEMINI_API_KEY, // Matches your .env variable
// });

// // 2. Define the State
// // FIX: "default" must be a function (factory), not a static value.
// const graphState = {
//   messages: {
//     value: (x, y) => x.concat(y),
//     default: () => [], 
//   },
//   symptom: { 
//     value: (x, y) => y ?? x, 
//     default: () => null 
//   },
//   severity: { 
//     value: (x, y) => y ?? x, 
//     default: () => null 
//   },
//   duration: { 
//     value: (x, y) => y ?? x, 
//     default: () => null 
//   },
//   location: { 
//     value: (x, y) => y ?? x, 
//     default: () => null 
//   },
//   next_step: { 
//     value: (x, y) => y ?? x, 
//     default: () => "ask" 
//   },
// };

// // --- NODE A: The Screener (Extract Data) ---
// async function extractData(state) {
//   const messages = state.messages || [];
//   if (messages.length === 0) return {};

//   const lastMessage = messages[messages.length - 1].content;
//   console.log("🧐 Analyzing User Input:", lastMessage); // Debug Log

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
//     1. Extract any NEW medical info (Symptom, Severity, Duration, Location).
//     2. If the user provided new info, update it. If not, keep the old value (null).
//     3. Return ONLY a JSON object.
    
//     Example Output:
//     { "symptom": "Headache", "severity": "8/10", "duration": null, "location": "Temples" }
//   `;

//   try {
//     const result = await model.invoke([new HumanMessage(extractionPrompt)]);
//     const text = result.content;

//     // 🛡️ ROBUST PARSING LOGIC 🛡️
//     // Find the first '{' and the last '}' to ignore any extra text
//     const jsonStart = text.indexOf('{');
//     const jsonEnd = text.lastIndexOf('}');
    
//     if (jsonStart !== -1 && jsonEnd !== -1) {
//       const jsonStr = text.substring(jsonStart, jsonEnd + 1);
//       const extracted = JSON.parse(jsonStr);
//       console.log("📋 Clipboard Updated:", extracted);
//       return extracted;
//     } else {
//       console.warn("⚠️ No JSON found in response:", text);
//       return {}; 
//     }

//   } catch (e) {
//     console.error("❌ Failed to parse extractor JSON:", e);
//     return {}; 
//   }
// }
// // --- LOGIC: The Traffic Cop ---
// function routeStep(state) {
//   const { symptom, severity, duration, location } = state;
//   if (!symptom) return "ask_symptom";
//   if (!location) return "ask_location";
//   if (!severity) return "ask_severity";
//   if (!duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// // --- Question Nodes ---
// async function askSymptom(state) {
//   return { messages: [new SystemMessage("I'm here to help. Could you tell me what main symptom you are experiencing?")] };
// }
// async function askLocation(state) {
//   return { messages: [new SystemMessage(`Where exactly is the ${state.symptom} located?`)] };
// }
// async function askSeverity(state) {
//   return { messages: [new SystemMessage("On a scale of 1 to 10, how severe is the pain/discomfort?")] };
// }
// async function askDuration(state) {
//   return { messages: [new SystemMessage("How long have you been feeling this way?")] };
// }

// // --- NODE C: The Doctor (Final Output) ---
// async function finalDiagnosis(state) {
//   const diagnosisPrompt = `
//     SAFE MODE ACTIVE.
//     User Report:
//     - Symptom: ${state.symptom}
//     - Location: ${state.location}
//     - Severity: ${state.severity}
//     - Duration: ${state.duration}

//     Task:
//     1. Summarize the condition.
//     2. Suggest general wellness advice (rest, hydration).
//     3. Recommend the correct TYPE of specialist doctor (e.g., Neurologist, Cardiologist).
//     4. DO NOT provide a specific medical diagnosis or prescription.
//   `;
  
//   const response = await model.invoke([new HumanMessage(diagnosisPrompt)]);
//   return { messages: [response], next_step: "done" };
// }

// // 3. BUILD THE GRAPH
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("extractor", extractData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("generate_diagnosis", finalDiagnosis)
//   .setEntryPoint("extractor")
//   .addConditionalEdges("extractor", routeStep, {
//     ask_symptom: "ask_symptom",
//     ask_location: "ask_location",
//     ask_severity: "ask_severity",
//     ask_duration: "ask_duration",
//     generate_diagnosis: "generate_diagnosis",
//   })
//   .addEdge("ask_symptom", END)
//   .addEdge("ask_location", END)
//   .addEdge("ask_severity", END)
//   .addEdge("ask_duration", END)
//   .addEdge("generate_diagnosis", END);

// const triageGraph = workflow.compile();

// module.exports = { triageGraph };




















// // backend/triage/graph.js
// const { findDoctors } = require("./searchTools"); 
// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. CONFIGURE MODEL
// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-pro", 
//   temperature: 0,
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // 2. DEFINE STATE
// const graphState = {
//   messages: { value: (x, y) => x.concat(y), default: () => [] },
//   symptom: { value: (x, y) => y ?? x, default: () => null },
//   severity: { value: (x, y) => y ?? x, default: () => null },
//   duration: { value: (x, y) => y ?? x, default: () => null },
//   location: { value: (x, y) => y ?? x, default: () => null },
//   next_step: { value: (x, y) => y ?? x, default: () => "ask" },
// };
// // --- NODE A: EXTRACTOR (WITH MEMORY PROTECTION) ---
// async function extractData(state) {
//   const messages = state.messages || [];
//   if (messages.length === 0) return {};
//   const lastMessage = messages[messages.length - 1].content;
  
//   console.log("🗣️ User Said:", lastMessage);

//   // 1. Get Current State (The "Memory")
//   const currentSymptom = state.symptom;
//   const currentSeverity = state.severity;
//   const currentDuration = state.duration;
//   const currentLocation = state.location;

//   const extractionPrompt = `
//     You are a medical data extractor.
//     Analyze the user's latest message: "${lastMessage}"
    
//     Current Known Data: ${JSON.stringify({
//       symptom: currentSymptom, severity: currentSeverity, duration: currentDuration, location: currentLocation
//     })}
    
//     Task:
//     1. Extract NEW info from the message.
//     2. If the user mentions a specific symptom, update 'symptom'.
//     3. Return ONLY JSON.
//   `;

//   try {
//     const result = await model.invoke([new HumanMessage(extractionPrompt)]);
//     console.log("🤖 RAW AI RESPONSE:", result.content); 

//     let cleanText = result.content.replace(/```json/g, "").replace(/```/g, "").trim();
//     const jsonStart = cleanText.indexOf('{');
//     const jsonEnd = cleanText.lastIndexOf('}');
    
//     if (jsonStart !== -1 && jsonEnd !== -1) {
//       const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
//       const extracted = JSON.parse(jsonStr);
      
//       console.log("📦 AI Extracted:", extracted);

//       // 🛡️ MEMORY PROTECTION LOGIC 🛡️
//       // Only overwrite if the new value is NOT null.
//       // If AI returns null, we keep the OLD value (y ?? x logic in state definition handles this, 
//       // but let's be explicit here to be safe).
      
//       return {
//         symptom: extracted.symptom || currentSymptom,     // If new is null, keep old
//         severity: extracted.severity || currentSeverity,
//         duration: extracted.duration || currentDuration,
//         location: extracted.location || currentLocation
//       };
      
//     } else {
//       return {};
//     }
//   } catch (e) { 
//     console.error("❌ JSON Parse Error:", e);
//     return {}; 
//   }
// }
// // --- LOGIC ---
// function routeStep(state) {
//   if (!state.symptom) return "ask_symptom";
//   if (!state.location) return "ask_location";
//   if (!state.severity) return "ask_severity";
//   if (!state.duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// // --- QUESTIONS ---
// async function askSymptom() { return { messages: [new SystemMessage("What is your main symptom?")] }; }
// async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
// async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
// async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// // --- NODE C: THE DOCTOR ---
// async function finalDiagnosis(state) {
//   console.log("🔥 FINAL DIAGNOSIS RUNNING...");

//   const prompt = `
//     SAFE MODE. User Report: Symptom: ${state.symptom}, Location: ${state.location}, Severity: ${state.severity}, Duration: ${state.duration}.
//     1. Summarize condition.
//     2. Give advice.
//     3. END with exactly: "SPECIALIST_TYPE: <Type>"
//   `;
  
//   const response = await model.invoke([new HumanMessage(prompt)]);
//   const text = response.content;

//   // Extract Specialist
//   let specialist = "General Physician";
//   const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
//   if (match && match[1]) specialist = match[1].trim();
//   const cleanText = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();

//   // Search
//   console.log(`🔎 Searching for: ${specialist}`);
//   let places = "";
//   try {
//     places = await findDoctors(specialist, "Chennai");
//   } catch (e) {
//     places = "Could not load map data.";
//   }

//   const finalMsg = `${cleanText}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`;
//   return { messages: [new SystemMessage(finalMsg)], next_step: "done" };
// }

// // --- BUILD GRAPH ---
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("extractor", extractData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("generate_diagnosis", finalDiagnosis)
//   .setEntryPoint("extractor")
//   .addConditionalEdges("extractor", routeStep, {
//     ask_symptom: "ask_symptom",
//     ask_location: "ask_location",
//     ask_severity: "ask_severity",
//     ask_duration: "ask_duration",
//     generate_diagnosis: "generate_diagnosis",
//   })
//   .addEdge("ask_symptom", END)
//   .addEdge("ask_location", END)
//   .addEdge("ask_severity", END)
//   .addEdge("ask_duration", END)
//   .addEdge("generate_diagnosis", END);

// const triageGraph = workflow.compile();
// module.exports = { triageGraph };



const { findDoctors } = require("./searchTools"); 
const { StateGraph, END } = require("@langchain/langgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama"); // <--- NEW IMPORT
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const dotenv = require("dotenv");

dotenv.config();

// 1. DYNAMIC MODEL SWITCHER
let model;

if (process.env.LLM_MODE === "LOCAL") {
  console.log("💻 MODE: Local CPU (Ollama/Phi-3)");
  model = new ChatOllama({
    model: "phi3", 
    temperature: 0, 
    baseUrl: "http://localhost:11434", // Default Ollama port
  });
} else {
  console.log("🌐 MODE: Production (Gemini)");
  // Default to universal stable model if not local
  model = new ChatGoogleGenerativeAI({
    model: "gemini-pro", 
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
  });
}

// 2. DEFINE STATE
const graphState = {
  messages: { value: (x, y) => x.concat(y), default: () => [] },
  symptom: { value: (x, y) => y ?? x, default: () => null },
  severity: { value: (x, y) => y ?? x, default: () => null },
  duration: { value: (x, y) => y ?? x, default: () => null },
  location: { value: (x, y) => y ?? x, default: () => null },
  next_step: { value: (x, y) => y ?? x, default: () => "ask" },
};

// --- NODE A: EXTRACTOR (PHI-3 OPTIMIZED) ---
// async function extractData(state) {
//   const messages = state.messages || [];
//   if (messages.length === 0) return {};
//   const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
//   console.log("🗣️ User Said:", lastMessage);

//   // 1. HARD RESET
//   if (lastMessage.includes("reset") || lastMessage.includes("new chat")) {
//     console.log("🧹 RESET TRIGGERED.");
//     return { symptom: null, severity: null, duration: null, location: null };
//   }

//   // 2. Get Memory
//   const currentSymptom = state.symptom;
//   const currentSeverity = state.severity;
//   const currentDuration = state.duration;
//   const currentLocation = state.location;

//   // 3. Strict Prompt for Small Models
//   const extractionPrompt = `
//     You are a data extraction machine. 
//     Analyze the Input. Update the JSON State.
    
//     Input: "${lastMessage}"
//     Current JSON: ${JSON.stringify({
//       symptom: currentSymptom, severity: currentSeverity, duration: currentDuration, location: currentLocation
//     })}
    
//     RULES:
//     1. If the user mentions a symptom (e.g., "headache", "pain"), update "symptom".
//     2. If the user gives a location, severity, or duration, update those fields.
//     3. Return ONLY valid JSON. Do not write sentences.
    
//     Example Output:
//     {"symptom": "headache", "severity": "mild", "duration": "2 days", "location": null}
//   `;

//   try {
//     const result = await model.invoke([new HumanMessage(extractionPrompt)]);
//     const cleanText = result.content.replace(/```json|```/g, "").trim();
    
//     // Phi-3 sometimes adds extra text, find the JSON brackets
//     const jsonStart = cleanText.indexOf('{');
//     const jsonEnd = cleanText.lastIndexOf('}');
    
//     if (jsonStart !== -1 && jsonEnd !== -1) {
//       const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
//       const extracted = JSON.parse(jsonStr);
      
//       console.log("📦 Extracted:", extracted);
      
//       return {
//         symptom: extracted.symptom || currentSymptom,
//         severity: extracted.severity || currentSeverity,
//         duration: extracted.duration || currentDuration,
//         location: extracted.location || currentLocation
//       };
//     }
//     return {};
//   } catch (e) { 
//     console.error("❌ Extraction Failed:", e.message);
//     return {}; 
//   }
// }

// --- NODE A: EXTRACTOR (SANITIZED) ---
async function extractData(state) {
  const messages = state.messages || [];
  if (messages.length === 0) return {};
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  console.log("🗣️ User Said:", lastMessage);

  if (lastMessage.includes("reset") || lastMessage.includes("new chat")) {
    return { symptom: null, severity: null, duration: null, location: null };
  }

  const currentSymptom = state.symptom;
  const currentSeverity = state.severity;
  const currentDuration = state.duration;
  const currentLocation = state.location;

  const extractionPrompt = `
    You are a data extraction machine. 
    Analyze the Input. Update the JSON State.
    
    Input: "${lastMessage}"
    Current JSON: ${JSON.stringify({
      symptom: currentSymptom, severity: currentSeverity, duration: currentDuration, location: currentLocation
    })}
    
    RULES:
    1. If the user mentions a symptom, update "symptom".
    2. If the user gives a location, severity, or duration, update those fields.
    3. If a value is NOT mentioned in the input, KEEP the Current JSON value.
    4. Return ONLY valid JSON.
  `;

  try {
    const result = await model.invoke([new HumanMessage(extractionPrompt)]);
    const cleanText = result.content.replace(/```json|```/g, "").trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
      const extracted = JSON.parse(jsonStr);
      
      console.log("📦 Raw Extracted:", extracted);

      // 🧼 SANITIZER FUNCTION
      // Converts "unknown", "n/a", "not mentioned" back to NULL
      const sanitize = (val) => {
        if (!val) return null;
        const v = val.toString().toLowerCase();
        if (v.includes("unknown") || v.includes("not mentioned") || v === "null") return null;
        return val;
      };

      return {
        symptom: sanitize(extracted.symptom) || currentSymptom,
        severity: sanitize(extracted.severity) || currentSeverity,
        duration: sanitize(extracted.duration) || currentDuration,
        location: sanitize(extracted.location) || currentLocation
      };
    }
    return {};
  } catch (e) { 
    console.error("❌ Extraction Failed:", e.message);
    return {}; 
  }
}

// --- LOGIC ---
function routeStep(state) {
  if (!state.symptom) return "ask_symptom";
  if (!state.location) return "ask_location";
  if (!state.severity) return "ask_severity";
  if (!state.duration) return "ask_duration";
  return "generate_diagnosis";
}

// --- QUESTIONS ---
async function askSymptom() { return { messages: [new SystemMessage("What is your main symptom?")] }; }
async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// --- NODE C: THE DOCTOR (PHI-3 OPTIMIZED) ---
async function finalDiagnosis(state) {
  console.log("🔥 DIAGNOSIS STARTED...");

  const prompt = `
    Patient Report:
    - Symptom: ${state.symptom}
    - Location: ${state.location}
    - Severity: ${state.severity}
    - Duration: ${state.duration}
    
    Task:
    1. Briefly explain what this might be.
    2. Suggest 3 home remedies.
    3. State which specialist to see.
    4. END your response with exactly: "SPECIALIST_TYPE: <Type>"
  `;
  
  let fullText = "";
  let specialist = "General Physician";

  try {
    // Timeout set to 60s for CPU
    const aiCall = model.invoke([new HumanMessage(prompt)]);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 60000));
    
    const response = await Promise.race([aiCall, timeout]);
    fullText = response.content;
    console.log("✅ AI Responded");

    const match = fullText.match(/SPECIALIST_TYPE:\s*(.*)/i);
    if (match && match[1]) specialist = match[1].trim();

  } catch (err) {
    console.error("⚠️ AI Error/Timeout:", err.message);
    fullText = "Based on your symptoms, please consult a doctor.";
  }

  const cleanMessage = fullText.replace(/SPECIALIST_TYPE:.*$/i, "").trim();

  console.log(`🔎 Searching for: ${specialist}`);
  let places = await findDoctors(specialist, "Chennai");

  const finalMsg = `${cleanMessage}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`;
  return { messages: [new SystemMessage(finalMsg)], next_step: "done" };
}

// --- BUILD GRAPH ---
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