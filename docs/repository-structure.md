# Repository Structure

Status: Draft

Pathport uses a pnpm workspace monorepo with separate frontend and backend applications.

## Applications

- `apps/web`: Next.js App Router frontend.
- `apps/api`: NestJS backend API.

## Packages

- `packages/contracts`: shared request/response types and future API schemas.
- `packages/config`: shared configuration helpers.
- `packages/db`: database schema, migrations, and data-access primitives.
- `packages/testing`: shared test utilities once repeated test setup appears.

## Root Files

- `package.json`: workspace scripts and shared development dependencies.
- `pnpm-workspace.yaml`: workspace package map.
- `tsconfig.base.json`: shared TypeScript defaults.
- `biome.json`: shared formatting and linting configuration.
- `.env.example`: documented environment variables.

## Local Development

Workspace commands:

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: run web and API apps together.
- `pnpm dev:web`: run the Next.js app.
- `pnpm dev:api`: run the NestJS API.
- `pnpm build`: build all workspaces.
- `pnpm typecheck`: typecheck all workspaces.
- `pnpm check`: run Biome checks.
- `pnpm test`: run workspace tests.
- `pnpm test:coverage`: run workspace tests with coverage.
- `pnpm test:e2e`: run Playwright tests.
- `pnpm lhci`: run Lighthouse CI.
- `pnpm --filter @pathport/db db:generate`: generate Drizzle migrations.
- `pnpm --filter @pathport/db db:migrate`: apply Drizzle migrations.
