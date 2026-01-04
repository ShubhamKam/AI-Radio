import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

// Get current API URL
const getCurrentApiUrl = () => {
  return localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('demo@airadio.app');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(true); // Always show initially
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('api_url') || '');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setServerStatus('checking');
    setErrorDetails('');
    try {
      const baseUrl = getCurrentApiUrl().replace('/api', '');
      const response = await axios.get(`${baseUrl}/health`, { 
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        }
      });
      if (response.data && response.data.status === 'ok') {
        setServerStatus('online');
        setShowServerConfig(false); // Hide config if server is online
        setErrorDetails('');
      } else {
        setServerStatus('offline');
        setErrorDetails('Server responded but not healthy');
      }
    } catch (err: any) {
      setServerStatus('offline');
      // Capture detailed error info for debugging
      const errMsg = err.message || 'Unknown error';
      const errCode = err.code || '';
      setErrorDetails(`${errCode}: ${errMsg}`);
      console.error('Server check failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        toast.error('Cannot connect to server. Tap ⚙️ to configure server URL.');
        setShowServerConfig(true);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveServerUrl = () => {
    if (serverUrl) {
      localStorage.setItem('api_url', serverUrl);
      toast.success('Server URL saved. Please reload the app.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radio flex flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-radio-accent flex items-center justify-center"
          >
            <span className="text-4xl">📻</span>
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white">AI Radio</h1>
          <p className="text-white/60 mt-2">Your intelligent radio experience</p>
        </div>

        {/* Server Status */}
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Server Status:</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium flex items-center gap-1 ${
                serverStatus === 'online' ? 'text-green-400' : 
                serverStatus === 'offline' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {serverStatus === 'checking' && '⏳ Checking...'}
                {serverStatus === 'online' && '✅ Online'}
                {serverStatus === 'offline' && '❌ Offline'}
              </span>
              <button 
                onClick={checkServerStatus}
                className="text-xs text-white/40 hover:text-white/60"
              >
                🔄
              </button>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-1 truncate">
            {getCurrentApiUrl()}
          </p>
          {errorDetails && (
            <p className="text-red-400/70 text-xs mt-1 break-all">
              Error: {errorDetails}
            </p>
          )}
        </div>

        {/* Server Config */}
        {showServerConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <p className="text-yellow-400 text-sm mb-2">⚙️ Enter Server URL</p>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://xxxxx.lhr.life/api"
              className="input-field mb-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveServerUrl}
                className="flex-1 py-2 bg-yellow-500 text-black rounded-lg text-sm font-medium"
              >
                Save & Reload
              </button>
              <button
                onClick={checkServerStatus}
                className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm"
              >
                Test
              </button>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@airadio.app"
              className="input-field"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123"
              className="input-field"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Server Config Toggle */}
        <button
          onClick={() => setShowServerConfig(!showServerConfig)}
          className="w-full mt-4 py-2 text-white/40 text-sm flex items-center justify-center gap-2"
        >
          ⚙️ {showServerConfig ? 'Hide' : 'Configure'} Server
        </button>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <p className="text-white/60 text-xs text-center">
            Demo: demo@airadio.app / demo123
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-4 text-white/40 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Register Link */}
        <p className="text-center text-white/60">
          Don't have an account?{' '}
          <Link to="/register" className="text-radio-accent hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
