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

/** Dispatch a deviceorientation event with the given gamma. */
function fire(gamma: number | null) {
	window.dispatchEvent(
		Object.assign(new Event('deviceorientation'), { gamma, beta: 0, alpha: 0 })
	);
}

/** Wait for one animation frame to flush. */
function nextFrame() {
	return new Promise((r) => requestAnimationFrame(r));
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

// On the server there is no window at all - a separate branch from
// "window exists but DeviceOrientationEvent does not".
describe('server-side rendering (no window)', () => {
	const originalCtor = (globalThis as AnyWindow).DeviceOrientationEvent;

	afterEach(() => {
		vi.unstubAllGlobals();
		(globalThis as AnyWindow).DeviceOrientationEvent = originalCtor;
	});

	it('isDeviceMotionSupported returns false', () => {
		(globalThis as AnyWindow).DeviceOrientationEvent =
			function () {} as unknown as typeof DeviceOrientationEvent;
		vi.stubGlobal('window', undefined);
		expect(isDeviceMotionSupported()).toBe(false);
	});

	it('requestMotionPermission reports unavailable', async () => {
		(globalThis as AnyWindow).DeviceOrientationEvent =
			function () {} as unknown as typeof DeviceOrientationEvent;
		vi.stubGlobal('window', undefined);
		await expect(requestMotionPermission()).resolves.toBe('unavailable');
	});

	it('the action degrades to inert handles', () => {
		const node = makeNode();
		(globalThis as AnyWindow).DeviceOrientationEvent =
			function () {} as unknown as typeof DeviceOrientationEvent;
		vi.stubGlobal('window', undefined);

		const handle = deviceMotion(node, { baseAngle: 10 });

		expect(typeof handle.update).toBe('function');
		expect(() => handle.update({ baseAngle: 20 })).not.toThrow();
		expect(() => handle.destroy()).not.toThrow();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');
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

	it('keeps accepting update() while unsupported without touching the node', () => {
		(globalThis as AnyWindow).DeviceOrientationEvent =
			undefined as unknown as typeof DeviceOrientationEvent;
		const handle = deviceMotion(node, { baseAngle: 10 });

		handle.update({ baseAngle: 90 });
		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), { gamma: 30, beta: 0, alpha: 0 })
		);

		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');
		handle.destroy();
	});

	it('defaults the base angle to 135 degrees', async () => {
		const handle = deviceMotion(node);
		fire(20);
		await nextFrame();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('155deg');
		handle.destroy();
	});

	it('defaults sensitivity to 1', async () => {
		const handle = deviceMotion(node, { baseAngle: 0 });
		fire(42);
		await nextFrame();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('42deg');
		handle.destroy();
	});

	it('treats a null gamma as zero', async () => {
		const handle = deviceMotion(node, { baseAngle: 50 });
		window.dispatchEvent(
			Object.assign(new Event('deviceorientation'), { gamma: null, beta: 0, alpha: 0 })
		);
		await nextFrame();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('50deg');
		handle.destroy();
	});

	it('applies options supplied through update()', async () => {
		const handle = deviceMotion(node, { baseAngle: 0 });
		handle.update({ baseAngle: 200, sensitivity: 0 });
		fire(45);
		await nextFrame();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('200deg');
		handle.destroy();
	});

	it('re-enables updates when disabled is cleared via update()', async () => {
		const handle = deviceMotion(node, { baseAngle: 0, disabled: true });
		fire(10);
		await nextFrame();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');

		handle.update({ baseAngle: 0, disabled: false });
		fire(10);
		await nextFrame();
		expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('10deg');
		handle.destroy();
	});

	describe('frame coalescing', () => {
		it('schedules only one frame for a burst of events', async () => {
			const raf = vi.spyOn(globalThis, 'requestAnimationFrame');
			const handle = deviceMotion(node, { baseAngle: 0 });

			fire(10);
			fire(20);
			fire(30);

			expect(raf).toHaveBeenCalledTimes(1);

			await nextFrame();
			// The last sample wins, not the first.
			expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('30deg');

			handle.destroy();
			raf.mockRestore();
		});

		it('schedules a new frame once the previous one has flushed', async () => {
			const handle = deviceMotion(node, { baseAngle: 0 });
			fire(10);
			await nextFrame();

			const raf = vi.spyOn(globalThis, 'requestAnimationFrame');
			fire(60);
			expect(raf).toHaveBeenCalledTimes(1);

			await nextFrame();
			expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('60deg');

			handle.destroy();
			raf.mockRestore();
		});

		// Without rAF (older embedded webviews) the update must still land,
		// synchronously, rather than being dropped.
		it('writes synchronously when requestAnimationFrame is unavailable', () => {
			const originalRaf = globalThis.requestAnimationFrame;
			(globalThis as AnyWindow).requestAnimationFrame =
				undefined as unknown as typeof requestAnimationFrame;
			try {
				const handle = deviceMotion(node, { baseAngle: 5 });
				fire(15);
				expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('20deg');
				handle.destroy();
			} finally {
				(globalThis as AnyWindow).requestAnimationFrame = originalRaf;
			}
		});
	});

	describe('destroy', () => {
		it('cancels a frame that has not flushed yet', () => {
			const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame');
			const handle = deviceMotion(node, { baseAngle: 0 });

			fire(10);
			handle.destroy();

			expect(cancel).toHaveBeenCalledTimes(1);
			cancel.mockRestore();
		});

		it('does not cancel a frame when none is pending', () => {
			const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame');
			const handle = deviceMotion(node, { baseAngle: 0 });

			handle.destroy();

			expect(cancel).not.toHaveBeenCalled();
			cancel.mockRestore();
		});

		it('does not write the angle after destroy', async () => {
			const handle = deviceMotion(node, { baseAngle: 0 });
			fire(10);
			handle.destroy();
			await nextFrame();
			expect(node.style.getPropertyValue('--glass-highlight-angle')).toBe('');
		});

		it('survives a missing cancelAnimationFrame', () => {
			const originalCancel = globalThis.cancelAnimationFrame;
			const handle = deviceMotion(node, { baseAngle: 0 });
			fire(10);
			(globalThis as AnyWindow).cancelAnimationFrame =
				undefined as unknown as typeof cancelAnimationFrame;
			try {
				expect(() => handle.destroy()).not.toThrow();
			} finally {
				(globalThis as AnyWindow).cancelAnimationFrame = originalCancel;
			}
		});

		it('is safe to call twice', () => {
			const handle = deviceMotion(node, { baseAngle: 0 });
			handle.destroy();
			expect(() => handle.destroy()).not.toThrow();
		});
	});
});
