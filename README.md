# ketab-online-sdk

[![wakatime](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/5cb69094-5075-4207-bbc6-2edda0154865.svg)](https://wakatime.com/badge/user/a0b906ce-b8e7-4463-8bce-383238df6d4b/project/5cb69094-5075-4207-bbc6-2edda0154865)
[![E2E](https://github.com/ragaeeb/ketab-online-sdk/actions/workflows/e2e.yml/badge.svg)](https://github.com/ragaeeb/ketab-online-sdk/actions/workflows/e2e.yml) [![Node.js CI](https://github.com/ragaeeb/ketab-online-sdk/actions/workflows/build.yml/badge.svg)](https://github.com/ragaeeb/ketab-online-sdk/actions/workflows/build.yml)
![GitHub License](https://img.shields.io/github/license/ragaeeb/ketab-online-sdk)
![GitHub Release](https://img.shields.io/github/v/release/ragaeeb/ketab-online-sdk)
[![codecov](https://codecov.io/gh/ragaeeb/ketab-online-sdk/graph/badge.svg?token=TDCE341AX4)](https://codecov.io/gh/ragaeeb/ketab-online-sdk)
[![Size](https://deno.bundlejs.com/badge?q=ketab-online-sdk@latest)](https://bundlejs.com/?q=ketab-online-sdk%40latest)
![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=blue)
![npm](https://img.shields.io/npm/v/ketab-online-sdk)
![npm](https://img.shields.io/npm/dm/ketab-online-sdk)
![GitHub issues](https://img.shields.io/github/issues/ragaeeb/ketab-online-sdk)
![GitHub stars](https://img.shields.io/github/stars/ragaeeb/ketab-online-sdk?style=social)

SDK to access the public APIs exposed by [ketabonline.com](https://ketabonline.com). The library provides
helpers to download raw book data, inspect authors and categories, retrieve table of contents, and search for titles without having to reverse engineer the HTTP endpoints yourself.

## Installation

Install the package with the package manager of your choice. The project is developed with Bun, but the
published package works from any Node.js runtime that satisfies the `engines` requirement.
```bash
# bun
bun add ketab-online-sdk

# npm
npm install ketab-online-sdk

# yarn
yarn add ketab-online-sdk
```

## Usage
```ts
import {
    downloadBook,
    getAuthorInfo,
    getBookContents,
    getBookIndex,
    getBookInfo,
    getBooks,
    getCategoryInfo,
} from 'ketab-online-sdk';

// Retrieve summary information about a book
const book = await getBookInfo(123);

// Search for books with pagination helpers
const books = await getBooks({ query: 'الفقه', page: 1, limit: 10 });

// Get the table of contents for a book
const index = await getBookIndex(67768, { isRecursive: true, part: 1 });

// Download a book bundle to disk for offline reading
const outputPath = await downloadBook(123, './book.json');
```

### API surface

| Function | Description |
| --- | --- |
| `downloadBook(id, outputFile)` | Downloads the archived JSON bundle for a book and stores it locally. |
| `getAuthorInfo(id)` | Returns sanitized author metadata, removing falsy fields the API sometimes includes. |
| `getAuthors(options)` | Lists authors with optional pagination, sorting and search query parameters. |
| `getBookContents(id)` | Fetches, extracts and parses the JSON payload that contains full book contents. |
| `getBookIndex(id, options)` | Retrieves the table of contents index for a specific book with optional hierarchical structure. |
| `getBookInfo(id)` | Retrieves summary information for a book, including publication metadata. |
| `getBooks(options)` | Lists books with optional pagination, sorting and search query parameters. |
| `getCategories(options)` | Lists categories with optional pagination and filtering. |
| `getCategoryInfo(id)` | Fetches metadata for a category, including book counters. |

### Book Index Options

The `getBookIndex` function supports two modes:

**Flat mode (default):**
```ts
const index = await getBookIndex(67768);
// Returns flat array of index entries
```

**Hierarchical mode:**
```ts
const index = await getBookIndex(67768, { isRecursive: true });
// Returns nested structure with children property
```

You can also specify the part number:
```ts
const index = await getBookIndex(67768, { part: 2, isRecursive: true });
```

Every helper throws an error when the upstream API answers with an error status, so you can rely on normal
`try { ... } catch (error) { ... }` flow control.

## Development

The repository is managed with [Bun](https://bun.sh/) and uses [Biome](https://biomejs.dev/) and
[tsdown](https://github.com/thetarnav/tsdown).
```bash
bun install            # install dependencies
bun run build          # build the library with tsdown
bun test               # run the bun:test based unit suite
bun run lint           # type-check, lint and format with biome
```

To release new functionality run the build, lint and test commands locally before opening a pull request.

### Project structure

- `src/index.ts` – exports the SDK helpers (`downloadBook`, `getBooks`, `getBookIndex`, etc.).
- `src/types.ts` – TypeScript type definitions for all API requests and responses.
- `src/utils/common.ts` – shared transforms such as `removeFalsyValues`.
- `src/utils/io.ts` – filesystem helpers that handle temporary directories and ZIP extraction.
- `src/utils/network.ts` – wrapper utilities around HTTPS requests and URL construction.
- `testing/e2e.test.ts` – optional integration smoke test that hits the real API (skipped in CI by default).
- `tsdown.config.ts` – the bundler entry that targets modern Node runtimes and emits ESM + type definitions.

Keep documentation and tests close to the source files. Any new public helper should include:

1. JSDoc explaining the parameters and return values.
2. A bun:test unit suite demonstrating success and failure conditions.
3. README updates so downstream consumers know how to use the addition.

## Testing

Unit tests use the `it('should...')` convention for descriptive test names. Run tests with:
```bash
bun test
```

For end-to-end testing against the live API:
```bash
bun run e2e
```