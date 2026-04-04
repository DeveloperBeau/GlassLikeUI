import { describe, it, expect } from 'vitest';
import { MATERIAL_CONFIG } from '../../constants/materials';
import type { MaterialConfig } from '../../constants/materials';

describe('Material Constants', () => {
	describe('MATERIAL_CONFIG', () => {
		const materialTypes = ['ultraThin', 'thin', 'regular', 'thick', 'ultraThick', 'chrome'];

		it('should have all expected material types', () => {
			materialTypes.forEach(type => {
				expect(MATERIAL_CONFIG).toHaveProperty(type);
			});
		});

		it.each(materialTypes)('should have valid config for %s', (materialType) => {
			const config = MATERIAL_CONFIG[materialType] as MaterialConfig;

			expect(config).toHaveProperty('blur');
			expect(config).toHaveProperty('saturation');
			expect(config).toHaveProperty('bgOpacity');
			expect(config).toHaveProperty('borderOpacity');

			expect(typeof config.blur).toBe('number');
			expect(typeof config.saturation).toBe('number');
			expect(typeof config.bgOpacity).toBe('number');
			expect(typeof config.borderOpacity).toBe('number');
		});

		it('should have increasing blur values from thin to thick', () => {
			expect(MATERIAL_CONFIG.ultraThin.blur).toBeLessThan(MATERIAL_CONFIG.thin.blur);
			expect(MATERIAL_CONFIG.thin.blur).toBeLessThan(MATERIAL_CONFIG.regular.blur);
			expect(MATERIAL_CONFIG.regular.blur).toBeLessThan(MATERIAL_CONFIG.thick.blur);
			expect(MATERIAL_CONFIG.thick.blur).toBeLessThan(MATERIAL_CONFIG.ultraThick.blur);
		});

		it('should have increasing saturation values', () => {
			expect(MATERIAL_CONFIG.ultraThin.saturation).toBeLessThan(MATERIAL_CONFIG.thin.saturation);
			expect(MATERIAL_CONFIG.thin.saturation).toBeLessThan(MATERIAL_CONFIG.regular.saturation);
		});

		it('should have all opacity values between 0 and 1', () => {
			materialTypes.forEach(type => {
				const config = MATERIAL_CONFIG[type] as MaterialConfig;
				expect(config.bgOpacity).toBeGreaterThan(0);
				expect(config.bgOpacity).toBeLessThanOrEqual(1);
				expect(config.borderOpacity).toBeGreaterThan(0);
				expect(config.borderOpacity).toBeLessThanOrEqual(1);
			});
		});

		it('chrome should have highest saturation', () => {
			const chromeConfig = MATERIAL_CONFIG.chrome;
			materialTypes.filter(t => t !== 'chrome').forEach(type => {
				expect(chromeConfig.saturation).toBeGreaterThanOrEqual(MATERIAL_CONFIG[type].saturation);
			});
		});
	});
});
