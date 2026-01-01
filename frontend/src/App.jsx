import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* If user is ALREADY logged in, send them to HOME, not Chat */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/home" />} />
        
        {/* --- PROTECTED ROUTES --- */}
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
        
        {/* --- DEFAULT / CATCH-ALL --- */}
        {/* If user goes to root "/", send to home if logged in, else login */}
        <Route path="/" element={token ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        
        {/* Any unknown route goes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;