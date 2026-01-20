// const express = require('express');
// const router = express.Router();
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// router.post('/send', auth, async (req, res) => {
//   // 1. Get userId from the AUTH middleware (Security fix)
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
//     // 2. Find existing chat or create a new one (Logic fix)
//     let chatRecord;
//     if (chatId) {
//       chatRecord = await Chat.findOne({ _id: chatId, userId: userId });
//     }
    
//     if (!chatRecord) {
//       chatRecord = new Chat({ userId: userId, messages: [] });
//     }

//     // 3. Prepare history for Gemini
//     const chatSession = model.startChat({
//       history: chatRecord.messages.map(m => ({ 
//         role: m.role, 
//         parts: m.parts 
//       })),
//     });

//     // 4. Get AI Response
//     const result = await chatSession.sendMessage(prompt);
//     const responseText = result.response.text();

//     // 5. Save both messages to MongoDB
//     chatRecord.messages.push({ role: "user", parts: [{ text: prompt }] });
//     chatRecord.messages.push({ role: "model", parts: [{ text: responseText }] });
//     await chatRecord.save();

//     // Return the answer and the chatId (important for the frontend to stay in the same thread)
//     res.json({ answer: responseText, chatId: chatRecord._id });
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     res.status(500).json({ error: "Failed to get AI response" });
//   }
// });

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // --- NEW: FETCH ALL CHATS FOR SIDEBAR ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     // Find all chats for this user, sorted by most recent first
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- NEW: FETCH SINGLE CHAT MESSAGES ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });

// // --- YOUR EXISTING SEND ROUTE ---
// router.post('/send', auth, async (req, res) => {
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
//     let chatRecord;
//     if (chatId) {
//       chatRecord = await Chat.findOne({ _id: chatId, userId: userId });
//     }
    
//     if (!chatRecord) {
//       chatRecord = new Chat({ userId: userId, messages: [] });
//     }

//     const chatSession = model.startChat({
//       history: chatRecord.messages.map(m => ({ 
//         role: m.role, 
//         parts: m.parts.map(p => ({ text: p.text })) // Mapping fix to ensure it's iterable
//       })),
//     });

//     const result = await chatSession.sendMessage(prompt);
//     const responseText = result.response.text();

//     chatRecord.messages.push({ role: "user", parts: [{ text: prompt }] });
//     chatRecord.messages.push({ role: "model", parts: [{ text: responseText }] });
//     await chatRecord.save();

//     res.json({ answer: responseText, chatId: chatRecord._id });
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     res.status(500).json({ error: "Failed to get AI response" });
//   }
// });

// module.exports = router;



// backend/routes/chat.js
// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');
// const { HumanMessage, AIMessage } = require('@langchain/core/messages');

// // 1. IMPORT YOUR NEW SMART GRAPH
// const { triageGraph } = require('../triage/graph'); 

// // --- FETCH ALL CHATS ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- FETCH SINGLE CHAT ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });

// // --- NEW SMART SEND ROUTE (USES LANGGRAPH) ---
// router.post('/send', auth, async (req, res) => {
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   console.log("📨 Received Message:", prompt);

//   try {
//     // 1. Get or Create Chat Record
//     let chatRecord;
//     if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
//     if (!chatRecord) chatRecord = new Chat({ userId, messages: [] });

//     // 2. Prepare Memory for LangGraph
//     // Convert Mongo DB messages to LangChain format
//     const history = chatRecord.messages.map(m => {
//       return m.role === "user" 
//         ? new HumanMessage(m.parts[0].text) 
//         : new AIMessage(m.parts[0].text);
//     });

//     const inputMessages = [...history, new HumanMessage(prompt)];

//     // 3. Load Saved "Medical Clipboard" from DB
//     const startState = {
//       messages: inputMessages,
//       symptom: chatRecord.symptom || null,
//       severity: chatRecord.severity || null,
//       duration: chatRecord.duration || null,
//       location: chatRecord.location || null,
//     };

