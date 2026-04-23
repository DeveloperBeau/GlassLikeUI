import { describe, expect, it } from 'vitest';

describe('library smoke test', () => {
	it('exports core components', async () => {
		const lib = await import('../src/lib');
		expect(lib.LiquidGlass).toBeDefined();
		expect(lib.GlassCard).toBeDefined();
		expect(lib.Sheet).toBeDefined();
		expect(lib.Button).toBeDefined();
		expect(lib.NavigationBar).toBeDefined();
	});

	it('exports design tokens', async () => {
		const lib = await import('../src/lib');
		expect(lib.CORNER_RADIUS).toBeDefined();
		expect(lib.SPACING).toBeDefined();
		expect(lib.PADDING).toBeDefined();
	});

	it('exports icon utilities', async () => {
		const lib = await import('../src/lib');
		expect(lib.getIconPath).toBeDefined();
		expect(lib.registerIcons).toBeDefined();
		expect(lib.hasIcon).toBeDefined();
	});
});
