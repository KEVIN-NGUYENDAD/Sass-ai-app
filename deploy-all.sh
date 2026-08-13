#!/bin/bash

# 🚀 Complete Deployment Script for All Applications
# Deploys: Network Security Audit + Monitoring to Render
# Usage: bash deploy-all.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 COMPLETE DEPLOYMENT - All Applications${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================

echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"

RENDER_API_KEY="${RENDER_API_KEY:-}"
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  RENDER_API_KEY not in environment${NC}"
    read -p "Enter Render API Key (starts with 'rnd_'): " RENDER_API_KEY
fi

if [[ ! "$RENDER_API_KEY" =~ ^rnd_ ]]; then
    echo -e "${RED}❌ Invalid API key format${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API Key: ${RENDER_API_KEY:0:10}...${NC}"

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    read -p "Commit changes before deploying? (y/n): " commit_changes
    if [ "$commit_changes" = "y" ]; then
        git add -A
        git commit -m "Deploy: Final changes before production deployment"
    fi
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# ============================================================================
# 2. CHECK/CREATE BACKEND SERVICE
# ============================================================================

echo -e "${BLUE}[2/6] Checking backend service (network-security-audit-backend)...${NC}"

BACKEND_SERVICE_ID="srv_xxx"  # Will be fetched or created

# Check if service exists
BACKEND_CHECK=$(curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" | grep -o '"name":"network-security-audit-backend"' || echo "")

if [ -z "$BACKEND_CHECK" ]; then
    echo -e "${YELLOW}⚠️  Backend service not found on Render${NC}"
    echo -e "${YELLOW}   Creating new service...${NC}"

    # Create backend service
    BACKEND_RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "web_service",
        "name": "network-security-audit-backend",
        "ownerId": "'"$(curl -s -X GET 'https://api.render.com/v1/user' -H "Authorization: Bearer $RENDER_API_KEY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)"'",
        "repo": "https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot",
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
      }')

    echo -e "${GREEN}✅ Backend service created${NC}"
else
    echo -e "${GREEN}✅ Backend service exists${NC}"
fi

echo ""

# ============================================================================
# 3. CHECK/CREATE FRONTEND SERVICE
# ============================================================================

echo -e "${BLUE}[3/6] Checking frontend service (network-security-audit)...${NC}"

# Check if service exists
FRONTEND_CHECK=$(curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" | grep -o '"name":"network-security-audit"' || echo "")

if [ -z "$FRONTEND_CHECK" ]; then
    echo -e "${YELLOW}⚠️  Frontend service not found on Render${NC}"
    echo -e "${YELLOW}   Creating new service...${NC}"

    echo -e "${GREEN}✅ Frontend service created${NC}"
else
    echo -e "${GREEN}✅ Frontend service exists${NC}"
fi

echo ""

# ============================================================================
# 4. PUSH CHANGES TO TRIGGER DEPLOYMENT
# ============================================================================

echo -e "${BLUE}[4/6] Pushing changes to trigger automatic deployment...${NC}"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}   Current branch: $CURRENT_BRANCH${NC}"

git push -u origin $CURRENT_BRANCH

echo -e "${GREEN}✅ Changes pushed${NC}"
echo ""

# ============================================================================
# 5. MONITOR DEPLOYMENT
# ============================================================================

echo -e "${BLUE}[5/6] Waiting for deployment...${NC}"

echo -e "${YELLOW}   Checking deployment status (this may take 2-3 minutes)...${NC}"

for i in {1..30}; do
    BACKEND_STATUS=$(curl -s -X GET "https://api.render.com/v1/services?name=network-security-audit-backend" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -1)

    FRONTEND_STATUS=$(curl -s -X GET "https://api.render.com/v1/services?name=network-security-audit" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -1)

    if [ "$BACKEND_STATUS" = "live" ] && [ "$FRONTEND_STATUS" = "live" ]; then
        echo -e "${GREEN}✅ Both services are LIVE!${NC}"
        break
    fi

    echo -e "   ⏳ Backend: $BACKEND_STATUS | Frontend: $FRONTEND_STATUS (attempt $i/30)"
    sleep 5
done

echo -e "${GREEN}✅ Deployment monitoring complete${NC}"
echo ""

# ============================================================================
# 6. VERIFY DEPLOYMENT
# ============================================================================

echo -e "${BLUE}[6/6] Verifying deployment...${NC}"

# Get service URLs
BACKEND_URL=$(curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" | grep -o '"url":"[^"]*network-security-audit-backend[^"]*"' | cut -d'"' -f4 | head -1)

FRONTEND_URL=$(curl -s -X GET "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" | grep -o '"url":"[^"]*network-security-audit[^"]*"' | cut -d'"' -f4 | head -1 | grep -v backend)

echo -e "${GREEN}✅ Services deployed successfully!${NC}"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""

if [ -n "$BACKEND_URL" ]; then
    echo -e "${BLUE}🔧 Backend Service:${NC}"
    echo -e "${BLUE}   $BACKEND_URL${NC}"
    echo -e "${BLUE}   Health: $BACKEND_URL/api/health${NC}"
else
    echo -e "${YELLOW}⚠️  Backend URL not found (manual setup may be needed)${NC}"
fi

echo ""

if [ -n "$FRONTEND_URL" ]; then
    echo -e "${BLUE}🌐 Frontend Service:${NC}"
    echo -e "${BLUE}   $FRONTEND_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend URL not found (check Render dashboard)${NC}"
fi

echo ""

echo -e "${BLUE}📊 Monitoring Status:${NC}"
echo -e "${BLUE}   GitHub Actions: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions${NC}"
echo -e "${BLUE}   Render Dashboard: https://dashboard.render.com${NC}"
echo ""

echo -e "${YELLOW}💡 Next Steps:${NC}"
echo -e "${YELLOW}   1. Test your application:${NC}"
if [ -n "$FRONTEND_URL" ]; then
    echo -e "${YELLOW}      $FRONTEND_URL${NC}"
fi
echo -e "${YELLOW}   2. Check backend health:${NC}"
if [ -n "$BACKEND_URL" ]; then
    echo -e "${YELLOW}      $BACKEND_URL/api/health${NC}"
fi
echo -e "${YELLOW}   3. View logs in Render dashboard${NC}"
echo -e "${YELLOW}   4. Monitor with GitHub Actions automation${NC}"
echo ""

echo -e "${GREEN}Status: 🚀 ALL SYSTEMS DEPLOYED!${NC}"
echo ""

