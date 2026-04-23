import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/lib/test-setup.ts'],
		include: ['__tests__/**/*.test.ts'],
		css: true
	},
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			'$lib/liquidglass': path.resolve(__dirname, './src/lib')
		}
	}
});
