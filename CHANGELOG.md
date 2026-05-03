# Changelog

## 1.1.1

### Fixed

- `TabView` floating bar now actually floats. The fixed-position class
  was applied to the `Glass` element directly, where Glass's scoped
  `.glass-surface { position: relative }` won specificity and forced
  the bar back into flow. Combined with `flex-direction: column-reverse`
  on `position-bottom`, the bar rendered at the top of the page instead
  of the bottom. Glass is now wrapped in a positioning div that owns
  the `position: fixed` rules.
- `TabView` bar now respects viewport width. Container previously had
  no explicit width and shrank to its content, so long tab labels could
  push it past the screen edge. Container is now anchored with
  `left: var(--spacing-md); right: var(--spacing-md)` for symmetric
  insets, and child elements explicitly fill it.
- `TabView` tabs are now equal-width via `flex: 1 1 0`. Previously each
  tab sized to its label, so a "Wallets" tab and a "Cards" tab differed
  noticeably. Horizontal item padding tightened from `12px` to `4px` so
  longer labels fit without truncation in typical mobile widths.
- Indicator pill measurement switched from `offsetLeft` /
  `offsetWidth` to `getBoundingClientRect` deltas. The previous
  approach assumed the active button's `offsetParent` was the
  measurement wrapper, but with `.tab-bar` (HStack) carrying
  `position: relative`, that wasn't true and the indicator was being
  placed in the wrong coordinate system.
- Indicator measurement now retries on the next frame if the active
  button reports zero width (common during font load or HMR), so the
  pill no longer freezes invisibly when the first read happens before
  layout settles.
- Active button refs switched from a `Record` to an indexed array.
  Svelte 5's `bind:this` to a record key is brittle and could leave
  the active tab's ref undefined; the indexed-array form is the
  canonical pattern and is reliable.

## 1.1.0

### Added

- `TabView` now renders a sliding indicator pill that animates between
  the active tab's position and width using a spring transition. The
  active tab's icon and label scale up via `transform: scale(...)` for a
  tactile selected feel. Indicator measurement uses `offsetLeft` /
  `offsetWidth` (layout box, not visual transform box) so it stays in
  sync with the buttons through resize and font-load events. A
  `ResizeObserver` re-measures on container resize. Reduced-motion is
  honored automatically because the transitions reference
  `--transition-spring` / `--transition-fast`, both zeroed under
  `prefers-reduced-motion: reduce` and `data-reduced-motion='true'`.

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
