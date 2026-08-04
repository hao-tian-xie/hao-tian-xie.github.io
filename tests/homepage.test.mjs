import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const variantFiles = (await readdir(new URL('../variants/', import.meta.url)))
  .filter((file) => /^\d{2}-[^/]+\.html$/.test(file))
  .sort();
const variantPages = await Promise.all(variantFiles.map(async (file) => ({
  file,
  html: await readFile(new URL(`../variants/${file}`, import.meta.url), 'utf8'),
})));
const variantIndex = await readFile(new URL('../variants/index.html', import.meta.url), 'utf8');

test('uses a plain semantic HTML document', () => {
  for (const element of ['<header', '<nav', '<main', '<section', '<article', '<footer']) {
    assert.ok(html.includes(element), `missing semantic element: ${element}`);
  }

  for (const sectionId of ['about', 'news', 'publications', 'experience', 'education', 'awards', 'skills']) {
    assert.match(html, new RegExp(`id="${sectionId}"`), `missing section: ${sectionId}`);
  }

  assert.equal((html.match(/<dl\b/g) ?? []).length, 1, 'skills must contain one definition list');
  assert.equal((html.match(/<\/dl>/g) ?? []).length, 1, 'definition-list tags must be balanced');

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
    'A virtual node based zero-shot learning framework for link prediction in complex networks',
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
    '10.1016/j.isci.2022.104180',
    '10.1016/j.ins.2026.123522',
  ]) {
    assert.ok(html.includes(doi), `missing DOI: ${doi}`);
  }

  assert.match(html, /<em>iScience<\/em>, 2022\./);
  assert.doesNotMatch(html, /10\.1016\/j\.isci\.2021\.104180|<em>iScience<\/em>, 2021\./);
  assert.match(html, /Exploring the drivers of green supply chain management[^<]*GDEMATEL–AISM approach/);
  assert.doesNotMatch(html, /GDEMATEL-AISM/);
  assert.match(html, /<h3>A virtual node based zero-shot learning framework for link prediction in complex networks<\/h3>\s*<p><strong>H\. Xie\*<\/strong>, Y\. Pu, Y\. Tan, &amp; W\. Yan<\/p>/);
  assert.match(html, /<em>Information Sciences<\/em>, 748 \(2026\), 123522\./);
  assert.match(html, /href="https:\/\/doi\.org\/10\.1016\/j\.ins\.2026\.123522"/);
  assert.match(html, /href="https:\/\/scholar\.google\.com\/scholar\?q=A\+virtual\+node\+based\+zero-shot\+learning\+framework\+for\+link\+prediction\+in\+complex\+networks"/);
  assert.match(html, /data-en="New publications in " data-zh="论文发表：在 "/);
  assert.match(html, /data-en="\." data-zh=" 发表新成果。"/);
  assert.doesNotMatch(html, /Under revision at Information Sciences|正在 Information Sciences 修订/);
});

