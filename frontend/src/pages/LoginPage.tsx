import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('demo@airadio.app');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('api_url') || '');

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

        {/* Server Config */}
        {showServerConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <p className="text-yellow-400 text-sm mb-2">⚠️ Server Configuration</p>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://your-server.onrender.com/api"
              className="input-field mb-2 text-sm"
            />
            <button
              onClick={handleSaveServerUrl}
              className="w-full py-2 bg-yellow-500 text-black rounded-lg text-sm font-medium"
            >
              Save & Reload
            </button>
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
