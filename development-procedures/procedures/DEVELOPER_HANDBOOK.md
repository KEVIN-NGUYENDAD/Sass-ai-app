# 👨‍💻 Developer Handbook

**Project:** Nail Salon Check-In System  
**Version:** 1.0  
**Purpose:** Standards, conventions, and best practices for development

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Standards](#code-standards)
3. [Naming Conventions](#naming-conventions)
4. [API Design](#api-design)
5. [Data Persistence](#data-persistence)
6. [Error Handling](#error-handling)
7. [Security Guidelines](#security-guidelines)
8. [Performance Optimization](#performance-optimization)
9. [Commit Message Standards](#commit-message-standards)

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────┐
│              Flask Web Application              │
│  (nail_salon_checkin/app.py - ~843 lines)      │
└────────────────────┬────────────────────────────┘
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌──────────────┐  ┌─────────────────┐
    │ Templates    │  │  API Endpoints  │
    │ (7 HTML)     │  │  (27+ endpoints)│
    │              │  │                 │
    │ - checkin    │  │ - /api/checkin  │
    │ - staff      │  │ - /api/confirm  │
    │ - reports    │  │ - /api/reports  │
    │ - etc        │  │ - etc           │
    └──────────────┘  └────────┬────────┘
                               ▼
    ┌──────────────────────────────────────┐
    │    Data Persistence (JSON Files)     │
    │                                      │
    │ - data/checkins.json                │
    │ - data/customers.json               │
    │ - Thread-safe locking               │
    └──────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────────────────────────────────┐
    │  Third-Party Services              │
    │  - Twilio (SMS)                    │
    │  - Render (Hosting)                │
    └────────────────────────────────────┘
```

### Technology Stack

- **Backend:** Python 3.8+ with Flask framework
- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Data:** JSON file-based persistence
- **Authentication:** Session-based (staff password: 250618)
- **SMS:** Twilio API integration
- **Hosting:** Render (free tier)

---

## Code Standards

### Python Code Style

**Follow:** PEP 8 with these standards:

```python
# Good
def calculate_report_totals(checkins):
    """Calculate total tips and service count."""
    total_tips = sum(c.get("tips", 0) for c in checkins)
    return total_tips

# Bad
def CalcReportTotals(checkins):  # Wrong: PascalCase for functions
    totalTips = sum(c.get("tips", 0) for c in checkins)  # camelCase
    return totalTips
```

**Line Length:** Maximum 100 characters
```python
# Good
this_is_a_long_variable_name = calculate_something_complex(
    param1, param2, param3
)

# Bad
this_is_a_long_variable_name = calculate_something_complex(param1, param2, param3)  # Over 100 chars
```

**Imports:** Organized and grouped
```python
# Good order:
# 1. Standard library
import json
import threading
from datetime import datetime

# 2. Third-party
from flask import Flask, request, jsonify
import twilio

# 3. Local
from nail_salon_checkin import utils
```

### Comments

**Good:** Explains non-obvious logic
```python
# Only keep the maximum date for last_visit
if current_date > customer_map[phone]["last_visit"]:
    customer_map[phone]["last_visit"] = current_date
```

**Avoid:** Obvious comments
```python
# Bad - too obvious
customer = customers[0]  # Get first customer
```

**Docstrings:** For functions and classes
```python
def get_customers(status_filter=None):
    """Retrieve customers with optional status filtering.
    
    Args:
        status_filter: Filter by check-in status ('waiting_confirm', 'confirmed', 'complete')
    
    Returns:
        dict: {phone: {name, nickname, last_visit, visit_count, ...}}
    """
```

---

## Naming Conventions

### Variables

```python
# Good: descriptive, lowercase with underscores
customer_phone = "555-1234"
is_authenticated = True
total_tips_today = 50.00

# Bad: abbreviations, unclear
cust_ph = "555-1234"  # Too abbreviated
authed = True         # Unclear
tt = 50.00            # What is tt?
```

### Constants

```python
# All uppercase with underscores
DEFAULT_DURATION_MINUTES = 30
STAFF_PASSWORD = "250618"
MAX_RETRIES = 3
DATABASE_FILE = "data/checkins.json"
```

### Files and Modules

```
app.py                    # Main Flask application
requirements.txt          # Python dependencies
render.yaml              # Render deployment config
nail_salon_checkin/      # Main package
  ├── app.py
  ├── templates/         # HTML templates
  ├── static/           # CSS, JavaScript
  └── data/             # JSON data files
tests/                   # Test files
  ├── unit/
  ├── integration/
  └── e2e/
```

### Classes

```python
# PascalCase
class CustomerManager:
    pass

class DatabaseConnection:
    pass
```

### HTML/CSS IDs and Classes

```html
<!-- IDs: kebab-case, descriptive -->
<div id="staff-queue-container">
    <button id="refresh-queue-btn">Refresh</button>
</div>

<!-- Classes: kebab-case -->
<div class="card wide">
    <div class="card-header">Title</div>
</div>
```

---

## API Design

### Endpoint Structure

```
GET     /api/<resource>              # List all
POST    /api/<resource>              # Create
GET     /api/<resource>/<id>         # Get one
PUT     /api/<resource>/<id>         # Update
DELETE  /api/<resource>/<id>         # Delete
POST    /api/<resource>/<id>/action  # Custom action
```

### Request/Response Format

**Request:**
```json
{
    "name": "Customer Name",
    "phone": "555-1234",
    "service": "Gel manicure",
    "date": "2026-08-09",
    "time": "10:00",
    "duration_minutes": 60,
    "nickname": "CN"
}
```

**Success Response (201):**
```json
{
    "id": "20260809-1000-xxx",
    "status": "waiting_confirm",
    "confirmed": false,
    "created_at": "2026-08-09T10:00:00",
    ...
}
```

**Error Response (400):**
```json
{
    "error": "Invalid phone format",
    "field": "phone",
    "status": 400
}
```

**Authentication Error (401):**
```json
{
    "error": "Not authenticated",
    "status": 401
}
```

### HTTP Status Codes

Use correct status codes:

```python
# 200 OK - Successful GET or general success
return {"success": true}, 200

# 201 Created - Resource created successfully
return check_in_data, 201

# 400 Bad Request - Invalid input
return {"error": "Missing required field"}, 400

# 401 Unauthorized - Not authenticated
return {"error": "Authentication required"}, 401

# 403 Forbidden - Authenticated but not authorized
return {"error": "Insufficient permissions"}, 403

# 404 Not Found - Resource doesn't exist
return {"error": "Record not found"}, 404

# 500 Internal Server Error - Unexpected server error
return {"error": "Database error"}, 500
```

### Example Endpoints

```python
# GET: List all check-ins
@app.route('/api/checkins')
def get_checkins():
    """List all check-ins (optionally filtered by date)."""
    date_filter = request.args.get('date')  # Query parameter
    # ... implementation ...
    return jsonify(checkins), 200

# POST: Create check-in
@app.route('/api/checkin', methods=['POST'])
def create_checkin():
    """Create new customer check-in."""
    data = request.get_json()
    # Validate data
    # Create record
    return jsonify(checkin_data), 201

# POST: Custom action
@app.route('/api/checkin/<checkin_id>/confirm', methods=['POST'])
def confirm_checkin(checkin_id):
    """Confirm customer duration."""
    data = request.get_json()
    # Update status and duration
    return jsonify(updated_checkin), 200
```

---

## Data Persistence

### JSON Structure

**checkins.json:**
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
        "note": "Customer notes",
        "created_at": "2026-08-09T10:00:00",
        "confirmed_at": "2026-08-09T10:15:00"
    }
]
```

**customers.json:**
```json
{
    "555-1234": {
        "phone": "555-1234",
        "name": "Customer Name",
        "nickname": "CN",
        "note": "Customer notes",
        "visit_count": 5,
        "last_visit": "2026-08-09",
        "created_at": "2026-08-01T10:00:00"
    }
}
```

### File Operations

**Thread-Safe Reading:**
```python
data_lock = threading.Lock()

def load_data(filename):
    """Load data with thread safety."""
    with data_lock:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
```

**Thread-Safe Writing:**
```python
def save_data(filename, data):
    """Save data with thread safety."""
    with data_lock:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
```

### Data Validation

```python
def validate_checkin(data):
    """Validate check-in data before saving."""
    required_fields = ['name', 'phone', 'service', 'date', 'time']
    
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Missing required field: {field}")
    
    # Phone format check
    if not is_valid_phone(data['phone']):
        raise ValueError("Invalid phone format")
    
    return True
```

---

## Error Handling

### Pattern: Try-Except-Finally

```python
@app.route('/api/checkin', methods=['POST'])
def create_checkin():
    """Create check-in with error handling."""
    try:
        data = request.get_json()
        
        # Validate
        if not data.get('phone'):
            return {"error": "Phone required"}, 400
        
        # Process
        checkin = create_new_checkin(data)
        
        # Send SMS (might fail, but don't crash)
        try:
            send_sms(data['phone'], f"Appointment at {data['time']}")
        except Exception as e:
            # Log but don't crash
            app.logger.warning(f"SMS failed: {e}")
        
        return checkin, 201
        
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return {"error": "Server error"}, 500
```

### Logging Best Practices

```python
import logging

# Setup logger
logger = logging.getLogger(__name__)

# Use appropriate levels
logger.debug("Detailed info for debugging")     # Lowest
logger.info("General information")              # Important events
logger.warning("Warning - recoverable issue")   # User should know
logger.error("Error - something failed")        # Operation failed
logger.critical("Critical - system issue")      # System at risk
```

### Graceful Degradation

```python
def send_sms_notification(phone, message):
    """Send SMS with graceful error handling."""
    try:
        # Try to send
        response = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=phone
        )
        logger.info(f"SMS sent to {phone}: {response.sid}")
        return True
        
    except Exception as e:
        # Log error but continue
        logger.error(f"SMS failed for {phone}: {e}")
        # Don't raise - let application continue
        return False
```

---

## Security Guidelines

### Authentication

```python
# All staff pages require authentication
@app.route('/staff')
def staff_queue():
    # Check if authenticated
    if not session.get('staff_authenticated'):
        return redirect('/staff-login')
    
    # Allow access
    return render_template('staff.html')
```

### Password Security

```python
# Good: Never store plain text password in code
STAFF_PASSWORD = os.environ.get('STAFF_PASSWORD')

# Validate password
def validate_staff_login(password):
    """Validate staff password."""
    # Use this in login endpoint
    if password == STAFF_PASSWORD:
        session['staff_authenticated'] = True
        return True
    return False
```

### Input Validation

```python
def sanitize_input(text):
    """Remove potentially dangerous characters."""
    # Allow alphanumeric, spaces, basic punctuation
    import re
    return re.sub(r'[^a-zA-Z0-9\s\-\.\,\']', '', text)

# Validate phone format
import re
def is_valid_phone(phone):
    """Check if phone looks like valid format."""
    return bool(re.match(r'^[\d\-\(\)\s]+$', phone))
```

### Preventing SQL Injection

```python
# Not applicable for JSON files, but important concept:
# NEVER do:
# query = f"SELECT * FROM users WHERE phone = '{phone}'"  # ❌ BAD

# DO use parameterized queries (if using database):
# cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))  # ✅ GOOD
```

### Logging Security

```python
def log_checkin(checkin_data):
    """Log check-in (don't log sensitive data)."""
    safe_data = {
        'id': checkin_data['id'],
        'status': checkin_data['status'],
        'date': checkin_data['date'],
        # DON'T log: phone, password, credit card
    }
    logger.info(f"Check-in: {safe_data}")
```

---

## Performance Optimization

### Efficient Data Access

```python
# Good: Load data once, keep in memory during request
checkins = load_data('data/checkins.json')
customers = load_data('data/customers.json')

# Process
for checkin in checkins:
    # Use in-memory data

# Save once
save_data('data/checkins.json', checkins)

# Bad: Load/save repeatedly in loop
for checkin in checkins:  # ❌ Inefficient
    data = load_data('data/checkins.json')
    # ... update ...
    save_data('data/checkins.json', data)
```

### Filtering and Searching

```python
# Good: Filter in Python (data already in memory)
def get_checkins_by_date(date):
    checkins = load_data('data/checkins.json')
    return [c for c in checkins if c['date'] == date]

# Good: Build customer lookup for O(1) access
customer_map = {c['phone']: c for c in customers}
customer = customer_map.get(phone)  # Fast lookup
```

### Caching

```python
# Cache frequently accessed data
_customer_cache = None
_cache_time = None

def get_customers(refresh=False):
    """Get customers with caching."""
    global _customer_cache, _cache_time
    
    if not refresh and _customer_cache and time.time() - _cache_time < 60:
        return _customer_cache
    
    _customer_cache = load_data('data/customers.json')
    _cache_time = time.time()
    return _customer_cache
```

---

## Commit Message Standards

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation change
- `style:` Code style (no logic change)
- `refactor:` Refactor without changing behavior
- `test:` Add/modify tests
- `chore:` Dependencies, build config, etc.

### Examples

```
✅ Good:
feat: Add nickname field to check-in form
docs: Update deployment procedures
fix: Ensure status updated after confirmation
test: Add test for CSV export calculation

❌ Bad:
Fix issue
Updated code
WIP stuff
Fixed bug
```

### Extended Message Example

```
feat: Add SMS notification on check-in

When customer completes check-in, owner receives SMS with:
- Customer name and phone
- Appointment time and duration
- Service type

Gracefully handles SMS failures without crashing.
Implements error logging for troubleshooting.

Fixes: #42
Relates to: #38
```

---

## Testing Standards

### Unit Test Structure

```python
def test_calculate_daily_tips():
    """Test tip calculation."""
    # Arrange
    checkins = [
        {'tips': 5.00, 'status': 'complete'},
        {'tips': 3.00, 'status': 'complete'},
        {'tips': 0, 'status': 'waiting_confirm'},
    ]
    
    # Act
    total = calculate_tips(checkins)
    
    # Assert
    assert total == 8.00  # Only completed ones
```

### Test Naming

```python
# Good: describes what it tests
def test_api_checkin_returns_201_on_valid_data():
def test_customer_last_visit_shows_maximum_date():
def test_staff_cannot_access_reports_without_auth():

# Bad: too vague
def test_checkin():
def test_api():
def test_calculate():
```

---

## Resources

- **Python Style Guide:** https://pep8.org/
- **Flask Documentation:** https://flask.palletsprojects.com/
- **Twilio SMS:** https://www.twilio.com/docs/sms/
- **JSON Format:** https://www.json.org/

---

**Last Updated:** 2026-08-09  
**Maintained By:** Development Team  
**Next Review:** 2026-09-09
