# 🚀 AUTO-DEPLOYMENT SETUP - TỰ ĐỘNG DEPLOY

## ✅ Current Status: AUTO-DEPLOY IS ACTIVE

Your Render services are configured for automatic deployment. When you push code to GitHub, Render automatically rebuilds and deploys.

---

## 🔄 How Auto-Deployment Works

### Workflow:
```
1. You make changes locally
   └─ Edit files, test locally
   
2. Commit changes
   └─ git add .
   └─ git commit -m "Your message"
   
3. Push to GitHub
   └─ git push origin main
   
4. Render auto-detects push
   └─ GitHub webhook notifies Render
   
5. Render builds automatically
   └─ Frontend: npm install && npm run build
   └─ Backend: pip install -r requirements.txt
   
6. Render deploys automatically
   └─ Services update live (2-3 minutes)
   
7. GitHub Actions monitors
   └─ Health checks every 5 minutes
```

---

## 📋 Services Configuration

### Frontend Service
- **Name:** network-security-audit-frontend
- **Type:** Static Site
- **Branch:** main (auto-deploy enabled)
- **Build:** `npm install && npm run build`
- **Publish Directory:** `build`
- **Environment Variable:** `REACT_APP_API_URL=https://network-security-audit-backend.onrender.com`

### Backend Service
- **Name:** network-security-audit-backend
- **Type:** Web Service
- **Branch:** main (auto-deploy enabled)
- **Build:** `pip install -r requirements.txt`
- **Start:** `gunicorn app:app`
- **Environment Variables:**
  - `FLASK_ENV=production`
  - `DEBUG=False`
  - `PYTHONUNBUFFERED=true`
  - `CORS_ORIGINS=https://network-security-audit-frontend.onrender.com`

---

## 🛠️ Deployment Checklist

Before pushing code:

```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Make your changes
# ... edit files ...

# 4. Test locally
npm test              # Frontend tests
pytest                # Backend tests

# 5. Commit changes
git add .
git commit -m "Describe your changes"

# 6. Push to GitHub
git push origin main

# 7. Monitor deployment
# Go to: https://dashboard.render.com
# Watch Frontend and Backend services deploy
# Takes 2-3 minutes total
```

---

## 📊 Monitoring Deployments

### Via Render Dashboard:
```
https://dashboard.render.com
→ Click on "network-security-audit-frontend"
→ Check Status (should show "Live")
→ Check Logs (deployment progress)

→ Click on "network-security-audit-backend"  
→ Check Status (should show "Live")
→ Check Logs (deployment progress)
```

### Via GitHub Actions:
```
https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions
→ View workflow runs
→ See deployment status
→ Check monitoring logs (every 5 minutes)
```

---

## 🔍 Verify Deployment is Live

After deployment completes:

```bash
# Check Frontend
curl https://network-security-audit-frontend.onrender.com

# Check Backend Health
curl https://network-security-audit-backend.onrender.com/api/health

# Both should respond (no errors)
```

---

## 🚨 Troubleshooting Auto-Deploy

### Issue: Service still showing "old" code
**Solution:** 
- Wait 2-3 minutes for deployment to complete
- Check Render dashboard for build errors
- Refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: Deployment failed
**Solution:**
- Go to Render dashboard → service → Logs
- Look for error message
- Fix locally, commit, and push again
- Check that all required environment variables are set

### Issue: Frontend can't connect to backend
**Solution:**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend `CORS_ORIGINS` includes frontend URL
- Restart services manually on Render dashboard

---

## 🔑 What NOT to Do

❌ Don't commit sensitive data (API keys, passwords)
❌ Don't push to branches other than main
❌ Don't modify Render settings without documenting
❌ Don't skip testing before pushing

---

## 📝 Future Deployment Workflow

### For Small Changes:
```bash
git add .
git commit -m "Fix: description"
git push origin main
# Wait 2-3 minutes → Done! ✅
```

### For Major Features:
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, test locally
npm test
pytest

# Commit multiple times
git add .
git commit -m "Add feature part 1"
git add .
git commit -m "Add feature part 2"

# Push to feature branch
git push origin feature/your-feature

# Open PR on GitHub
# Review and test
# Merge to main
# Auto-deployment happens! ✅
```

---

## 📞 Support

If auto-deployment isn't working:
1. Check GitHub is connected to Render (✅ Already configured)
2. Verify services have "Auto-Deploy" enabled
3. Check Render API key has correct permissions
4. Review deployment logs on Render dashboard

---

## ✨ Quick Commands

```bash
# View git log
git log --oneline -5

# Check status
git status

# Push changes
git push origin main

# Check deployment
curl https://network-security-audit-frontend.onrender.com
curl https://network-security-audit-backend.onrender.com/api/health
```

---

**Status:** ✅ Auto-deployment is fully configured and active  
**Last Updated:** 2026-08-13  
**Next Action:** Push code to GitHub → Render deploys automatically
