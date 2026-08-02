# Apple-Inspired Bilingual Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Deliver an Apple-inspired, bilingual, dependency-free academic homepage that preserves Haotian Xie's existing scholarly record and deploys directly to GitHub Pages.

**Architecture:** Keep the site as one semantic HTML document with embedded CSS and a small deferred script. Interface strings use \`data-i18n\` keys and are switched from an inline English/Chinese dictionary; canonical publication titles stay in English. Node's built-in test runner inspects the static page, avoiding a runtime or package dependency.

**Tech Stack:** HTML5, CSS custom properties/media queries, vanilla JavaScript, Node.js built-in \`node:test\`, GitHub Pages.

## Global Constraints

- Preserve every existing publication, award, education record, research field, DOI, Scholar search, Google Scholar profile, and email address.
- Do not introduce a framework, CDN, tracking, Apple asset, Apple logo, copied Apple copy, or build step.
- Use system typography and a unique academic midnight/cobalt visual language rather than Apple branding.
- The language preference key is exactly \`haotian-language\`; default to English unless browser language starts with \`zh\`.
- Switching updates \`html[lang]\`, document title, visible copy, the control's \`aria-pressed\`, and its destination-language accessible label.
- Motion uses exact-property transitions, \`transform\`/opacity only for movement, subtle \`scale(0.97)\` press feedback, custom ease-out, and reduced-motion/reduced-transparency/contrast fallbacks.
- All external \`target="_blank"\` links include \`rel="noopener noreferrer"\`.

---

### Task 1: Establish static regression tests

**Files:**
- Create: \`tests/homepage.test.mjs\`
- Modify: none
- Test: \`tests/homepage.test.mjs\`

**Interfaces:**
- Consumes: \`index.html\` as UTF-8 text through \`readFile(new URL('../index.html', import.meta.url))\`.
- Produces: \`node --test tests/homepage.test.mjs\`, a no-dependency verification command with named test cases.

- [ ] **Step 1: Write the failing test**

~~~js
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('exposes an accessible bilingual language control', () => {
  assert.match(html, /id="language-toggle"/);
  assert.match(html, /data-i18n="languageToggle"/);
  assert.match(html, /haotian-language/);
  assert.match(html, /data-i18n="title"/);
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: \`node --test tests/homepage.test.mjs\`

Expected: FAIL because the existing homepage has no language toggle or preference key.

- [ ] **Step 3: Expand the failing tests to lock user-visible requirements**

~~~js
test('keeps the academic record and secure external links', () => {
  for (const title of [
    'Topological persistence pinpoints higher-order network vulnerabilities',
    'Decentralized autonomous organizations in e-commerce supply chains',
    'A Virtual Node-Based Zero-Shot Learning Framework for Link Prediction in Complex Networks',
  ]) assert.match(html, new RegExp(title));
  assert.match(html, /https:\/\/doi\.org\/10\.1063\/5\.0293652/);
  assert.match(html, /mailto:haotiantimxie@gmail\.com/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test('contains semantic, responsive, and motion-accessible page hooks', () => {
  for (const selector of ['<header', '<main', '<footer', 'class="skip-link"', 'prefers-reduced-motion', 'prefers-reduced-transparency', 'prefers-contrast: more']) {
    assert.ok(html.includes(selector), \`missing \${selector}\`);
  }
});
~~~

- [ ] **Step 4: Run test to verify it fails for the intended missing behavior**

Run: \`node --test tests/homepage.test.mjs\`

Expected: FAIL with missing bilingual/accessibility hooks, not a test syntax error.

- [ ] **Step 5: Commit**

~~~bash
git add tests/homepage.test.mjs
git commit -m "test: define homepage redesign contract"
~~~

### Task 2: Build the semantic bilingual content structure

**Files:**
- Modify: \`index.html\`
- Test: \`tests/homepage.test.mjs\`

**Interfaces:**
- Consumes: existing factual copy and outbound links from current \`index.html\`; translation keys from the inline \`copy\` object.
- Produces: landmark-based HTML with \`data-i18n\`, \`data-i18n-html\`, \`data-i18n-placeholder\`, and \`data-i18n-aria\` hooks consumed by \`setLanguage(language)\`.

- [ ] **Step 1: Implement a content-complete document skeleton**

~~~html
<a class="skip-link" href="#main-content" data-i18n="skipLink">Skip to content</a>
<header class="site-header" aria-label="Primary">
  <a class="brand" href="#top" aria-label="Haotian Xie home"><span>HX</span></a>
  <nav class="site-nav" aria-label="Primary navigation">…</nav>
  <button id="language-toggle" class="language-toggle" type="button" aria-pressed="false" data-i18n="languageToggle">中文</button>
</header>
<main id="main-content">…</main>
~~~

Include the hero, research cards, six publication records (including the under-revision work), education, skills, honors, contact CTA, and footer. Keep official paper titles unchanged while putting surrounding copy behind translation keys.

- [ ] **Step 2: Run the static tests**

Run: \`node --test tests/homepage.test.mjs\`

Expected: PASS for semantic and content-preservation checks; a failure identifies a missing source fact before styling continues.

- [ ] **Step 3: Commit**

~~~bash
git add index.html
git commit -m "feat: add bilingual academic homepage structure"
~~~

### Task 3: Apply responsive visual system and accessibility treatments

**Files:**
- Modify: \`index.html\`
- Test: \`tests/homepage.test.mjs\`

**Interfaces:**
- Consumes: semantic class names from Task 2.
- Produces: CSS custom properties and component classes that remain usable at wide, tablet, and narrow viewports.

- [ ] **Step 1: Add visual tokens and viewport-safe layout**

~~~css
:root {
  --ink: #0b1d3a;
  --surface: #f5f7fb;
  --blue: #2563eb;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  font: 100%/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.display { font-size: clamp(3rem, 8vw, 7.5rem); line-height: .93; letter-spacing: -.065em; }
.action:active, .language-toggle:active { transform: scale(.97); }
~~~

Use a translucent header with an explicitly readable background, a deep editorial hero, quiet content surfaces, and a linear mobile flow. Gate hover transforms behind \`@media (hover: hover) and (pointer: fine)\`.

- [ ] **Step 2: Add motion and perception preference fallbacks**

~~~css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  .reveal { opacity: 1; transform: none; }
}
@media (prefers-reduced-transparency: reduce) { .site-header { backdrop-filter: none; background: rgba(245, 247, 251, .98); } }
@media (prefers-contrast: more) { .site-header { border-bottom-color: currentColor; } }
~~~

- [ ] **Step 3: Run tests and inspect CSS safety invariants**

Run: \`node --test tests/homepage.test.mjs && ! rg -n "transition:\\s*all|scale\\(0\\)|ease-in" index.html\`

Expected: PASS and no output from \`rg\`; this catches the design-engineering motion anti-patterns.

- [ ] **Step 4: Commit**

~~~bash
git add index.html
git commit -m "style: craft responsive academic visual system"
~~~

### Task 4: Add language persistence and restrained reveal behaviour

**Files:**
- Modify: \`index.html\`
- Test: \`tests/homepage.test.mjs\`

**Interfaces:**
- Consumes: \`data-i18n*\` attributes and the \`#language-toggle\` element from Task 2.
- Produces: \`setLanguage(language)\` and a toggle handler that support English/Chinese updates and preference persistence.

- [ ] **Step 1: Implement the translation contract**

~~~js
function setLanguage(language) {
  const dictionary = copy[language];
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = dictionary.title;
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = dictionary[node.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach((node) => { node.innerHTML = dictionary[node.dataset.i18nHtml]; });
  languageToggle.setAttribute('aria-pressed', String(language === 'zh'));
  languageToggle.setAttribute('aria-label', dictionary.languageToggleAria);
  localStorage.setItem('haotian-language', language);
}
~~~

Use \`navigator.language.startsWith('zh')\` only when no stored preference exists. Add one-time IntersectionObserver reveals only when reduced motion is not requested; no navigation or language-toggle animation is added.

- [ ] **Step 2: Run the static tests**

Run: \`node --test tests/homepage.test.mjs\`

Expected: PASS, including language preference and accessibility hooks.

- [ ] **Step 3: Commit**

~~~bash
git add index.html
git commit -m "feat: add persistent Chinese language switch"
~~~

### Task 5: Verify visually, audit motion, and publish

**Files:**
- Modify: \`index.html\` only if verification reveals a concrete issue
- Test: \`tests/homepage.test.mjs\`

**Interfaces:**
- Consumes: completed static homepage.
- Produces: fresh test/build evidence and a GitHub push to \`main\`.

- [ ] **Step 1: Run complete static verification**

Run: \`node --test tests/homepage.test.mjs && git diff --check && ! rg -n "transition:\\s*all|scale\\(0\\)|ease-in" index.html\`

Expected: all named tests pass, no whitespace errors, and no prohibited animation patterns.

- [ ] **Step 2: Inspect desktop and mobile renderings locally**

Run: \`python3 -m http.server 4173 --bind 127.0.0.1\` and capture the page at 1440px and 390px widths with a browser tool. Verify navigation is readable, hero copy is not clipped, cards do not overflow, the language toggle works, and both modes preserve the publication list.

- [ ] **Step 3: Run Emil-style motion review**

Review \`index.html\` against \`review-animations\` standards. Confirm every animation is purposeful, under the applicable duration budget, property-specific, reduced-motion aware, and hover-gated where relevant. Correct any concrete finding and rerun Step 1.

- [ ] **Step 4: Commit final fixes and push**

~~~bash
git add index.html tests/homepage.test.mjs docs/superpowers/plans/2026-08-02-apple-bilingual-homepage.md
git commit -m "feat: redesign bilingual academic homepage"
git push origin main
~~~
