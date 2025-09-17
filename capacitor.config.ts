import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.coinflipx',
  appName: 'coinflipx-play-win',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;