//     console.log("🚦 Invoking Triage Graph...");

//     // 4. RUN THE GRAPH (This runs graph.js -> searchTools.js)
//     const finalState = await triageGraph.invoke(startState);
    
//     // 5. Get Bot Answer
//     const lastMessage = finalState.messages[finalState.messages.length - 1];
//     const botResponseText = lastMessage.content;

//     // 6. Save Updates to Database
//     chatRecord.messages.push({ role: "user", parts: [{ text: prompt }] });
//     chatRecord.messages.push({ role: "model", parts: [{ text: botResponseText }] });
    
//     // Save the medical details so the bot remembers next time
//     chatRecord.symptom = finalState.symptom;
//     chatRecord.severity = finalState.severity;
//     chatRecord.duration = finalState.duration;
//     chatRecord.location = finalState.location;

//     await chatRecord.save();

//     res.json({ answer: botResponseText, chatId: chatRecord._id });

//   } catch (error) {
//     console.error("❌ ROUTE ERROR:", error);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// });

// module.exports = router;











// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');
// const { HumanMessage, AIMessage } = require('@langchain/core/messages');
// const { triageGraph } = require('../triage/graph'); 

// // --- FETCH HISTORY ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- FETCH SINGLE CHAT ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });

// // --- SMART SEND ROUTE ---
// router.post('/send', auth, async (req, res) => {
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   console.log(`📨 REQ: "${prompt}" | ChatID: ${chatId || "NEW"}`);

//   try {
//     let chatRecord;
//     if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
//     if (!chatRecord) chatRecord = new Chat({ userId, messages: [] });

//     // 1. Setup Messages
//     const history = chatRecord.messages.map(m => 
//       m.role === "user" ? new HumanMessage(m.parts[0].text) : new AIMessage(m.parts[0].text)
//     );
//     const inputMessages = [...history, new HumanMessage(prompt)];

//     // 2. Load "Clipboard" from DB
//     const startState = {
//       messages: inputMessages,
//       symptom: chatRecord.symptom || null,
//       severity: chatRecord.severity || null,
//       duration: chatRecord.duration || null,
//       location: chatRecord.location || null,
//     };

//     // DEBUG LOG: Prove that we remembered the symptom
//     console.log("🔍 LOADED STATE FROM DB:", { 
//       symptom: startState.symptom, 
//       location: startState.location 
//     });

//     // 3. Run Graph
//     const finalState = await triageGraph.invoke(startState);
//     const botResponseText = finalState.messages[finalState.messages.length - 1].content;

//     // 4. Save Updates
//     chatRecord.messages.push({ role: "user", parts: [{ text: prompt }] });
//     chatRecord.messages.push({ role: "model", parts: [{ text: botResponseText }] });
    
//     // CRITICAL: Save the memory fields
//     chatRecord.symptom = finalState.symptom;
//     chatRecord.severity = finalState.severity;
//     chatRecord.duration = finalState.duration;
//     chatRecord.location = finalState.location;

//     await chatRecord.save();

//     res.json({ answer: botResponseText, chatId: chatRecord._id });

//   } catch (error) {
//     console.error("❌ ROUTE ERROR:", error);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// });

// // --- DELETE A CHAT ---
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     // 1. Find and Delete the chat (Security: Ensure it belongs to the user)
//     const result = await Chat.findOneAndDelete({ 
//       _id: req.params.id, 
//       userId: req.user.id 
//     });

//     if (!result) {
//       return res.status(404).json({ msg: "Chat not found or unauthorized" });
//     }

//     res.json({ msg: "Chat deleted successfully" });
//   } catch (error) {
//     console.error("Delete Error:", error);
//     res.status(500).json({ error: "Server Error" });
//   }
// });


// module.exports = router;




//safety lock
// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');
// const { HumanMessage, AIMessage } = require('@langchain/core/messages');
// const { triageGraph } = require('../triage/graph'); 
// const { logTransaction } = require('../utils/logger'); // Import logger for errors

