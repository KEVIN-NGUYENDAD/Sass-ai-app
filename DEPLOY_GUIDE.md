# 🚀 COMPLETE DEPLOYMENT GUIDE

**Deploy everything to Render in 5-10 minutes**

---

## ⚡ Quick Deploy (Recommended)

### **Option A: Automated Script (Easiest)**

```bash
export RENDER_API_KEY="rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD"
bash deploy-all.sh
```

**What it does:**
1. ✅ Checks Render services
2. ✅ Creates services if needed
3. ✅ Pushes code to GitHub
4. ✅ Triggers automatic deployment
5. ✅ Shows live URLs

**Time:** 5-10 minutes

---

### **Option B: Manual Deploy (Web UI)**

#### **Step 1: Create Backend Service**

1. Go to: https://dashboard.render.com
2. Click: "New +" → "Web Service"
3. Select repo: `huong-pharmacy-ai-copilot`
4. Fill in:
   - **Name:** `network-security-audit-backend`
   - **Root Directory:** `network-security-audit/backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Plan:** Free (or Starter $7/month for 24/7)
   - **Region:** Oregon

5. Add Environment Variables:
   ```
   FLASK_ENV = production
   DEBUG = False
   PYTHONUNBUFFERED = true
   ```

6. Click: "Create Web Service"
7. Wait: 2-3 minutes for deployment
8. Note URL: `https://network-security-audit-backend.onrender.com`

#### **Step 2: Create Frontend Service**

1. Click: "New +" → "Static Site"
2. Select repo: `huong-pharmacy-ai-copilot`
3. Fill in:
   - **Name:** `network-security-audit-frontend`
   - **Root Directory:** `network-security-audit/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Plan:** Free

4. Click: "Create Static Site"
5. Wait: 2-3 minutes for deployment
6. Note URL: `https://network-security-audit-frontend.onrender.com`

#### **Step 3: Connect Backend & Frontend**

1. Go to Backend service settings
2. Add Environment Variable:
   ```
   CORS_ORIGINS = https://network-security-audit-frontend.onrender.com
   ```
3. Click: "Manual Deploy" → "Deploy latest commit"

#### **Step 4: Update Frontend API URL**

1. Go to Frontend service settings
2. Add Environment Variable:
   ```
   REACT_APP_API_URL = https://network-security-audit-backend.onrender.com
   ```
3. Click: "Manual Deploy" → "Deploy latest commit"

---

## 📋 What Gets Deployed

### **Network Security Audit Backend**
- **Technology:** Python + Flask
- **Features:** Port scanning, password checking, WiFi security, network info
- **Database:** None (stateless)
- **Cost:** Free tier or $7/month

### **Network Security Audit Frontend**
- **Technology:** React + JavaScript
- **Features:** Web UI, language toggle (EN/VI), real-time checks
- **Hosting:** Render Static Site
- **Cost:** Free

### **Monitoring System**
- **Technology:** GitHub Actions + Python
- **Features:** Auto health checks every 5 min
- **Deployment:** Already in GitHub Actions
- **Cost:** Free (GitHub free tier)

---

## 🔍 Verify Deployment

### **Check Backend:**
```bash
curl https://network-security-audit-backend.onrender.com/api/health
# Expected response: {"status": "OK"}
```

### **Check Frontend:**
```bash
Open: https://network-security-audit-frontend.onrender.com
# Should see: Network Security Audit dashboard
```

### **Check Monitoring:**
```
GitHub Actions: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions
Monitor Render Status: Should show both services as "live"
```

---

## 📊 Deployment Status Checking

### **Real-time Status:**

Go to: https://dashboard.render.com

Check each service:
```
Backend Status: Live ✅
Frontend Status: Live ✅
```

### **GitHub Actions Status:**

Go to: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions

Click: "Monitor Render Status" → Latest run

Check:
```
✅ Running Services
   - network-security-audit-backend
   - network-security-audit-frontend
📊 Summary: Running: 2
```

---

## 🛠️ Environment Variables Reference

### **Backend (.env.local / Render)**
```
FLASK_ENV=production
DEBUG=False
PORT=10000
PYTHONUNBUFFERED=true
CORS_ORIGINS=https://your-frontend-url.onrender.com
```

