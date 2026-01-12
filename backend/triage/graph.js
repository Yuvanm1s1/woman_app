
// const { findDoctors } = require("./searchTools"); 
// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { ChatOllama } = require("@langchain/ollama");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. DYNAMIC MODEL SWITCHER
// let model;
// if (process.env.LLM_MODE === "LOCAL") {
//   console.log("💻 MODE: Local CPU (Ollama/Phi-3)");
//   model = new ChatOllama({
//     model: "phi3", 
//     temperature: 0, 
//     baseUrl: "http://localhost:11434",
//   });
// } else {
//   console.log("🌐 MODE: Production (Gemini)");
//   model = new ChatGoogleGenerativeAI({
//     model: "gemini-pro", 
//     temperature: 0,
//     apiKey: process.env.GEMINI_API_KEY,
//   });
// }

// // 2. DEFINE STATE
// const graphState = {
//   messages: { value: (x, y) => x.concat(y), default: () => [] },
//   symptom: { value: (x, y) => y ?? x, default: () => null },
//   severity: { value: (x, y) => y ?? x, default: () => null },
//   duration: { value: (x, y) => y ?? x, default: () => null },
//   location: { value: (x, y) => y ?? x, default: () => null },
//   intent: { value: (x, y) => y ?? x, default: () => "chat" }, 
//   topic: { value: (x, y) => y ?? x, default: () => null },
//   diagnosis_given: { value: (x, y) => y ?? x, default: () => false } 
// };

// // --- NODE 0: THE MASTER ROUTER ---
// async function masterRouter(state) {
//   const messages = state.messages;
//   const lastMessage = messages[messages.length - 1].content;
  
//   console.log("🚦 ROUTER: Analyzing input ->", lastMessage);

//   if (lastMessage.toLowerCase().includes("reset") || lastMessage.toLowerCase().includes("new chat")) {
//     return { intent: "reset", symptom: null, location: null, severity: null, duration: null, diagnosis_given: false };
//   }

//   // FORCE CHAT if diagnosis is already done
//   if (state.diagnosis_given) {
//     const isNewMedicalIssue = /pain|hurt|ache|fever|bleed|swollen/i.test(lastMessage) && !lastMessage.includes("?");
//     if (!isNewMedicalIssue) {
//       console.log("🛡️ ROUTER GUARD: Diagnosis exists -> Forcing CHAT intent");
//       return { intent: "chat" };
//     }
//   }

//   // REFINED PROMPT to catch "Periods" as SUPPORT, not Triage
//   const routerPrompt = `
//     CLASSIFY the Input into one of 3 INTENTS.
//     INPUT: "${lastMessage}"
    
//     1. "triage": User has a specific PHYSICAL PAIN or INJURY they want to fix (e.g., headache, knee pain, fever).
//     2. "support": User talks about EMOTIONS (crying, sad), HORMONES, or CYCLES (periods, menopause, pregnancy, miscarriage).
//     3. "chat": General questions, follow-ups, or greetings.

//     CRITICAL RULE: "Periods", "Menstruation", or "PMS" are SUPPORT topics unless the user explicitly says "severe pain" or "heavy bleeding".

//     OUTPUT JSON ONLY: {"intent": "...", "topic": "..."}
//   `;

//   try {
//     const result = await model.invoke([new HumanMessage(routerPrompt)]);
//     // Regex to find the first valid JSON block
//     const jsonMatch = result.content.match(/\{[\s\S]*?\}/);
    
//     if (jsonMatch) {
//       const parsed = JSON.parse(jsonMatch[0]);
//       console.log("🔀 ROUTED TO:", parsed.intent.toUpperCase());
//       return { intent: parsed.intent, topic: parsed.topic };
//     }
//     throw new Error("No JSON found");
//   } catch (e) {
//     console.log("⚠️ Router Failed, defaulting to CHAT");
//     return { intent: "chat" };
//   }
// }

// // --- BRANCH A: MEDICAL TRIAGE (CRASH-PROOF) ---
// async function extractMedicalData(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🕵️‍♂️ EXTRACTING FROM:", lastMessage);

//   const prompt = `
//     Analyze: "${lastMessage}"
//     Current: ${JSON.stringify({symptom: state.symptom, severity: state.severity, duration: state.duration, location: state.location})}
    
//     Task: Update fields ONLY if explicitly mentioned. Return JSON.
//     {"symptom": "...", "severity": "...", "duration": "...", "location": "..."}
//   `;
  
//   try {
//     const res = await model.invoke([new HumanMessage(prompt)]);
    
//     // 🛡️ CRASH-PROOF PARSER
//     // This Regex looks for the *last* occurrence of a JSON-like object to avoid intro text
//     const jsonMatch = res.content.match(/\{[\s\S]*\}/);
    
//     if (!jsonMatch) {
//       console.log("❌ NO JSON FOUND (Ignoring)");
//       return {}; 
//     }

//     // Try to parse. If it fails, we catch it below instead of Crashing the app.
//     const data = JSON.parse(jsonMatch[0]); 
//     console.log("✅ PARSED DATA:", data);

//     const s = (v) => (v && typeof v === 'string' && !v.toLowerCase().includes("unknown") ? v : null);

//     return { 
//       symptom: s(data.symptom) || state.symptom,
//       severity: s(data.severity) || state.severity,
//       duration: s(data.duration) || state.duration,
//       location: s(data.location) || state.location
//     };
//   } catch (e) { 
//     // 🚨 THIS IS THE FIX: If Phi-3 messes up, we just log it and return empty.
//     // We DO NOT stop the server.
//     console.log("⚠️ EXTRACTION ERROR (Handled):", e.message);
//     return {}; 
//   }
// }

// function checkTriageCompleteness(state) {
//   if (!state.symptom) return "ask_symptom";
//   if (!state.location) return "ask_location";
//   if (!state.severity) return "ask_severity";
//   if (!state.duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// async function askSymptom() { return { messages: [new SystemMessage("What is your main physical symptom?")] }; }
// async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
// async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
// async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// async function generateDiagnosis(state) {
//   console.log("🏥 GENERATING DIAGNOSIS...");
//   const prompt = `
//     Patient: ${state.symptom}, ${state.location}, Severity ${state.severity}, Duration ${state.duration}.
//     1. Diagnosis. 2. Remedies. 3. End with "SPECIALIST_TYPE: <Type>"
//   `;
  
//   const res = await model.invoke([new HumanMessage(prompt)]);
//   let text = res.content;
//   let specialist = "General Physician";
  
//   const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
//   if (match && match[1]) specialist = match[1].trim();
  
//   text = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();
//   const places = await findDoctors(specialist, "Chennai");
  
//   return { 
//     messages: [new SystemMessage(`${text}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`)],
//     diagnosis_given: true
//   };
// }

// // --- BRANCH B: SUPPORT ---
// async function provideSupport(state) {
//   console.log("❤️ SUPPORT MODE - Topic:", state.topic);
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   // Context-Aware Prompt
//   const prompt = `
//     You are a compassionate women's health friend.
//     User Input: "${lastMessage}"
//     Topic: "${state.topic || 'General'}"
    
