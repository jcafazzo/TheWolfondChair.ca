# Codebase Structure

**Analysis Date:** 2026-03-02

## Directory Layout

```
TheWolfondChair.ca/
├── index.html                      # Redirect to main report HTML
├── wolfond-report-2024-2026.html   # Main application (monolithic SPA)
├── CNAME                           # DNS configuration for custom domain
├── .gitignore                      # Git ignore patterns
├── images/                         # Asset directory for photos and logos
│   ├── Henry_wolfond.jpg           # Henry Wolfond capsule exit photo
│   ├── henry-wolfond-ns28.jpg      # Henry Wolfond second photo
│   ├── Daniel_Franklin_500-1.png   # Speaker/contributor photo
│   ├── 2.webp                      # Miscellaneous graphic
│   ├── 2560px-Boehringer_Ingelheim_Logo.svg.webp  # Partner logo
│   ├── [23 more image files]       # Team member photos, logos, supporting graphics
│   └── [total: 25 image assets]
└── .planning/                      # GSD planning documents (generated)
    └── codebase/
        ├── ARCHITECTURE.md         # Architecture analysis
        └── STRUCTURE.md            # This file
```

## Directory Purposes

**Root Directory:**
- Purpose: Project root, hosting entry point, configuration
- Contains: HTML files, domain configuration, git metadata
- Key files: `index.html` (redirect), `wolfond-report-2024-2026.html` (main app), `CNAME` (domain)

**images/ Directory:**
- Purpose: Storage for all visual assets used in the presentation
- Contains: Photographs of team members, speakers, contributors; logos (Boehringer Ingelheim); candid photos; event photos
- Key files:
  - `Henry_wolfond.jpg` - Primary photo of Henry Wolfond
  - `henry-wolfond-ns28.jpg` - Alternative Henry Wolfond photo
  - `Daniel_Franklin_500-1.png` - Speaker asset
  - `toronto_life.png` - Press feature artwork
  - Team member photos: `jaclyn-hearnden.jpg`, `jennywei.jpg`, `soyun_oh.jpg`, etc.

**.planning/ Directory:**
- Purpose: GSD planning and documentation
- Contains: Codebase analysis documents for future development phases
- Committed: No (generated at runtime by `/gsd:map-codebase`)

## Key File Locations

**Entry Points:**

- `index.html`: Redirect stub that points to main report
  - Single meta refresh tag: `<meta http-equiv="refresh" content="0;url=wolfond-report-2024-2026.html">`
  - Purpose: Serve as domain root; actual content in main HTML file

- `wolfond-report-2024-2026.html`: Main application file
  - Lines 1-9: DOCTYPE, head metadata, viewport
  - Lines 10-630: Embedded CSS styles and typography system
  - Lines 631-1006: Slide templates and data arrays
  - Lines 1008+: JavaScript logic and initialization
  - Purpose: Complete SPA with all markup, styles, and logic

**Configuration:**

- `CNAME`: Single line containing domain name
  - Purpose: GitHub Pages DNS routing

- `.gitignore`: Excludes source materials from version control
  - Patterns: `*.mp4`, `*.pptx`, `*.pdf`, `*.DS_Store`, directories like `assets/`, `publications/`, `Wolfond 2025 report/`
  - Purpose: Keep repo focused on distribution artifacts only

**Core Logic:**

- `wolfond-report-2024-2026.html` (script section):
  - Lines 437-1006: `buildSlides()` function - generates all 17 slide templates
  - Lines 1008-1031: Video modal system (`openVideoModal`, `closeVideoModal`)
  - Lines 1033-1072: Conversation autoplay setup and management
  - Lines 1074-1094: Video mute toggle control
  - Lines 1096-1136: Auto-advance timer system
  - Lines 1138-1159: Slide engine (`init`, `goToSlide`)
  - Lines 1161+: Navigation and event bindings

**Testing:**

- Not applicable. No test directory or test files.

## Naming Conventions

**Files:**

- HTML: `[name]-[year]-[year].html` (e.g., `wolfond-report-2024-2026.html`)
- Configuration: UPPERCASE single word (`CNAME`, `.gitignore`)
- Images: Lowercase with underscores or dashes: `Henry_wolfond.jpg`, `jaclyn-hearnden.jpg`, `toronto_life.png`

**Directories:**

- Asset directory: Lowercase plural (`images/`)
- Planning directory: Dotfile prefix (`.planning/`)
- Subdirectories: Lowercase, hierarchical (`codebase/`)

**CSS Classes:**

