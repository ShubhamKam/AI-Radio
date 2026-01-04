import { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home as HomeIcon, LibraryMusic, CloudUpload, Settings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import MiniPlayer from './MiniPlayer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Library', icon: <LibraryMusic />, path: '/library' },
    { label: 'Upload', icon: <CloudUpload />, path: '/upload' },
    { label: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🎙️ AI Radio
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', pb: 16 }}>
        {children}
      </Box>

      <MiniPlayer />

      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
