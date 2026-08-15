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
		css: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			// Otherwise the report vanishes exactly when a test fails.
			reportOnFailure: true,
			include: ['src/lib/**/*.{ts,svelte}'],
			exclude: ['src/lib/**/index.ts', 'src/lib/**/*.d.ts', 'src/lib/test-setup.ts'],
			// Ratchet: set just below the current numbers so coverage cannot
			// silently regress. Raise as gaps close.
			// Ratchet: set just below the current numbers so coverage cannot
			// silently regress. The branch figure trails the rest because Svelte
			// compiles every `{value}` interpolation to `${value ?? ''}`, and a
			// prop with a default can only reach the nullish side when a caller
			// passes null explicitly (see nullProps.test.ts).
			thresholds: {
				statements: 97,
				branches: 84,
				functions: 96,
				lines: 98
			}
		}
	},
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			'$lib/liquidglass': path.resolve(__dirname, './src/lib')
		}
	}
});
