# Deploy APAD on Render

This guide deploys the full stack on [Render](https://render.com):

| Service | Render type | Role |
| ------- | ----------- | ---- |
| **apad-db** | PostgreSQL | Persistent database (required — do not use SQLite on Render) |
| **apad-api** | Web Service (Python) | FastAPI backend |
| **apad-web** | Static Site | React (Vite) frontend |

```mermaid
flowchart LR
  User[Browser]
  Web[apad-web Static Site]
  API[apad-api Web Service]
  DB[(PostgreSQL)]

  User --> Web
  Web -->|HTTPS API calls| API
  API --> DB
```

---

## Prerequisites

1. [Render](https://render.com) account (GitHub/GitLab connected).
2. APAD repo pushed to GitHub (or GitLab).
3. (Optional) [Neon](https://neon.tech) instead of Render Postgres — same `DATABASE_URL` format.

---

## 1. PostgreSQL database

### Option A — Render PostgreSQL (simplest)

1. Render Dashboard → **New +** → **PostgreSQL**.
2. Name: `apad-db` (example).
3. Region: same region you will use for API and frontend.
4. Plan: **Free** (or paid for production).
5. Create database → open **Connections**:
   - Copy **Internal Database URL** (use this for `apad-api` on Render).
   - Or **External Database URL** if API is hosted elsewhere.

URL must look like:

```text
postgresql://user:password@host/dbname?sslmode=require
```

The app auto-converts legacy `postgres://` to `postgresql://`.

### Option B — Neon

1. Create a project on Neon → copy the **pooled** connection string.
2. Use it as `DATABASE_URL` on the backend service (same as above).

---

## 2. Backend (FastAPI)

1. **New +** → **Web Service** → connect your repo.
2. Settings:

| Field | Value |
| ----- | ----- |
| **Name** | `apad-api` |
| **Region** | Same as database |
| **Branch** | `main` (or your default) |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

3. **Instance type**: Free or Starter (free sleeps after inactivity).

4. **Health Check Path** (optional): `/health`

### Backend environment variables

Set these under **Environment** → **Add Environment Variable** (or **Add from .env** using [`backend/.env.example`](backend/.env.example) as a template).

Replace `https://apad-web.onrender.com` and `https://apad-api.onrender.com` with your real URLs after the frontend service is created.

| Key | Production example | Notes |
| --- | ------------------ | ----- |
| `DATABASE_URL` | `postgresql://...` from step 1 | **Required** on Render |
| `JWT_SECRET` | long random string (32+ chars) | **Change** — never use default |
| `DEBUG` | `false` | |
| `CORS_ORIGINS` | `https://apad-web.onrender.com` | Comma-separated; no trailing slash |
| `FRONTEND_BASE_URL` | `https://apad-web.onrender.com` | Token links & redirects |
| `BACKEND_BASE_URL` | `https://apad-api.onrender.com` | OG preview base |
| `SEED_DEMO_DATA` | `true` (first deploy) then `false` | Seeds admin + demo ads once |
| `ADMIN_MOBILE` | your admin phone | |
| `ADMIN_PASSWORD` | strong password | Admin login only |
| `SMS_PROVIDER` | `twilio` | `mock` for local POC only |
| `TWILIO_VERIFY_SERVICE_SID` | `VA...` | From Twilio Console → Verify → Services |
| `TWILIO_OTP_CHANNEL` | `sms` | Twilio Verify delivery channel |
| `OTP_SIMULATION_MODE` | `false` | `true` only for local mock |
| `OTP_SHOW_ON_SCREEN` | `false` | `true` only when `SMS_PROVIDER=mock` |
| `API_PREFIX` | `/api` | Default |

5. **Create Web Service** → wait for deploy → note URL: `https://apad-api.onrender.com`.

6. Verify:

```text
GET https://apad-api.onrender.com/health
```

Expected JSON includes `"database": "connected"` and `"status": "ok"`.

API docs: `https://apad-api.onrender.com/docs`

---

## 3. Frontend (React / Vite)

1. **New +** → **Static Site** → same repo.
2. Settings:

| Field | Value |
| ----- | ----- |
| **Name** | `apad-web` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

3. **Environment variables** (required at **build** time for Vite):

| Key | Value |
| --- | ----- |
| `VITE_API_BASE_URL` | `https://apad-api.onrender.com` |
| `VITE_APP_NAME` | `APAD` |
| `VITE_POC_MODE` | `true` or `false` |

No trailing slash on `VITE_API_BASE_URL`.

4. Deploy → URL: `https://apad-web.onrender.com`.

### SPA routing (React Router)

The repo includes [`frontend/public/_redirects`](frontend/public/_redirects) so paths like `/login`, `/admin/campaigns` work on refresh:

```text
/*    /index.html   200
```

Vite copies this into `dist/` on build. If routes 404 on refresh, confirm `_redirects` exists under `frontend/public/`.

---

## 4. Wire URLs together (checklist)

After both services are live:

1. **Backend** `CORS_ORIGINS` = exact frontend URL (`https://apad-web.onrender.com`).
2. **Backend** `FRONTEND_BASE_URL` = frontend URL.
3. **Backend** `BACKEND_BASE_URL` = backend URL.
4. **Redeploy backend** if you changed env vars after first deploy.
5. If you change `VITE_API_BASE_URL`, **rebuild frontend** (static site rebuild).

---

## 5. Smoke test on production

| Step | URL / action |
| ---- | ------------ |
| Health | `GET /health` on API |
| Home | Open frontend `/` |
| Register | `/register` with real mobile + email |
| Login flow | Mobile → ads → OTP → dashboard |
| Admin | `/admin/login` with `ADMIN_MOBILE` / `ADMIN_PASSWORD` |
| Admin ads | `/admin/campaigns` — create advertisement |

Demo user (if `SEED_DEMO_DATA=true`): mobile `9876543210` — only if seeded on that database.

---

## 6. Production recommendations

| Topic | Recommendation |
| ----- | -------------- |
| Database | Render Postgres or Neon — **not** SQLite (ephemeral disk on Render) |
| Secrets | New `JWT_SECRET`, strong `ADMIN_PASSWORD` |
| Seed | `SEED_DEMO_DATA=false` after first successful deploy |
| OTP | Set `OTP_SHOW_ON_SCREEN=false`, `OTP_SIMULATION_MODE=false`, configure real SMS provider — see [realistic_needs_for_production.md](realistic_needs_for_production.md) |
| Free tier | API sleeps ~15 min idle; first request may be slow |
| Custom domain | Render → service → **Settings** → **Custom Domains**; update `CORS_ORIGINS` and `VITE_*` URLs |

---

## 7. Optional: Blueprint (`render.yaml`)

You can deploy all three resources from one file at the repo root. Example [`render.yaml`](render.yaml) (adjust repo URL and secrets before use):

- Creates Postgres + API + static site.
- Links `DATABASE_URL` automatically to the API service.
- You still must set `JWT_SECRET`, `CORS_ORIGINS`, and `VITE_API_BASE_URL` in the Render dashboard or via blueprint env groups.

**Blueprint deploy:** Render Dashboard → **Blueprints** → **New Blueprint Instance** → select repo.

---

## 8. Troubleshooting

| Problem | Fix |
| ------- | --- |
| CORS error in browser | Add exact frontend origin to `CORS_ORIGINS`; redeploy API |
| Frontend calls `localhost:8000` | Rebuild static site with correct `VITE_API_BASE_URL` |
| `database: unavailable` on `/health` | Check `DATABASE_URL`, SSL (`sslmode=require`), Postgres running |
| 404 on `/login` refresh | Ensure `frontend/public/_redirects` exists and rebuild |
| API 502 on cold start | Normal on free tier; wait and retry |
| OTP not on screen | `OTP_SHOW_ON_SCREEN=true` or use real SMS provider |
| Video ads black | External MP4 hosts; network/firewall; see seed video URLs |
| Build fails (Python) | Root Directory must be `backend` |
| Build fails (Node) | Root Directory must be `frontend`; Node 18+ |

---

## 9. Local vs Render env mapping

| Local (`backend/.env`) | Render (API service) |
| ---------------------- | -------------------- |
| `DATABASE_URL=sqlite://...` | `DATABASE_URL=postgresql://...` |
| `CORS_ORIGINS=http://localhost:5173` | `CORS_ORIGINS=https://apad-web.onrender.com` |
| `FRONTEND_BASE_URL=http://localhost:5173` | `FRONTEND_BASE_URL=https://apad-web.onrender.com` |

| Local (`frontend/.env`) | Render (Static site) |
| ----------------------- | -------------------- |
| `VITE_API_BASE_URL=http://localhost:8000` | `VITE_API_BASE_URL=https://apad-api.onrender.com` |

---

## Related docs

- [README.md](README.md) — local setup
- [APPLICATION_FLOW.md](APPLICATION_FLOW.md) — user flows
- [API_TESTING.md](API_TESTING.md) — API order & curl
- [backend/.env.example](backend/.env.example) — all backend keys
- [frontend/.env.example](frontend/.env.example) — frontend keys