// // --- FETCH HISTORY ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- FETCH SINGLE CHAT ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });

// // --- SMART SEND ROUTE ---
// router.post('/send', auth, async (req, res) => {
//   const start = Date.now();
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   console.log(`📨 REQ: "${prompt}" | ChatID: ${chatId || "NEW"}`);

//   try {
//     // 1. Load Chat
//     let chatRecord;
//     if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
//     if (!chatRecord) chatRecord = new Chat({ userId, messages: [] });

//     // 2. Setup Messages
//     const history = chatRecord.messages.map(m => 
//       m.role === "user" ? new HumanMessage(m.parts[0].text) : new AIMessage(m.parts[0].text)
//     );
//     const inputMessages = [...history, new HumanMessage(prompt)];

//     // 3. Load State (Including MODE)
//     const startState = {
//       messages: inputMessages,
//       symptom: chatRecord.symptom || null,
//       severity: chatRecord.severity || null,
//       duration: chatRecord.duration || null,
//       location: chatRecord.location || null,
//       mode: chatRecord.mode || "intake" // <--- CRITICAL: Load the lock state
//     };

//     // 4. Run Graph
//     const finalState = await triageGraph.invoke(startState);
//     const botResponseText = finalState.messages[finalState.messages.length - 1].content;

//     // 5. Save Updates
//     chatRecord.messages.push({ role: "user", parts: [{ text: prompt }] });
//     chatRecord.messages.push({ role: "model", parts: [{ text: botResponseText }] });
    
//     // Save Context & Lock
//     chatRecord.symptom = finalState.symptom;
//     chatRecord.severity = finalState.severity;
//     chatRecord.duration = finalState.duration;
//     chatRecord.location = finalState.location;
//     chatRecord.mode = finalState.mode; // <--- CRITICAL: Save the lock state

//     await chatRecord.save();

//     res.json({ answer: botResponseText, chatId: chatRecord._id });

//   } catch (error) {
//     console.error("❌ ROUTE ERROR:", error);
//     // Log system errors to file too
//     logTransaction("API_ERROR", userId, { input: prompt }, { error: error.message }, start);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// });

// // --- DELETE CHAT ---
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const result = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
//     if (!result) return res.status(404).json({ msg: "Chat not found" });
//     res.json({ msg: "Chat deleted" });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// module.exports = router;



















//UUID and Short Term Memory
// const { v4: uuidv4 } = require('uuid');
// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');
// const { HumanMessage, AIMessage } = require('@langchain/core/messages');
// const { triageGraph } = require('../triage/graph'); 
// const { logTransaction } = require('../utils/logger'); // Import logger for errors

// // --- FETCH HISTORY ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- FETCH SINGLE CHAT ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });


// // --- SMART SEND ROUTE ---
// router.post('/send', auth, async (req, res) => {
//   const start = Date.now();
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   // 1. ✅ GENERATE TRANSACTION ID
//   const transactionId = uuidv4();

//   console.log(`📨 [${transactionId}] REQ: "${prompt}"`);

//   try {
//     let chatRecord;
//     if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
//     if (!chatRecord) chatRecord = new Chat({ userId, messages: [] });

//     // 2. ✅ SHORT-TERM MEMORY (The "Slice")
//     // Only take the last 10 messages for context
//     const MEMORY_WINDOW = 10;
//     const recentMessages = chatRecord.messages.slice(-MEMORY_WINDOW);
    
//     const history = recentMessages.map(m => 
//       m.role === "user" ? new HumanMessage(m.parts[0].text) : new AIMessage(m.parts[0].text)
//     );
//     const inputMessages = [...history, new HumanMessage(prompt)];

//     const startState = {
//       messages: inputMessages,
//       symptom: chatRecord.symptom || null,
//       severity: chatRecord.severity || null,
//       duration: chatRecord.duration || null,
//       location: chatRecord.location || null,
//       mode: chatRecord.mode || "intake",
//       transactionId: transactionId
      
