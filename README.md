# VELORA

A full-stack MERN fashion e-commerce platform — premium editorial storefront, real cart/checkout/payments, and a complete admin dashboard.

**Tagline:** Designed for the Everyday.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Service Setup](#service-setup)
- [Database Seed](#database-seed)
- [Demo Accounts](#demo-accounts)
- [API Overview](#api-overview)
- [Known Limitations](#known-limitations)

## Overview

VELORA is a two-app monorepo: a React/Vite storefront + admin dashboard (`client/`) talking to an Express/MongoDB API (`server/`). Every feature listed below is wired to a real database and real endpoints — nothing is mocked. The one intentionally incomplete piece is the homepage's cinematic hero video; `client/src/components/home/HeroVideo.jsx` is a documented placeholder ready to receive the final video and in-video animated product cards without any restructuring.

Stripe (payments) and Cloudinary (image uploads) require your own API keys to activate — until configured, the relevant endpoints return a clear `503` and the UI degrades gracefully (e.g. checkout shows "Payments are not configured yet" instead of crashing). Everything else works out of the box against MongoDB Atlas.

## Features

**Customer**
Auth (register/login/forgot-reset password, httpOnly JWT cookies) · product catalog with server-side search/filter/sort/pagination · product details with variant-aware inventory and image zoom · cart & wishlist (guest localStorage, merged into MongoDB on login) · multi-step checkout with Stripe · coupons · order history & tracking timeline · reviews (with purchase verification and moderation) · account dashboard (profile, addresses, orders, wishlist).

**Admin** (`/admin`, role-gated: `admin` / `manager`)
Revenue & sales analytics (Recharts, MongoDB aggregation pipelines) · product CRUD with image upload and per-variant inventory grid, bulk actions, duplicate · category & collection management · order management with a validated status-transition workflow · customer management · review moderation · coupon management · newsletter subscriber list + CSV export.

## Tech Stack

**Frontend:** React 19, Vite, React Router 7, Redux Toolkit + RTK Query, Tailwind CSS 4, Framer Motion, React Hook Form + Zod, Recharts, Stripe.js, Lucide React

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT (httpOnly cookies), bcryptjs, Zod validation, Multer + Cloudinary, Stripe, Nodemailer, Helmet, express-rate-limit, express-mongo-sanitize

## Folder Structure

```text
velora/
├── client/                  React + Vite app
│   └── src/
│       ├── components/      Reusable UI (product cards, nav, admin widgets, ...)
│       ├── layouts/         AccountLayout, AdminLayout
│       ├── pages/           Route-level pages (customer + pages/admin/*)
│       ├── features/        RTK Query API slices + Redux slices, grouped by domain
│       ├── context/         Cart/Wishlist providers (guest + authenticated modes)
│       ├── hooks/           useDebounce, useDocumentTitle, useEscapeKey, ...
│       ├── services/        apiSlice (RTK Query base)
│       ├── store/           Redux store
│       ├── constants/       Runtime config (API URL, Stripe key)
│       └── lib/             Stripe client init
│
├── server/                  Express + MongoDB API
│   ├── config/               db, cloudinary, stripe, email — each self-reports if unconfigured
│   ├── controllers/          Request handlers (thin — logic lives in services/)
│   ├── services/              Business logic: pricing, inventory, coupons, analytics, ratings
│   ├── models/                Mongoose schemas
│   ├── routes/                Route definitions per domain
│   ├── middleware/            auth, validation, rate limiting, error handling, uploads
│   ├── validators/            Zod schemas per domain
│   └── utils/                 ApiError, asyncHandler, JWT helpers, seed.js
│
├── .env.example
└── package.json              Root scripts (runs client + server together)
```

## Getting Started

**Prerequisites:** Node.js 20+, a MongoDB connection string (Atlas free tier works fine).

```bash
git clone <your-fork-url> velora
cd velora
npm run install:all
```

Copy `.env.example` to `server/.env` and `client/.env` (or create both from scratch — see [Environment Variables](#environment-variables)), then:

```bash
npm run seed          # populates categories, 20 products, sample customers/coupons/reviews/orders, admin account
npm run dev           # runs client (Vite, :5173) and server (Express, :5000) together
```

Visit `http://localhost:5173`. Admin dashboard: `http://localhost:5173/admin` (see [Demo Accounts](#demo-accounts)).

**Production build:**

```bash
npm run build          # builds client/dist
npm start               # runs server in production mode (serve dist behind your own static host/CDN)
```

## Environment Variables

Two `.env` files — `server/.env` and `client/.env` — see `.env.example` at the repo root for the full list with inline comments. The essentials:

| Variable | Where | Required | Notes |
|---|---|---|---|
| `MONGO_URI` | server | Yes | MongoDB Atlas or local connection string |
| `JWT_SECRET` | server | Yes | Any long random string |
| `CLIENT_URL` | server | Yes | Used for CORS + password-reset links |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | server | For `npm run seed` | Never hardcoded — set your own before seeding |
| `STRIPE_SECRET_KEY` | server | For checkout | Test key: `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | server | For webhooks | From `stripe listen` (see below) |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | server | For image upload | Free tier is enough |
| `SMTP_HOST/PORT/USER/PASSWORD` | server | For real emails | Without it, emails log to the console instead |
| `VITE_API_URL` | client | Yes | Defaults to `http://localhost:5000/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | client | For checkout | Test key: `pk_test_...` |

## Service Setup

**MongoDB Atlas** — create a free cluster, add a database user, allow your IP (or `0.0.0.0/0` for local dev), copy the `mongodb+srv://` connection string into `MONGO_URI`.

**Stripe** — grab test keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). To exercise the webhook locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run `stripe listen --forward-to localhost:5000/api/payments/webhook`; it prints a `whsec_...` value for `STRIPE_WEBHOOK_SECRET`. Card checkout itself doesn't require the webhook — orders are created synchronously once the PaymentIntent confirms — the webhook only handles async event logging (`payment_intent.succeeded/failed`, `charge.refunded`).

**Cloudinary** — free account at [cloudinary.com](https://cloudinary.com), copy Cloud Name/API Key/API Secret from the dashboard.

**SMTP** — any provider works (e.g. a Mailtrap sandbox for dev, or a real SMTP relay for production). Without it configured, welcome/password-reset emails are logged to the server console instead of sent — the app still functions.

## Database Seed

`npm run seed` (or `node server/utils/seed.js`) is idempotent-ish per run: it clears and repopulates products/categories/collections/reviews/orders/coupons, but leaves existing user accounts alone (it upserts the admin and sample customers rather than duplicating them). Seeds:

- 3 top-level categories × 3 subcategories each (Women/Men/Accessories)
- 20 realistic products with per-variant inventory
- 1 featured collection ("The Summer Edit")
- 1 admin account (from `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
- 3 sample customers, 3 coupons, 10 approved reviews, 6 sample orders — so the storefront and admin dashboard both look populated on first run

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | value of `ADMIN_EMAIL` in your `server/.env` | value of `ADMIN_PASSWORD` |
| Sample customers | `sarah.mitchell@example.com`, `daniel.reyes@example.com`, `amara.okafor@example.com` | `Password123` |

Sample coupon codes (usable at checkout once Stripe is configured): `WELCOME10` (10% off), `FREESHIP` ($8 off orders $50+), `SUMMER25` (25% off, capped at $75, orders $150+).

## API Overview

All responses share one shape: `{ success: boolean, message: string, data?: {...}, errors?: [...] }`. Base path: `/api`.

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `POST` | `/auth/register` | — | Rate-limited |
| `POST` | `/auth/login` | — | Rate-limited |
| `GET` | `/products?category=&sort=&page=&...` | — | Server-side filter/sort/pagination |
| `GET` | `/products/search?q=` | — | Debounced typeahead |
| `GET` | `/products/:slug` | — | Includes related products |
| `POST` | `/products` | Staff | Zod-validated |
| `GET` | `/cart` | User | Live-hydrated prices/stock |
| `POST` | `/cart/merge` | User | Guest → account cart merge on login |
| `POST` | `/payments/create-intent` | User | Creates Stripe PaymentIntent from the server-computed total |
| `POST` | `/orders` | User | Re-validates payment + stock before creating the order |
| `POST` | `/coupons/validate` | User | Same pricing logic used at checkout |
| `GET` | `/admin/dashboard?range=` | Staff | Aggregated analytics |
| `PATCH` | `/orders/:id/status` | Staff | Rejects invalid status transitions |

Full route list is in `server/routes/index.js`; each domain has its own `*Routes.js` file with inline comments on auth requirements.

## Known Limitations

- **Cinematic hero**: intentionally a placeholder (see [Overview](#overview)).
- **Store settings** (`/admin/settings`): currently read-only — displays integration status and the hardcoded business rules (free shipping threshold, tax rate) rather than a persisted, editable settings model. The values live in `server/services/checkoutPricingService.js`.
- **Tax**: flat 0% — no tax-jurisdiction logic.
- Requires your own Stripe/Cloudinary/SMTP credentials to fully activate payments, image upload, and outbound email; the app is fully functional without them except for those specific features.
