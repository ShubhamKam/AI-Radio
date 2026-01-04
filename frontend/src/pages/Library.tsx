import { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Chip, IconButton, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { contentAPI } from '../services/api';

export default function Library() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await contentAPI.list();
      setContent(response.data.items);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await contentAPI.delete(id);
      setContent(content.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Your Library
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        All your uploaded content and saved shows
      </Typography>

      {content.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Your library is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload some content to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {content.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" noWrap>
                        {item.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={item.contentType} size="small" />
                        <Chip
                          label={item.processingStatus}
                          size="small"
                          color={item.processingStatus === 'completed' ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                    <IconButton onClick={() => deleteContent(item.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
