#!/bin/bash

# 🚀 Render Auto-Deploy Script
# Usage: bash RENDER_DEPLOY.sh

set -e

echo "🚀 Network Security Audit - Render Deployment"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check git status
echo -e "${BLUE}[1/5]${NC} Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes found${NC}"
    echo "Stage, commit, and push your changes first:"
    echo "  git add ."
    echo "  git commit -m 'Your message'"
    echo "  git push origin main"
    exit 1
fi
echo -e "${GREEN}✅ Repository is clean${NC}"
echo ""

# Get branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}[2/5]${NC} Current branch: ${YELLOW}$BRANCH${NC}"
echo ""

# Check if files are ready
echo -e "${BLUE}[3/5]${NC} Verifying deployment files..."
FILES=(
    "network-security-audit/backend/Procfile"
    "network-security-audit/backend/requirements.txt"
    "network-security-audit/backend/app.py"
    "network-security-audit/frontend/package.json"
    "network-security-audit/frontend/public/index.html"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}❌ Missing: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All deployment files present${NC}"
echo ""

# Display deployment info
echo -e "${BLUE}[4/5]${NC} Deployment Information:"
echo "  📍 Repository: KEVIN-NGUYENDAD/huong-pharmacy-ai-copilot"
echo "  🌿 Branch: $BRANCH"
echo "  📦 Backend: network-security-audit/backend"
echo "  🎨 Frontend: network-security-audit/frontend"
echo ""

# Instructions
echo -e "${BLUE}[5/5]${NC} ${YELLOW}Next Steps:${NC}"
echo ""
echo "1️⃣  Go to: ${BLUE}https://render.com${NC}"
echo ""
echo "2️⃣  Create Backend Service:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect: KEVIN-NGUYENDAD/huong-pharmacy-ai-copilot"
echo "   - Name: network-security-audit-backend"
echo "   - Root: network-security-audit/backend"
echo "   - Environment: Python 3"
echo "   - Build: pip install -r requirements.txt"
echo "   - Start: gunicorn app:app"
echo ""
echo "3️⃣  Add Environment Variables (Backend):"
echo "   - FLASK_ENV=production"
echo "   - DEBUG=False"
echo "   - PORT=10000"
echo "   - CORS_ORIGINS=https://network-security-audit.onrender.com"
echo ""
echo "4️⃣  Create Frontend Service:"
echo "   - Click 'New +' → 'Static Site'"
echo "   - Connect: KEVIN-NGUYENDAD/huong-pharmacy-ai-copilot"
echo "   - Name: network-security-audit"
echo "   - Root: network-security-audit/frontend"
echo "   - Build: npm install && npm run build"
echo "   - Publish: build"
echo ""
echo "5️⃣  Add Environment Variables (Frontend):"
echo "   - REACT_APP_API_URL=https://network-security-audit-backend.onrender.com"
echo ""
echo "6️⃣  Wait 5-10 minutes for both to deploy ✅"
echo ""
echo "🎉 Done! Your app will be live at:"
echo "   ${GREEN}https://network-security-audit.onrender.com${NC}"
echo ""
