# Agent Guidelines

Welcome to the `ketab-online-sdk` repository. This document captures the conventions that keep the SDK predictable and easy to maintain.

## Repository layout

- `src/index.ts` exposes the public API (`downloadBook`, `getBookIndex`, `getBooks`, etc.). All TypeScript helpers must be documented with JSDoc.
- `src/types.ts` contains all TypeScript type definitions for API requests and responses.
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
- **Biome** handles formatting and linting. Run `bun run lint` (or `bun run format`) before committing. The formatter is configured for 4-space indentation and a max width of 120 columns.
- `bun test` runs the entire unit suite. Add focused tests for each exported helper and keep mocks inside the corresponding test files.
- Long-running or networked tests should go under `testing/` and default to `test.skip` unless explicitly requested.

## Coding conventions

- Prefer async/await over raw promises and keep the public API fully typed.
- Surface errors with descriptive messages (e.g., `Author 42 not found`).
- Any new helper must ship with JSDoc, unit coverage, and README updates describing the user-facing capability.
- Update `README.md` when changing the public API, supported tooling, or workflows so end users stay informed.
- All unit tests must use the `it('should...')` convention for test names to ensure descriptive and consistent test output.
- Test files should be colocated with their corresponding source files (e.g., `network.ts` and `network.test.ts`).

## Type definitions

- All API request and response types are defined in `src/types.ts`.
- Export types that consumers may need to import (e.g., `BookIndexEntry`, `BookIndexOptions`, `BookInfo`).
- Use JSDoc to document all exported types and their fields.
- Keep internal types (not exposed in the public API) unexported.

## API conventions

- Function names should be descriptive and follow the pattern: `getXxx`, `downloadXxx`, etc.
- Options parameters should be optional and have sensible defaults.
- Use destructuring with defaults for options: `{ isRecursive = false, part = 1 }: BookIndexOptions = {}`
- Always handle error responses from the API and throw descriptive errors.
- Clean response data with `removeFalsyValues` when appropriate to remove null/undefined fields from API responses.

## Adding new endpoints

When adding support for a new API endpoint:

1. **Add type definitions** in `src/types.ts`:
   - Request options type (if the endpoint accepts parameters)
   - Response type with all fields documented
   - Any nested types used in the response

2. **Implement the function** in `src/index.ts`:
   - Add JSDoc with description, parameters, return type, and usage examples
   - Use `buildUrl` for constructing URLs with query parameters
   - Use `httpsGet` for making HTTP requests
   - Handle error cases (404, etc.) with descriptive error messages
   - Apply `removeFalsyValues` if the API returns optional fields

3. **Write tests** in `src/index.test.ts`:
   - Mock the `httpsGet` function
   - Test success cases with valid responses
   - Test error cases (404, network errors, etc.)
   - Use the `it('should...')` convention for all test names

4. **Update documentation**:
   - Add the new function to the API table in `README.md`
   - Include usage examples if the function has non-trivial options
   - Update `AGENTS.MD` if the addition introduces new patterns or conventions

## Testing best practices

- Use `it('should...')` for all test names (not `test()`)
- Mock external dependencies (network, filesystem) at the module level using `mock.module()`
- Use `beforeEach` to reset mocks and set up test state
- Do NOT use `afterAll` to restore mocks - `mock.module()` returns a Promise, not a cleanup function
- Test both success and failure paths
- Use descriptive assertions that make failures easy to diagnose
- For async operations, use `await expect(...).resolves/rejects`
- When tests pass in isolation but fail in the suite, check for mock pollution between test files - ensure mocks are properly isolated per file

## Mock module pattern

The correct pattern for mocking modules in Bun:
```typescript
// Declare mock functions
const mockFn = mock();

// Mock the module (returns a Promise, not a cleanup function)
mock.module('./some-module', () => ({
    someFunction: mockFn,
}));

// Import after mocking
const { myFunction } = await import('./index');

// Reset in beforeEach
beforeEach(() => {
    mockFn.mockReset();
    // Set up default behavior
});

// No afterAll cleanup needed - mocks are automatically scoped
```

## Current API coverage

The SDK currently provides access to:

- **Books**: `getBookInfo`, `getBooks`, `getBookContents`, `getBookIndex`, `downloadBook`
- **Authors**: `getAuthorInfo`, `getAuthors`
- **Categories**: `getCategoryInfo`, `getCategories`

All endpoints support the standard ketabonline.com API parameters including pagination, filtering, and sorting where applicable.

## Known patterns

- **Pagination**: Use `page`, `limit` parameters and optional `query` for search
- **Filtering**: Use `is_active`, `is_deleted` parameters (0 or 1)
- **Sorting**: Use `sort_field` and `sort_direction` parameters
- **Hierarchical data**: The `is_recursive` parameter (0 or 1) controls whether nested structures include children
- **Part selection**: Multi-volume works use the `part` parameter to specify which volume

Thanks for helping keep the project healthy!