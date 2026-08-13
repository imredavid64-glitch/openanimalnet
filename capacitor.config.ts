import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.openanimalnet.app',
  appName: 'OpenAnimalNet',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Point API calls to the live Vercel backend
    url: 'https://openanimalnet.vercel.app',
    cleartext: true,
  },
  plugins: {
    Geolocation: {
      // Request high accuracy for safari feature
      enableHighAccuracy: true,
    },
    Camera: {
      // Allow photo capture for wildlife safari
      android: {
        permissions: ['android.permission.CAMERA'],
      },
      ios: {
        usageDescription: 'Take photos of wildlife during safari',
      },
    },
    LocalNotifications: {
      android: {
        icon: 'notification_icon',
        color: '#0ea5e9',
      },
    },
  },
  android: {
    // Allow mixed content for API calls
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8fafc',
  },
};

export default config;
