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

## Text message confirmations

When a customer checks in, the salon owner gets a text with a link to
confirm how long the service will actually take (30 or 60 minutes). Once
confirmed, the customer gets a text confirming their appointment, and the
extra time is blocked off in the slot grid.

Texts are sent via [Twilio](https://www.twilio.com/). Set these environment
variables (e.g. in Render's dashboard under the service's Environment tab)
to enable real sending:

| Variable              | Description                                           |
| ---------------------- | ------------------------------------------------------ |
| `TWILIO_ACCOUNT_SID`   | From your Twilio console                                |
| `TWILIO_AUTH_TOKEN`    | From your Twilio console                                |
| `TWILIO_FROM_NUMBER`   | The Twilio phone number to send from (E.164, e.g. `+1...`) |
| `OWNER_PHONE`          | Where owner notifications are sent. Defaults to `+16237604999` |
| `BASE_URL`             | Public base URL used to build the confirm link, e.g. `https://nail-salon-checkin.onrender.com`. Falls back to the incoming request's host if unset |

Without Twilio credentials set, the app still works end-to-end — it just
logs what would have been sent instead of sending a real text.
