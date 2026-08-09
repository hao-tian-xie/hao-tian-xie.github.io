# Publication Filter and Accessibility Improvements Design

**Date:** 2026-08-09
**Status:** Approved for implementation

## Goal

Improve the existing academic website in three focused areas: remove the duplicate mobile `Top` control, make the publication filter state shareable and recoverable through the existing hash router, and bring secondary text to WCAG AA contrast levels.

## Constraints

- Preserve the existing Cargo-style layout, bilingual content, hash-based page navigation, and dependency-free static-site setup.
- Keep the change limited to the three requested issues; do not redesign unrelated components.
- Preserve the existing default URL `#publications` for the Selected filter.
- Keep the existing test runner: `node --test tests/*.test.mjs`.

## Design

### 1. Single mobile `Top` control

Keep the existing left-side `#btn-top` button and remove `#btn-top-right`. The mobile footer will use `justify-content: flex-start` so the remaining control keeps the current left alignment. The click handler will bind only to `#btn-top`.

### 2. URL-addressable publication filters

Use the existing hash router with a query-like fragment:

- Selected: `#publications`
- Full List: `#publications?filter=all`
- Conference Papers: `#publications?filter=conference`

The route parser will split the hash into a page name and `URLSearchParams`, accept only `selected`, `all`, and `conference`, and fall back to Selected for unknown values. Clicking a navigation link or publication tab will create a history entry with `history.pushState`. `popstate` and `hashchange` will re-apply the route, so reload and browser back/forward restore the correct page and filter. Language changes will re-render the current route without dropping its filter.

When the page is already `publications`, changing only the filter will update the visible tab and publication list without refetching the page fragment. Navigating to another page will retain the current page-loading behavior.

### 3. WCAG secondary text color

Change `--swatch-4` from 40% black to `#666666`. On the existing white background this produces a contrast ratio of approximately 5.74:1, meeting WCAG AA for normal text. Remove the mobile-only 50% opacity applied to `.year-label`; otherwise that specific label would be composited back to an insufficient contrast level.

## Error handling

- Invalid or missing `filter` values resolve to `selected`.
- Existing page-load errors continue to show the existing bilingual load-error message.
- If browser history APIs are unavailable, the site still has the existing hash-change path as a fallback for direct navigation.

## Verification

- Static regression tests assert exactly one `Top` button, the route syntax and event handling, and a computed WCAG contrast ratio of at least 4.5:1 for the secondary color.
- Browser checks cover direct conference URL loading, filter clicks, reload, back/forward, and mobile layout at 390px width.
- Run `node --test tests/*.test.mjs` and `git diff --check` before handoff.
