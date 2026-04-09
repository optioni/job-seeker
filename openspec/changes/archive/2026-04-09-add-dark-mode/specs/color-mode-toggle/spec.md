## ADDED Requirements

### Requirement: Color mode toggle in nav
The nav bar SHALL include a color mode toggle button that cycles through `light`, `dark`, and `system` modes. The toggle SHALL be placed in the right side of the nav bar, adjacent to the logout button. The active mode SHALL be visually indicated via icon (sun for light, moon for dark, monitor for system).

#### Scenario: Toggle switches to dark mode
- **WHEN** the user clicks the toggle while in light mode
- **THEN** the `dark` class is applied to `<html>` and the UI switches to dark colors

#### Scenario: Toggle switches to system mode
- **WHEN** the user clicks the toggle while in dark mode
- **THEN** the color mode is set to `system` and the UI matches the OS preference

#### Scenario: Toggle switches back to light mode
- **WHEN** the user clicks the toggle while in system mode
- **THEN** the color mode is set to `light` and the UI switches to light colors

### Requirement: Color mode preference persisted
The selected color mode SHALL be persisted to `localStorage` via `@nuxtjs/color-mode` so the preference survives page reloads and navigation.

#### Scenario: Preference survives reload
- **WHEN** the user sets dark mode and reloads the page
- **THEN** dark mode is restored without flash of light mode

### Requirement: No flash of incorrect theme
The app SHALL apply the correct color mode class to `<html>` before first paint to prevent a flash of the wrong theme.

#### Scenario: Dark mode page load
- **WHEN** the user has dark mode set and navigates to any page
- **THEN** the page renders in dark mode immediately without a light-mode flash
