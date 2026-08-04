# Template-Inspired Academic Homepage Implementation Plan

> **Status: superseded (2026-08-05).** This historical plan is retained for provenance and must not be executed against the current homepage.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `index.html` as a template-inspired, content-accurate academic homepage with polished, accessible interactions and no fictional template data.

**Architecture:** Keep the site dependency-free in one HTML document: semantic markup and real academic content first, an inline design system second, and a small progressive-enhancement script last. The script owns filters, author disclosure, clipboard feedback, scroll spy, and back-to-top behavior without making the page dependent on JavaScript.

**Tech Stack:** Static HTML, CSS custom properties, vanilla browser JavaScript, Node's built-in `node:test` contract tests, local `python3 -m http.server` for browser QA.

## Global Constraints

- Use only verified content already present in the repository; no fictional template identities or asset paths.
- Preserve all five published papers, the under-revision manuscript, five DOI URLs, contact routes, education, awards, and skills.
- Keep the page dependency-free and responsive at 320px and up.
- Use explicit transitions, visible focus states, and reduced-motion handling; never `transition: all`.
- All new-tab external links must use `rel="noopener noreferrer"`.

### Task 1: Replace the stale scaffold contract

**Files:**
- Modify: `tests/homepage.test.mjs`

- [ ] **Step 1: Write failing assertions for the template-inspired structure and interactions.**
- [ ] **Step 2: Run `node --test tests/homepage.test.mjs` and confirm the new contract fails against the old two-column markup.**

The contract must cover: `#about`, `#news`, `#publications`, `#experience`, `#awards`, and `#skills`; real identity and scholarly strings; publication `data-tags` plus filter buttons; author disclosure attributes; clipboard/back-to-top hooks; scroll spy; reduced motion; no fictional template text or `transition: all`; mobile overflow protection; and safe external links.

### Task 2: Implement the semantic homepage

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the header/profile and section navigation using actual identity, contact, education, and research-interest content.**
- [ ] **Step 2: Add News, Publications, Experience, Awards, and Skills sections using the preserved source record.**
- [ ] **Step 3: Add compact publication metadata, tag filters, author disclosure markup, copy controls, and the back-to-top control.**
- [ ] **Step 4: Replace the old CSS with the responsive template-inspired design system and explicit motion rules.**
- [ ] **Step 5: Add progressive-enhancement JavaScript for filter state, disclosures, clipboard feedback, scroll spy, and back-to-top focus management.**
- [ ] **Step 6: Run `node --test tests/homepage.test.mjs` and fix failures without weakening the contract.**

### Task 3: Browser iteration

**Files:**
- Modify: `index.html` only when visual or interaction defects are found.

- [ ] **Step 1: Serve the page with `python3 -m http.server 8080 --bind 127.0.0.1`.**
- [ ] **Step 2: Inspect desktop layout, section navigation, filter/disclosure/copy behavior, and back-to-top behavior in the browser.**
- [ ] **Step 3: Inspect 320px and 768px widths for clipping, overflow, and tap-target problems.**
- [ ] **Step 4: Apply focused fixes and rerun the static contract after each iteration.**

### Task 4: Verify and publish

**Files:**
- No new files unless verification reveals a regression.

- [ ] **Step 1: Run the full static test command and inspect `git diff --check`.**
- [ ] **Step 2: Review the diff for fake template content, unsafe links, broken local asset references, or accidental language-toggle remnants.**
- [ ] **Step 3: Commit the implementation with an intentional message.**
- [ ] **Step 4: Push `main` to the configured GitHub repository and report the commit and live URL.**
