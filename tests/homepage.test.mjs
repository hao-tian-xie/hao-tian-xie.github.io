import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('uses the academic template information architecture without fictional template data', () => {
  for (const sectionId of ['about', 'news', 'publications', 'experience', 'awards', 'skills']) {
    assert.match(html, new RegExp(`id="${sectionId}"`), `missing section: ${sectionId}`);
  }

  assert.match(html, /Haotian Xie/);
  assert.match(html, /谢昊天/);
  assert.doesNotMatch(html, /Alex Morgan|Northbridge Institute|RedNote|astronaut-btn|template-assets/);
  assert.doesNotMatch(html, /id="language-toggle"|data-i18n=/);
});

test('preserves the complete scholarly record and academic profile', () => {
  const preservedText = [
    'Topological persistence pinpoints higher-order network vulnerabilities',
    'Decentralized autonomous organizations in e-commerce supply chains',
    'Evaluating airline service quality through a comprehensive text-mining',
    'Exploring the drivers of green supply chain management in the Chinese electronics industry',
    'Classifying Drosophila olfactory projection neuron boutons',
    'A Virtual Node-Based Zero-Shot Learning Framework for Link Prediction in Complex Networks',
    'Research Assistant',
    'The Hong Kong Polytechnic University',
    'Tony Reynolds Academic Excellence Prize',
    'YUAN CHUAN Scholarship',
    'haotiantimxie@gmail.com',
  ];

  for (const text of preservedText) {
    assert.ok(html.includes(text), `missing preserved source text: ${text}`);
  }

  for (const doi of [
    '10.1063/5.0293652',
    '10.1016/j.elerap.2025.101533',
    '10.1016/j.jairtraman.2024.102655',
    '10.1016/j.clscn.2023.100110',
    '10.1016/j.isci.2021.104180',
  ]) {
    assert.ok(html.includes(doi), `missing DOI: ${doi}`);
  }
});

test('provides progressive publication filtering and author disclosure controls', () => {
  assert.match(html, /id="publication-filter"/);
  assert.match(html, /class="filter-button"[^>]*aria-pressed="true"/);
  assert.match(html, /class="publication-card"[^>]*data-tags="[^"]+"/);
  assert.match(html, /class="author-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="[^"]+"/);
  assert.match(html, /function applyPublicationFilter\(/);
  assert.match(html, /function setAuthorExpanded\(/);
});

test('supports copy feedback, scroll spy, and accessible back-to-top behavior', () => {
  assert.match(html, /id="email-copy"/);
  assert.match(html, /id="bio-copy"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="back-to-top"/);
  assert.match(html, /function copyText\(/);
  assert.match(html, /function setActiveNavigation\(/);
  assert.match(html, /new IntersectionObserver/);
  assert.match(html, /link\.setAttribute\(['"]aria-current['"], ['"]page['"]\)/);
  assert.match(html, /link\.removeAttribute\(['"]aria-current['"]\)/);
  assert.match(html, /function keepLastSectionCurrentAtDocumentEnd\(/);
  assert.match(html, /backToTop.focus()/);
});

test('keeps motion bounded and safe for keyboard and reduced-motion users', () => {
  assert.match(html, /--ease-out:\s*cubic-bezier\(/);
  assert.match(html, /:focus-visible\s*\{/);
  assert.match(html, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(html, /transition:\s*all/);
  assert.doesNotMatch(html, /ease-in/);
  assert.doesNotMatch(html, /scale\(0\)/);
});

test('prevents narrow viewport overflow', () => {
  assert.match(html, /overflow-x:\s*hidden/);
  assert.match(html, /@media \(max-width:\s*720px\)/);
  assert.match(html, /box-sizing:\s*border-box/);
});

test('secures every external new-tab link', () => {
  const links = html.match(/<a\b[^>]*>/g) ?? [];
  const externalLinks = links.filter((link) => link.includes('target="_blank"'));

  assert.ok(externalLinks.length >= 11, 'expected the existing external scholarly links');
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/, `unsafe new-tab link: ${link}`);
  }
});
