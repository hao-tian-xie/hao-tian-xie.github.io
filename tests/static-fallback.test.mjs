import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const fragmentPaths = [
  'pages/home.html',
  'pages/about.html',
  'pages/publications.html',
  'pages/misc.html',
  'pages/selected-publications.html',
  'pages/zh/home.html',
  'pages/zh/about.html',
  'pages/zh/publications.html',
  'pages/zh/misc.html',
  'pages/zh/selected-publications.html'
];
const [homepage, sitemap, script, ...documents] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('sitemap.xml', root), 'utf8'),
  readFile(new URL('script.js', root), 'utf8'),
  ...fragmentPaths.map(path => readFile(new URL(path, root), 'utf8'))
]);

test('no-JavaScript navigation and sitemap point to standalone static documents', () => {
  const navigationPaths = fragmentPaths.filter(path => !path.includes('selected-publications'));
  for (const path of navigationPaths) {
    assert.match(homepage, new RegExp(`href="${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  }
  for (const path of fragmentPaths) {
    assert.match(sitemap, new RegExp(`<loc>https://hao-tian-xie\\.github\\.io/${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>`));
  }

  documents.forEach((document, index) => {
    const path = fragmentPaths[index];
    const base = path.startsWith('pages/zh/') ? '../../' : '../';
    const language = path.startsWith('pages/zh/') ? 'zh-CN' : 'en';
    const navLabel = path.startsWith('pages/zh/') ? '网站页面' : 'Site pages';
    assert.match(document, /^<!DOCTYPE html>\s*<html lang="/);
    assert.match(document, new RegExp(`<html lang="${language}">`));
    assert.match(document, new RegExp(`<base href="${base}">`));
    assert.match(document, /<link rel="stylesheet" href="style\.css\?v=56" \/>/);
    assert.match(document, new RegExp(`<link rel="canonical" href="https://hao-tian-xie\\.github\\.io/${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" \/>`));
    assert.match(document, new RegExp(`<nav class="static-fallback-nav" aria-label="${navLabel}">`));
    assert.match(document, /<main class="static-fallback-content" data-spa-fragment>/);
    assert.match(document, /<\/main>\s*<\/body>\s*<\/html>\s*$/);
  });
});

test('SPA loader extracts only the marked body content from static documents', () => {
  const start = script.indexOf('function extractPageFragment');
  const end = script.indexOf('async function loadPage');
  assert.ok(start >= 0 && end > start, 'loader should expose a fragment extractor before loadPage');
  const source = script.slice(start, end);
  const context = {};
  vm.runInNewContext(`${source}\nglobalThis.extractPageFragment = extractPageFragment;`, context);

  assert.equal(
    context.extractPageFragment('<!DOCTYPE html><html><body><main data-spa-fragment><h3>About</h3></main></body></html>'),
    '<h3>About</h3>'
  );
  assert.equal(context.extractPageFragment('<p>Legacy fragment</p>'), '<p>Legacy fragment</p>');
});

test('static publication documents resolve their image assets at the site root', () => {
  documents.forEach((document, index) => {
    const path = fragmentPaths[index];
    if (!path.includes('publications.html')) return;

    const pageUrl = new URL(path, 'https://hao-tian-xie.github.io/');
    const baseHref = document.match(/<base href="([^"]+)">/)?.[1];
    assert.ok(baseHref, `${path} should define a root-relative base`);
    const baseUrl = new URL(baseHref, pageUrl);
    const imageSources = [...document.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);

    imageSources.forEach(source => {
      assert.match(new URL(source, baseUrl).pathname, /^\/asset\/publications\//, `${path} should resolve ${source} from /asset/publications/`);
    });
  });
});
