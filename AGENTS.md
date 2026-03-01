# AGENTS.md

Guidance for agentic coding agents working in this repository.

## Project Overview

A serverless URL shortener. The `web/` directory is a **Nuxt 4** app that builds to an AWS Lambda bundle via Nitro's `aws-lambda` preset. The `infra/` directory is an **AWS CDK v2** project that deploys the Lambda + Function URL.

```
irl/
├── web/        # Nuxt 4 frontend + Nitro server (deployed to Lambda)
│   ├── app/
│   │   ├── composable/   # Vue composables (e.g. axios API client)
│   │   └── pages/        # Vue Router pages
│   ├── server/api/       # Nitro server API route handlers
│   └── types/            # Shared TypeScript interfaces
├── infra/      # AWS CDK infrastructure
│   ├── bin/    # CDK app entrypoint
│   ├── lib/    # CDK Stack definitions
│   └── test/   # Jest tests
├── flake.nix   # Nix dev environment (Node.js, TypeScript, AWS CLI)
└── package.json  # Root — mirrors infra/ scripts
```

## Package Manager

**npm** — always use `npm`, never `yarn`, `pnpm`, or `bun`. Lock files are `package-lock.json`.

Each subproject manages its own dependencies:
- Root / `infra/`: `npm install` at repo root
- `web/`: `npm install` inside `web/`

## Build Commands

### Web (Nuxt 4)
```bash
# Development server
cd web && npm run dev

# Production build (outputs to web/.output/server for Lambda)
cd web && npm run build

# Generate static site
cd web && npm run generate

# Preview production build
cd web && npm run preview
```

### Infra (AWS CDK)
```bash
# Compile TypeScript
npm run build          # runs tsc

# Watch mode
npm run watch          # runs tsc -w

# CDK operations
npm run cdk -- diff
npm run cdk -- deploy
npm run cdk -- synth
```

## Test Commands

Tests only exist in `infra/`. The framework is **Jest** with **ts-jest**.

```bash
# Run all tests (from repo root or infra/)
npm test

# Run a single test file
npx jest test/shorl.test.ts

# Run a single test by name pattern
npx jest --testNamePattern="SQS Queue Created"

# Run with verbose output
npx jest --verbose
```

Test files live in `infra/test/` and must be named `*.test.ts`.

There are no tests in `web/` — add them under `web/test/` if needed.

## TypeScript

### infra/ (`infra/tsconfig.json`)
- Target: `ES2020`, module system: `CommonJS`
- **Strict mode enabled**: `strict`, `noImplicitAny`, `strictNullChecks`, `noImplicitReturns`
- `strictPropertyInitialization: false` (CDK pattern — acceptable)
- `noUnusedLocals/Parameters: false`
- Compiled `.js` + `.d.ts` artifacts are committed alongside `.ts` sources

### web/ (`web/tsconfig.json`)
- Delegates to Nuxt-generated configs in `.nuxt/` — not committed
- Uses ESM (`"type": "module"` in `web/package.json`)
- Vue SFCs use `<script setup lang="ts">`

Always use `import type { ... }` for type-only imports.

## Code Style

No linter or formatter is configured. Follow the conventions present in the codebase:

### Formatting
- 2-space indentation (TypeScript and Vue files)
- No trailing semicolons in Vue/Nuxt files (server files omit them too)
- Single quotes in `infra/`, double quotes in `web/`
- Opening braces on the same line

### Naming Conventions
| Entity | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `irl-stack.ts`, `insert.post.ts` |
| Vue pages / dynamic routes | `kebab-case`, brackets for params | `[id].vue` |
| Classes (CDK) | `PascalCase` | `IrlStack` |
| CDK construct IDs | `PascalCase` strings | `'Main'`, `'MainUrl'` |
| Interfaces / Types | `PascalCase` | `SendUrlResponse` |
| Functions | `camelCase` | `sendUrl`, `clickShort` |
| Variables / refs | `camelCase` | `userUrl`, `output` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `API_URL` |

### Imports
- CDK packages: namespace imports — `import * as cdk from 'aws-cdk-lib'`
- Named class imports: `import { Construct } from 'constructs'`
- Type-only imports: `import type { SendUrlResponse } from '../../types'`
- Default exports for composables and Nitro event handlers
- Use explicit `.ts` extensions in Vue/Nuxt imports: `import api from '../composable/api.ts'`
- No path aliases — use relative paths

### Vue / Nuxt
- Use `<script setup lang="ts">` (Composition API) — no Options API
- Nuxt/Vue auto-imports (`ref`, `useRoute`, `navigateTo`, `defineEventHandler`, `readBody`) do not need explicit imports
- Prefer `defineEventHandler` for all Nitro server routes
- Return typed response objects from API handlers: `const response: SendUrlResponse = { ... }`

### CDK / Infra
- One Stack per file in `lib/`
- Props interface optional for simple stacks (`props?: cdk.StackProps`)
- Use `cdk.CfnOutput` to expose important resource URLs/ARNs

## Error Handling

The codebase is early-stage and currently lacks error handling. When adding features:
- Wrap `async` calls in `try/catch` and surface errors to the user
- Validate request bodies in Nitro handlers before using them
- Check for `null` before using `localStorage.getItem(...)` results
- Do not swallow errors silently

## Architecture Notes

- The URL mapping is currently stored in **`localStorage`** (client-side only, no database)
- The Nitro Lambda handler resolves both frontend routes and `/api/*` routes
- The `web/.output/server/` directory (built output) is what CDK deploys — always run `cd web && npm run build` before deploying infra
- The Lambda Function URL has `authType: NONE` — it is intentionally public for now
- `infra/` compiled JS artifacts (`bin/irl.js`, `lib/irl-stack.js`) are committed — always run `npm run build` in root/infra after editing `.ts` files there
