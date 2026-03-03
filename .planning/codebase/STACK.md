# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**
- HTML5 - Page markup and content structure for single-page presentation
- CSS3 - Styling, animations, and responsive layout
- JavaScript (Vanilla) - Slide deck logic, interactivity, and dynamic content

**Secondary:**
- Markdown - Documentation and configuration files (e.g., `.gitignore`)

## Runtime

**Environment:**
- Browser-based (no server runtime)
- Static site hosted on GitHub Pages

**Package Manager:**
- Not applicable (no npm/yarn/pip dependencies)
- No package.json or lock files present

## Frameworks

**Core:**
- None - Pure vanilla HTML/CSS/JavaScript (no frameworks like React, Vue, or Angular)

**Build/Dev:**
- GitHub Pages - Static site hosting
- No build tools (no webpack, Vite, esbuild, etc.)

## Key Dependencies

**External Scripts:**
- None embedded as npm packages

**Fonts:**
- Google Fonts (Playfair Display, Inter) - Loaded via CDN
  - Font URLs: `https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap`

**Media:**
- Vimeo embeds for video playback
  - Player URLs: `https://player.vimeo.com/video/*`
  - Videos embedded in iframes with autoplay, mute, and loop parameters

**Image Assets:**
- Local images stored in `/images` directory (27 images including photos of team members and partners)
- Hosted images loaded from external CDN: `images.squarespace-cdn.com` (legacy references)
- Image formats: JPEG, PNG, WebP

## Configuration

**Environment:**
- Static site - no environment variables or secrets required
- Domain: `thewolfondchair.ca` (configured in CNAME file)

**Build:**
- GitHub Pages automatic build and deployment
- Direct HTML file serving (no build step)

## Platform Requirements

**Development:**
- Text editor (no IDE or build tools required)
- Git for version control
- Web browser for testing

**Production:**
- GitHub Pages hosting
- Static HTTP(S) server
- CDN for external resources (Google Fonts, Vimeo, Squarespace CDN)

## Deployment

**Hosting Platform:**
- GitHub Pages
- DNS: CNAME points to `thewolfondchair.ca`
- No CI/CD pipeline configured
- Direct push to main branch triggers automatic deployment

## Browser Support

**Target Browsers:**
- Modern browsers supporting:
  - CSS Grid and Flexbox
  - CSS custom properties (--variables)
  - CSS animations and transitions
  - Fetch API (not used currently)
  - `100dvh` (dynamic viewport height)
  - Lazy loading images

**Mobile Support:**
- Responsive design with media queries at 768px and 900px breakpoints
- Touch-friendly navigation with larger tap targets

---

*Stack analysis: 2026-03-02*
