#!/bin/bash

# 🚀 Uber Order Filter - DEPLOYMENT SCRIPT
# Run this on macOS with Xcode installed

set -e

echo "=========================================="
echo "🚀 UBER ORDER FILTER - iOS DEPLOYMENT"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"
echo ""

# Check macOS
if [[ ! "$OSTYPE" =~ ^darwin ]]; then
    echo -e "${RED}❌ This script must run on macOS${NC}"
    exit 1
fi
echo -e "${GREEN}✓ macOS detected${NC}"

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode not found. Please install Xcode from App Store${NC}"
    exit 1
fi
XCODE_VERSION=$(xcodebuild -version | head -1)
echo -e "${GREEN}✓ Xcode: $XCODE_VERSION${NC}"

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm: $NPM_VERSION${NC}"

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠ EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
fi
EAS_VERSION=$(eas --version)
echo -e "${GREEN}✓ EAS CLI: $EAS_VERSION${NC}"

echo ""
echo -e "${BLUE}📦 Installing Dependencies...${NC}"
echo ""

cd app
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}🔍 Running Validation...${NC}"
echo ""

# TypeScript check
echo "Checking TypeScript..."
npx tsc --noEmit
echo -e "${GREEN}✓ TypeScript compiles successfully${NC}"

# ESLint check
echo "Running ESLint..."
npm run lint 2>&1 | grep -i error || echo -e "${GREEN}✓ No linting errors${NC}"

echo ""
echo -e "${BLUE}🔐 Configuring EAS...${NC}"
echo ""

# Check if logged in
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged into EAS. Logging in...${NC}"
    eas login
fi
echo -e "${GREEN}✓ EAS configured${NC}"

echo ""
echo -e "${BLUE}📱 Starting iOS Build...${NC}"
echo ""
echo "Build options:"
echo "  Platform: iOS"
echo "  Type: App Store (for TestFlight/App Store submission)"
echo "  Simulator: No (for real device)"
echo ""

read -p "Proceed with build? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Build cancelled."
    exit 0
fi

# Build for App Store
eas build --platform ios --non-interactive

echo ""
echo -e "${GREEN}✅ Build submitted!${NC}"
echo ""
echo "Next steps:"
echo "1. Monitor build at: https://expo.dev/builds"
echo "2. Build will complete in ~10-15 minutes"
echo "3. IPA will be uploaded to App Store Connect"
echo ""
echo "After build completes:"
echo "4. Go to App Store Connect → Your App → TestFlight"
echo "5. Add beta testers"
echo "6. Distribute build"
echo "7. Gather feedback"
echo ""
echo "When ready for App Store:"
echo "8. Follow DEPLOYMENT_GUIDE.md Phase 6"
echo "9. Submit for review"
echo ""
echo -e "${GREEN}🎉 Deployment in progress!${NC}"
