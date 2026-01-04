// import { useState, useEffect, useContext, useRef } from "react";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";

// export default function Chat() {
//   const { token, logout } = useContext(AuthContext);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatId, setChatId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Auto-scroll to bottom whenever messages change
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || loading) return;

//     const userMsg = { role: "user", parts: [{ text: input }] };
//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);
//     const currentInput = input;
//     setInput("");

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/chat/send",
//         { prompt: currentInput, chatId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages((prev) => [
//         ...prev,
//         { role: "model", parts: [{ text: res.data.answer }] },
//       ]);
//       setChatId(res.data.chatId);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to get response from AI");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-zinc-950 text-zinc-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4 hidden md:flex">
//         <button 
//           onClick={() => { setMessages([]); setChatId(null); }}
//           className="w-full p-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition mb-4 text-left"
//         >
//           + New Chat
//         </button>
//         <div className="flex-1 overflow-y-auto">
//           {/* We will map chat history here later */}
//           <p className="text-zinc-500 text-sm italic">Previous chats...</p>
//         </div>
//         <button onClick={logout} className="p-2 text-zinc-400 hover:text-white text-sm">Logout</button>
//       </aside>

//       {/* Main Chat Area */}
//       <main className="flex-1 flex flex-col">
//         <header className="p-4 border-b border-zinc-800 text-center font-semibold">
//           Gemini Assistant
//         </header>

//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg, i) => (
//             <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//               <div className={`max-w-[80%] p-3 rounded-2xl ${
//                 msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-zinc-800 text-zinc-100 rounded-bl-none"
//               }`}>
//                 {msg.parts[0].text}
//               </div>
//             </div>
//           ))}
//           {loading && <div className="text-zinc-500 animate-pulse">AI is thinking...</div>}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Bar */}
//         <form onSubmit={handleSend} className="p-4 bg-zinc-950">
//           <div className="max-w-3xl mx-auto relative">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask anything..."
//               className="w-full p-4 bg-zinc-900 rounded-xl border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
//             />
//             <button className="absolute right-3 top-3 p-1.5 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
//               ↑
//             </button>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }



// import { useState, useEffect, useContext, useRef } from "react";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";

// export default function Chat() {
//   const { token, logout } = useContext(AuthContext);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatId, setChatId] = useState(null); // Current active chat
//   const [history, setHistory] = useState([]); // List for the sidebar
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // 1. Fetch Sidebar History on Load
//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/chat/history", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHistory(res.data);
//     } catch (err) {
//       console.error("Error fetching history", err);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, [chatId]); // Refetch list when a new chat is created

//   // 2. Load a specific chat when clicked from sidebar
//   const loadChat = async (id) => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/chat/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMessages(res.data.messages);
//       setChatId(id);
//     } catch (err) {
//       alert("Could not load chat");
//     }
//   };

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || loading) return;

//     const userMsg = { role: "user", parts: [{ text: input }] };
//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);
//     const currentInput = input;
//     setInput("");

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/chat/send",
//         { prompt: currentInput, chatId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages((prev) => [...prev, { role: "model", parts: [{ text: res.data.answer }] }]);
      
//       // If this was a brand new chat, set the ID so the sidebar updates
//       if (!chatId) {
//         setChatId(res.data.chatId);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-zinc-950 text-zinc-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4">
//         <button 
//           onClick={() => { setMessages([]); setChatId(null); }}
//           className="w-full p-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition mb-6 font-bold"
//         >
//           + New Chat
//         </button>

//         <div className="flex-1 overflow-y-auto space-y-2">
//           <p className="text-zinc-500 text-xs uppercase font-bold px-2 mb-2">Your Conversations</p>
//           {history.map((chat) => (
//             <button
//               key={chat._id}
//               onClick={() => loadChat(chat._id)}
//               className={`w-full p-3 text-left text-sm rounded-lg transition truncate ${
//                 chatId === chat._id ? "bg-zinc-800 border border-zinc-700" : "hover:bg-zinc-800 text-zinc-400"
//               }`}
//             >
//               {chat.messages[0]?.parts[0]?.text || "New Conversation"}
//             </button>
//           ))}
//         </div>
        
