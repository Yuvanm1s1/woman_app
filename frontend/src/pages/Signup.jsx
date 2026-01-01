// import { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";

// export default function Signup() {
//   const [formData, setFormData] = useState({ username: "", email: "", password: "" });
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:5000/api/auth/register", formData);
//       alert("Account created! Now please log in.");
//       navigate("/login");
//     } catch (err) {
//       alert(err.response?.data?.msg || "Signup failed");
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-4">
//       <form onSubmit={handleSubmit} className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
//         <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Create Account</h2>
//         <input 
//           type="text" placeholder="Username" required
//           className="w-full p-3 mb-4 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
//           onChange={(e) => setFormData({...formData, username: e.target.value})} 
//         />
//         <input 
//           type="email" placeholder="Email" required
//           className="w-full p-3 mb-4 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
//           onChange={(e) => setFormData({...formData, email: e.target.value})} 
//         />
//         <input 
//           type="password" placeholder="Password" required
//           className="w-full p-3 mb-6 bg-zinc-800 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
//           onChange={(e) => setFormData({...formData, password: e.target.value})} 
//         />
//         <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition">Sign Up</button>
//         <p className="mt-4 text-center text-zinc-400">
//           Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
//         </p>
//       </form>
//     </div>
//   );
// }


import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Activity } from "lucide-react";

// Using the same image for consistency
import image_0 from "../assets/login.png";

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Account created! Now please log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* --- Left Side: Hero Image Section (Identical to Login) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-purple-900">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-purple-900/40 to-purple-600/30 mix-blend-multiply pointer-events-none" />
        
        <img
          src={image_0}
          alt="Medical Professional"
          className="absolute inset-0 w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-1000 ease-out"
        />
        
        <div className="relative z-20 flex flex-col justify-center h-full p-16 text-white space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/10">
            <Activity className="w-5 h-5 text-purple-200" />
            <span className="text-sm font-medium tracking-wide">Premium Health Care</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight max-w-lg">
            Join the future of health management.
          </h1>
          <p className="text-purple-100 text-lg max-w-md">
            Create an account to connect with top specialists and track your journey today.
          </p>
        </div>
      </div>

      {/* --- Right Side: Signup Form --- */}
      <div className="flex w-full lg:w-1/2 h-full items-center justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-block lg:hidden mb-4 p-3 bg-purple-50 rounded-2xl">
                <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Create account
            </h2>
            <p className="text-gray-500 text-lg">
              Start your healthy journey with us.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            
            {/* Username Input */}
            <div className="relative group">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="username"
                  placeholder="Jane Doe"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
              </div>
            </div>

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
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
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
                  placeholder="Create a password"
                  required
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-base font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-600/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign up
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-purple-600 hover:text-purple-800 transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}