# Requirements: Wolfond Chair — Mobile Optimization

**Defined:** 2026-03-02
**Core Value:** The presentation must work smoothly on mobile devices without breaking desktop

## v1 Requirements

### Mobile CSS

- [x] **MCSS-01**: Slides use viewport height fallback (`100vh` before `100dvh`/`100svh`) for consistent height across all mobile browsers
- [x] **MCSS-02**: Slides have `touch-action: pan-y` to allow native vertical scrolling while enabling horizontal swipe navigation
- [x] **MCSS-03**: All interactive elements (nav dots, arrows, buttons) have minimum 44px touch targets
- [x] **MCSS-04**: Slides use `overscroll-behavior-x: contain` to prevent accidental browser back/forward on horizontal swipe

### Mobile JS

- [x] **MJS-01**: Swipe detection requires horizontal delta to exceed vertical delta and minimum 40px threshold before triggering slide change
- [x] **MJS-02**: Touch target detection checks if finger landed inside `.scroll-content` element before suppressing vertical swipe
- [x] **MJS-03**: Auto-advance timer pauses when browser tab is hidden (Page Visibility API) and resumes when visible

### E2E Testing

- [x] **TEST-01**: Playwright project configured with webServer serving static HTML, running on desktop Chromium
- [x] **TEST-02**: Navigation tests verify keyboard arrows, click dots, and click arrows advance/retreat slides correctly
- [x] **TEST-03**: Mobile viewport tests verify layout on iPhone 14 and Pixel 5 device emulation
- [x] **TEST-04**: Video modal tests verify open, close, and Escape key dismissal
- [x] **TEST-05**: Desktop regression tests confirm all navigation and layout still works after mobile changes

## v2 Requirements

### UX Enhancements

- **UX-01**: Visible auto-advance play/pause toggle button
- **UX-02**: Safe-area inset handling for notched devices (iPhone X+)
- **UX-03**: Clock-mocked auto-advance timer E2E test
- **UX-04**: Visual snapshot regression tests across viewports

### Advanced Testing

- **ATEST-01**: Simulated touch swipe E2E tests (touchstart/touchmove/touchend dispatch)
- **ATEST-02**: CI pipeline integration with GitHub Actions

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-file refactor | Architecture constraint — keep monolithic HTML |
| Build system (webpack, Vite) | Zero-build static site constraint |
| Framework migration | Vanilla JS only constraint |
| New slide content | This milestone is optimization, not content |
| Full accessibility overhaul | Only fix mobile-impacting a11y issues |
| Haptic feedback on swipe | Poor cross-browser support, not worth complexity |
| Real iOS device testing automation | Requires physical devices or BrowserStack; manual smoke test suffices |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MCSS-01 | Phase 1 | Complete |
| MCSS-02 | Phase 1 | Complete |
| MCSS-03 | Phase 1 | Complete |
| MCSS-04 | Phase 1 | Complete |
| MJS-01 | Phase 1 | Complete |
| MJS-02 | Phase 1 | Complete |
| MJS-03 | Phase 1 | Complete |
| TEST-01 | Phase 2 | Complete |
| TEST-02 | Phase 2 | Complete |
| TEST-03 | Phase 2 | Complete |
| TEST-04 | Phase 2 | Complete |
| TEST-05 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-03 after 02-03 completion (TEST-03, TEST-04 marked complete)*
