# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- HTML5 - Main presentation markup
- CSS3 - All styling, animations, and responsive design
- JavaScript (ES6+) - Client-side interactivity and slide navigation
- TypeScript - Test files and development tools

**Secondary:**
- Python3 - HTTP server for local development

## Runtime

**Environment:**
- Node.js 18+ - Required for running tests

**Package Manager:**
- npm 10+ (with lockfile `package-lock.json`)
- Lockfile: Present and up-to-date

## Frameworks

**Core:**
- HTML/CSS/JavaScript (vanilla) - No frontend framework; static presentation site
- Vimeo Player API - Embedded video playback in modal and background videos

**Testing:**
- Playwright 1.58.2 - E2E and visual regression testing framework
- @playwright/test 1.58.2 - Test runner and assertion library

**Build/Dev:**
- Playwright Test Runner - Executes tests with multi-browser support
- Python3 `http.server` - Development web server (served on port 8080)

## Key Dependencies

**Critical:**
- `@playwright/test` 1.58.2 - Essential for E2E testing across desktop and mobile viewports
- `playwright` 1.58.2 - Core Playwright automation and browser orchestration

**Infrastructure:**
- `playwright-core` 1.58.2 - Low-level browser control (transitively required)
- `fsevents` 2.3.2 - Optional macOS file system watching for test watcher mode

## Configuration

**Environment:**
- No .env file required - Project has no environment variables or secrets
- `CI` environment variable - When set, disables reusing existing test server (via `process.env.CI` in `playwright.config.ts`)
- Development server auto-runs via Playwright unless `CI=true`

**Build:**
- `playwright.config.ts` - Test configuration file at project root
  - Test directory: `./tests`
  - Test reporters: HTML and list format
  - Workers: 1 (sequential execution)
  - Retries: 0 per test
  - Base URL: `http://localhost:8080/wolfond-report-2024-2026.html`

## Platform Requirements

**Development:**
- Node.js 18 or higher
- npm 10+
- Python 3 (for development server)
- OS: macOS, Linux, or Windows with Playwright support

**Production:**
- Static web server (any HTTP server)
- Deployment target: Any static hosting (GitHub Pages, Vercel, Netlify, traditional web hosting)
- Browser requirements: Modern browsers with HTML5, CSS3, ES6+ JavaScript support

## Project Type

**Architecture:**
- Single-page presentation application
- No build step required (vanilla HTML/CSS/JS)
- No external dependencies in production code
- Test-driven development with Playwright for regression testing

**Asset Pipeline:**
- Images stored locally in `/images` directory
- Embedded assets: One large HTML file (`wolfond-report-2024-2026.html`, 85KB) containing all slides
- Font delivery: Google Fonts (Playfair Display, Inter) via CDN

---

*Stack analysis: 2026-03-04*
