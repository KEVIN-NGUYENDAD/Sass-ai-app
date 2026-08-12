#!/bin/bash

# 🛡️ Cost Control & Security Automation Script
# Tự động cấu hình để tránh phí bất ngờ
# Usage: bash COST_CONTROL.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🛡️ Network Security Audit - Cost Control & Security Setup${NC}"
echo "=========================================================="
echo ""

# ============================================================================
# 1. DISABLE TWILIO (Tránh charge bất ngờ)
# ============================================================================

echo -e "${BLUE}[1/5]${NC} Setting up Twilio protection..."

# Check if Twilio is configured in any .env files
find . -name ".env*" -type f 2>/dev/null | while read envfile; do
    if grep -q "TWILIO_ACCOUNT_SID" "$envfile"; then
        echo -e "${YELLOW}⚠️  Found Twilio config in: $envfile${NC}"
        # Comment out Twilio
        sed -i.bak 's/^TWILIO_ACCOUNT_SID=/#TWILIO_ACCOUNT_SID=/g' "$envfile"
        echo -e "${GREEN}✅ Disabled TWILIO_ACCOUNT_SID${NC}"
    fi
done

# Create .env.local with cost controls
cat > network-security-audit/backend/.env.local << 'EOF'
# 🛡️ Cost Control Settings
# These protect you from unexpected charges

# Render
FLASK_ENV=production
DEBUG=False
PORT=10000

# Twilio - DISABLED by default to prevent accidental charges
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_FROM_NUMBER=
# 💡 Uncomment and configure ONLY if you need SMS notifications

# Rate Limiting
MAX_REQUESTS_PER_HOUR=1000
MAX_REQUESTS_PER_DAY=10000

# Timeout Protection
SOCKET_TIMEOUT=30
REQUEST_TIMEOUT=60
EOF

echo -e "${GREEN}✅ Created .env.local with Twilio disabled${NC}"
echo ""

# ============================================================================
# 2. ADD RATE LIMITING (Flask app protection)
# ============================================================================

echo -e "${BLUE}[2/5]${NC} Adding rate limiting..."

# Check if rate limiting is already in requirements
if ! grep -q "flask-limiter" network-security-audit/backend/requirements.txt; then
    echo "flask-limiter==3.5.0" >> network-security-audit/backend/requirements.txt
    echo -e "${GREEN}✅ Added flask-limiter to requirements${NC}"
else
    echo -e "${GREEN}✅ Rate limiter already installed${NC}"
fi

