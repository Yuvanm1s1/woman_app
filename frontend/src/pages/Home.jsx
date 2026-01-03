// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { 
//   Home as HomeIcon, 
//   Search, 
//   Activity, 
//   ShoppingBag, 
//   LogOut, 
//   MessageCircle, 
//   ChevronRight, 
//   Bot,
//   HeartPulse
// } from "lucide-react";

// export default function Home() {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // --- Mock Data for Posts (You will fetch this from API later) ---
//   const posts = [
//     {
//       id: 1,
//       category: "Wellness",
//       title: "5 Tips for Better Sleep Hygiene",
//       desc: "Discover how small changes to your evening routine can drastically improve your sleep quality.",
//       author: "Dr. Sarah J.",
//       time: "2h ago",
//       color: "bg-blue-100 text-blue-700"
//     },
//     {
//       id: 2,
//       category: "Nutrition",
//       title: "Understanding Iron Deficiency",
//       desc: "Fatigue? Dizziness? You might be low on iron. Here is what you need to include in your diet.",
//       author: "NutriHealth Team",
//       time: "5h ago",
//       color: "bg-green-100 text-green-700"
//     },
//     {
//       id: 3,
//       category: "Mental Health",
//       title: "Mindfulness for Busy Moms",
//       desc: "Short, effective meditation techniques you can do while the baby sleeps.",
//       author: "Mindful Momma",
//       time: "1d ago",
//       color: "bg-purple-100 text-purple-700"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans">
      
//       {/* --- 1. Top Navigation Bar --- */}
//       <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-20">
            
//             {/* Left: Logo */}
//             <div className="flex items-center gap-2">
//               <div className="bg-purple-600 p-2 rounded-lg">
//                 <HeartPulse className="w-6 h-6 text-white" />
//               </div>
//               <span className="text-xl font-bold text-gray-900 tracking-tight">WomenHealthApp</span>
//             </div>

//             {/* Center: Menu Items */}
//             <div className="hidden md:flex items-center space-x-8">
//               <NavLink icon={<HomeIcon size={18} />} text="Home" active />
//               <NavLink icon={<Search size={18} />} text="Browse" />
//               <NavLink icon={<Activity size={18} />} text="Track" />
//               <NavLink icon={<ShoppingBag size={18} />} text="Products" />
//             </div>

//             {/* Right: User & Logout */}
//             <div className="flex items-center gap-4">
//               <span className="hidden sm:block text-sm font-medium text-gray-600">
//                 Hi, {user?.username || "Guest"}
//               </span>
//               <button 
//                 onClick={handleLogout}
//                 className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
//                 title="Logout"
//               >
//                 <LogOut size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
//         {/* --- 2. Hero Section (AI Chat CTA) --- */}
//         <section className="relative overflow-hidden rounded-3xl bg-purple-900 shadow-2xl">
//           {/* Decorative Gradient Background */}
//           <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
//           <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
          
//           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-10">
            
//             {/* Text Content */}
//             <div className="flex-1 space-y-6 text-center md:text-left">
//               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-purple-200 text-sm font-medium">
//                 <Bot size={16} />
//                 <span>AI Health Companion</span>
//               </div>
              
//               <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
//                 Your Personal <span className="text-purple-300">AI Doctor</span> is here.
//               </h1>
              
//               <p className="text-lg text-purple-100/80 max-w-xl">
//                 Feeling unsure? Chat with our AI friend to get instant health insights, wellness tips, or just a listening ear. 24/7, Private & Secure.
//               </p>

//               <button 
//                 onClick={() => navigate("/chat")}
//                 className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all transform hover:-translate-y-1 shadow-lg shadow-white/10"
//               >
//                 <MessageCircle size={22} />
//                 Start Chatting Now
//               </button>
//             </div>

//             {/* Visual Icon/Illustration */}
//             <div className="flex-1 flex justify-center">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
//                 <div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-1 rounded-full shadow-2xl">
//                   <div className="bg-purple-900 p-8 rounded-full border-4 border-white/10">
//                     <Bot size={120} className="text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>


//         {/* --- 3. Posts Section (Latest Insights) --- */}
//         <section>
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-2xl font-bold text-gray-900">Latest Health Insights</h2>
//             <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm">
//               View all <ChevronRight size={16} />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {posts.map((post) => (
//               <article 
//                 key={post.id} 
//                 className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.color}`}>
//                     {post.category}
//                   </span>
//                   <span className="text-gray-400 text-xs">{post.time}</span>
//                 </div>
                
//                 <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
//                   {post.title}
//                 </h3>
                
//                 <p className="text-gray-500 text-sm mb-4 line-clamp-2">
//                   {post.desc}
//                 </p>

