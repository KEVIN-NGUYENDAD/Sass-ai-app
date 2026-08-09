# Project Structure - Complete Guide

## Directory Layout

```
my-checkin-app/
│
├── 📁 nail_salon_checkin/          # Main application package
│   ├── app.py                      # Flask app (843+ lines, 27+ endpoints)
│   ├── __init__.py                 # Package init
│   │
│   ├── 📁 templates/               # HTML templates (7 files)
│   │   ├── checkin.html           # Customer check-in form
│   │   ├── staff.html             # Staff queue management
│   │   ├── staff_login.html       # Staff authentication
│   │   ├── daily_report.html      # Reports dashboard (4 tabs)
│   │   ├── customer_management.html # Customer search & edit
│   │   ├── customer_history.html  # Engagement tracking
│   │   └── confirmation.html      # Success page
│   │
│   ├── 📁 static/                  # Static files (CSS, JS)
│   │   ├── style.css              # Main stylesheet (responsive)
│   │   ├── script.js              # Check-in form logic
│   │   └── staff.js               # Queue management logic
│   │
│   ├── 📁 data/                    # JSON data persistence
│   │   ├── checkins.json          # All check-in records
│   │   └── customers.json         # Customer database
│   │
│   └── 📁 tests/                   # Test suite
│       ├── __init__.py
│       ├── 📁 unit/               # Unit tests
│       ├── 📁 integration/        # Integration tests
│       └── 📁 e2e/                # End-to-end tests
│
├── 📁 development-procedures/      # Professional dev framework
│   ├── README.md                   # Setup & usage guide
│   ├── QUICK_REFERENCE.md         # Common tasks
│   ├── MEMORY.md                  # Quick recall
│   │
│   ├── 📁 procedures/             # Step-by-step guides
│   │   ├── PROCEDURE_HANDBOOK.md  # All procedures (15+ pages)
│   │   └── DEVELOPER_HANDBOOK.md  # Coding standards
│   │
│   ├── 📁 templates/              # Reusable checklists
│   │   ├── CODE_REVIEW_CHECKLIST.md
│   │   ├── QA_CHECKLIST.md
│   │   └── DEPLOYMENT_VERIFICATION.md
│   │
│   ├── 📁 scripts/                # Automation tools
│   │   ├── run-tests.sh           # Test runner
│   │   ├── verify-deployment.sh   # Deployment checker
│   │   ├── create-bug-report.sh   # Bug reporter
│   │   └── pre-commit-hook.py     # Pre-commit checks
│   │
│   └── 📁 ci-cd/                  # GitHub Actions
│       ├── test-and-lint.yml      # Test pipeline
│       └── deploy.yml             # Deploy pipeline
│
├── 📁 .github/                     # GitHub config
│   ├── workflows/                  # CI/CD workflows
│   │   ├── test-and-lint.yml
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md   # PR template
│
├── requirements.txt                # Python dependencies
├── render.yaml                     # Render deployment config
├── .gitignore                      # Git ignore rules
├── .env.example                    # Environment template
├── README.md                       # Project README
└── .git/                          # Git repository

```

---

## Key Files Explained

### **app.py** (843+ lines)
Main Flask application containing:
- Routes (27+ endpoints)
- Business logic
- Database operations
- SMS integration
- Error handling

**Structure:**
```python
from flask import Flask, render_template, request, jsonify, session
import threading
import json
import os
from datetime import datetime, timedelta
import twilio

# Initialize app
app = Flask(__name__)

# Thread safety
data_lock = threading.Lock()

# Load/save functions
def load_data(filename): ...
def save_data(filename, data): ...

# API routes
@app.route('/api/checkin', methods=['POST'])
@app.route('/api/customers', methods=['GET'])
@app.route('/api/daily-report', methods=['GET'])
# ... etc

# Page routes
@app.route('/')
@app.route('/staff')
@app.route('/daily-report')
# ... etc

if __name__ == '__main__':
    app.run(debug=True)
```