//     Task: Provide comfort and brief educational info. 
//     IF they mentioned "periods" or "cycles" and "crying", explain Premenstrual Dysphoric Disorder (PMDD) or PMS gently.
//     Keep it warm and short. Do NOT diagnose.
//   `;

//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res], diagnosis_given: true };
// }

// // --- BRANCH C: CHAT ---
// async function handleChat(state) {
//   console.log("💬 CHAT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   const prompt = `
//     User Question: "${lastMessage}"
//     Context: The user is discussing health. Be helpful and brief.
//   `;

//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res] };
// }

// // --- BUILD GRAPH ---
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("router", masterRouter)
//   .addNode("extract_medical", extractMedicalData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("diagnosis", generateDiagnosis)
//   .addNode("support", provideSupport)
//   .addNode("chat", handleChat)

//   .setEntryPoint("router")

//   .addConditionalEdges("router", (state) => state.intent, {
//     triage: "extract_medical",
//     support: "support",
//     chat: "chat",
//     reset: END
//   })

//   .addConditionalEdges("extract_medical", checkTriageCompleteness, {
//     ask_symptom: "ask_symptom",
//     ask_location: "ask_location",
//     ask_severity: "ask_severity",
//     ask_duration: "ask_duration",
//     generate_diagnosis: "diagnosis"
//   })

//   .addEdge("ask_symptom", END)
//   .addEdge("ask_location", END)
//   .addEdge("ask_severity", END)
//   .addEdge("ask_duration", END)
//   .addEdge("diagnosis", END)
//   .addEdge("support", END)
//   .addEdge("chat", END);

// const triageGraph = workflow.compile();
// module.exports = { triageGraph };










// const { findDoctors } = require("./searchTools"); 
// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { ChatOllama } = require("@langchain/ollama");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. DYNAMIC MODEL SWITCHER
// let model;
// if (process.env.LLM_MODE === "LOCAL") {
//   console.log("💻 MODE: Local CPU (Ollama/Phi-3)");
//   model = new ChatOllama({
//     model: "phi3", 
//     temperature: 0, 
//     baseUrl: "http://localhost:11434",
//   });
// } else {
//   console.log("🌐 MODE: Production (Gemini)");
//   model = new ChatGoogleGenerativeAI({
//     model: "gemini-pro", 
//     temperature: 0,
//     apiKey: process.env.GEMINI_API_KEY,
//   });
// }

// // 2. DEFINE STATE
// // Added 'mode' to track if we are in Intake or Locked Follow-up
// const graphState = {
//   messages: { value: (x, y) => x.concat(y), default: () => [] },
//   symptom: { value: (x, y) => y ?? x, default: () => null },
//   severity: { value: (x, y) => y ?? x, default: () => null },
//   duration: { value: (x, y) => y ?? x, default: () => null },
//   location: { value: (x, y) => y ?? x, default: () => null },
//   intent: { value: (x, y) => y ?? x, default: () => "chat" }, 
//   topic: { value: (x, y) => y ?? x, default: () => null },
//   mode: { value: (x, y) => y ?? x, default: () => "intake" } // 'intake' | 'locked'
// };

// // --- HELPER: JSON CLEANER ---
// function cleanAndParse(rawText) {
//   try {
//     let clean = rawText.replace(/```json/g, "").replace(/```/g, "");
//     const start = clean.indexOf('{');
//     const end = clean.lastIndexOf('}');
//     if (start === -1 || end === -1) return null;
//     return JSON.parse(clean.substring(start, end + 1));
//   } catch (e) {
//     return null;
//   }
// }

// // --- NODE 0: THE MASTER ROUTER ---
// async function masterRouter(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🚦 ROUTER: Input ->", lastMessage);

//   // 1. HARD RESET (Always allowed)
//   if (lastMessage.toLowerCase().includes("reset") || lastMessage.toLowerCase().includes("new chat")) {
//     console.log("🧹 RESETTING CONVERSATION");
//     return { intent: "reset", symptom: null, location: null, severity: null, duration: null, mode: "intake" };
//   }

//   // 2. THE LOCK MECHANISM 🔒
//   // If diagnosis/support is done, we FORCE 'chat' intent. No AI guessing allowed.
//   if (state.mode === "locked") {
//     console.log("🔒 STATE LOCKED: Routing directly to Follow-up Chat");
//     return { intent: "chat" };
//   }

//   // 3. NORMAL INTAKE ROUTING (Only runs during Intake phase)
//   const routerPrompt = `
//     Classify intent:
//     - "triage": Physical pain, injury, sickness.
//     - "support": Emotional, periods, miscarriage, crying.
//     - "chat": Greetings.
    
//     OUTPUT JSON ONLY: {"intent": "...", "topic": "..."}
//   `;

//   try {
//     const result = await model.invoke([new HumanMessage(routerPrompt)]);
//     const parsed = cleanAndParse(result.content);
//     if (parsed && parsed.intent) return { intent: parsed.intent, topic: parsed.topic };
//     return { intent: "chat" };
//   } catch (e) {
//     return { intent: "chat" };
//   }
// }

// // --- BRANCH A: MEDICAL TRIAGE ---
// async function extractMedicalData(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🕵️‍♂️ EXTRACTING MEDICAL DATA...");

//   const prompt = `
//     Update medical fields based on Input: "${lastMessage}"
//     Current: ${JSON.stringify({symptom: state.symptom, severity: state.severity, duration: state.duration, location: state.location})}
//     Return JSON ONLY: {"symptom": "...", "severity": "...", "duration": "...", "location": "..."}
//   `;
  
//   try {
//     const res = await model.invoke([new HumanMessage(prompt)]);
//     const data = cleanAndParse(res.content);
//     if (!data) return {};

//     const s = (v) => (v && !v.toLowerCase().includes("unknown") ? v : null);

//     return { 
//       symptom: s(data.symptom) || state.symptom,
//       severity: s(data.severity) || state.severity,
//       duration: s(data.duration) || state.duration,
//       location: s(data.location) || state.location
//     };
//   } catch (e) { return {}; }
// }

// function checkTriageCompleteness(state) {
//   if (!state.symptom) return "ask_symptom";
//   if (!state.location) return "ask_location";
//   if (!state.severity) return "ask_severity";
//   if (!state.duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// async function askSymptom() { return { messages: [new SystemMessage("What is your main physical symptom?")] }; }
// async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
// async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
// async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// async function generateDiagnosis(state) {
//   console.log("🏥 GENERATING DIAGNOSIS...");
//   const prompt = `
//     Patient: ${state.symptom}, ${state.location}, Severity ${state.severity}, Duration ${state.duration}.
//     1. Diagnosis. 2. Remedies. 3. End with "SPECIALIST_TYPE: <Type>"
//   `;
  
//   const res = await model.invoke([new HumanMessage(prompt)]);
//   let text = res.content;
//   let specialist = "General Physician";
  
//   const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
//   if (match && match[1]) specialist = match[1].trim();
//   text = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();

//   const places = await findDoctors(specialist, "Chennai");
  
//   return { 
//     messages: [new SystemMessage(`${text}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`)],
//     mode: "locked" // <--- 🔒 THIS LOCKS THE CHAT
//   };
// }

