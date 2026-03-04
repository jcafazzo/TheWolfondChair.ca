# Requirements: Wolfond Chair Digital Health Report

**Defined:** 2026-03-04
**Core Value:** Polished, hands-free viewing experience on desktop, kiosk, and portrait screens

## v1.0 Requirements (Complete)

All v1.0 mobile optimization requirements shipped. See MILESTONES.md for details.

## v1.1 Requirements

Requirements for kiosk mode milestone. Each maps to roadmap phases.

### Kiosk Playback

- [ ] **KIOSK-01**: User can press a key to enter kiosk mode (starts auto-advance, hides nav chrome)
- [ ] **KIOSK-02**: Presentation loops from last slide back to slide 1 in kiosk mode
- [ ] **KIOSK-03**: User can press a key to exit kiosk mode (restores nav, stops auto-advance)
- [ ] **KIOSK-04**: Kiosk mode hides dots, arrows, counter, and progress bar

### Auto-Scroll

- [ ] **SCROLL-01**: Each slide auto-scrolls from top to bottom over the 2-minute interval
- [ ] **SCROLL-02**: Scroll speed adapts to content height vs viewport height (short slides don't scroll)
- [ ] **SCROLL-03**: Auto-scroll resets to top when advancing to next slide
- [ ] **SCROLL-04**: Auto-scroll pauses/resumes correctly with kiosk mode state

### Portrait Display

- [ ] **PORT-01**: User can press a key to toggle portrait mode on any screen
- [ ] **PORT-02**: Portrait mode rotates content 90° via CSS transform or iframe wrapper
- [ ] **PORT-03**: Portrait mode scales content to fill the rotated viewport
- [ ] **PORT-04**: Portrait mode works in combination with kiosk mode

## Future Requirements

### Kiosk Management

- **KMGMT-01**: Remote kiosk control via URL parameters
- **KMGMT-02**: Scheduled kiosk start/stop times
- **KMGMT-03**: Multiple presentation playlist support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Remote control / network management | Complexity; not needed for single-screen kiosk |
| Electron or native app wrapper | Browser-only per constraints |
| Multi-file refactor | Keep monolithic HTML structure |
| Build system | Zero-build static HTML |
| New slide content | Kiosk features only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| KIOSK-01 | Phase 3 | Pending |
| KIOSK-02 | Phase 3 | Pending |
| KIOSK-03 | Phase 3 | Pending |
| KIOSK-04 | Phase 3 | Pending |
| SCROLL-01 | Phase 4 | Pending |
| SCROLL-02 | Phase 4 | Pending |
| SCROLL-03 | Phase 4 | Pending |
| SCROLL-04 | Phase 4 | Pending |
| PORT-01 | Phase 5 | Pending |
| PORT-02 | Phase 5 | Pending |
| PORT-03 | Phase 5 | Pending |
| PORT-04 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 — traceability complete after roadmap creation*
