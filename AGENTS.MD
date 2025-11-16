# Agent Guidelines

Welcome to the `ketab-online-sdk` repository. This document captures the conventions that keep the SDK predictable and easy to maintain.

## Repository layout

- `src/index.ts` exposes the public API (`downloadBook`, `getBooks`, etc.). All TypeScript helpers must be documented with JSDoc.
- `src/utils/` contains shared utilities:
  - `common.ts` – data transforms such as `removeFalsyValues`.
  - `io.ts` – filesystem helpers (`createTempDir`, `unzipFromUrl`).
  - `network.ts` – HTTP helpers (`httpsGet`, `buildUrl`).
- `testing/e2e.test.ts` exercises the remote API. It is skipped in CI but useful for manual verification.
- `tsdown.config.ts` defines the bundler options. Update it whenever the build target or entry points change.
- Tooling configs (`biome.json`, `tsconfig.json`, `release.config.mjs`) live at the repo root.

## Tooling & workflow

- Use **Bun** for everything: `bun install`, `bun update --latest`, `bun run build`, and `bun test`.
- Builds are powered by **tsdown**. Keep its configuration aligned with the latest [tsdown docs](https://github.com/rolldown/tsdown) and make sure the bundle targets modern Node runtimes.
- **Biome** handles formatting and linting. Run `bun run lint` (or `bun run format`) before committing. The formatter is configured for 4-space indentation and a max width of 110 columns.
- `bun test` runs the entire unit suite. Add focused tests for each exported helper and keep mocks inside the corresponding test files.
- Long-running or networked tests should go under `testing/` and default to `test.skip` unless explicitly requested.

## Coding conventions

- Prefer async/await over raw promises and keep the public API fully typed.
- Surface errors with descriptive messages (e.g., `Author 42 not found`).
- Any new helper must ship with JSDoc, unit coverage, and README updates describing the user-facing capability.
- Update `README.md` when changing the public API, supported tooling, or workflows so end users stay informed.

Thanks for helping keep the project healthy!
