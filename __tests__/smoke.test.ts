import { describe, expect, it } from 'vitest';

describe('library smoke test', () => {
	it('exports core glass components', async () => {
		const lib = await import('../src/lib');
		expect(lib.Glass).toBeDefined();
		expect(lib.GlassCard).toBeDefined();
		expect(lib.GlassSection).toBeDefined();
		expect(lib.Sheet).toBeDefined();
		expect(lib.LensFilters).toBeDefined();
		expect(lib.GlassDimLayer).toBeDefined();
	});

	it('exports interactive + nav components', async () => {
		const lib = await import('../src/lib');
		expect(lib.Button).toBeDefined();
		expect(lib.IconButton).toBeDefined();
		expect(lib.Badge).toBeDefined();
		expect(lib.TabView).toBeDefined();
		expect(lib.NavigationBar).toBeDefined();
	});

	it('exports design tokens', async () => {
		const lib = await import('../src/lib');
		expect(lib.CORNER_RADIUS).toBeDefined();
		expect(lib.SPACING).toBeDefined();
		expect(lib.PADDING).toBeDefined();
		expect(lib.VARIANT_CONFIG).toBeDefined();
		expect(lib.INTENSITY_CONFIG).toBeDefined();
	});

	it('exports icon utilities', async () => {
		const lib = await import('../src/lib');
		expect(lib.getIconPath).toBeDefined();
		expect(lib.registerIcons).toBeDefined();
		expect(lib.hasIcon).toBeDefined();
	});
});
