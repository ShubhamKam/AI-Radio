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

interface ApiKeys {
  openaiKey: string;
  spotifyClientId: string;
  spotifyClientSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  youtubeApiKey: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [spotifyStatus, setSpotifyStatus] = useState<IntegrationStatus>({ configured: false, connected: false });
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>({ configured: false, connected: false });
  const [aiStatus, setAiStatus] = useState<AIStatus>({ openai: false });
  const [isLoading, setIsLoading] = useState(true);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openaiKey: '',
    spotifyClientId: '',
    spotifyClientSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    youtubeApiKey: '',
  });
  const [savingKeys, setSavingKeys] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSavedApiKeys();
  }, []);

  const loadSavedApiKeys = () => {
    // Load saved API keys from localStorage
    const saved = localStorage.getItem('api_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setApiKeys(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved API keys');
      }
    }
  };

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

  const handleSaveApiKeys = async () => {
    setSavingKeys(true);
    try {
      // Save to localStorage for persistence
      localStorage.setItem('api_keys', JSON.stringify(apiKeys));
      
      // Send to backend to update configuration
      await api.post('/integrations/configure', apiKeys);
      
      toast.success('API keys saved! Reloading status...');
      
      // Reload settings to get updated status
      await loadSettings();
    } catch (error: any) {
      console.error('Failed to save API keys:', error);
      // Even if server save fails, local save worked
      toast.success('API keys saved locally');
    } finally {
      setSavingKeys(false);
    }
  };

  const handleApiKeyChange = (key: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
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

        {/* API Configuration */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5" />
              API Configuration
            </h2>
            <button
              onClick={() => setShowApiConfig(!showApiConfig)}
              className="text-radio-accent text-sm"
            >
              {showApiConfig ? 'Hide' : 'Configure'}
            </button>
          </div>
          
          <div className="card">
            {/* Status Overview */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">OpenAI (GPT-4)</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  aiStatus.openai ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {aiStatus.openai ? '✅ Active' : '⚠️ Demo Mode'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Spotify</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  spotifyStatus.configured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {spotifyStatus.configured ? '✅ Configured' : '⚠️ Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Google</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  googleStatus.configured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {googleStatus.configured ? '✅ Configured' : '⚠️ Not Set'}
                </span>
              </div>
            </div>

            {/* API Key Input Form */}
            {showApiConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-white/10 pt-4 space-y-4"
              >
                <p className="text-white/50 text-xs mb-3">
                  Enter your API keys below. Get them from the respective developer portals.
                </p>

                {/* OpenAI */}
                <div>
                  <label className="text-white/70 text-xs block mb-1">
                    OpenAI API Key
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-radio-accent ml-2">
                      Get Key →
                    </a>
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openaiKey}
                    onChange={(e) => handleApiKeyChange('openaiKey', e.target.value)}
                    placeholder="sk-..."
                    className="input-field text-sm"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="text-white/70 text-xs block mb-1">
                    YouTube API Key
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-radio-accent ml-2">
                      Get Key →
                    </a>
                  </label>
                  <input
                    type="password"
                    value={apiKeys.youtubeApiKey}
                    onChange={(e) => handleApiKeyChange('youtubeApiKey', e.target.value)}
                    placeholder="AIza..."
                    className="input-field text-sm"
                  />
                </div>

                {/* Spotify */}
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-400 text-xs font-medium mb-2">Spotify Credentials</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={apiKeys.spotifyClientId}
                      onChange={(e) => handleApiKeyChange('spotifyClientId', e.target.value)}
                      placeholder="Client ID"
                      className="input-field text-sm"
                    />
                    <input
                      type="password"
                      value={apiKeys.spotifyClientSecret}
                      onChange={(e) => handleApiKeyChange('spotifyClientSecret', e.target.value)}
                      placeholder="Client Secret"
                      className="input-field text-sm"
                    />
                  </div>
                  <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs mt-1 block">
                    Get from Spotify Developer Dashboard →
                  </a>
                </div>

                {/* Google */}
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-400 text-xs font-medium mb-2">Google OAuth Credentials</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={apiKeys.googleClientId}
                      onChange={(e) => handleApiKeyChange('googleClientId', e.target.value)}
                      placeholder="Client ID"
                      className="input-field text-sm"
                    />
                    <input
                      type="password"
                      value={apiKeys.googleClientSecret}
                      onChange={(e) => handleApiKeyChange('googleClientSecret', e.target.value)}
                      placeholder="Client Secret"
                      className="input-field text-sm"
                    />
                  </div>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs mt-1 block">
                    Get from Google Cloud Console →
                  </a>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveApiKeys}
                  disabled={savingKeys}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {savingKeys ? 'Saving...' : 'Save API Keys'}
                </button>

                <p className="text-white/30 text-xs text-center">
                  Keys are stored securely and sent to the server for API calls.
                </p>
              </motion.div>
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
