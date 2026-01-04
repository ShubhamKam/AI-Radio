import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import { userAPI } from '../services/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout, setUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [preferences, setPreferences] = useState<any>({
    notificationEnabled: true,
    autoplayEnabled: true,
    theme: 'dark',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await userAPI.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await userAPI.updateProfile({ displayName });
      dispatch(setUser(response.data));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await userAPI.updatePreferences(preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile
        </Typography>
        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          value={user?.email}
          margin="normal"
          disabled
        />
        <Button variant="contained" onClick={handleSaveProfile} sx={{ mt: 2 }}>
          Save Profile
        </Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preferences
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.notificationEnabled}
              onChange={(e) => setPreferences({ ...preferences, notificationEnabled: e.target.checked })}
            />
          }
          label="Enable Notifications"
        />
        <br />
        <FormControlLabel
          control={
            <Switch
              checked={preferences.autoplayEnabled}
              onChange={(e) => setPreferences({ ...preferences, autoplayEnabled: e.target.checked })}
            />
          }
          label="Autoplay Next Show"
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Paper>
    </Container>
  );
}
