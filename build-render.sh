#!/bin/bash

# Render build script for Global Pulse
echo "🚀 Starting Global Pulse build for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building Next.js application..."
npm run build

# Copy service worker to .next directory
echo "📋 Copying service worker..."
cp public/sw.js .next/sw.js

# Ensure public assets are accessible
echo "🎯 Verifying public assets..."
ls -la public/

echo "✅ Build completed successfully!"
echo "🌍 Ready to deploy to Render!"