//                 <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
//                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
//                     {post.author[0]}
//                   </div>
//                   <span className="text-sm font-medium text-gray-700">{post.author}</span>
//                 </div>
//               </article>
//             ))}
//           </div>
//         </section>

//       </main>
//     </div>
//   );
// }

// // Helper Component for Navigation Links
// function NavLink({ icon, text, active = false }) {
//   return (
//     <a 
//       href="#" 
//       className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm
//         ${active 
//           ? "bg-purple-50 text-purple-700" 
//           : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
//         }`}
//     >
//       {icon}
//       <span>{text}</span>
//     </a>
//   );
// }



import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  Home as HomeIcon, 
  Search, 
  Activity, 
  ShoppingBag, 
  LogOut, 
  MessageCircle, 
  ChevronRight, 
  Bot,
  HeartPulse,
  BookOpen, // Added icon for Knowledge Base
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- Mock Data for Posts ---
  const posts = [
    {
      id: 1,
      category: "Wellness",
      title: "5 Tips for Better Sleep Hygiene",
      desc: "Discover how small changes to your evening routine can drastically improve your sleep quality.",
      author: "Dr. Sarah J.",
      time: "2h ago",
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: 2,
      category: "Nutrition",
      title: "Understanding Iron Deficiency",
      desc: "Fatigue? Dizziness? You might be low on iron. Here is what you need to include in your diet.",
      author: "NutriHealth Team",
      time: "5h ago",
      color: "bg-green-100 text-green-700"
    },
    {
      id: 3,
      category: "Mental Health",
      title: "Mindfulness for Busy Moms",
      desc: "Short, effective meditation techniques you can do while the baby sleeps.",
      author: "Mindful Momma",
      time: "1d ago",
      color: "bg-purple-100 text-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- 1. Top Navigation Bar --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-purple-600 p-2 rounded-lg">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">WomenHealthApp</span>
            </div>

            {/* Center: Menu Items */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink icon={<HomeIcon size={18} />} text="Home" active />
              <NavLink icon={<Search size={18} />} text="Browse" />
              <NavLink icon={<Activity size={18} />} text="Track" />
              <NavLink icon={<ShoppingBag size={18} />} text="Products" />
            </div>

            {/* Right: User & Logout */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm font-medium text-gray-600">
                Hi, {user?.username || "Guest"}
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* --- GRID SECTION: Chat (Left) + Knowledge Base (Right) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- 2. Hero Section (AI Chat CTA) - Takes 2 cols --- */}
          <section className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-purple-900 shadow-2xl h-full flex flex-col justify-center">
            {/* Decorative Gradient Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 gap-10">
              
              {/* Text Content */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-purple-200 text-sm font-medium">
                  <Bot size={16} />
                  <span>AI Health Companion</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Your Personal <span className="text-purple-300">AI Doctor</span> is here.
                </h1>
                
                <p className="text-purple-100/80 max-w-sm mx-auto md:mx-0">
                  Chat with our AI friend to get instant health insights, wellness tips, or just a listening ear.
                </p>

                <button 
                  onClick={() => navigate("/chat")}
                  className="inline-flex items-center gap-2 bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all transform hover:-translate-y-1 shadow-lg shadow-white/10"
                >
                  <MessageCircle size={20} />
                  Start Chatting Now
                </button>
              </div>

              {/* Visual Icon */}
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-1 rounded-full shadow-2xl">
                    <div className="bg-purple-900 p-6 rounded-full border-4 border-white/10">
                      <Bot size={80} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- NEW SECTION: Knowledge Base Brief - Takes 1 col --- */}
          <section className="lg:col-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col justify-center relative overflow-hidden group">
            {/* Hover Effect Blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-2">
                <BookOpen size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Knowledge Base</h2>
                <p className="text-gray-500 leading-relaxed">
                  Access a comprehensive library of women's health conditions. Explore causes, symptoms, side effects, and verified treatment options.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => navigate("/kbase")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-100 hover:text-pink-700 text-gray-700 font-semibold transition-all group"
                >
                  <span>Explore Library</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>

        </div>


        {/* --- 3. Posts Section (Latest Insights) --- */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Latest Health Insights</h2>
            <button className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm">
              View all <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.color}`}>
                    {post.category}
                  </span>
                  <span className="text-gray-400 text-xs">{post.time}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {post.desc}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {post.author[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{post.author}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

// Helper Component for Navigation Links
function NavLink({ icon, text, active = false }) {
  return (
    <a 
      href="#" 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm
        ${active 
          ? "bg-purple-50 text-purple-700" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
    >
      {icon}
      <span>{text}</span>
    </a>
  );
}