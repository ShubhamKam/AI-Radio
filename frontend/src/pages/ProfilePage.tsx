import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChartBarIcon,
  HeartIcon,
  ClockIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { useContentStore } from '../stores/contentStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const { contents, likes, history } = useContentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleUpdateProfile = async () => {
    try {
      await authApi.updateProfile({ name });
      updateUser({ name });
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const stats = [
    { label: 'Content', value: contents.length, icon: ChartBarIcon },
    { label: 'Likes', value: likes.length, icon: HeartIcon },
    { label: 'Listened', value: history.length, icon: ClockIcon },
  ];

  return (
    <div className="px-4 py-6 safe-area-top">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Profile</h1>
        <Link
          to="/settings"
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </Link>
      </header>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-radio-accent flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field py-2"
                  placeholder="Your name"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="btn-primary py-1 px-3 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary py-1 px-3 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-display font-bold text-white">
                  {user?.name || 'Anonymous'}
                </h2>
                <p className="text-white/60 text-sm">{user?.email}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-radio-accent text-sm mt-1"
                >
                  Edit profile
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center"
          >
            <Icon className="w-6 h-6 mx-auto text-radio-accent mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-white/60 text-xs">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-2 mb-6">
        <Link to="/library">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="card flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MusicalNoteIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">My Library</p>
              <p className="text-white/50 text-xs">Content, shows, and playlists</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/settings">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="card flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Cog6ToothIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Settings</p>
              <p className="text-white/50 text-xs">Preferences and integrations</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Logout */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={handleLogout}
        className="card w-full flex items-center gap-3 text-left hover:bg-red-500/10 border-red-500/20"
      >
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-red-400 font-medium">Sign Out</p>
          <p className="text-white/50 text-xs">Log out of your account</p>
        </div>
      </motion.button>

      {/* Member since */}
      <p className="text-center text-white/30 text-xs mt-8">
        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
      </p>
    </div>
  );
}
