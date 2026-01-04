import { useState } from 'react';
import { Container, Typography, Box, Paper, Button, TextField, Tab, Tabs, Alert } from '@mui/material';
import { CloudUpload, TextFields, Link as LinkIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { contentAPI } from '../services/api';

export default function Upload() {
  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // File upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      setError('');
      setSuccess('');
      setUploading(true);

      try {
        for (const file of files) {
          await contentAPI.uploadFile(file);
        }
        setSuccess(`Uploaded ${files.length} file(s) successfully`);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  // Text input
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  const handleTextSubmit = async () => {
    if (!textTitle || !textContent) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await contentAPI.addText({ title: textTitle, text: textContent });
      setSuccess('Text content added successfully');
      setTextTitle('');
      setTextContent('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add text');
    } finally {
      setUploading(false);
    }
  };

  // URL input
  const [url, setUrl] = useState('');

  const handleUrlSubmit = async () => {
    if (!url) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await contentAPI.addUrl(url);
      setSuccess('URL content added successfully');
      setUrl('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add URL');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Add Content
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload files, paste text, or add URLs to create your personalized radio content
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<CloudUpload />} label="Upload Files" />
          <Tab icon={<TextFields />} label="Paste Text" />
          <Tab icon={<LinkIcon />} label="Add URL" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 6,
            textAlign: 'center',
            border: 2,
            borderStyle: 'dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select files
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Supports audio, video, documents, and more (max 500MB)
          </Typography>
        </Paper>
      )}

      {activeTab === 1 && (
        <Box>
          <TextField
            fullWidth
            label="Title"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            margin="normal"
            multiline
            rows={10}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleTextSubmit}
            disabled={uploading || !textTitle || !textContent}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Adding...' : 'Add Text Content'}
          </Button>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <TextField
            fullWidth
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            margin="normal"
            placeholder="https://example.com/article"
            helperText="Enter a URL to fetch and process its content"
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleUrlSubmit}
            disabled={uploading || !url}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Adding...' : 'Add URL Content'}
          </Button>
        </Box>
      )}
    </Container>
  );
}
