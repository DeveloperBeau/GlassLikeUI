import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	deviceMotion,
	requestMotionPermission,
	isDeviceMotionSupported
} from '../../src/lib/actions/deviceMotion';

type AnyWindow = Window & typeof globalThis;

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	return el;
}

describe('isDeviceMotionSupported', () => {
	const originalCtor = (globalThis as AnyWindow).DeviceOrientationEvent;

	afterEach(() => {
		(globalThis as AnyWindow).DeviceOrientationEvent = originalCtor;
	});

	it('returns true when DeviceOrientationEvent exists', () => {
		(globalThis as AnyWindow).DeviceOrientationEvent = function () {} as unknown as typeof DeviceOrientationEvent;
		expect(isDeviceMotionSupported()).toBe(true);
	});

	it('returns false when DeviceOrientationEvent missing', () => {
		(globalThis as AnyWindow).DeviceOrientationEvent = undefined as unknown as typeof DeviceOrientationEvent;
		expect(isDeviceMotionSupported()).toBe(false);
	});
});

describe('requestMotionPermission', () => {
	const originalCtor = (globalThis as AnyWindow).DeviceOrientationEvent;

	afterEach(() => {
		(globalThis as AnyWindow).DeviceOrientationEvent = originalCtor;
	});

	it('returns unavailable when API missing', async () => {
		(globalThis as AnyWindow).DeviceOrientationEvent = undefined as unknown as typeof DeviceOrientationEvent;
		const result = await requestMotionPermission();
		expect(result).toBe('unavailable');
	});

	it('returns granted on browsers without requestPermission (non-iOS)', async () => {
		(globalThis as AnyWindow).DeviceOrientationEvent = function () {} as unknown as typeof DeviceOrientationEvent;
		const result = await requestMotionPermission();
		expect(result).toBe('granted');
	});

	it('returns granted when iOS permission resolves to granted', async () => {
		const ctor = function () {} as unknown as typeof DeviceOrientationEvent & {
			requestPermission: () => Promise<string>;
		};
		ctor.requestPermission = vi.fn().mockResolvedValue('granted');
		(globalThis as AnyWindow).DeviceOrientationEvent = ctor;
		const result = await requestMotionPermission();
		expect(result).toBe('granted');
		expect(ctor.requestPermission).toHaveBeenCalledTimes(1);
	});

	it('returns denied when iOS permission resolves to denied', async () => {
		const ctor = function () {} as unknown as typeof DeviceOrientationEvent & {
			requestPermission: () => Promise<string>;
		};
		ctor.requestPermission = vi.fn().mockResolvedValue('denied');
		(globalThis as AnyWindow).DeviceOrientationEvent = ctor;
		const result = await requestMotionPermission();
		expect(result).toBe('denied');
	});

	it('returns denied when iOS permission rejects', async () => {
		const ctor = function () {} as unknown as typeof DeviceOrientationEvent & {
			requestPermission: () => Promise<string>;
		};
		ctor.requestPermission = vi.fn().mockRejectedValue(new Error('user cancelled'));
		(globalThis as AnyWindow).DeviceOrientationEvent = ctor;
		const result = await requestMotionPermission();
		expect(result).toBe('denied');
	});
});

describe('deviceMotion action', () => {
	const originalCtor = (globalThis as AnyWindow).DeviceOrientationEvent;
	let node: HTMLElement;

	beforeEach(() => {
		node = makeNode();
		(globalThis as AnyWindow).DeviceOrientationEvent = function () {} as unknown as typeof DeviceOrientationEvent;
	});

	afterEach(() => {
		(globalThis as AnyWindow).DeviceOrientationEvent = originalCtor;
	});

	it('returns update + destroy handles', () => {
		const handle = deviceMotion(node);
		expect(typeof handle.update).toBe('function');
		expect(typeof handle.destroy).toBe('function');
		handle.destroy();
	});

	it('updates --glass-highlight-angle on orientation events', async () => {
		const handle = deviceMotion(node, { baseAngle: 100 });

		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), {
				gamma: 30,
				beta: 0,
				alpha: 0
			})
		);

		await new Promise((r) => requestAnimationFrame(r));

		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('130deg');
		handle.destroy();
	});

	it('respects sensitivity multiplier', async () => {
		const handle = deviceMotion(node, { baseAngle: 0, sensitivity: 2 });

		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), { gamma: 20, beta: 0, alpha: 0 })
		);

		await new Promise((r) => requestAnimationFrame(r));

		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('40deg');
		handle.destroy();
	});

	it('skips updates when disabled=true', async () => {
		const handle = deviceMotion(node, { baseAngle: 90, disabled: true });

		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), { gamma: 45, beta: 0, alpha: 0 })
		);

		await new Promise((r) => requestAnimationFrame(r));

		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');
		handle.destroy();
	});

	it('destroy() removes the highlight variable and listener', async () => {
		const handle = deviceMotion(node, { baseAngle: 90 });

		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), { gamma: 10, beta: 0, alpha: 0 })
		);
		await new Promise((r) => requestAnimationFrame(r));

		handle.destroy();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');

		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), { gamma: 80, beta: 0, alpha: 0 })
		);
		await new Promise((r) => requestAnimationFrame(r));
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');
	});

	it('is a no-op when DeviceOrientationEvent missing', () => {
		(globalThis as AnyWindow).DeviceOrientationEvent = undefined as unknown as typeof DeviceOrientationEvent;
		const handle = deviceMotion(node);
		expect(typeof handle.destroy).toBe('function');
		handle.destroy();
	});
});
