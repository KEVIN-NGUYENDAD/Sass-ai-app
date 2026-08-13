# 🚀 Automated Render Deployment

**Deploy your Network Security Audit app to Render in 1 command!**

## Quick Start

### Step 1: Get Render API Key
1. Go to https://render.com
2. Click your name (bottom-left)
3. Click **Account Settings**
4. Go to **API Tokens**
5. Click **Create API Key**
6. Copy the key (shown only once!)

### Step 2: Run Deployment Script
```bash
bash deploy-render-auto.sh YOUR_API_KEY_HERE
```

**Example:**
```bash
bash deploy-render-auto.sh rnd_qxDDhOMWeoAy1mluqXvr1x4zCxeX
```

### Step 3: Wait for Deployment
- Script creates both backend and frontend services
- Starts automatic deployment
- Takes 3-5 minutes total

### Step 4: Check Services
Visit https://render.com/dashboard to monitor:
- ✅ `network-security-audit-backend` (Python/Flask)
- ✅ `network-security-audit` (React Static Site)

## URLs After Deployment
- **Frontend:** https://network-security-audit.onrender.com
- **Backend API:** https://network-security-audit-backend.onrender.com

## What the Script Does

1. ✅ Creates backend Web Service (Python 3)
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
   - Env vars: FLASK_ENV, DEBUG, PORT, CORS_ORIGINS

2. ✅ Creates frontend Static Site (React)
   - Build: `npm install && npm run build`
   - Publish: `build/` directory

3. ✅ Sets environment variables automatically

4. ✅ Triggers deployments for both services

## Troubleshooting

### "API Key not provided"
```bash
# Make sure to pass your API key:
bash deploy-render-auto.sh YOUR_KEY_HERE
```

### Services not showing up
- Check Render dashboard: https://render.com/dashboard
- Click service name to view deployment logs
- Deployment typically takes 3-5 minutes

### Backend Not Connecting
- Verify CORS_ORIGINS in backend environment variables
- Should match frontend URL exactly
- Redeploy backend if needed

### Port Scanner Not Working
- Port scanning works best with localhost/127.0.0.1
- Render may restrict outbound port scanning
- Other features should work normally

## After Deployment

### Delete API Key (Recommended for Security)
```bash
# Delete your API key from Render after deployment
# Go to: https://render.com → Account Settings → API Tokens
# Click delete on the key you just used
```

### Automatic Deployments
Future code pushes to `claude/network-security-audit-k6mdzw` branch automatically deploy via GitHub Actions (if configured with RENDER_API_KEY secret).

## Questions?

Check the comprehensive guide:
- `DEPLOYMENT.md` - Detailed manual deployment guide
- `RENDER_DEPLOY.sh` - Interactive step-by-step guide
