---
name: tao-app-checkin
description: Tạo ứng dụng check-in hoàn chỉnh cho salon/spa/clinic với customer management, staff queue, reports, SMS, và professional development procedures. Bao gồm Flask backend, responsive HTML/CSS/JS, JSON persistence, Twilio SMS, Render deployment, code review checklists, testing framework, và CI/CD pipelines. Dùng skill này khi bạn cần "tạo app check-in", "xây dựng hệ thống quản lý khách hàng", "app kiểu nail salon", "tạo ứng dụng appointment-based business".
---

# 🎯 Tạo Ứng Dụng Check-In Hoàn Chỉnh

Skill này giúp bạn tạo một **ứng dụng check-in chuyên nghiệp** cho salon, spa, clinic, barber shop, hoặc bất kỳ business nào cần quản lý khách hàng theo appointment.

## 📦 Những Gì Bạn Sẽ Nhận Được

### **1. Backend Application (Flask)**
```
nail_salon_checkin/
├── app.py                    (843+ dòng, 27+ API endpoints)
├── requirements.txt          (Flask, Gunicorn, Twilio)
├── render.yaml              (Deployment config)
└── data/                    (JSON persistence)
```

**Features:**
- ✅ Customer check-in API
- ✅ Staff authentication (password-protected)
- ✅ Queue management system
- ✅ Daily/Weekly/Monthly reports
- ✅ CSV export
- ✅ SMS notifications (Twilio)
- ✅ Customer search & edit
- ✅ Thread-safe file operations

### **2. Frontend (HTML/CSS/JavaScript)**
```
templates/                   (7 HTML templates)
├── checkin.html            (Customer check-in form)
├── staff.html              (Staff queue management)
├── daily_report.html       (Reports dashboard with 4 tabs)
├── customer_management.html (Customer search & edit)
├── customer_history.html   (Engagement tracking)
├── staff_login.html        (Authentication)
└── confirmation.html       (Success page)

static/
├── style.css               (Mobile-responsive design)
├── script.js               (Check-in form handling)
└── staff.js                (Queue management)
```

**Features:**
- ✅ Mobile-responsive design
- ✅ Real-time queue updates
- ✅ Tab-based reports
- ✅ Search & filter customers
- ✅ Edit customer info (nickname, notes)
- ✅ Professional blue theme

### **3. Development Procedures Package**
Professional development framework bao gồm:

**📖 Procedures (25+ pages)**
- Code Review Process (3 levels: Basic, Standard, High-Effort)
- Testing Procedures (Unit, Integration, E2E)
- Deployment Workflow
- Bug Fixing Protocol
- Quality Assurance Criteria
- Emergency Procedures

**✅ Reusable Templates**
- CODE_REVIEW_CHECKLIST.md (100+ items)
- DEPLOYMENT_VERIFICATION.md (30+ checks)
- QA_CHECKLIST.md (Comprehensive assessment)

**🔧 Automation Scripts**
- verify-deployment.sh - Automated verification
- run-tests.sh - Test runner with coverage
- pre-commit-hook.py - Pre-commit checks
- create-bug-report.sh - Bug report creator

**🔄 CI/CD Pipelines**
- test-and-lint.yml - Auto-test on push/PR
- deploy.yml - Auto-deploy to Render

---

## 🚀 Quick Start

### **Step 1: Tạo Project Structure**
```bash
# Tạo thư mục project
mkdir my-checkin-app
cd my-checkin-app

# Khởi tạo git
git init
git config user.email "you@example.com"
git config user.name "Your Name"
```

### **Step 2: Tạo Backend (Flask App)**

Tạo file `nail_salon_checkin/app.py` với:
- Flask app factory
- 27+ API endpoints
- Customer check-in logic
- Staff queue management
- Report generation (daily/weekly/monthly)
- CSV export functions
- SMS integration (Twilio)
- Thread-safe file operations

**Key Code Structure:**
```python
# 1. Customer check-in endpoint
@app.route('/api/checkin', methods=['POST'])
def create_checkin():
    # Nhận data từ form
    # Validate phone, date, time
    # Tạo record với status='waiting_confirm'
    # Gửi SMS notification
    # Return 201 with check-in ID

# 2. Staff login
@app.route('/staff-login', methods=['POST'])
def staff_login():
    # Verify password (250618)
    # Set session
    # Return 200

# 3. Get queue
@app.route('/api/checkins')
def get_checkins():
    # Lấy tất cả check-ins
    # Filter by date nếu cần
    # Return as JSON

# 4. Update status
@app.route('/api/checkin/<id>/status', methods=['POST'])
def update_status(id):
    # Update status (waiting_confirm → in_service → complete)
    # Return updated record

# 5. Generate reports
@app.route('/api/daily-report')
def get_daily_report():
    # Tính toán totals, tips, stats
    # Return formatted report

# 6. CSV export
@app.route('/api/export-csv')
def export_csv():
    # Generate CSV file
    # Return downloadable file
```

