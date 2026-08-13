#!/bin/bash
# 🔧 FIX RENDER DEPLOYMENT - RUN THIS ON YOUR LOCAL MACHINE

set -e

RENDER_API_KEY="rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD"
REPO="https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot"

echo "🚀 FIXING RENDER DEPLOYMENT..."
echo ""

# Step 1: Get services
echo "📋 Step 1: Fetching current services..."
SERVICES=$(curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY")

FRONTEND_ID=$(echo "$SERVICES" | jq -r '.[] | select(.name=="network-security-audit-frontend") | .id' 2>/dev/null || echo "")
BACKEND_ID=$(echo "$SERVICES" | jq -r '.[] | select(.name=="network-security-audit-backend") | .id' 2>/dev/null || echo "")

echo "Frontend ID: $FRONTEND_ID"
echo "Backend ID: $BACKEND_ID"
echo ""

# Step 2: Delete broken frontend
if [ ! -z "$FRONTEND_ID" ] && [ "$FRONTEND_ID" != "null" ]; then
  echo "🗑️  Step 2: Deleting broken frontend service..."
  curl -s -X DELETE "https://api.render.com/v1/services/$FRONTEND_ID" \
    -H "Authorization: Bearer $RENDER_API_KEY" > /dev/null
  echo "✅ Deleted: $FRONTEND_ID"
  echo "⏳ Waiting 10 seconds..."
  sleep 10
  echo ""
fi

# Step 3: Create new frontend service
echo "📦 Step 3: Creating new static site frontend..."
NEW_FRONTEND=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "static_site",
    "name": "network-security-audit-frontend",
    "repo": "'"$REPO"'",
    "branch": "main",
    "buildCommand": "cd network-security-audit/frontend && npm install && npm run build",
    "publishPath": "network-security-audit/frontend/build",
    "plan": "free",
    "region": "oregon",
    "envVars": [
      {
        "key": "REACT_APP_API_URL",
        "value": "https://network-security-audit-backend.onrender.com"
      }
    ]
  }')

NEW_FRONTEND_ID=$(echo "$NEW_FRONTEND" | jq -r '.id' 2>/dev/null || echo "")
echo "✅ Created: $NEW_FRONTEND_ID"
echo ""

# Step 4: Update backend CORS
if [ ! -z "$BACKEND_ID" ] && [ "$BACKEND_ID" != "null" ]; then
  echo "🔧 Step 4: Updating backend CORS configuration..."
  curl -s -X PATCH "https://api.render.com/v1/services/$BACKEND_ID" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "envVars": [
        {"key": "FLASK_ENV", "value": "production"},
        {"key": "DEBUG", "value": "False"},
        {"key": "CORS_ORIGINS", "value": "https://network-security-audit-frontend.onrender.com"},
        {"key": "PYTHONUNBUFFERED", "value": "true"}
      ]
    }' > /dev/null

  # Trigger redeploy
  curl -s -X POST "https://api.render.com/v1/services/$BACKEND_ID/deploys" \
    -H "Authorization: Bearer $RENDER_API_KEY" > /dev/null

  echo "✅ Backend updated and redeploying"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEPLOYMENT FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏳ Wait 3-5 minutes for deployment to complete"
echo ""
echo "Then check:"
echo "  Frontend: https://network-security-audit-frontend.onrender.com"
echo "  Backend:  https://network-security-audit-backend.onrender.com/api/health"
echo ""
echo "🎉 Done!"