// // --- BRANCH B: SUPPORT ---
// async function provideSupport(state) {
//   console.log("❤️ SUPPORT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const prompt = `Comfort user regarding: "${lastMessage}". Be kind, brief.`;
//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { 
//     messages: [res], 
//     mode: "locked" // <--- 🔒 THIS LOCKS THE CHAT
//   };
// }

// // --- BRANCH C: LOCKED FOLLOW-UP CHAT ---
// async function handleChat(state) {
//   console.log("💬 FOLLOW-UP CHAT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   // STRICT GUARD RAIL PROMPT
//   const prompt = `
//     CONTEXT: User has completed triage for: ${state.symptom || state.topic}.
//     USER SAYS: "${lastMessage}"
    
//     INSTRUCTIONS:
//     1. Answer follow-up questions ONLY related to the current context (${state.symptom || state.topic}).
//     2. IF the user asks about a NEW symptom (e.g., "I also have fever now"), POLITELY REFUSE.
//        Say: "This chat is focused on your ${state.symptom || state.topic}. Please start a New Chat for a new issue."
//     3. Keep answers brief and helpful.
//   `;

//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res] };
// }

// // --- BUILD GRAPH ---
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("router", masterRouter)
//   .addNode("extract_medical", extractMedicalData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("diagnosis", generateDiagnosis)
//   .addNode("support", provideSupport)
//   .addNode("chat", handleChat)

//   .setEntryPoint("router")

//   .addConditionalEdges("router", (state) => state.intent, {
//     triage: "extract_medical", support: "support", chat: "chat", reset: END
//   })
//   .addConditionalEdges("extract_medical", checkTriageCompleteness, {
//     ask_symptom: "ask_symptom", ask_location: "ask_location", ask_severity: "ask_severity", ask_duration: "ask_duration", generate_diagnosis: "diagnosis"
//   })
//   .addEdge("ask_symptom", END).addEdge("ask_location", END).addEdge("ask_severity", END)
//   .addEdge("ask_duration", END).addEdge("diagnosis", END).addEdge("support", END).addEdge("chat", END);

// const triageGraph = workflow.compile();
// module.exports = { triageGraph };
























































































































































// FINAL VERSION WITH IMPROVED LOCKED CHAT WITH MEMORY(working)
// const { findDoctors } = require("./searchTools"); 
// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { ChatOllama } = require("@langchain/ollama");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. DYNAMIC MODEL SWITCHER
// let model;
// let jsonModel;

// if (process.env.LLM_MODE === "LOCAL") {
//   console.log("💻 MODE: Local CPU (Ollama/Llama3)");
//   model = new ChatOllama({
//     model: "llama3", 
//     temperature: 0, 
//     baseUrl: "http://localhost:11434",
//   });
//   jsonModel = new ChatOllama({
//     model: "llama3",
//     temperature: 0,
//     format: "json", 
//     baseUrl: "http://localhost:11434",
//   });
// } else {
//   console.log("🌐 MODE: Production (Gemini)");
//   model = new ChatGoogleGenerativeAI({
//     model: "gemini-pro", 
//     temperature: 0,
//     apiKey: process.env.GEMINI_API_KEY,
//   });
//   jsonModel = model; 
// }

// // 2. DEFINE STATE
// const graphState = {
//   messages: { value: (x, y) => x.concat(y), default: () => [] },
//   symptom: { value: (x, y) => y ?? x, default: () => null },
//   severity: { value: (x, y) => y ?? x, default: () => null },
//   duration: { value: (x, y) => y ?? x, default: () => null },
//   location: { value: (x, y) => y ?? x, default: () => null },
//   intent: { value: (x, y) => y ?? x, default: () => "chat" }, 
//   topic: { value: (x, y) => y ?? x, default: () => null },
//   mode: { value: (x, y) => y ?? x, default: () => "intake" } 
// };

// // --- NODE 0: THE FAIL-SAFE ROUTER ---
// async function masterRouter(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🚦 ROUTER: Analyzing ->", lastMessage);

//   // 1. HARD RESET
//   if (lastMessage.toLowerCase().includes("reset") || lastMessage.toLowerCase().includes("new chat")) {
//     return { intent: "reset", symptom: null, location: null, severity: null, duration: null, mode: "intake" };
//   }

//   // 2. EXPLICIT LOCK CHECK (If DB saved it)
//   if (state.mode === "locked") {
//     console.log("🔒 LOCKED (Explicit): Routing to Chat");
//     return { intent: "chat" };
//   }

//   // 3. IMPLICIT LOCK CHECK (Fail-safe)
//   // If we have ALL 4 medical facts, we are DONE with Triage. Do not re-enter.
//   if (state.symptom && state.location && state.severity && state.duration) {
//     console.log("🔒 LOCKED (Implicit): Medical Chart Full -> Routing to Chat");
//     return { intent: "chat" };
//   }

//   // 4. AI CLASSIFICATION (Only runs if data is missing)
//   const routerPrompt = `
//     Classify User Input.
//     INPUT: "${lastMessage}"
    
//     1. "triage": Physical pain, injury, sickness.
//     2. "support": Emotional distress, periods, miscarriage, hormones.
//     3. "chat": Greetings, general questions.

//     OUTPUT JSON: { "intent": "triage" } OR { "intent": "support", "topic": "..." } OR { "intent": "chat" }
//   `;

//   try {
//     const result = await jsonModel.invoke([new HumanMessage(routerPrompt)]);
//     const parsed = JSON.parse(result.content);
//     console.log("🔀 AI DECISION:", parsed.intent.toUpperCase());
//     return { intent: parsed.intent, topic: parsed.topic };
//   } catch (e) {
//     return { intent: "chat" };
//   }
// }

// // --- BRANCH A: MEDICAL TRIAGE ---
// async function extractMedicalData(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🕵️‍♂️ EXTRACTING DATA...");

//   const prompt = `
//     User Input: "${lastMessage}"
//     Current Data: ${JSON.stringify({symptom: state.symptom, severity: state.severity, duration: state.duration, location: state.location})}
    
//     Task: Update fields based on input. Return JSON.
//     Schema: {"symptom": string|null, "severity": string|null, "duration": string|null, "location": string|null}
//   `;
  
//   try {
//     const res = await jsonModel.invoke([new HumanMessage(prompt)]);
//     const data = JSON.parse(res.content);
//     console.log("✅ EXTRACTED:", data);

//     const s = (v) => (v && !v.toLowerCase().includes("unknown") ? v : null);

//     return { 
//       symptom: s(data.symptom) || state.symptom,
//       severity: s(data.severity) || state.severity,
//       duration: s(data.duration) || state.duration,
//       location: s(data.location) || state.location
//     };
//   } catch (e) { return {}; }
// }

// function checkTriageCompleteness(state) {
//   // If any field is missing, keep asking.
//   if (!state.symptom) return "ask_symptom";
//   if (!state.location) return "ask_location";
//   if (!state.severity) return "ask_severity";
//   if (!state.duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// async function askSymptom() { return { messages: [new SystemMessage("What is your main physical symptom?")] }; }
// async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
// async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
// async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// async function generateDiagnosis(state) {
//   console.log("🏥 GENERATING DIAGNOSIS...");
//   const timeoutMs = 120000; 

