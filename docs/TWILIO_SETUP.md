# Twilio Verify — APAD login OTP

End-user flow: **Register/Login → offer link SMS → Ad 1 → Ad 2 (from link) → OTP SMS → Enter code on site → Dashboard**

Two SMS types:

| SMS | Twilio product | Env |
| --- | -------------- | --- |
| Offer + ad link (on login) | **Programmable SMS** | `TWILIO_FROM_NUMBER` |
| OTP (after ads) | **Verify** | `TWILIO_VERIFY_SERVICE_SID` |

## Phone numbers

All mobiles are stored in **E.164** format (e.g. `+14155552671`, `+919876543210`).

- Register/Login use a **country picker**; pick country, enter local number.
- Backend validates with `phonenumbers` and `DEFAULT_PHONE_REGION=IN` for legacy bare numbers.
- Twilio Verify accepts any valid international E.164 number (trial may restrict destinations).

## 1. Twilio Console

1. Create account at [twilio.com](https://www.twilio.com).
2. **Verify** → **Services** → Create service → copy **Service SID** (`VA...`).
3. Copy **Account SID** and **Auth Token** from the dashboard.

Trial accounts usually only send SMS to **verified** phone numbers (max 5).

### If OTP fails for one number but works for another

This is almost always a **Twilio account restriction**, not your app code or the user’s physical location (e.g. Indian +91 number in Arizona vs India — Twilio routes to the same +91 destination).

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| Works for one mobile, fails for another | Destination not on **Verified Caller IDs** (trial error **21608**) | Twilio Console → **Phone Numbers** → **Manage** → **Verified Caller IDs** → add `+919848264464` (must receive Twilio’s verify SMS on that phone) |
| Need any user to get OTP without pre-verifying | Trial limit | **Upgrade** Twilio account (add payment method) |
| SMS blocked by country | Geo permissions | **Messaging** → **Settings** → **Geo permissions** → enable India (+91) |

After a failed send, check your API terminal logs — you will see `Twilio Verify send failed: code=21608 ...` when the number is unverified.

## 2. Backend `.env`

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxx
TWILIO_OTP_CHANNEL=sms
TWILIO_FROM_NUMBER=+1xxxxxxxx

LOGIN_LINK_SMS_ENABLED=true
LOGIN_LINK_MESSAGE_TEMPLATE=Hi {user_name}, {promo}. Tap to view your offer: {link}

OTP_SIMULATION_MODE=false
OTP_SHOW_ON_SCREEN=false
```

Install dependency: `pip install -r requirements.txt`

## 3. Local test

1. Start API and frontend (`README.md`).
2. Register or use demo user `9876543210`.
3. `/login` → offer link SMS → open link on phone → complete both ads → OTP SMS → enter code on `/otp-verification` (main site, not the link tab).

## 4. Local POC (no Twilio)

```env
SMS_PROVIDER=mock
OTP_SHOW_ON_SCREEN=true
OTP_SIMULATION_MODE=true
```

OTP appears on the verification screen instead of SMS. Login link text is logged and shown in the login/OTP UI as **SMS preview**.

## 5. Render

See [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md) for production env vars.
