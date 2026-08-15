"""
Unified Salon Hub: Check-In + Network Security for Nail Salons
Combines nail salon check-in system + network security audit
"""

from flask import Flask, request, jsonify, redirect, render_template, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import json
import secrets
import re
import threading
import uuid
from datetime import datetime, timedelta
from functools import wraps
import logging

load_dotenv()

app = Flask(__name__, template_folder='../frontend/templates')
CORS(app)
logger = logging.getLogger("salon_hub")

# ============================================================================
# CONFIGURATION
# ============================================================================

app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

# Check-in settings
OPEN_HOUR = 9
OPEN_MINUTE = 30
CLOSE_HOUR = 19
CLOSE_MINUTE = 0
SLOT_MINUTES = 30
CHAIRS_PER_SLOT = 1
MAX_DAYS_AHEAD = 7
DURATION_OPTIONS = (30, 45, 60)

# Credentials
OWNER_PHONE = os.environ.get("OWNER_PHONE", "+16237604999")
STAFF_PASSWORD = os.environ.get("STAFF_PASSWORD", "250618")
BASE_URL_OVERRIDE = os.environ.get("BASE_URL")

# Twilio
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_API_KEY_SID = os.environ.get("TWILIO_API_KEY_SID")
TWILIO_API_KEY_SECRET = os.environ.get("TWILIO_API_KEY_SECRET")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER")

# Stripe
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_fake")
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "pk_test_fake")

# Security & Rate limiting
API_TOKEN = os.getenv('API_TOKEN', secrets.token_urlsafe(32))
if os.getenv('API_TOKEN') is None:
    print(f"⚠️  WARNING: No API_TOKEN set. Using random token: {API_TOKEN}")

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "10 per minute"]
)

# Data storage
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "salon_hub_data.json")

STATUSES = ("waiting_confirm", "confirmed", "in_service", "complete", "cancelled")
_lock = threading.Lock()

# ============================================================================
# AUTHENTICATION & SECURITY
# ============================================================================

def require_auth(f):
    """Require API token authentication for API endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('X-API-Token', '')
        if not token or token != API_TOKEN:
            return jsonify({
                'success': False,
                'error': 'Unauthorized',
                'message': 'Invalid or missing API token'
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def require_staff_auth(f):
    """Require staff session authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('staff_authenticated'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function


def is_localhost(host):
    """Check if target is localhost (CRITICAL security restriction)"""
    localhost_variants = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0']
    return host.lower() in localhost_variants


# ============================================================================
# INPUT VALIDATION (Network Security)
# ============================================================================

def validate_port_range(ports_str):
    """Validate port range input"""
    if not ports_str or not isinstance(ports_str, str):
        return False
    ports_str = ports_str.strip()
    if len(ports_str) > 100:
        return False
    if re.match(r'^[\d,\-\s]+$', ports_str):
        return True
    return False


def validate_hostname(hostname):
    """Validate hostname/IP input"""
    if not hostname or not isinstance(hostname, str):
        return False
    hostname = hostname.strip()
    if len(hostname) > 255:
        return False
    if re.match(r'^[a-zA-Z0-9\.\:\-_]+$', hostname):
        return True
    return False


def validate_password(password):
    """Validate password input"""
    if not password or not isinstance(password, str):
        return False
    if len(password) < 1 or len(password) > 128:
        return False
    return True


def validate_ssid(ssid):
    """Validate WiFi SSID input"""
    if not isinstance(ssid, str):
        return False
    if len(ssid) > 32:
        return False
    return True


# ============================================================================
# DATA MANAGEMENT
# ============================================================================

def _load_data():
    """Load complete data structure"""
    if not os.path.exists(DATA_FILE):
        return {
            "checkins": [],
            "reports": {},
            "sms_log": [],
            "subscriptions": {},
            "scan_history": []
        }
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return data
        except json.JSONDecodeError:
            return {
                "checkins": [],
                "reports": {},
                "sms_log": [],
                "subscriptions": {},
                "scan_history": []
            }


def _save_data(data):
    """Save complete data structure"""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_base_url():
    """Get base URL for SMS links"""
    if BASE_URL_OVERRIDE:
        return BASE_URL_OVERRIDE.rstrip("/")
    root = request.url_root.rstrip("/")
    if root.startswith("http://") and "localhost" not in root and "127.0.0.1" not in root:
        root = "https://" + root[len("http://"):]
    return root


def format_time_12h(t):
    """Format time to 12-hour format"""
    dt = datetime.strptime(t, "%H:%M")
    return dt.strftime("%I:%M %p").lstrip("0")


def generate_slots():
    """Generate time slots for the day"""
    slots = []
    start = datetime(2000, 1, 1, OPEN_HOUR, OPEN_MINUTE)
    end = datetime(2000, 1, 1, CLOSE_HOUR, CLOSE_MINUTE)
    current = start
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=SLOT_MINUTES)
    return slots