### **checkin.html** - Customer Form
```html
<!DOCTYPE html>
<html>
<head>
  <title>Check-In</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
  <form id="checkinForm">
    <input id="name" name="name" placeholder="Name" required>
    <input id="phone" name="phone" placeholder="Phone" required>
    <input id="nickname" name="nickname" placeholder="Nickname (optional)">
    <input id="date" name="date" type="date" required>
    <select id="time" name="time" required>
      <!-- 30-min intervals: 9:00-18:00 -->
    </select>
    <textarea id="service" name="service" placeholder="Service" required></textarea>
    <button type="submit">Check In</button>
  </form>
  <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>
```

### **staff.html** - Queue Management
```html
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
      <th>Actions</th>
    </tr>
  </thead>
  <tbody id="queueBody"></tbody>
</table>
```

### **daily_report.html** - Reports
```html
<div class="tabs">
  <button class="tab-btn active" data-tab="today">Today</button>
  <button class="tab-btn" data-tab="weekly">Weekly</button>
  <button class="tab-btn" data-tab="monthly">Monthly</button>
  <button class="tab-btn" data-tab="sms">SMS Activity</button>
</div>

<div id="today" class="tab-content">
  <!-- Report data rendered here -->
  <div class="summary">
    <div>Total Customers: <span id="totalCustomers">0</span></div>
    <div>Total Tips: $<span id="totalTips">0</span></div>
  </div>
  <button onclick="exportCSV('today')">📥 Download CSV</button>
</div>
```

### **style.css** - Responsive Design
```css
:root {
  --primary: #3b82f6;      /* Blue */
  --pink-dark: #ec4899;    /* Pink */
  --muted: #9ca3af;        /* Gray */
  --border: #e5e7eb;       /* Light gray */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  background: #f3f4f6;
  margin: 0;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  body { padding: 12px; }
  .card { padding: 16px; }
}
```

### **requirements.txt** - Dependencies
```
flask==2.3.0
gunicorn==21.0.0
twilio==8.0.0
python-dotenv==1.0.0
```

### **render.yaml** - Deployment
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
        scope: all
        value: (set in dashboard)
      - key: TWILIO_AUTH_TOKEN
        scope: all
        value: (set in dashboard)
      - key: TWILIO_PHONE
        scope: all
        value: (set in dashboard)
```

### **.github/workflows/test-and-lint.yml**
```yaml
name: Test & Lint

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.8', '3.9', '3.10', '3.11']
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    - run: pip install -r requirements.txt
    - run: pip install pytest pytest-cov flake8
    - run: flake8 nail_salon_checkin/
    - run: pytest tests/ -v --cov
```

### **.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    - run: pip install -r requirements.txt pytest
    - run: pytest tests/
    - name: Deploy to Render
      run: echo "Render auto-deploys on main branch push"
```

---

## Data Format

### **checkins.json**
```json
[
  {
    "id": "20260809-1000-abc123",
    "name": "Khách Hàng",
    "phone": "(555) 123-4567",
    "nickname": "KH",
    "service": "Gel manicure",
    "date": "2026-08-09",
    "time": "10:00",
    "duration_minutes": 60,
    "status": "confirmed",
    "confirmed": true,
    "tips": 5.00,
    "note": "VIP customer",
    "created_at": "2026-08-09T10:00:00Z",
    "confirmed_at": "2026-08-09T10:05:00Z"
  }
]
```

### **customers.json**
```json
{
  "(555) 123-4567": {
    "phone": "(555) 123-4567",
    "name": "Khách Hàng",
    "nickname": "KH",
    "note": "Prefers quick service",
    "visit_count": 5,
    "last_visit": "2026-08-09",
    "created_at": "2026-08-01T10:00:00Z"
  }
}
```

---

## Environment Variables (.env)
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE=+1234567890
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
```

---

## File Sizes
- app.py: ~843 lines
- Templates: 7 files, ~2000 lines total
- CSS/JS: ~600 lines total
- Development procedures: ~4000 lines
- Total: ~7000 lines of code

---

**This structure is production-ready and follows best practices for:**
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Professional deployment
