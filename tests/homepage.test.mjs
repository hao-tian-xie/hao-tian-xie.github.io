import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('retains the original two-column academic visual scaffold', () => {
  assert.match(html, /--primary-blue:\s*#1a73e8/);
  assert.match(html, /class="container"/);
  assert.match(html, /class="sidebar"/);
  assert.match(html, /\.sidebar\s*\{[\s\S]*?flex:\s*3;/);
  assert.match(html, /\.main-content\s*\{[\s\S]*?flex:\s*7;/);
  assert.doesNotMatch(html, /id="language-toggle"/);
  assert.doesNotMatch(html, /data-i18n=/);
});

test('keeps the section navigation synchronized with reading position', () => {
  assert.match(html, /aria-current="page"/);
  assert.match(html, /function setActiveNavigation\(sectionId\)/);
  assert.match(html, /new IntersectionObserver/);
  assert.match(html, /link\.setAttribute\('aria-current', 'page'\)/);
  assert.match(html, /link\.removeAttribute\('aria-current'\)/);
});

test('keeps the final section active when the document reaches its bottom edge', () => {
  assert.match(html, /function keepLastSectionCurrentAtDocumentEnd\(\) \{\s*const isAtDocumentEnd = window\.innerHeight \+ window\.scrollY >= document\.documentElement\.scrollHeight - 2;/);
  assert.match(html, /setActiveNavigation\(sections\[sections\.length - 1\]\.id\);/);
  assert.match(html, /window\.addEventListener\('scroll', keepLastSectionCurrentAtDocumentEnd, \{ passive: true \}\);/);
});

test('gives press feedback and respects reduced-motion preferences', () => {
  assert.match(html, /--ease-out:\s*cubic-bezier\(0\.23,\s*1,\s*0\.32,\s*1\)/);
  assert.match(html, /\.scholar-btn:active\s*\{[\s\S]*?scale\(0\.97\)/);
  assert.match(html, /\.btn-small:active\s*\{[\s\S]*?scale\(0\.97\)/);
  assert.match(html, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(html, /transition:\s*all/);
  assert.doesNotMatch(html, /scale\(0\)/);
  assert.doesNotMatch(html, /ease-in/);
});

test('keeps the original mobile layout inside the viewport', () => {
  assert.match(html, /@media \(max-width: 900px\) \{[\s\S]*?\.sidebar, \.main-content \{ width: 100%; position: static; box-sizing: border-box; \}/);
});

test('retains the complete scholarly record and contact routes', () => {
  const preservedText = [
    'Topological persistence pinpoints higher-order network vulnerabilities',
    'Decentralized autonomous organizations in e-commerce supply chains',
    'Evaluating airline service quality through a comprehensive text-mining',
    'Exploring the drivers of green supply chain management in the Chinese electronics industry',
    'Classifying Drosophila olfactory projection neuron boutons',
    'A Virtual Node-Based Zero-Shot Learning Framework for Link Prediction in Complex Networks',
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

test('secures every external new-tab link', () => {
  const links = html.match(/<a\b[^>]*>/g) ?? [];
  const externalLinks = links.filter((link) => link.includes('target="_blank"'));

  assert.ok(externalLinks.length >= 11, 'expected the existing external scholarly links');
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/, `unsafe new-tab link: ${link}`);
  }
});
