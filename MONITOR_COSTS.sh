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
