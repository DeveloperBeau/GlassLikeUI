# Upgrading to v1.0

v1 replaces the blur-only glass engine with a pseudo-element lensing
pipeline, a two-axis variant API, and a richer set of actions for
scroll edges, drag-to-snap sheets, device motion, and accessibility.

The library also renamed several exports and CSS tokens. Every
breaking change is listed below with a migration recipe.

## Setup change (required)

Mount `LensFilters` once near the root of your app so SVG filter defs
exist in the DOM. Without it, glass surfaces render without edge
refraction.

```svelte
<script>
  import { LensFilters } from 'glasslikeui';
  import 'glasslikeui/glasslikeui.css';
  import 'glasslikeui/lens.css';
  import 'glasslikeui/squircle.css';
  import 'glasslikeui/typography.css';
</script>

<LensFilters />
<!-- rest of your app -->
```

If you want the library to track the user's browser accessibility
preferences on browsers that don't natively support every
`prefers-*` media query, call `syncAccessibilityPreferences()` once
at startup:

```svelte
<script>
  import { onMount } from 'svelte';
  import { syncAccessibilityPreferences } from 'glasslikeui';
  onMount(() => syncAccessibilityPreferences());
</script>
```

## Component rename: `LiquidGlass` -> `Glass`

```diff
- import { LiquidGlass } from 'glasslikeui';
- <LiquidGlass>...</LiquidGlass>
+ import { Glass } from 'glasslikeui';
+ <Glass>...</Glass>
```

## Stylesheet rename: `liquidglass.css` -> `glasslikeui.css`

```diff
- import 'glasslikeui/liquidglass.css';
+ import 'glasslikeui/glasslikeui.css';
```

## Material -> Variant + Intensity

The 6-tier `material` prop is replaced by two orthogonal axes:

- `variant: 'regular' | 'clear'`
- `intensity: 'subtle' | 'standard' | 'prominent'`

Migration table:

| v0 `material` | v1 `variant` | v1 `intensity` | Notes                                |
| ------------- | ------------ | -------------- | ------------------------------------ |
| `ultraThin`   | `clear`      | `subtle`       | needs a `GlassDimLayer` beneath      |
| `thin`        | `regular`    | `subtle`       |                                      |
| `regular`     | `regular`    | `standard`     | new default                          |
| `thick`       | `regular`    | `prominent`    |                                      |
| `ultraThick`  | `regular`    | `prominent`    | same as `thick` in v1                |
| `chrome`      | removed      | -              | no direct replacement                |

```diff
- <Glass material="thick">
+ <Glass variant="regular" intensity="prominent">

- <Glass material="ultraThin">
+ <GlassDimLayer />
+ <Glass variant="clear" intensity="subtle">
```

Applies the same way to `GlassCard`, `GlassSection`, `List`, `TabView`,
and any other component that previously took `material`.

## Removed `variant="glass"` on interactive components

Glass-on-glass layering is discouraged. If you were nesting a
`glass`-variant control inside another glass surface, drop the glass
treatment on the child:

```diff
- <Button variant="glass">Action</Button>
+ <Button variant="plain">Action</Button>

- <IconButton variant="glass">...</IconButton>
+ <IconButton variant="plain">...</IconButton>

- <Badge variant="glass" />
+ <Badge variant="default" />
```

If you need a lifted-chrome effect on a button group, wrap the buttons
in a `<Glass>` surface instead.

## TabView: removed `material` prop

`TabView` is always rendered as `regular` + `prominent` in v1.

```diff
- <TabView tabs={...} material="thick" />
+ <TabView tabs={...} />
```

## Sheet: `size` -> `detents` + `initialDetent`

```diff
- <Sheet size="medium" isOpen>...</Sheet>
+ <Sheet detents={['medium', 'large']} initialDetent="medium" isOpen>
+   ...
+ </Sheet>
```

Named detents map to viewport fractions:

