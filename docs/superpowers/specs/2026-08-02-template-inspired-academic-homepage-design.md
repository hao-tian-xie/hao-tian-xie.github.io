# Template-Inspired Academic Homepage Design

> **Status: superseded (2026-08-05).** The current production contract requires a plain, card-free, avatar-free, animation-free semantic homepage with responsive bilingual and theme controls. See `index.html` and `tests/homepage.test.mjs` for the active contract.

## Goal

Rewrite the homepage around the information architecture of `w-r-s/academic-homepage-template` while keeping Haotian Xie's verified academic record, links, and original visual identity. The result should feel like a focused research homepage rather than a generic template demo.

## Design direction

- Use the template's single-column academic rhythm: a compact profile header, a sticky section index, and clearly separated `About`, `News`, `Publications`, `Experience`, `Awards`, and `Skills` sections.
- Keep the site's existing blue accent and real headshot instead of importing the template's orange palette, fictional astronaut, sample projects, or missing image assets.
- Replace table-heavy presentation with semantic sections and responsive cards while retaining the template's concise metadata treatment for dates, venues, and tags.
- Treat interaction as progressive enhancement: all scholarly content remains visible without JavaScript, while filters, disclosure controls, copy actions, scroll spy, and back-to-top improve navigation when available.

## Interaction contract

- Publication tag buttons filter visible publication cards and expose the active state with `aria-pressed`.
- Long author lists use disclosure buttons with `aria-expanded` and `aria-controls`; collapsed state remains readable as a short author line.
- Copy-email and copy-bio controls use the Clipboard API when available and provide an adjacent live status message; they do not hide the underlying email or biography.
- Section navigation updates `aria-current` from the URL and reading position, including the final section at document end.
- Back-to-top appears after scrolling, returns focus to the page heading, and respects reduced-motion preferences.
- Every external link opened in a new tab includes `rel="noopener noreferrer"`.

## Content rules

- Preserve the five published papers, the under-revision manuscript, five DOI links, education, current PolyU role, Ph.D. search note, awards, languages, programming, and tools from the original homepage.
- Add no fictional names, institutions, projects, awards, or template asset paths.
- Keep the page dependency-free and usable when external fonts or scripts are unavailable.

## Responsive and motion rules

- No horizontal overflow at 320px, 768px, or desktop widths.
- Use explicit, bounded transitions; never `transition: all`.
- Hover-only lift effects live inside a pointer/hover media query; controls have keyboard-visible focus styles.
- `prefers-reduced-motion: reduce` disables non-essential movement and smooth scrolling.
