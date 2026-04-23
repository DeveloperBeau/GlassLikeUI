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
			const result = await withGlassTransition(cb);
			expect(cb).toHaveBeenCalledTimes(1);
			expect((result as { supported: boolean }).supported).toBe(false);
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
});
