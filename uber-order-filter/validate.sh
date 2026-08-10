#!/bin/bash

# Uber Order Filter - Pre-Deployment Validation Script
# This script checks if the project is ready for deployment

echo "🔍 Uber Order Filter - Pre-Deployment Validation"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# ==========================================
# 1. FILE STRUCTURE CHECK
# ==========================================
echo "📁 Checking Project Structure..."
echo ""

# Check main folders
for dir in "app" "backend" "docs" "ios"; do
    if [ -d "$dir" ]; then
        check_pass "Found $dir/"
    else
        check_fail "Missing $dir/"
    fi
done

# Check important files
for file in "README.md" "PHASE_SUMMARY.md" ".gitignore"; do
    if [ -f "$file" ]; then
        check_pass "Found $file"
    else
        check_fail "Missing $file"
    fi
done

# Check app source files
if [ -f "app/src/App.tsx" ]; then
    check_pass "App.tsx found"
else
    check_fail "App.tsx missing"
fi

if [ -f "app/package.json" ]; then
    check_pass "app/package.json found"
else
    check_fail "app/package.json missing"
fi

if [ -f "ios/UberOrderFilter/OCRService.swift" ]; then
    check_pass "OCRService.swift found"
else
    check_fail "OCRService.swift missing"
fi

echo ""

# ==========================================
# 2. DEPENDENCY CHECK
# ==========================================
echo "📦 Checking Dependencies..."
echo ""

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not installed"
fi

if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version | head -1)
    check_pass "Xcode installed: $XCODE_VERSION"
else
    check_warn "Xcode not installed (required for iOS build)"
fi

# Check app dependencies
if [ -d "app/node_modules" ]; then
    check_pass "app/node_modules exists"
else
    check_warn "app/node_modules missing - run 'cd app && npm install'"
fi

echo ""

# ==========================================
# 3. CODE FILES CHECK
# ==========================================
echo "📝 Checking TypeScript Files..."
echo ""

# Count TypeScript files
TS_COUNT=$(find app/src -name "*.ts" -o -name "*.tsx" | wc -l)
echo "Found $TS_COUNT TypeScript files"

if [ "$TS_COUNT" -gt 10 ]; then
    check_pass "Sufficient TypeScript files ($TS_COUNT)"
else
    check_fail "Not enough TypeScript files ($TS_COUNT)"
fi

# Check key files exist
KEY_FILES=(
    "app/src/screens/HomeScreen.tsx"
    "app/src/screens/FiltersScreen.tsx"
    "app/src/screens/HistoryScreen.tsx"
    "app/src/screens/SettingsScreen.tsx"
    "app/src/services/filterService.ts"
    "app/src/services/storageService.ts"
    "app/src/services/ocrService.ts"
    "app/src/hooks/useOCRService.ts"
)

for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Found $file"
    else
        check_fail "Missing $file"
    fi
done

echo ""

# ==========================================
# 4. DOCUMENTATION CHECK
# ==========================================
echo "📚 Checking Documentation..."
echo ""

DOC_FILES=(
    "docs/iOS_SETUP.md"
    "docs/TESTING_GUIDE.md"
    "docs/DEPLOYMENT_GUIDE.md"
    "docs/PHASE_SUMMARY.md"
    "docs/PRE_DEPLOYMENT_CHECKLIST.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Found $file"
    else
        check_fail "Missing $file"
    fi
done

echo ""

# ==========================================
# 5. CONFIGURATION CHECK
# ==========================================
echo "⚙️  Checking Configuration Files..."
echo ""

CONFIG_FILES=(
    "app/app.json"
    "app/package.json"
    "app/tsconfig.json"
    "ios/UberOrderFilter/UberOrderFilter-Bridging-Header.h"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Found $file"
    else
        check_fail "Missing $file"
    fi
done

echo ""

# ==========================================
# 6. GIT STATUS CHECK
# ==========================================
echo "🔀 Checking Git Status..."
echo ""

if [ -d ".git" ]; then
    check_pass "Git repository found"

    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [[ "$BRANCH" == *"uber-order-filter"* ]]; then
        check_pass "On correct branch: $BRANCH"
    else
        check_warn "On branch: $BRANCH (expected: uber-order-filter branch)"
    fi

    COMMITS=$(git log --oneline | head -5 | wc -l)
    if [ "$COMMITS" -ge 3 ]; then
        check_pass "Commits present: $COMMITS recent commits"
    else
        check_warn "Only $COMMITS commits found"
    fi
else
    check_fail "Git repository not found"
fi

echo ""

# ==========================================
# 7. SUMMARY
# ==========================================
echo "=================================================="
echo "✅ Validation Summary"
echo "=================================================="
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT_GUIDE.md"
    echo "2. Follow PRE_DEPLOYMENT_CHECKLIST.md"
    echo "3. Build with: eas build --platform ios"
    echo "4. Submit to App Store"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed!${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi
