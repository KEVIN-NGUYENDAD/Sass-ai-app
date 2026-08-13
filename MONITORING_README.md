# 🔍 Render Status Monitoring System

**Hệ thống tự động theo dõi trạng thái các services trên Render**

---

## 🎯 Overview

Hệ thống này:
- ✅ **Tự động check** Render services mỗi 5 phút
- ✅ **Báo cáo** status (running/deploying/suspended/failed)
- ✅ **Lưu trữ** artifacts suốt 7 ngày
- ✅ **Miễn phí** (GitHub free tier)
- ✅ **Bảo mật** (API key encrypted in secrets)

---

## 🚀 Quick Start

### **Option 1: Automated Setup (Recommended)**

```bash
bash setup-monitoring.sh
```

Script này sẽ:
1. ✅ Check prerequisites (gh CLI)
2. ✅ Add GitHub Secret (RENDER_API_KEY)
3. ✅ Verify workflow files
4. ✅ Trigger initial run
5. ✅ Show results

### **Option 2: Manual Setup (2 minutes)**

1. **Add GitHub Secret:**
   - Go: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/settings/secrets/actions
   - New secret: `RENDER_API_KEY`
   - Value: `rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD`

2. **Done!** Monitoring starts automatically.

---

## 📋 Components

### **1. GitHub Actions Workflow**
- **File:** `.github/workflows/monitor-render-status.yml`
- **Triggers:** Every 5 minutes (business hours) + manual trigger
- **Output:** Status reports + artifacts

### **2. Monitoring Script**
- **File:** `scripts/check_render_status.py`
- **Function:** Queries Render API, formats reports
- **Language:** Python 3
- **Dependencies:** `requests` (auto-installed in workflow)

### **3. Setup Script**
- **File:** `setup-monitoring.sh`
- **Function:** Automates GitHub Secret configuration
- **Requirements:** GitHub CLI (`gh`)

### **4. Documentation**
- **RENDER_MONITORING_SETUP.md** - Detailed technical guide
- **SETUP_NEXT_STEPS.md** - Quick activation checklist
- **MONITORING_README.md** - This file

---

## 📊 How It Works

```
┌─────────────────────────────────────────┐
│  GitHub Actions (Every 5 minutes)       │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ check_render_status   │
        │   .py (Python)        │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   Render API          │
        │  (get services)       │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ Generate Report       │
        │  (Markdown format)    │
        └───────────────────────┘
                    ↓
  ┌─────────────────┴─────────────────┐
  ↓                                   ↓
Save as Artifact               Show in Logs
(7 days retention)          (GitHub Actions)
```

---

## 🔍 What The Report Shows

```
✅ Running Services
   - network-security-audit-backend (service)
   - Region: us-east-1
   - Status: live

🔄 Deploying Services
   - (none if all stable)

🟡 Suspended Services
   - (warning if any)

❌ Failed Services
   - (error if any)

📊 Summary
   - Running: 2
   - Deploying: 0
   - Suspended: 0
   - Failed: 0
```

---

## 🔧 Configuration

### **Schedule (Edit `.github/workflows/monitor-render-status.yml`)**

Current schedule:
```yaml
# Every 5 minutes, weekdays 9AM-5PM UTC
- cron: '*/5 9-17 * * 1-5'
```

**Change to 24/7:**
```yaml
- cron: '*/5 * * * *'
```

**Change to hourly:**
```yaml
- cron: '0 * * * *'
```

### **API Key**

Current key stored in GitHub Secret:
- **Name:** `RENDER_API_KEY`
- **Location:** Settings → Secrets and variables → Actions
- **Value:** `rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD` (encrypted)

---

## 📈 Monitoring Dashboards

### **View Status (3 ways)**

#### **1. GitHub Actions Dashboard**
```
https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions
```
- Click: "Monitor Render Status"
- View: Latest runs + logs + artifacts

#### **2. Render Dashboard**
```
https://dashboard.render.com
```
- Manual check: Services + compute minutes
- Verify against automated reports

#### **3. Artifacts (7 days history)**
```
GitHub Actions → Monitor Render Status
→ Click run → Artifacts
→ Download: render_status.json
```

---

## 🚨 Troubleshooting

### **Problem: Workflow fails with "401 Unauthorized"**

**Cause:** API key invalid or secret not set

