import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BellIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  DocumentIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { userApi, spotifyAuthApi, googleApi } from '../services/api';
import type { UserPreference, ShowFormat } from '../types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [googleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [prefsRes, spotifyRes] = await Promise.all([
        userApi.getPreferences(),
        spotifyAuthApi.getStatus(),
      ]);
      setPreferences(prefsRes.data);
      setSpotifyConnected(spotifyRes.data.connected);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreference = async (key: string, value: any) => {
    if (!preferences) return;
    
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    
    try {
      await userApi.updatePreferences({ [key]: value });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleConnectSpotify = async () => {
    try {
      const response = await spotifyAuthApi.getAuthUrl();
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to connect Spotify');
    }
  };

  const handleDisconnectSpotify = async () => {
    try {
      await spotifyAuthApi.disconnect();
      setSpotifyConnected(false);
      toast.success('Spotify disconnected');
    } catch (error) {
      toast.error('Failed to disconnect Spotify');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await googleApi.getAuthUrl();
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to connect Google');
    }
  };

  const formatOptions: { id: ShowFormat; label: string }[] = [
    { id: 'NEWS', label: 'News' },
    { id: 'TALK', label: 'Talk Shows' },
    { id: 'EDUCATIONAL', label: 'Educational' },
    { id: 'ENTERTAINMENT', label: 'Entertainment' },
    { id: 'MUSIC_MIX', label: 'Music Mix' },
  ];

  const refreshOptions = [
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 7200, label: '2 hours' },
    { value: 14400, label: '4 hours' },
    { value: 86400, label: 'Daily' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-radio-accent"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 safe-area-top">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-white/60 hover:text-white"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
      </header>

      <div className="space-y-6">
        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Notifications
          </h2>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-white/50 text-sm">Get notified about new shows</p>
              </div>
              <button
                onClick={() =>
                  handleUpdatePreference(
                    'notificationsOn',
                    !preferences?.notificationsOn
                  )
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences?.notificationsOn
                    ? 'bg-radio-accent'
                    : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow"
                  animate={{
                    x: preferences?.notificationsOn ? 26 : 2,
                  }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Auto Refresh */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5" />
            Content Refresh
          </h2>
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto Refresh</p>
                <p className="text-white/50 text-sm">
                  Automatically update your feed
                </p>
              </div>
              <button
                onClick={() =>
                  handleUpdatePreference('autoRefresh', !preferences?.autoRefresh)
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences?.autoRefresh ? 'bg-radio-accent' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow"
                  animate={{
                    x: preferences?.autoRefresh ? 26 : 2,
                  }}
                />
              </button>
            </div>
            {preferences?.autoRefresh && (
              <div>
                <p className="text-white/60 text-sm mb-2">Refresh Interval</p>
                <div className="grid grid-cols-3 gap-2">
                  {refreshOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() =>
                        handleUpdatePreference('refreshInterval', value)
                      }
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        preferences?.refreshInterval === value
                          ? 'bg-radio-accent text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Preferred Formats */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            Preferred Show Formats
          </h2>
          <div className="card">
            <div className="flex flex-wrap gap-2">
              {formatOptions.map(({ id, label }) => {
                const isSelected = preferences?.preferredFormats?.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => {
                      const current = preferences?.preferredFormats || [];
                      const updated = isSelected
                        ? current.filter((f) => f !== id)
                        : [...current, id];
                      handleUpdatePreference('preferredFormats', updated);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-radio-accent text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {isSelected && <CheckIcon className="w-4 h-4" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Integrations</h2>
          <div className="space-y-3">
            {/* Spotify */}
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MusicalNoteIcon className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Spotify</p>
                <p className="text-white/50 text-sm">
                  {spotifyConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {spotifyConnected ? (
                <button
                  onClick={handleDisconnectSpotify}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnectSpotify}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Google */}
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <DocumentIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Google</p>
                <p className="text-white/50 text-sm">
                  {googleConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              <button
                onClick={handleConnectGoogle}
                className={`px-4 py-2 rounded-lg text-sm ${
                  googleConnected
                    ? 'bg-white/10 text-white/60'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {googleConnected ? 'Reconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h2>
          <div className="card border-red-500/20">
            <button className="flex items-center gap-3 text-red-400 w-full">
              <TrashIcon className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Delete Account</p>
                <p className="text-red-400/60 text-sm">
                  Permanently delete your account and data
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-white/30 text-xs pt-4">
          <p>AI Radio v1.0.0</p>
          <p className="mt-1">© 2026 AI Radio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
