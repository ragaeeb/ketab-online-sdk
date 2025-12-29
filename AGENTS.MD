# Agent Guidelines

Welcome to the `ketab-online-sdk` repository. This document captures the conventions that keep the SDK predictable and easy to maintain.

## Repository layout

- `src/index.ts` exposes the browser-compatible public API (`getBookIndex`, `getBooks`, `getBookContents`, etc.). All TypeScript helpers must be documented with JSDoc.
- `src/node.ts` exposes Node.js-only functions (`downloadBook`) and re-exports everything from `index.ts`. This is a separate entry point for consumers who need filesystem operations.
- `src/types.ts` contains all TypeScript type definitions for API requests and responses.
- `src/utils/` contains shared utilities:
  - `common.ts` – data transforms such as `removeFalsyValues`.
  - `io.ts` – in-memory ZIP extraction using `fflate` (`unzipFromUrl`). Browser-compatible.
  - `network.ts` – HTTP helpers using the Fetch API (`httpsGet`, `buildUrl`). Browser-compatible.
- `testing/e2e.test.ts` exercises the remote API. It is skipped in CI but useful for manual verification.
- `tsdown.config.ts` defines the bundler options with dual entry points (`src/index.ts`, `src/node.ts`).
- Tooling configs (`biome.json`, `tsconfig.json`, `release.config.mjs`) live at the repo root.

## Browser compatibility

The SDK is designed to work in browsers and modern JavaScript runtimes:

- **Main entry (`ketab-online-sdk`)**: Uses the Fetch API and `fflate` for in-memory ZIP extraction. No Node.js-specific APIs.
- **Node entry (`ketab-online-sdk/node`)**: Adds `downloadBook` which requires `node:fs/promises`. Re-exports everything from the main entry for convenience.

When modifying the codebase:
- Keep `src/index.ts` free of Node.js-specific imports (`node:fs`, `node:os`, `node:path`, `node:https`, etc.)
- Place Node.js-only functionality in `src/node.ts`
- The `src/utils/` files should remain browser-compatible

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

## Mocking global fetch

When testing code that uses `fetch()` directly (like `httpsGet` in `network.ts`), you need special handling:

```typescript
// Store original fetch
const originalFetch = globalThis.fetch;

afterEach(() => {
    // Restore after each test
    globalThis.fetch = originalFetch;
});

it('should handle JSON responses', async () => {
    // Create mock BEFORE importing the module
    globalThis.fetch = mock(async () =>
        new Response(JSON.stringify({ success: true }), {
            headers: { 'content-type': 'application/json' },
        }),
    );

    // Use cache-busting query param to get fresh module import
    const networkModule = await import('./network?test-json');
    const result = await networkModule.httpsGet('https://example.com');

    expect(result).toEqual({ success: true });
});
```

**Key insight**: Bun caches dynamic imports. Use unique query params (e.g., `?test-name`) to bust the cache when you need a fresh module instance with different mock behavior.

## Key dependencies

- **fflate**: Used for in-memory ZIP extraction. This is a pure JavaScript library that works in browsers without any polyfills. The `unzipSync` function takes a `Uint8Array` and returns an object mapping filenames to their contents as `Uint8Array`.

- **Fetch API**: Used for all HTTP requests via `httpsGet`. This is natively available in browsers, Node.js 18+, Deno, and Bun. No polyfill needed for modern runtimes.

## Current API coverage

The SDK currently provides access to:

- **Books**: `getBookInfo`, `getBooks`, `getBookContents`, `getBookIndex`
- **Books (Node.js only)**: `downloadBook` (via `ketab-online-sdk/node`)
- **Authors**: `getAuthorInfo`, `getAuthors`
- **Categories**: `getCategoryInfo`, `getCategories`

All endpoints support the standard ketabonline.com API parameters including pagination, filtering, and sorting where applicable.

## Known patterns

- **Pagination**: Use `page`, `limit` parameters and optional `query` for search
- **Filtering**: Use `is_active`, `is_deleted` parameters (0 or 1)
- **Sorting**: Use `sort_field` and `sort_direction` parameters
- **Hierarchical data**: The `is_recursive` parameter (0 or 1) controls whether nested structures include children
- **Part selection**: Multi-volume works use the `part` parameter to specify which volume

## Data flow for book contents

Understanding how book data flows through the SDK:

1. **Download**: `httpsGet` fetches the ZIP file as `Uint8Array` via Fetch API
2. **Extract**: `fflate.unzipSync` extracts the ZIP in memory, returning `{ [filename]: Uint8Array }`
3. **Decode**: `TextDecoder.decode()` converts the `Uint8Array` to a UTF-8 string
4. **Parse**: `JSON.parse()` converts the string to a JavaScript object

All of these operations are browser-compatible. The only Node.js-specific operation is `fs.writeFile` in `downloadBook`, which is why that function lives in `src/node.ts`.

Thanks for helping keep the project healthy!