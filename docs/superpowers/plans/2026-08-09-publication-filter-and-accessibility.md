# Publication Filter and Accessibility Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the duplicate mobile `Top` control, persist publication filters in the existing hash URL, and make secondary text meet WCAG AA contrast.

**Architecture:** Keep the dependency-free static site and its hash router. Add a small route parser that reads `#publications?filter=...`, use history entries for user filter/navigation changes, and re-render only the filter when the publication page is already loaded. Keep the color change token-based so all existing secondary text benefits consistently.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS, Node.js built-in test runner, in-app browser verification.

## Global Constraints

- Preserve the existing Cargo-style layout and bilingual pages.
- Keep `#publications` as the default Selected filter URL.
- Accept only `selected`, `all`, and `conference` filter values; invalid values fall back to `selected`.
- Do not add runtime dependencies or change unrelated page content.
- Verify with `node --test tests/*.test.mjs` and `git diff --check`.

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `tests/template-homepage.test.mjs`

**Interfaces:**
- Consumes: the current `index.html`, `script.js`, and `style.css` source strings already loaded by the test.
- Produces: failing assertions for one `Top` button, URL filter routing, and secondary-color contrast.

- [ ] **Step 1: Add the single-button assertion**

Add assertions in the homepage shell test:

```js
assert.equal((homepage.match(/id="btn-top"/g) ?? []).length, 1);
assert.doesNotMatch(homepage, /id="btn-top-right"/);
assert.match(script, /querySelector\('#btn-top'\)/);
assert.doesNotMatch(script, /#btn-top-right/);
```

- [ ] **Step 2: Add route-state assertions**

Add assertions that require the route parser, URL builder, history update, and browser history listeners:

```js
assert.match(script, /function parseRoute\(hash = location\.hash\)/);
assert.match(script, /URLSearchParams/);
assert.match(script, /filter=\$\{filter\}/);
assert.match(script, /history\.pushState/);
assert.match(script, /window\.addEventListener\('popstate'/);
assert.match(script, /window\.addEventListener\('hashchange'/);
assert.match(script, /loadPage\(route\.page, route\.filter\)/);
assert.match(script, /function initPubTabs\(initialFilter = 'selected'\)/);
```

- [ ] **Step 3: Add a computed contrast assertion**

Parse the CSS token and calculate relative luminance in the test so the assertion checks the actual token rather than only its spelling:

```js
const secondaryColor = style.match(/--swatch-4:\s*(#[0-9a-f]{6})/i)?.[1];
assert.ok(secondaryColor, 'secondary color token should be a hex color');
assert.ok(contrastRatio(secondaryColor, '#ffffff') >= 4.5);
assert.match(style, /\.year-label\s*\{[^}]*opacity:\s*1/);
```

Implement the small `contrastRatio` helper in the test file using the WCAG sRGB-to-linear formula.

- [ ] **Step 4: Run the focused test and confirm RED**

Run:

```bash
node --test tests/template-homepage.test.mjs
```

Expected: failure caused by the existing second button, missing route helpers, and the current 40% black color.

### Task 2: Implement the three minimal changes

**Files:**
- Modify: `index.html:64-68`
- Modify: `script.js:95-111,126-133,313-364,390-410,543-557`
- Modify: `style.css:7-12,346-348,952-960`

**Interfaces:**
- Consumes: the failing assertions from Task 1.
- Produces: `parseRoute(hash)`, `buildRouteHash(page, filter)`, `handleRoute()`, and `initPubTabs(initialFilter)` behavior used by the existing shell.

- [ ] **Step 1: Remove the duplicate control**

Keep only:

```html
<button class="mobile-footer-btn" id="btn-top" data-i18n="top">Top</button>
```

Use `document.querySelector('#btn-top')` in the footer initializer and set the mobile footer to `justify-content: flex-start`.

- [ ] **Step 2: Add route parsing and URL building**

Implement these vanilla JavaScript behaviors:

```js
const publicationFilters = new Set(['selected', 'all', 'conference']);

function parseRoute(hash = location.hash) {
  const raw = hash.replace(/^#/, '');
  const [pagePart, query = ''] = raw.split('?');
  const page = pagePart || 'home';
  const params = new URLSearchParams(query);
  const requestedFilter = params.get('filter');
  const filter = publicationFilters.has(requestedFilter) ? requestedFilter : 'selected';
  return { page, filter };
}

function buildRouteHash(page, filter = 'selected') {
  if (page === 'home') return '#';
  if (page === 'publications' && filter !== 'selected') {
    return `#publications?filter=${filter}`;
  }
  return `#${page}`;
}
```

Make page loading accept the parsed filter, and call `initPubTabs(route.filter)` after publication grouping.

- [ ] **Step 3: Connect clicks and back/forward navigation**

Route navigation should push a history entry and then call the same `handleRoute()` used by `popstate` and `hashchange`. If the current page is already `publications`, changing only the filter should call the tab-selection/filtering logic without fetching HTML again.

- [ ] **Step 4: Apply the contrast token**

Set:

```css
--swatch-4: #666666;
```

and explicitly set the mobile year label opacity to `1`.

- [ ] **Step 5: Run the focused regression test**

Run:

```bash
node --test tests/template-homepage.test.mjs
```

Expected: PASS.

### Task 3: Verify interactions and prepare handoff

**Files:**
- Inspect: `index.html`, `script.js`, `style.css`, `tests/template-homepage.test.mjs`
- Capture: `/Users/tim/.codex/visualizations/2026/08/09/personal-site-audit/` when browser verification is available

**Interfaces:**
- Consumes: the implementation from Task 2.
- Produces: fresh test, CSS contrast, URL-state, responsive, and repository-state evidence.

- [ ] **Step 1: Run the full test and whitespace checks**

Run:

```bash
node --test tests/*.test.mjs
git diff --check
```

Expected: all tests pass and no whitespace errors.

- [ ] **Step 2: Verify URL-state behavior in the browser**

At desktop and mobile widths, verify:

1. Opening `#publications?filter=conference` selects Conference Papers directly.
2. Clicking Full List and Conference Papers changes the fragment and visible content.
3. Back/forward restores the previous filter without losing the page.
4. Reloading the conference URL keeps Conference Papers selected.
5. Only one mobile `Top` button is visible.

- [ ] **Step 3: Verify contrast and responsive layout**

Confirm the computed `--swatch-4` color is `#666666`, its contrast against white is at least 4.5:1, and year labels no longer receive the extra mobile opacity reduction.

- [ ] **Step 4: Review the diff and repository state**

Run:

```bash
git diff --stat
git status --short --branch
git log -1 --oneline
```

Confirm only the requested implementation, tests, and design/plan documents are present.