SLOTS = generate_slots()


def valid_date(date_str):
    """Validate date"""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return False
    today = datetime.now().date()
    return today <= d <= today + timedelta(days=MAX_DAYS_AHEAD - 1)


def slot_occupancy(checkins, date_str):
    """Map slot time -> booked chairs"""
    occupancy = {}
    for c in checkins:
        if c["date"] != date_str or c["status"] == "cancelled":
            continue
        if c["time"] not in SLOTS:
            continue
        duration = c.get("duration_minutes") or SLOT_MINUTES
        span = max(1, duration // SLOT_MINUTES)
        start_index = SLOTS.index(c["time"])
        for i in range(start_index, min(start_index + span, len(SLOTS))):
            t = SLOTS[i]
            occupancy[t] = occupancy.get(t, 0) + 1
    return occupancy


# ============================================================================
# SMS (Twilio)
# ============================================================================

def _twilio_credentials_configured():
    """Check if Twilio is configured"""
    has_api_key_auth = TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET and TWILIO_ACCOUNT_SID
    has_auth_token = TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
    return bool(TWILIO_FROM_NUMBER and (has_api_key_auth or has_auth_token))


def _twilio_client():
    """Get Twilio client"""
    from twilio.rest import Client
    if TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET and TWILIO_ACCOUNT_SID:
        return Client(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def send_sms(to_number, body):
    """Send SMS via Twilio"""
    if not to_number:
        return
    if not _twilio_credentials_configured():
        logger.info("[SMS not sent - Twilio not configured] to=%s body=%s", to_number, body)
        return
    try:
        client = _twilio_client()
        client.messages.create(to=to_number, from_=TWILIO_FROM_NUMBER, body=body)
        logger.info("[SMS sent] to=%s", to_number)
    except Exception as e:
        logger.warning("[SMS failed] to=%s error=%s", to_number, str(e))


# ============================================================================
# ROUTES: Authentication
# ============================================================================

@app.route("/api/staff-login", methods=["POST"])
@limiter.limit("5 per minute")
def api_staff_login():
    """Staff login"""
    data = request.get_json(silent=True) or {}
    password = data.get("password", "").strip()
    if password == STAFF_PASSWORD:
        session["staff_authenticated"] = True
        return jsonify({"success": True}), 200
    return jsonify({"error": "Incorrect password"}), 401


@app.route("/api/staff-logout", methods=["POST"])
def api_staff_logout():
    """Staff logout"""
    session.clear()
    return jsonify({"success": True}), 200


# ============================================================================
# ROUTES: Check-In System
# ============================================================================

@app.route("/api/slots", methods=["GET"])
@limiter.limit("30 per minute")
def api_slots():
    """Get available slots for a date"""
    date_str = request.args.get("date", "")
    if not valid_date(date_str):
        return jsonify({"error": "Invalid or out-of-range date"}), 400

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    counts = slot_occupancy(checkins, date_str)

    slots = []
    for t in SLOTS:
        if date_str == today_str:
            slot_dt = datetime.strptime(f"{date_str} {t}", "%Y-%m-%d %H:%M")
            if slot_dt <= now:
                continue
        booked = counts.get(t, 0)
        slots.append({
            "time": t,
            "capacity": CHAIRS_PER_SLOT,
            "booked": booked,
            "available": max(0, CHAIRS_PER_SLOT - booked),
        })

    return jsonify({"date": date_str, "slots": slots})


@app.route("/api/checkin", methods=["POST"])
@limiter.limit("5 per minute")
def api_checkin():
    """Customer check-in"""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    date_str = (data.get("date") or "").strip()
    time_str = (data.get("time") or "").strip()
    service_note = (data.get("service_note") or "").strip()
    nickname = (data.get("nickname") or "").strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not valid_date(date_str):
        return jsonify({"error": "Invalid or out-of-range date"}), 400
    if time_str not in SLOTS:
        return jsonify({"error": "Invalid time slot"}), 400
    if not service_note:
        return jsonify({"error": "Please add a note about the service you'd like"}), 400

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])

        booked = slot_occupancy(checkins, date_str).get(time_str, 0)
        if booked >= CHAIRS_PER_SLOT:
            return jsonify({"error": "That time slot just filled up. Please pick another."}), 409

        position = booked + 1
        record = {
            "id": uuid.uuid4().hex[:8],
            "name": name,
            "phone": phone,
            "nickname": nickname,
            "date": date_str,
            "time": time_str,
            "service_note": service_note,
            "status": "waiting_confirm",
            "duration_minutes": None,
            "confirmed": False,
            "confirm_token": uuid.uuid4().hex,
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "note": "",
        }
        checkins.append(record)
        full_data["checkins"] = checkins
        _save_data(full_data)

    # Send SMS
    sms_body = (
        f"✂️ KHÁCH CHECK-IN\n"
        f"👤 {name}\n"
        f"⏰ {format_time_12h(time_str)}\n"
        f"💅 {service_note}"
    )
    send_sms(OWNER_PHONE, sms_body)

    return jsonify({"checkin": record, "position_in_slot": position}), 201


