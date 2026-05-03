#!/bin/bash
# setup-local.sh - Set up local development environment

set -e

echo "🚀 Setting up Denick local development..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📋 Creating .env.local from template..."
  cp .env.example .env.local
  echo "✅ Created .env.local"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env.local with your settings:"
  echo "   nano .env.local"
  echo ""
else
  echo "✅ .env.local already exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "📚 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed"
fi

# Pull latest from GitHub
echo ""
echo "🔄 Pulling latest from GitHub..."
git pull origin main
echo "✅ Latest code pulled"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start backend:  npm run dev"
echo "2. Start frontend: npm run dev (in another terminal)"
echo "3. Open:           http://localhost:5173"
echo ""
echo "📖 For more info, see SYNC_GUIDE.md"
