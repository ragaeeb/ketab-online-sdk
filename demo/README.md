# Ketab Online SDK Demo

A full-featured demo application showcasing the [ketab-online-sdk](https://github.com/ragaeeb/ketab-online-sdk) library. Built with TanStack Start, React 19, and deployed to Cloudflare Pages.

**[Live Demo](https://demo.ketabonline.workers.dev/)**

## Features

- 📚 **Browse Categories** — View all book categories with search and pagination
- 📖 **Browse Books** — Search books, filter by category or author
- ✍️ **Browse Authors** — Explore authors with search and pagination  
- 📄 **Book Viewer** — Read book content with HTML/Markdown toggle
- 🔍 **Search** — Full-text search with URL state management
- 📱 **Responsive** — Dark theme with mobile-friendly design
- ⚡ **Server-Side Rendering** — Fast initial loads with TanStack Start
- 🔒 **CORS Bypass** — Server functions proxy API calls

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Package Manager**: [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) for deployment

### Development

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
bun run build
```

## Deploying to Cloudflare Pages

Follow these steps to deploy the demo to Cloudflare Pages:

### Step 1: Install Wrangler (if not already installed)

```bash
bun add -g wrangler
# or
npm install -g wrangler
```

### Step 2: Authenticate with Cloudflare

```bash
bunx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### Step 3: Build the Application

```bash
bun run build
```

This creates the production build in the `dist/` directory.

### Step 4: Deploy

```bash
bun run deploy
```

This runs `bunx wrangler deploy` which uploads and deploys your application to Cloudflare Pages.

### Step 5: Access Your Application

After deployment, Wrangler will output the URL of your deployed application. It will look something like:

```
https://ketabonline.<your-subdomain>.workers.dev
```

### Custom Domain (Optional)

To use a custom domain:

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → Your project
3. Go to **Custom Domains** tab
4. Add your custom domain

## Project Structure

```
demo/
├── src/
│   ├── routes/           # File-based routes
│   │   ├── __root.tsx    # Root layout with Header
│   │   ├── index.tsx     # Categories page (/)
│   │   ├── books.tsx     # Books list (/books)
│   │   ├── book.$id.tsx  # Book detail (/book/:id)
│   │   ├── authors.tsx   # Authors list (/authors)
│   │   └── author.$id.tsx # Author detail (/author/:id)
│   ├── server/
│   │   └── api.ts        # Server functions using SDK
│   ├── components/
│   │   └── Header.tsx    # Navigation header
│   └── styles.css        # Global styles with Tailwind
├── wrangler.jsonc        # Cloudflare configuration
├── vite.config.ts        # Vite + TanStack Start config
└── package.json
```

## Server Functions

The demo uses TanStack Start server functions to proxy SDK calls:

```typescript
// src/server/api.ts
import { createServerFn } from '@tanstack/react-start';
import { getCategories, getBooks, getAuthors } from 'ketab-online-sdk';

export const fetchCategories = createServerFn({ method: 'GET' })
    .inputValidator((params: ListParams) => params)
    .handler(async ({ data }) => {
        const categories = await getCategories({
            limit: data.limit,
            page: data.page,
            query: data.query,
        });
        return { data: categories, hasMore: categories.length >= data.limit };
    });
```

This approach:
- **Bypasses CORS** — API calls are made from the server, not the browser
- **Type-safe** — Full TypeScript support with input validation
- **Cacheable** — Server functions can be cached by Cloudflare

## Environment Variables

No environment variables are required for the basic demo. The SDK uses the public ketabonline.com API.

For production deployments, you can configure:

| Variable | Description |
|----------|-------------|
| (none currently required) | The SDK uses public endpoints |

## Troubleshooting

### "wrangler: command not found"

Install wrangler globally:
```bash
bun add -g wrangler
```

### Build fails with TypeScript errors

Make sure you're using the correct TypeScript version:
```bash
bun install
```

### White flash when scrolling

This is fixed by setting `background-color` on `html` and `body` elements in `styles.css`.

## Learn More

- [ketab-online-sdk Documentation](https://github.com/ragaeeb/ketab-online-sdk)
- [TanStack Start Documentation](https://tanstack.com/start)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