- Slide variants: Kebab-case with semantic names (`.cover`, `.split`, `.dark-slide`, `.grid-slide`, `.deep-slide`)
- UI components: Kebab-case with prefix (`.slide-dot`, `.slide-arrow`, `.slide-counter`, `.slide-nav`)
- Semantic prefixes:
  - `.t-` for typography (`.t-display`, `.t-heading`, `.t-subheading`, `.t-body`, `.t-caption`, `.t-italic`)
  - `.slide-` for slide controls (`.slide-dot`, `.slide-arrow`, `.slide-nav`, `.slide-inner`, `.slide-counter`)
  - `.team-` for team grid components (`.team-grid-wrap`, `.team-person`, `.team-avatar`, `.team-person-name`)
  - `.convo-` for conversation videos (`.convo-grid`, `.convo-card`, `.convo-thumb`, `.convo-inline-video`)
  - `.pub-` for publication list (`.pub-row`, `.pub-yr`, `.pub-cite`, `.pub-link`)
  - `.project-` for project grid (`.project-row`, `.project-name`, `.project-desc`)

**JavaScript Functions:**

- Camel case with verb prefix:
  - Navigation: `goToSlide()`, `updateCounter()`
  - Video: `openVideoModal()`, `closeVideoModal()`, `toggleVideoMute()`, `setupConvoAutoplay()`, `startConvoAutoplay()`, `stopConvoAutoplay()`
  - Building: `buildSlides()`, `buildPubList()`, `init()`
  - Timer: `startAutoAdvance()`, `stopAutoAdvance()`, `resetAutoAdvance()`, `updateCounterDisplay()`

**Data Objects:**

- Array names: Lowercase plural: `publications`, `team`, `CONVO_VIDEOS`
- Object properties: Camel case: `name`, `role`, `id`, `affiliation`
- Constants: UPPERCASE with underscores: `AUTO_SECONDS`, `CONVO_SLIDE_INDEX`, `CAMPUS_IMG`

## Where to Add New Code

**New Slide:**

- Primary code: Add template string to `buildSlides()` function (lines 437-1006 in `wolfond-report-2024-2026.html`)
- Add new CSS variant class if needed (in `<style>` section, lines 10-630)
- Update slide count in any hardcoded references (e.g., `slides.length`)
- Update slide index constant if this slide has special behavior (like `CONVO_SLIDE_INDEX = 13`)

**New Component (e.g., Publication Card, Team Member):**

- Implementation: Add to data array (`publications`, `team`)
- Rendering: Update corresponding template in `buildSlides()` that iterates this array
- Styling: Add CSS class definition in `<style>` section

**New Media Element (Image, Video):**

- Static image: Add file to `images/` directory, reference via relative path `images/filename.ext` in HTML
- Vimeo video: Add video ID to `CONVO_VIDEOS` array or hardcode into slide template with Vimeo embed URL

**New Event Handler:**

- Add inline `onclick` attribute to element in slide template
- Define function in script section with camel-case name following `startAction()`, `stopAction()`, or `toggleAction()` pattern

## Special Directories

**images/ Directory:**

- Purpose: All visual assets for presentation rendering
- Generated: No
- Committed: Yes
- Size: ~25 files, ~5-6 MB total
- Types: JPEG, PNG, WebP formats for compatibility and file size optimization

**.planning/ Directory:**

- Purpose: GSD planning documents for future development
- Generated: Yes (created by `/gsd:map-codebase` command)
- Contains: Markdown analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)

## Image Assets by Purpose

**Team/Speaker Photos:**
- `jaclyn-hearnden.jpg`, `jennywei.jpg`, `soyun_oh.jpg`, `pedro_miranda.jpg`, `sejal_bhalla.jpg`, `alicia.jpg`
- `deleram.jpg`, `derek_liu.jpg`, `Daniel_Franklin_500-1.png`
- `Karen-young.webp`, `Salaar-Liaqat.png`, `brenna.jpg`, `Jennifer-Lounsbury.jpg`
- `Ting.webp`, `voorheis.jpg`

**Featured Person:**
- `Henry_wolfond.jpg` - Henry Wolfond (primary photo)
- `henry-wolfond-ns28.jpg` - Henry Wolfond alternate
- `IMG_3073.webp` - Event/documentary photo

**Logos/Graphics:**
- `2560px-Boehringer_Ingelheim_Logo.svg.webp` - Partner organization logo
- `toronto_life.png` - Toronto Life feature artwork
- `2.webp` - Generic graphic asset
- `icair.webp` - Program/initiative logo

## Performance Notes

**Image Optimization:**
- Mix of formats: JPG for photos, PNG for graphics, WebP for newer browsers
- Images lazy-loaded on appropriate slides (using `loading="lazy"` attribute)
- No image preloading; relies on on-demand loading as slides become active

**Asset Loading Order:**
- HTML document parsed first (82KB)
- Images loaded on-demand as slides become visible
- Vimeo embeds load only when slide becomes active (lines 1177-1189)
- No bundling or asset pipeline (raw files served directly)

---

*Structure analysis: 2026-03-02*