//   const prompt = `
//     Patient: Symptom ${state.symptom}, Location ${state.location}, Severity ${state.severity}, Duration ${state.duration}.
//     1. Brief Diagnosis.
//     2. Three Home Remedies.
//     3. End with "SPECIALIST_TYPE: <Type>"
//   `;
  
//   try {
//     const aiCall = model.invoke([new HumanMessage(prompt)]);
//     const res = await aiCall; 

//     let text = res.content;
//     let specialist = "General Physician";
//     const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
//     if (match && match[1]) specialist = match[1].trim();
//     text = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();

//     const places = await findDoctors(specialist, "Chennai");
    
//     return { 
//       messages: [new SystemMessage(`${text}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`)],
//       mode: "locked" // Still trying to set it, even if DB ignores it
//     };
//   } catch (err) {
//     return { messages: [new SystemMessage("Diagnosis timed out. Try again.")] };
//   }
// }

// // --- BRANCH B: SUPPORT ---
// async function provideSupport(state) {
//   console.log("❤️ SUPPORT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const prompt = `User Input: "${lastMessage}". Topic: "${state.topic}". Validate feelings & provide comfort. Do not diagnose.`;
//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res], mode: "locked" };
// }

// // --- BRANCH C: LOCKED CHAT ---
// // async function handleChat(state) {
// //   console.log("💬 CHAT MODE (Follow-up)");
// //   const lastMessage = state.messages[state.messages.length - 1].content;
  
// //   const prompt = `
// //     CONTEXT: User has completed triage.
// //     - Physical Issue: ${state.symptom ? `${state.symptom} in ${state.location}` : "None"}
// //     - Emotional Issue: ${state.topic || "None"}
    
// //     USER QUESTION: "${lastMessage}"
    
// //     INSTRUCTIONS:
// //     1. Answer the question specifically about the context above.
// //     2. If the user asks about a NEW symptom (e.g. "I also have fever"), REFUSE nicely. Say: "Please start a New Chat for a new issue."
// //   `;

// //   const res = await model.invoke([new HumanMessage(prompt)]);
// //   return { messages: [res] };
// // }







// // --- BRANCH C: LOCKED CHAT (WITH MEMORY) ---
// async function handleChat(state) {
//   console.log("💬 CHAT MODE (History Enabled)");
//   const lastMessage = state.messages[state.messages.length - 1].content;
  
//   // 1. Get the last 5 messages to save tokens (Memory Window)
//   const recentHistory = state.messages.slice(-5).map(m => 
//     `${m.constructor.name === "HumanMessage" ? "User" : "AI"}: ${m.content}`
//   ).join("\n");

//   const prompt = `
//     CONTEXT:
//     - Medical Chart: ${state.symptom ? `${state.symptom} in ${state.location}` : state.topic}
//     - Severity: ${state.severity || "N/A"}
    
//     CHAT HISTORY:
//     ${recentHistory}
    
//     CURRENT QUESTION: "${lastMessage}"
    
//     INSTRUCTIONS:
//     1. Answer the Current Question using the Context and Chat History.
//     2. If the user asks "Why?", explain your previous answer.
//     3. Keep it brief.
//   `;

//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res] };
// }















// // --- BUILD GRAPH ---
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("router", masterRouter)
//   .addNode("extract_medical", extractMedicalData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("diagnosis", generateDiagnosis)
//   .addNode("support", provideSupport)
//   .addNode("chat", handleChat)

//   .setEntryPoint("router")

//   .addConditionalEdges("router", (state) => state.intent, {
//     triage: "extract_medical", support: "support", chat: "chat", reset: END
//   })
//   .addConditionalEdges("extract_medical", checkTriageCompleteness, {
//     ask_symptom: "ask_symptom", ask_location: "ask_location", ask_severity: "ask_severity", ask_duration: "ask_duration", generate_diagnosis: "diagnosis"
//   })
//   .addEdge("ask_symptom", END).addEdge("ask_location", END).addEdge("ask_severity", END)
//   .addEdge("ask_duration", END).addEdge("diagnosis", END).addEdge("support", END).addEdge("chat", END);

// const triageGraph = workflow.compile();
// module.exports = { triageGraph };




//Guard rails Sentinel Layer
// const { findDoctors } = require("./searchTools"); 
// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { ChatOllama } = require("@langchain/ollama");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. DYNAMIC MODEL SWITCHER
// let model;
// let jsonModel;

// if (process.env.LLM_MODE === "LOCAL") {
//   console.log("💻 MODE: Local CPU (Ollama/Llama3)");
//   model = new ChatOllama({
//     model: "llama3", 
//     temperature: 0, 
//     baseUrl: "http://localhost:11434",
//   });
//   jsonModel = new ChatOllama({
//     model: "llama3",
//     temperature: 0,
//     format: "json", 
//     baseUrl: "http://localhost:11434",
//   });
// } else {
//   console.log("🌐 MODE: Production (Gemini)");
//   model = new ChatGoogleGenerativeAI({
//     model: "gemini-pro", 
//     temperature: 0,
//     apiKey: process.env.GEMINI_API_KEY,
//   });
//   jsonModel = model; 
// }

// // 2. DEFINE STATE
// const graphState = {
//   messages: { value: (x, y) => x.concat(y), default: () => [] },
//   symptom: { value: (x, y) => y ?? x, default: () => null },
//   severity: { value: (x, y) => y ?? x, default: () => null },
//   duration: { value: (x, y) => y ?? x, default: () => null },
//   location: { value: (x, y) => y ?? x, default: () => null },
//   intent: { value: (x, y) => y ?? x, default: () => "chat" }, 
//   topic: { value: (x, y) => y ?? x, default: () => null },
//   mode: { value: (x, y) => y ?? x, default: () => "intake" } 
// };

// // --- NODE 0: THE HYBRID ROUTER ---
// async function masterRouter(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content.toLowerCase();
//   console.log("🚦 ROUTER: Analyzing ->", lastMessage);

//   // 1. 🛡️ HARD SENTINEL (Only Unambiguous Threats)
//   // Removed "hurt myself" to avoid false positives.
//   const strictCrisisKeywords = [
//     "suicide", "kill myself", "want to die", "better off dead", "end my life"
//   ];
  
//   if (strictCrisisKeywords.some(phrase => lastMessage.includes(phrase))) {
//     console.log("🚨 HARD SENTINEL: Immediate Crisis Detected");
//     return { intent: "crisis" };
//   }

//   // 2. RESET
//   if (lastMessage.includes("reset") || lastMessage.includes("new chat")) {
//     return { intent: "reset", symptom: null, location: null, severity: null, duration: null, mode: "intake" };
//   }

//   // 3. LOCK CHECKS
//   if (state.mode === "locked") return { intent: "chat" };
//   if (state.symptom && state.location && state.severity && state.duration) return { intent: "chat" };

//   // 4. SMART AI ROUTER (Handles the nuance)
//   const routerPrompt = `
//     Classify the User Input.
//     INPUT: "${lastMessage}"
    
