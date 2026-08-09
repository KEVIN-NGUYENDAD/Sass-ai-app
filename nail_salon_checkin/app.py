"""Nail Salon Check-In web app.

Customers check themselves in for a 30-minute service slot and leave a note
describing the service they want. Staff can see the day's queue on /staff.

When a customer checks in, a text is sent to the owner with a link to confirm
how long the service will actually take (30 or 60 minutes). Once the owner
confirms, the customer gets a text confirming their appointment.
"""
import json
import logging
import os
import threading
import uuid
from datetime import datetime, timedelta

from flask import Flask, jsonify, render_template, request, session, redirect

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
logger = logging.getLogger("nail_salon_checkin")

# Configured with CHAIRS_PER_SLOT = 1, SMS confirmation flow, staff auth, and blue theme

# --- Configuration -----------------------------------------------------
OPEN_HOUR = 9          # salon opens at 9:30 AM
OPEN_MINUTE = 30
CLOSE_HOUR = 19        # salon closes at 7:00 PM (last slot starts 6:30 PM)
CLOSE_MINUTE = 0
SLOT_MINUTES = 30      # each check-in slot is 30 minutes
CHAIRS_PER_SLOT = 1    # how many customers can be seated in the same slot
MAX_DAYS_AHEAD = 7      # customers can check in for today .. +6 days
DURATION_OPTIONS = (30, 45, 60)  # minutes the owner can confirm a service will take

OWNER_PHONE = os.environ.get("OWNER_PHONE", "+16237604999")
BASE_URL_OVERRIDE = os.environ.get("BASE_URL")  # e.g. https://nail-salon-checkin.onrender.com
STAFF_PASSWORD = os.environ.get("STAFF_PASSWORD", "250618")

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
# Alternative to TWILIO_AUTH_TOKEN: a scoped API Key (SID starts with "SK"),
# created under Account > API keys & tokens in the Twilio console. Still
# requires TWILIO_ACCOUNT_SID to be set alongside it.
TWILIO_API_KEY_SID = os.environ.get("TWILIO_API_KEY_SID")
TWILIO_API_KEY_SECRET = os.environ.get("TWILIO_API_KEY_SECRET")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "checkins.json")

STATUSES = ("waiting_confirm", "confirmed", "in_service", "complete", "cancelled")

_lock = threading.Lock()


# --- SMS -------------------------------------------------------------------
def _twilio_credentials_configured():
    has_api_key_auth = TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET and TWILIO_ACCOUNT_SID
    has_auth_token = TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
    return bool(TWILIO_FROM_NUMBER and (has_api_key_auth or has_auth_token))


