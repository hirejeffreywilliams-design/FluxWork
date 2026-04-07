# © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
# FluxWork

> Work on Your Terms — Gig Economy Marketplace Platform

Part of the **Omnivex Ecosystem** — powered by the Omnivex NC Engine.

## Overview

FluxWork is a production-grade gig economy marketplace platform built on the Omnivex platform stack.

## Features

- Gig Listings
- Skill Matching
- Contract Management
- Payment Processing
- Review System
- Portfolio Display
- Availability Scheduling

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS (dark theme), Wouter, TanStack Query
- **Backend:** Express.js, Drizzle ORM, PostgreSQL (Neon)
- **Auth:** Passport.js (local strategy), express-session
- **Build:** Vite, TSX, TypeScript
- **Omnivex NC Engine:** Integrated via hook points in API routes

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
OMNIVEX_NC_API_KEY=your-nc-api-key
OMNIVEX_NC_ENDPOINT=https://nc.omnivex.ai/api/v1
```

## Project Structure

```
fluxwork/
├── server/
│   ├── index.ts          # Express server entry
│   ├── routes.ts         # All API routes (30+ endpoints)
│   ├── storage.ts        # Storage interface + MemStorage
│   ├── vite.ts           # Vite dev middleware
│   └── db/
│       └── schema.ts     # Drizzle ORM schema (10+ tables)
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── pages/        # 7 domain-specific pages
│       ├── components/
│       │   └── Layout.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       └── lib/
│           └── queryClient.ts
├── shared/
│   ├── schema.ts         # Zod validation schemas
│   └── types.ts          # Shared TypeScript types
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── README.md
```

## License

© 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