//     INTENTS:
//     1. "triage": Physical accident, injury, sickness (e.g. "I fell and hurt myself", "headache").
//     2. "support": Emotional distress, periods, miscarriage.
//     3. "crisis": Intentional SELF-HARM or danger (e.g. "I want to hurt myself", "I am cutting myself").
//     4. "chat": General questions.

//     CRITICAL RULE:
//     - "I fell and hurt myself" -> TRIAGE (Accident).
//     - "I want to hurt myself" -> CRISIS (Self-harm).

//     OUTPUT JSON: { "intent": "triage" } OR { "intent": "support", "topic": "..." } OR { "intent": "crisis" } OR { "intent": "chat" }
//   `;

//   try {
//     const result = await jsonModel.invoke([new HumanMessage(routerPrompt)]);
//     const parsed = JSON.parse(result.content);
//     console.log("🔀 AI DECISION:", parsed.intent.toUpperCase());
//     return { intent: parsed.intent, topic: parsed.topic };
//   } catch (e) {
//     return { intent: "chat" };
//   }
// }

// // --- CRISIS NODE ---
// async function handleCrisis(state) {
//   console.log("🚨 ACTIVATING SAFETY PROTOCOL");
//   const safetyMessage = `
// **⚠️ YOU ARE IMPORTANT.**

// I am an AI, and I cannot provide emergency care, but help is available.

// 📞 **Suicide Prevention:** 9152987821
// 📞 **Vandrevala Foundation:** 1860 266 2345
// 🚑 **Emergency:** 112

// Please go to the nearest hospital immediately.
//   `;
//   return { messages: [new SystemMessage(safetyMessage)], mode: "locked" };
// }

// // --- BRANCH A: MEDICAL TRIAGE ---
// async function extractMedicalData(state) {
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🕵️‍♂️ EXTRACTING DATA...");

//   const prompt = `
//     User Input: "${lastMessage}"
//     Current Data: ${JSON.stringify({symptom: state.symptom, severity: state.severity, duration: state.duration, location: state.location})}
//     Task: Update fields. Return JSON. Schema: {"symptom": string|null, "severity": string|null, "duration": string|null, "location": string|null}
//   `;
  
//   try {
//     const res = await jsonModel.invoke([new HumanMessage(prompt)]);
//     const data = JSON.parse(res.content);
//     const s = (v) => (v && !v.toLowerCase().includes("unknown") ? v : null);
//     return { 
//       symptom: s(data.symptom) || state.symptom,
//       severity: s(data.severity) || state.severity,
//       duration: s(data.duration) || state.duration,
//       location: s(data.location) || state.location
//     };
//   } catch (e) { return {}; }
// }

// function checkTriageCompleteness(state) {
//   if (!state.symptom) return "ask_symptom";
//   if (!state.location) return "ask_location";
//   if (!state.severity) return "ask_severity";
//   if (!state.duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// async function askSymptom() { return { messages: [new SystemMessage("What is your main physical symptom?")] }; }
// async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
// async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
// async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// async function generateDiagnosis(state) {
//   console.log("🏥 GENERATING DIAGNOSIS...");
//   const prompt = `
//     Patient: Symptom ${state.symptom}, Location ${state.location}, Severity ${state.severity}, Duration ${state.duration}.
//     1. Brief Diagnosis. 2. Remedies. 3. End with "SPECIALIST_TYPE: <Type>"
//   `;
//   try {
//     const res = await model.invoke([new HumanMessage(prompt)]);
//     let text = res.content;
//     let specialist = "General Physician";
//     const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
//     if (match && match[1]) specialist = match[1].trim();
//     text = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();
//     const places = await findDoctors(specialist, "Chennai");
//     return { messages: [new SystemMessage(`${text}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`)], mode: "locked" };
//   } catch (err) {
//     return { messages: [new SystemMessage("Diagnosis timed out. Try again.")] };
//   }
// }

// // --- BRANCH B: SUPPORT ---
// async function provideSupport(state) {
//   console.log("❤️ SUPPORT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const prompt = `User Input: "${lastMessage}". Topic: "${state.topic}". Validate feelings & provide comfort. Do not diagnose.`;
//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res], mode: "locked" };
// }

// // --- BRANCH C: LOCKED CHAT ---
// async function handleChat(state) {
//   console.log("💬 CHAT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const recentHistory = state.messages.slice(-5).map(m => `${m.constructor.name === "HumanMessage" ? "User" : "AI"}: ${m.content}`).join("\n");

//   const prompt = `
//     CONTEXT: Medical Chart: ${state.symptom ? `${state.symptom} in ${state.location}` : state.topic} | Severity: ${state.severity || "N/A"}
//     CHAT HISTORY: ${recentHistory}
//     CURRENT QUESTION: "${lastMessage}"
//     INSTRUCTIONS: Answer using Context/History. If NEW symptom mentioned, Refuse politely.
//   `;
//   const res = await model.invoke([new HumanMessage(prompt)]);
//   return { messages: [res] };
// }

// // --- BUILD GRAPH ---
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("router", masterRouter)
//   .addNode("extract_medical", extractMedicalData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("diagnosis", generateDiagnosis)
//   .addNode("support", provideSupport)
//   .addNode("chat", handleChat)
//   .addNode("crisis", handleCrisis)

//   .setEntryPoint("router")

//   .addConditionalEdges("router", (state) => state.intent, {
//     triage: "extract_medical", 
//     support: "support", 
//     chat: "chat", 
//     crisis: "crisis", 
//     reset: END
//   })
//   .addConditionalEdges("extract_medical", checkTriageCompleteness, {
//     ask_symptom: "ask_symptom", ask_location: "ask_location", ask_severity: "ask_severity", ask_duration: "ask_duration", generate_diagnosis: "diagnosis"
//   })
//   .addEdge("ask_symptom", END).addEdge("ask_location", END).addEdge("ask_severity", END)
//   .addEdge("ask_duration", END).addEdge("diagnosis", END).addEdge("support", END)
//   .addEdge("chat", END).addEdge("crisis", END);

// const triageGraph = workflow.compile();
// module.exports = { triageGraph };


//added logger
// const { findDoctors } = require("./searchTools"); 
// const { StateGraph, END } = require("@langchain/langgraph");
// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const { ChatOllama } = require("@langchain/ollama");
// const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
// const dotenv = require("dotenv");
// const { logTransaction } = require("../utils/logger"); // 👈 LOGGER IMPORTED

// dotenv.config();

// // --- 1. MODEL SETUP ---
// let model;
// let jsonModel;

// if (process.env.LLM_MODE === "LOCAL") {
//   console.log("💻 MODE: Local CPU (Ollama/Llama3)");
//   model = new ChatOllama({
//     model: "llama3", 
//     temperature: 0, 
//     baseUrl: "http://localhost:11434",
//   });
//   jsonModel = new ChatOllama({
//     model: "llama3",
//     temperature: 0,
//     format: "json", // Strict JSON mode
//     baseUrl: "http://localhost:11434",
//   });
// } else {
//   console.log("🌐 MODE: Production (Gemini)");
//   model = new ChatGoogleGenerativeAI({
//     model: "gemini-pro", 
//     temperature: 0,
//     apiKey: process.env.GEMINI_API_KEY,
//   });
//   jsonModel = model; 
// }

