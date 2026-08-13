# 🚀 DEPLOY NOW - Step by Step

**Hướng dẫn deploy ứng dụng lên Render (10 phút)**

---

## ✅ Your Applications Are Ready!

```
✅ Network Security Audit Backend      (Python/Flask)
✅ Network Security Audit Frontend     (React)
✅ Monitoring System                   (GitHub Actions)
✅ All code pushed to GitHub           (Ready to deploy)
```

---

## 🚀 Deploy in 3 Steps

### **STEP 1: Deploy Backend (3 minutes)**

#### Open Render Dashboard:
```
https://dashboard.render.com
```

#### Click: "New +" → "Web Service"

#### Connect GitHub:
- Click: "Connect Account" (if not connected)
- Select repo: `huong-pharmacy-ai-copilot`
- Click: "Connect"

#### Fill in Backend Settings:
```
Name:                    network-security-audit-backend
Environment:             Python 3
Root Directory:          network-security-audit/backend
Build Command:           pip install -r requirements.txt
Start Command:           gunicorn app:app
Plan:                    Free (or Starter for $7/month)
Region:                  Oregon
Branch:                  main
Auto-deploy:             Yes
```

#### Add Environment Variables:
Click: "Advanced" → "Add Environment Variable"
```
FLASK_ENV        =  production
DEBUG            =  False
PYTHONUNBUFFERED =  true
PORT             =  10000
```

#### Click: "Create Web Service"

⏳ **Wait 2-3 minutes for deployment...**

**✅ Backend Done!** Note the URL: `https://network-security-audit-backend.onrender.com`

---

### **STEP 2: Deploy Frontend (3 minutes)**

#### Click: "New +" → "Static Site"

#### Connect same repo:
- Select: `huong-pharmacy-ai-copilot` 

#### Fill in Frontend Settings:
```
Name:                    network-security-audit-frontend
Root Directory:          network-security-audit/frontend
Build Command:           npm install && npm run build
Publish Directory:       build
Plan:                    Free
Branch:                  main
Auto-deploy:             Yes
```

#### Add Environment Variables:
Click: "Advanced" → "Add Environment Variable"
```
REACT_APP_API_URL    =  https://network-security-audit-backend.onrender.com
```

#### Click: "Create Static Site"

⏳ **Wait 2-3 minutes for deployment...**

**✅ Frontend Done!** Note the URL: `https://network-security-audit-frontend.onrender.com`

---

### **STEP 3: Connect Backend & Frontend (1 minute)**

#### Update Backend CORS:

1. Go back to: https://dashboard.render.com
2. Click: "network-security-audit-backend"
3. Click: "Settings"
4. Scroll down: "Environment Variables"
5. Add new variable:
   ```
   CORS_ORIGINS  =  https://network-security-audit-frontend.onrender.com
   ```
6. Click: "Save"
7. Click: "Manual Deploy" → "Deploy latest commit"

⏳ **Wait 1 minute...**

**✅ Backend Redeployed!**

---

## 🎉 Success!

Now you have:

```
Frontend URL:
  https://network-security-audit-frontend.onrender.com

Backend URL:
  https://network-security-audit-backend.onrender.com

Backend Health Check:
  https://network-security-audit-backend.onrender.com/api/health
```

---

## ✨ Test Your Application

### **Open in Browser:**
```
https://network-security-audit-frontend.onrender.com
```

### **Test Features:**
- ✅ Click "Port Scanner" → Test scanning a port
- ✅ Click "Password Checker" → Test password strength
- ✅ Click "WiFi Security" → Test WiFi analysis
- ✅ Click "Network Info" → View network information
- ✅ Click "Scan History" → View saved scans
- ✅ Toggle "EN/VI" → Switch language

### **Expected Result:**
```
All features working ✅
Backend connected ✅
No console errors ✅
```

---

## 📊 Monitor Your Deployment

### **Check Status in Render:**
```
Go to: https://dashboard.render.com

Both services should show:
  Status: "Live" ✅
```

### **Check Automated Monitoring:**
```
Go to: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions

Click: "Monitor Render Status" → Latest run

Should show both services as "Running" ✅
```

### **Check Logs (if any issues):**
```
Render Dashboard → [Service Name] → Logs

Look for error messages
```

---

