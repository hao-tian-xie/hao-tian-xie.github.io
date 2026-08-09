# Move Experience and Education into About Me Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the complete Experience and Education records into the About Me section, simplify the biography copy, add the updated supervisor links, and keep the English and Chinese homepage views synchronized.

**Architecture:** Keep the static-fragment architecture. Render one new background block below the existing About grid in both language fragments, remove the duplicate Experience/Education blocks from both Misc fragments, and bump the fragment cache version so the homepage and About route load the new content.

**Tech Stack:** Static HTML fragments, CSS, Node.js built-in test runner, GitHub Pages.

## Global Constraints

- Modify both English and Chinese content fragments together.
- Use “obtained/获得了” wording; remove the old “completed/完成了” wording from the biography.
- Include the supervisor links for Paul Tsang, Jiayang Li, Zengru Di, and Lei Chen.
- Preserve the existing site structure, accessibility conventions, and no-dependency frontend.
- Update the cache version and sitemap `lastmod` when rendered content changes.

### Task 1: Add the failing regression assertions

**Files:**
- Modify: `tests/template-homepage.test.mjs`

- [x] **Step 1: Add assertions for the new About content and removed Misc duplicates**

Assert that English and Chinese About fragments contain the new background headings, all supervisor links, and the new obtained wording; assert that the old completed wording and the Experience/Education headings are absent from the corresponding Misc fragments.

- [x] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/template-homepage.test.mjs`

Expected: FAIL because the current fragments still contain the old biography and the records remain in Misc.

### Task 2: Move and update the static content

**Files:**
- Modify: `pages/about.html`
- Modify: `pages/zh/about.html`
- Modify: `pages/misc.html`
- Modify: `pages/zh/misc.html`

- [x] **Step 1: Replace the English biography paragraph**

Use the concise obtained wording and keep university links; place the detailed programmes and supervisors in the new Education list.

- [x] **Step 2: Replace the Chinese biography paragraph**

Use “获得了” and the concise dual-degree wording; use the new Education list for programme and supervisor details.

- [x] **Step 3: Add the Experience and Education block below the existing About grid**

Add English and Chinese lists with the exact date ranges, roles/degrees, institutions, and supervisor links requested.

- [x] **Step 4: Remove the duplicate Experience and Education blocks from Misc**

Leave Honors & Awards and Academic Services / Peer Review Experience in place.

### Task 3: Preserve layout and cache correctness

**Files:**
- Modify: `style.css`
- Modify: `index.html`
- Modify: `script.js`
- Modify: `sitemap.xml`

- [x] **Step 1: Style the new background block responsively**

Use the existing typography and swatches, a two-column desktop layout, and a one-column mobile layout.

- [x] **Step 2: Bump the cache version from 37 to 38**

Update every linked CSS/JS and fragment version reference required by the current loader.

- [x] **Step 3: Update sitemap `lastmod` to `2026-08-09`**

### Task 4: Verify and publish

- [x] **Step 1: Run the Node regression tests and scanner**

Run `node --test tests/*.test.mjs` and the academic website scanner; confirm English/Chinese parity and no missing assets.

- [x] **Step 2: Run syntax and diff checks**

Run `node --check script.js`, inspect `git diff --check`, and review the diff for only the requested content/layout/cache changes.

- [x] **Step 3: Verify local pages; deployment verification is pending the protected main-branch push**

Check the homepage and About route in English and Chinese, responsive layout, links, and browser console; then verify GitHub Pages returns the new cache version and HTTP 200.

- [x] **Step 4: Commit the completed update locally**

Directly pushing `main` was blocked by the environment's production-branch protection, so GitHub Pages has not been changed by this task.

Commit the requested content update and push the current deployment branch.
