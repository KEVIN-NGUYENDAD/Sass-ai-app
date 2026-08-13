# 🔧 FIX RENDER DEPLOYMENT - MANUAL STEPS

## Problem
Frontend service is configured as Python Web Service instead of Static Site.

## Solution: Two Options

---

## ✅ OPTION 1: Run Automated Script (EASIEST)

### On Your Local Machine:
```bash
cd ~/huong-pharmacy-ai-copilot
bash FIX_RENDER_DEPLOYMENT.sh
```

Then wait 3-5 minutes and go to:
```
https://network-security-audit-frontend.onrender.com
```

**Done!** ✅

---

## ✅ OPTION 2: Manual Fix via Render Dashboard

### Step 1: Delete Broken Frontend Service
```
1. Go to: https://dashboard.render.com
2. Click: "network-security-audit-frontend"
3. Scroll down: "Settings" section
4. Click: "Delete Service"
5. Confirm: Type the service name and delete
6. Wait for deletion to complete (1 minute)
```

### Step 2: Create New Static Site Frontend
```
1. Click: "+ New" button (top right)
2. Click: "Static Site"
3. Select Repository: "huong-pharmacy-ai-copilot"
4. Click: "Connect"

FILL IN THESE FIELDS:

Name: network-security-audit-frontend
Branch: main
Root Directory: network-security-audit/frontend
Build Command: npm install && npm run build
Publish Directory: build
Plan: Free
Region: Oregon

5. Click: "Advanced"

ENVIRONMENT VARIABLES:
Key: REACT_APP_API_URL
Value: https://network-security-audit-backend.onrender.com

6. Click: "Create Static Site"
7. Wait 2-3 minutes for deployment
```

### Step 3: Verify Backend Settings
```
1. Click: "network-security-audit-backend"
2. Click: "Environment" (left sidebar)
3. Verify these variables:

FLASK_ENV = production
DEBUG = False
CORS_ORIGINS = https://network-security-audit-frontend.onrender.com
PYTHONUNBUFFERED = true

4. If changed, click: "Manual Deploy" and "Deploy latest commit"
5. Wait for deployment
```

### Step 4: Verify Everything Works
```
1. Open: https://network-security-audit-frontend.onrender.com
2. Should see: Dashboard with all tabs
3. Should see: NO error messages
4. Test clicking tabs and features
```

---

## 📋 Verification Checklist

After deployment:

- [ ] Frontend loads without errors
- [ ] Can see "Network Security Audit" header
- [ ] Language toggle works (EN/VI)
- [ ] Can see all tabs (Dashboard, Port Scanner, etc.)
- [ ] No "Backend unavailable" warning
- [ ] Backend API responds: https://network-security-audit-backend.onrender.com/api/health
- [ ] All features work

---

## 🆘 If Still Not Working

Check these:

1. **Frontend still shows error?**
   - Check Render dashboard → Logs for error message
   - Make sure Root Directory is: `network-security-audit/frontend`
   - Make sure Build Command is: `npm install && npm run build`
   - Make sure Publish Directory is: `build`

2. **Backend not responding?**
   - Check CORS_ORIGINS is set correctly
   - Check FLASK_ENV = production
   - Manually deploy backend again

3. **Still stuck?**
   - Delete both services
   - Start fresh from Step 2 with correct configurations

---

## 📞 Quick Support

**Frontend not loading:**
- Wait 3 minutes (cold start)
- Refresh browser
- Check Render Logs tab for errors

**Backend not connecting:**
- Check CORS_ORIGINS environment variable
- Restart backend service
- Check that backend status is "Live"

---

**Choose an option above and let me know when it's done!** ✅
