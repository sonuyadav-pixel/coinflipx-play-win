import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.302a9d1fc176404f9dd14574ccbadefa',
  appName: 'coinflipx-play-win',
  webDir: 'dist',
  server: {
    url: 'https://302a9d1f-c176-404f-9dd1-4574ccbadefa.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    }
  }
};

export default config;