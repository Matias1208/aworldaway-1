import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import { ArrowLeft, LogIn, Play } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("demo"); // Pre-llenado con demo
  const [password, setPassword] = useState("demo123"); // Pre-llenado con demo123
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting login with:", { username, password }); // Debug
      const response = await apiClient.login({ username, password });
      console.log("Login response:", response); // Debug
      
      localStorage.setItem("auth_token", response.access_token);
      nav("/upload");
    } catch (error) {
      console.error("Login error:", error); // Debug
      setError("Incorrect username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Usar las credenciales demo automáticamente
    setUsername("demo");
    setPassword("demo123");
    // Y hacer submit automáticamente después de un breve delay
    setTimeout(() => {
      const submitEvent = new Event('submit', { cancelable: true });
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  const handleBack = () => {
    nav("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors group mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Researcher Sign In
            </h1>
            <p className="text-slate-400 mt-2">
              Access your research account
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
                <p className="text-amber-400 text-xs mt-1">
                  Check that your backend is running on http://localhost:8000
                </p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Access Button */}
          <div className="mt-6">
            <button
              onClick={handleDemoAccess}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Play className="w-4 h-4" />
              Use Demo Credentials
            </button>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Demo Credentials</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Username: <code className="bg-slate-800 px-1 rounded">demo</code></p>
              <p>Password: <code className="bg-slate-800 px-1 rounded">demo123</code></p>
              <p className="text-amber-400 text-xs mt-2">
                ⚠️ Make sure backend is running on localhost:8000
              </p>
            </div>
          </div>

          {/* Register Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <span className="text-cyan-400 font-medium">
                Contact administrator
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}