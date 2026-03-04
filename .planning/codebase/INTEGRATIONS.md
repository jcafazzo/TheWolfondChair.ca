# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**Video Hosting:**
- Vimeo - Video embedding and playback
  - SDK/Client: Vimeo Player (iframe embeds)
  - Integration: `https://player.vimeo.com/video/{videoId}`
  - Usage: Background videos in slides and modal video player
  - Test evidence: `tests/video-modal.spec.ts` validates Vimeo embed loading

**Content Distribution:**
- Squarespace CDN (images.squarespace-cdn.com) - Image hosting and optimization
  - All profile images and team photos served from Squarespace CDN
  - URLs pattern: `https://images.squarespace-cdn.com/content/v1/[path]`
  - Lazy loading enabled via `loading="lazy"` attribute
  - Used in: Profile thumbnails, speaker images, institutional photos

**External Links/References:**
- DOI.org - Digital Object Identifier resolution for academic citations
  - Integration: `https://doi.org/${p.doi}` for publication links
  - Usage: Research citations throughout presentation

**News & Media:**
- CTV News - External news article links
- Toronto Life - Feature article reference
- Newswire - Health initiative announcements
- CanHealth - Medical reporting
- Ontario Health Association (OHA) - Industry news
- All linked with `target="_blank"` for new window navigation

## Data Storage

**Databases:**
- Not applicable - Static presentation site with no backend
- No persistent storage
- No data models or schemas

**File Storage:**
- Local filesystem (development/build): `/images/` directory contains 24 image files (.webp, .jpg, .png)
  - Images referenced: 23 image assets locally
  - External CDN: Squarespace CDN hosts some duplicate/additional profile images
- Production: Static files served via HTTP

**Caching:**
- HTTP browser caching - Implicit via static HTTP server
- No explicit caching service or CDN layer beyond Squarespace CDN

## Authentication & Identity

**Auth Provider:**
- Custom or none - Static presentation has no authentication
- No user login required
- No authorization checks

## Monitoring & Observability

**Error Tracking:**
- Not integrated - Static presentation site

**Logs:**
- Browser console - Standard JavaScript logging (no external service)
- Test output - Playwright reporters only (HTML and list format in `playwright-report/`)
- Development server logs - Python http.server stdout/stderr (stderr captured in tests)

**Trace Collection:**
- Playwright trace collection enabled: `trace: 'on-first-retry'` in `playwright.config.ts`
- Traces stored in `playwright-report/` after test failures

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (inferred from repository URL and CNAME file)
- Traditional static web hosting compatible

**CI Pipeline:**
- GitHub Actions - Runs on CI when `process.env.CI` is set
- Playwright test configuration respects CI environment:
  - Non-CI: Reuses existing server via `reuseExistingServer: true`
  - CI: Creates fresh server on each run via `reuseExistingServer: !process.env.CI`
- No explicit deploy configuration detected

**Test Automation:**
- Playwright test runner orchestrates testing
- Multi-browser testing via project configurations:
  - Desktop Chrome (1280x800)
  - Mobile iPhone 14
  - Mobile Pixel 5
- Reporter: HTML report (open: 'never'), list reporter for CI

## Environment Configuration

**Required env vars:**
- `CI` - Optional flag to disable server reuse in test environment

**Secrets location:**
- No secrets required - Static presentation
- No `.env` file needed
- Repository public (GitHub-hosted, CNAME pointing to custom domain)

## Font Delivery

**Google Fonts:**
- Playfair Display (serif) - Weights 400, 500, 600, 700, 800 + italics
- Inter (sans-serif) - Weights 300, 400, 500, 600
- Preconnect: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- CSS load: Via Google Fonts stylesheet

## Webhooks & Callbacks

**Incoming:**
- None - Static presentation

**Outgoing:**
- None - No external API calls from application code
- External links are user-initiated clicks (not programmatic callbacks)

## Video Content

**Video Embedding:**
- Vimeo IDs referenced:
  - 1169716954 - Background video (main)
  - 1169720277 - Background video (alternate)
  - 1169720780 - Background video with captions
  - 1169672887 - Video modal examples (test fixture)
  - Dynamic video IDs stored in JSON data structure within HTML
- Embedding method: Iframe with parameters (autoplay, muted, loop, badge disabled, DNT)
- Modal implementation: Custom `openVideoModal()` and `closeVideoModal()` JavaScript functions

## Link References

**Internal Cross-Links:**
- None within presentation (single-page app)
- All external links point to partner organizations, news outlets, and research sites

---

*Integration audit: 2026-03-04*
