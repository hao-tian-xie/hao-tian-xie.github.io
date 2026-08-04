import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('uses a plain semantic HTML document', () => {
  for (const element of ['<header', '<nav', '<main', '<section', '<article', '<footer']) {
    assert.ok(html.includes(element), `missing semantic element: ${element}`);
  }

  for (const sectionId of ['about', 'news', 'publications', 'experience', 'education', 'awards', 'skills']) {
    assert.match(html, new RegExp(`id="${sectionId}"`), `missing section: ${sectionId}`);
  }

  assert.match(html, /Haotian Xie/);
  assert.match(html, /谢昊天/);
  assert.match(html, /Research Assistant/);
  assert.match(html, /The Hong Kong Polytechnic University/);
  assert.doesNotMatch(html, /Alex Morgan|Northbridge Institute|RedNote|astronaut-btn|template-assets/);
});

test('preserves the complete scholarly record and academic profile', () => {
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

test('uses only minimal document-level presentation without modular UI code', () => {
  assert.match(html, /<style\b/i);
  assert.match(html, /body\s*\{/i);
  assert.doesNotMatch(html, /<script\b|<button\b|<div\b/i);
  assert.doesNotMatch(html, /\bclass\s*=/i);
  assert.doesNotMatch(html, /box-shadow\s*:|border-radius\s+(?!50%)/i);
  assert.doesNotMatch(html, /grid-template|display\s*:\s*(grid|flex)|transition\s*:|animation\s*:|@media\b|@keyframes\b/i);
  assert.doesNotMatch(html, /IntersectionObserver|navigator\.clipboard|language-toggle|data-[a-z-]+=/i);
});

test('keeps the document navigation in a simple header-to-footer order', () => {
  const headerIndex = html.indexOf('<header');
  const navIndex = html.indexOf('<nav');
  const mainIndex = html.indexOf('<main');
  const footerIndex = html.indexOf('<footer');

  assert.ok(headerIndex < navIndex, 'header must precede navigation');
  assert.ok(navIndex < mainIndex, 'navigation must precede main content');
  assert.ok(mainIndex < footerIndex, 'main content must precede footer');
});

test('secures every external new-tab link', () => {
  const links = html.match(/<a\b[^>]*>/g) ?? [];
  const externalLinks = links.filter((link) => link.includes('target="_blank"'));

  assert.ok(externalLinks.length >= 11, 'expected the existing external scholarly links');
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/, `unsafe new-tab link: ${link}`);
  }
});
