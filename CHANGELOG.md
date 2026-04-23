# Changelog

## 1.0.0

Major rewrite. Breaking changes across component names, props, and CSS
tokens. See [UPGRADING.md](./UPGRADING.md) for a full migration guide.

### Breaking

- Renamed `LiquidGlass` component to `Glass`.
- Renamed stylesheet export `glasslikeui/liquidglass.css` to
  `glasslikeui/glasslikeui.css`.
- Replaced `material` prop (6 tiers) with two-axis `variant` +
  `intensity` API. `chrome` material removed.
- Removed `variant="glass"` from `Button`, `IconButton`, `Badge`.
- `TabView` no longer accepts `material`.
- `Sheet` `size` prop replaced by `detents` + `initialDetent`.
- CSS custom property renames: `--glass-bg` -> `--glass-surface-bg`,
  `--glass-bg-opacity` -> `--glass-opacity`, `--glass-nav-blur` ->
  `--glass-blur-nav`. `--glass-bg-thin`, `--glass-bg-thick`,
  `--glass-chrome-border`, `--glass-chrome-outer` removed.
- Root `LensFilters` component must now be mounted once at app root.

### Added

- `LensFilters` component with SVG filter defs for edge refraction and
  squircle clip path.
- `GlassDimLayer` companion for `variant="clear"`.
- `GlassEffectContainer` for merged-chrome layout of glass siblings.
- `GlassMorph` + `withGlassTransition` utility for View Transitions
  API matched-geometry morphs across routes.
- `Sheet` is drag-resizable between detents with velocity-based snap
  and rubber-banding.
- `NavigationBar` `largeTitle` mode with `IntersectionObserver`-driven
  collapse on scroll.
- `ScrollView` `edgeEffect` prop (`soft` / `hard` / `none`) and
  `edges` selector.
- `Text` now scales with `--dynamic-type-scale`.
- Cross-platform system font stack exposed as `--font-system` and
  `--font-system-mono`.
- Native `prefers-reduced-transparency`, `prefers-contrast`, and
  `prefers-reduced-motion` handling, plus data-attribute fallbacks
  (`data-reduced-transparency`, `data-contrast`, `data-reduced-motion`)
  for browsers without native media query support.
- `syncAccessibilityPreferences` action to bridge `matchMedia` into
  those data-attributes.
- `scrollEdge` Svelte action.
- `dragSnap` Svelte action (internal engine behind `Sheet`).
- `deviceMotion` Svelte action with `requestMotionPermission` helper
  for iOS user-gesture permission flow.
- Opaque fallback via `@supports not (backdrop-filter: blur(1px))`.

### Fixed

- Sheet no longer hardcodes its backdrop blur; uses design tokens.
- Hairline borders use direct `0.5px` width instead of DPR math.
- Svelte 5 reactivity warnings in `Sheet` ironed out.
- Legacy test import paths resolved; suite actually runs for the first
  time since the `src/lib` restructure.

## 0.2.2

- Previous version. See git history.
