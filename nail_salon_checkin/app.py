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

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
logger = logging.getLogger("nail_salon_checkin")

# Configured with CHAIRS_PER_SLOT = 1 and SMS confirmation flow

# --- Configuration -----------------------------------------------------
OPEN_HOUR = 9          # salon opens at 9:30 AM
OPEN_MINUTE = 30
CLOSE_HOUR = 19        # salon closes at 7:00 PM (last slot starts 6:30 PM)
CLOSE_MINUTE = 0
SLOT_MINUTES = 30      # each check-in slot is 30 minutes
CHAIRS_PER_SLOT = 1    # how many customers can be seated in the same slot
MAX_DAYS_AHEAD = 7      # customers can check in for today .. +6 days
DURATION_OPTIONS = (30, 60)  # minutes the owner can confirm a service will take

OWNER_PHONE = os.environ.get("OWNER_PHONE", "+16237604999")
BASE_URL_OVERRIDE = os.environ.get("BASE_URL")  # e.g. https://nail-salon-checkin.onrender.com

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

STATUSES = ("waiting", "in_service", "done", "cancelled")

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
    except Exception:
        logger.exception("Failed to send SMS to %s", to_number)


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
            return json.load(f)
        except json.JSONDecodeError:
            return []


def _save(checkins):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(checkins, f, indent=2)


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


@app.route("/staff")
def staff_page():
    return render_template("staff.html")


# --- Routes: API -----------------------------------------------------------
@app.route("/api/slots")
def api_slots():
    date_str = request.args.get("date", "")
    if not valid_date(date_str):
        return jsonify({"error": "Invalid or out-of-range date"}), 400

    with _lock:
        checkins = _load()

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

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not valid_date(date_str):
        return jsonify({"error": "Invalid or out-of-range date"}), 400
    if time_str not in SLOTS:
        return jsonify({"error": "Invalid time slot"}), 400
    if not service_note:
        return jsonify({"error": "Please add a note about the service you'd like"}), 400

    with _lock:
        checkins = _load()

        booked = slot_occupancy(checkins, date_str).get(time_str, 0)
        if booked >= CHAIRS_PER_SLOT:
            return jsonify({"error": "That time slot just filled up. Please pick another."}), 409

        position = booked + 1
        record = {
            "id": uuid.uuid4().hex[:8],
            "name": name,
            "phone": phone,
            "date": date_str,
            "time": time_str,
            "service_note": service_note,
            "status": "waiting",
            "duration_minutes": None,
            "confirmed": False,
            "confirm_token": uuid.uuid4().hex,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        checkins.append(record)
        _save(checkins)

    confirm_url = f"{get_base_url()}/owner/confirm/{record['id']}?token={record['confirm_token']}"
    send_sms(
        OWNER_PHONE,
        "New nail salon check-in!\n"
        f"Name: {name}\n"
        f"Phone: {phone or 'N/A'}\n"
        f"Requested: {date_str} at {format_time_12h(time_str)}\n"
        f"Service: {service_note}\n\n"
        f"Confirm how long this will take: {confirm_url}",
    )

    return jsonify({"checkin": record, "position_in_slot": position}), 201


@app.route("/api/checkins")
def api_checkins():
    date_str = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")
    with _lock:
        checkins = _load()
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
        checkins = _load()
        for c in checkins:
            if c["id"] == checkin_id:
                c["status"] = new_status
                _save(checkins)
                return jsonify({"checkin": c})

    return jsonify({"error": "Check-in not found"}), 404


# --- Owner confirmation (reached via the link texted to the owner) --------
@app.route("/owner/confirm/<checkin_id>")
def owner_confirm_page(checkin_id):
    token = request.args.get("token", "")
    with _lock:
        checkins = _load()
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
        checkins = _load()
        checkin = next((c for c in checkins if c["id"] == checkin_id), None)
        if not checkin or not token or token != checkin.get("confirm_token"):
            return jsonify({"error": "Invalid confirmation link"}), 404

        checkin["duration_minutes"] = duration
        checkin["confirmed"] = True
        _save(checkins)

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
        checkins = _load()
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
            "status": "waiting",
            "duration_minutes": duration_minutes,
            "confirmed": True,
            "confirm_token": uuid.uuid4().hex,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        checkins.append(record)
        _save(checkins)

    send_sms(
        phone,
        f"Hi {name}! Your nail salon appointment is confirmed for "
        f"{date_str} at {format_time_12h(time_str)} ({duration_minutes} min). See you soon!",
    )

    return jsonify({"checkin": record}), 201


@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "Nail Salon Check-In"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=False)
