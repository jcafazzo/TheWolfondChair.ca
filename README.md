# The Wolfond Chair in Digital Health - Annual Report

A 17-slide interactive presentation for the Wolfond Chair in Digital Health at University Health Network, Toronto. Designed for kiosk display on AndroidTV monitors and web viewing via GitHub Pages.

**Live site:** [thewolfondchair.ca](https://thewolfondchair.ca) (or [jcafazzo.github.io/TheWolfondChair.ca](https://jcafazzo.github.io/TheWolfondChair.ca))

## Architecture

Single monolithic HTML file (`wolfond-report-2024-2026.html`) with all CSS and JavaScript inline. No build step, no frameworks, no dependencies at runtime. `index.html` redirects to the report.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Arrow Right** | Next slide |
| **Arrow Left** | Previous slide |
| **K** | Toggle kiosk mode (hides all navigation chrome, enables auto-advance and edge navigation) |
| **P** | Toggle portrait mode (rotates display for portrait-mounted monitors) |
| **Escape** | Close video modal |

You can also click/tap the right or left half of the screen to navigate forward/back (disabled in kiosk mode, which uses mouse-edge navigation instead).

## URL Parameters

Append these to the URL to activate modes on page load:

| Parameter | Example | Effect |
|-----------|---------|--------|
| `?kiosk` | `wolfond-report-2024-2026.html?kiosk` | Enter kiosk mode automatically |
| `?portrait` | `wolfond-report-2024-2026.html?portrait` | Enter portrait mode automatically |
| `?kiosk&portrait` | `wolfond-report-2024-2026.html?kiosk&portrait` | Both modes combined |

## Display Modes

### Kiosk Mode (K key)

For unattended display on lobby monitors. When active:

- All navigation chrome (topbar, nav dots, arrows, counters, progress bar) fades to invisible
- Auto-advance timer cycles through slides continuously
- Slides with scrollable content auto-scroll before advancing
- Mouse-edge navigation: move cursor to screen edges to change slides (for AndroidTV remote cursor)
- Click/tap navigation is disabled to prevent accidental interaction
- Video modals are suppressed
- Loops back to slide 1 after the last slide

### Portrait Mode (P key)

For monitors physically mounted in portrait orientation (rotated 90 degrees clockwise). The OS still reports a landscape viewport, so portrait mode:

- Rotates the entire page -90 degrees via CSS transform
- Swaps viewport unit references (`vh`/`vw`) so content fills the rotated screen correctly
- Stacks split layouts vertically (image on top, text below)
- Adjusts typography scaling for the narrower visual width
- Adapts mouse-edge and tap navigation to the rotated coordinate system

Portrait mode composes with kiosk mode -- both can be active simultaneously.

## Visual Effects

- **Ken Burns:** Slow cinematic zoom on the title slide text with counter-scale on the slide inner container
- **Ambient motion:** Subtle animated gradient overlays on dark slides
- **Slide transitions:** Smooth crossfade between slides with transition locking to prevent rapid-fire navigation

## Development

### Prerequisites

- Node.js (for Playwright tests)
- Python 3 (for the dev server)

### Running locally

```bash
# Start the dev server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

### Running tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/kiosk-mode.spec.ts

# Run with headed browser (visible)
npx playwright test --headed
```

### Test suites

| File | Tests | Coverage |
|------|-------|----------|
| `desktop-regression.spec.ts` | Slide structure, navigation, counters, progress bar |
| `navigation.spec.ts` | Arrow keys, click navigation, slide transitions |
| `kiosk-mode.spec.ts` | K key toggle, chrome hiding, edge navigation, looping |
| `portrait-mode.spec.ts` | P key toggle, CSS rotation, kiosk composition, URL params |
| `auto-scroll.spec.ts` | Auto-advance timing, scroll-before-advance behavior |
| `video-modal.spec.ts` | Video modal open/close, kiosk suppression |
| `mobile-viewport.spec.ts` | Mobile responsive layout tests |

Tests run against three viewports: Desktop Chrome (1280x800), iPhone 14, and Pixel 5.

## Deployment

Hosted on GitHub Pages. Push to `main` to deploy. No build step required.

## Project Structure

```
TheWolfondChair.ca/
  index.html                          # Redirect to report
  wolfond-report-2024-2026.html       # The entire application (HTML + CSS + JS)
  playwright.config.ts                # Test configuration
  package.json                        # Dev dependencies (Playwright)
  tests/
    desktop-regression.spec.ts
    navigation.spec.ts
    kiosk-mode.spec.ts
    portrait-mode.spec.ts
    auto-scroll.spec.ts
    video-modal.spec.ts
    mobile-viewport.spec.ts
```
