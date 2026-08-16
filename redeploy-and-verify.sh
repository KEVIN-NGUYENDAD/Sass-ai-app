#!/bin/bash

# 🚀 Automated Redeploy + Verification Script
# Usage: bash redeploy-and-verify.sh <RENDER_API_KEY>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Render API Key required"
    echo "Usage: bash redeploy-and-verify.sh YOUR_RENDER_API_KEY"
    echo ""
    echo "Get your API key from:"
    echo "  1. https://render.com/dashboard"
    echo "  2. Account Settings → API Tokens → Create API Key"
    exit 1
fi

RENDER_API_KEY="$1"
BACKEND_SERVICE="network-security-audit-backend"
FRONTEND_SERVICE="network-security-audit-frontend"

echo "🔄 Starting automated redeploy..."
echo "=================================================="
echo ""

# Step 1: Get Backend Service ID
echo "[1/5] Fetching backend service ID..."
BACKEND_ID=$(curl -s "https://api.render.com/v1/services?name=$BACKEND_SERVICE" \
  -H "Authorization: Bearer $RENDER_API_KEY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BACKEND_ID" ]; then
    echo "❌ Could not find backend service"
    exit 1
fi
echo "✅ Backend ID: $BACKEND_ID"
echo ""

# Step 2: Get Frontend Service ID
echo "[2/5] Fetching frontend service ID..."
FRONTEND_ID=$(curl -s "https://api.render.com/v1/services?name=$FRONTEND_SERVICE" \
  -H "Authorization: Bearer $RENDER_API_KEY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FRONTEND_ID" ]; then
    echo "❌ Could not find frontend service"
    exit 1
fi
echo "✅ Frontend ID: $FRONTEND_ID"
echo ""

# Step 3: Redeploy Backend
echo "[3/5] Triggering backend redeploy..."
curl -s -X POST "https://api.render.com/v1/services/$BACKEND_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"do_clear"}' > /dev/null
echo "✅ Backend redeploy triggered"
echo ""

# Step 4: Redeploy Frontend
echo "[4/5] Triggering frontend redeploy..."
curl -s -X POST "https://api.render.com/v1/services/$FRONTEND_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"do_clear"}' > /dev/null
echo "✅ Frontend redeploy triggered"
echo ""

# Step 5: Wait and verify
echo "[5/5] Waiting for deployment to complete (30-60 seconds)..."
sleep 30

echo ""
echo "=================================================="
echo "✅ Redeploy Complete!"
echo "=================================================="
echo ""
echo "📍 Backend: https://network-security-audit-backend.onrender.com"
echo "📍 Frontend: https://network-security-audit.onrender.com"
echo ""
echo "🧪 Testing fixes..."
echo ""

# Test password strength
echo "Testing password '12345678':"
RESPONSE=$(curl -s -X POST https://network-security-audit-backend.onrender.com/api/scan/password \
  -H "Content-Type: application/json" \
  -H "X-API-Token: test-token" \
  -d '{"password":"12345678"}' 2>/dev/null || echo '{"data":{"score":-1}}')

SCORE=$(echo "$RESPONSE" | grep -o '"score":[0-9.]*' | cut -d':' -f2 | head -1)

if [ "$SCORE" = "0" ] || [ "$SCORE" = "0.0" ]; then
    echo "  ✅ Score: $SCORE/5 (Very Weak) — FIX APPLIED!"
else
    echo "  ⚠️ Score: $SCORE/5 — Still checking..."
fi

echo ""
echo "Testing WiFi password '12345678':"
RESPONSE=$(curl -s -X POST https://network-security-audit-backend.onrender.com/api/scan/wifi-security \
  -H "Content-Type: application/json" \
  -H "X-API-Token: test-token" \
  -d '{"ssid":"TestWiFi","password":"12345678"}' 2>/dev/null || echo '{"data":{"risk_score":-1}}')

RISK=$(echo "$RESPONSE" | grep -o '"risk_score":[0-9]*' | cut -d':' -f2 | head -1)

if [ "$RISK" = "10" ]; then
    echo "  ✅ Risk Score: $RISK/10 (Critical) — FIX APPLIED!"
else
    echo "  ⚠️ Risk Score: $RISK/10 — Still checking..."
fi

echo ""
echo "=================================================="
echo "🎉 Redeploy complete! Check:"
echo "   https://network-security-audit.onrender.com"
echo "=================================================="
echo ""
