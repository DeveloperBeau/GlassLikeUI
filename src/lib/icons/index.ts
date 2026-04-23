/**
 * SVG Icon Library
 * SF Symbol-inspired icons for consistent iconography
 *
 * Security Note: All SVG paths are hardcoded and do not accept user input.
 * This prevents XSS attacks through SVG injection.
 *
 * Extensibility: Consumers may call `registerIcons(...)` at app startup to
 * add project-specific icons without forking the library.
 */

export const ICONS: Record<string, string> = {
	// Navigation
	'chevron.left': '<polyline points="15 18 9 12 15 6"></polyline>',
	'chevron.right': '<polyline points="9 18 15 12 9 6"></polyline>',
	'chevron.up': '<polyline points="18 15 12 9 6 15"></polyline>',
	'chevron.down': '<polyline points="6 9 12 15 18 9"></polyline>',
	'arrow.up.right': '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>',
	'arrow.clockwise': '<polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>',
	'arrow.triangle.2.circlepath': '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',

	// Actions
	'xmark': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
	'plus': '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
	'minus': '<line x1="5" y1="12" x2="19" y2="12"></line>',
	'check': '<polyline points="20 6 9 17 4 12"></polyline>',
	'menu': '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
	'trash': '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',
	'pencil': '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>',
	'paintbrush': '<path d="M14 19.9V16h3a2 2 0 0 0 2-2v-2H5v2a2 2 0 0 0 2 2h3v3.9a2 2 0 1 0 4 0Z"></path><path d="M6 12V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v7"></path>',
	'wand.and.stars': '<line x1="15" y1="4" x2="15" y2="2"></line><line x1="15" y1="16" x2="15" y2="14"></line><line x1="8" y1="9" x2="10" y2="9"></line><line x1="20" y1="9" x2="22" y2="9"></line><line x1="17.8" y1="11.8" x2="19.2" y2="13.2"></line><line x1="10.8" y1="4.8" x2="12.2" y2="6.2"></line><line x1="17.8" y1="6.2" x2="19.2" y2="4.8"></line><line x1="3" y1="21" x2="12" y2="12"></line>',

	// Theme
	'sun.max': '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
	'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
	'display': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
	'sidebar.left': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>',

	// Communication
	'link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
	'envelope': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
	'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',

	// Favorites / social
	'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
	'star.fill': '<polygon fill="currentColor" stroke="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
	'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',

	// People / places
	'house': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
	'person': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
	'person.text.rectangle': '<rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><circle cx="8" cy="11" r="2.5"></circle><path d="M4 17c0-2 2-3 4-3s4 1 4 3"></path><line x1="14" y1="9" x2="20" y2="9"></line><line x1="14" y1="13" x2="20" y2="13"></line><line x1="14" y1="17" x2="18" y2="17"></line>',
	'faceid': '<rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line><path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5"></path>',

	// Settings / storage
	'gear': '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
	'folder': '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
	'folder.badge.plus': '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line>',
	'tray': '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',

	// Documents
	'doc': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>',
	'doc.text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line>',
	'doc.on.clipboard': '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>',
	'doc.on.doc': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',

	// Security
	'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
	'shield.fill': '<path fill="currentColor" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
	'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
	'lock.fill': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
	'lock.shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="1.5"></circle><line x1="12" y1="12.5" x2="12" y2="15.5"></line>',
	'key': '<circle cx="7.5" cy="15.5" r="4.5"></circle><path d="M10.5 12.5L21 2"></path><path d="M17 6l3 3"></path>',
	'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
	'eye.slash': '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>',

	// Misc
	'magnifyingglass': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
	'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
	'number': '<line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line>',
	'asterisk': '<line x1="12" y1="4" x2="12" y2="20"></line><line x1="4.93" y1="7.76" x2="19.07" y2="16.24"></line><line x1="4.93" y1="16.24" x2="19.07" y2="7.76"></line>',
	'textformat': '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>',
	'textformat.abc': '<path d="M4 19l4-12 4 12"></path><line x1="5" y1="15" x2="11" y2="15"></line><path d="M14 19V9h3a3 3 0 0 1 0 6h-3"></path><path d="M14 15h4a3 3 0 0 1 0 4h-4"></path>',
	'creditcard': '<rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>',

	// Status
	'info': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
	'warning': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
	'error': '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
};

/** Default fallback icon name */
export const DEFAULT_ICON = 'star';

/**
 * Register additional icons at runtime. Use for app-specific icons that
 * don't belong in the shared library.
 *
 * Security Note: caller is responsible for ensuring all SVG inner content
 * is trusted, hardcoded, and does not include scripts or event handlers.
 */
export function registerIcons(icons: Record<string, string>): void {
	for (const [name, path] of Object.entries(icons)) {
		ICONS[name] = path;
	}
}

/** Get icon path by name with fallback. Warns in dev when falling back. */
export function getIconPath(name: string): string {
	const path = ICONS[name];
	if (path !== undefined) {
		return path;
	}
	const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env;
	if (!env || env.NODE_ENV !== 'production') {
		console.warn(`[glasslikeui] unknown icon "${name}", falling back to "${DEFAULT_ICON}". Register it via registerIcons({ "${name}": "<svg...>" }).`);
	}
	return ICONS[DEFAULT_ICON];
}

/** Check if icon exists */
export function hasIcon(name: string): boolean {
	return name in ICONS;
}

/** Get all available icon names */
export function getIconNames(): string[] {
	return Object.keys(ICONS);
}

export type IconName = string;
