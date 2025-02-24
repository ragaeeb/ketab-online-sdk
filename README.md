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

# ketab-online-sdk

SDK to access ketabonline.com APIs.

## Installation

To install ketab-online-sdk, use npm or yarn:

```bash
npm install ketab-online-sdk
# or
yarn add ketab-online-sdk
# or
pnpm i ketab-online-sdk
```

## Usage

### Importing the SDK

```javascript
import { getBookInfo, getBookContents, downloadBook } from 'ketab-online-sdk';
```

### Get Book Information

Retrieve metadata about a specific book.

```javascript
(async () => {
    try {
        const bookInfo = await getBookInfo(123);
        console.log(bookInfo);
    } catch (error) {
        console.error(error.message);
    }
})();
```

### Get Author Information

Fetch information about an author.

```javascript
(async () => {
    try {
        const authorInfo = await getAuthorInfo(123);
        console.log(authorInfo);
    } catch (error) {
        console.error(error.message);
    }
})();
```

### Get Category Information

Fetch information about a category.

```javascript
(async () => {
    try {
        const categoryInfo = await getCategoryInfo(123);
        console.log(categoryInfo);
    } catch (error) {
        console.error(error.message);
    }
})();
```

### Get Book Contents

Fetch the contents of a book, including chapters and sections.

```javascript
(async () => {
    try {
        const bookContents = await getBookContents(123);
        console.log(bookContents);
    } catch (error) {
        console.error(error.message);
    }
})();
```

### Download Book

Download a book's data to a local file.

```javascript
(async () => {
    try {
        const outputFilePath = await downloadBook(123, './book.json');
        console.log(`Book downloaded to ${outputFilePath}`);
    } catch (error) {
        console.error(error.message);
    }
})();
```
