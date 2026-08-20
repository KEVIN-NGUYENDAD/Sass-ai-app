#!/bin/bash
set -e

echo "🔨 Building Network Security Audit Backend..."
echo "Clearing Python cache..."
rm -rf __pycache__ *.pyc .pytest_cache
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

echo "Clearing pip cache..."
pip cache purge

echo "Installing dependencies (no cache)..."
pip install --no-cache-dir -r requirements.txt

echo "✅ Build complete!"