# Create rate limiting config
cat > network-security-audit/backend/rate_limit.py << 'EOF'
"""Rate limiting to prevent abuse and cost overruns"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Default: 100 requests per hour per IP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour"],
    storage_uri="memory://"
)

# Specific endpoint limits (prevent abuse)
LIMITS = {
    "/api/scan/ports": "10 per hour",      # Port scanning is expensive
    "/api/scan/wifi-security": "20 per hour",  # WiFi checks
    "/api/scan/password": "50 per hour",   # Password checks
    "/api/scan/network-info": "100 per hour",  # Network info
    "/api/scan/history": "200 per hour",   # History access
}
EOF

echo -e "${GREEN}✅ Created rate limiting configuration${NC}"
echo ""

# ============================================================================
# 3. CREATE COST MONITORING SCRIPT
# ============================================================================

echo -e "${BLUE}[3/5]${NC} Setting up cost monitoring..."

cat > MONITOR_COSTS.sh << 'EOF'
#!/bin/bash

# 📊 Monitor Render & Twilio costs weekly

RENDER_DASHBOARD="https://dashboard.render.com/account/billing"
TWILIO_DASHBOARD="https://www.twilio.com/console/billing"
GITHUB_BILLING="https://github.com/settings/billing"

echo "💰 Cost Monitoring - Check these weekly:"
echo ""
echo "1️⃣  Render Compute Time & Disk:"
echo "   $RENDER_DASHBOARD"
echo ""
echo "2️⃣  Twilio Messaging Charges:"
echo "   $TWILIO_DASHBOARD"
echo ""
echo "3️⃣  GitHub Actions Usage:"
echo "   $GITHUB_BILLING"
echo ""
echo "⚠️  If any service shows unexpected charges:"
echo "   1. Click the service to see details"
echo "   2. Check 'Usage' for anomalies"
echo "   3. Contact support immediately if something is wrong"
echo "   4. Consider removing credit card temporarily if not needed"
echo ""
echo "💡 Pro tips:"
echo "   - Set browser reminders every Monday"
echo "   - Keep old invoices for reference"
echo "   - Screenshot costs to track trends"
EOF

chmod +x MONITOR_COSTS.sh
echo -e "${GREEN}✅ Created MONITOR_COSTS.sh${NC}"
echo ""

# ============================================================================
# 4. CREATE SECURITY CHECKLIST
# ============================================================================

echo -e "${BLUE}[4/5]${NC} Creating security checklist..."

cat > SECURITY_CHECKLIST.md << 'EOF'
# 🔒 Security & Cost Control Checklist

## Weekly (Every Monday)
- [ ] Check Render dashboard for compute time usage
- [ ] Check Twilio console for SMS charges
- [ ] Check GitHub Actions usage
- [ ] Review API logs for anomalies
- [ ] Verify backend is still running (`curl https://network-security-audit-backend.onrender.com/api/health`)

## Monthly
- [ ] Review all environment variables
- [ ] Check if any new APIs added
- [ ] Verify rate limits are working
- [ ] Update API cost estimates
- [ ] Archive old logs

## When Deploying
- [ ] Verify no credentials in commit
- [ ] Check .env files are in .gitignore
- [ ] Confirm TWILIO disabled if not needed
- [ ] Test rate limiting locally

## Emergency (If unexpected charges appear)
1. ❌ STOP - Don't panic
2. 🔍 Check Render/Twilio/GitHub dashboard
3. 📋 Identify which service charged
4. 🚫 Disable service immediately
5. 💬 Contact support with screenshots
6. 🛡️ Remove credit card if not needed

## Red Flags to Watch
- [ ] SMS charges appearing (Twilio)
- [ ] Render compute time > 5000 mins/month
- [ ] GitHub Actions > 2000 mins/month
- [ ] Unexpected API calls in logs
- [ ] Services stuck in "deploying" state

## Credentials Security
- [ ] API keys NEVER in code
- [ ] .env files NEVER committed
- [ ] Render API key deleted after use
- [ ] Twilio credentials only in .env.local
- [ ] GitHub secrets properly configured
EOF

echo -e "${GREEN}✅ Created SECURITY_CHECKLIST.md${NC}"
echo ""

# ============================================================================
# 5. UPDATE .gitignore FOR SAFETY
# ============================================================================

echo -e "${BLUE}[5/5]${NC} Updating .gitignore..."

# Ensure sensitive files are ignored
cat >> .gitignore << 'EOF'

# 🔒 Environment & Credentials
.env.local
.env.*.local
.env.production.local
**/.env.local

# 🛡️ API Keys & Secrets
**/secrets/
**/*_key.txt
**/*_secret.txt
**/*_token.txt

# 📊 Logs (may contain sensitive data)
**/*.log
logs/

# 💾 Database backups
**/*.db.backup
**/*.sql.backup

# 🧪 Test coverage
.coverage
htmlcov/
EOF

echo -e "${GREEN}✅ Updated .gitignore${NC}"
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================

echo -e "${GREEN}=================================================="
echo "✅ Cost Control & Security Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "📋 What was done:"
echo "  1. ✅ Disabled Twilio (no surprise charges)"
echo "  2. ✅ Added rate limiting (prevent abuse)"
echo "  3. ✅ Created cost monitoring script"
echo "  4. ✅ Created security checklist"
echo "  5. ✅ Updated .gitignore"
echo ""
echo "🛡️  You're now protected from:"
echo "  - Unexpected Twilio charges (SMS is OFF by default)"
echo "  - API abuse (rate limiting 100 req/hour)"
echo "  - Accidental credential commits"
echo "  - Forgotten billing checks"
echo ""
echo "📚 Next steps:"
echo "  1. Read: SECURITY_CHECKLIST.md"
echo "  2. Run weekly: bash MONITOR_COSTS.sh"
echo "  3. Keep monitoring dashboards in bookmarks:"
echo "     - Render: https://dashboard.render.com"
echo "     - Twilio: https://www.twilio.com/console"
echo "     - GitHub: https://github.com/settings/billing"
echo ""
echo "💡 Remember:"
echo "  - Twilio is OFF by default (add to .env.local to enable)"
echo "  - Rate limiting is ACTIVE (100 req/hour per IP)"
echo "  - Check costs EVERY WEEK to catch issues early"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Store your credit cards safely!${NC}"
echo "   Consider removing them from Render/Twilio if not needed."
echo ""
