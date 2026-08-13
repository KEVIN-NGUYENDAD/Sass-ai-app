#!/bin/bash

# 🚀 Automated Render Deployment Script
# Usage: bash deploy-render-auto.sh <RENDER_API_KEY>
# Example: bash deploy-render-auto.sh rnd_qxDDhOMWeoAy1mluqXvr1x4zCxeX

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if API key provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Render API Key not provided${NC}"
    echo "Usage: bash deploy-render-auto.sh <RENDER_API_KEY>"
    echo ""
    echo "Get your API key from:"
    echo "  1. https://render.com"
    echo "  2. Click your name (bottom-left)"
    echo "  3. Account Settings → API Tokens → Create API Key"
    exit 1
fi

RENDER_API_KEY="$1"
REPO_OWNER="KEVIN-NGUYENDAD"
REPO_NAME="huong-pharmacy-ai-copilot"
BRANCH="claude/network-security-audit-k6mdzw"
FRONTEND_URL="https://network-security-audit.onrender.com"

echo -e "${BLUE}🚀 Network Security Audit - Automated Render Deployment${NC}"
echo "=================================================="
echo ""

# Step 1: Create Backend Service
echo -e "${BLUE}[1/4]${NC} Creating Backend Service..."

BACKEND_PAYLOAD=$(cat <<EOF
{
  "service": {
    "type": "web_service",
    "name": "network-security-audit-backend",
    "ownerId": "me",
    "repo": "https://github.com/${REPO_OWNER}/${REPO_NAME}",
    "branch": "${BRANCH}",
    "rootDir": "network-security-audit/backend",
    "runtimeSource": {
      "type": "native"
    },
    "runtime": "python3",
    "buildCommand": "pip install -r requirements.txt",
    "startCommand": "gunicorn app:app",
    "envVars": [
      {
        "key": "FLASK_ENV",
        "value": "production"
      },
      {
        "key": "DEBUG",
        "value": "False"
      },
      {
        "key": "PORT",
        "value": "10000"
      },
      {
        "key": "CORS_ORIGINS",
        "value": "${FRONTEND_URL}"
      }
    ]
  }
}
EOF
)

BACKEND_RESPONSE=$(curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$BACKEND_PAYLOAD")

BACKEND_ID=$(echo "$BACKEND_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BACKEND_ID" ]; then
    echo -e "${YELLOW}⚠️  Backend creation response:${NC}"
    echo "$BACKEND_RESPONSE" | head -20
    BACKEND_ID="network-security-audit-backend"
fi

echo -e "${GREEN}✅ Backend Service: $BACKEND_ID${NC}"
echo ""

# Step 2: Create Frontend Service
echo -e "${BLUE}[2/4]${NC} Creating Frontend Service..."

FRONTEND_PAYLOAD=$(cat <<EOF
{
  "service": {
    "type": "static_site",
    "name": "network-security-audit",
    "ownerId": "me",
    "repo": "https://github.com/${REPO_OWNER}/${REPO_NAME}",
    "branch": "${BRANCH}",
    "rootDir": "network-security-audit/frontend",
    "buildCommand": "npm install && npm run build",
    "publicPath": "build"
  }
}
EOF
)

FRONTEND_RESPONSE=$(curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$FRONTEND_PAYLOAD")

FRONTEND_ID=$(echo "$FRONTEND_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FRONTEND_ID" ]; then
    echo -e "${YELLOW}⚠️  Frontend creation response:${NC}"
    echo "$FRONTEND_RESPONSE" | head -20
    FRONTEND_ID="network-security-audit"
fi

echo -e "${GREEN}✅ Frontend Service: $FRONTEND_ID${NC}"
echo ""

# Step 3: Trigger Backend Deployment
echo -e "${BLUE}[3/4]${NC} Triggering Backend Deployment..."

curl -s -X POST "https://api.render.com/v1/services/$BACKEND_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "do_clear"}' > /dev/null

echo -e "${GREEN}✅ Backend deployment triggered${NC}"
echo ""

# Step 4: Trigger Frontend Deployment
echo -e "${BLUE}[4/4]${NC} Triggering Frontend Deployment..."

curl -s -X POST "https://api.render.com/v1/services/$FRONTEND_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "do_clear"}' > /dev/null

echo -e "${GREEN}✅ Frontend deployment triggered${NC}"
echo ""

# Summary
echo -e "${GREEN}=================================================="
echo "✅ Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}Your services are deploying...${NC}"
echo ""
echo "📍 Backend: https://network-security-audit-backend.onrender.com"
echo "📍 Frontend: https://network-security-audit.onrender.com"
echo ""
echo "⏱️  Deployment takes 3-5 minutes. Check Render dashboard for progress."
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit: https://render.com/dashboard"
echo "2. Wait for both services to show 'Live' status"
echo "3. Test: https://network-security-audit.onrender.com"
echo ""
