/**
 * Svelte action: rotate glass highlight angle based on device tilt.
 *
 * iOS 13+ requires a user-gesture permission grant before DeviceOrientation
 * events fire. Call `requestMotionPermission()` from a click or tap handler,
 * NOT from onMount / an effect / module init, or iOS will silently deny.
 * HTTPS is also required on real devices; http://localhost works for dev.
 *
 * Non-iOS browsers (Android Chrome, desktop Chrome/Firefox/Safari) grant
 * access implicitly; the helper resolves to 'granted' without any prompt.
 *
 * Usage:
 *   <button onclick={async () => (permission = await requestMotionPermission())}>
 *     Enable motion
 *   </button>
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
