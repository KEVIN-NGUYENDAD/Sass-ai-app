# Quick Commands - Copy & Paste

## 🚀 Quick Start (Lần Đầu)

```bash
# 1. Tạo folder project
mkdir my-checkin-app
cd my-checkin-app

# 2. Init git
git init
git config user.email "you@example.com"
git config user.name "Your Name"

# 3. Tạo folder cấu trúc
mkdir -p nail_salon_checkin/{templates,static,data}
mkdir -p .github/workflows
mkdir -p development-procedures/{procedures,templates,scripts,ci-cd}

# 4. Tạo .gitignore
cat > .gitignore << 'EOF'
__pycache__/
*.pyc
*.pyo
.env
.DS_Store
*.db
*.log
htmlcov/
.pytest_cache/
EOF

# 5. Tạo requirements.txt
cat > requirements.txt << 'EOF'
flask==2.3.0
gunicorn==21.0.0
twilio==8.0.0
python-dotenv==1.0.0
EOF

# 6. Install dependencies
pip install -r requirements.txt
pip install pytest pytest-cov flake8

# 7. First commit
git add .
git commit -m "Initial commit"
```

---

## 🛠️ Development Commands

### **Run App Locally**
```bash
# Start Flask server
python nail_salon_checkin/app.py

# App runs at: http://localhost:5000/

# Or with environment
FLASK_ENV=development FLASK_DEBUG=1 python nail_salon_checkin/app.py
```

### **Run Tests**
```bash
# All tests
pytest tests/ -v

# Unit tests only
pytest tests/unit/ -v

# With coverage
pytest tests/ --cov=nail_salon_checkin --cov-report=html

# View coverage
open htmlcov/index.html
```

### **Code Quality**
```bash
# Style check
flake8 nail_salon_checkin/

# Format code
black nail_salon_checkin/

# Pre-commit checks
./development-procedures/scripts/pre-commit-hook.py
```

---

## 📋 Git Workflow

### **Start New Feature**
```bash
# Pull latest
git fetch origin

# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Check what changed
git status
git diff

# Stage changes
git add nail_salon_checkin/app.py
git add templates/checkin.html

# Commit
git commit -m "feat: Add nickname field to customer profile"

# Push
git push origin feature/my-feature
```

### **Create Pull Request**
```bash
# After push, create PR on GitHub
# Go to: https://github.com/your-username/repo/pulls
# Click: "New Pull Request"
# Select: feature/my-feature → main
# Add description
# Submit

# CI/CD runs automatically
# Watch: Actions tab
```

### **After PR Approved**
```bash
# Merge on GitHub (or via command)
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main

# Render auto-deploys
# Monitor at: https://dashboard.render.com/
```

### **Delete Feature Branch**
```bash
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

---

## 🧪 Testing Commands

### **Run Specific Test**
```bash
# Single test
pytest tests/unit/test_api.py::test_checkin_creates_record -v

# Specific test file
pytest tests/unit/test_api.py -v

# With detailed output
pytest tests/ -v -s

# Show coverage
pytest tests/ -v --cov=nail_salon_checkin --cov-report=term-missing
```

### **Generate Coverage Report**
```bash
# HTML report
pytest tests/ --cov=nail_salon_checkin --cov-report=html

# View in browser
open htmlcov/index.html

# Terminal report
pytest tests/ --cov=nail_salon_checkin
```

---

## 🚀 Deployment Commands

### **Render Deployment**

```bash
# Render auto-deploys from main branch
# Just push to main:
git push origin main

# Monitor build at dashboard:
# https://dashboard.render.com/services/[your-service]

# Check logs
# Click on service → Logs tab

# Manual redeploy (if needed)
# Click: "Redeploy latest commit"
```

### **Verify Deployment**
```bash
# Run verification script
./development-procedures/scripts/verify-deployment.sh https://your-app.onrender.com

# Expected output:
# ✅ Home page
# ✅ Staff login page
# ✅ API endpoints
# ✅ Performance checks
# ✅ Functional tests
```

### **Check Production Status**
```bash
# Quick health check
curl https://your-app.onrender.com/

# Test API
curl -X POST https://your-app.onrender.com/api/checkin \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"555-1234",...}'

# View logs (on Render dashboard)
# Or via SSH
ssh your-app@your-app.onrender.com
tail -f /var/log/app.log
```

---

## 📊 Development Procedures

### **Code Review**
```bash
# Use checklist
cat development-procedures/templates/CODE_REVIEW_CHECKLIST.md

