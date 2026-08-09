#!/bin/bash

# Test Runner Script
# Runs comprehensive test suite
# Usage: ./run-tests.sh [unit|integration|e2e|all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TEST_TYPE="${1:-all}"
COVERAGE_THRESHOLD=80

echo "=================================================="
echo "🧪 TEST RUNNER"
echo "=================================================="
echo "Test Type: $TEST_TYPE"
echo ""

# Helper functions
run_test() {
    local test_name=$1
    local test_cmd=$2

    echo -e "${BLUE}Running:${NC} $test_name"
    if eval "$test_cmd"; then
        echo -e "${GREEN}✅ PASSED${NC}: $test_name\n"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}: $test_name\n"
        return 1
    fi
}

# Initialize
PASSED=0
FAILED=0
TOTAL=0

# Check dependencies
check_dependencies() {
    echo "📦 Checking dependencies..."

    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 not found${NC}"
        exit 1
    fi

    if ! python3 -m pip list | grep -q pytest; then
        echo -e "${YELLOW}⚠️ pytest not installed${NC}"
        echo "   Run: pip install pytest pytest-cov pytest-asyncio"
    fi

    echo -e "${GREEN}✅ Dependencies OK${NC}\n"
}

# Run Unit Tests
run_unit_tests() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}1️⃣ UNIT TESTS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    if [ -d "tests/unit" ]; then
        ((TOTAL++))
        if run_test "Unit Tests" \
            "python -m pytest tests/unit/ -v --tb=short"; then
            ((PASSED++))
        else
            ((FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠️ No unit tests found${NC}\n"
    fi
}

# Run Integration Tests
run_integration_tests() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}2️⃣ INTEGRATION TESTS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    if [ -d "tests/integration" ]; then
        ((TOTAL++))
        if run_test "Integration Tests" \
            "python -m pytest tests/integration/ -v --tb=short"; then
            ((PASSED++))
        else
            ((FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠️ No integration tests found${NC}\n"
    fi
}

# Run E2E Tests
run_e2e_tests() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}3️⃣ END-TO-END TESTS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    if [ -d "tests/e2e" ]; then
        echo "Starting Flask server for E2E tests..."

        # Start server in background
        python nail_salon_checkin/app.py > /tmp/flask.log 2>&1 &
        FLASK_PID=$!

        # Wait for server to start
        sleep 2

        ((TOTAL++))
        if run_test "E2E Tests" \
            "python -m pytest tests/e2e/ -v --tb=short"; then
            ((PASSED++))
        else
            ((FAILED++))
        fi

        # Stop server
        kill $FLASK_PID 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠️ No E2E tests found${NC}\n"
    fi
}

# Run Coverage Analysis
run_coverage() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 COVERAGE ANALYSIS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    echo "Generating coverage report..."

    if python -m pytest tests/ --cov=nail_salon_checkin \
        --cov-report=term --cov-report=html > /tmp/coverage.txt 2>&1; then

        # Extract coverage percentage
        COVERAGE=$(grep -oP 'TOTAL\s+\d+\s+\d+\s+\K\d+(?=%)' /tmp/coverage.txt || echo "0")

        echo "Coverage: ${COVERAGE}%"

        if [ "$COVERAGE" -ge "$COVERAGE_THRESHOLD" ]; then
            echo -e "${GREEN}✅ Coverage OK${NC} (>= $COVERAGE_THRESHOLD%)\n"
        else
            echo -e "${YELLOW}⚠️ Coverage Low${NC} (< $COVERAGE_THRESHOLD%)"
            echo "   Run: python -m pytest --cov=nail_salon_checkin --cov-report=html"
            echo "   Then open: htmlcov/index.html\n"
        fi

        # Show coverage report location
        echo "📄 Coverage report: htmlcov/index.html"
    else
        echo -e "${RED}❌ Coverage analysis failed${NC}\n"
    fi
}

# Lint checks
run_linting() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}🎨 LINTING${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    if command -v flake8 &> /dev/null; then
        echo "Running flake8..."
        if flake8 nail_salon_checkin/ --max-line-length=100 \
            --ignore=E501,W503 > /dev/null; then
            echo -e "${GREEN}✅ Flake8 passed${NC}\n"
        else
            echo -e "${YELLOW}⚠️ Flake8 warnings found${NC}\n"
        fi
    else
        echo -e "${YELLOW}⚠️ flake8 not installed (skipping)${NC}\n"
    fi
}

# Main execution
main() {
    check_dependencies

    case $TEST_TYPE in
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        all)
            run_unit_tests
            run_integration_tests
            run_e2e_tests
            run_linting
            run_coverage
            ;;
        *)
            echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
            echo "Usage: $0 [unit|integration|e2e|all]"
            exit 1
            ;;
    esac

    # Summary
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📋 TEST SUMMARY${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

    if [ $TOTAL -gt 0 ]; then
        echo "Test Suites: ${PASSED}/${TOTAL} passed"

        if [ $FAILED -eq 0 ]; then
            echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
            exit 0
        else
            echo -e "${RED}❌ SOME TESTS FAILED${NC}"
            exit 1
        fi
    else
        echo "No tests run"
        exit 0
    fi
}

main