**Fix:**
```bash
# 1. Verify secret exists
gh secret list -R kevin-nguyendad/huong-pharmacy-ai-copilot

# 2. Update secret
gh secret set RENDER_API_KEY --body "rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD" \
  -R kevin-nguyendad/huong-pharmacy-ai-copilot

# 3. Trigger workflow again
gh workflow run monitor-render-status.yml \
  -R kevin-nguyendad/huong-pharmacy-ai-copilot
```

### **Problem: No services showing**

**Cause:** Render API returned empty list

**Fix:**
1. Check Render dashboard: https://dashboard.render.com
2. Verify services exist
3. Check API key has proper permissions

### **Problem: Workflow doesn't run automatically**

**Cause:** Workflow disabled or schedule not configured

**Fix:**
1. Go: `.github/workflows/monitor-render-status.yml`
2. Check: `on.schedule` is configured
3. Enable workflow in Actions tab

---

## 🔐 Security

- ✅ **API Key Storage:** GitHub Secrets (AES-256 encrypted)
- ✅ **Visibility:** Not shown in workflow logs
- ✅ **Access Control:** Limited to repository collaborators
- ✅ **Rotation:** Can update secret anytime
- ✅ **Audit Trail:** GitHub logs all access

---

## 💰 Cost Analysis

| Item | Cost | Notes |
|------|------|-------|
| GitHub Actions | $0 | Free 2000 min/month |
| Render API Calls | $0 | No per-call charges |
| Storage (artifacts) | $0 | Free 100GB |
| **TOTAL** | **$0** | Completely free |

---

## 📝 Running Locally

If you want to test the monitoring script locally:

```bash
# Install dependencies
pip install requests

# Set API key
export RENDER_API_KEY="rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD"

# Run script
python scripts/check_render_status.py

# Output
# → Console report
# → render_status.json (saved locally)
```

**Output example:**
```json
{
  "timestamp": "2026-08-13T12:34:56.789123",
  "services": [
    {
      "id": "srv_xxx",
      "name": "network-security-audit-backend",
      "type": "service",
      "region": "us-east-1",
      "status": "live"
    }
  ],
  "usage": { ... },
  "all_healthy": true,
  "report": "✅ Running Services\n..."
}
```

---

## 🔄 Integrations (Future)

### **Possible Enhancements:**

- [ ] **Slack Notifications:** Post report to Slack channel
- [ ] **GitHub Issues:** Auto-create issue when service fails
- [ ] **Email Alerts:** Send alert if status changes
- [ ] **Dashboard UI:** Custom status page
- [ ] **Database Logging:** Store history in database
- [ ] **Metrics Export:** Prometheus/Grafana integration

---

## 📞 Support

### **Questions?**

1. **Setup issues:** Read `SETUP_NEXT_STEPS.md`
2. **Technical details:** See `RENDER_MONITORING_SETUP.md`
3. **Errors:** Check GitHub Actions logs
4. **API questions:** https://docs.render.com/api

### **Issues to watch:**

- ❌ Service status changes unexpectedly
- ❌ Compute minutes approaching limit
- ❌ API key expired/invalid
- ❌ Workflow not running on schedule

---

## ✅ Verification Checklist

- [ ] Run: `bash setup-monitoring.sh`
- [ ] Verify: GitHub Secret `RENDER_API_KEY` exists
- [ ] Check: Workflow runs in GitHub Actions
- [ ] View: Latest report + artifacts
- [ ] Bookmark: Monitoring dashboards
- [ ] Test: Manual workflow trigger
- [ ] ✅ **DONE:** Monitoring is active!

---

## 📚 File Structure

```
huong-pharmacy-ai-copilot/
├── .github/
│   └── workflows/
│       └── monitor-render-status.yml    ← Workflow automation
├── scripts/
│   └── check_render_status.py          ← Monitoring script
├── setup-monitoring.sh                  ← Setup automation
├── RENDER_MONITORING_SETUP.md           ← Detailed guide
├── SETUP_NEXT_STEPS.md                  ← Quick checklist
└── MONITORING_README.md                 ← This file
```

---

## 🎯 Next Steps

1. **Setup:** `bash setup-monitoring.sh`
2. **Verify:** Check GitHub Actions
3. **Bookmark:** Save dashboards
4. **Monitor:** Weekly checks of Render dashboard
5. **Adjust:** Customize schedule if needed

---

**Status:** ✅ Ready to use

**Last Updated:** 2026-08-13

**Maintenance:** Zero (fully automated)

**Cost:** $0 (GitHub free tier)

---

**Questions?** See detailed guides in project docs.
