#!/bin/bash
set -euo pipefail

# SessionStart hook for Claude Code on web
# Installs dependencies for Network Security Audit frontend and backend

echo "📦 Installing frontend dependencies..."
cd network-security-audit/frontend
npm install
cd - > /dev/null

echo "🐍 Installing backend dependencies..."
cd network-security-audit/backend
pip install -q -r requirements.txt
cd - > /dev/null

echo "✅ All dependencies installed successfully!"
