#!/bin/bash
set -e

echo "🐾 OpenAnimalNet — Mobile App Setup"
echo "==================================="

# Step 1: Install Capacitor dependencies
echo ""
echo "Step 1: Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/camera @capacitor/geolocation @capacitor/local-notifications @capacitor/haptics @capacitor/share @capacitor/browser

# Step 2: Build the static export for mobile
echo ""
echo "Step 2: Building static export for mobile..."
MOBILE_BUILD=true npm run build

# Step 3: Initialize Capacitor (if not already done)
echo ""
echo "Step 3: Initializing Capacitor..."
if [ ! -f "capacitor.config.ts" ]; then
  npx cap init "OpenAnimalNet" "com.openanimalnet.app" --web-dir out
fi

# Step 4: Add platforms
echo ""
echo "Step 4: Adding native platforms..."

# iOS
if [ ! -d "ios" ]; then
  echo "  Adding iOS..."
  npx cap add ios
else
  echo "  iOS already added"
fi

# Android
if [ ! -d "android" ]; then
  echo "  Adding Android..."
  npx cap add android
else
  echo "  Android already added"
fi

# Step 5: Sync web assets
echo ""
echo "Step 5: Syncing web assets to native projects..."
npx cap sync

echo ""
echo "✅ Setup complete!"
echo ""
echo "To build and run:"
echo ""
echo "  iOS:"
echo "    npx cap open ios"
echo "    (Opens Xcode — select device/simulator and run)"
echo ""
echo "  Android:"
echo "    npx cap open android"
echo "    (Opens Android Studio — select device/emulator and run)"
echo ""
echo "  Quick sync after code changes:"
echo "    MOBILE_BUILD=true npm run build && npx cap sync"
echo ""
echo "  Live reload during development:"
echo "    npx cap run ios --livereload --external"
echo "    npx cap run android --livereload --external"
