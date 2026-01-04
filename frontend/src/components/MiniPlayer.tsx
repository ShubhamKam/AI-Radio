import { Box, Paper, IconButton, Typography, Slider, LinearProgress } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, VolumeUp } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks';
import { togglePlay, setVolume } from '../store/slices/playerSlice';
import { useState } from 'react';

export default function MiniPlayer() {
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying, volume, progress, duration } = useAppSelector(state => state.player);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 56,
        left: 0,
        right: 0,
        borderRadius: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1100,
      }}
    >
      <LinearProgress
        variant="determinate"
        value={(progress / duration) * 100}
        sx={{ height: 2 }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {currentTrack.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {currentTrack.artist || 'AI Radio Show'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small">
            <SkipPrevious />
          </IconButton>
          
          <IconButton
            onClick={() => dispatch(togglePlay())}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          
          <IconButton size="small">
            <SkipNext />
          </IconButton>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              size="small"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <VolumeUp />
            </IconButton>
            
            {showVolumeSlider && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  boxShadow: 3,
                  mb: 1,
                }}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  orientation="vertical"
                  value={volume * 100}
                  onChange={(_, value) => dispatch(setVolume((value as number) / 100))}
                  sx={{ height: 100 }}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
          {formatTime(progress)} / {formatTime(duration)}
        </Typography>
      </Box>
    </Paper>
  );
}