//         <button onClick={logout} className="mt-4 p-2 text-zinc-500 hover:text-red-400 text-sm border-t border-zinc-800 pt-4">
//           Logout
//         </button>
//       </aside>

//       {/* Main Chat Area */}
//       <main className="flex-1 flex flex-col relative">
//         <div className="flex-1 overflow-y-auto p-6 space-y-6">
//           {messages.length === 0 && (
//             <div className="h-full flex items-center justify-center text-zinc-600 text-xl">
//               How can I help you today?
//             </div>
//           )}
//           {messages.map((msg, i) => (
//             <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//               <div className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
//                 msg.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-200 border border-zinc-700"
//               }`}>
//                 {msg.parts[0].text}
//               </div>
//             </div>
//           ))}
//           {loading && <div className="text-blue-400 animate-pulse px-4">Gemini is typing...</div>}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input */}
//         <form onSubmit={handleSend} className="p-6 bg-gradient-to-t from-zinc-950">
//           <div className="max-w-3xl mx-auto flex gap-2">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Message Gemini..."
//               className="flex-1 p-4 bg-zinc-900 rounded-xl border border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//             <button className="p-4 bg-blue-600 rounded-xl hover:bg-blue-500 transition font-bold">Send</button>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }



// import { useState, useEffect, useContext, useRef } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom"; // Added useNavigate
// import axios from "axios";
// import { 
//   Send, 
//   Plus, 
//   MessageSquare, 
//   LogOut, 
//   Bot, 
//   User, 
//   MoreVertical,
//   ArrowLeft, // Added Icon
//   Home       // Added Icon
// } from "lucide-react"; 

// export default function Chat() {
//   const { token, logout } = useContext(AuthContext);
//   const navigate = useNavigate(); // Hook for navigation
  
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatId, setChatId] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // 1. Fetch History
//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/chat/history", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHistory(res.data);
//     } catch (err) {
//       console.error("Error fetching history", err);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, [chatId]);

//   // 2. Load Specific Chat
//   const loadChat = async (id) => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/chat/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMessages(res.data.messages);
//       setChatId(id);
//     } catch (err) {
//       alert("Could not load chat");
//     }
//   };

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || loading) return;

//     const userMsg = { role: "user", parts: [{ text: input }] };
//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);
//     const currentInput = input;
//     setInput("");

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/chat/send",
//         { prompt: currentInput, chatId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages((prev) => [...prev, { role: "model", parts: [{ text: res.data.answer }] }]);
      
//       if (!chatId) {
//         setChatId(res.data.chatId);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
//       {/* --- SIDEBAR (Desktop) --- */}
//       <aside className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20 shadow-sm">
        
//         {/* Header Area */}
//         <div className="p-6 border-b border-gray-100">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="bg-purple-100 p-2 rounded-lg">
//               <Bot className="w-6 h-6 text-purple-600" />
//             </div>
//             <span className="font-bold text-xl text-gray-800 tracking-tight">AI Health Assistant</span>
//           </div>

//           <button 
//             onClick={() => { setMessages([]); setChatId(null); }}
//             className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 font-semibold"
//           >
//             <Plus size={18} />
//             New Consultation
//           </button>
//         </div>

//         {/* Chat History List */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-2">
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">History</p>
//           {history.length === 0 && (
//             <p className="text-sm text-gray-400 px-3 italic">No previous chats yet.</p>
//           )}
//           {history.map((chat) => (
//             <button
//               key={chat._id}
//               onClick={() => loadChat(chat._id)}
//               className={`w-full flex items-center gap-3 p-3 text-left text-sm rounded-xl transition-all duration-200 ${
//                 chatId === chat._id 
//                   ? "bg-purple-50 text-purple-700 font-medium ring-1 ring-purple-100" 
//                   : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               <MessageSquare size={16} className={chatId === chat._id ? "text-purple-600" : "text-gray-400"} />
//               <span className="truncate">{chat.messages[0]?.parts[0]?.text || "New Conversation"}</span>
//             </button>
//           ))}
//         </div>
        
