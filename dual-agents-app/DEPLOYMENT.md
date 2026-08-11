# 🚀 Deployment Guide - Dual Agents App

**Deploy your dual-agent system to the cloud in 5 minutes!**

---

## 🎯 Deployment Options

### **Option 1: Render.com (Recommended - Free)**
Easiest setup, free tier available, auto-deploys from GitHub

### **Option 2: Docker (Any platform)**
Docker image ready, deploy anywhere (AWS, Azure, Heroku, etc.)

### **Option 3: Local Server**
Run on your machine with `npm start`

---

## 🌐 Option 1: Deploy on Render (FREE)

### **Step 1: Prepare Repository**

```bash
# Make sure code is committed
git add dual-agents-app/
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Connect to Render**

1. Go to: https://render.com
2. Sign up (free account)
3. Click **"New +"** → **"Web Service"**
4. Select **"Build and deploy from a Git repository"**
5. Click **"Connect"** and authorize GitHub
6. Select your repository
7. Select branch: `main` (or your branch)
8. Choose service name: `dual-agents-app`

### **Step 3: Configure Service**

```
Runtime:           Node
Build Command:     npm install
Start Command:     npm start
Environment:       Production
```

### **Step 4: Add Environment Variable**

1. Click **"Environment"** section
2. Click **"Add Environment Variable"**
3. Add:
   ```
   Name:  ANTHROPIC_API_KEY
   Value: sk-ant-your-actual-key-here
   ```

### **Step 5: Deploy**

1. Click **"Create Web Service"**
2. Wait for deployment (~2-3 minutes)
3. Get your URL: `https://your-app-name.onrender.com`
4. Share the URL!

### **Verify Deployment**

```bash
curl https://your-app-name.onrender.com/
# Should return: {"status": "✅ Dual Agent Server Running", ...}
```

---

## 🐳 Option 2: Docker Deployment

### **Local Testing**

```bash
# Build image
docker build -t dual-agents:latest .

# Run container
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e NODE_ENV="production" \
  dual-agents:latest

# Visit: http://localhost:3000
```

### **Docker Compose (Optional)**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
```

Run:
```bash
docker-compose up
```

### **Deploy to Cloud**

#### **AWS (ECS/ECR)**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

docker tag dual-agents:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/dual-agents:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/dual-agents:latest
```

#### **Google Cloud Run**
```bash
gcloud run deploy dual-agents \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-...
```

#### **Azure Container Instances**
```bash
az container create \
  --resource-group mygroup \
  --name dual-agents \
  --image dual-agents:latest \
  --environment-variables ANTHROPIC_API_KEY=sk-ant-...
```

---

## 💻 Option 3: Local Server

### **Setup**

```bash
cd dual-agents-app

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
nano .env
```

### **Run**

```bash
npm start
# Server: http://localhost:3000
```

### **Run with PM2 (Production)**

```bash
npm install -g pm2

# Start
pm2 start server.js --name "dual-agents"

# Monitor
pm2 monit

# View logs
pm2 logs dual-agents
```

---

## 🔒 Environment Variables

### **Required**
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key
```

### **Optional**
```
PORT=3000                          # Default: 3000
NODE_ENV=production                # or: development
```

### **Getting API Key**

1. Go to: https://console.anthropic.com
2. Login/Sign up
3. Click **"API keys"**
4. Click **"Create key"**
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env` or Render environment

---

## ✅ Deployment Checklist

### **Before Deploying**

- [ ] Code committed to GitHub
- [ ] `.env.example` created
- [ ] API key ready
- [ ] Dockerfile exists
- [ ] render.yaml configured
- [ ] README.md complete

### **After Deploying**

- [ ] Service is running
- [ ] Health check passes: `curl https://your-url/`
- [ ] Can select agents
- [ ] Chat works end-to-end
- [ ] No errors in logs

---

## 🔍 Monitoring

### **Render Dashboard**
- View logs in real-time
- Monitor CPU/Memory
- See deployment history

### **Local Logs**
```bash
pm2 logs dual-agents
```

### **Health Check**
```bash
curl https://your-app/
curl https://your-app/api/agents
```

---

## 🐛 Troubleshooting

### **Problem: Deployment fails**

**Check:**
- [ ] Code is on GitHub
- [ ] Branch is correct
- [ ] Build command works locally
- [ ] All files committed

**Fix:**
```bash
git status
git add .
git commit -m "Fix deployment"
git push origin main
```

### **Problem: API Key not working**

**Check:**
- [ ] API key is correct (starts with `sk-ant-`)
- [ ] Environment variable is set
- [ ] Key has permissions

**Fix:**
- Regenerate key at: https://console.anthropic.com
- Update environment variable

### **Problem: Service crashes**

**Check logs:**
```bash
# Render: View in dashboard
# Local: npm run dev
# PM2: pm2 logs dual-agents
```

**Common issues:**
- Missing ANTHROPIC_API_KEY
- Port already in use
- Node version mismatch

---

## 🚨 Performance Optimization

### **Render**
- Free tier: Limited resources
- Upgrade to paid for production
- Configure auto-scaling

### **Docker**
- Use node:18-slim image (small footprint)
- Cache layers for faster builds
- Use .dockerignore to exclude files

### **API Calls**
- Implement caching if needed
- Add rate limiting
- Monitor token usage

---

## 📊 Cost Estimation

| Platform | Tier | Cost | Notes |
|----------|------|------|-------|
| **Render** | Free | $0 | May sleep after 15 min idle |
| **Render** | Starter | $7/mo | Always on, recommended |
| **AWS** | Free tier | $0 | 750 hours/month free |
| **Google Cloud** | Always Free | $0 | Limited but free |
| **Azure** | Free tier | $0 | $200 credit first month |

---

## 🔄 Auto-Deployment

### **Render Auto-Deploy**
✅ Automatically redeploys when you push to GitHub

```bash
git push origin main
# Render detects change and auto-deploys
```

### **GitHub Actions (Optional)**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-YOUR_SERVICE_ID \
            -H "authorization: Bearer YOUR_RENDER_TOKEN"
```

---

## 📈 Scaling

### **Render**
- Upgrade to Starter plan
- Add more instances
- Use internal networking

### **Docker**
- Use Kubernetes (k8s)
- Add load balancer
- Setup horizontal scaling

### **Database (if needed)**
- Add PostgreSQL
- Add Redis cache
- Setup connection pooling

---

## 🔐 Security Best Practices

✅ Never commit `.env` file
✅ Use environment variables for secrets
✅ Rotate API keys periodically
✅ Monitor API usage
✅ Add rate limiting
✅ Setup firewall rules
✅ Use HTTPS only
✅ Log important events

---

## 📞 Support

**Render Issues?**
- https://render.com/docs
- https://render.com/support

**Docker Issues?**
- https://docs.docker.com
- https://stackoverflow.com

**Anthropic API Issues?**
- https://docs.anthropic.com
- https://console.anthropic.com

---

## 🎯 Next Steps

1. **Choose platform** (Render recommended)
2. **Prepare code** (commit to GitHub)
3. **Get API key** (from console.anthropic.com)
4. **Deploy** (follow platform guide)
5. **Test** (verify health check)
6. **Share URL** (give to users)
7. **Monitor** (check logs regularly)

---

**Status:** ✅ Ready to Deploy  
**Estimated Time:** 5-10 minutes  
**Cost:** Free (Render free tier)  
**Support:** Full documentation included

🚀 **Let's deploy!**
