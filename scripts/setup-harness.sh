#!/bin/bash

# ============================================================================
# setup-harness.sh - Harness Setup Script cho Dự Án Mới
# ============================================================================
# Usage: bash setup-harness.sh <project-name> [port]
# Example: bash setup-harness.sh my-salon-app 5001
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check arguments
if [ -z "$1" ]; then
    print_error "Project name required!"
    echo ""
    echo "Usage: bash setup-harness.sh <project-name> [port]"
    echo "Example: bash setup-harness.sh my-salon-app 5001"
    exit 1
fi

PROJECT_NAME=$1
PORT=${2:-5000}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_header "🚀 Harness Setup for New Project"
print_info "Project: $PROJECT_NAME"
print_info "Port: $PORT"
print_info "Timestamp: $TIMESTAMP"
echo ""

# Step 1: Check if .claude directory exists
print_info "Step 1/5: Checking .claude directory..."
if [ ! -d ".claude" ]; then
    print_warning ".claude directory not found, creating..."
    mkdir -p .claude
fi
print_success ".claude directory ready"
echo ""

# Step 2: Check if harness template exists
print_info "Step 2/5: Looking for harness template..."
HARNESS_TEMPLATE=".claude/harness-template.yml"
if [ ! -f "$HARNESS_TEMPLATE" ]; then
    print_error "Harness template not found at $HARNESS_TEMPLATE"
    echo "Please run this script from a harness-enabled project directory"
    exit 1
fi
print_success "Harness template found"
echo ""

# Step 3: Copy and customize harness.yml
print_info "Step 3/5: Creating harness.yml for $PROJECT_NAME..."
cp "$HARNESS_TEMPLATE" ".claude/harness.yml"

# Replace placeholders
sed -i "s|HARNESS_PROJECT_NAME|$PROJECT_NAME|g" ".claude/harness.yml"
sed -i "s|HARNESS_PROJECT_DESC|Harness configuration for $PROJECT_NAME|g" ".claude/harness.yml"
sed -i "s|HARNESS_PORT|$PORT|g" ".claude/harness.yml"

print_success "harness.yml created with:"
print_info "  - Project name: $PROJECT_NAME"
print_info "  - Port: $PORT"
echo ""

# Step 4: Create settings.json
print_info "Step 4/5: Creating .claude/settings.json..."
cat > ".claude/settings.json" << EOF
{
  "version": "1.0",
  "project": "$PROJECT_NAME",
  "description": "Harness-enabled Flask project",
  "port": $PORT,

  "hooks": {
    "on_session_start": {
      "enabled": true,
      "command": "echo '🚀 Harness ready for $PROJECT_NAME! Run: harness dev start-server'",
      "description": "Remind user harness is active"
    }
  },

  "aliases": {
    "start": "harness dev start-server",
    "test": "harness test run-tests",
    "lint": "harness test lint-code",
    "deploy": "harness deploy verify-deployment"
  },

  "environment": {
    "FLASK_APP": "app.py",
    "FLASK_ENV": "development",
    "PYTHONUNBUFFERED": "1"
  }
}
EOF
print_success "settings.json created"
echo ""

# Step 5: Create backup and log
print_info "Step 5/5: Creating backup and log..."
BACKUP_DIR=".claude/backups"
mkdir -p "$BACKUP_DIR"

cat > "$BACKUP_DIR/setup-${TIMESTAMP}.log" << EOF
Harness Setup Log
=================
Date: $TIMESTAMP
Project: $PROJECT_NAME
Port: $PORT

Template: $HARNESS_TEMPLATE
Created files:
  - .claude/harness.yml
  - .claude/settings.json

Setup completed successfully!
EOF

print_success "Backup created at $BACKUP_DIR"
echo ""

# Final summary
print_header "✅ Harness Setup Complete!"
echo ""
print_success "Files created:"
echo "  1. .claude/harness.yml"
echo "  2. .claude/settings.json"
echo ""
print_success "Next steps:"
echo "  1. Install dependencies:"
echo "     $ pip install -r requirements.txt"
echo ""
echo "  2. Start development server:"
echo "     $ harness dev start-server"
echo ""
echo "  3. Run tests:"
echo "     $ harness test run-tests"
echo ""
echo "  4. Check available commands:"
echo "     $ cat .claude/HARNESS_CHEATSHEET.md"
echo ""
print_info "For more info, read .claude/HARNESS_GUIDE.md"
echo ""
print_success "Happy coding! 🎉"
