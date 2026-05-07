# InvoiceHub - Full-Stack Invoice Management System

A full-stack invoice management application built as a take-home assignment. Supports creating invoices, listing them with pagination, updating statuses, and downloading PDF exports.

---

## Folder Structure

```
omazons-invoice/
├── apps/
│   ├── api/                        # Fastify REST API (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   └── invoices/       # Routes, Zod schemas, service layer
│   │   │   │       ├── invoices.routes.ts
│   │   │   │       ├── invoices.schema.ts
│   │   │   │       ├── invoices.service.ts
│   │   │   │       └── invoices.service.test.ts  ← tests
│   │   │   ├── pdf/                # PDF generation (@react-pdf/renderer)
│   │   │   ├── plugins/            # Prisma Fastify plugin
│   │   │   ├── utils/
│   │   │   │   ├── money.ts        # Rounding + tax calculation
│   │   │   │   └── money.test.ts   ← tests
│   │   │   └── app.ts              # Fastify app + Swagger setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # DB schema (Invoice, LineItem, InvoiceCounter)
│   │   │   └── migrations/         # Prisma migration history
│   │   ├── .env.example            # Copy this to .env and fill in DATABASE_URL
│   │   └── vitest.config.ts
│   │
│   ├── web/                        # Next.js 16 frontend (React 19) - original build
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router pages
│   │   │   ├── components/         # shadcn/ui + feature components
│   │   │   └── api/                # Axios client + types
│   │   └── .env.example            # Copy to .env.local and fill in NEXT_PUBLIC_API_URL
│   │
│   └── vue-web/                    # Vue 3 frontend - Composition API rebuild
│       ├── src/
│       │   ├── views/              # InvoicesView.vue, InvoiceDetailView.vue
│       │   ├── components/         # StatusBadge.vue, CreateInvoiceModal.vue
│       │   ├── api/                # Axios client typed against @omazons/shared
│       │   ├── router/             # Vue Router (/, /invoices/:id)
│       │   └── utils/              # formatMoney, formatDate
│       └── .env.example            # Copy to .env and fill in VITE_API_URL
│
├── packages/
│   └── shared/                     # Shared across all apps - single source of truth
│       └── src/
│           ├── types/
│           │   └── invoice.types.ts    # Invoice, LineItem, InvoiceListResponse, payloads
│           ├── schemas/
│           │   └── invoice.schemas.ts  # Zod: CreateInvoiceSchema, UpdateInvoiceStatusSchema
│           └── utils/
│               └── invoice-status.ts   # ALLOWED_STATUS_TRANSITIONS, canTransitionInvoice
│
├── docker-compose.yml              # PostgreSQL 16
├── turbo.json                      # Turborepo task pipeline
├── pnpm-workspace.yaml             # pnpm monorepo config
└── TESTS_EXPLAINED.md              # Beginner-friendly walkthrough of the test suite
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (Vue) | Vue 3, Composition API (`<script setup>`), Vue Router 4, Tailwind CSS v4 |
| Frontend (React) | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| State / Data Fetching | TanStack Query (Vue + React flavours) |
| Backend | Fastify 5 (TypeScript) |
| ORM | Prisma 7 + PostgreSQL adapter |
| Database | PostgreSQL 16 |
| Validation | Zod (shared schemas across frontend + backend) |
| PDF Generation | @react-pdf/renderer |
| Testing | Vitest |
| Monorepo | Turborepo + pnpm workspaces |
| Containerization | Docker Compose |

---

## Environment Variables

Each app has a `.env.example` file. Copy it and fill in your values before running.

### `apps/api/.env`
```bash
cp apps/api/.env.example apps/api/.env
```
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/omazons_invoice"
```

### `apps/vue-web/.env` (Vue frontend)
```bash
cp apps/vue-web/.env.example apps/vue-web/.env
```
```env
VITE_API_URL=http://localhost:3001
```

### `apps/web/.env.local` (React/Next.js frontend)
```bash
cp apps/web/.env.example apps/web/.env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) - for PostgreSQL
- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) - `npm install -g pnpm`

---

### Step 1 - Clone and install

```bash
git clone <repo-url>
cd omazons-invoice
pnpm install
```

This installs dependencies for all apps and packages in one go. Turborepo ensures `packages/shared` is built before the apps.

---

### Step 2 - Start the database

```bash
docker compose up -d
```

Spins up PostgreSQL 16 on port `5432` with database `omazons_invoice`.

---

### Step 3 - Set up environment variables

```bash
cp apps/api/.env.example        apps/api/.env
cp apps/vue-web/.env.example    apps/vue-web/.env
cp apps/web/.env.example        apps/web/.env.local
```

Edit `apps/api/.env` and fill in your `DATABASE_URL` (the docker-compose default is already correct if you didn't change anything).

---

### Step 4 - Run database migrations

**Do you need this?** Yes, on first run (or after pulling new migrations). This creates all the tables in the database.

```bash
pnpm --filter=api exec prisma migrate dev
```

If you only want to apply existing migrations without creating a new one (e.g. in production or on a fresh clone):

```bash
pnpm --filter=api exec prisma migrate deploy
```

If Prisma complains about the generated client being out of sync:

```bash
pnpm --filter=api exec prisma generate
```

---

### Step 5 - Start the apps

```bash
pnpm dev
```

This runs the **Vue 3 frontend + API** in parallel via Turborepo.

| Service | URL |
|---|---|
| Vue 3 Frontend | http://localhost:5173 |
| Backend API (Fastify) | http://localhost:3001 |
| Swagger / API Docs | http://localhost:3001/docs |

---

## All Dev Commands

```bash
# Vue frontend + API (default)
pnpm dev

