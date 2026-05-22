import { describe, it, expect } from 'vitest';
import { hasIcon, getIconPath } from '../src/lib';

describe('Project icons', () => {
	it('registers the cloud.sun icon', () => {
		expect(hasIcon('cloud.sun')).toBe(true);
		expect(getIconPath('cloud.sun')).not.toBe('');
	});

	it('registers the waveform icon', () => {
		expect(hasIcon('waveform')).toBe(true);
		expect(getIconPath('waveform')).not.toBe('');
	});
});
