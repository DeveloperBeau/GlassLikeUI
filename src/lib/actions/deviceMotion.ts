/**
 * Svelte action: rotate glass highlight angle based on device tilt.
 *
 * iOS 13+ requires a user gesture to grant DeviceOrientationEvent permission.
 * The action itself cannot request permission (it attaches on mount, not on
 * user interaction). Consumers must call `requestMotionPermission()` from a
 * click/tap handler. The action listens either way -- if permission is never
 * granted, no events fire and the action is a no-op.
 *
 * Usage:
 *   <button onclick={requestMotionPermission}>Enable motion</button>
 *   <div use:deviceMotion>...glass surface...</div>
 */

export interface DeviceMotionOptions {
	/** Multiplier on orientation angle. Default 1. */
	sensitivity?: number;
	/** Base angle when device is flat. Default 135deg. */
	baseAngle?: number;
	/** Skip updates when this is true. */
	disabled?: boolean;
}

interface IOSDeviceOrientationConstructor {
	requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

export async function requestMotionPermission(): Promise<'granted' | 'denied' | 'unavailable'> {
	if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
		return 'unavailable';
	}
	const ctor = DeviceOrientationEvent as unknown as IOSDeviceOrientationConstructor;
	if (typeof ctor.requestPermission !== 'function') {
		// Non-iOS browsers grant access implicitly.
		return 'granted';
	}
	try {
		const result = await ctor.requestPermission();
		return result === 'granted' ? 'granted' : 'denied';
	} catch {
		return 'denied';
	}
}

export function isDeviceMotionSupported(): boolean {
	return typeof window !== 'undefined' && typeof DeviceOrientationEvent !== 'undefined';
}

export function deviceMotion(node: HTMLElement, initialOptions: DeviceMotionOptions = {}) {
	let options = { ...initialOptions };

	if (!isDeviceMotionSupported()) {
		return {
			update(newOptions: DeviceMotionOptions) {
				options = { ...newOptions };
			},
			destroy() {}
		};
	}

	let pendingGamma = 0;
	let rafHandle: number | null = null;

	function onOrientation(event: DeviceOrientationEvent) {
		if (options.disabled) return;
		const gamma = event.gamma ?? 0;
		pendingGamma = gamma * (options.sensitivity ?? 1);
		if (rafHandle === null && typeof requestAnimationFrame === 'function') {
			rafHandle = requestAnimationFrame(flush);
		} else if (typeof requestAnimationFrame !== 'function') {
			flush();
		}
	}

	function flush() {
		rafHandle = null;
		const base = options.baseAngle ?? 135;
		node.style.setProperty('--glass-highlight-angle', `${base + pendingGamma}deg`);
	}

	window.addEventListener('deviceorientation', onOrientation as EventListener);

	return {
		update(newOptions: DeviceMotionOptions) {
			options = { ...newOptions };
		},
		destroy() {
			window.removeEventListener('deviceorientation', onOrientation as EventListener);
			if (rafHandle !== null && typeof cancelAnimationFrame === 'function') {
				cancelAnimationFrame(rafHandle);
			}
			node.style.removeProperty('--glass-highlight-angle');
		}
	};
}
