import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const variantFiles = (await readdir(new URL('../variants/', import.meta.url)))
  .filter((file) => /^\d{2}-[^/]+\.html$/.test(file))
  .sort();

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

test('keeps the page simple while providing responsive bilingual theme controls', () => {
  assert.match(html, /<style\b/i);
  assert.match(html, /body\s*\{/i);
  assert.match(html, /<button[^>]+id="language-toggle"/i);
  assert.match(html, /<button[^>]+id="theme-toggle"/i);
  assert.match(html, /id="control-status"[^>]+aria-live="polite"/i);
  assert.match(html, /data-en="[^"]+"\s+data-zh="[^"]+"/i);
  assert.match(html, /@media\s*\(max-width:\s*720px\)/i);
  assert.match(html, /width:\s*min\(1080px,\s*calc\(100%\s*-\s*2rem\)\)/i);
  assert.match(html, /html\[data-theme="dark"\]/i);
  assert.match(html, /nav\s*\{[\s\S]*?position:\s*sticky[\s\S]*?top:\s*0/i);
  assert.match(html, /#page-controls\s*\{[\s\S]*?position:\s*absolute[\s\S]*?right:\s*0/i);
  assert.match(html, /text-align:\s*justify/i);
  assert.match(html, /localStorage/);
  assert.match(html, /prefers-color-scheme:\s*dark/);
  assert.match(html, /function\s+setLanguage/);
  assert.match(html, /function\s+setTheme/);

  assert.doesNotMatch(html, /<img\b|<div\b/i);
  assert.doesNotMatch(html, /\bclass\s*=/i);
  assert.doesNotMatch(html, /box-shadow\s*:|grid-template|display\s*:\s*grid|transition\s*:|animation\s*:|@keyframes\b/i);
  assert.doesNotMatch(html, /IntersectionObserver|navigator\.clipboard|\bcard\b|\bJCR\b|\bIF\s*=/i);
  assert.doesNotMatch(html, /Joined PolyU|Completed HKU/i);
});

test('keeps the document navigation in a simple header-to-footer order', () => {
  const headerIndex = html.indexOf('<header');
  const navIndex = html.indexOf('<nav');
  const mainIndex = html.indexOf('<main');
  const footerIndex = html.indexOf('<footer');

  assert.ok(navIndex < headerIndex, 'navigation must precede the header');
  assert.ok(headerIndex < mainIndex, 'header must precede main content');
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

test('publishes ten personal style studies alongside the complete homepage', () => {
  assert.equal(variantFiles.length, 10, 'expected ten style-study pages');
  assert.deepEqual(variantFiles, [
    '01-academicpages.html',
    '02-al-folio.html',
    '03-minimal-light.html',
    '04-guanglun-minimal.html',
    '05-luost-compact.html',
    '06-research-first.html',
    '07-senli-simple.html',
    '08-gitprofile.html',
    '09-hugoblox-cv.html',
    '10-minimal-academic.html',
  ]);
  assert.match(html, /href="variants\/"/i);
});
