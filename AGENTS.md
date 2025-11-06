# Repository Guidelines

## Project Structure & Module Organization
The `app/` directory uses the Next.js App Router; segment folders like `app/(main)/` and `app/(auth)/` isolate dashboard and auth flows. UI building blocks live in `components/`, with shared hooks in `hooks/` and React context providers in `contexts/`. Drizzle ORM schemas, migrations, and scripts reside under `db/`, while reusable domain logic sits in `lib/` and strongly typed contracts in `types/`. Static assets belong in `public/`, and Tailwind configuration lives alongside `globals.css` in `app/`.

## Build, Test, and Development Commands
Run `pnpm dev` for the local Next.js server. Use `pnpm build` to produce a production bundle; it triggers `pnpm db:migrate` via the `postbuild` hook so migrations are applied automatically. Execute `pnpm lint` before submitting changes to ensure the codebase passes the Next.js ESLint ruleset. Database workflows rely on Drizzle: `pnpm db:generate` emits SQL from the TypeScript schema, `pnpm db:migrate` applies pending migrations, and `pnpm db:clear-cache` resets cached repository metadata for local debugging.

## Coding Style & Naming Conventions
Favor TypeScript-first React components with functional patterns and server actions in `lib/actions`. Follow the existing lint configuration (two-space indentation, trailing commas where practical, double quotes in JSX) and rely on Tailwind utility classes for layout work. Name component files using kebab-case (for example, `repo-select.tsx`) and export components in PascalCase. Keep shared helpers pure and colocate UI variants beside their primary implementation to minimize cross-module coupling.

## Testing Guidelines
Automated tests are not yet established; when you introduce them, co-locate component or hook tests under a `__tests__/` folder or alongside the source file. Prefer Testing Library patterns for UI behavior and mock Drizzle calls via lightweight fixtures. At minimum, run `pnpm lint` and manually exercise critical flows—authentication, repository selection, template creation—before opening a pull request. Document any new test commands in `package.json` so future contributors can adopt them.

## Commit & Pull Request Guidelines
The git history follows Conventional Commits (`feat:`, `fix:`, `chore:`). Keep scope concise (e.g., `feat: add sidebar filters`) and describe user-facing impact in the body. Pull requests should link to the relevant issue, summarize behavior changes, and call out schema migrations or new environment variables. Include before/after screenshots for UI work and note any manual verification steps so reviewers can confirm the changes quickly.
