const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const auth = require('../middleware/authMiddleware');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/send', auth, async (req, res) => {
  // 1. Get userId from the AUTH middleware (Security fix)
  const userId = req.user.id; 
  const { prompt, chatId } = req.body; 

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // 2. Find existing chat or create a new one (Logic fix)
    let chatRecord;
    if (chatId) {
      chatRecord = await Chat.findOne({ _id: chatId, userId: userId });
    }
    
    if (!chatRecord) {
      chatRecord = new Chat({ userId: userId, messages: [] });
    }

    // 3. Prepare history for Gemini
    const chatSession = model.startChat({
      history: chatRecord.messages.map(m => ({ 
        role: m.role, 
        parts: m.parts 
      })),
    });

    // 4. Get AI Response
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    // 5. Save both messages to MongoDB
    chatRecord.messages.push({ role: "user", parts: [{ text: prompt }] });
    chatRecord.messages.push({ role: "model", parts: [{ text: responseText }] });
    await chatRecord.save();

    // Return the answer and the chatId (important for the frontend to stay in the same thread)
    res.json({ answer: responseText, chatId: chatRecord._id });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;