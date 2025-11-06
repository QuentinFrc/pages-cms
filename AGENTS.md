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


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npx ultracite fix`
- **Check for issues**: `npx ultracite check`
- **Diagnose setup**: `npx ultracite doctor`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `npx ultracite fix` before committing to ensure compliance.
