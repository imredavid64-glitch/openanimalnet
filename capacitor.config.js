/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
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
      enableHighAccuracy: true,
    },
    Camera: {
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
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8fafc',
  },
};

module.exports = config;