### **Step 3: Tạo Frontend**

**checkin.html** - Customer form:
```html
<form id="checkinForm">
  <input name="name" required>
  <input name="phone" required>
  <input name="nickname">
  <input type="date" name="date" required>
  <select name="time" required>
    <option value="10:00">10:00 AM</option>
    ...
  </select>
  <textarea name="service" required></textarea>
  <button type="submit">Check In</button>
</form>
```

**staff.html** - Queue management:
```html
<h1>Today's Queue</h1>
<div class="stats">
  <div>WAITING: <span id="statWaiting">0</span></div>
  <div>IN SERVICE: <span id="statInService">0</span></div>
  <div>DONE: <span id="statDone">0</span></div>
</div>

<table id="queueTable">
  <thead>
    <tr>
      <th>Time</th>
      <th>Name</th>
      <th>Phone</th>
      <th>Service</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody id="queueBody"></tbody>
</table>
```

**daily_report.html** - Reports with tabs:
```html
<div class="tabs">
  <button class="tab-btn active" data-tab="today">Today</button>
  <button class="tab-btn" data-tab="weekly">Weekly</button>
  <button class="tab-btn" data-tab="monthly">Monthly</button>
  <button class="tab-btn" data-tab="sms">SMS Activity</button>
</div>

<div id="today" class="tab-content"><!-- Daily report --></div>
<div id="weekly" class="tab-content"><!-- Weekly report --></div>
<div id="monthly" class="tab-content"><!-- Monthly report --></div>
<div id="sms" class="tab-content"><!-- SMS log --></div>
```

### **Step 4: Tạo Data Persistence**

Tạo `data/checkins.json`:
```json
[
  {
    "id": "20260809-1000-xxx",
    "name": "Customer Name",
    "phone": "555-1234",
    "nickname": "CN",
    "service": "Gel manicure",
    "date": "2026-08-09",
    "time": "10:00",
    "duration_minutes": 60,
    "status": "confirmed",
    "confirmed": true,
    "tips": 5.00,
    "created_at": "2026-08-09T10:00:00"
  }
]
```

Tạo `data/customers.json`:
```json
{
  "555-1234": {
    "phone": "555-1234",
    "name": "Customer Name",
    "nickname": "CN",
    "visit_count": 5,
    "last_visit": "2026-08-09"
  }
}
```

### **Step 5: Thiết Lập SMS Integration (Twilio)**

```python
# Cài đặt credentials
import os
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE = os.environ.get('TWILIO_PHONE')

# Gửi SMS
def send_sms(phone, message):
    try:
        twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=phone
        )
        return True
    except Exception as e:
        # Log error nhưng không crash
        app.logger.warning(f"SMS failed: {e}")
        return False
```

### **Step 6: Deploy lên Render**

Tạo `render.yaml`:
```yaml
services:
  - type: web
    name: nail-salon-checkin
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT nail_salon_checkin.app:app
    envVars:
      - key: TWILIO_ACCOUNT_SID
        value: your_sid
      - key: TWILIO_AUTH_TOKEN
        value: your_token
      - key: TWILIO_PHONE
        value: your_number
```

Push to GitHub → Render auto-deploys

### **Step 7: Thiết Lập Development Procedures**

```bash
# Tạo development procedures package
mkdir development-procedures
cp -r [procedures, templates, scripts, ci-cd]

# Install pre-commit hook
ln -s ../../development-procedures/scripts/pre-commit-hook.py .git/hooks/pre-commit

# Setup GitHub Actions
mkdir -p .github/workflows
cp development-procedures/ci-cd/test-and-lint.yml .github/workflows/
cp development-procedures/ci-cd/deploy.yml .github/workflows/
```

---

## 📋 API Endpoints (27+)

### **Customer Check-In**
- `POST /api/checkin` - Tạo check-in
- `GET /api/checkin/<id>` - Lấy chi tiết
- `POST /api/checkin/<id>/confirm` - Confirm duration

### **Staff Management**
- `POST /api/staff-login` - Đăng nhập
- `GET /api/checkins` - Lấy queue
- `POST /api/checkin/<id>/status` - Cập nhật status

### **Reporting**
- `GET /api/daily-report` - Báo cáo ngày
- `GET /api/weekly-report` - Báo cáo tuần
- `GET /api/monthly-report` - Báo cáo tháng
- `GET /api/export-csv` - Export CSV

### **Customer Management**
- `GET /api/customers` - Danh sách khách
- `POST /api/customer/<phone>` - Cập nhật khách
- `DELETE /api/customer/<phone>` - Xóa khách

### **SMS**
- `POST /api/send-sms` - Gửi SMS thủ công