## ⚠️ Important Notes

### **Free Tier Behavior:**
- Services sleep after 15 minutes idle
- First request takes 30-50 seconds to wake up
- Not suitable for high-traffic production use
- **Solution:** Upgrade to Starter ($7/month) for 24/7 uptime

### **Port Scanning Limits:**
- May not work on Render due to network restrictions
- Works locally with 127.0.0.1
- Works with external IPs
- **Note:** This is a Render limitation, not your code

### **Cost Tracking:**
- Free tier: $0
- Starter tier: $7/month per service
- Monitor: https://dashboard.render.com/account/billing
- Warning: If compute > 3000 min in week 1, upgrade to Starter

---

## 💡 Pro Tips

### **Auto-Deploy on Push:**
✅ Already configured!
- Whenever you push to GitHub
- Render automatically deploys
- No manual re-deployment needed

### **Monitor Services:**
✅ GitHub Actions monitoring active!
- Checks every 5 minutes
- Reports if services go down
- Fully automated

### **View Deployment History:**
```
Render Dashboard → [Service] → Deploys

See all past deployments and logs
```

---

## 🔄 Update Code Later

When you make changes:

```bash
# 1. Make changes
nano network-security-audit/backend/app.py

# 2. Commit
git add -A
git commit -m "Update backend"

# 3. Push
git push

# 4. Render auto-deploys (2-3 minutes)
# Monitor at: https://dashboard.render.com
```

---

## 📞 Troubleshooting

### **Problem: Frontend can't connect to backend**

**Solution:**
1. Check backend URL in browser: `https://network-security-audit-backend.onrender.com/api/health`
2. Should see: `{"status": "OK"}`
3. If error, check Render backend logs
4. Verify CORS_ORIGINS environment variable is set correctly

### **Problem: Services keep spinning down**

**Solution:**
1. Upgrade to Starter plan ($7/month)
2. Or use a free service to ping every 5 min

### **Problem: Port scanning doesn't work**

**Solution:**
1. This is expected on free Render
2. Port scanning works locally
3. Upgrade to Starter for better network access

### **Problem: Deployment failed**

**Solution:**
1. Go to Render Dashboard
2. Click service name
3. Check "Logs" tab for error message
4. Common issues:
   - Missing environment variable
   - Wrong build command
   - Git connection problem

---

## ✅ Checklist

- [ ] Backend deployed and showing "Live"
- [ ] Frontend deployed and showing "Live"
- [ ] Backend health check working
- [ ] Frontend loads in browser
- [ ] Port Scanner feature works
- [ ] Password Checker works
- [ ] WiFi Security works
- [ ] Network Info works
- [ ] Scan History works
- [ ] Language toggle works (EN/VI)
- [ ] Monitoring shows both services active
- [ ] GitHub auto-deploy configured
- [ ] Environment variables set correctly

---

## 📈 What's Happening Now

```
┌─────────────────────────────────────────┐
│  ✅ Code in GitHub                      │
│  ✅ Monitoring Active (GitHub Actions)  │
│  ✅ Ready for Render Deployment         │
└─────────────────────────────────────────┘
         ↓
   [You Deploy Here]
         ↓
┌─────────────────────────────────────────┐
│  🚀 Services Live on Render             │
│  📊 Auto-monitored                      │
│  🔄 Auto-updates on push                │
└─────────────────────────────────────────┘
```

---

## 🎯 Next Actions

1. **Deploy both services** (follow steps above)
2. **Test application** (use test features)
3. **Share frontend URL** with family
4. **Monitor Render dashboard** weekly
5. **Check GitHub Actions** for status
6. **Upgrade to Starter** if you want 24/7 uptime

---

## 📚 Additional Resources

- **Render Docs:** https://docs.render.com
- **Backend Deployment:** See `DEPLOYMENT.md`
- **Monitoring Guide:** See `MONITORING_README.md`
- **Cost Analysis:** See `LIMITS_DETAIL.md`

---

## 🎉 Congratulations!

You're about to have a live, monitored application on Render!

**Time to deploy:** ~10 minutes  
**Cost:** Free or $7/month  
**Monitoring:** Automatic ✅

---

**Ready?** Go to https://dashboard.render.com and start! 🚀

Let me know when it's live and I can help verify everything works! 💪
