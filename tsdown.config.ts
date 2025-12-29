import { defineConfig } from 'tsdown';

export default defineConfig({
    clean: true,
    dts: true,
    entry: ['src/index.ts', 'src/node.ts'],
    format: ['esm'],
    outDir: 'dist',
    sourcemap: true,
    target: 'node24',
});
