'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, FileAudio, FileVideo, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ContentUpload() {
  const [uploading, setUploading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [googleDocId, setGoogleDocId] = useState('');

  const onDrop = async (acceptedFiles: File[], type: 'audio' | 'video' | 'slides') => {
    setUploading(true);
    const file = acceptedFiles[0];

    const formData = new FormData();
    formData.append(type, file);

    try {
      const endpoint = `/api/content/upload/${type}`;
      await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const audioDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'audio'),
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
  });

  const videoDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'video'),
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
  });

  const slidesDropzone = useDropzone({
    onDrop: (files) => onDrop(files, 'slides'),
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.ms-powerpoint': ['.ppt', '.pptx'] },
  });

  const handlePasteText = async () => {
    if (!pastedText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/content/paste-text`, {
        text: pastedText,
        title: 'Pasted Text',
      });
      toast.success('Text saved successfully!');
      setPastedText('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save text');
    }
  };

  const handleGoogleSheets = async () => {
    if (!googleSheetId.trim()) {
      toast.error('Please enter a Google Sheet ID');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/content/google-sheets`, {
        sheetId: googleSheetId,
      });
      toast.success('Google Sheet processed successfully!');
      setGoogleSheetId('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process Google Sheet');
    }
  };

  const handleGoogleDocs = async () => {
    if (!googleDocId.trim()) {
      toast.error('Please enter a Google Doc ID');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/content/google-docs`, {
        docId: googleDocId,
      });
      toast.success('Google Doc processed successfully!');
      setGoogleDocId('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process Google Doc');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Upload Content</h2>

      {/* Audio Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileAudio className="text-primary-600" />
          Audio Files
        </h3>
        <div
          {...audioDropzone.getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition"
        >
          <input {...audioDropzone.getInputProps()} />
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-600">
            Drag & drop audio files here, or click to select
          </p>
          <p className="text-xs text-gray-500 mt-1">MP3, WAV, M4A</p>
        </div>
      </div>

      {/* Video Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileVideo className="text-primary-600" />
          Video Files
        </h3>
        <div
          {...videoDropzone.getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition"
        >
          <input {...videoDropzone.getInputProps()} />
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-600">
            Drag & drop video files here, or click to select
          </p>
          <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI</p>
        </div>
      </div>

      {/* Slides Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-primary-600" />
          Slides (PDF/PPT)
        </h3>
        <div
          {...slidesDropzone.getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition"
        >
          <input {...slidesDropzone.getInputProps()} />
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-600">
            Drag & drop slides here, or click to select
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, PPT, PPTX</p>
        </div>
      </div>

      {/* Paste Text */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Paste Text</h3>
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={6}
          placeholder="Paste your text here..."
        />
        <button
          onClick={handlePasteText}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Save Text
        </button>
      </div>

      {/* Google Sheets */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Google Sheets</h3>
        <input
          type="text"
          value={googleSheetId}
          onChange={(e) => setGoogleSheetId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          placeholder="Enter Google Sheet ID"
        />
        <button
          onClick={handleGoogleSheets}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Process Sheet
        </button>
      </div>

      {/* Google Docs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Google Docs</h3>
        <input
          type="text"
          value={googleDocId}
          onChange={(e) => setGoogleDocId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          placeholder="Enter Google Doc ID"
        />
        <button
          onClick={handleGoogleDocs}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Process Doc
        </button>
      </div>
    </div>
  );
}
