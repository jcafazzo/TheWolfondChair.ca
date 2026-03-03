# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**Content Delivery:**
- Google Fonts - Typography delivery
  - Service: Font loading via CDN
  - URL: `https://fonts.googleapis.com`
  - Fonts: Playfair Display (serif), Inter (sans-serif)

**Video Hosting & Playback:**
- Vimeo - Video player embeds
  - Service: Video hosting and streaming
  - Implementation: Iframe embeds with player URLs
  - Video IDs referenced in code:
    - `1169720277` - CDTX Media video
    - `1169720780` - CHIN Media video (with text track)
  - Player parameters: `background=1`, `autoplay=1`, `muted=1`, `loop=1`, `texttrack=en`
  - Dynamic control: Videos autoplay when Media slide (index 12) is active, stop when navigating away

## Data Storage

**Databases:**
- Not applicable - No database integration

**File Storage:**
- Local filesystem: `/images` directory
  - Contains 27 static image assets (JPEG, PNG, WebP)
  - Lazy loading enabled for performance

**Legacy CDN References:**
- Squarespace CDN: `images.squarespace-cdn.com`
  - Hosts team member photos and institutional images
  - URLs embedded in JavaScript constant `TEAM_PHOTOS`
  - Example: `https://images.squarespace-cdn.com/content/v1/623360bd0806e50fc75a9b9e/...`

**Caching:**
- Browser caching only (via HTTP cache headers)
- No service workers or explicit caching strategy

## Authentication & Identity

**Auth Provider:**
- None - Static public site, no authentication required

## Monitoring & Observability

**Error Tracking:**
- Not integrated

**Logs:**
- Browser console only (no centralized logging)

**Analytics:**
- Not detected (no Google Analytics, Mixpanel, or similar tracking)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (automatic deployment from main branch)

**CI Pipeline:**
- None configured - Direct static file serving

**Domain Management:**
- CNAME file: Points to `thewolfondchair.ca`

## Environment Configuration

**Required env vars:**
- None - No server-side environment configuration

**Secrets location:**
- Not applicable - No secrets or credentials

## External Image References

**Team Member Photos (Squarespace CDN):**
The following team members have photos hosted on external CDN:
- Dr. Joseph Cafazzo
- Dr. Quynh Pham
- Antonia Barbaric
- Ken Christofferson
- Pedro Velmovitsky
- Ting Xiong
- Camila Benmessaoud
- Karan Dave
- Ian Connell
- Kevin Tallevi

**Institutional Images (Squarespace CDN):**
- UHN (University Health Network) building image
- Campus image from Unsplash

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable

## API Integrations Summary

**Read-Only Operations:**
1. Google Fonts API - Font file delivery
2. Vimeo Player API - Video iframe embedding and control
3. Image CDN - Asset serving from Squarespace

**No Write Operations:**
- Site is fully static with no server-side data persistence or external API calls

## Performance Considerations

**External Dependencies:**
- Google Fonts: Preconnected via `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Vimeo iframes: Dynamically loaded and unloaded based on slide navigation
- CDN images: Lazy loaded with `loading="lazy"` attribute

**Fallback Strategy:**
- Local images in `/images` directory serve as fallback for Squarespace CDN references
- Core functionality works without external CDN if needed (can be updated to use local images)

---

*Integration audit: 2026-03-02*
