'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import ContentUpload from './ContentUpload';
import RadioShows from './RadioShows';
import MusicPlayer from './MusicPlayer';
import ResearchPanel from './ResearchPanel';
import KnowledgeNudges from './KnowledgeNudges';
import { Radio, Music, Upload, Search, BookOpen, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('radio');

  const tabs = [
    { id: 'radio', label: 'Radio Shows', icon: Radio },
    { id: 'upload', label: 'Upload Content', icon: Upload },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'nudges', label: 'Knowledge', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-700">AI Radio</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'radio' && <RadioShows />}
        {activeTab === 'upload' && <ContentUpload />}
        {activeTab === 'music' && <MusicPlayer />}
        {activeTab === 'research' && <ResearchPanel />}
        {activeTab === 'nudges' && <KnowledgeNudges />}
      </main>
    </div>
  );
}
