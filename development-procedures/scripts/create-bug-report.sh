#!/bin/bash

# Bug Report Creator
# Creates a structured bug report file for tracking issues
# Usage: ./create-bug-report.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Timestamp
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BUG_ID="BUG_${TIMESTAMP}"
REPORT_DIR="./.bug-reports"

mkdir -p "$REPORT_DIR"

echo "=================================================="
echo "🐛 BUG REPORT CREATOR"
echo "=================================================="
echo ""

# Function to prompt user
prompt() {
    local question=$1
    local default=$2
    local var_name=$3

    read -p "$question [$default]: " answer
    answer=${answer:-$default}
    eval "$var_name='$answer'"
}

# Gather information
echo "📝 STEP 1: BASIC INFORMATION"
echo "=================================="

prompt "Bug Title" "Describe the issue briefly" "BUG_TITLE"
prompt "Severity (Critical/Major/Minor)" "Major" "SEVERITY"
prompt "Component (API/UI/Database/SMS)" "API" "COMPONENT"

echo ""
echo "📝 STEP 2: REPRODUCTION STEPS"
echo "=================================="
echo "Enter reproduction steps (one per line, empty line to finish):"

STEPS=""
while IFS= read -r line; do
    if [ -z "$line" ]; then
        break
    fi
    STEPS="$STEPS- $line"$'\n'
done

echo ""
echo "📝 STEP 3: EXPECTED VS ACTUAL"
echo "=================================="

read -p "Expected behavior: " EXPECTED
read -p "Actual behavior: " ACTUAL

echo ""
echo "📝 STEP 4: ENVIRONMENT"
echo "=================================="

# Detect environment info
PYTHON_VERSION=$(python3 --version 2>&1 || echo "Unknown")
OS=$(uname -s)
TIMESTAMP=$(date)

prompt "Environment (Local/Staging/Production)" "Local" "ENVIRONMENT"

# Create report file
REPORT_FILE="$REPORT_DIR/${BUG_ID}.md"

cat > "$REPORT_FILE" << EOF
# 🐛 Bug Report

**ID:** $BUG_ID
**Date:** $TIMESTAMP
**Status:** OPEN
**Severity:** $SEVERITY
**Component:** $COMPONENT

---

## Summary

$BUG_TITLE

---

## Reproduction Steps

$STEPS

---

## Expected Behavior

$EXPECTED

---

## Actual Behavior

$ACTUAL

---

## Environment

- **Python:** $PYTHON_VERSION
- **OS:** $OS
- **Environment:** $ENVIRONMENT
- **Browser:** (if applicable)

---

## Root Cause Analysis

(To be filled after investigation)

---

## Proposed Fix

(To be filled after analysis)

---

## Testing Notes

- [ ] Reproducible on local environment
- [ ] Reproducible on staging
- [ ] Reproducible on production
- [ ] Can be fixed without breaking other features
- [ ] Fix verified with tests

---

## References

Related issues:
- (link to issues if applicable)

---

## Priority Checklist

**This bug is critical if:**
- [ ] System is down or unusable
- [ ] Data is corrupted or lost
- [ ] Security issue exists
- [ ] Critical feature is broken

**This bug is major if:**
- [ ] Important feature partially broken
- [ ] Workaround exists but inconvenient
- [ ] Performance significantly degraded

**This bug is minor if:**
- [ ] Cosmetic issue only
- [ ] Affects edge case only
- [ ] Easy workaround available
- [ ] Low-impact functionality affected

---

**Created by:** $(whoami)
**Last Updated:** $TIMESTAMP
EOF

echo ""
echo -e "${GREEN}✅ BUG REPORT CREATED${NC}"
echo "Location: $REPORT_FILE"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Review the bug report: cat $REPORT_FILE"
echo "2. Create GitHub issue with this information"
echo "3. Assign to appropriate developer"
echo "4. Update status as work progresses"
echo ""
echo "🏷️ SUGGESTED GITHUB ISSUE LABELS:"
echo "- bug/$SEVERITY (bug/critical, bug/major, bug/minor)"
echo "- component/$COMPONENT"
echo ""

# Offer to open in editor
read -p "Open in editor? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} "$REPORT_FILE"
fi

echo -e "${GREEN}✅ DONE${NC}"