| Detent       | Viewport fraction |
| ------------ | ----------------- |
| `small`      | 0.25              |
| `medium`     | 0.50              |
| `large`      | 0.90              |
| `fullscreen` | 1.00              |

v1 sheets are drag-resizable between detents by default. Disable
with `draggable={false}`.

## NavigationBar: new `largeTitle` mode

Opt in to a collapsing large-title header:

```svelte
<NavigationBar title="Photos" largeTitle>
  ...
</NavigationBar>
```

Compact `NavigationBar` usage is unchanged.

## CSS custom property renames

Removed:

- `--glass-bg-thin` -- use `variant` + `intensity` props
- `--glass-bg-thick` -- use `variant` + `intensity` props
- `--glass-chrome-border` -- `chrome` material removed
- `--glass-chrome-outer` -- `chrome` material removed

Renamed:

| v0                    | v1                   |
| --------------------- | -------------------- |
| `--glass-bg`          | `--glass-surface-bg` |
| `--glass-bg-opacity`  | `--glass-opacity`    |
| `--glass-nav-blur`    | `--glass-blur-nav`   |

Added:

- `--glass-blur`
- `--glass-displacement-scale`
- `--glass-saturation`
- `--glass-border-width`
- `--glass-highlight-angle`
- `--glass-motion-enabled`
- `--font-system`
- `--font-system-mono`
- `--dynamic-type-scale`

Bulk find-replace for a consumer repo:

```sh
rg -l 'glass-bg-opacity|glass-nav-blur|glass-bg-thin|glass-bg-thick|glass-chrome' src/ | \
  xargs sed -i '' \
    -e 's/--glass-bg-opacity/--glass-opacity/g' \
    -e 's/--glass-nav-blur/--glass-blur-nav/g'
```

## Typography

v1 exposes a cross-platform `--font-system` stack (SF Pro where
available, Segoe UI on Windows, Roboto on Linux/Android, then Helvetica
and Arial). The library does NOT apply it to your body -- it is
scoped to library components only. To adopt it globally:

```css
body {
  font-family: var(--font-system);
}
```

Dynamic Type scaling: set `--dynamic-type-scale` on `:root` to 1.2,
1.5, etc. to scale all library text proportionally.

## New APIs worth knowing

| Export                            | What it does                                  |
| --------------------------------- | --------------------------------------------- |
| `LensFilters`                     | Mount once; provides SVG filter defs.         |
| `GlassDimLayer`                   | Required companion for `variant="clear"`.     |
| `GlassEffectContainer`            | Groups glass siblings with shared shadow.     |
| `GlassMorph`                      | Marks an element for View Transitions morph. |
| `withGlassTransition`             | Wraps a DOM update in a view transition.      |
| `scrollEdge` action               | Fades a scroll container at glass edges.      |
| `dragSnap` action                 | Detent drag gesture (used by Sheet).          |
| `deviceMotion` action             | Ties highlight angle to device tilt.          |
| `requestMotionPermission`         | iOS permission gate for device motion.        |
| `syncAccessibilityPreferences`    | Bridges prefers-* media to data-* attributes. |

## Browser support

- Chrome / Edge 111+ -- full
- Safari 16.4+ -- full
- Firefox 103+ -- partial. `backdrop-filter` works; SVG filter
  displacement on pseudo-elements works in 115+; fades to opaque
  surface in older versions.
- No backdrop-filter at all -- opaque fallback via
  `@supports not (backdrop-filter: blur(1px))`.
- SSR -- all actions guard `typeof window` and noop server-side.

## Accessibility defaults

v1 honors these user preferences with zero configuration:

- `prefers-reduced-transparency` -- surfaces turn opaque, no blur
- `prefers-contrast: more` -- thicker borders, higher opacity
- `prefers-reduced-motion` -- transitions and motion highlights off

For consumers on non-Safari browsers, call `syncAccessibilityPreferences()`
at app startup so the library's `data-*` attribute fallbacks activate.