//     };

//     // 3. Run Graph
//     const finalState = await triageGraph.invoke(startState);
//     const botResponseText = finalState.messages[finalState.messages.length - 1].content;

//     // 4. Save Updates (With Transaction ID)
//     chatRecord.messages.push({ 
//         role: "user", 
//         parts: [{ text: prompt }],
//         transactionId: transactionId // 👈 Saved in DB
//     });
    
//     chatRecord.messages.push({ 
//         role: "model", 
//         parts: [{ text: botResponseText }],
//         transactionId: transactionId // 👈 Saved in DB
//     });
    
//     chatRecord.symptom = finalState.symptom;
//     chatRecord.severity = finalState.severity;
//     chatRecord.duration = finalState.duration;
//     chatRecord.location = finalState.location;
//     chatRecord.mode = finalState.mode;

//     await chatRecord.save();

//     // 5. ✅ LOG WITH ID
//     logTransaction(
//         transactionId, 
//         "FINAL_RESPONSE", 
//         userId, 
//         { prompt }, 
//         { response: botResponseText }, 
//         start
//     );

//     res.json({ answer: botResponseText, chatId: chatRecord._id });

//   } catch (error) {
//     console.error(`❌ [${transactionId}] ERROR:`, error);
//     logTransaction(transactionId, "API_ERROR", userId, { input: prompt }, { error: error.message }, start);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// });

// // --- DELETE CHAT ---
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const result = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
//     if (!result) return res.status(404).json({ msg: "Chat not found" });
//     res.json({ msg: "Chat deleted" });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// module.exports = router;

//guarded rails to prevent pii from getting logged
// routes/chat.js

// UUID and Short Term Memory
// const { v4: uuidv4 } = require('uuid');
// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');
// const { HumanMessage, AIMessage } = require('@langchain/core/messages');
// const { triageGraph } = require('../triage/graph'); 
// const { logTransaction } = require('../utils/logger'); 

// // --- 1. FETCH HISTORY ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- 2. FETCH SINGLE CHAT ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });

// // --- 3. SMART SEND ROUTE (SECURE) ---
// router.post('/send', auth, async (req, res) => {
//   const start = Date.now();
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   // Generate Transaction ID
//   const transactionId = uuidv4();

//   // 🔒 Log securely (Hide raw input to prevent PII leak in console)
//   console.log(`📨 [${transactionId}] REQ: (Processing Input...)`);

//   try {
//     // A. Retrieve or Create Chat
//     let chatRecord;
//     if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
//     if (!chatRecord) chatRecord = new Chat({ userId, messages: [] });

//     // B. Short-Term Memory Slice (Context Window)
//     const MEMORY_WINDOW = 10;
//     const recentMessages = chatRecord.messages.slice(-MEMORY_WINDOW);
    
//     // Convert DB messages to LangChain format
//     const history = recentMessages.map(m => 
//       m.role === "user" ? new HumanMessage(m.parts[0].text) : new AIMessage(m.parts[0].text)
//     );
    
//     // Add current raw prompt to the inputs for the Graph
//     const inputMessages = [...history, new HumanMessage(prompt)];

//     const startState = {
//       messages: inputMessages,
//       symptom: chatRecord.symptom || null,
//       severity: chatRecord.severity || null,
//       duration: chatRecord.duration || null,
//       location: chatRecord.location || null,
//       mode: chatRecord.mode || "intake",
//       transactionId: transactionId,
//       user_language: chatRecord.user_language || "english" // Persist language if saved
//     };

//     // C. RUN THE GRAPH (Guardrails & Agents)
//     const finalState = await triageGraph.invoke(startState);

//     // --- 🚨 SECURITY FIX START 🚨 ---
//     // Instead of saving the raw 'prompt', we extract the processed text from the Graph.
//     // The Guardrail Node has likely updated the HumanMessage to replace PII.
    
