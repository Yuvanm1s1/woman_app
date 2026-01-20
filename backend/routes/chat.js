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
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/authMiddleware');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { triageGraph } = require('../triage/graph'); 
const { logTransaction } = require('../utils/logger'); 

// --- 1. FETCH HISTORY ---
router.get('/history', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// --- 2. FETCH SINGLE CHAT ---
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ msg: "Chat not found" });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// --- 3. SMART SEND ROUTE (SECURE) ---
router.post('/send', auth, async (req, res) => {
  const start = Date.now();
  const userId = req.user.id; 
  const { prompt, chatId } = req.body; 

  // Generate Transaction ID
  const transactionId = uuidv4();

  // 🔒 Log securely (Hide raw input to prevent PII leak in console)
  console.log(`📨 [${transactionId}] REQ: (Processing Input...)`);

  try {
    // A. Retrieve or Create Chat
    let chatRecord;
    if (chatId) chatRecord = await Chat.findOne({ _id: chatId, userId });
    if (!chatRecord) chatRecord = new Chat({ userId, messages: [] });

    // B. Short-Term Memory Slice (Context Window)
    const MEMORY_WINDOW = 10;
    const recentMessages = chatRecord.messages.slice(-MEMORY_WINDOW);
    
    // Convert DB messages to LangChain format
    const history = recentMessages.map(m => 
      m.role === "user" ? new HumanMessage(m.parts[0].text) : new AIMessage(m.parts[0].text)
    );
    
    // Add current raw prompt to the inputs for the Graph
    const inputMessages = [...history, new HumanMessage(prompt)];

    const startState = {
      messages: inputMessages,
      symptom: chatRecord.symptom || null,
      severity: chatRecord.severity || null,
      duration: chatRecord.duration || null,
      location: chatRecord.location || null,
      mode: chatRecord.mode || "intake",
      transactionId: transactionId,
      user_language: chatRecord.user_language || "english" // Persist language if saved
    };

    // C. RUN THE GRAPH (Guardrails & Agents)
    const finalState = await triageGraph.invoke(startState);

    // --- 🚨 SECURITY FIX START 🚨 ---
    // Instead of saving the raw 'prompt', we extract the processed text from the Graph.
    // The Guardrail Node has likely updated the HumanMessage to replace PII.
    
    const botResponseText = finalState.messages[finalState.messages.length - 1].content;
    
    // Find the most recent Human Message in the final state
    const allMessages = finalState.messages;
    const lastHumanMessage = allMessages.slice().reverse().find(m => m._getType() === "human");
    
    // If the Guardrail scrubbed it, this will be "[PHONE_REDACTED]".
    const scrubbedPrompt = lastHumanMessage ? lastHumanMessage.content : prompt;
    // --- 🚨 SECURITY FIX END 🚨 ---

    // D. SAVE TO DATABASE (Using Clean Data)
    chatRecord.messages.push({ 
        role: "user", 
        parts: [{ text: scrubbedPrompt }], // ✅ Saved as Safe Text
        transactionId: transactionId 
    });
    
    chatRecord.messages.push({ 
        role: "model", 
        parts: [{ text: botResponseText }],
        transactionId: transactionId 
    });
    
    // Update State Fields
    chatRecord.symptom = finalState.symptom;
    chatRecord.severity = finalState.severity;
    chatRecord.duration = finalState.duration;
    chatRecord.location = finalState.location;
    chatRecord.mode = finalState.mode;
    
    // Optional: Save detected language if you added it to schema
    if (finalState.user_language) chatRecord.user_language = finalState.user_language; 

    await chatRecord.save();

    // E. LOG TRANSACTION (Using Clean Data)
    logTransaction(
        transactionId, 
        "FINAL_RESPONSE", 
        userId, 
        { prompt: scrubbedPrompt }, // ✅ Logged as Safe Text
        { response: botResponseText }, 
        start
    );

    res.json({ answer: botResponseText, chatId: chatRecord._id });

  } catch (error) {
    console.error(`❌ [${transactionId}] ERROR:`, error);
    // Log error but avoid logging raw prompt if possible
    logTransaction(transactionId, "API_ERROR", userId, { input: "Error processing input" }, { error: error.message }, start);
    res.status(500).json({ error: "Failed to process message" });
  }
});

