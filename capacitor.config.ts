import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.serenitygardens.app',
  appName: 'Serenity Gardens',
  webDir: 'dist',
  android: { backgroundColor: '#F2EDE4' },
  plugins: {
    // Route fetch/XHR through the native layer so the Render API needs no CORS entry for the WebView origin.
    CapacitorHttp: { enabled: true },
    SplashScreen: { launchShowDuration: 0, backgroundColor: '#F2EDE4' },
    StatusBar: { style: 'DARK', backgroundColor: '#F2EDE4', overlaysWebView: false },
  },
};

export default config;
