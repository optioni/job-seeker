## 1. Unlock color mode switching

- [x] 1.1 Remove `colorMode: { preference: 'light', fallback: 'light' }` from `apps/web/nuxt.config.ts`

## 2. Extend design tokens for dark mode

- [x] 2.1 Add `--color-dot-grid` CSS variable to the existing `@theme` block in `main.css` (light value: `#c8c0b4`)
- [x] 2.2 Update the `body::before` dot grid rule to use `var(--color-dot-grid)` instead of the hardcoded hex
- [x] 2.3 Add `.dark` selector block in `main.css` overriding all brand tokens with warm dark values (backgrounds: stone-900/950 family; text inverted; accent-tint darkened; dot-grid dark variant)

## 3. Fix hardcoded values in layout

- [x] 3.1 Add `--color-nav-active-bg` and `--color-nav-active-text` CSS variables with light and dark values
- [x] 3.2 Replace the two hardcoded hex strings (`#1c1917`, `#faf8f4`) in `apps/web/layouts/default.vue` active nav link styles with the new CSS variables

## 4. Add color mode toggle

- [x] 4.1 Add a color mode toggle `UButton` to the right side of the nav in `layouts/default.vue` using `useColorMode()` — cycles `light → dark → system` with sun / moon / monitor icons
