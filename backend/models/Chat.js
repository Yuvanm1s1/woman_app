// const mongoose = require('mongoose');
// const ChatSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   messages: [
//     {
//       role: { type: String, enum: ['user', 'model'], required: true },
//       parts: [{ text: { type: String, required: true } }]
//     }
//   ],
//   timestamp: { type: Date, default: Date.now }
// });
// module.exports = mongoose.model('Chat', ChatSchema);


const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // --- 🆕 NEW MEMORY FIELDS (This is what was missing!) ---
  symptom: { type: String, default: null },
  severity: { type: String, default: null },
  duration: { type: String, default: null },
  location: { type: String, default: null },
  // -------------------------------------------------------
  messages: [
    {
      role: { type: String, required: true },
      parts: [{ text: { type: String, required: true } }],
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);