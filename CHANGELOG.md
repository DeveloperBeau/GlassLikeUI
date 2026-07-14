# Changelog

## 1.3.1

### Added

- `Button` now accepts a native `type` prop (`'button' | 'submit' | 'reset'`).
  Unset, it keeps the browser default (a button inside a form submits it), so
  existing usage is unchanged; set `type="button"` for form buttons that must
  not submit, or `type="submit"` to be explicit.

## 1.3.0

### Changed

- Relicensed from MIT to the GNU General Public License v3.0 or later
  (`GPL-3.0-or-later`). The project is now copyleft: distributing the
  components or any derivative work requires releasing the corresponding
  source under a GPL-compatible license. `LICENSE`, `package.json`, and
  `README.md` updated accordingly. Copies obtained under previous MIT
  releases remain MIT-licensed.

## 1.2.1

### Changed

- Internal modernization to current Svelte 5 idioms; no API or visual
  changes. `Glass`, `ScrollView`, and `Sheet` consume their device-motion,
  scroll-edge, and drag actions via `{@attach fromAction(...)}` instead of
  `use:`. `Menu` closes on outside click through `<svelte:document>` rather
  than a manual effect, and derives its panel `id` from `$props.id()` for
  stable SSR/hydration ids (replacing a module counter that could mismatch).
  `Sheet` derives its active detent index with a writable `$derived`, and
  `TabView`'s tab loop is now keyed by `id`.

## 1.2.0

### Added

- `Menu` and `MenuItem` components: an iOS-context-menu-style dropdown.
  `Menu` renders a trigger button plus a frosted-glass popover panel with
  `role="menu"`. It opens on click and closes on outside click, `Escape`
  (restoring focus to the trigger), or item selection. Arrow keys, `Home`,
  and `End` move roving focus across items. The panel scales and fades in
  (~180ms); under `prefers-reduced-motion: reduce` it fades only. An
  `align` prop (`'start'` or `'end'`) anchors the panel to the left or
  right edge of the trigger. `MenuItem` renders a row with an optional
  leading SF Symbol icon, supports `href` (anchor) or `onclick` (button),
  and a `destructive` style.
- Icons: `cloud.sun` and `waveform`.

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
