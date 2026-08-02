# Original-Style Interaction Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original academic homepage appearance and add only accessible, restrained navigation and press interactions.

**Architecture:** `index.html` remains the single production document. CSS restores the source layout and supplies motion preferences; a small inline script synchronizes the four hash links with the visible section. The test file protects the user-visible layout and interaction contract.

**Tech Stack:** Semantic HTML, dependency-free CSS, browser-native `IntersectionObserver`, Node.js built-in test runner.

## Global Constraints

- Restore the visual baseline from commit `8a79a14`; do not retain the Apple hero or language control.
- Do not add dependencies or visible UI components.
- Use only explicit-property transitions, `cubic-bezier(0.23, 1, 0.32, 1)`, and routine interaction durations no longer than 200 ms.
- Honor `prefers-reduced-motion: reduce` and maintain all original scholarly links and copy.

---

### Task 1: Define the restored-page interaction contract

**Files:**
- Modify: `tests/homepage.test.mjs`

**Interfaces:**
- Consumes: the `index.html` document text.
- Produces: five Node test cases protecting the original visual scaffold, navigation state behavior, motion safety, scholarly content, and external-link safety.

- [ ] **Step 1: Write the failing test**

Add tests that expect `--primary-blue: #1a73e8`, the `.sidebar` / `.main-content` flex ratio, a `setActiveNavigation(sectionId)` function, `aria-current="page"`, motion-preference CSS, and safe external links.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/homepage.test.mjs`

Expected: FAIL because the current redesign does not expose the original blue token, original flex layout, or section-navigation state function.

- [ ] **Step 3: Preserve the test file as the regression boundary**

Keep the scholarly-content assertions and enumerate the five existing DOI strings as literal fixtures so the source record remains protected while restoring the document.

- [ ] **Step 4: Run test to verify it still fails for the intended missing implementation**

Run: `node --test tests/homepage.test.mjs`

Expected: the original-layout and navigation-interaction assertions fail; source-record assertions pass.

### Task 2: Restore the original page and add interaction-only polish

**Files:**
- Modify: `index.html`
- Test: `tests/homepage.test.mjs`

**Interfaces:**
- Consumes: `#about`, `#publications`, `#honors`, and `#skills` section IDs plus the corresponding `.nav-item` links.
- Produces: `setActiveNavigation(sectionId)` which adds `.active` and `aria-current="page"` to one matching navigation link.

- [ ] **Step 1: Restore source markup and styles**

Replace the redesigned document with the `8a79a14` two-column source structure and original academic content. Add `rel="noopener noreferrer"` to every existing `target="_blank"` scholarly link.

- [ ] **Step 2: Add minimum interaction CSS**

Define `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Replace broad transitions with explicit color, background-color, box-shadow, border-color, width, and transform transitions. Add `scale(0.97)` `:active` feedback to `.scholar-btn`, `.btn-small`, and `.nav-item`; gate transform hovers behind `@media (hover: hover) and (pointer: fine)`.

- [ ] **Step 3: Add active-navigation behavior**

Add a script that declares `function setActiveNavigation(sectionId)`, resolves the matching hash link, sets its `.active` class and `aria-current="page"`, and uses `IntersectionObserver` plus `hashchange` to follow reading position without preventing native anchor navigation.

- [ ] **Step 4: Add reduced-motion and focus accommodations**

Add a `prefers-reduced-motion: reduce` rule that switches `html` scrolling to `auto` and removes transform transition. Add a visible `:focus-visible` outline for interactive links.

- [ ] **Step 5: Run the test suite**

Run: `node --test tests/homepage.test.mjs && git diff --check`

Expected: PASS with all five tests green and no whitespace errors.

### Task 3: Validate the restored experience and publish

**Files:**
- Modify: `index.html` only if browser validation reveals a concrete defect.
- Test: `tests/homepage.test.mjs`

**Interfaces:**
- Consumes: browser-visible page, section navigation, and user motion preferences.
- Produces: verified desktop and mobile presentation with no console errors.

- [ ] **Step 1: Serve and inspect the page**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Open the local page. Confirm the source two-column desktop layout, original card styling, and single-column mobile fallback.

- [ ] **Step 2: Exercise navigation state**

Click the Publications, Honors & Awards, and Skills links. Confirm the matching link alone has `.active` and `aria-current="page"`; then reload a `#skills` URL and confirm Skills starts active.

- [ ] **Step 3: Verify interaction quality**

Keyboard-tab to a navigation link and the Scholar button. Confirm a clear focus outline. Press a Scholar or DOI control and confirm the subtle scale feedback. Confirm no console warnings or errors.

- [ ] **Step 4: Run final automated checks**

Run: `node --test tests/homepage.test.mjs && git diff --check && ! rg -n "transition:\\s*all|scale\\(0\\)|ease-in" index.html`

Expected: PASS with no matches for prohibited motion patterns.

- [ ] **Step 5: Commit and push**

Run:

~~~bash
git add index.html tests/homepage.test.mjs docs/superpowers
git commit -m "fix: restore original homepage style"
git push origin main
~~~
