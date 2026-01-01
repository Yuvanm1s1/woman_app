const mongoose = require('mongoose');
const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'model'], required: true },
      parts: [{ text: { type: String, required: true } }]
    }
  ],
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Chat', ChatSchema);