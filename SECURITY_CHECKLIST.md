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
