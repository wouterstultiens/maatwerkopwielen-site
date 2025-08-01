# Design Audit

This document captures observed design issues and improvement suggestions for the Maatwerk op Wielen website, covering visual layout, spacing, typography, color contrast, responsiveness, navigation, and overall cleanliness.

## Visual Layout & Spacing
- Inconsistent vertical spacing between sections (e.g., Hero `py-20` vs Services `py-20` visually feels dense on large screens).
- Section padding does not scale proportionally across breakpoints; suggest using responsive spacing utilities (e.g., `md:py-24`, `lg:py-32`).
- Buttons and CTAs appear cramped under headings; increase margin-bottom on headings or margin-top on buttons for better separation.
- Grid gaps (`gap-8`) in Services section feel small on desktop; consider increasing to `gap-12` or `gap-16`.

## Typography & Color Contrast
- Use of `text-secondary-light` (#6B7280?) on white background has low contrast; check WCAG AA ratio and darken color to `text-gray-600`.
- Hero heading scales from `text-4xl` to `text-6xl`, but on small mobile it may overflow; ensure `sm:text-5xl` or `base:text-3xl` for 375px view.
- Link hover color changes are subtle; consider adding underline on hover or increasing color shift for clarity.
- Body copy `text-lg` size is legible, but line-height may be too tight; suggest adding `leading-relaxed` (`leading-7` or `leading-8`).

## Responsiveness
### Desktop (1440px)
- Container max-width is `max-w-screen-lg`; on ultra-wide screens, content feels narrow; consider `max-w-screen-xl` or `2xl`.
- Hero image width fixed at `w-64`; appears small relative to text on large screens; consider `md:w-80 lg:w-96`.

### Mobile (375px)
- Navbar hides links and CTA without alternative menu; users cannot access navigation on mobile; implement a hamburger menu or off-canvas nav.
- Hero image at `w-64 h-64` may overflow; use responsive sizing (`w-48 h-48` on `sm:` breakpoint).
- Services section stacked with `gap-8`; ensure sufficient vertical padding and adjust card padding to `p-4 sm:p-6`.
- CTA tap targets meet size guidelines, but ensure consistent `py-4` and `px-4` for mobile.

## Navigation & Information Clarity
- No active link state in navbar; add styling for current section to orient users.
- Anchor links jump abruptly; implement smooth scrolling for better UX.
- Section headings use `<h2>` and `<h3>`, but some sections (FAQ, Contact) lack numeric hierarchy; ensure proper HTML heading structure.

## Overall Cleanliness
- Use of emojis as service icons may not align with professional tone; consider SVG icons for consistency and accessibility.
- Some meta tags include incorrect image path (`/owner .png`); correct spacing in OG image URL.
- HTML includes unnecessary whitespace in OG tags; remove redundant spaces.
- CSS classes are consistent but may accumulate unused utilities; consider running PurgeCSS analysis.

---
**Summary:** Implemented visual and responsive design improvements across all components: refined layout spacing with responsive py and gap utilities, enhanced typography scales and line-heights, improved color contrast, mobile-friendly navbar with off-canvas menu and active link states, adaptive Hero image sizing, expanded Services grid gaps and responsive padding, consistent breakpoints and container widths, replaced emoji icons with SVGs, and fixed OG image path.

**Next Steps:** Conduct cross-browser testing on desktop (1440px) and mobile (375px) views, finalize QA, and prepare for production deployment.