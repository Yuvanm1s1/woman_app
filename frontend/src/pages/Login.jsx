// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login } = useContext(AuthContext); // This comes from your AuthContext.jsx
//   const navigate = useNavigate();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
// //       // We pass user data and token to our Context
// //       login(res.data.user, res.data.token);
// //       navigate("/chat");
// //     } catch (err) {
// //       alert(err.response?.data?.msg || "Invalid Credentials");
// //     }
// //   };
//   // frontend/src/pages/Login.jsx
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
    
//     console.log("Full Server Response:", res.data); // <-- CHECK THIS IN BROWSER CONSOLE

//     if (res.data.token) {
//       login(res.data.user, res.data.token);
//       navigate("/chat");
//     }
//   } catch (err) {
//     console.error("Frontend Login Error:", err); // <-- THIS WILL TELL US THE TRUTH
//     alert(err.response?.data?.msg || "Something went wrong on the frontend");
//   }
// };
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-4">
//       <form onSubmit={handleSubmit} className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
//         <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Welcome Back</h2>
//         <input 
//           type="email" placeholder="Email" required
//           className="w-full p-3 mb-4 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
//           onChange={(e) => setEmail(e.target.value)} 
//         />
//         <input 
//           type="password" placeholder="Password" required
//           className="w-full p-3 mb-6 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
//           onChange={(e) => setPassword(e.target.value)} 
//         />
//         <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition">Login</button>
//         <p className="mt-4 text-center text-zinc-400">
//           Don't have an account? <Link to="/signup" className="text-blue-400 hover:underline">Register</Link>
//         </p>
//       </form>
//     </div>
//   );
// }


// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import image_0 from '../assets/login.png'; // Make sure to import the image

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });

//       console.log("Full Server Response:", res.data);

//       if (res.data.token) {
//         login(res.data.user, res.data.token);
//         navigate("/chat");
//       }
//     } catch (err) {
//       console.error("Frontend Login Error:", err);
//       alert(err.response?.data?.msg || "Something went wrong on the frontend");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-purple-50">
//       {/* Left Side - Image */}
//       <div className="hidden md:flex w-1/2 bg-purple-100 items-center justify-center p-8">
//         <img
//           src={image_0}
//           alt="A female doctor in a white coat and purple scrubs holding a smartphone that displays the Women Health App"
//           className="max-w-full h-auto rounded-2xl shadow-lg object-cover" // Styled for perfect placement
//         />
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-white">
//         <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-purple-700">Welcome Back</h2>
//             <p className="text-gray-500 mt-2">Please sign in to your account</p>
//           </div>
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               placeholder="Email"
//               required
//               className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               placeholder="Password"
//               required
//               className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors">
//             Login
//           </button>
//           <p className="text-center text-gray-500">
//             Don't have an account? <Link to="/signup" className="text-purple-600 hover:underline">Register</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Activity } from "lucide-react";

// Make sure your image path is correct relative to this file
import image_0 from "../assets/login.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      
      console.log("Full Server Response:", res.data);

      if (res.data.token) {
        login(res.data.user, res.data.token);
        navigate("/home");
      }
    } catch (err) {
      console.error("Frontend Login Error:", err);
      alert(err.response?.data?.msg || "Invalid credentials or server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* FIX 1: Changed min-h-screen to h-screen and added overflow-hidden to prevent scrolling */
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* --- Left Side: Hero Image Section --- */}
      <div className="hidden lg:flex w-1/2 relative bg-purple-900">
        {/* Purple Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-purple-900/40 to-purple-600/30 mix-blend-multiply pointer-events-none" />
        
        {/* Image */}
        <img
          src={image_0}
          alt="Medical Professional"
          // Kept object-top as it generally frames portraits better, centering the text below helps balance it.
          className="absolute inset-0 w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-1000 ease-out"
        />
        
        {/* Text Overlay */}
        {/* FIX 2: Changed justify-end to justify-center to move text to the middle */}
        <div className="relative z-20 flex flex-col justify-center h-full p-16 text-white space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/10">
            <Activity className="w-5 h-5 text-purple-200" />
            <span className="text-sm font-medium tracking-wide">Premium Health Care</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight max-w-lg">
            Empowering your health journey with modern solutions.
          </h1>
          <p className="text-purple-100 text-lg max-w-md">
            Connect with specialists and track your well-being in one secure place.
          </p>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      {/* Added h-full to ensure it takes full height for centering */}
      <div className="flex w-full lg:w-1/2 h-full items-center justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-block lg:hidden mb-4 p-3 bg-purple-50 rounded-2xl">
                <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 text-lg">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-5">
              
              {/* Email Input */}
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="doctor@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 cursor-pointer transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-base font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-600/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-purple-600 hover:text-purple-800 transition-colors"
              >
                Register for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}