// // --- 2. STATE DEFINITION ---
// const graphState = {
//   messages: { value: (x, y) => x.concat(y), default: () => [] },
//   symptom: { value: (x, y) => y ?? x, default: () => null },
//   severity: { value: (x, y) => y ?? x, default: () => null },
//   duration: { value: (x, y) => y ?? x, default: () => null },
//   location: { value: (x, y) => y ?? x, default: () => null },
//   intent: { value: (x, y) => y ?? x, default: () => "chat" }, 
//   topic: { value: (x, y) => y ?? x, default: () => null },
//   mode: { value: (x, y) => y ?? x, default: () => "intake" } 
// };

// // Helper for User ID (Hardcoded for prototype)
// function getUserId(state) { return "u1@gmail.com"; }

// // --- NODE 0: MASTER ROUTER (Logged) ---
// async function masterRouter(state) {
//   const start = Date.now();
//   const lastMessage = state.messages[state.messages.length - 1].content.toLowerCase();
//   console.log("🚦 ROUTER: Analyzing ->", lastMessage);

//   // 1. HARD SENTINEL
//   const strictCrisisKeywords = ["suicide", "kill myself", "want to die", "better off dead", "end my life"];
//   if (strictCrisisKeywords.some(phrase => lastMessage.includes(phrase))) {
//     console.log("🚨 SENTINEL: Crisis Detected");
//     logTransaction("ROUTER_SENTINEL", getUserId(state), { text: lastMessage }, { decision: "CRISIS" }, start);
//     return { intent: "crisis" };
//   }

//   // 2. RESET
//   if (lastMessage.includes("reset") || lastMessage.includes("new chat")) {
//     return { intent: "reset", symptom: null, location: null, severity: null, duration: null, mode: "intake" };
//   }

//   // 3. LOCK CHECKS
//   if (state.mode === "locked") return { intent: "chat" };
//   if (state.symptom && state.location && state.severity && state.duration) return { intent: "chat" };

//   // 4. AI ROUTER
//   const routerPrompt = `
//     Classify User Input.
//     INPUT: "${lastMessage}"
//     INTENTS:
//     1. "triage": Physical injury/sickness (e.g. "I fell", "headache").
//     2. "support": Emotional/Hormonal (e.g. "sad", "period").
//     3. "crisis": Intentional SELF-HARM (e.g. "I want to hurt myself").
//     4. "chat": General.
    
//     OUTPUT JSON: { "intent": "..." }
//   `;

//   try {
//     const result = await jsonModel.invoke([new HumanMessage(routerPrompt)]);
//     const parsed = JSON.parse(result.content);
    
//     // 📝 LOGGING
//     logTransaction("ROUTER_AI", getUserId(state), { input: lastMessage }, parsed, start);
    
//     return { intent: parsed.intent, topic: parsed.topic };
//   } catch (e) {
//     return { intent: "chat" };
//   }
// }

// // --- NODE: CRISIS HANDLER ---
// async function handleCrisis(state) {
//   const start = Date.now();
//   console.log("🚨 ACTIVATING SAFETY PROTOCOL");
//   const safetyMessage = `**⚠️ YOU ARE IMPORTANT.**\nCall 9152987821 (Suicide Prevention) or 112 (Emergency).`;
  
//   // 📝 LOGGING
//   logTransaction("CRISIS_NODE", getUserId(state), { status: "active" }, { response: "safety_card_shown" }, start);
  
//   return { messages: [new SystemMessage(safetyMessage)], mode: "locked" };
// }

// // --- NODE: MEDICAL EXTRACTOR (Logged) ---
// async function extractMedicalData(state) {
//   const start = Date.now();
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   console.log("🕵️‍♂️ EXTRACTING DATA...");

//   const prompt = `
//     User Input: "${lastMessage}"
//     Current Data: ${JSON.stringify({symptom: state.symptom, severity: state.severity, duration: state.duration, location: state.location})}
//     Task: Update fields. Return JSON. Schema: {"symptom": string|null, "severity": string|null, "duration": string|null, "location": string|null}
//   `;
  
//   try {
//     const res = await jsonModel.invoke([new HumanMessage(prompt)]);
//     const data = JSON.parse(res.content);
    
//     // 📝 LOGGING
//     logTransaction("EXTRACTOR", getUserId(state), { text: lastMessage }, data, start);

//     const s = (v) => (v && !v.toLowerCase().includes("unknown") ? v : null);
//     return { 
//       symptom: s(data.symptom) || state.symptom,
//       severity: s(data.severity) || state.severity,
//       duration: s(data.duration) || state.duration,
//       location: s(data.location) || state.location
//     };
//   } catch (e) { return {}; }
// }

// function checkTriageCompleteness(state) {
//   if (!state.symptom) return "ask_symptom";
//   if (!state.location) return "ask_location";
//   if (!state.severity) return "ask_severity";
//   if (!state.duration) return "ask_duration";
//   return "generate_diagnosis";
// }

// // Question Nodes
// async function askSymptom() { return { messages: [new SystemMessage("What is your main physical symptom?")] }; }
// async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
// async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
// async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// // --- NODE: DIAGNOSIS (Logged) ---
// async function generateDiagnosis(state) {
//   const start = Date.now();
//   console.log("🏥 GENERATING DIAGNOSIS...");
//   const prompt = `
//     Patient: Symptom ${state.symptom}, Location ${state.location}, Severity ${state.severity}, Duration ${state.duration}.
//     1. Brief Diagnosis. 2. Remedies. 3. End with "SPECIALIST_TYPE: <Type>"
//   `;
//   try {
//     const res = await model.invoke([new HumanMessage(prompt)]);
//     let text = res.content;
//     let specialist = "General Physician";
//     const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
//     if (match && match[1]) specialist = match[1].trim();
//     text = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();
    
//     const places = await findDoctors(specialist, "Chennai");
    
//     // 📝 LOGGING
//     logTransaction("DIAGNOSIS", getUserId(state), { chart: state }, { specialist, response_len: text.length }, start);

//     return { messages: [new SystemMessage(`${text}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`)], mode: "locked" };
//   } catch (err) {
//     return { messages: [new SystemMessage("Diagnosis timed out. Try again.")] };
//   }
// }

// // --- NODE: SUPPORT (Logged) ---
// async function provideSupport(state) {
//   const start = Date.now();
//   console.log("❤️ SUPPORT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const prompt = `User Input: "${lastMessage}". Topic: "${state.topic}". Validate feelings & provide comfort. Do not diagnose.`;
//   const res = await model.invoke([new HumanMessage(prompt)]);
  
//   // 📝 LOGGING
//   logTransaction("SUPPORT_AI", getUserId(state), { topic: state.topic }, { response_len: res.content.length }, start);
  
//   return { messages: [res], mode: "locked" };
// }

// // --- NODE: CHAT (Logged + History) ---
// async function handleChat(state) {
//   const start = Date.now();
//   console.log("💬 CHAT MODE");
//   const lastMessage = state.messages[state.messages.length - 1].content;
//   const recentHistory = state.messages.slice(-5).map(m => `${m.constructor.name === "HumanMessage" ? "User" : "AI"}: ${m.content}`).join("\n");

