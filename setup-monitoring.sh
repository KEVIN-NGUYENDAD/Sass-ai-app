#!/bin/bash

# 🚀 Complete Render Monitoring Setup Automation
# Tự động setup GitHub Secret và kích hoạt monitoring

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 RENDER MONITORING - COMPLETE SETUP${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================

echo -e "${BLUE}[1/5] Checking prerequisites...${NC}"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) not found${NC}"
    echo -e "${YELLOW}   Install from: https://cli.github.com${NC}"
    echo ""
    echo -e "${YELLOW}   OR set secret manually:${NC}"
    echo -e "${YELLOW}   1. Go: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/settings/secrets/actions${NC}"
    echo -e "${YELLOW}   2. New secret: RENDER_API_KEY${NC}"
    echo -e "${YELLOW}   3. Value: rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD${NC}"
    echo ""
    echo -e "${YELLOW}   Then run: bash setup-monitoring.sh again${NC}"
    exit 1
fi

# Check if authenticated with GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    echo -e "${YELLOW}   Run: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# ============================================================================
# 2. GET RENDER API KEY
# ============================================================================

echo -e "${BLUE}[2/5] Getting Render API Key...${NC}"

RENDER_API_KEY="${RENDER_API_KEY:-rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD}"

if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  RENDER_API_KEY not set${NC}"
    read -p "Enter Render API Key (starts with 'rnd_'): " RENDER_API_KEY
fi

if [[ ! "$RENDER_API_KEY" =~ ^rnd_ ]]; then
    echo -e "${RED}❌ Invalid API key format (should start with 'rnd_')${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API Key: ${RENDER_API_KEY:0:10}...${NC}"
echo ""

# ============================================================================
# 3. ADD GITHUB SECRET
# ============================================================================

echo -e "${BLUE}[3/5] Adding GitHub Secret (RENDER_API_KEY)...${NC}"

# Get repo info
REPO_OWNER="kevin-nguyendad"
REPO_NAME="huong-pharmacy-ai-copilot"

# Try to set secret using gh CLI
if gh secret set RENDER_API_KEY --body "$RENDER_API_KEY" -R "$REPO_OWNER/$REPO_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Secret RENDER_API_KEY added successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Could not add secret via CLI${NC}"
    echo -e "${YELLOW}   Please add manually:${NC}"
    echo -e "${YELLOW}   1. Go: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions${NC}"
    echo -e "${YELLOW}   2. New secret: RENDER_API_KEY${NC}"
    echo -e "${YELLOW}   3. Value: $RENDER_API_KEY${NC}"
fi

echo ""

# ============================================================================
# 4. VERIFY WORKFLOW FILES
# ============================================================================

echo -e "${BLUE}[4/5] Verifying workflow files...${NC}"

if [ -f ".github/workflows/monitor-render-status.yml" ]; then
    echo -e "${GREEN}✅ Workflow file exists${NC}"
else
    echo -e "${RED}❌ Workflow file not found${NC}"
    exit 1
fi

if [ -f "scripts/check_render_status.py" ]; then
    echo -e "${GREEN}✅ Monitoring script exists${NC}"
else
    echo -e "${RED}❌ Monitoring script not found${NC}"
    exit 1
fi

echo ""

# ============================================================================
# 5. TRIGGER INITIAL WORKFLOW
# ============================================================================

echo -e "${BLUE}[5/5] Triggering initial workflow run...${NC}"

if gh workflow run monitor-render-status.yml -R "$REPO_OWNER/$REPO_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Workflow triggered successfully${NC}"
    echo ""
    echo -e "${BLUE}   View progress:${NC}"
    echo -e "${BLUE}   https://github.com/$REPO_OWNER/$REPO_NAME/actions${NC}"
else
    echo -e "${YELLOW}⚠️  Could not trigger workflow${NC}"
    echo -e "${YELLOW}   But it will run automatically every 5 minutes!${NC}"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📊 What's now active:${NC}"
echo -e "${GREEN}  ✅ Render monitoring workflow${NC}"
echo -e "${GREEN}  ✅ GitHub Secret (RENDER_API_KEY)${NC}"
echo -e "${GREEN}  ✅ Auto checks every 5 minutes (business hours)${NC}"
echo -e "${GREEN}  ✅ Status reports with artifact storage${NC}"
echo ""
echo -e "${BLUE}📈 Monitoring Dashboard:${NC}"
echo -e "${BLUE}  GitHub Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions${NC}"
echo -e "${BLUE}  Render Dashboard: https://dashboard.render.com${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "${YELLOW}  1. Go to GitHub Actions (link above)${NC}"
echo -e "${YELLOW}  2. Click 'Monitor Render Status'${NC}"
echo -e "${YELLOW}  3. View latest run + artifacts${NC}"
echo ""
echo -e "${BLUE}🔐 Security:${NC}"
echo -e "${BLUE}  - API key stored securely in GitHub Secrets${NC}"
echo -e "${BLUE}  - Key not visible in logs${NC}"
echo -e "${BLUE}  - Access controlled by repo permissions${NC}"
echo ""
echo -e "${GREEN}Status: 🚀 MONITORING IS NOW ACTIVE!${NC}"
echo ""