---

## 🧪 Testing

### **Unit Tests**
```bash
pytest tests/unit/ -v --cov=nail_salon_checkin
```

### **Integration Tests**
```bash
pytest tests/integration/ -v
```

### **E2E Tests**
```bash
pytest tests/e2e/ -v --headed
```

### **Coverage Report**
```bash
pytest tests/ --cov=nail_salon_checkin --cov-report=html
open htmlcov/index.html
```

---

## 📊 Quality Assurance

Sử dụng checklists từ `development-procedures/templates/`:

1. **CODE_REVIEW_CHECKLIST.md** - Review code (100+ items)
2. **QA_CHECKLIST.md** - Test quality (100+ items)
3. **DEPLOYMENT_VERIFICATION.md** - Verify deployment (30+ checks)

**Target Score:** 95/100 trước khi production

---

## 🔄 Deployment Workflow

### **Local Development**
```bash
# Install dependencies
pip install -r requirements.txt
pip install pytest pytest-cov

# Run app
python nail_salon_checkin/app.py

# Run tests
./development-procedures/scripts/run-tests.sh all

# Pre-commit hook
git commit -m "feat: Add feature"
```

### **Push to GitHub**
```bash
git add .
git commit -m "feat: Feature description"
git push origin main
```

### **GitHub Actions (Automatic)**
- `test-and-lint.yml` runs on every push
- Tests on Python 3.8-3.11
- Checks coverage, style, security

### **Deploy to Render (Automatic)**
- When merged to main
- Render rebuilds and deploys
- Takes 2-5 minutes
- Auto-live at production URL

### **Verify Deployment**
```bash
./development-procedures/scripts/verify-deployment.sh <URL>
```

---

## 🛠️ Customization

### **Change Business Type**
- Salon → Spa, Clinic, Barber, Gym, etc.
- Just update form labels and database field names

### **Add Payment Integration**
- Add Stripe/PayPal to `/api/checkin` endpoint
- Store payment_id in checkin record

### **Multi-Language Support**
- Create `i18n/` folder with translations
- Update templates to use `{{ _('text') }}`

### **Email Instead of SMS**
- Replace Twilio with SendGrid/AWS SES
- Update `send_sms()` function

### **Database Instead of JSON**
- Add SQLAlchemy
- Create models for Customer, Checkin, etc.
- Migrate from JSON to database

---

## 📚 Documentation Included

- `PROCEDURE_HANDBOOK.md` - Complete procedures (15+ pages)
- `DEVELOPER_HANDBOOK.md` - Coding standards
- `QUICK_REFERENCE.md` - Common commands
- `README.md` - Setup guide
- `MEMORY.md` - Quick recall

---

## ✅ Checklist - Trước Khi Deploy

- [ ] All tests passing locally
- [ ] Code reviewed using CODE_REVIEW_CHECKLIST.md
- [ ] QA checklist completed (score > 95/100)
- [ ] SMS credentials configured
- [ ] GitHub Actions setup (.github/workflows/)
- [ ] Render config ready (render.yaml)
- [ ] Database backups (if applicable)
- [ ] Stakeholders notified

---

## 🎯 Success Criteria

Your app is ready when:
- ✅ Customer can check-in from home page
- ✅ Staff can login with password
- ✅ Queue displays all check-ins
- ✅ Status updates work (Waiting → In Service → Done)
- ✅ Reports generate (Daily/Weekly/Monthly)
- ✅ CSV export works
- ✅ SMS notifications send
- ✅ Mobile responsive
- ✅ Deployed to Render
- ✅ All tests passing

---

## 🚨 Common Issues & Solutions

**Issue: SMS not sending**
- Check Twilio credentials in env vars
- Verify phone format (include country code)
- Check logs for errors

**Issue: Port already in use**
- Kill process: `lsof -i :5000` then `kill -9 <PID>`
- Or change port: `python app.py --port 5001`

**Issue: Database locked**
- JSON file might be read-only
- Run: `chmod 644 data/*.json`

**Issue: Render build fails**
- Check build logs on Render dashboard
- Ensure `requirements.txt` is in root
- Verify Python version compatible

**Issue: Tests failing**
- Run locally first: `pytest tests/ -v`
- Check test data setup
- Review error messages carefully

---

## 📞 Next Steps

1. **Create project folder** - `mkdir my-app && cd my-app`
2. **Initialize git** - `git init`
3. **Build backend** - Create `nail_salon_checkin/app.py`
4. **Build frontend** - Create templates
5. **Add procedures** - Copy development-procedures folder
6. **Setup GitHub** - Push to GitHub
7. **Deploy** - Connect to Render
8. **Monitor** - Watch logs and metrics

---

**Version:** 1.0  
**Last Updated:** 2026-08-09  
**Status:** Production Ready ✅