//         {/* Footer: Home & Logout */}
//         <div className="p-4 border-t border-gray-100 space-y-2">
          
//           {/* NEW: Back to Home Button */}
//           <button 
//             onClick={() => navigate("/home")} 
//             className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition text-sm font-medium"
//           >
//             <Home size={18} />
//             Back to Home
//           </button>

//           <button 
//             onClick={logout} 
//             className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition text-sm font-medium"
//           >
//             <LogOut size={18} />
//             Sign Out
//           </button>
//         </div>
//       </aside>


//       {/* --- MAIN CHAT AREA --- */}
//       <main className="flex-1 flex flex-col relative bg-gray-50">
        
//         {/* Chat Header */}
//         <header className="bg-white p-4 px-6 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
//           <div className="flex items-center gap-3">
            
//             {/* NEW: Mobile Back Button (Also useful on desktop to quickly exit) */}
//             <button 
//               onClick={() => navigate("/")}
//               className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
//               title="Back to Home"
//             >
//               <ArrowLeft size={20} />
//             </button>

//             <div className="relative">
//               <div className="bg-purple-100 p-2 rounded-full">
//                 <Bot size={20} className="text-purple-600" />
//               </div>
//               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-800">Dr. AI Assistant</h3>
//               <p className="text-xs text-green-600 font-medium">Online • Ready to help</p>
//             </div>
//           </div>
//           <button className="text-gray-400 hover:text-gray-600">
//             <MoreVertical size={20} />
//           </button>
//         </header>

//         {/* Messages Container */}
//         <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
//           {messages.length === 0 && (
//             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-0 animate-fadeIn" style={{opacity: 1}}>
//               <div className="bg-white p-6 rounded-full shadow-md mb-2">
//                 <Bot size={48} className="text-purple-500" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-800">How can I help you today?</h2>
//               <p className="text-gray-500 max-w-md">
//                 I can help clarify symptoms, suggest wellness tips, or just listen. 
//                 <br/> <span className="text-xs text-gray-400">(Not a replacement for professional medical advice)</span>
//               </p>
//             </div>
//           )}

//           {messages.map((msg, i) => (
//             <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//               {/* AI Avatar */}
//               {msg.role === "model" && (
//                 <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
//                   <Bot size={16} className="text-purple-600" />
//                 </div>
//               )}

//               <div 
//                 className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
//                   msg.role === "user" 
//                     ? "bg-purple-600 text-white rounded-br-none" 
//                     : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
//                 }`}
//               >
//                 {msg.parts[0].text}
//               </div>

//               {/* User Avatar */}
//               {msg.role === "user" && (
//                 <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0 mt-1">
//                   <User size={16} className="text-purple-700" />
//                 </div>
//               )}
//             </div>
//           ))}
          
//           {loading && (
//             <div className="flex justify-start gap-4 animate-pulse">
//                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
//                   <Bot size={16} className="text-gray-400" />
//                </div>
//                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 text-gray-400 text-sm">
//                  Thinking...
//                </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-6 bg-white border-t border-gray-100">
//           <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-4">
//             <div className="flex-1 relative">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Type your health concern..."
//                 className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-gray-700 transition-all placeholder-gray-400"
//               />
//             </div>
//             <button 
//               disabled={loading || !input.trim()}
//               className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:scale-105 active:scale-95"
//             >
//               <Send size={20} />
//             </button>
//           </form>
//           <p className="text-center text-xs text-gray-400 mt-3">
//             AI can make mistakes. Please verify important medical information.
//           </p>
//         </div>

//       </main>
//     </div>
//   );
// }




