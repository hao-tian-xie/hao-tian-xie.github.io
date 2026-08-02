# Original-Style Interaction Refinement

## Goal

Restore the homepage to the academic two-column visual language in commit `8a79a14`, then make its existing navigation and links feel more responsive without introducing a new visual direction.

## Visual baseline

- Retain the original `#f8f9fa` page background, white rounded cards, blue `#1a73e8` accent, sidebar, sticky navigation, typography, content order, and responsive breakpoint.
- Restore the original scholarly copy, paper list, education, awards, skills, portrait, and footer.
- Remove the Apple-inspired hero, the bilingual content system, the language control, and every related visual treatment.
- Do not add new visible components such as a hero, floating controls, visual indicators, or language controls.

## Interaction contract

- The four existing section links remain ordinary hash links. Their active state follows the initial URL hash and the section currently being read.
- Exactly one current section link exposes `aria-current="page"`; the visible underline and blue text use the existing `.active` styling.
- Buttons and small publication controls provide a subtle `scale(0.97)` press response. Transform hover effects run only on precise hover devices.
- CSS transitions target explicit properties, use a custom ease-out curve, and stay at or below 200 ms for routine interactions.
- People who request reduced motion receive instant scrolling and no transform transition.
- All external new-tab links preserve their destinations and use `rel="noopener noreferrer"`.

## Implementation

Use one dependency-free `index.html` document. A small inline script observes the existing section IDs and updates navigation state; CSS supplies the visual feedback and accessibility preferences. `tests/homepage.test.mjs` guards the original layout contract, preservation of scholarly content, interaction hooks, and safe external links.

## Verification

Run the Node test suite and whitespace check. Then exercise the live page in a browser at desktop and mobile widths: verify the restored layout, scroll/navigation state updates, keyboard focus, press feedback, no horizontal overflow, and a clean error console.
