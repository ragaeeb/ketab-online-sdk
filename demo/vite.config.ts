import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [preact()],
    resolve: {
        alias: {
            'ketab-online-sdk': resolve(__dirname, '../dist/index.mjs'),
        },
    },
});
