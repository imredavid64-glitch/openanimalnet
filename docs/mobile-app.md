# Mobile App (iOS & Android)

OpenAnimalNet ships as a native mobile app using **Capacitor**, which wraps
the Next.js web app into native iOS and Android shells. The same codebase
powers both the web and mobile apps.

## Quick Start

```bash
# Run the setup script (installs deps, builds, adds platforms)
./scripts/setup-mobile.sh

# Or do it manually:
npm install
MOBILE_BUILD=true npm run build
npx cap add ios
npx cap add android
npx cap sync
```

## Prerequisites

### iOS
- **macOS** (required for Xcode)
- **Xcode 15+** with iOS SDK
- **CocoaPods** (`gem install cocoapods`)
- **Apple Developer Account** (for device testing and App Store)

### Android
- **Android Studio** with SDK 33+
- **JDK 17+**
- **Google Play Developer Account** (for Play Store)

## Development

### Live Reload (Recommended)

During development, use live reload to see changes instantly:

```bash
# Start the Next.js dev server
npm run dev

# In another terminal, run on iOS/Android with live reload
npx cap run ios --livereload --external
npx cap run android --livereload --external
```

This connects the native app to your local dev server. Changes appear
instantly without rebuilding.

### Build & Sync

After making code changes:

```bash
# Build static export
MOBILE_BUILD=true npm run build

# Sync to native projects
npx cap sync

# Open in IDE
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

## How It Works

### Static Export

For mobile builds, Next.js uses `output: 'export'` which generates a
static HTML/CSS/JS bundle in the `out/` directory. This is what Capacitor
serves in the native WebView.

The `MOBILE_BUILD=true` environment variable triggers static export mode.
Regular `npm run build` still works for Vercel deployment.

### API Routes

API routes (`/api/v1/*`) don't work in the static export. The mobile app
points to the live Vercel backend instead:

```typescript
// capacitor.config.ts
server: {
  url: 'https://openanimalnet.vercel.app',
}
```

All fetch calls from the mobile app go to the production API.

### Local Storage

The pet tracker and wildlife safari use `localStorage` which persists
across app sessions on the device. Data stays on the device — nothing
is sent to any server.

## Platform-Specific Configuration

### iOS (`ios/App/App/Info.plist`)

Key permissions:
- **NSLocationWhenInUseUsageDescription**: "Used to find nearby wildlife"
- **NSCameraUsageDescription**: "Take photos during wildlife safari"
- **NSPhotoLibraryUsageDescription**: "Save wildlife photos"

### Android (`android/app/src/main/AndroidManifest.xml`)

Key permissions:
- `ACCESS_FINE_LOCATION`: GPS for safari feature
- `ACCESS_COARSE_LOCATION`: Approximate location
- `CAMERA`: Photo capture for safari
- `READ_EXTERNAL_STORAGE`: Photo library access

## Building for Production

### iOS (App Store)

1. Open in Xcode: `npx cap open ios`
2. Select your team and signing certificate
3. Set the build version in Xcode
4. Product → Archive → Upload to App Store Connect

### Android (Play Store)

1. Open in Android Studio: `npx cap open android`
2. Build → Generate Signed Bundle/APK
3. Select your keystore and build the AAB
4. Upload to Google Play Console

## Features That Work Differently on Mobile

| Feature | Web | Mobile |
|---------|-----|--------|
| Geolocation | Browser API | Native GPS (more accurate) |
| Camera | File input | Native camera capture |
| Notifications | Browser notifications | Push notifications |
| Offline | Requires internet | Core features work offline |
| Haptics | Not available | Vibration feedback |
| Share | Web Share API | Native share sheet |

## Troubleshooting

### "Capacitor not initialized"
Run `npx cap sync` to re-sync web assets.

### White screen on launch
The static export may have failed. Check:
- Run `MOBILE_BUILD=true npm run build` and verify `out/` exists
- Check for missing pages in the static export

### API calls failing
Ensure the Vercel backend is live and the `server.url` in
`capacitor.config.ts` is correct.

### Camera not working
Check that camera permissions are granted in device settings.

### Location not working
On iOS, ensure "While Using the App" is selected in location settings.
On Android, ensure "Precise location" is enabled.

## File Structure

```
openanimalnet/
├── capacitor.config.ts      # Capacitor configuration
├── ios/                     # iOS native project (generated)
├── android/                 # Android native project (generated)
├── out/                     # Static export output (generated)
├── scripts/
│   └── setup-mobile.sh      # One-click setup script
└── docs/
    └── mobile-app.md        # This file
```
