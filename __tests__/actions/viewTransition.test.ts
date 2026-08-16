import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withGlassTransition, isViewTransitionsSupported } from '../../src/lib/actions/viewTransition';

type AnyDoc = Omit<Document, 'startViewTransition'> & {
	startViewTransition?: (cb: () => void | Promise<void>) => unknown;
};

describe('withGlassTransition', () => {
	let originalStart: unknown;

	beforeEach(() => {
		originalStart = (document as AnyDoc).startViewTransition;
	});

	afterEach(() => {
		if (originalStart === undefined) {
			delete (document as AnyDoc).startViewTransition;
		} else {
			(document as AnyDoc).startViewTransition = originalStart as never;
		}
	});

	describe('fallback when API missing', () => {
		beforeEach(() => {
			delete (document as AnyDoc).startViewTransition;
		});

		it('runs callback directly', () => {
			const cb = vi.fn();
			withGlassTransition(cb);
			expect(cb).toHaveBeenCalledTimes(1);
		});

		it('returns supported=false', () => {
			const result = withGlassTransition(() => {}) as { supported: boolean };
			expect(result.supported).toBe(false);
		});

		it('awaits a promise callback and still returns supported=false', async () => {
			const cb = vi.fn().mockResolvedValue(undefined);
			const pending = withGlassTransition(cb);
			// Must hand back a promise, so the caller can wait for the DOM update
			// rather than racing it.
			expect(pending).toBeInstanceOf(Promise);
			const result = await pending;
			expect(cb).toHaveBeenCalledTimes(1);
			expect((result as { supported: boolean }).supported).toBe(false);
		});

		it('returns a plain object, not a promise, for a synchronous callback', () => {
			const result = withGlassTransition(() => {});
			expect(result).not.toBeInstanceOf(Promise);
			expect(result).toEqual({ supported: false });
		});

		it('resolves only after the callback settles', async () => {
			let done = false;
			const pending = withGlassTransition(async () => {
				await Promise.resolve();
				done = true;
			});
			await pending;
			expect(done).toBe(true);
		});
	});

	describe('path when API present', () => {
		beforeEach(() => {
			(document as AnyDoc).startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
				cb();
				return {
					finished: Promise.resolve(),
					ready: Promise.resolve(),
					updateCallbackDone: Promise.resolve(),
					skipTransition: vi.fn()
				};
			});
		});

		it('calls document.startViewTransition once', () => {
			withGlassTransition(() => {});
			expect((document as AnyDoc).startViewTransition).toHaveBeenCalledTimes(1);
		});

		it('returns supported=true and exposes the transition object', () => {
			const result = withGlassTransition(() => {}) as {
				supported: boolean;
				transition?: { skipTransition: () => void };
			};
			expect(result.supported).toBe(true);
			expect(result.transition).toBeDefined();
			expect(typeof result.transition?.skipTransition).toBe('function');
		});

		it('still invokes the passed callback', () => {
			const cb = vi.fn();
			withGlassTransition(cb);
			expect(cb).toHaveBeenCalledTimes(1);
		});
	});
});

describe('isViewTransitionsSupported', () => {
	let originalStart: unknown;

	beforeEach(() => {
		originalStart = (document as AnyDoc).startViewTransition;
	});

	afterEach(() => {
		if (originalStart === undefined) {
			delete (document as AnyDoc).startViewTransition;
		} else {
			(document as AnyDoc).startViewTransition = originalStart as never;
		}
	});

	it('returns false when API absent', () => {
		delete (document as AnyDoc).startViewTransition;
		expect(isViewTransitionsSupported()).toBe(false);
	});

	it('returns true when API present', () => {
		(document as AnyDoc).startViewTransition = vi.fn();
		expect(isViewTransitionsSupported()).toBe(true);
	});

	it('returns false when startViewTransition is present but not callable', () => {
		(document as AnyDoc).startViewTransition = 'nope' as never;
		expect(isViewTransitionsSupported()).toBe(false);
	});
});

// On the server there is no document at all - a separate branch from
// "document exists but lacks the API".
describe('server-side rendering (no document)', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('isViewTransitionsSupported returns false', () => {
		vi.stubGlobal('document', undefined);
		expect(isViewTransitionsSupported()).toBe(false);
	});

	it('runs a synchronous callback and reports unsupported', () => {
		vi.stubGlobal('document', undefined);
		const cb = vi.fn();

		const result = withGlassTransition(cb);

		expect(cb).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ supported: false });
	});

	it('awaits an async callback before reporting unsupported', async () => {
		vi.stubGlobal('document', undefined);
		let settled = false;
		const cb = vi.fn(async () => {
			await Promise.resolve();
			settled = true;
		});

		const result = withGlassTransition(cb);

		expect(result).toBeInstanceOf(Promise);
		await expect(result).resolves.toEqual({ supported: false });
		expect(settled).toBe(true);
	});

	it('does not expose a transition object', async () => {
		vi.stubGlobal('document', undefined);
		const result = await withGlassTransition(() => {});
		expect((result as { transition?: unknown }).transition).toBeUndefined();
	});
});
