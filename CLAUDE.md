# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bitcoin DCA (Dollar Cost Averaging) web application. Users configure automatic Bitcoin investment plans (weekly, biweekly, or monthly) with variable amounts based on a manually-set market condition. The app displays real-time BTC price, on-chain balance, next investment date, and calculated amounts.

**This project is currently in the planning phase.** The main reference document is [plano-bitcoin-dca-app.md](plano-bitcoin-dca-app.md) (in Portuguese).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| BTC price | CoinGecko API (free) |
| BTC on-chain balance | Blockstream.info API |
| BRL/USD exchange rate | AwesomeAPI (free) |

---

## Development Commands

> Commands will be established during Phase 1 setup. Expected structure:

```bash
# Frontend (React + Vite)
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build

# Backend (Node.js + Express)
npm run dev        # start backend with hot reload (nodemon)
npm start          # start backend in production
```

---

## Architecture

```
Frontend (React) ←→ Backend (Node.js + Express) ←→ Supabase (DB + Auth)
                              ↕
             External APIs: Blockstream, CoinGecko, AwesomeAPI
```

External APIs are proxied through the backend — never called directly from the frontend — to avoid exposing keys and CORS issues.

### Database Schema (Supabase)

- **`users`** — Managed by Supabase Auth. Has a `role` field (`user` or `admin`).
- **`user_settings`** — Per-user: `btc_public_key`, `currency` (BRL/USD), `plan_frequency` (semanal/quinzenal/mensal), `plan_day`, `plan_amount`.
- **`market_moment`** — Single active row, updated by admin. `status` is one of: `ÓTIMO`, `BOM`, `OK`, `RUIM`, `PÉSSIMO`.
- **`aporte_config`** — Maps each `moment_status` to a `percentage_increase` over the user's base plan amount.

### Key Business Logic

**Investment amount calculation:**
```
calculated_amount = plan_amount × (1 + percentage_increase_for_current_moment)
monthly_projection = calculated_amount × (frequency_per_30_days)
```

**Home screen data flow:**
1. Supabase Auth session check
2. Fetch `user_settings` (wallet address, plan)
3. Blockstream API → BTC on-chain balance (via xpub/address)
4. CoinGecko API → BTC price in USD
5. AwesomeAPI → BRL/USD rate
6. Supabase → current `market_moment`
7. Compute all display values and render

BTC price polling interval: **60 seconds**.

### Access Control

- `/admin` route: restricted to users with `role = admin`
- Supabase **Row Level Security (RLS)** enforced on all tables — users can only read/write their own rows
- Only BTC **public keys** are ever stored — make this explicit in the UI
- Sensitive keys in `.env` only, never exposed to frontend

### Visual Identity

- Theme: **dark** (black/dark background)
- Accent colors: **orange** (Bitcoin brand) and **green** (positive actions, WhatsApp button)
- Market moment badges: 🟢 ÓTIMO / 🟡 BOM / 🟠 OK / 🔴 RUIM / ⚫ PÉSSIMO

---

## Development Phases

Follow this order when implementing:

**Phase 1 — Base**
1. Vite + React + TailwindCSS project setup with folder structure
2. Supabase: create all 4 tables, RLS policies, Auth configuration
3. Node.js/Express backend: API routes, Supabase connection, external API proxy

**Phase 2 — Core**
4. Login/signup screen (Supabase Auth)
5. Blockstream + CoinGecko + AwesomeAPI integrations
6. Home screen with all display components

**Phase 3 — Plan & Calculations** *(blocked on pending items below)*
7. "Seu Plano" component: editable plan + 30-day projection
8. "Próximo Aporte" logic: next date + moment-adjusted amount

**Phase 4 — Admin & Polish**
9. Admin panel: update market moment, configure percentages per moment
10. WhatsApp "COMPRAR AGORA" button, dark theme refinements, final testing

---

## Pending Items (Required Before Phase 3)

| Item | Detail |
|---|---|
| Marco's formulas | `percentage_increase` value for each moment (ÓTIMO, BOM, OK, RUIM, PÉSSIMO) |
| WhatsApp number | Fixed P2P contact number for the "COMPRAR AGORA" button |
| App name & logo | To be used in the header |
