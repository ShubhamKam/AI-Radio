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
  CpuChipIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { userApi, spotifyAuthApi, googleApi, api } from '../services/api';
import type { UserPreference, ShowFormat } from '../types';
import toast from 'react-hot-toast';

interface IntegrationStatus {
  configured: boolean;
  connected: boolean;
  error?: string;
}

interface AIStatus {
  openai: boolean;
  model?: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [spotifyStatus, setSpotifyStatus] = useState<IntegrationStatus>({ configured: false, connected: false });
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>({ configured: false, connected: false });
  const [aiStatus, setAiStatus] = useState<AIStatus>({ openai: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [prefsRes, statusRes] = await Promise.all([
        userApi.getPreferences(),
        api.get('/integrations/status').catch(() => ({ data: {} })),
      ]);
      setPreferences(prefsRes.data);
      
      // Set integration statuses
      const status = statusRes.data || {};
      setSpotifyStatus({
        configured: status.spotify?.configured || false,
        connected: status.spotify?.connected || false,
        error: status.spotify?.error,
      });
      setGoogleStatus({
        configured: status.google?.configured || false,
        connected: status.google?.connected || false,
        error: status.google?.error,
      });
      setAiStatus({
        openai: status.ai?.openai || false,
        model: status.ai?.model || 'Not configured',
      });
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
      setSpotifyStatus(prev => ({ ...prev, connected: false }));
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

        {/* AI Model */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CpuChipIcon className="w-5 h-5" />
            AI Model
          </h2>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                aiStatus.openai ? 'bg-purple-500/20' : 'bg-yellow-500/20'
              }`}>
                <CpuChipIcon className={`w-5 h-5 ${
                  aiStatus.openai ? 'text-purple-400' : 'text-yellow-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">OpenAI GPT-4</p>
                <p className={`text-sm ${aiStatus.openai ? 'text-green-400' : 'text-yellow-400'}`}>
                  {aiStatus.openai ? `✅ Active (${aiStatus.model})` : '⚠️ Not configured'}
                </p>
              </div>
            </div>
            {!aiStatus.openai && (
              <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-yellow-400 text-xs flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    AI features require an OpenAI API key. The app will use demo content until configured.
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Integrations */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Integrations</h2>
          <div className="space-y-3">
            {/* Spotify */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  spotifyStatus.configured ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                  <MusicalNoteIcon className={`w-5 h-5 ${
                    spotifyStatus.configured ? 'text-green-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Spotify</p>
                  <p className={`text-sm ${
                    spotifyStatus.connected ? 'text-green-400' : 
                    spotifyStatus.configured ? 'text-white/50' : 'text-yellow-400'
                  }`}>
                    {spotifyStatus.connected ? '✅ Connected' : 
                     spotifyStatus.configured ? 'Not connected' : '⚠️ Not configured'}
                  </p>
                </div>
                {spotifyStatus.configured && (
                  spotifyStatus.connected ? (
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
                  )
                )}
              </div>
              {!spotifyStatus.configured && (
                <p className="text-yellow-400/70 text-xs mt-2">
                  Requires Spotify API credentials to be configured on the server.
                </p>
              )}
            </div>

            {/* Google */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  googleStatus.configured ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                }`}>
                  <DocumentIcon className={`w-5 h-5 ${
                    googleStatus.configured ? 'text-blue-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Google</p>
                  <p className={`text-sm ${
                    googleStatus.connected ? 'text-green-400' : 
                    googleStatus.configured ? 'text-white/50' : 'text-yellow-400'
                  }`}>
                    {googleStatus.connected ? '✅ Connected' : 
                     googleStatus.configured ? 'Not connected' : '⚠️ Not configured'}
                  </p>
                </div>
                {googleStatus.configured && (
                  <button
                    onClick={handleConnectGoogle}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      googleStatus.connected
                        ? 'bg-white/10 text-white/60'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {googleStatus.connected ? 'Reconnect' : 'Connect'}
                  </button>
                )}
              </div>
              {!googleStatus.configured && (
                <p className="text-yellow-400/70 text-xs mt-2">
                  Requires Google OAuth credentials to be configured on the server.
                </p>
              )}
            </div>

            {/* YouTube */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-lg">▶️</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">YouTube</p>
                  <p className="text-white/50 text-sm">
                    Music and video search
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                  Demo Mode
                </span>
              </div>
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
