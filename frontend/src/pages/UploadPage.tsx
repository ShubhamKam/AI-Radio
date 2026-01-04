import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LinkIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import FileUploader from '../components/FileUploader';
import { contentApi, researchApi, googleApi } from '../services/api';
import toast from 'react-hot-toast';

type UploadMode = 'file' | 'text' | 'url' | 'research' | 'google';

export default function UploadPage() {
  const [mode, setMode] = useState<UploadMode>('file');
  const [textContent, setTextContent] = useState({ title: '', text: '' });
  const [urlInput, setUrlInput] = useState('');
  const [researchQuery, setResearchQuery] = useState('');
  const [researchMode, setResearchMode] = useState<'wide' | 'deep'>('wide');
  const [isLoading, setIsLoading] = useState(false);
  const [googleConnected] = useState(false);

  const handleTextSubmit = async () => {
    if (!textContent.title || !textContent.text) {
      toast.error('Please provide both title and content');
      return;
    }

    setIsLoading(true);
    try {
      await contentApi.createFromText(textContent);
      toast.success('Content created successfully');
      setTextContent({ title: '', text: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      await contentApi.createFromUrl({ url: urlInput });
      toast.success('URL content imported successfully');
      setUrlInput('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResearchSubmit = async () => {
    if (!researchQuery) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      const response = await researchApi.search(researchQuery, researchMode);
      toast.success(`Found ${response.data.results?.length || 0} results`);
      // Results are automatically saved
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Research failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const response = await googleApi.getAuthUrl();
      window.location.href = response.data.url;
    } catch (error: any) {
      toast.error('Failed to connect to Google');
    }
  };

  const modes = [
    { id: 'file', label: 'Files', icon: CloudArrowUpIcon },
    { id: 'text', label: 'Text', icon: DocumentTextIcon },
    { id: 'url', label: 'URL', icon: LinkIcon },
    { id: 'research', label: 'Research', icon: GlobeAltIcon },
    { id: 'google', label: 'Google', icon: DocumentIcon },
  ] as const;

  return (
    <div className="px-4 py-6 safe-area-top">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">
          Add Content
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Import content to create radio shows
        </p>
      </header>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              mode === id
                ? 'bg-radio-accent text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* File Upload */}
      {mode === 'file' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileUploader
            onUploadComplete={() => {
              toast.success('File uploaded and processing started');
            }}
          />
        </motion.div>
      )}

      {/* Text Input */}
      {mode === 'text' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="text-white/60 text-sm mb-2 block">Title</label>
            <input
              type="text"
              value={textContent.title}
              onChange={(e) =>
                setTextContent({ ...textContent, title: e.target.value })
              }
              placeholder="Enter a title..."
              className="input-field"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Content</label>
            <textarea
              value={textContent.text}
              onChange={(e) =>
                setTextContent({ ...textContent, text: e.target.value })
              }
              placeholder="Paste or type your content here..."
              rows={8}
              className="input-field resize-none"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-sm">
              {textContent.text.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={handleTextSubmit}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Create Content'}
            </button>
          </div>
        </motion.div>
      )}

      {/* URL Input */}
      {mode === 'url' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Website URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              className="input-field"
            />
          </div>
          <p className="text-white/40 text-sm">
            We'll extract the main content from the webpage automatically.
          </p>
          <button
            onClick={handleUrlSubmit}
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Importing...' : 'Import from URL'}
          </button>
        </motion.div>
      )}

      {/* Web Research */}
      {mode === 'research' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Research Query
            </label>
            <input
              type="text"
              value={researchQuery}
              onChange={(e) => setResearchQuery(e.target.value)}
              placeholder="What would you like to research?"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Research Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResearchMode('wide')}
                className={`p-4 rounded-xl border transition-all ${
                  researchMode === 'wide'
                    ? 'border-radio-accent bg-radio-accent/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <h4 className="text-white font-medium">Wide Search</h4>
                <p className="text-white/50 text-xs mt-1">
                  Quick overview from multiple sources
                </p>
              </button>
              <button
                onClick={() => setResearchMode('deep')}
                className={`p-4 rounded-xl border transition-all ${
                  researchMode === 'deep'
                    ? 'border-radio-accent bg-radio-accent/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <h4 className="text-white font-medium">Deep Research</h4>
                <p className="text-white/50 text-xs mt-1">
                  Comprehensive analysis of topic
                </p>
              </button>
            </div>
          </div>
          <button
            onClick={handleResearchSubmit}
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Researching...' : 'Start Research'}
          </button>
        </motion.div>
      )}

      {/* Google Integration */}
      {mode === 'google' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {!googleConnected ? (
            <div className="card text-center py-8">
              <DocumentIcon className="w-12 h-12 mx-auto text-white/40 mb-4" />
              <h3 className="text-white font-medium mb-2">
                Connect Google Account
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Import documents from Google Docs, Sheets, and Slides
              </p>
              <button onClick={handleGoogleConnect} className="btn-primary">
                Connect with Google
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Google Connected</p>
                    <p className="text-white/60 text-sm">
                      You can import documents
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                <button className="card flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <span className="text-2xl">📄</span>
                  <div className="text-left">
                    <p className="text-white font-medium">Google Docs</p>
                    <p className="text-white/50 text-sm">
                      Import text documents
                    </p>
                  </div>
                </button>
                <button className="card flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <span className="text-2xl">📊</span>
                  <div className="text-left">
                    <p className="text-white font-medium">Google Sheets</p>
                    <p className="text-white/50 text-sm">
                      Import spreadsheet data
                    </p>
                  </div>
                </button>
                <button className="card flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <span className="text-2xl">📽️</span>
                  <div className="text-left">
                    <p className="text-white font-medium">Google Slides</p>
                    <p className="text-white/50 text-sm">
                      Import presentations
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
