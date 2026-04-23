# GlassLikeUI

Svelte component library with frosted glass materials. Pseudo-element
lensing, two-axis variant API, drag-snap sheets, View Transitions morph,
accessibility-aware out of the box, cross-platform typography.

Svelte 5 only. MIT licensed.

## Install

```sh
npm install glasslikeui
```

Peer dependency: `svelte ^5.0.0`.

## Setup

Mount `LensFilters` once near the root of your app, and import the
stylesheets you want:

```svelte
<script>
  import { LensFilters } from 'glasslikeui';
  import 'glasslikeui/glasslikeui.css';
  import 'glasslikeui/lens.css';
  import 'glasslikeui/squircle.css';
  import 'glasslikeui/typography.css';
</script>

<LensFilters />
<!-- rest of app -->
```

Optional: wire browser accessibility prefs into the library's fallback
attributes on non-Safari browsers:

```svelte
<script>
  import { onMount } from 'svelte';
  import { syncAccessibilityPreferences } from 'glasslikeui';
  onMount(() => syncAccessibilityPreferences());
</script>
```

## Basic use

```svelte
<script>
  import { Glass, Button } from 'glasslikeui';
</script>

<Glass variant="regular" intensity="standard">
  {#snippet children()}
    <h2>Frosted card</h2>
    <Button variant="filled">Action</Button>
  {/snippet}
</Glass>
```

## Variants and intensity

`Glass` (and its consumers: `GlassCard`, `GlassSection`, `List`,
`TabView`) takes two orthogonal props:

- `variant` -- `regular` (default) or `clear`. Clear requires a
  `<GlassDimLayer />` companion for legibility.
- `intensity` -- `subtle`, `standard` (default), or `prominent`.
  Controls blur, edge displacement, and saturation together.

## Components

| Component                | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `Glass`                  | Core frosted surface.                            |
| `GlassCard`              | Header / body / footer card.                     |
| `GlassSection`           | Titled section block.                            |
| `GlassEffectContainer`   | Groups glass siblings with shared shadow.        |
| `GlassDimLayer`          | Required under `variant="clear"`.                |
| `GlassMorph`             | Tag a subtree for View Transitions morph.        |
| `LensFilters`            | SVG filter defs (mount once).                    |
| `Sheet`                  | Bottom sheet with detents + drag-to-snap.        |
| `NavigationBar`          | Top chrome; supports `largeTitle` collapse.      |
| `NavigationLink`         | Pill-style link.                                 |
| `TabView`                | Floating tab bar.                                |
| `Button` / `IconButton`  | `filled` / `outlined` / `plain` / `tinted` / `destructive`. |
| `Badge`                  | `default` / `accent`.                            |
| `Text`                   | Dynamic-Type-aware text.                         |
| `List` / `ListRow`       | Grouped list with insets.                        |
| `HStack` / `VStack` / `ZStack` / `Grid` / `Spacer` / `Divider` / `ScrollView` | Layout primitives. |
| `SymbolImage`            | SVG icon renderer.                               |

## Actions

| Export                           | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `scrollEdge`                     | Fade a scroll container at edges meeting glass chrome. |
| `dragSnap`                       | Detent-based drag gesture (used by `Sheet`).           |
| `deviceMotion`                   | Ties the glass highlight angle to device tilt.         |
| `withGlassTransition`            | Wraps a DOM update in a view transition.               |
| `syncAccessibilityPreferences`   | Bridges `prefers-*` media to data-attrs at `:root`.    |
| `requestMotionPermission`        | Triggers the iOS user-gesture permission flow.         |

## Icons

A small SF-symbol-inspired set ships in `ICONS`. Register your own
before rendering:

```ts
import { registerIcons } from 'glasslikeui';
registerIcons({
  'custom-symbol': '<path d="..." />'
});
```

## Accessibility

Native preference handling with zero config:

- `prefers-reduced-transparency` -- surfaces go opaque, blur off
- `prefers-contrast: more` -- thicker borders, higher opacity
- `prefers-reduced-motion` -- transitions and motion highlights off

Cross-browser fallback attributes (flip at `:root`):

- `data-reduced-transparency="true"`
- `data-contrast="more"`
- `data-reduced-motion="true"`

Call `syncAccessibilityPreferences()` to manage these automatically.

## Theming

All design tokens are CSS custom properties. Toggle dark / light with
the `data-theme` attribute on `:root`:

```html
<html data-theme="light">...</html>
```

Override any token via your own stylesheet, e.g.:

```css
:root {
  --color-accent: #FF6A00;
  --glass-radius-lg: 28px;
}
```

## Browser support

| Browser                | Support                                               |
| ---------------------- | ----------------------------------------------------- |
| Chrome / Edge 111+     | Full.                                                 |
| Safari 16.4+           | Full, including native `prefers-reduced-transparency`.|
| Firefox 115+           | Full. 103-114 works without edge lensing.             |
| Older                  | Opaque fallback via `@supports not`.                  |
| SSR                    | All actions guard `typeof window`.                    |

## Build / test

```sh
npm run package        # svelte-package build
npm test               # vitest once
npm run test:watch     # vitest watch
npm run test:coverage  # with v8 coverage
```

## License

MIT. See `LICENSE`.
