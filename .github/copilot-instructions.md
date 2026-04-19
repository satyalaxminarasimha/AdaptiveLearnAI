# Project Guidelines

## Code Style
- Use TypeScript, React 19, and the Next.js App Router patterns already present in `src/app`.
- Match the existing style in the codebase: single quotes, semicolons, small focused components, and `@/` imports.
- Prefer the existing UI primitives in `src/components/ui` and the established Tailwind/Radix approach instead of introducing new UI systems.
- Keep the visual language aligned with [docs/blueprint.md](docs/blueprint.md) and the app shell in [src/app/layout.tsx](src/app/layout.tsx): Inter font, purple primary color, light gray backgrounds, and restrained motion.

## Architecture
- The app is split into App Router pages in `src/app`, API routes in `src/app/api`, shared helpers in `src/lib`, database models in `src/models`, and Genkit flows in `src/ai/flows`.
- Authentication is JWT-based. [middleware.ts](middleware.ts) protects `/dashboard/*` and most `/api/*` routes, while `/api/auth/*` stays public.
- Use `jose` in middleware for edge compatibility and the existing auth helpers in [src/lib/auth.ts](src/lib/auth.ts) for server-side token handling.
- Database access should go through the cached MongoDB connector in [src/lib/mongodb.ts](src/lib/mongodb.ts) and the Mongoose models under [src/models](src/models).
- AI logic belongs in Genkit flows; client components should call the relevant API route instead of invoking flows directly.
- AI endpoints already use rate limiting in [src/lib/rate-limit.ts](src/lib/rate-limit.ts). Preserve that pattern when adding or changing AI-facing routes.
- The main domain rules and entity relationships are documented in [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md); link there instead of re-explaining the schema here.

## Build and Test
- `npm run dev` starts Next.js on port 9002 with Turbopack.
- `npm run build` creates the production build.
- `npm run start` runs the production server.
- `npm run lint` runs the project lint check.
- `npm run typecheck` runs TypeScript validation.
- `npm run genkit:dev` and `npm run genkit:watch` run the Genkit flows during AI work.
- `npm run create-admin` and `npm run seed` are repository utilities for local data setup.

## Conventions
- Treat `/api/auth/*` as the only public API surface by default; other API routes are expected to enforce auth.
- When changing auth, middleware, or dashboard routes, verify both cookie and `Authorization` header token paths still work.
- Do not assume TypeScript errors block deployment; the repo currently tolerates build-time type errors in `next.config.ts`, so run `npm run typecheck` explicitly when changing shared types.
- Keep role-based behavior aligned with the existing `student`, `professor`, and `admin` model.
- Prefer updating existing docs in [docs/](docs/) when a concept is already documented there rather than duplicating it in instructions.
- If you need project context beyond these guidelines, check [README.md](README.md), [AI_TUTOR_FIX_SUMMARY.md](AI_TUTOR_FIX_SUMMARY.md), and [ATTEMPTED_QUIZZES_FEATURE.md](ATTEMPTED_QUIZZES_FEATURE.md).