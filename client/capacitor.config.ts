import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.airadiocursor.app',
  appName: 'AI Radio Cursor',
  webDir: 'dist',
  server: {
    allowNavigation: [
      '*.youtube.com',
      '*.youtube-nocookie.com',
      '*.google.com',
      '*.spotify.com',
      'open.spotify.com',
      'i.scdn.co'
    ]
  }
};

export default config;
