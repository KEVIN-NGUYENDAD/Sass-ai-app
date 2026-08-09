# 🎯 Claude Code Project Configuration

## Project: Nail Salon Check-In System + Development Procedures

**Repository:** https://github.com/KEVIN-NGUYENDAD/huong-pharmacy-ai-copilot  
**Status:** Production Ready ✅  
**Last Updated:** 2026-08-09

---

## 📦 Available Skills

### **tao-app-checkin** 🚀
**Purpose:** Tạo ứng dụng check-in hoàn chỉnh cho salon/spa/clinic

**Use When:**
- "Tạo app check-in"
- "Xây dựng hệ thống quản lý khách hàng"
- "App kiểu nail salon"
- "Tạo ứng dụng appointment-based business"

**What You Get:**
- ✅ Complete Flask backend (843+ lines, 27+ endpoints)
- ✅ Responsive HTML/CSS/JS frontend (7 templates)
- ✅ Customer management system
- ✅ Staff queue management
- ✅ Reports (Daily/Weekly/Monthly)
- ✅ CSV export
- ✅ SMS notifications (Twilio)
- ✅ Professional development procedures
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Deployment guide (Render)

**Skill Location:** `.claude/skills/tao-app-checkin/`

---

## 📁 Project Structure

```
huong-pharmacy-ai-copilot/
│
├── 🎯 .claude/
│   └── skills/
│       └── tao-app-checkin/          ← SKILL: Create check-in app
│           ├── SKILL.md              (523 lines)
│           └── references/
│               ├── project-structure.md
│               └── quick-commands.md
│
├── 📚 development-procedures/        ← Professional dev framework
│   ├── README.md                     (Setup guide)
│   ├── QUICK_REFERENCE.md           (Common commands)
│   ├── MEMORY.md                    (Quick recall)
│   ├── procedures/                  (Step-by-step guides)
│   ├── templates/                   (Reusable checklists)
│   ├── scripts/                     (Automation tools)
│   └── ci-cd/                       (GitHub Actions workflows)
│
├── 📊 nail_salon_checkin/            ← Example application
│   ├── app.py                        (843+ lines, 27+ endpoints)
│   ├── templates/                   (7 HTML files)
│   ├── static/                      (CSS, JavaScript)
│   ├── data/                        (JSON persistence)
│   └── requirements.txt
│
├── .github/
│   └── workflows/                   (CI/CD pipelines)
│       ├── test-and-lint.yml
│       └── deploy.yml
│
└── CLAUDE.md                         (This file)
```

---

## 🚀 Quick Start

### **Use the Skill**
```
"Tạo app check-in cho salon tôi"
```

### **Reference Development Procedures**
```
./development-procedures/README.md
./development-procedures/QUICK_REFERENCE.md
```

### **Run Example App**
```bash
cd nail_salon_checkin
pip install -r requirements.txt
python app.py
# Visit: http://localhost:5000/
```

---

## 📋 Development Procedures

### **Code Review**
- Use: `development-procedures/templates/CODE_REVIEW_CHECKLIST.md`
- Levels: Basic (15min) → Standard (30min) → High-Effort (2-3hrs)

### **Testing**
- Run: `./development-procedures/scripts/run-tests.sh all`
- Coverage: Target >80%
- Types: Unit, Integration, E2E

### **QA & Deployment**
- Use: `development-procedures/templates/QA_CHECKLIST.md`
- Use: `development-procedures/templates/DEPLOYMENT_VERIFICATION.md`
- Target: >95/100 score

### **Deployment**
- Platform: Render (auto-deploy from main)
- CI/CD: GitHub Actions
- Verify: `./development-procedures/scripts/verify-deployment.sh <URL>`

---

## 🔧 Key Commands

```bash
# Development
./development-procedures/scripts/run-tests.sh all
./development-procedures/scripts/verify-deployment.sh <URL>
./development-procedures/scripts/create-bug-report.sh

# View Procedures
cat development-procedures/QUICK_REFERENCE.md
cat development-procedures/procedures/PROCEDURE_HANDBOOK.md

# Run Example App
cd nail_salon_checkin && python app.py
```

---

## 📞 Support

**Questions about procedures?**
- Read: `development-procedures/README.md`

**Want to create a check-in app?**
- Use Skill: `/tao-app-checkin`

**Need quick commands?**
- See: `development-procedures/QUICK_REFERENCE.md`

---

## ✨ Features

### **Development Framework**
- ✅ Professional procedures (25+ pages)
- ✅ Reusable checklists (200+ items)
- ✅ Automation scripts (4 tools)
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Code review system (3 levels)
- ✅ Testing framework (Unit/Integration/E2E)
- ✅ Quality scoring system

### **Example Application**
- ✅ Flask backend (27+ endpoints)
- ✅ Customer check-in form
- ✅ Staff queue management
- ✅ Reports dashboard (4 tabs)
- ✅ CSV export
- ✅ SMS notifications
- ✅ Customer management
- ✅ JSON persistence
- ✅ Mobile-responsive design
- ✅ Render deployment ready

---

## 🎯 Next Steps

1. **Create app using skill:**
   ```
   "Tạo app check-in cho salon"
   ```

2. **Reference procedures:**
   - Code review: `development-procedures/templates/CODE_REVIEW_CHECKLIST.md`
   - Testing: `./development-procedures/scripts/run-tests.sh`
   - Deployment: `development-procedures/templates/DEPLOYMENT_VERIFICATION.md`

3. **Deploy to production:**
   - Push to GitHub → Render auto-deploys
   - Verify: `./development-procedures/scripts/verify-deployment.sh`

---

**Status:** ✅ Ready to use  
**Version:** 1.0  
**Created:** 2026-08-09  
**Maintained By:** Development Team