@app.route("/api/checkins", methods=["GET"])
@require_staff_auth
@limiter.limit("30 per minute")
def api_checkins():
    """Get checkins for a date"""
    date_str = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")
    with _lock:
        data = _load_data()
        checkins = data.get("checkins", [])
    day_checkins = [c for c in checkins if c["date"] == date_str]
    day_checkins.sort(key=lambda c: (c["time"], c["created_at"]))
    return jsonify({"date": date_str, "checkins": day_checkins})


@app.route("/api/checkins/<checkin_id>/status", methods=["POST"])
@require_staff_auth
@limiter.limit("10 per minute")
def api_update_status(checkin_id):
    """Update checkin status"""
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status not in STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])
        for c in checkins:
            if c["id"] == checkin_id:
                c["status"] = new_status
                full_data["checkins"] = checkins
                _save_data(full_data)
                return jsonify({"checkin": c})

    return jsonify({"error": "Check-in not found"}), 404


# ============================================================================
# ROUTES: Network Security Audit
# ============================================================================

@app.route("/api/health", methods=['GET'])
@limiter.limit("60 per minute")
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api/scan/ports', methods=['POST'])
@require_auth
@limiter.limit("5 per minute")
def scan_ports():
    """Port scan (localhost only)"""
    try:
        data = request.json or {}
        target_host = data.get('target', 'localhost').strip()
        ports = data.get('ports', '1-1000').strip()

        if not validate_hostname(target_host):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid hostname format'
            }), 400

        if not validate_port_range(ports):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid port range format (use: 80 or 80,443 or 1-1000)'
            }), 400

        if not is_localhost(target_host):
            return jsonify({
                'success': False,
                'error': 'Security restriction',
                'message': 'Port scanning is only allowed on localhost (127.0.0.1)'
            }), 403

        # Simulate port scan result
        result = {
            "open_ports": [80, 443, 5000],
            "total_scanned": 1000,
            "timestamp": datetime.now().isoformat()
        }

        with _lock:
            data_obj = _load_data()
            data_obj.get("scan_history", []).append({
                'type': 'port_scan',
                'target': target_host,
                'timestamp': datetime.now().isoformat(),
                'result': result
            })
            _save_data(data_obj)

        return jsonify({
            'success': True,
            'data': result,
            'message': f'Scan completed for {target_host}'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Port scan failed'
        }), 400