//     const botResponseText = finalState.messages[finalState.messages.length - 1].content;
    
//     // Find the most recent Human Message in the final state
//     const allMessages = finalState.messages;
//     const lastHumanMessage = allMessages.slice().reverse().find(m => m._getType() === "human");
    
//     // If the Guardrail scrubbed it, this will be "[PHONE_REDACTED]".
//     const scrubbedPrompt = lastHumanMessage ? lastHumanMessage.content : prompt;
//     // --- 🚨 SECURITY FIX END 🚨 ---

//     // D. SAVE TO DATABASE (Using Clean Data)
//     chatRecord.messages.push({ 
//         role: "user", 
//         parts: [{ text: scrubbedPrompt }], // ✅ Saved as Safe Text
//         transactionId: transactionId 
//     });
    
//     chatRecord.messages.push({ 
//         role: "model", 
//         parts: [{ text: botResponseText }],
//         transactionId: transactionId 
//     });
    
//     // Update State Fields
//     chatRecord.symptom = finalState.symptom;
//     chatRecord.severity = finalState.severity;
//     chatRecord.duration = finalState.duration;
//     chatRecord.location = finalState.location;
//     chatRecord.mode = finalState.mode;
    
//     // Optional: Save detected language if you added it to schema
//     if (finalState.user_language) chatRecord.user_language = finalState.user_language; 

//     await chatRecord.save();

//     // E. LOG TRANSACTION (Using Clean Data)
//     logTransaction(
//         transactionId, 
//         "FINAL_RESPONSE", 
//         userId, 
//         { prompt: scrubbedPrompt }, // ✅ Logged as Safe Text
//         { response: botResponseText }, 
//         start
//     );

//     res.json({ answer: botResponseText, chatId: chatRecord._id });

//   } catch (error) {
//     console.error(`❌ [${transactionId}] ERROR:`, error);
//     // Log error but avoid logging raw prompt if possible
//     logTransaction(transactionId, "API_ERROR", userId, { input: "Error processing input" }, { error: error.message }, start);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// });

// // --- 4. DELETE CHAT ---
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const result = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
//     if (!result) return res.status(404).json({ msg: "Chat not found" });
//     res.json({ msg: "Chat deleted" });
//   } catch (error) {
//     res.status(500).json({ error: "Server Error" });
//   }
// });

// module.exports = router;


//reddis
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/authMiddleware');
// Import all message types needed for reconstruction
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');
const { triageGraph } = require('../triage/graph'); 
const { logTransaction } = require('../utils/logger'); 

// 🔴 REDIS SETUP (Manual Connection)
// This connects directly to your Docker container without the buggy library
const Redis = require("ioredis");
const redis = new Redis("redis://localhost:6379"); 

redis.on("connect", () => console.log("✅ Redis Connected (Manual Mode)"));
redis.on("error", (err) => console.error("❌ Redis Connection Error:", err));

// --- HELPER: Reconstruct Messages from JSON ---
// Redis stores text strings. We need to turn them back into LangChain Classes 
// so the Graph understands them (e.g., who said what).
function reconstructMessages(jsonMessages) {
    if (!jsonMessages) return [];
    return jsonMessages.map(m => {
        // Extract content and type safely
        const content = m.kwargs ? m.kwargs.content : m.content; 
        const type = m.id ? m.id[m.id.length - 1] : (m.type || "unknown");

        if (type === "HumanMessage" || m.role === "user") return new HumanMessage(content);
        if (type === "AIMessage" || m.role === "assistant" || m.role === "model") return new AIMessage(content);
        if (type === "SystemMessage") return new SystemMessage(content);
        
        // Default fallback
        return new HumanMessage(content); 
    });
}

