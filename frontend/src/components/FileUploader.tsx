import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { contentApi } from '../services/api';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  onUploadComplete?: (content: any) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('audio/')) return MusicalNoteIcon;
  if (type.startsWith('video/')) return VideoCameraIcon;
  return DocumentIcon;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ACCEPTED_TYPES = {
  'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'],
  'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
};

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      newMap.set(fileId, { file, progress: 0, status: 'uploading' });
      return newMap;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const response = await contentApi.upload(formData, (progress) => {
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(fileId);
          if (current) {
            newMap.set(fileId, { ...current, progress });
          }
          return newMap;
        });
      });

      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileId);
        if (current) {
          newMap.set(fileId, { ...current, progress: 100, status: 'complete' });
        }
        return newMap;
      });

      toast.success(`${file.name} uploaded successfully`);
      onUploadComplete?.(response.data);

      // Remove from list after delay
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 2000);
    } catch (error: any) {
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileId);
        if (current) {
          newMap.set(fileId, {
            ...current,
            status: 'error',
            error: error.response?.data?.message || 'Upload failed',
          });
        }
        return newMap;
      });
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(uploadFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const removeFile = (fileId: string) => {
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-radio-accent bg-radio-accent/10'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="w-12 h-12 mx-auto text-white/40 mb-4" />
        {isDragActive ? (
          <p className="text-white font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-white font-medium mb-1">
              Drag & drop files here, or click to select
            </p>
            <p className="text-white/50 text-sm">
              Audio, video, PDFs, documents • Max 500MB
            </p>
          </>
        )}
      </div>

      {/* Uploading files list */}
      <AnimatePresence>
        {Array.from(uploadingFiles.entries()).map(([fileId, { file, progress, status, error }]) => {
          const FileIcon = getFileIcon(file.type);
          
          return (
            <motion.div
              key={fileId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <FileIcon className="w-5 h-5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-white/50 text-xs">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'uploading' && (
                    <span className="text-white/60 text-sm">{progress}%</span>
                  )}
                  {status === 'complete' && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                  {status === 'error' && (
                    <button
                      onClick={() => removeFile(fileId)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              {status === 'uploading' && (
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-radio-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              )}
              {error && (
                <p className="mt-2 text-red-400 text-xs">{error}</p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
