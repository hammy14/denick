#!/bin/bash
# deploy-production.sh - Deploy latest code to production
# Run this on the droplet after pushing to GitHub

set -e

echo "🚀 Deploying Denick to production..."
echo ""

# Check if we're on the droplet
if [ ! -d /home/apps/denick ]; then
  echo "❌ This script must be run on the production droplet"
  echo "   SSH into: ssh root@143.244.149.238"
  exit 1
fi

cd /home/apps/denick

# Pull latest code
echo "🔄 Pulling latest code from GitHub..."
git pull origin main
echo "✅ Latest code pulled"

# Restart backend
echo ""
echo "🔄 Restarting backend..."
pm2 restart denick
echo "✅ Backend restarted"

# Wait for backend to start
sleep 2

# Check status
echo ""
echo "📊 Backend status:"
pm2 status denick

# Test backend
echo ""
echo "🧪 Testing backend..."
if curl -s http://localhost:3001/api/health > /dev/null; then
  echo "✅ Backend is responding"
else
  echo "⚠️  Backend may not be responding yet, wait a moment and try again"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Frontend will auto-deploy via Vercel"
echo "Check: https://denick.vercel.app"
