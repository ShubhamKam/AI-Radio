import { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, CircularProgress } from '@mui/material';
import { PlayArrow, Radio as RadioIcon, TrendingUp } from '@mui/icons-material';
import { radioAPI } from '../services/api';
import { useAppDispatch } from '../hooks';
import { setCurrentTrack } from '../store/slices/playerSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      const response = await radioAPI.list({ limit: 10, status: 'ready' });
      setShows(response.data.items);
    } catch (error) {
      console.error('Failed to load shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const playShow = (show: any) => {
    dispatch(setCurrentTrack({
      id: show.id,
      title: show.title,
      type: 'show',
      audioUrl: radioAPI.getAudioUrl(show.id),
    }));
  };

  const generateShow = async (showType: string) => {
    try {
      await radioAPI.generate({ showType });
      loadShows();
    } catch (error) {
      console.error('Failed to generate show:', error);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome to AI Radio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personalized radio experience powered by AI
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Start
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RadioIcon />}
              onClick={() => generateShow('morning_briefing')}
              sx={{ py: 2 }}
            >
              Morning Brief
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RadioIcon />}
              onClick={() => generateShow('quick_hits')}
              sx={{ py: 2 }}
            >
              Quick Hits
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RadioIcon />}
              onClick={() => generateShow('deep_dive')}
              sx={{ py: 2 }}
            >
              Deep Dive
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RadioIcon />}
              onClick={() => generateShow('music_mix')}
              sx={{ py: 2 }}
            >
              Music Mix
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Your Shows
          </Typography>
        </Box>

        {shows.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No shows yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate your first AI radio show or upload some content
              </Typography>
              <Button variant="contained" onClick={() => generateShow('morning_briefing')}>
                Create Morning Briefing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {shows.map((show) => (
              <Grid item xs={12} sm={6} md={4} key={show.id}>
                <Card>
                  <CardMedia
                    sx={{ height: 140, bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <RadioIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" noWrap gutterBottom>
                      {show.title}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip label={show.showType.replace('_', ' ')} size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {show.durationSeconds ? `${Math.round(show.durationSeconds / 60)} min` : 'Generating...'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => playShow(show)}
                        disabled={show.status !== 'ready'}
                      >
                        {show.status === 'ready' ? 'Play' : 'Generating...'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
