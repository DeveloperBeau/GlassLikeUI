import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Config used only by Stryker (see stryker.config.json).
 *
 * Stryker cannot instrument .svelte files, so mutation testing targets the
 * plain-TypeScript logic: actions, constants and the icon registry. Those tests
 * need a DOM but not the Svelte compiler, so the plugin is dropped - it keeps
 * each mutant run fast and avoids a dependency-optimisation failure in the
 * Stryker child process.
 */
export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/lib/test-setup.ts'],
		include: [
			'__tests__/actions/**/*.test.ts',
			'__tests__/constants/**/*.test.ts',
			'__tests__/icons/**/*.test.ts'
		]
	},
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			'$lib/liquidglass': path.resolve(__dirname, './src/lib')
		}
	}
});
