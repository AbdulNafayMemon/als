#!/bin/bash

# ALS Dashboard Deployment Script
# This script helps prepare and deploy the application

echo "🚀 ALS Dashboard Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "📝 Please update .env file with your configuration"
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if static export is enabled
if grep -q "output: 'export'" next.config.js; then
    echo "📁 Static export detected. Files are in the 'out' directory."
    echo "📤 You can upload the 'out' folder to your PHP server."
    echo "⚠️  Note: API functionality will not work with static export."
else
    echo "🌐 Full-stack application ready for deployment."
    echo "📤 Deploy to:"
    echo "   - Vercel: https://vercel.com"
    echo "   - Railway: https://railway.app"
    echo "   - Render: https://render.com"
    echo "   - DigitalOcean: https://cloud.digitalocean.com/apps"
fi

echo ""
echo "📋 Next steps:"
echo "1. Set up MongoDB Atlas database"
echo "2. Configure environment variables"
echo "3. Deploy to your chosen platform"
echo "4. Run database initialization: npm run init-db"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 