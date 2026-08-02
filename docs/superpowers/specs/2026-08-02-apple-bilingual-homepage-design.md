# Apple-Inspired Bilingual Personal Homepage Design

**Status:** Approved for autonomous implementation by the site owner on 2026-08-02.

## Goal

Turn the single-column academic profile into a calm, editorial personal homepage that foregrounds Haotian Xie's work and availability while preserving every existing publication, award, education item, link, and contact route. The page must support a complete English/Chinese interface with an obvious, accessible language switch.

## Constraints

- Keep the site dependency-free and deployable by GitHub Pages as a single static `index.html`.
- Preserve the existing Google Scholar profile, DOI links, Google Scholar search links, email address, research record, and current academic affiliations.
- Use Apple as a reference for hierarchy, material, typography, restraint, feedback, and responsiveness; do not copy Apple branding, copy, assets, or layouts.
- Use the installed Emil Kowalski design-engineering and Apple-design guidance: purpose-led motion only, custom responsive easing, press feedback, reduced-motion support, and high-contrast readable material layers.
- The language control must be reachable by keyboard, expose its state in an accessible name, update document language/title, and remember a visitor's preference locally.
- Follow the user's request to proceed without approval pauses.

## Design Alternatives Considered

1. **Editorial academic landing page — chosen.** A concise hero frames identity and research purpose, followed by spacious, scannable research, publications, background, honors, and skills modules. This supports both first-time visitors and evaluators seeking scholarly detail.
2. **Portfolio case-study narrative.** Rich visual storytelling and long-form research case studies would be distinctive but would require project assets and copy not present in the source website.
3. **Dense CV dashboard.** Fast to scan but would preserve the current information-heavy feel and would not meet the request for an Apple-inspired homepage.

## Information Architecture

1. A persistent, translucent header: monogram, anchor navigation, and language button.
2. A hero with name, role, institutional affiliation, research thesis, status notice, and Email / Google Scholar actions.
3. A three-card research focus section: data-driven decisions, supply chains, and complex networks.
4. A publication section that keeps all published works, their authors, venue metadata, DOI, Scholar links, and the under-revision work.
5. A background section for education and language/programming/tool capabilities.
6. A compact honors timeline and a contact close.
7. A footer with provenance and the current update year.

## Bilingual Content Behaviour

- English is the default; a browser whose preferred language begins with `zh` starts in Chinese when no stored preference exists.
- The button changes between `中文` and `EN`, makes the destination language clear in its accessible label, and updates `aria-pressed`.
- Content that is authored as an official English paper title remains English in both modes to protect the formal bibliographic record. Navigation, headings, body copy, actions, affiliations, academic degrees, metadata labels, and availability notice receive Chinese translations.
- The selected language is stored under `haotian-language`; no personal data is collected or sent.

## Visual System

- System typography (`-apple-system`, BlinkMacSystemFont, Segoe UI, sans-serif) keeps rendering crisp and fast; large display text uses tight tracking and compact leading while body text remains comfortable.
- The page base is a warm off-white canvas with a deep midnight-blue hero/research surface, cobalt accents, quiet blue-violet glows, and carefully separated white content cards.
- The header is a functional translucent material rather than a decorative glass effect. It becomes more opaque for reduced-transparency users and retains readable contrast.
- The layout uses a broad editorial measure on desktop, an asymmetric hero visual only where it reinforces identity, and a linear, touch-friendly flow on smaller screens.

## Interaction, Motion, and Accessibility

- Links and buttons provide subtle `scale(0.97)` press feedback and property-specific transitions; hover transforms are limited to fine-pointer devices.
- Section entrances are limited to one-time, low-distance opacity/transform reveals, whose purpose is to prevent content from appearing abruptly during a leisurely page visit. Navigation and the frequent language control do not get showy motion.
- Every movement has a `prefers-reduced-motion` cross-fade/static alternative. `prefers-reduced-transparency` removes backdrop blur, and `prefers-contrast: more` strengthens material edges.
- Semantic landmarks, visible keyboard focus, descriptive image alt text, valid heading order, `rel="noopener noreferrer"` for external new-tab links, and a skip link are mandatory.

## Acceptance Criteria

- The page renders correctly with no build step or third-party runtime dependency.
- English and Chinese modes update all intended interface text, title, document `lang`, button state, and stored preference.
- All original scholarly content and outbound destinations remain represented.
- The desktop, tablet, and mobile layout maintains readable width, logical order, and usable controls.
- Automated static tests verify language wiring, semantic/accessibility hooks, content retention, external-link safety, and motion preferences.
- A local browser inspection verifies the layout at desktop and mobile widths before publication.

## Non-Goals

- No fabricated research metrics, portraits, projects, collaborators, or social profiles.
- No analytics, tracking, CMS, JavaScript framework, or downloadable CV is introduced.
- No Apple asset, logo, trademark, or copied marketing copy is used.