// import { useState, useEffect, useContext, useRef } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { 
//   Send, 
//   Plus, 
//   MessageSquare, 
//   LogOut, 
//   Bot, 
//   User, 
//   MoreVertical,
//   ArrowLeft,
//   Home,
//   Mic,          // New Icon
//   Square,       // New Icon (Stop)
//   Loader2       // New Icon (Loading)
// } from "lucide-react"; 

// export default function Chat() {
//   const { token, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
  
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatId, setChatId] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // --- VOICE RECORDER STATE ---
//   const [isRecording, setIsRecording] = useState(false);
//   const [isTranscribing, setIsTranscribing] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   // ---------------------------

//   const messagesEndRef = useRef(null);

//   // 1. Fetch History
//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/chat/history", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHistory(res.data);
//     } catch (err) {
//       console.error("Error fetching history", err);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, [chatId]);

//   // 2. Load Specific Chat
//   const loadChat = async (id) => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/chat/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMessages(res.data.messages);
//       setChatId(id);
//     } catch (err) {
//       alert("Could not load chat");
//     }
//   };

//   // --- VOICE FUNCTIONS ---
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = handleVoiceProcess;
//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//     } catch (err) {
//       console.error("Microphone Error:", err);
//       alert("Could not access microphone.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const handleVoiceProcess = async () => {
//     setIsTranscribing(true);
//     const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//     const formData = new FormData();
//     formData.append("audio", audioBlob, "voice_note.wav");

//     try {
//       // Sending to Python Service on Port 5001
//       const res = await axios.post("http://localhost:5001/transcribe", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       // Append transcribed text to current input
//       const newText = res.data.text;
//       setInput((prev) => (prev ? prev + " " + newText : newText));
      
//     } catch (err) {
//       console.error("Transcription Failed:", err);
//       alert("Failed to transcribe audio. Is the Python server running?");
//     } finally {
//       setIsTranscribing(false);
//     }
//   };
//   // -----------------------

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || loading) return;

//     const userMsg = { role: "user", parts: [{ text: input }] };
//     setMessages((prev) => [...prev, userMsg]);
//     setLoading(true);
//     const currentInput = input;
//     setInput("");

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/chat/send",
//         { prompt: currentInput, chatId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages((prev) => [...prev, { role: "model", parts: [{ text: res.data.answer }] }]);
      
//       if (!chatId) {
//         setChatId(res.data.chatId);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
//       {/* --- SIDEBAR (Desktop) --- */}
//       <aside className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20 shadow-sm">
//         <div className="p-6 border-b border-gray-100">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="bg-purple-100 p-2 rounded-lg">
//               <Bot className="w-6 h-6 text-purple-600" />
//             </div>
//             <span className="font-bold text-xl text-gray-800 tracking-tight">AI Health Assistant</span>
//           </div>

//           <button 
//             onClick={() => { setMessages([]); setChatId(null); }}
//             className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 font-semibold"
//           >
//             <Plus size={18} />
//             New Consultation
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-2">
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">History</p>
//           {history.map((chat) => (
//             <button
//               key={chat._id}
//               onClick={() => loadChat(chat._id)}
//               className={`w-full flex items-center gap-3 p-3 text-left text-sm rounded-xl transition-all duration-200 ${
//                 chatId === chat._id 
//                   ? "bg-purple-50 text-purple-700 font-medium ring-1 ring-purple-100" 
//                   : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               <MessageSquare size={16} className={chatId === chat._id ? "text-purple-600" : "text-gray-400"} />
//               <span className="truncate">{chat.messages[0]?.parts[0]?.text || "New Conversation"}</span>
//             </button>
//           ))}
//         </div>
        
//         <div className="p-4 border-t border-gray-100 space-y-2">
//           <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition text-sm font-medium">
//             <Home size={18} />
//             Back to Home
//           </button>
//           <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition text-sm font-medium">
//             <LogOut size={18} />
//             Sign Out
//           </button>
//         </div>
//       </aside>

