# APAD — Authenticated Personalized Ad Delivery (POC)

Advertisement-gated authentication platform: users **watch a personalized ad**, then receive **OTP**, verify, and access a **personalized portal**.

| Document | Description |
| -------- | ----------- |
| [APPLICATION_FLOW.md](APPLICATION_FLOW.md) | User journeys, flows, state machine |
| [API_TESTING.md](API_TESTING.md) | **API test order** — which endpoint to call first, curl examples |
| [apad_tech_doc.md](apad_tech_doc.md) | Full technical architecture |
| [realistic_needs_for_production.md](realistic_needs_for_production.md) | Paid SMS / DLT services for production |

---

## Project structure

```
APAD/
├── backend/          # FastAPI + SQLAlchemy
├── frontend/         # React + Vite + Tailwind
├── README.md
└── APPLICATION_FLOW.md
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- (Optional) PostgreSQL / [Neon](https://neon.tech/) for production DB

---

## Quick start (local)

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs  
Health: http://localhost:8000/health

### 2. Frontend (new terminal)

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

App: http://localhost:5173

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose | Default (POC) |
| -------- | ------- | ------------- |
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./apad.db` |
| `JWT_SECRET` | Signs access tokens | *(change in production)* |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `FRONTEND_BASE_URL` | Token links & OG redirects | `http://localhost:5173` |
| `BACKEND_BASE_URL` | Preview URL base | `http://localhost:8000` |
| `SMS_PROVIDER` | `mock` \| `msg91` \| `fast2sms` \| `twilio` | `mock` |
| `OTP_SIMULATION_MODE` | POC OTP mode | `true` |
| `OTP_SHOW_ON_SCREEN` | Return OTP in API for UI | `true` |
| `SEED_DEMO_DATA` | Create admin + demo user + campaign | `true` |
| `ADMIN_MOBILE` | Seeded admin phone | `9999999999` |

See [backend/.env.example](backend/.env.example) for all keys.

### Frontend (`frontend/.env`)

| Variable | Purpose | Default |
| -------- | ------- | ------- |
| `VITE_API_BASE_URL` | Backend URL (no trailing slash) | `http://localhost:8000` |
| `VITE_POC_MODE` | Show POC OTP on screen | `true` |
| `VITE_APP_NAME` | Navbar title | `APAD` |

See [frontend/.env.example](frontend/.env.example).

---

## Demo walkthrough

### Flow 2 — Login (fastest test)

1. Open http://localhost:5173  
2. **Register** or use demo mobile `9876543210` (seeded)  
3. **Login** → enter mobile → **Watch ad** (≥5 seconds / let video end)  
4. **OTP confirmation** — copy OTP from yellow POC box  
5. **Enter OTP** → **Dashboard**

### Flow 1 — Token link

1. **Admin login** at http://localhost:5173/admin/login (see below)  
2. Go to **Admin → Campaigns → Generate token links**  
3. Open generated URL (e.g. `/ad-preview/tk_...`)  
4. Continue: watch ad → OTP → portal

### Admin panel

- **URL:** http://localhost:5173/admin/login  
- **Mobile:** `9999999999` (from `ADMIN_MOBILE` in backend `.env`)  
- **Password:** `admin123` (from `ADMIN_PASSWORD`) — no ad or OTP required  
- **Console paths:** `/admin`, `/admin/campaigns`, `/admin/users`, `/admin/analytics`  
- Create end users under **Users**; create campaigns and ad creatives under **Campaigns**

---

## API overview

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/register` | Register user |
| POST | `/api/login` | Check mobile exists |
| GET | `/api/ad/watch` | Get ad creative (`?token=` or `?mobile=`) |
| POST | `/api/ad/completed` | Mark ad watched (unlocks OTP) |
| POST | `/api/otp/send-otp` | Send OTP (after ad) |
| POST | `/api/verify-otp` | Verify OTP → JWT |
| POST | `/api/auth/admin-login` | Admin: mobile + password → JWT |
| GET | `/preview/{token}` | OG HTML for crawlers |
| POST | `/api/users` | Admin: create user |
| POST | `/api/campaigns/create` | Admin: create campaign |
| POST | `/api/tokens/generate-token` | Admin: personalized links |
| GET | `/api/analytics` | Admin: event counts |

---

## Database

- **PostgreSQL (Neon):** Set `DATABASE_URL` in `backend/.env` to your Neon connection string (use the **pooled** URL from the Neon dashboard).  
- **Local fallback:** `DATABASE_URL=sqlite:///./apad.db` — no extra setup.

On startup the API runs `create_all` to create tables and optionally seeds demo data (`SEED_DEMO_DATA=true`).

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | `postgresql://...` or `sqlite:///./apad.db` |
| `DB_POOL_SIZE` | Postgres connection pool size (default `5`) |
| `DB_MAX_OVERFLOW` | Extra connections under load (default `10`) |

**Health check:** `GET /health` returns `"database": "connected"` when Postgres is reachable.

Tables: `users`, `campaigns`, `targeting_rules`, `generated_tokens`, `otp_logs`, `ad_completions`, `analytics_events`.

**Neon tip:** If connection fails on Windows, try the connection string with `sslmode=require` only (remove `channel_binding=require` if your driver does not support it).

---

## Production deployment (summary)

| Service | Role |
| ------- | ---- |
| Render / Railway | Host FastAPI + static frontend |
| Neon | PostgreSQL |
| MSG91 / Fast2SMS | Real SMS (requires DLT in India) |

Details: [realistic_needs_for_production.md](realistic_needs_for_production.md).

**Render example:**

- Backend: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
- Frontend: `npm run build` → publish `dist/`  
- Set env vars in Render dashboard (same names as `.env.example`)

---

## Troubleshooting

| Issue | Fix |
| ----- | --- |
| CORS error | Add frontend URL to `CORS_ORIGINS` in backend `.env` |
| OTP send 403 | Complete ad first (`/ad-watch`) |
| Admin 403 | Use **Admin login** (`/admin/login`) with seeded mobile + password |
| Video won't load | Check internet (demo uses external sample MP4 URL) |
| bcrypt error on Windows | `pip install bcrypt` in venv |

---

## License

POC / demonstration use per architecture document.