//   const prompt = `
//     CONTEXT: Medical Chart: ${state.symptom ? `${state.symptom} in ${state.location}` : state.topic} | Severity: ${state.severity || "N/A"}
//     CHAT HISTORY: ${recentHistory}
//     CURRENT QUESTION: "${lastMessage}"
//     INSTRUCTIONS: Answer using Context/History. If NEW symptom mentioned, Refuse politely.
//   `;
//   const res = await model.invoke([new HumanMessage(prompt)]);
  
//   // 📝 LOGGING
//   logTransaction("CHAT_BOT", getUserId(state), { question: lastMessage }, { response: res.content }, start);

//   return { messages: [res] };
// }

// // --- BUILD GRAPH ---
// const workflow = new StateGraph({ channels: graphState })
//   .addNode("router", masterRouter)
//   .addNode("extract_medical", extractMedicalData)
//   .addNode("ask_symptom", askSymptom)
//   .addNode("ask_location", askLocation)
//   .addNode("ask_severity", askSeverity)
//   .addNode("ask_duration", askDuration)
//   .addNode("diagnosis", generateDiagnosis)
//   .addNode("support", provideSupport)
//   .addNode("chat", handleChat)
//   .addNode("crisis", handleCrisis)

//   .setEntryPoint("router")

//   .addConditionalEdges("router", (state) => state.intent, {
//     triage: "extract_medical", support: "support", chat: "chat", crisis: "crisis", reset: END
//   })
//   .addConditionalEdges("extract_medical", checkTriageCompleteness, {
//     ask_symptom: "ask_symptom", ask_location: "ask_location", ask_severity: "ask_severity", ask_duration: "ask_duration", generate_diagnosis: "diagnosis"
//   })
//   .addEdge("ask_symptom", END).addEdge("ask_location", END).addEdge("ask_severity", END)
//   .addEdge("ask_duration", END).addEdge("diagnosis", END).addEdge("support", END)
//   .addEdge("chat", END).addEdge("crisis", END);

// const triageGraph = workflow.compile();
// module.exports = { triageGraph };