//       {/* --- MAIN CHAT AREA --- */}
//       <main className="flex-1 flex flex-col relative bg-gray-50">
//         <header className="bg-white p-4 px-6 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
//           <div className="flex items-center gap-3">
//             <button onClick={() => navigate("/")} className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors md:hidden">
//               <ArrowLeft size={20} />
//             </button>
//             <div className="relative">
//               <div className="bg-purple-100 p-2 rounded-full">
//                 <Bot size={20} className="text-purple-600" />
//               </div>
//               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-800">Dr. AI Assistant</h3>
//               <p className="text-xs text-green-600 font-medium">Online • Ready to help</p>
//             </div>
//           </div>
//           <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
//         </header>

//         <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
//           {messages.length === 0 && (
//             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-0 animate-fadeIn" style={{opacity: 1}}>
//               <div className="bg-white p-6 rounded-full shadow-md mb-2">
//                 <Bot size={48} className="text-purple-500" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-800">How can I help you today?</h2>
//               <p className="text-gray-500 max-w-md">I can help clarify symptoms, suggest wellness tips, or just listen.</p>
//             </div>
//           )}

//           {messages.map((msg, i) => (
//             <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//               {msg.role === "model" && (
//                 <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
//                   <Bot size={16} className="text-purple-600" />
//                 </div>
//               )}
//               <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"}`}>
//                 {msg.parts[0].text}
//               </div>
//             </div>
//           ))}
          
//           {/* Loading States */}
//           {loading && (
//              <div className="flex justify-start gap-4 animate-pulse">
//                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center"><Bot size={16} className="text-gray-400" /></div>
//                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 text-gray-400 text-sm">Thinking...</div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>

//         {/* --- INPUT AREA WITH VOICE --- */}
//         <div className="p-6 bg-white border-t border-gray-100">
//           <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-4">
            
//             {/* 🎤 Voice Button */}
//             <button
//               type="button"
//               onClick={isRecording ? stopRecording : startRecording}
//               disabled={isTranscribing}
//               className={`p-4 rounded-xl transition-all shadow-md flex items-center justify-center
//                 ${isRecording 
//                   ? "bg-red-100 text-red-600 animate-pulse border border-red-200" 
//                   : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
//                 }
//                 ${isTranscribing ? "bg-purple-50 text-purple-400 cursor-wait" : ""}
//               `}
//               title="Voice Input"
//             >
//               {isTranscribing ? (
//                 <Loader2 size={20} className="animate-spin" />
//               ) : isRecording ? (
//                 <Square size={20} fill="currentColor" /> // Stop Icon
//               ) : (
//                 <Mic size={20} /> // Mic Icon
//               )}
//             </button>

//             <div className="flex-1 relative">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder={isRecording ? "Listening..." : isTranscribing ? "Processing audio..." : "Type your health concern..."}
//                 disabled={isRecording || isTranscribing}
//                 className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-gray-700 transition-all placeholder-gray-400 disabled:bg-gray-100"
//               />
//             </div>
            
//             <button 
//               disabled={loading || !input.trim() || isRecording || isTranscribing}
//               className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:scale-105 active:scale-95"
//             >
//               <Send size={20} />
//             </button>
//           </form>
//           <p className="text-center text-xs text-gray-400 mt-3">
//             AI can make mistakes. Please verify important medical information.
//           </p>
//         </div>

//       </main>
//     </div>
//   );
// }






import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Send, 
  Plus, 
  MessageSquare, 
  LogOut, 
  Bot, 
  User, 
  MoreVertical,
  ArrowLeft,
  Home,
  Mic,          
  Square,       
  Loader2,
  Trash2        // <--- NEW ICON
} from "lucide-react"; 