test('keeps the page simple while providing responsive bilingual theme controls', () => {
  assert.match(html, /<style\b/i);
  assert.match(html, /body\s*\{/i);
  assert.match(html, /<button[^>]+id="language-toggle"/i);
  assert.match(html, /<button[^>]+id="theme-toggle"/i);
  assert.match(html, /<p id="page-controls" hidden>/i, 'enhancement-only controls should stay hidden without JavaScript');
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
  assert.doesNotMatch(html, /IntersectionObserver|navigator\.clipboard|\bJCR\b|\bIF\s*=/i);
  assert.doesNotMatch(html, /Joined PolyU|Completed HKU/i);
});

test('keeps keyboard, language, and control semantics unambiguous', () => {
  const skipIndex = html.indexOf('id="skip-link"');
  const navIndex = html.indexOf('<nav');
  const controlsIndex = html.indexOf('id="page-controls"');
  const emailLinkIndex = html.indexOf('<a href="mailto:');
  assert.ok(skipIndex > 0 && skipIndex < navIndex, 'skip link must be the first interactive page control');
  assert.ok(navIndex < controlsIndex && controlsIndex < emailLinkIndex,
    'visually top-aligned language and theme controls must precede lower header links in the focus order');
  assert.match(html, /<a id="skip-link" href="#main-content"[^>]*data-en="Skip to main content"[^>]*data-zh="跳至主要内容"/i);
  assert.match(html, /<main id="main-content" tabindex="-1">/i);

  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  assert.equal(buttons.length, 2);
  for (const button of buttons) {
    assert.doesNotMatch(button, /aria-pressed=/i, `action button must not expose a contradictory pressed state: ${button}`);
  }
  assert.doesNotMatch(html, /setAttribute\(['"]aria-pressed['"]/);

  const publicationArticles = html.match(/<article lang="en">/g) ?? [];
  assert.equal(publicationArticles.length, 6, 'English scholarly records need a local language boundary in Chinese mode');
  assert.match(html, /data-en="present" data-zh="至今"/);

  const newTabLinks = (html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []);
  for (const link of newTabLinks) {
    assert.match(link, /data-en-label="[^"]*new tab[^"]*"/i, `missing English new-tab announcement: ${link}`);
    assert.match(link, /data-zh-label="[^"]*新标签页[^"]*"/i, `missing Chinese new-tab announcement: ${link}`);
  }
});

test('keeps narrow layouts readable, reachable, and touch-friendly', () => {
  assert.match(html, /--control-border:\s*#[0-9a-f]{6}/i);
  assert.match(html, /button\s*\{[\s\S]*?min-height:\s*44px[\s\S]*?border:\s*1px solid var\(--control-border\)/i);
  assert.match(html, /#control-status\s*\{[\s\S]*?clip-path:\s*inset\(50%\)/i);
  assert.match(html, /main li \+ li\s*\{/i);
  assert.doesNotMatch(html, /\n\s{8}li \+ li\s*\{/i, 'global list spacing must not offset sticky navigation items');
  assert.match(html, /--nav-offset:\s*\d+(?:\.\d+)?rem/i);
  assert.match(html, /function\s+updateNavigationOffset/);
  assert.match(html, /setProperty\(['"]--nav-offset['"]/);
  assert.match(html, /@media\s*\(max-width:\s*720px\)[\s\S]*?text-align:\s*start/i);
  assert.match(html, /@media\s*\(max-width:\s*720px\)[\s\S]*?nav ul\s*\{[^}]*gap:\s*6px 9px/i,
    'the 320px English navigation must fit in two rows');
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

test('publishes one authoritative, machine-readable academic identity', async () => {
  assert.match(html, /<meta name="robots" content="index, follow">/i);
  assert.match(html, /<meta name="theme-color" id="theme-color" content="#ffffff">/i);
  assert.match(html, /<meta property="og:site_name" content="Haotian Xie">/i);
  assert.match(html, /<meta property="og:locale" content="en_US">/i);
  assert.match(html, /<meta name="twitter:card" content="summary">/i);
  assert.match(html, /<meta name="twitter:title" content="Haotian Xie — Operations Research &amp; Complex Systems">/i);
  assert.match(html, /<meta name="twitter:description" content="[^"]+">/i);

  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(schemaMatch, 'missing Person JSON-LD');
  const schema = JSON.parse(schemaMatch[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'Person');
  assert.equal(schema.name, 'Haotian Xie');
  assert.equal(schema.alternateName, '谢昊天');
  assert.equal(schema.url, 'https://hao-tian-xie.github.io/');
  assert.ok(schema.sameAs.includes('https://scholar.google.com/citations?user=X42fddQAAAAJ'));

  const robots = await readFile(new URL('../robots.txt', import.meta.url), 'utf8');
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  assert.match(robots, /^User-agent: \*\nAllow: \/\nSitemap: https:\/\/hao-tian-xie\.github\.io\/sitemap\.xml\n$/);
  assert.match(sitemap, /<loc>https:\/\/hao-tian-xie\.github\.io\/<\/loc>/);
  assert.doesNotMatch(sitemap, /\/variants\//);
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

  const exactSelectedTitles = [
    'Topological persistence pinpoints higher-order network vulnerabilities',
    'Decentralized autonomous organizations in e-commerce supply chains: A bayesian method to barrier identification and interrelationship mapping',
    'Evaluating airline service quality through a comprehensive text-mining and multi-criteria decision-making analysis',
  ];

  for (const { file, html: variantHtml } of variantPages) {
    assert.match(variantHtml, /<meta name="robots" content="noindex, follow">/i, `${file} must not compete with the primary homepage in search`);
    assert.match(variantHtml, /nav a\s*\{[^}]*display:\s*inline-flex[^}]*min-height:\s*32px/i,
      `${file} navigation needs a consistent touch target`);
    for (const title of exactSelectedTitles) {
      assert.ok(variantHtml.includes(title), `${file} alters or omits the selected publication title: ${title}`);
    }
    assert.doesNotMatch(variantHtml, /\bJCR\b|\bIF\s*=|Joined PolyU|Completed HKU/i, `${file} contains forbidden or duplicate profile text`);
  }

  assert.match(variantIndex, /<meta name="robots" content="noindex, follow">/i);
  assert.match(variantIndex, /English-only[^<]*layout previews/i);
  assert.match(variantIndex, /complete bilingual[^<]*primary homepage/i);
});

test('keeps controls and every style study readable at narrow widths and WCAG contrast', () => {
  function expandHex(hex) {
    const value = hex.slice(1);
    return value.length === 3 ? `#${[...value].map((digit) => digit.repeat(2)).join('')}` : hex;
  }

  function luminance(hex) {
    const channels = expandHex(hex).slice(1).match(/../g)
      .map((channel) => Number.parseInt(channel, 16) / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrast(foreground, background) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  }

  function page(file) {
    return variantPages.find((entry) => entry.file === file).html;
  }

  const lightTokens = html.match(/:root\s*\{([\s\S]*?)\}/i)?.[1];
  const darkTokens = html.match(/html\[data-theme="dark"\]\s*\{([\s\S]*?)\}/i)?.[1];
  const token = (block, name) => block?.match(new RegExp(`--${name}:\\s*(#[0-9a-f]+)`, 'i'))?.[1];
  assert.ok(contrast(token(lightTokens, 'control-border'), token(lightTokens, 'background')) >= 3,
    'light control boundary contrast is below 3:1');
  assert.ok(contrast(token(darkTokens, 'control-border'), token(darkTokens, 'background')) >= 3,
    'dark control boundary contrast is below 3:1');

  const contrastChecks = [
    ['03-minimal-light.html', /footer\s*\{[^}]*color:\s*(#[0-9a-f]+)/i, /body\s*\{[^}]*background:\s*(#[0-9a-f]+)/i],
    ['09-hugoblox-cv.html', /header p\s*\{[^}]*color:\s*(#[0-9a-f]+)/i, /:root\s*\{[^}]*background:\s*(#[0-9a-f]+)/i],
    ['10-minimal-academic.html', /footer\s*\{[^}]*color:\s*(#[0-9a-f]+)/i, /body\s*\{[^}]*background:\s*(#[0-9a-f]+)/i],
  ];

  for (const [file, foregroundPattern, backgroundPattern] of contrastChecks) {
    const variantHtml = page(file);
    const foreground = variantHtml.match(foregroundPattern)?.[1];
    const background = variantHtml.match(backgroundPattern)?.[1];
    assert.ok(foreground && background, `unable to read contrast colors from ${file}`);
    assert.ok(contrast(foreground, background) >= 4.5, `${file} normal text contrast is below 4.5:1`);
  }

  for (const file of ['01-academicpages.html', '07-senli-simple.html', '09-hugoblox-cv.html']) {
    const variantHtml = page(file);
    assert.match(variantHtml, /nav\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/i, `${file} navigation must wrap without horizontal overflow`);
    assert.doesNotMatch(variantHtml, /nav a\s*\{[^}]*margin-right/i, `${file} must use flex gap instead of accumulated link margins`);
  }

  for (const { file, html: variantHtml } of variantPages) {
    assert.match(variantHtml, /h1 span\[lang="zh-Hans"\]\s*\{[^}]*white-space:\s*nowrap/i, `${file} must keep the Chinese name intact`);
    assert.match(variantHtml, /a:focus-visible\s*\{[^}]*outline:\s*2px solid currentColor/i, `${file} needs a visible keyboard focus indicator`);
  }

  assert.match(variantIndex, /a:focus-visible\s*\{[^}]*outline:\s*2px solid currentColor/i);
});