// --- 4. DELETE CHAT ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ msg: "Chat not found" });
    res.json({ msg: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;


//reddis
// const { v4: uuidv4 } = require('uuid');
// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat');
// const auth = require('../middleware/authMiddleware');
// const { HumanMessage } = require('@langchain/core/messages');
// const { triageGraph } = require('../triage/graph'); 
// const { logTransaction } = require('../utils/logger'); 

// // --- 1. FETCH HISTORY (Unchanged) ---
// router.get('/history', auth, async (req, res) => {
//   try {
//     const chats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//   }
// });

// // --- 2. FETCH SINGLE CHAT (Unchanged) ---
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
//     if (!chat) return res.status(404).json({ msg: "Chat not found" });
//     res.json(chat);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch chat" });
//   }
// });

// // --- 3. SMART SEND ROUTE (REDIS ENABLED) ---
// router.post('/send', auth, async (req, res) => {
//   const start = Date.now();
//   const userId = req.user.id; 
//   const { prompt, chatId } = req.body; 

//   const transactionId = uuidv4();
//   console.log(`📨 [${transactionId}] REQ: (Processing Input...)`);

//   try {
//     // A. Retrieve or Create Chat (For UI History only)
//     let chatRecord;
    
//     // If chatId is passed, use it. If not, create new.
//     // This chatId will ALSO serve as our Redis "thread_id"
//     if (chatId) {
//         chatRecord = await Chat.findOne({ _id: chatId, userId });
//     }
    
//     if (!chatRecord) {
//         // New conversation
//         chatRecord = new Chat({ userId, messages: [] });
//         await chatRecord.save(); // Save immediately to get the _id
//     }

//     const currentChatId = chatRecord._id.toString();

//     // B. PREPARE CONFIG FOR REDIS
//     // We do NOT need to fetch 'recentMessages' anymore. Redis has them.
//     const config = {
//         configurable: { 
//             thread_id: currentChatId, // 🔑 This connects the user to their saved state in Redis
//             user_language: chatRecord.user_language || "english"
//         }
//     };

//     // C. RUN THE GRAPH
//     // We only send the NEW message. Redis appends it to history automatically.
//     const finalState = await triageGraph.invoke(
//         { messages: [new HumanMessage(prompt)] }, 
//         config
//     );

//     // --- 🚨 SECURITY & LOGGING ---
//     const allMessages = finalState.messages;
    
//     // 1. Get Bot Response
//     const botResponseText = allMessages[allMessages.length - 1].content;
    
//     // 2. Get Scrubbed User Input (Find the last Human Message the graph actually processed)
//     const lastHumanMessage = allMessages.slice().reverse().find(m => m._getType() === "human");
//     const scrubbedPrompt = lastHumanMessage ? lastHumanMessage.content : prompt;

//     // D. SYNC TO MONGODB (For History Tab)
//     // Even though Redis remembers state, we save text to Mongo so the user can see it later in the UI.
//     chatRecord.messages.push({ 
//         role: "user", 
//         parts: [{ text: scrubbedPrompt }], 
//         transactionId: transactionId 
//     });
    
//     chatRecord.messages.push({ 
//         role: "model", 
//         parts: [{ text: botResponseText }],
//         transactionId: transactionId 
//     });
    
//     // Sync Metadata (So Mongo reflects the Graph's internal state)
//     chatRecord.symptom = finalState.symptom;
//     chatRecord.severity = finalState.severity;
//     chatRecord.duration = finalState.duration;
//     chatRecord.location = finalState.location;
//     chatRecord.mode = finalState.mode;
    
//     if (finalState.user_language) chatRecord.user_language = finalState.user_language; 

//     await chatRecord.save();

//     // E. LOG TRANSACTION
//     logTransaction(
//         transactionId, "FINAL_RESPONSE", userId, 
//         { prompt: scrubbedPrompt }, { response: botResponseText }, start
//     );

//     res.json({ answer: botResponseText, chatId: currentChatId });

//   } catch (error) {
//     console.error(`❌ [${transactionId}] ERROR:`, error);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// });

// // --- 4. DELETE CHAT (Unchanged) ---
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