# Or view all procedures
cat development-procedures/procedures/PROCEDURE_HANDBOOK.md
```

### **QA Testing**
```bash
# Use QA checklist
cat development-procedures/templates/QA_CHECKLIST.md

# Score the system (target >95/100)
```

### **Deployment Verification**
```bash
# Use deployment checklist
cat development-procedures/templates/DEPLOYMENT_VERIFICATION.md

# Run script
./development-procedures/scripts/verify-deployment.sh <URL>
```

### **Bug Reporting**
```bash
# Create structured bug report
./development-procedures/scripts/create-bug-report.sh

# Follow prompts:
# - Bug Title
# - Severity (Critical/Major/Minor)
# - Reproduction steps
# - Expected vs Actual
```

### **Quick Reference**
```bash
# View quick commands
cat development-procedures/QUICK_REFERENCE.md

# View memory note
cat development-procedures/MEMORY.md
```

---

## 🔐 Environment Setup

### **Create .env File**
```bash
# Copy template
cp .env.example .env

# Edit with your credentials
cat > .env << 'EOF'
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE=+1234567890
FLASK_ENV=production
SECRET_KEY=your-random-secret-key-here
EOF

# Load env vars
source .env

# Never commit .env!
echo ".env" >> .gitignore
```

### **For Render**
1. Go to dashboard
2. Select service
3. Environment tab
4. Add each var:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE

---

## 📱 API Testing

### **Test Check-In**
```bash
curl -X POST http://localhost:5000/api/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "phone": "(555) 123-4567",
    "nickname": "TC",
    "service": "Gel manicure",
    "date": "2026-08-09",
    "time": "10:00",
    "duration_minutes": 60
  }'
```

### **Test Staff Login**
```bash
curl -X POST http://localhost:5000/api/staff-login \
  -H "Content-Type: application/json" \
  -d '{"password": "250618"}'
```

### **Get Queue**
```bash
curl http://localhost:5000/api/checkins?date=2026-08-09
```

### **Update Status**
```bash
curl -X POST http://localhost:5000/api/checkin/[id]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_service"}'
```

### **Get Daily Report**
```bash
curl http://localhost:5000/api/daily-report?date=2026-08-09
```

### **Export CSV**
```bash
curl http://localhost:5000/api/export-csv?type=daily&date=2026-08-09 \
  -o report.csv
```

---

## 🐛 Debugging

### **View Flask Logs**
```bash
# Verbose logging
FLASK_DEBUG=1 python nail_salon_checkin/app.py

# Application logs
tail -f logs/app.log
```

### **Debug Python**
```bash
# Add breakpoint in code
breakpoint()

# Or use pdb
import pdb; pdb.set_trace()

# Run with debugger
python -m pdb nail_salon_checkin/app.py
```

### **Database Issues**
```bash
# Check data files
ls -la data/

# View file permissions
stat data/checkins.json

# Fix permissions if needed
chmod 644 data/*.json
chmod 755 data/

# Clear test data
rm data/checkins.json data/customers.json
```

### **Port Already In Use**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill process
kill -9 [PID]

# Or use different port
python nail_salon_checkin/app.py --port 5001
```

---

## 🚨 Emergency Fixes

### **Production Down**
```bash
# Check Render status
# Dashboard → Service → Logs

# Rollback last deploy
git revert HEAD
git push origin main

# Or restart
# Dashboard → Service → Redeploy
```

### **SMS Not Working**
```bash
# Check credentials
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN

# Test connection
python -c "from twilio.rest import Client; print('OK')"

# Check logs for error
# Look for "SMS failed"
```

### **Database Locked**
```bash
# Release lock (if .lock file exists)
rm data/.lock

# Or restart app
# Kills existing connections
pkill -f "python nail_salon_checkin"
python nail_salon_checkin/app.py
```

---

## 📈 Monitoring

### **View Real-Time Logs**
```bash
# Render (via SSH)
ssh your-app@your-app.onrender.com
tail -f app.log

# Or check dashboard
# Service → Logs (streaming)
```

### **Performance Check**
```bash
# Page load time
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.onrender.com/

# API response time
curl -w "%{time_total}\n" -o /dev/null -s https://your-app.onrender.com/api/checkins

# Memory usage
top -o %MEM
```

### **Test Concurrent Users**
```bash
# Simple load test (requires Apache Bench)
ab -n 100 -c 10 https://your-app.onrender.com/

# Or use wrk
wrk -t4 -c100 -d30s https://your-app.onrender.com/
```

---

**All these commands ready to copy & paste! 🎯**
