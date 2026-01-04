import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-display font-bold text-white">Create Account</h1>
          <p className="text-white/60 mt-2">Join AI Radio today</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="••••••••"
              className="input-field"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-center text-white/40 text-xs mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-radio-accent hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-radio-accent hover:underline">
            Privacy Policy
          </a>
        </p>

        {/* Login Link */}
        <p className="text-center text-white/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-radio-accent hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
