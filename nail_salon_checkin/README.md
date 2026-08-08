# Nail Salon Check-In

A small self-check-in web app for a nail salon. Customers pick a 30-minute
time slot and leave a note about the service they'd like; staff can watch
the day's queue on `/staff`.

## Run locally

```bash
cd nail_salon_checkin
pip install flask
python app.py
```

Then open http://localhost:5050 (customer check-in) and
http://localhost:5050/staff (staff queue view).

## How it works

- Business hours and slot length are configured at the top of `app.py`
  (`OPEN_HOUR`, `CLOSE_HOUR`, `SLOT_MINUTES`, `CHAIRS_PER_SLOT`).
- Each 30-minute slot can hold `CHAIRS_PER_SLOT` customers at once; the
  slot grid shows how many spots are left and disables full slots.
- Check-ins are stored in `data/checkins.json` (created automatically).
- Staff can update a check-in's status (Waiting / In Service / Done /
  Cancelled) from `/staff`.
