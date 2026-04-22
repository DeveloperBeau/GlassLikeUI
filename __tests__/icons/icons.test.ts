import { describe, it, expect, vi, afterEach } from 'vitest';
import {
	ICONS,
	DEFAULT_ICON,
	getIconPath,
	hasIcon,
	getIconNames,
	registerIcons
} from '../../src/lib/icons';

describe('Icons Module', () => {
	describe('ICONS constant', () => {
		it('should have navigation icons', () => {
			expect(ICONS).toHaveProperty('chevron.left');
			expect(ICONS).toHaveProperty('chevron.right');
			expect(ICONS).toHaveProperty('chevron.up');
			expect(ICONS).toHaveProperty('chevron.down');
		});

		it('should have action icons', () => {
			expect(ICONS).toHaveProperty('xmark');
			expect(ICONS).toHaveProperty('plus');
			expect(ICONS).toHaveProperty('minus');
			expect(ICONS).toHaveProperty('check');
		});

		it('should have theme icons', () => {
			expect(ICONS).toHaveProperty('sun.max');
			expect(ICONS).toHaveProperty('moon');
			expect(ICONS).toHaveProperty('display');
		});

		it('should have communication icons', () => {
			expect(ICONS).toHaveProperty('envelope');
			expect(ICONS).toHaveProperty('phone');
		});

		it('should have status icons', () => {
			expect(ICONS).toHaveProperty('info');
			expect(ICONS).toHaveProperty('warning');
			expect(ICONS).toHaveProperty('error');
		});

		it('should contain valid SVG elements', () => {
			Object.values(ICONS).forEach(iconPath => {
				expect(iconPath).toMatch(/<(path|line|circle|polygon|polyline|rect)/);
			});
		});

		it('should not contain script tags (security)', () => {
			Object.values(ICONS).forEach(iconPath => {
				expect(iconPath.toLowerCase()).not.toContain('<script');
				expect(iconPath.toLowerCase()).not.toContain('javascript:');
				expect(iconPath.toLowerCase()).not.toContain('onerror');
				expect(iconPath.toLowerCase()).not.toContain('onclick');
			});
		});
	});

	describe('DEFAULT_ICON', () => {
		it('should be a valid icon name', () => {
			expect(ICONS).toHaveProperty(DEFAULT_ICON);
		});

		it('should be star', () => {
			expect(DEFAULT_ICON).toBe('star');
		});
	});

	describe('getIconPath', () => {
		it('should return the correct path for existing icons', () => {
			expect(getIconPath('star')).toBe(ICONS['star']);
			expect(getIconPath('moon')).toBe(ICONS['moon']);
			expect(getIconPath('chevron.left')).toBe(ICONS['chevron.left']);
		});

		it('should return default icon path for non-existent icons', () => {
			expect(getIconPath('non-existent-icon')).toBe(ICONS[DEFAULT_ICON]);
			expect(getIconPath('')).toBe(ICONS[DEFAULT_ICON]);
			expect(getIconPath('random-string')).toBe(ICONS[DEFAULT_ICON]);
		});

		it('should handle special characters in icon names', () => {
			expect(getIconPath('sun.max')).toBe(ICONS['sun.max']);
			expect(getIconPath('arrow.up.right')).toBe(ICONS['arrow.up.right']);
		});
	});

	describe('hasIcon', () => {
		it('should return true for existing icons', () => {
			expect(hasIcon('star')).toBe(true);
			expect(hasIcon('moon')).toBe(true);
			expect(hasIcon('chevron.left')).toBe(true);
		});

		it('should return false for non-existent icons', () => {
			expect(hasIcon('non-existent')).toBe(false);
			expect(hasIcon('')).toBe(false);
			expect(hasIcon('fake-icon')).toBe(false);
		});
	});

	describe('getIconNames', () => {
		it('should return an array of all icon names', () => {
			const names = getIconNames();
			expect(Array.isArray(names)).toBe(true);
			expect(names.length).toBeGreaterThan(0);
		});

		it('should include all ICONS keys', () => {
			const names = getIconNames();
			Object.keys(ICONS).forEach(key => {
				expect(names).toContain(key);
			});
		});

		it('should have expected minimum count of icons', () => {
			const names = getIconNames();
			expect(names.length).toBeGreaterThanOrEqual(25);
		});
	});

	describe('security icon pack', () => {
		it.each([
			'shield', 'shield.fill', 'lock', 'lock.fill', 'lock.shield',
			'key', 'eye', 'eye.slash', 'faceid'
		])('should have %s icon', (name) => {
			expect(ICONS).toHaveProperty(name);
		});
	});

	describe('editor / document icon pack', () => {
		it.each([
			'trash', 'pencil', 'paintbrush', 'wand.and.stars',
			'doc.text', 'doc.on.clipboard', 'doc.on.doc',
			'folder.badge.plus', 'tray', 'sidebar.left',
			'clock', 'number', 'asterisk', 'textformat',
			'textformat.abc', 'creditcard', 'arrow.clockwise',
			'arrow.triangle.2.circlepath', 'person.text.rectangle'
		])('should have %s icon', (name) => {
			expect(ICONS).toHaveProperty(name);
		});
	});

	describe('registerIcons', () => {
		afterEach(() => {
			delete ICONS['test.custom'];
			delete ICONS['test.other'];
		});

		it('adds a new icon by name', () => {
			registerIcons({ 'test.custom': '<circle cx="12" cy="12" r="5"></circle>' });
			expect(hasIcon('test.custom')).toBe(true);
			expect(getIconPath('test.custom')).toContain('<circle');
		});

		it('adds multiple icons at once', () => {
			registerIcons({
				'test.custom': '<path d="M1 1"></path>',
				'test.other': '<path d="M2 2"></path>'
			});
			expect(hasIcon('test.custom')).toBe(true);
			expect(hasIcon('test.other')).toBe(true);
		});

		it('overrides an existing icon when re-registered', () => {
			const original = ICONS['star'];
			try {
				registerIcons({ star: '<path d="M0 0"></path>' });
				expect(getIconPath('star')).toBe('<path d="M0 0"></path>');
			} finally {
				ICONS['star'] = original;
			}
		});
	});

	describe('getIconPath fallback warning', () => {
		it('warns when an unknown icon is requested', () => {
			const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				getIconPath('definitely-not-a-real-icon');
				expect(spy).toHaveBeenCalledOnce();
				expect(spy.mock.calls[0][0]).toContain('definitely-not-a-real-icon');
			} finally {
				spy.mockRestore();
			}
		});

		it('does not warn for known icons', () => {
			const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			try {
				getIconPath('star');
				expect(spy).not.toHaveBeenCalled();
			} finally {
				spy.mockRestore();
			}
		});
	});
});