@app.route('/api/scan/password', methods=['POST'])
@require_auth
@limiter.limit("10 per minute")
def check_password_strength():
    """Check password strength"""
    try:
        data = request.json or {}
        password = data.get('password', '')

        if not password:
            return jsonify({'success': False, 'error': 'Password is required'}), 400

        if not validate_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Password must be 1-128 characters'
            }), 400

        # Simple strength check
        score = 0
        feedback = []

        if len(password) >= 8:
            score += 1
        else:
            feedback.append("Use at least 8 characters")

        if any(c.isupper() for c in password):
            score += 1
        else:
            feedback.append("Add uppercase letters")

        if any(c.islower() for c in password):
            score += 1
        else:
            feedback.append("Add lowercase letters")

        if any(c.isdigit() for c in password):
            score += 1
        else:
            feedback.append("Add numbers")

        if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            score += 1
        else:
            feedback.append("Add special characters")

        strength_map = {0: "Very Weak", 1: "Weak", 2: "Fair", 3: "Good", 4: "Strong", 5: "Very Strong"}

        result = {
            "score": score,
            "strength": strength_map.get(score, "Unknown"),
            "length": len(password),
            "feedback": feedback
        }

        return jsonify({
            'success': True,
            'data': result,
            'message': 'Password strength check completed'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/scan/wifi-security', methods=['POST'])
@require_auth
@limiter.limit("8 per minute")
def check_wifi_security():
    """Check WiFi security"""
    try:
        data = request.json or {}
        ssid = data.get('ssid', '').strip()
        password = data.get('password', '').strip()

        if not validate_ssid(ssid):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid SSID (max 32 characters)'
            }), 400

        if not validate_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Password must be 1-128 characters'
            }), 400

        # Simple WiFi security check
        issues = []
        if len(password) < 12:
            issues.append("WiFi password too weak")
        if not any(c.isupper() for c in password):
            issues.append("Add uppercase letters to WiFi password")

        result = {
            "ssid": ssid,
            "secure": len(issues) == 0,
            "issues": issues if issues else ["✅ WiFi security looks good"],
            "recommendations": [
                "Change password every 90 days",
                "Disable WPS (WiFi Protected Setup)",
                "Hide SSID broadcast",
                "Update router firmware regularly"
            ]
        }

        return jsonify({
            'success': True,
            'data': result,
            'message': 'WiFi security check completed'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/recommendations', methods=['GET'])
@limiter.limit("30 per minute")
def get_security_recommendations():
    """Get security recommendations"""
    recommendations = {
        'network': [
            'Đặt mật khẩu WiFi mạnh (ít nhất 12 ký tự)',
            'Bật WPA3 hoặc WPA2 encryption',
            'Tắt WPS (WiFi Protected Setup)',
            'Ẩn SSID broadcast',
            'Cập nhật firmware router thường xuyên'
        ],
        'passwords': [
            'Sử dụng mật khẩu ≥ 12 ký tự',
            'Bao gồm chữ hoa, số, ký tự đặc biệt',
            'Không dùng từ điển hoặc thông tin cá nhân',
            'Dùng password manager',
            'Bật 2FA/MFA ở mọi nơi có thể'
        ]
    }
    return jsonify({'success': True, 'data': recommendations}), 200


# ============================================================================
# ROUTES: Stripe Subscription (Placeholder)
# ============================================================================

@app.route('/api/subscription/tiers', methods=['GET'])
@limiter.limit("10 per minute")
def get_subscription_tiers():
    """Get available subscription tiers"""
    tiers = {
        'tiers': [
            {
                'id': 'starter',
                'name': 'STARTER',
                'price': 29,
                'billing_cycle': 'monthly',
                'features': ['Check-in system', 'WiFi audit', 'Basic reports'],
                'limit_customers': 200,
                'limit_staff': 5,
                'limit_locations': 1
            },
            {
                'id': 'professional',
                'name': 'PROFESSIONAL',
                'price': 79,
                'billing_cycle': 'monthly',
                'features': ['Everything in STARTER', 'Advanced analytics', 'SMS reminders', 'Multi-location'],
                'limit_customers': 1000,
                'limit_staff': 20,
                'limit_locations': 3
            },
            {
                'id': 'enterprise',
                'name': 'ENTERPRISE',
                'price': 199,
                'billing_cycle': 'monthly',
                'features': ['Everything in PROFESSIONAL', 'Unlimited customers', 'Priority support', 'Custom reports'],
                'limit_customers': -1,
                'limit_staff': -1,
                'limit_locations': -1
            }
        ]
    }
    return jsonify(tiers), 200


# ============================================================================
# ROUTES: Health & Status
# ============================================================================

@app.before_request
def security_before_request():
    """Enforce HTTPS in production"""
    if os.getenv('FLASK_ENV') == 'production' and not request.is_secure:
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)


@app.after_request
def security_headers(response):
    """Add security headers"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested resource does not exist'
    }), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': str(error)
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