//id+short term memory
const { findDoctors } = require("./searchTools"); 
const { StateGraph, END } = require("@langchain/langgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOllama } = require("@langchain/ollama");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const dotenv = require("dotenv");
const { logTransaction } = require("../utils/logger"); 

dotenv.config();

// --- 1. MODEL SETUP ---
let model;
let jsonModel;

if (process.env.LLM_MODE === "LOCAL") {
  console.log("💻 MODE: Local CPU (Ollama/Llama3)");
  model = new ChatOllama({
    model: "llama3", 
    temperature: 0, 
    baseUrl: "http://localhost:11434",
  });
  jsonModel = new ChatOllama({
    model: "llama3",
    temperature: 0,
    format: "json", // Strict JSON mode
    baseUrl: "http://localhost:11434",
  });
} else {
  console.log("🌐 MODE: Production (Gemini)");
  model = new ChatGoogleGenerativeAI({
    model: "gemini-pro", 
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
  });
  jsonModel = model; 
}

// --- 2. STATE DEFINITION ---
const graphState = {
  messages: { value: (x, y) => x.concat(y), default: () => [] },
  symptom: { value: (x, y) => y ?? x, default: () => null },
  severity: { value: (x, y) => y ?? x, default: () => null },
  duration: { value: (x, y) => y ?? x, default: () => null },
  location: { value: (x, y) => y ?? x, default: () => null },
  intent: { value: (x, y) => y ?? x, default: () => "chat" }, 
  topic: { value: (x, y) => y ?? x, default: () => null },
  mode: { value: (x, y) => y ?? x, default: () => "intake" },
  // ✅ FIX: Added transactionId to state so it passes through nodes
  transactionId: { value: (x, y) => y ?? x, default: () => null } 
};

// Helper for User ID (Hardcoded for prototype)
function getUserId(state) { return "u1@gmail.com"; }

// --- NODE 0: MASTER ROUTER (With Triage Lock) ---
async function masterRouter(state) {
  const start = Date.now();
  const lastMessage = state.messages[state.messages.length - 1].content.toLowerCase();
  
  const txnId = state.transactionId || "ROUTER_AI";

  console.log(`🚦 [${txnId}] ROUTER: Analyzing ->`, lastMessage);

  // 1. HARD SENTINEL (Safety First)
  const strictCrisisKeywords = ["suicide", "kill myself", "want to die", "better off dead", "end my life"];
  if (strictCrisisKeywords.some(phrase => lastMessage.includes(phrase))) {
    console.log("🚨 SENTINEL: Crisis Detected");
    logTransaction(txnId, "ROUTER_SENTINEL", getUserId(state), { text: lastMessage }, { decision: "CRISIS" }, start);
    return { intent: "crisis" };
  }

  // 2. RESET (Always allow user to exit)
  if (lastMessage.includes("reset") || lastMessage.includes("new chat")) {
    return { intent: "reset", symptom: null, location: null, severity: null, duration: null, mode: "intake" };
  }

  // 3. LOCK CHECKS (If already finished)
  if (state.mode === "locked") return { intent: "chat" };
  if (state.symptom && state.location && state.severity && state.duration) return { intent: "chat" };

  // ✅ 4. THE FIX: TRIAGE LOCK-IN
  // If we already have a Symptom, but are missing other details, FORCE "triage".
  // Do not let the AI Router guess again. 
  if (state.symptom && (!state.severity || !state.duration || !state.location)) {
     console.log(`🚑 [${txnId}] TRIAGE LOCK: In middle of intake. Bypassing Router.`);
     return { intent: "triage" };
  }

  // 5. AI ROUTER (Only runs if we are starting fresh)
  const routerPrompt = `
    Classify User Input.
    INPUT: "${lastMessage}"
    
    RULES:
    1. CRISIS: Self-harm, suicide -> "crisis"
    2. SUPPORT: Emotional words ("anxious", "depressed", "sad") -> "support"
    3. TRIAGE: Physical injuries, sickness -> "triage"
    4. CHAT: General -> "chat"
    
    IMPORTANT: Return the intent key in LOWERCASE.
    OUTPUT JSON: { "intent": "..." }
  `;

  try {
    const result = await jsonModel.invoke([new HumanMessage(routerPrompt)]);
    const parsed = JSON.parse(result.content);
    const normalizedIntent = parsed.intent ? parsed.intent.toLowerCase() : "chat";
    
    logTransaction(txnId, "ROUTER_AI", getUserId(state), { input: lastMessage }, parsed, start);
    return { intent: normalizedIntent, topic: parsed.topic };
  } catch (e) {
    logTransaction(txnId, "ROUTER_ERROR", getUserId(state), { error: e.message }, { fallback: "chat" }, start);
    return { intent: "chat" };
  }
}
// --- NODE: CRISIS HANDLER ---
async function handleCrisis(state) {
  const start = Date.now();
  const txnId = state.transactionId || "CRISIS_NODE";
  console.log("🚨 ACTIVATING SAFETY PROTOCOL");
  
  const safetyMessage = `**⚠️ YOU ARE IMPORTANT.**\nCall 9152987821 (Suicide Prevention) or 112 (Emergency).`;
  
  logTransaction(txnId, "CRISIS_NODE", getUserId(state), { status: "active" }, { response: "safety_card_shown" }, start);
  
  return { messages: [new SystemMessage(safetyMessage)], mode: "locked" };
}

// --- NODE: MEDICAL EXTRACTOR (Logged) ---
async function extractMedicalData(state) {
  const start = Date.now();
  const lastMessage = state.messages[state.messages.length - 1].content;
  const txnId = state.transactionId || "EXTRACTOR";

  console.log("🕵️‍♂️ EXTRACTING DATA...");

  const prompt = `
    User Input: "${lastMessage}"
    Current Data: ${JSON.stringify({symptom: state.symptom, severity: state.severity, duration: state.duration, location: state.location})}
    Task: Update fields based on input. Return JSON. 
    Schema: {"symptom": string|null, "severity": string|null, "duration": string|null, "location": string|null}
  `;
  
  try {
    const res = await jsonModel.invoke([new HumanMessage(prompt)]);
    const data = JSON.parse(res.content);
    
    // Log with txnId
    logTransaction(txnId, "EXTRACTOR", getUserId(state), { text: lastMessage }, data, start);

    const s = (v) => (v && !v.toLowerCase().includes("unknown") ? v : null);
    return { 
      symptom: s(data.symptom) || state.symptom,
      severity: s(data.severity) || state.severity,
      duration: s(data.duration) || state.duration,
      location: s(data.location) || state.location
    };
  } catch (e) { 
    return {}; 
  }
}

function checkTriageCompleteness(state) {
  if (!state.symptom) return "ask_symptom";
  if (!state.location) return "ask_location";
  if (!state.severity) return "ask_severity";
  if (!state.duration) return "ask_duration";
  return "generate_diagnosis";
}

// Question Nodes
async function askSymptom() { return { messages: [new SystemMessage("What is your main physical symptom?")] }; }
async function askLocation(state) { return { messages: [new SystemMessage(`Where is the ${state.symptom} located?`)] }; }
async function askSeverity() { return { messages: [new SystemMessage("On a scale of 1-10, how severe is it?")] }; }
async function askDuration() { return { messages: [new SystemMessage("How long have you had it?")] }; }

// --- NODE: DIAGNOSIS (Logged) ---
async function generateDiagnosis(state) {
  const start = Date.now();
  const txnId = state.transactionId || "DIAGNOSIS";
  console.log("🏥 GENERATING DIAGNOSIS...");
  
  const prompt = `
    Patient: Symptom ${state.symptom}, Location ${state.location}, Severity ${state.severity}, Duration ${state.duration}.
    1. Provide a Brief Diagnosis (Potential cause).
    2. Suggest 3 Home Remedies or Over-the-Counter (OTC) relief ONLY.
    3. ⛔ CRITICAL: DO NOT suggest specific prescription names or dosages.
    4. End with "SPECIALIST_TYPE: <Type>"
  `;
  
  try {
    const res = await model.invoke([new HumanMessage(prompt)]);
    let text = res.content;
    let specialist = "General Physician";
    const match = text.match(/SPECIALIST_TYPE:\s*(.*)/i);
    if (match && match[1]) specialist = match[1].trim();
    text = text.replace(/SPECIALIST_TYPE:.*$/i, "").trim();
    
    const places = await findDoctors(specialist, "Chennai");
    
    // Log with txnId
    logTransaction(txnId, "DIAGNOSIS", getUserId(state), { chart: state }, { specialist, response_len: text.length }, start);

    return { messages: [new SystemMessage(`${text}\n\n----------------\n📍 **Recommended Specialists:**\n${places}`)], mode: "locked" };
  } catch (err) {
    return { messages: [new SystemMessage("Diagnosis timed out. Try again.")] };
  }
}

// --- NODE: SUPPORT (Logged) ---
async function provideSupport(state) {
  const start = Date.now();
  const txnId = state.transactionId || "SUPPORT_AI";
  console.log("❤️ SUPPORT MODE");
  
  const lastMessage = state.messages[state.messages.length - 1].content;
  const prompt = `User Input: "${lastMessage}". Topic: "${state.topic}". Validate feelings & provide comfort. Do not diagnose.`;
  const res = await model.invoke([new HumanMessage(prompt)]);
  
  // Log with txnId
  logTransaction(txnId, "SUPPORT_AI", getUserId(state), { topic: state.topic }, { response_len: res.content.length }, start);
  
  return { messages: [res], mode: "locked" };
}

// --- NODE: CHAT (Logged + History) ---
async function handleChat(state) {
  const start = Date.now();
  const txnId = state.transactionId || "CHAT_BOT";
  console.log("💬 CHAT MODE");
  
  const lastMessage = state.messages[state.messages.length - 1].content;
  const recentHistory = state.messages.slice(-5).map(m => `${m.constructor.name === "HumanMessage" ? "User" : "AI"}: ${m.content}`).join("\n");

  const prompt = `
    CONTEXT: Medical Chart: ${state.symptom ? `${state.symptom} in ${state.location}` : state.topic} | Severity: ${state.severity || "N/A"}
    CHAT HISTORY: ${recentHistory}
    CURRENT QUESTION: "${lastMessage}"
    INSTRUCTIONS: 
    1. Answer using Context/History. 
    2. If user asks for medication/prescription: Refuse politely. Say "I cannot prescribe medication. Please consult a doctor."
    3. If NEW symptom mentioned, Refuse politely.
  `;
  
  const res = await model.invoke([new HumanMessage(prompt)]);
  
  // Log with txnId
  logTransaction(txnId, "CHAT_BOT", getUserId(state), { question: lastMessage }, { response: res.content }, start);

  return { messages: [res] };
}

// --- BUILD GRAPH ---
const workflow = new StateGraph({ channels: graphState })
  .addNode("router", masterRouter)
  .addNode("extract_medical", extractMedicalData)
  .addNode("ask_symptom", askSymptom)
  .addNode("ask_location", askLocation)
  .addNode("ask_severity", askSeverity)
  .addNode("ask_duration", askDuration)
  .addNode("diagnosis", generateDiagnosis)
  .addNode("support", provideSupport)
  .addNode("chat", handleChat)
  .addNode("crisis", handleCrisis)

  .setEntryPoint("router")

  .addConditionalEdges("router", (state) => state.intent, {
    triage: "extract_medical", support: "support", chat: "chat", crisis: "crisis", reset: END
  })
  .addConditionalEdges("extract_medical", checkTriageCompleteness, {
    ask_symptom: "ask_symptom", ask_location: "ask_location", ask_severity: "ask_severity", ask_duration: "ask_duration", generate_diagnosis: "diagnosis"
  })
  .addEdge("ask_symptom", END).addEdge("ask_location", END).addEdge("ask_severity", END)
  .addEdge("ask_duration", END).addEdge("diagnosis", END).addEdge("support", END)
  .addEdge("chat", END).addEdge("crisis", END);

const triageGraph = workflow.compile();
module.exports = { triageGraph };