// --- 1. FETCH HISTORY (Unchanged) ---
router.get('/history', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// --- 2. FETCH SINGLE CHAT (Unchanged) ---
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ msg: "Chat not found" });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// --- 3. SMART SEND ROUTE (MANUAL REDIS) ---
router.post('/send', auth, async (req, res) => {
  const start = Date.now();
  const userId = req.user.id; 
  const { prompt, chatId } = req.body; 

  const transactionId = uuidv4();
  console.log(`📨 [${transactionId}] REQ: (Processing Input...)`);

  try {
    // A. SETUP MONGODB (For History UI)
    // We always keep Mongo for the "History Tab" in the frontend
    let chatRecord;
    if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
    if (!chatRecord) {
        chatRecord = new Chat({ userId, messages: [] });
        await chatRecord.save();
    }
    const currentChatId = chatRecord._id.toString();

    // B. LOAD STATE FROM REDIS 🐘
    // We manually ask Redis: "Do you have a brain saved for this chat ID?"
    const redisKey = `chat_state:${currentChatId}`;
    const rawState = await redis.get(redisKey);
    
    // Default empty state for new users
    let currentState = {
        messages: [],
        symptom: null, severity: null, duration: null, location: null,
        mode: "intake", user_language: "english"
    };

    // If we found data in Redis, parse it and restore the Message Classes
    if (rawState) {
        const parsed = JSON.parse(rawState);
        currentState = {
            ...parsed,
            messages: reconstructMessages(parsed.messages) 
        };
    }

    // C. UPDATE STATE WITH NEW INPUT
    // We add the user's new message to the existing history
    const inputs = {
        ...currentState, // Keep old symptoms/severity
        messages: [...currentState.messages, new HumanMessage(prompt)]
    };

    // D. RUN GRAPH (Stateless Mode)
    // We feed the FULL history into the graph. It processes it and returns the result.
    // Note: Your graph.js must be compiled WITHOUT a checkpointer for this to work.
    const finalState = await triageGraph.invoke(inputs);

    // E. SAVE STATE TO REDIS 🐘
    // We verify valid output, then save the NEW state back to Redis for next time.
    if (finalState && finalState.messages) {
        await redis.set(redisKey, JSON.stringify(finalState));
    }

    // --- F. LOGGING & MONGO SYNC (For Frontend UI) ---
    const allMessages = finalState.messages;
    
    // Get Bot Response
    const botResponseText = allMessages[allMessages.length - 1].content;
    
    // Get Scrubbed User Input (Find the last Human Message the graph processed)
    const lastHumanMessage = allMessages.slice().reverse().find(m => m._getType() === "human");
    const scrubbedPrompt = lastHumanMessage ? lastHumanMessage.content : prompt;

    // Save to Mongo (Visual History)
    chatRecord.messages.push({ role: "user", parts: [{ text: scrubbedPrompt }], transactionId });
    chatRecord.messages.push({ role: "model", parts: [{ text: botResponseText }], transactionId });
    
    // Save Metadata
    chatRecord.symptom = finalState.symptom;
    chatRecord.severity = finalState.severity;
    chatRecord.duration = finalState.duration;
    chatRecord.location = finalState.location;
    chatRecord.mode = finalState.mode;
    
    // Save Language Preference
    if (finalState.user_language) chatRecord.user_language = finalState.user_language;

    await chatRecord.save();

    // Log to Console/File
    logTransaction(
        transactionId, "FINAL_RESPONSE", userId, 
        { prompt: scrubbedPrompt }, { response: botResponseText }, start
    );

    res.json({ answer: botResponseText, chatId: currentChatId });

  } catch (error) {
    console.error(`❌ [${transactionId}] ERROR:`, error);
    res.status(500).json({ error: "Failed to process message" });
  }
});

// --- 4. DELETE CHAT (Manual Redis Cleanup) ---
router.delete('/:id', auth, async (req, res) => {
  try {
    // Delete from MongoDB
    const result = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ msg: "Chat not found" });

    // Delete from Redis (Clean up the brain memory too)
    const redisKey = `chat_state:${req.params.id}`;
    await redis.del(redisKey);

    res.json({ msg: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;