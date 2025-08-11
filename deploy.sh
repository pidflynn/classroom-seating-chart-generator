#!/bin/bash
# Quick deployment script for Classroom Seating Chart Generator

echo "🏗️  Building production version..."
npm run build

echo "📁 Copying required files..."
cp defaultSettings.json dist/
cp metadata.json dist/

echo "✅ Build complete! Files ready for deployment in 'dist' folder."
echo ""
echo "📋 Next steps:"
echo "1. Copy everything from 'dist' folder to your web host"
echo "2. For GitHub Pages: copy dist contents to your repository root"
echo "3. For Netlify: drag the 'dist' folder to netlify.com/drop"
echo ""
echo "📁 Your deployment files are in: $(pwd)/dist"
echo "🌐 Total size: $(du -sh dist | cut -f1)"

# List the deployment files
echo ""
echo "📄 Deployment files:"
ls -la dist/