def _twilio_client():
    from twilio.rest import Client

    if TWILIO_API_KEY_SID and TWILIO_API_KEY_SECRET and TWILIO_ACCOUNT_SID:
        return Client(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def send_sms(to_number, body):
    """Send a text via Twilio if configured; otherwise just log it.

    This lets the check-in / confirm flow work end-to-end in development
    (and before the owner has set up a Twilio account) without crashing.
    """
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
        logger.warning("[SMS failed - continuing anyway] to=%s error=%s", to_number, str(e))
        # Don't crash; just log and continue. This allows the app to work even if Twilio is misconfigured.


def get_base_url():
    if BASE_URL_OVERRIDE:
        return BASE_URL_OVERRIDE.rstrip("/")
    root = request.url_root.rstrip("/")
    if root.startswith("http://") and "localhost" not in root and "127.0.0.1" not in root:
        root = "https://" + root[len("http://"):]
    return root


def format_time_12h(t):
    dt = datetime.strptime(t, "%H:%M")
    return dt.strftime("%I:%M %p").lstrip("0")


# --- Storage -------------------------------------------------------------
def _load():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            if isinstance(data, list):
                return data
            if isinstance(data, dict) and "checkins" in data:
                return data["checkins"]
            return []
        except json.JSONDecodeError:
            return []


def _save(checkins):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(checkins, f, indent=2)


def _load_data():
    """Load complete data structure with checkins, reports, sms_log, etc."""
    if not os.path.exists(DATA_FILE):
        return {"checkins": [], "reports": {}, "sms_log": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            if isinstance(data, list):
                return {"checkins": data, "reports": {}, "sms_log": []}
            if isinstance(data, dict):
                return data
            return {"checkins": [], "reports": {}, "sms_log": []}
        except json.JSONDecodeError:
            return {"checkins": [], "reports": {}, "sms_log": []}


def _save_data(data):
    """Save complete data structure."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def generate_slots():
    """Return the list of slot start times for a day, e.g. ['09:00', '09:30', ...]."""
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
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return False
    today = datetime.now().date()
    return today <= d <= today + timedelta(days=MAX_DAYS_AHEAD - 1)


def slot_occupancy(checkins, date_str):
    """Map each slot time -> number of chairs it has booked.

    A confirmed 60-minute service occupies two consecutive 30-minute slots.
    Until the owner confirms a duration, a booking is assumed to take one
    slot (the minimum).
    """
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


# --- Routes: pages --------------------------------------------------------
@app.route("/")
def checkin_page():
    return render_template(
        "checkin.html",
        open_hour=OPEN_HOUR,
        close_hour=CLOSE_HOUR,
        slot_minutes=SLOT_MINUTES,
        max_days_ahead=MAX_DAYS_AHEAD,
    )


@app.route("/staff-login")
def staff_login_page():
    return render_template("staff_login.html")


@app.route("/api/staff-login", methods=["POST"])
def api_staff_login():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "").strip()
    if password == STAFF_PASSWORD:
        session["staff_authenticated"] = True
        return jsonify({"success": True}), 200
    return jsonify({"error": "Incorrect password"}), 401


@app.route("/staff")
def staff_page():
    if not session.get("staff_authenticated"):
        return redirect("/staff-login")
    return render_template("staff.html")


@app.route("/customer-management")
def customer_management_page():
    if not session.get("staff_authenticated"):
        return redirect("/staff-login")
    return render_template("customer_management.html")


# --- Routes: API -----------------------------------------------------------
@app.route("/api/slots")
def api_slots():
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
        # don't allow booking a slot that has already started, for today
        if date_str == today_str:
            slot_dt = datetime.strptime(f"{date_str} {t}", "%Y-%m-%d %H:%M")
            if slot_dt <= now:
                continue
        booked = counts.get(t, 0)
        slots.append(
            {
                "time": t,
                "capacity": CHAIRS_PER_SLOT,
                "booked": booked,
                "available": max(0, CHAIRS_PER_SLOT - booked),
            }
        )

    return jsonify({"date": date_str, "slots": slots})


@app.route("/api/checkin", methods=["POST"])
def api_checkin():
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

    # Send notification SMS to owner
    sms_body = (
        f"✂️ KHÁCH CHECK-IN\n"
        f"👤 {name}\n"
        f"⏰ {format_time_12h(time_str)}\n"
        f"💅 {service_note}"
    )
    logger.info(f"Sending check-in SMS to {OWNER_PHONE}: {sms_body}")
    send_sms(OWNER_PHONE, sms_body)

    return jsonify({"checkin": record, "position_in_slot": position}), 201


@app.route("/api/checkins")
def api_checkins():
    date_str = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")
    with _lock:
        data = _load_data()
        checkins = data.get("checkins", [])
    day_checkins = [c for c in checkins if c["date"] == date_str]
    day_checkins.sort(key=lambda c: (c["time"], c["created_at"]))
    return jsonify({"date": date_str, "checkins": day_checkins})


@app.route("/api/checkins/<checkin_id>/status", methods=["POST"])
def api_update_status(checkin_id):
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


@app.route("/api/checkins/<checkin_id>/confirm-duration", methods=["POST"])
def api_confirm_duration(checkin_id):
    data = request.get_json(silent=True) or {}
    try:
        duration = int(data.get("duration_minutes"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid duration"}), 400
    if duration not in DURATION_OPTIONS:
        return jsonify({"error": "Invalid duration"}), 400

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])
        checkin = next((c for c in checkins if c["id"] == checkin_id), None)
        if not checkin:
            return jsonify({"error": "Check-in not found"}), 404

        checkin["duration_minutes"] = duration
        checkin["confirmed"] = True
        checkin["status"] = "confirmed"
        full_data["checkins"] = checkins
        _save_data(full_data)

    send_sms(
        checkin.get("phone"),
        f"Hi {checkin['name']}! Your nail salon appointment is confirmed for "
        f"{checkin['date']} at {format_time_12h(checkin['time'])} ({duration} min). See you soon!",
    )

    return jsonify({"checkin": checkin})


# --- Owner confirmation (reached via the link texted to the owner) --------
@app.route("/owner/confirm/<checkin_id>")
def owner_confirm_page(checkin_id):
    token = request.args.get("token", "")
    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])
    checkin = next((c for c in checkins if c["id"] == checkin_id), None)
    if not checkin or not token or token != checkin.get("confirm_token"):
        return render_template("owner_confirm.html", error="This confirmation link is invalid or expired."), 404
    return render_template(
        "owner_confirm.html",
        checkin=checkin,
        token=token,
        duration_options=DURATION_OPTIONS,
        time_12h=format_time_12h(checkin["time"]),
    )


@app.route("/api/owner/confirm/<checkin_id>", methods=["POST"])
def api_owner_confirm(checkin_id):
    data = request.get_json(silent=True) or {}
    token = data.get("token", "")
    try:
        duration = int(data.get("duration_minutes"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid duration"}), 400
    if duration not in DURATION_OPTIONS:
        return jsonify({"error": "Invalid duration"}), 400

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])
        checkin = next((c for c in checkins if c["id"] == checkin_id), None)
        if not checkin or not token or token != checkin.get("confirm_token"):
            return jsonify({"error": "Invalid confirmation link"}), 404

        checkin["duration_minutes"] = duration
        checkin["confirmed"] = True
        checkin["status"] = "confirmed"
        full_data["checkins"] = checkins
        _save_data(full_data)

    send_sms(
        checkin.get("phone"),
        f"Hi {checkin['name']}! Your nail salon appointment is confirmed for "
        f"{checkin['date']} at {format_time_12h(checkin['time'])} ({duration} min). See you soon!",
    )

    return jsonify({"checkin": checkin})


@app.route("/api/checkin-by-staff", methods=["POST"])
def api_checkin_by_staff():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    date_str = (data.get("date") or "").strip()
    time_str = (data.get("time") or "").strip()
    service_note = (data.get("service_note") or "").strip()
    duration_minutes = data.get("duration_minutes")

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not valid_date(date_str):
        return jsonify({"error": "Invalid or out-of-range date"}), 400
    if time_str not in SLOTS:
        return jsonify({"error": "Invalid time slot"}), 400
    if not service_note:
        return jsonify({"error": "Service note is required"}), 400
    try:
        duration_minutes = int(duration_minutes)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid duration"}), 400
    if duration_minutes not in DURATION_OPTIONS:
        return jsonify({"error": "Duration must be 30 or 60 minutes"}), 400

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])
        booked = slot_occupancy(checkins, date_str).get(time_str, 0)
        if booked >= CHAIRS_PER_SLOT:
            return jsonify({"error": "That time slot is full"}), 409

        record = {
            "id": uuid.uuid4().hex[:8],
            "name": name,
            "phone": phone,
            "date": date_str,
            "time": time_str,
            "service_note": service_note,
            "status": "confirmed",
            "duration_minutes": duration_minutes,
            "confirmed": True,
            "confirm_token": uuid.uuid4().hex,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        checkins.append(record)
        full_data["checkins"] = checkins
        _save_data(full_data)

    send_sms(
        phone,
        f"Hi {name}! Your nail salon appointment is confirmed for "
        f"{date_str} at {format_time_12h(time_str)} ({duration_minutes} min). See you soon!",
    )

    return jsonify({"checkin": record}), 201


@app.route("/daily-report")
def daily_report_page():
    if not session.get("staff_authenticated"):
        return redirect("/staff-login")
    return render_template("daily_report.html")


@app.route("/api/daily-report", methods=["GET"])
def get_daily_report():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    date = request.args.get("date", "")
    if not date:
        return jsonify({"money_received": 0, "tips": 0})

    try:
        with _lock:
            data = _load_data()
    except FileNotFoundError:
        return jsonify({"money_received": 0, "tips": 0})

    reports = data.get("reports", {})
    report = reports.get(date, {})
    return jsonify({
        "money_received": report.get("money_received", 0),
        "tips": report.get("tips", 0)
    })


@app.route("/api/daily-report", methods=["POST"])
def save_daily_report():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    req = request.get_json()
    date = req.get("date", "")
    money = float(req.get("money_received", 0))
    tips = float(req.get("tips", 0))

    if not date:
        return jsonify({"error": "Missing date"}), 400

    try:
        with _lock:
            data = _load_data()
            if "reports" not in data:
                data["reports"] = {}
            data["reports"][date] = {
                "money_received": money,
                "tips": tips,
                "updated_at": datetime.now().isoformat()
            }
            _save_data(data)
    except Exception as e:
        logger.exception("Error saving report")
        return jsonify({"error": "Failed to save report"}), 500

    return jsonify({"message": "Report saved successfully"})


@app.route("/customer-history")
def customer_history_page():
    if not session.get("staff_authenticated"):
        return redirect("/staff-login")
    return render_template("customer_history.html")


@app.route("/api/customer-history")
def get_customer_history():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with _lock:
            data = _load_data()
    except FileNotFoundError:
        return jsonify({"customers": []})

    checkins = data.get("checkins", [])

    customer_map = {}
    for c in checkins:
        phone = c.get("phone", "")
        name = c.get("name", "Unknown")

        if phone not in customer_map:
            customer_map[phone] = {
                "name": name,
                "phone": phone,
                "total_visits": 0,
                "total_duration": 0,
                "last_visit_date": None,
                "services": []
            }

        customer_map[phone]["total_visits"] += 1
        duration = c.get("duration_minutes", 0)
        customer_map[phone]["total_duration"] += duration

        visit_date = c.get("date", "")
        if visit_date and (not customer_map[phone]["last_visit_date"] or visit_date > customer_map[phone]["last_visit_date"]):
            customer_map[phone]["last_visit_date"] = visit_date

        service = c.get("service_note", "")
        if service and service not in customer_map[phone]["services"]:
            customer_map[phone]["services"].append(service)

    customers = list(customer_map.values())
    customers.sort(key=lambda x: x.get("last_visit_date", "") or "", reverse=True)

    return jsonify({"customers": customers})


@app.route("/api/send-checkin-link", methods=["POST"])
def send_checkin_link():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    req = request.get_json()
    phone = req.get("phone", "").strip()

    if not phone:
        return jsonify({"error": "Phone number required"}), 400

    checkin_link = get_base_url() + "/"
    message = f"Hi! Quick reminder to book your next appointment at Nail Salon. Click here to check in: {checkin_link}"

    send_sms(phone, message)
    logger.info("Sent check-in link SMS to %s", phone)

    return jsonify({"message": "SMS sent successfully!"})


@app.route("/api/send-bulk-sms", methods=["POST"])
def send_bulk_sms():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    req = request.get_json()
    phones = req.get("phones", [])

    if not phones:
        return jsonify({"error": "No phones provided"}), 400

    checkin_link = get_base_url() + "/"
    message = f"Hi! It's been a while - time for your next appointment! Book here: {checkin_link}"

    sent_count = 0
    for phone in phones:
        if phone:
            send_sms(phone, message)
            sent_count += 1

    if sent_count > 0:
        with _lock:
            try:
                data = _load_data()
                if "sms_log" not in data:
                    data["sms_log"] = []
                data["sms_log"].append({
                    "count": sent_count,
                    "timestamp": datetime.now().isoformat(timespec="seconds"),
                    "reason": "Auto-send to 2+ week customers"
                })
                _save_data(data)
            except Exception as e:
                logger.exception("Failed to log SMS event")

    logger.info("Sent bulk SMS to %d customers", sent_count)
    return jsonify({"message": f"SMS sent to {sent_count} customers", "count": sent_count})


@app.route("/api/weekly-report")
def get_weekly_report():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with _lock:
            data = _load_data()
        checkins = data.get("checkins", [])
        reports = data.get("reports", {})
    except Exception:
        return jsonify({"days": []})

    now = datetime.now()
    today = now.date()
    days_data = []

    for i in range(7):
        day = today - timedelta(days=6-i)
        day_str = day.strftime("%Y-%m-%d")

        day_checkins = [c for c in checkins if c.get("date") == day_str and c.get("status") == "complete"]
        service_count = len(day_checkins)

        report = reports.get(day_str, {})
        money = float(report.get("money_received", 0))
        tips = float(report.get("tips", 0))

        days_data.append({
            "date": day_str,
            "services": service_count,
            "money": money,
            "tips": tips,
            "total": money + tips
        })

    return jsonify({"days": days_data})


@app.route("/api/monthly-report")
def get_monthly_report():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with _lock:
            data = _load_data()
        checkins = data.get("checkins", [])
        reports = data.get("reports", {})
    except Exception:
        return jsonify({"weeks": []})

    now = datetime.now()
    today = now.date()
    year = today.year
    month = today.month

    first_day = datetime(year, month, 1).date()
    last_day = (datetime(year, month + 1, 1) - timedelta(days=1)).date() if month < 12 else datetime(year + 1, 1, 1).date() - timedelta(days=1)

    weeks_data = []
    current_date = first_day

    week_num = 1
    while current_date <= last_day:
        week_end = current_date + timedelta(days=6)
        if week_end > last_day:
            week_end = last_day

        week_checkins = []
        week_money = 0.0
        week_tips = 0.0

        for date_offset in range((week_end - current_date).days + 1):
            check_date = current_date + timedelta(days=date_offset)
            check_date_str = check_date.strftime("%Y-%m-%d")

            day_checkins = [c for c in checkins if c.get("date") == check_date_str and c.get("status") == "complete"]
            week_checkins.extend(day_checkins)

            report = reports.get(check_date_str, {})
            week_money += float(report.get("money_received", 0))
            week_tips += float(report.get("tips", 0))

        weeks_data.append({
            "week": week_num,
            "services": len(week_checkins),
            "money": week_money,
            "tips": week_tips,
            "total": week_money + week_tips
        })

        current_date = week_end + timedelta(days=1)
        week_num += 1

    return jsonify({"weeks": weeks_data})


@app.route("/api/sms-log")
def get_sms_log():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with _lock:
            data = _load_data()
        sms_log = data.get("sms_log", [])
    except Exception:
        return jsonify({"logs": []})

    return jsonify({"logs": sms_log})


@app.route("/api/customers")
def get_customers():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    with _lock:
        data = _load_data()
        checkins = data.get("checkins", [])

    customer_map = {}
    for c in checkins:
        if c.get("status") == "cancelled":
            continue
        phone = c.get("phone") or "unknown"
        if phone not in customer_map:
            customer_map[phone] = {
                "phone": phone,
                "name": c.get("name", ""),
                "nickname": c.get("nickname", ""),
                "note": c.get("note", ""),
                "visit_count": 0,
                "last_visit": "",
                "total_spent": 0,
            }
        customer_map[phone]["visit_count"] += 1
        if c.get("status") == "complete":
            current_date = c.get("date", "")
            if current_date > customer_map[phone]["last_visit"]:
                customer_map[phone]["last_visit"] = current_date

    customers = list(customer_map.values())
    customers.sort(key=lambda x: x.get("last_visit", "") or "", reverse=True)
    return jsonify({"customers": customers})


@app.route("/api/customers/<phone>/update", methods=["POST"])
def update_customer(phone):
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    nickname = (data.get("nickname") or "").strip()
    note = (data.get("note") or "").strip()

    with _lock:
        full_data = _load_data()
        checkins = full_data.get("checkins", [])

        for c in checkins:
            if c.get("phone") == phone:
                c["nickname"] = nickname
                c["note"] = note

        full_data["checkins"] = checkins
        _save_data(full_data)

    return jsonify({"success": True})


def _generate_csv_report(checkins, reports, date_type="day", date_str=None):
    """Generate CSV report as string."""
    lines = []

    if date_type == "day":
        day_checkins = [c for c in checkins if c.get("date") == date_str and c.get("status") == "complete"]
        lines.append("BÁO CÁO HÀNG NGÀY - Daily Report")
        lines.append(f"Date,{date_str}")
        lines.append("")
        lines.append("Customer,Phone,Nickname,Service,Status")
        for c in day_checkins:
            lines.append(f"{c.get('name', '')},{c.get('phone', '')},{c.get('nickname', '')},{c.get('service_note', '')},Done")
        report = reports.get(date_str, {})
        money = float(report.get("money_received", 0))
        tips = float(report.get("tips", 0))
        lines.append("")
        lines.append(f"Total Services,{len(day_checkins)}")
        lines.append(f"Total Money,{money}")
        lines.append(f"Total Tips,{tips}")
        lines.append(f"Total,{money + tips}")

    elif date_type == "week":
        now = datetime.now()
        today = now.date()
        lines.append("BÁO CÁO TUẦN - Weekly Report")
        lines.append(f"Week Ending,{today.strftime('%Y-%m-%d')}")
        lines.append("")
        lines.append("Date,Services,Money,Tips,Total")
        week_total_money = 0
        week_total_tips = 0
        for i in range(7):
            day = today - timedelta(days=6-i)
            day_str = day.strftime("%Y-%m-%d")
            day_checkins = [c for c in checkins if c.get("date") == day_str and c.get("status") == "complete"]
            report = reports.get(day_str, {})
            money = float(report.get("money_received", 0))
            tips = float(report.get("tips", 0))
            week_total_money += money
            week_total_tips += tips
            lines.append(f"{day_str},{len(day_checkins)},{money},{tips},{money + tips}")
        lines.append("")
        lines.append(f"Weekly Total,{week_total_money + week_total_tips}")

    elif date_type == "month":
        now = datetime.now()
        lines.append("BÁO CÁO THÁNG - Monthly Report")
        lines.append(f"Month,{now.strftime('%B %Y')}")
        lines.append("")
        lines.append("Week,Services,Money,Tips,Total")
        month_total_money = 0
        month_total_tips = 0

        current_date = datetime(now.year, now.month, 1)
        week_num = 1
        while current_date.month == now.month:
            week_end = min(current_date + timedelta(days=6), current_date.replace(day=1) + timedelta(days=32) - timedelta(days=1))
            week_checkins = [c for c in checkins if current_date.date() <= datetime.strptime(c.get("date", ""), "%Y-%m-%d").date() <= week_end.date() and c.get("status") == "complete"]
            week_money = 0
            week_tips = 0
            for check_date_str in set(c.get("date") for c in week_checkins):
                report = reports.get(check_date_str, {})
                week_money += float(report.get("money_received", 0))
                week_tips += float(report.get("tips", 0))
            month_total_money += week_money
            month_total_tips += week_tips
            lines.append(f"Week {week_num},{len(week_checkins)},{week_money},{week_tips},{week_money + week_tips}")
            current_date = week_end + timedelta(days=1)
            week_num += 1

        lines.append("")
        lines.append(f"Monthly Total,{month_total_money + month_total_tips}")

    return "\n".join(lines)


@app.route("/api/export/daily-summary")
def export_daily_summary():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    date_str = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")

    with _lock:
        data = _load_data()
        checkins = data.get("checkins", [])
        reports = data.get("reports", {})

    csv_content = _generate_csv_report(checkins, reports, "day", date_str)

    return csv_content, 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": f'attachment; filename="daily-report-{date_str}.csv"'
    }


@app.route("/api/export/weekly-summary")
def export_weekly_summary():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    with _lock:
        data = _load_data()
        checkins = data.get("checkins", [])
        reports = data.get("reports", {})

    csv_content = _generate_csv_report(checkins, reports, "week")

    today = datetime.now().strftime("%Y-%m-%d")
    return csv_content, 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": f'attachment; filename="weekly-report-{today}.csv"'
    }


@app.route("/api/export/monthly-summary")
def export_monthly_summary():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    with _lock:
        data = _load_data()
        checkins = data.get("checkins", [])
        reports = data.get("reports", {})

    csv_content = _generate_csv_report(checkins, reports, "month")

    today = datetime.now().strftime("%Y-%m")
    return csv_content, 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": f'attachment; filename="monthly-report-{today}.csv"'
    }


@app.route("/api/send-summary-sms", methods=["POST"])
def send_summary_sms():
    if not session.get("staff_authenticated"):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    report_type = data.get("type", "day")  # day, week, month

    date_str = data.get("date", datetime.now().strftime("%Y-%m-%d"))

    base_url = get_base_url()
    if report_type == "day":
        link = f"{base_url}/api/export/daily-summary?date={date_str}"
        text = f"Báo cáo hàng ngày {date_str}: {link}"
    elif report_type == "week":
        link = f"{base_url}/api/export/weekly-summary"
        text = f"Báo cáo tuần: {link}"
    else:
        link = f"{base_url}/api/export/monthly-summary"
        text = f"Báo cáo tháng: {link}"

    send_sms(OWNER_PHONE, text)
    return jsonify({"success": True, "message": "Report sent via SMS"})


@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "Nail Salon Check-In"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=False)
