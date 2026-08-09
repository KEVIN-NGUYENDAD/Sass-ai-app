#!/bin/bash

# Deployment Verification Script
# Performs automated checks after deployment
# Usage: ./verify-deployment.sh <environment-url>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT_URL="${1:-https://nail-salon-checkin.onrender.com}"
TIMEOUT=10

echo "=================================================="
echo "🔍 DEPLOYMENT VERIFICATION SCRIPT"
echo "=================================================="
echo "Environment: $ENVIRONMENT_URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Track results
PASSED=0
FAILED=0

# Helper functions
check_url() {
    local url=$1
    local name=$2

    echo -n "Checking $name... "
    if timeout $TIMEOUT curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

check_status_code() {
    local url=$1
    local name=$2
    local expected_code=$3

    echo -n "Checking $name... "
    local status_code=$(timeout $TIMEOUT curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$status_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $status_code, expected $expected_code)"
        ((FAILED++))
        return 1
    fi
}

check_response_time() {
    local url=$1
    local name=$2
    local max_time=$3  # milliseconds

    echo -n "Checking $name response time... "
    local time=$(timeout $TIMEOUT curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "9999")
    local time_ms=$(echo "$time * 1000" | bc | cut -d. -f1)

    if (( time_ms < max_time )); then
        echo -e "${GREEN}✅ PASS${NC} (${time_ms}ms)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (${time_ms}ms, max ${max_time}ms)"
        ((FAILED++))
        return 1
    fi
}

# 1. Health Checks
echo "📊 HEALTH CHECKS"
echo "=================="
check_url "$ENVIRONMENT_URL/" "Home page"
check_url "$ENVIRONMENT_URL/staff-login" "Staff login page"
check_status_code "$ENVIRONMENT_URL/staff" 302 "Staff auth check (should redirect)"
echo ""

# 2. Performance Checks
echo "⚡ PERFORMANCE"
echo "=================="
check_response_time "$ENVIRONMENT_URL/" "Home page" 2000
check_response_time "$ENVIRONMENT_URL/staff-login" "Staff login" 2000
echo ""

# 3. API Endpoints
echo "🔌 API ENDPOINTS"
echo "=================="
check_status_code "$ENVIRONMENT_URL/api/staff-login" 405 "Login endpoint (should require POST)"
check_url "$ENVIRONMENT_URL/api/customers" "Get customers endpoint"
echo ""

# 4. Functional Tests
echo "✨ FUNCTIONAL TESTS"
echo "=================="

# Test check-in creation
echo -n "Testing check-in creation... "
CHECK_IN_DATA='{"name":"Test","phone":"555-1234","service":"Test","date":"2026-08-09","time":"10:00","nickname":"T"}'
RESPONSE=$(timeout $TIMEOUT curl -s -X POST "$ENVIRONMENT_URL/api/checkin" \
    -H "Content-Type: application/json" \
    -d "$CHECK_IN_DATA" 2>/dev/null || echo "")

if echo "$RESPONSE" | grep -q "id\|error"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

# Test customers list
echo -n "Testing customers list... "
if timeout $TIMEOUT curl -sf "$ENVIRONMENT_URL/api/customers" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo ""

# 5. Summary
echo "=================================================="
echo "📋 SUMMARY"
echo "=================================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo "Deployment verified successfully!"
    exit 0
else
    echo -e "\n${RED}❌ SOME CHECKS FAILED${NC}"
    echo "Please investigate the failures above."
    exit 1
fi
