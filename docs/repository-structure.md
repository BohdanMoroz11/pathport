# Repository Structure

Pathport uses a pnpm workspace monorepo with separate frontend and backend applications.

## Applications

- `apps/web`: Next.js App Router frontend.
- `apps/api`: NestJS backend API.

## Packages

- `packages/contracts`: shared request/response types and future API schemas.
- `packages/config`: shared configuration helpers.
- `packages/db`: database schema, migrations, and data-access primitives.

## Root Files

- `package.json`: workspace scripts and shared development dependencies.
- `pnpm-workspace.yaml`: workspace package map.
- `tsconfig.base.json`: shared TypeScript defaults.
- `biome.json`: shared formatting and linting configuration.
- `.env.example`: documented environment variables.

Workspace commands live in the [README scripts table](../README.md#scripts).
