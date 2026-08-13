#!/bin/bash

# 🚀 ONE COMMAND DEPLOY
# Run this from your terminal to deploy everything to Render

set -e

RENDER_API_KEY="rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD"
REPO="https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot"

echo "🚀 Starting deployment to Render..."
echo ""

# ============================================================================
# Function to create service
# ============================================================================

create_backend_service() {
    echo "📦 Creating backend service..."

    OWNER_ID=$(curl -s -X GET "https://api.render.com/v1/user" \
      -H "Authorization: Bearer $RENDER_API_KEY" | jq -r '.id' 2>/dev/null || echo "")

    if [ -z "$OWNER_ID" ]; then
        echo "⚠️  Could not get owner ID, trying direct creation..."
    fi

    # Try to create service
    RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "web_service",
        "name": "network-security-audit-backend",
        "repo": "'"$REPO"'",
        "branch": "main",
        "buildCommand": "pip install -r requirements.txt",
        "startCommand": "gunicorn app:app",
        "envVars": [
          {"key": "FLASK_ENV", "value": "production"},
          {"key": "DEBUG", "value": "False"},
          {"key": "PYTHONUNBUFFERED", "value": "true"}
        ],
        "plan": "free",
        "region": "oregon",
        "rootDir": "network-security-audit/backend"
      }' 2>/dev/null)

    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

    echo "✅ Backend service creation initiated"
}

create_frontend_service() {
    echo ""
    echo "📦 Creating frontend service..."

    RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "static_site",
        "name": "network-security-audit-frontend",
        "repo": "'"$REPO"'",
        "branch": "main",
        "buildCommand": "npm install && npm run build",
        "publishPath": "build",
        "plan": "free",
        "region": "oregon",
        "rootDir": "network-security-audit/frontend"
      }' 2>/dev/null)

    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

    echo "✅ Frontend service creation initiated"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Creating Backend Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
create_backend_service

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Creating Frontend Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
create_frontend_service

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment commands sent!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Check status at:"
echo "   https://dashboard.render.com"
echo ""
echo "⏳ Services deploying now (2-3 minutes)..."
echo ""
echo "After deployment:"
echo "  Backend:  https://network-security-audit-backend.onrender.com"
echo "  Frontend: https://network-security-audit-frontend.onrender.com"
echo ""
echo "🎉 Done!"
