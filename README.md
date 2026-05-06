# InvoiceHub — Full-Stack Invoice Management System

A full-stack invoice management application built as a take-home assignment. It supports creating invoices, listing them with pagination, updating statuses, and downloading PDF exports.

---

## Folder Structure

```
omazons-invoice/
├── apps/
│   ├── api/                  # Fastify REST API (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   └── invoices/ # Routes, schemas, service layer
│   │   │   ├── pdf/          # PDF generation (react-pdf/renderer)
│   │   │   ├── plugins/      # Prisma plugin
│   │   │   └── app.ts        # Fastify app setup + Swagger docs
│   │   └── prisma/
│   │       └── schema.prisma # DB schema (Invoice, LineItem, InvoiceCounter)
│   └── web/                  # Next.js 16 frontend (React 19)
│       └── src/
│           ├── app/          # Next.js App Router pages
│           ├── components/   # shadcn/ui + feature components
│           └── api/          # Axios API client layer
├── packages/
│   └── shared/               # Shared Zod schemas + TypeScript types
├── docker-compose.yml        # PostgreSQL 16 service
├── turbo.json                # Turborepo task pipeline
└── pnpm-workspace.yaml       # pnpm monorepo config
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| State / Data Fetching | TanStack React Query, React Hook Form |
| Backend | Fastify 5 (TypeScript) |
| ORM | Prisma 7 + PostgreSQL adapter |
| Database | PostgreSQL 16 |
| Validation | Zod (shared across frontend + backend) |
| PDF Generation | @react-pdf/renderer |
| Monorepo | Turborepo + pnpm workspaces |
| Containerization | Docker Compose |

---

## How to Run

### Prerequisites

- [Docker](https://www.docker.com/) (for PostgreSQL)
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`

### Steps

**1. Clone and enter the repo**

```bash
git clone <repo-url>
cd omazons-invoice
```

**2. Start the database**

```bash
docker compose up -d
```

This spins up PostgreSQL 16 on port `5432` with database `omazons_invoice`.

**3. Set up environment variables**

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/omazons_invoice"
```

**4. Install dependencies and run migrations**

```bash
pnpm install
cd apps/api && npx prisma migrate dev && cd ../..
```

**5. Start everything**

```bash
pnpm dev
```

Turborepo runs both apps in parallel:

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend API (Fastify) | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/docs |

> A single `pnpm install && pnpm dev` (after `docker compose up -d`) brings up the entire stack. Turborepo ensures `packages/shared` is built before the apps start.

---

## What I'd Do Differently With Another 3 Hours

- **Authentication system** — Add JWT-based auth with refresh tokens, protect all invoice routes, and introduce DTOs to cleanly separate API contracts from internal models.
- **Deployment** — Containerize the API with a multi-stage Dockerfile, add a `docker-compose.prod.yml`, and set up a basic CI/CD pipeline (GitHub Actions) to lint, type-check, and build on every push.
- **End-to-end tests** — Add Playwright tests for the critical flows (create invoice → download PDF → update status) since the app currently has no automated test coverage.
- **Error handling** — Centralize error handling in Fastify with a proper error plugin and return consistent problem+json shaped responses instead of ad-hoc error objects.

---

## Tradeoffs Made and Why

**1. Shared Zod schemas across frontend and backend**
Zod schemas live in `packages/shared` and are consumed by both apps. This keeps validation logic in sync and avoids duplicating TypeScript types. The tradeoff is that the frontend now has a build dependency on the shared package — any schema change requires rebuilding shared first (Turborepo handles this automatically with `"dependsOn": ["^build"]`).

**2. Fastify over Express**
Fastify is significantly faster, has first-class TypeScript support, and the `@fastify/type-provider-zod` plugin makes type-safe route validation effortless. The tradeoff is a steeper learning curve and a smaller ecosystem of community plugins compared to Express.

**3. No authentication**
Auth was skipped to focus on the core invoice domain within the time constraint. Adding it later is clean because the Fastify plugin system makes it straightforward to register a JWT guard as a preHandler hook on any route set.

**4. Turborepo for monorepo orchestration**
Turborepo gives dependency-aware parallel builds and remote caching out of the box. For a two-app monorepo this may feel like over-engineering, but it pays off immediately the moment a third package is added, and the setup cost is minimal.

---

## One Thing I'd Push Back On

**Storing PDF generation in the API layer.**

The current implementation generates PDFs on-the-fly in the API server using `@react-pdf/renderer` (which embeds React as a dependency in the backend). For a real product, I'd push back on this and move PDF generation to a dedicated background job — triggered asynchronously after invoice creation, stored in object storage (S3), and served via a pre-signed URL. Generating PDFs synchronously on an HTTP request is slow, blocks the event loop, and doesn't scale well under concurrent load.

---

## What I Learned

This project was my first hands-on experience with **Fastify in TypeScript**, **Prisma + PostgreSQL**, and **Turborepo** in a real monorepo setup. Key takeaways:

| Technology | Benefit |
|---|---|
| **Fastify** | Schema-first, blazing fast, TypeScript-native — feels like the modern Express |
| **Prisma** | Type-safe queries with zero boilerplate; migrations are a first-class citizen |
| **Turborepo** | Dependency-aware parallel builds with caching — monorepo management without the pain |
| **pnpm workspaces** | Strict, disk-efficient, and the natural fit for monorepos |
| **Zod (shared schemas)** | Single source of truth for validation that spans the entire stack |

Building this end-to-end — from database schema through API to a polished UI — in a short window reinforced how much productivity a well-chosen stack buys you. The combination of Fastify + Prisma + Next.js + Turborepo feels genuinely cohesive and is something I'd reach for again.