### **Frontend (.env / Render)**
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

---

## ⚠️ Important Notes

### **Free Tier Limitations:**
- ✅ Services spin down after 15 min idle
- ✅ First request takes 30-50s to wake up
- ❌ Not suitable for production with high traffic
- **Solution:** Upgrade to Starter ($7/month for 24/7 uptime)

### **Port Scanning Limitations:**
- ⚠️ May be limited by Render's network policies
- ✅ Works with localhost/127.0.0.1
- ✅ Works with IP addresses outside Render
- Workaround: Use SSH tunneling

### **Cost Tracking:**
- Monitor: https://dashboard.render.com/account/billing
- Weekly check: Compute minutes < 5000/month
- Alert: If > 3000 min in first week = need Starter

---

## 📈 Post-Deployment Checklist

- [ ] Backend deployed and showing "live"
- [ ] Frontend deployed and showing "live"
- [ ] CORS configured (backend can talk to frontend)
- [ ] Test port scanning feature
- [ ] Test password checking
- [ ] Test WiFi security
- [ ] Test network info
- [ ] Test history feature
- [ ] Monitoring system active (GitHub Actions)
- [ ] Bookmarks saved:
  - [ ] Render Dashboard
  - [ ] GitHub Actions
  - [ ] Application URLs

---

## 🔄 Auto-Deployment Setup

GitHub Actions automatically deploys when:
1. ✅ Push to `main` or `claude/network-security-audit-k6mdzw`
2. ✅ Changes to `network-security-audit/**`
3. ✅ Workflow runs: "Deploy to Render"
4. ✅ Uses RENDER_API_KEY secret

**Current Status:** ✅ Configured and ready

---

## 💡 Troubleshooting

### **Problem: Backend won't start**

Check logs in Render:
```
Dashboard → network-security-audit-backend → Logs
```

Common issues:
- Missing dependencies in requirements.txt
- Port binding error
- Environment variable issue

### **Problem: Frontend can't connect to backend**

1. Verify CORS_ORIGINS in backend settings
2. Check API URL in frontend (.env)
3. Clear browser cache (Ctrl+Shift+Del)
4. Check browser console for errors

### **Problem: Services keep spinning down**

Solution: Upgrade to Starter plan
```
Render Dashboard → Service → Plan → Select Starter
```

### **Problem: Port scanning doesn't work**

This is expected on free tier Render due to network restrictions.
Workaround: Use SSH tunneling or upgrade to Starter.

---

## 📞 Getting Help

### **Render Documentation:**
- https://docs.render.com/
- https://docs.render.com/deploy-a-web-service

### **Application Issues:**
- Check `/network-security-audit/DEPLOYMENT.md`
- Check backend logs on Render
- Check frontend console (F12)

---

## 🎉 Success!

Once deployed:
1. ✅ Share the frontend URL with family
2. ✅ Use network security features
3. ✅ Monitor with GitHub Actions
4. ✅ Check Render dashboard weekly

---

## 📝 Deployment Timeline

```
Automated Script:
├─ 2 min: Prerequisites check
├─ 3 min: Service creation/verification
├─ 2 min: Push code
├─ 3 min: Deployment
├─ 1 min: Status check
└─ Total: 5-10 minutes

Manual Web UI:
├─ 3 min: Backend service setup
├─ 3 min: Frontend service setup
├─ 2 min: CORS configuration
├─ 2 min: Environment variables
└─ Total: 10-15 minutes
```

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Deploy everything | `bash deploy-all.sh` |
| Check status | Go to Render dashboard |
| Monitor services | GitHub Actions workflow |
| View backend | `https://network-security-audit-backend.onrender.com` |
| View frontend | `https://network-security-audit-frontend.onrender.com` |
| Check logs | Render Dashboard → Service → Logs |

---

**Status:** 🚀 Ready to Deploy!

**Time Estimate:** 5-15 minutes  
**Cost:** Free tier or $7/month  
**Maintenance:** Automatic via GitHub Actions

**Next Action:** Run `bash deploy-all.sh` or use manual web UI above
