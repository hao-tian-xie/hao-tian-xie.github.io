import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('exposes an accessible bilingual language control with persistence', () => {
  assert.match(html, /id="language-toggle"/);
  assert.match(html, /data-i18n="languageToggle"/);
  assert.match(html, /data-i18n="title"/);
  assert.match(html, /haotian-language/);
  assert.match(html, /function setLanguage\(language\)/);
  assert.match(html, /document\.documentElement\.lang/);
  assert.match(html, /谢昊天/);
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

test('uses semantic landmarks and accommodates motion and contrast preferences', () => {
  for (const fragment of [
    '<header',
    '<main',
    '<footer',
    'class="skip-link"',
    'prefers-reduced-motion',
    'prefers-reduced-transparency',
    'prefers-contrast: more',
  ]) {
    assert.ok(html.includes(fragment), `missing accessibility hook: ${fragment}`);
  }

  assert.doesNotMatch(html, /transition:\s*all/);
  assert.doesNotMatch(html, /scale\(0\)/);
  assert.doesNotMatch(html, /ease-in/);
});

test('secures every external new-tab link', () => {
  const links = html.match(/<a\b[^>]*>/g) ?? [];
  const externalLinks = links.filter((link) => link.includes('target="_blank"'));

  assert.ok(externalLinks.length >= 11, 'expected the existing external scholarly links');
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/, `unsafe new-tab link: ${link}`);
  }
});

test('renders bilingual degree line breaks as trusted markup', () => {
  assert.match(html, /data-i18n-html="educationTwoDegree"/);
  assert.match(html, /educationTwoDegree: 'BSc in Systems Science · 2020–2024<br>Bachelor of Economics in Finance'/);
  assert.match(html, /educationTwoDegree: '系统科学理学学士 · 2020–2024<br>金融学经济学学士'/);
});

test('localizes navigation, landmark, and portrait accessibility metadata', () => {
  assert.match(html, /data-i18n-aria="sectionNav"/);
  assert.match(html, /data-i18n-aria="educationSkills"/);
  assert.match(html, /data-i18n-alt="portraitAlt"/);
  assert.match(html, /sectionNav: '页面分区'/);
  assert.match(html, /educationSkills: '教育经历与技能'/);
  assert.match(html, /portraitAlt: '谢昊天肖像'/);
});

test('keeps every section reachable from the compact mobile navigation', () => {
  assert.match(html, /\.site-nav\s*\{[\s\S]*?overflow-x: auto;/);
  assert.doesNotMatch(html, /\.nav-link:nth-child\(n \+ 4\)\s*\{\s*display: none;/);
});
