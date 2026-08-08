"""Nail Salon Check-In web app.

Customers check themselves in for a 30-minute service slot and leave a note
describing the service they want. Staff can see the day's queue on /staff.
"""
import json
import os
import threading
import uuid
from datetime import datetime, timedelta

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# --- Configuration -----------------------------------------------------
OPEN_HOUR = 9          # salon opens at 9:30 AM
OPEN_MINUTE = 30
CLOSE_HOUR = 19        # salon closes at 7:00 PM (last slot starts 6:30 PM)
CLOSE_MINUTE = 0
SLOT_MINUTES = 30      # each check-in slot is 30 minutes
CHAIRS_PER_SLOT = 3    # how many customers can be seated in the same slot
MAX_DAYS_AHEAD = 7      # customers can check in for today .. +6 days

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_FILE = os.path.join(DATA_DIR, "checkins.json")

STATUSES = ("waiting", "in_service", "done", "cancelled")

_lock = threading.Lock()


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

    counts = {}
    for c in checkins:
        if c["date"] == date_str and c["status"] != "cancelled":
            counts[c["time"]] = counts.get(c["time"], 0) + 1

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

        booked = sum(
            1
            for c in checkins
            if c["date"] == date_str and c["time"] == time_str and c["status"] != "cancelled"
        )
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
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        checkins.append(record)
        _save(checkins)

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


@app.route("/health")
def health():
    return jsonify({"status": "ok", "app": "Nail Salon Check-In"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=False)
