# AI Interview Prep & Resume Builder Platform

Production-oriented MERN SaaS starter: JWT auth with roles, Stripe subscriptions, OpenAI-powered coaching, Cloudinary uploads, and a React dashboard with dark mode.

## Repository layout

| Path | Description |
|------|-------------|
| `backend/` | Express REST API, MongoDB models, Stripe webhooks, rate limits, Helmet |
| `frontend/` | Vite + React + Tailwind SPA, protected routes, admin charts |

## Features

- **Auth**: Register, login, JWT access, forgot/reset password (email stub logs reset URL in dev), `user` / `admin` roles, protected routes.
- **Dashboard**: Profile snapshot, subscription status, recent resumes and interview sessions.
- **Resumes**: CRUD, Cloudinary file upload, AI summary/skills/analysis (premium), client-side PDF export.
- **Interviews**: Sessions with difficulty; AI-generated technical + HR questions; per-answer AI feedback (premium).
- **Chat**: Stored conversations; streaming-style UI with typing indicator (premium for sending).
- **Admin**: User list, role toggles, signup chart (Recharts), revenue aggregates from Stripe webhook events.
- **Billing**: Stripe Checkout subscription; success/cancel pages; webhook updates `User.subscription`.
- **Security**: `helmet`, `express-rate-limit`, `express-validator`, centralized error handler, bcrypt hashing.

## Prerequisites

- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- OpenAI API key
- Cloudinary account (for uploads)
- Stripe account (test mode is fine): Product → recurring Price → copy Price ID; webhook endpoint secret

## Backend setup

```bash
cd backend
cp .env.example .env
# Fill MONGODB_URI, JWT_SECRET, OPENAI_API_KEY, CLOUDINARY_*, STRIPE_*, CLIENT_URL
npm install
npm run dev
```

API listens on `http://localhost:5000` by default.

### Admin bootstrap

Set `BOOTSTRAP_ADMIN_EMAIL` in `.env` to the email of an existing user; on server start their role is set to `admin`. Alternatively patch the user in MongoDB.

### Stripe webhook (local)

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Put the signing secret in `STRIPE_WEBHOOK_SECRET`.

## Frontend setup

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Deployment

### Frontend — Vercel

1. Import the `frontend` directory as a new project.
2. Environment: `VITE_API_URL=https://your-api.onrender.com/api`.
3. Build command: `npm run build`, output directory: `dist`.

### Backend — Render

1. Web service from `backend` directory.
2. Build: `npm install`, Start: `npm start`.
3. Set all variables from `backend/.env.example`.
4. Add Stripe webhook URL: `https://your-api.onrender.com/api/payments/webhook` (full URL, raw body preserved by Express route ordering in `server.js`).

### Database — MongoDB Atlas

Create a cluster, allow network access, and set `MONGODB_URI` with user credentials.

## Architecture notes

- **Premium gating**: `requirePremium` middleware checks `User.isPremium()` (active Stripe subscription and period end).
- **AI limits**: `aiLimiter` reduces abuse on generation endpoints.
- **Password reset**: Without SMTP, `sendEmail` logs the reset URL—suitable for development only; connect a real mailer for production.
- **Clean structure**: Controllers stay thin; models own schema methods; config split under `config/`.

## Scripts

| Command | Where | Purpose |
|---------|-------|---------|
| `npm run dev` | backend | Nodemon API |
| `npm start` | backend | Production server |
| `npm run dev` | frontend | Vite dev |
| `npm run build` | frontend | Production bundle |

## License

MIT — use as a foundation for your own product. Replace branding, wire real email, and harden monitoring before going live.
