## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Structure

- `src/app`: Next.js routing adapters and root layouts only
- `src/features`: feature-owned screens, components, hooks, and auth logic
- `src/shared`: cross-feature UI, providers, shared types, and shared errors
- `src/database`: Drizzle database connection and schema
- `drizzle`: generated SQL migrations and metadata

## Current Features

- `auth`: passkey registration, login, logout, and session verification
- `pdf-merge`: client-side PDF merge tool behind authenticated routes
- `home`: top page that switches content based on session state
- `about`: standalone about screen

## Deployment Notes

This project uses Drizzle SQL migrations stored in `drizzle`.

- Generate a new migration after schema changes: `bunx drizzle-kit generate`
- Apply pending migrations locally or in production: `bun run db:migrate`
- For Dokploy with Nixpacks, set `NIXPACKS_START_CMD="bun run db:migrate && bun run start"`

## Static Assets

- Works assets are resolved through `NEXT_PUBLIC_ASSET_BASE_URL`.
- `NEXT_PUBLIC_ASSET_BASE_URL` is required in development and production.
- Works images use `next/image` remote optimization against the configured asset domain.
- For Cloudflare R2 migration, upload files with stable keys such as `works/hello_mate-cover.png` and point `NEXT_PUBLIC_ASSET_BASE_URL` at the public CDN domain for the bucket.
- Recommended rollout:
  - upload assets to R2 first
  - set `Cache-Control` on uploaded objects
  - configure the public/custom domain
  - set `NEXT_PUBLIC_ASSET_BASE_URL`
  - verify production responses, then remove duplicated files from `public/`
