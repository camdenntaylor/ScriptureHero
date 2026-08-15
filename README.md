# Scripture Hero

Teaching the world about Jesus, one verse at a time.

This repository contains the first working full-stack skeleton for Scripture Hero. The product is mobile-first: the current React web app is the first client, a dedicated mobile app is a long-term goal, and desktop web remains supported.

## Stack

- Current web client: React, TypeScript, and Vite
- Future client: a dedicated mobile application sharing backend APIs and contracts with the web client
- Backend: Fastify and TypeScript
- Architecture: MVC-style feature boundaries with controller, service, model, repository, and view layers
- Recommended hosted platform: Supabase (Postgres, Auth, Storage, Realtime, and Edge Functions)

The backend currently uses an in-memory repository so local development works without credentials. A Supabase repository can implement the existing `PostRepository` interface when the initial schema is agreed.

## Product targets

- Design phone-sized experiences first, then enhance layouts for tablets and desktop.
- Keep domain rules and API contracts independent of React DOM and browser-only APIs so a native mobile client can reuse them.
- Treat unreliable networks, media bandwidth, touch interaction, deep links, and eventual push notifications as first-class constraints.
- Maintain functional support for desktop web without allowing desktop assumptions to drive the core experience.

## Run locally

Node.js 22 or newer and pnpm are recommended.

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173. The frontend dev server proxies `/api` requests to the backend at http://localhost:3000.

## Commands

```bash
pnpm dev        # start frontend and backend in watch mode
pnpm build      # build both applications
pnpm test       # run all tests
pnpm typecheck  # type-check both applications
```

Copy each `.env.example` to `.env` in its directory when local configuration is needed. Do not commit secrets or a Supabase secret key to the frontend.

## Layout

```text
frontend/src/
  controllers/  UI state and user-flow orchestration
  models/       frontend domain types
  services/     HTTP and external-service clients
  views/        React pages, components, and styles

backend/src/
  config/       validated runtime configuration
  controllers/  HTTP request/response adapters
  models/       domain entities and repository contracts
  repositories/ data access implementations
  routes/       HTTP route registration
  services/     application and business logic
```

See `AGENTS.md` for architecture, privacy, mobile-first design, and development rules.