# Vue frontend only
pnpm dev:vue

# Everything - Vue + React/Next.js + API
pnpm dev:all

# React/Next.js frontend + API only
pnpm --filter=web --filter=api dev

# Build all packages and apps
pnpm build

# Build only the shared package
pnpm --filter=@omazons/shared build
```

### API-specific commands

```bash
# Run migrations (apply all pending migrations to the DB)
pnpm --filter=api exec prisma migrate dev

# Apply migrations without creating new ones (deploy / CI)
pnpm --filter=api exec prisma migrate deploy

# Regenerate the Prisma client after schema changes
pnpm --filter=api exec prisma generate

# Open Prisma Studio (visual DB browser)
pnpm --filter=api exec prisma studio

# Run the API on its own
pnpm --filter=api dev
```

---

## Testing

Tests live in the API package and cover three areas the brief specifically asked for.

```bash
# Run all tests once
pnpm --filter=api test

# Watch mode - re-runs on every file save
pnpm --filter=api test:watch
```

### What is tested

| File | What it covers |
|---|---|
| `src/utils/money.test.ts` | `roundHalfEven` (banker's rounding) and `calcTax` including `taxRateBps=1825` edge cases where the rounding algorithm is observable |
| `src/modules/invoices/invoices.service.test.ts` | All 3 valid status transitions, all 13 invalid transitions (each checks the exact error message), invoice number monotonicity and zero-padding, counter independence across months |

Tests run with **no database required** - Prisma is mocked with `vi.mock` so the suite is fast and works offline.

See `TESTS_EXPLAINED.md` for a full beginner-friendly walkthrough of every test case.

---

## API Reference

Full interactive docs at **http://localhost:3001/docs** (Swagger UI).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/invoices` | Create a new invoice |
| `GET` | `/invoices?page=1&limit=10` | List invoices with pagination |
| `GET` | `/invoices/:id` | Get a single invoice |
| `PATCH` | `/invoices/:id/status` | Update invoice status |
| `GET` | `/invoices/:id/pdf` | Download invoice as PDF |

---

## What I'd Do Differently With More Time


- **Authentication** - JWT-based auth with refresh tokens, protecting all invoice routes.
- **Background PDF generation** - Currently PDFs are generated synchronously on the request thread using `@react-pdf/renderer` (which bundles React into the backend). For production I'd move this to a queue (BullMQ), store the output in S3, and return a pre-signed URL. Synchronous PDF generation blocks the event loop.
- **Deployment** - Multi-stage Dockerfile for the API, `docker-compose.prod.yml`, and a GitHub Actions pipeline to lint, type-check, test, and build on every push.
- **Toast notifications** - User feedback on create/update failures instead of silent errors.

---

## Tradeoffs Made

**Fastify over Express** - Faster, first-class TypeScript support, and `@fastify/type-provider-zod` makes type-safe route validation nearly automatic. Tradeoff: smaller plugin ecosystem.

**No authentication** - Skipped to focus on the invoice domain within the time constraint. Adding it is clean: Fastify's plugin system lets you register a JWT `preHandler` hook across any route group without touching individual handlers.

**Turborepo** - Dependency-aware parallel builds with task caching. May feel like overkill for two apps, but the `packages/shared` dependency makes it immediately useful and the setup cost is minimal.

**Shared Zod schemas** - `packages/shared` exports types, Zod schemas, and status-transition logic consumed by both the API and both frontends. One change propagates everywhere with full type safety.

---

## One Thing I'd Push Back On

**Synchronous PDF generation in the API.**

`@react-pdf/renderer` blocks the Node.js event loop while rendering. Under concurrent load this degrades response times for all routes, not just PDF requests. I'd push back and move this to a background job: trigger after invoice creation, render to S3, return a pre-signed URL. The HTTP handler becomes a simple redirect - no blocking, scales horizontally.

---

## What I Learned

| Technology | Key takeaway |
|---|---|
| **Fastify** | Schema-first, fast, TypeScript-native - feels like the modern Express |
| **Prisma** | Type-safe queries, migrations as first-class citizens, zero boilerplate |
| **Turborepo** | Dependency-aware parallel builds with caching - monorepo without the pain |
| **Vue 3 Composition API** | `<script setup>` + `ref`/`computed`/`useQuery` is a clean, explicit alternative to React hooks |
| **Banker's rounding** | Standard `Math.round` introduces consistent upward bias in financial calculations - `roundHalfEven` is the correct approach |
| **Vitest mocking** | `vi.mock` lets you stub any module import so service-layer logic can be tested without a real database |
