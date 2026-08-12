# 🚀 Deployment Guide - Network Security Audit

## Deploy to Render (Step-by-Step)

### **Option 1: Deploy Full Stack (Recommended)**

#### **Step 1: Prepare Backend Service**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub → Select repository `huong-pharmacy-ai-copilot`
4. Configure:
   - **Name**: `network-security-audit-api`
   - **Root Directory**: `network-security-audit/backend`
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (for testing) or Starter ($7/month)

5. Set Environment Variables:
   ```
   FLASK_ENV=production
   DEBUG=False
   PORT=10000
   CORS_ORIGINS=https://your-frontend-url.onrender.com
   ```

6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Note your backend URL: `https://network-security-audit-api.onrender.com`

#### **Step 2: Deploy Frontend Service**

1. Create another service for React frontend
2. Click "New +" → "Static Site"
3. Connect same GitHub repository
4. Configure:
   - **Name**: `network-security-audit`
   - **Root Directory**: `network-security-audit/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

5. After deployment, get your frontend URL: `https://network-security-audit.onrender.com`

#### **Step 3: Update CORS in Backend**

1. Go back to backend service settings
2. Update `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://network-security-audit.onrender.com
   ```
3. Redeploy backend

#### **Step 4: Update Frontend API URL**

1. Go to frontend service settings
2. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://network-security-audit-api.onrender.com
   ```
3. Trigger a redeploy

---

### **Option 2: Deploy as Single Service**

If you prefer serving both backend & frontend from one service:

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Copy build to backend's static folder:
   ```bash
   cp -r frontend/build/* backend/static/
   ```

3. Update `app.py` to serve static files:
   ```python
   from flask import send_from_directory
   
   @app.route('/')
   def serve_frontend():
       return send_from_directory('static', 'index.html')
   
   @app.route('/<path:path>')
   def serve_static(path):
       return send_from_directory('static', path)
   ```

4. Deploy only backend service to Render

---

## ✅ Testing After Deployment

1. Visit your frontend URL
2. Toggle language (EN/VI)
3. Test all features:
   - Port Scanner
   - Password Checker
   - WiFi Security
   - Network Info
   - Scan History
4. Verify backend connection (check header for status)

---

## 🐛 Troubleshooting

### Backend Not Connecting
- Check CORS_ORIGINS environment variable
- Verify backend is running (check build logs)
- Try hard-refresh (Ctrl+Shift+R)

### Port Scanner Not Working
- Check backend logs on Render
- May be limited by Render's network policies
- Works better with localhost/127.0.0.1

### Frontend Not Building
- Check npm install logs
- Ensure Node.js version is 16+
- Clear build cache and redeploy

---

## 📊 Monitoring

1. Go to Render Dashboard
2. Click on your service
3. View:
   - Logs (check for errors)
   - CPU/Memory usage
   - Disk usage
   - Deploy history

---

## 💰 Cost Estimation

| Service | Free Tier | Starter |
|---------|-----------|---------|
| Static Site | ✅ Free | N/A |
| Web Service | 0.5 hrs/month | $7/month |
| **Total** | ~Free* | $7/month |

*Free tier spins down after 15 minutes idle

---

## 🔐 Security Notes

- Keep `DEBUG=False` in production
- Change CORS origins for production
- Use HTTPS (automatic on Render)
- Monitor logs for errors
- Never commit API keys to GitHub

---

## 🚀 Quick Deploy Command

If using Render CLI:
```bash
render deploy --name network-security-audit --root network-security-audit/backend
```

---

## 📝 Environment Variables Checklist

**Backend (.env or Render settings):**
- [ ] FLASK_ENV=production
- [ ] DEBUG=False
- [ ] PORT=10000
- [ ] CORS_ORIGINS=https://your-frontend.onrender.com

**Frontend (.env or Render settings):**
- [ ] REACT_APP_API_URL=https://your-backend.onrender.com

---

## ✨ After Deployment

1. ✅ Verify both services are running
2. ✅ Test all features work
3. ✅ Check console for errors
4. ✅ Monitor logs for first week
5. ✅ Share URL with family!

**Congratulations! Your Network Security Audit tool is live!** 🎉
