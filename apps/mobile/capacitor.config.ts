import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.airadio.app',
  appName: 'AI Radio',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