export default function Chat() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- VOICE RECORDER STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // ---------------------------

  const messagesEndRef = useRef(null);

  // 1. Fetch History
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [chatId]); // Refetch when chat changes or is deleted

  // 2. Load Specific Chat
  const loadChat = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
      setChatId(id);
    } catch (err) {
      alert("Could not load chat");
    }
  };

  // --- NEW: DELETE FUNCTION ---
  const deleteChat = async (e, id) => {
    e.stopPropagation(); // Prevent clicking the parent button (loadChat)
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If we deleted the active chat, clear the screen
      if (chatId === id) {
        setMessages([]);
        setChatId(null);
      }
      
      // Refresh the list immediately
      fetchHistory(); 
    } catch (err) {
      alert("Failed to delete chat");
    }
  };
  // -----------------------------

  // --- VOICE FUNCTIONS ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleVoiceProcess;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone Error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceProcess = async () => {
    setIsTranscribing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_note.wav");

    try {
      const res = await axios.post("http://localhost:5001/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newText = res.data.text;
      setInput((prev) => (prev ? prev + " " + newText : newText));
    } catch (err) {
      console.error("Transcription Failed:", err);
      alert("Failed to transcribe audio. Is the Python server running?");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const currentInput = input;
    setInput("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat/send",
        { prompt: currentInput, chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, { role: "model", parts: [{ text: res.data.answer }] }]);
      
      if (!chatId) {
        setChatId(res.data.chatId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-20 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">AI Health Assistant</span>
          </div>

          <button 
            onClick={() => { setMessages([]); setChatId(null); }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 font-semibold"
          >
            <Plus size={18} />
            New Consultation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">History</p>
          {history.map((chat) => (
            <div 
              key={chat._id} 
              className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                chatId === chat._id 
                  ? "bg-purple-50 text-purple-700 font-medium ring-1 ring-purple-100" 
                  : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => loadChat(chat._id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={chatId === chat._id ? "text-purple-600" : "text-gray-400"} />
                <span className="truncate text-sm">{chat.messages[0]?.parts[0]?.text || "New Conversation"}</span>
              </div>

              {/* DELETE BUTTON (Visible on Hover) */}
              <button 
                onClick={(e) => deleteChat(e, chat._id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-100 space-y-2">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition text-sm font-medium">
            <Home size={18} />
            Back to Home
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition text-sm font-medium">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col relative bg-gray-50">
        <header className="bg-white p-4 px-6 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors md:hidden">
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <div className="bg-purple-100 p-2 rounded-full">
                <Bot size={20} className="text-purple-600" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Dr. AI Assistant</h3>
              <p className="text-xs text-green-600 font-medium">Online • Ready to help</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-0 animate-fadeIn" style={{opacity: 1}}>
              <div className="bg-white p-6 rounded-full shadow-md mb-2">
                <Bot size={48} className="text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">How can I help you today?</h2>
              <p className="text-gray-500 max-w-md">I can help clarify symptoms, suggest wellness tips, or just listen.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "model" && (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-purple-600" />
                </div>
              )}
              <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"}`}>
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          
          {/* Loading States */}
          {loading && (
             <div className="flex justify-start gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center"><Bot size={16} className="text-gray-400" /></div>
               <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 text-gray-400 text-sm">Thinking...</div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* --- INPUT AREA WITH VOICE --- */}
        <div className="p-6 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-4">
            
            {/* 🎤 Voice Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`p-4 rounded-xl transition-all shadow-md flex items-center justify-center
                ${isRecording 
                  ? "bg-red-100 text-red-600 animate-pulse border border-red-200" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }
                ${isTranscribing ? "bg-purple-50 text-purple-400 cursor-wait" : ""}
              `}
              title="Voice Input"
            >
              {isTranscribing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isRecording ? (
                <Square size={20} fill="currentColor" /> // Stop Icon
              ) : (
                <Mic size={20} /> // Mic Icon
              )}
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : isTranscribing ? "Processing audio..." : "Type your health concern..."}
                disabled={isRecording || isTranscribing}
                className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-gray-700 transition-all placeholder-gray-400 disabled:bg-gray-100"
              />
            </div>
            
            <button 
              disabled={loading || !input.trim() || isRecording || isTranscribing}
              className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:scale-105 active:scale-95"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            AI can make mistakes. Please verify important medical information.
          </p>
        </div>

      </main>
    </div>
  );
}