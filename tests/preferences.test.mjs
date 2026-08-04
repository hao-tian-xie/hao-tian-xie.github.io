import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const executableScripts = [...html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1]);
const interactiveScript = executableScripts.find((script) => script.includes('function setTheme'));
const themeBootstrapScript = executableScripts.find((script) => script.includes('homepage-theme') && script.includes('theme-color') && !script.includes('function setTheme'));

function createElement(dataset = {}) {
  const attributes = new Map();
  const listeners = new Map();
  return {
    dataset: { ...dataset },
    lang: '',
    textContent: '',
    style: { setProperty() {} },
    addEventListener(type, listener) { listeners.set(type, listener); },
    click() { listeners.get('click')?.(); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    setAttribute(name, value) { attributes.set(name, String(value)); },
  };
}

function runHomepage({ stored = {}, systemDark = false } = {}) {
  assert.ok(interactiveScript, 'interactive homepage script not found');

  const storage = new Map(Object.entries(stored));
  const mediaListeners = new Map();
  const windowListeners = new Map();
  const root = createElement();
  root.dataset.theme = 'light';
  root.style = { setProperty() {} };

  const navigation = createElement();
  navigation.getBoundingClientRect = () => ({ height: 52 });
  const languageToggle = createElement();
  const themeToggle = createElement();
  const status = createElement();
  const pageControls = createElement();
  pageControls.hidden = true;
  const translatable = createElement({ en: 'About', zh: '关于' });
  const relabelable = createElement({ enLabel: 'English label', zhLabel: '中文标签' });
  const elements = {
    'section-nav': navigation,
    'language-toggle': languageToggle,
    'theme-toggle': themeToggle,
    'control-status': status,
    'page-controls': pageControls,
  };
  const mediaQuery = {
    matches: systemDark,
    addEventListener(type, listener) { mediaListeners.set(type, listener); },
  };
  const window = {
    localStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    matchMedia() { return mediaQuery; },
    addEventListener(type, listener) { windowListeners.set(type, listener); },
  };
  const document = {
    documentElement: root,
    title: '',
    getElementById(id) { return elements[id]; },
    querySelectorAll(selector) {
      if (selector === '[data-en][data-zh]') return [translatable];
      if (selector === '[data-en-label][data-zh-label]') return [relabelable];
      return [];
    },
  };

  vm.runInNewContext(interactiveScript, { document, window });
  return { languageToggle, mediaListeners, mediaQuery, pageControls, relabelable, root, status, storage, themeToggle, translatable };
}

test('system theme stays system-controlled until the visitor explicitly chooses a theme', () => {
  const page = runHomepage({ systemDark: true });

  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.pageControls.hidden, false, 'working controls should become visible after initialization');
  assert.equal(page.storage.has('homepage-theme'), false, 'initial system preference must not become a stored override');
  assert.equal(page.storage.has('homepage-language'), false, 'default language must not become a stored preference');
  assert.equal(typeof page.mediaListeners.get('change'), 'function');

  page.mediaListeners.get('change')({ matches: false });
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(page.storage.has('homepage-theme'), false);

  page.themeToggle.click();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.storage.get('homepage-theme'), 'dark');

  page.mediaListeners.get('change')({ matches: false });
  assert.equal(page.root.dataset.theme, 'dark', 'an explicit visitor choice must win over later system changes');
});

test('language switching keeps localized accessible names in the matching language', () => {
  const page = runHomepage();

  assert.equal(page.root.lang, 'en');
  assert.equal(page.relabelable.lang, 'en');
  assert.equal(page.relabelable.getAttribute('aria-label'), 'English label');

  page.languageToggle.click();
  assert.equal(page.root.lang, 'zh-Hans');
  assert.equal(page.relabelable.lang, 'zh-Hans');
  assert.equal(page.relabelable.getAttribute('aria-label'), '中文标签');
});

test('the saved or system theme is applied in the document head before first paint', () => {
  assert.ok(themeBootstrapScript, 'early theme bootstrap script not found');

  function runBootstrap({ savedTheme = null, systemDark = false } = {}) {
    const root = createElement();
    const themeColor = createElement();
    const window = {
      localStorage: { getItem() { return savedTheme; } },
      matchMedia() { return { matches: systemDark }; },
    };
    const document = {
      documentElement: root,
      getElementById(id) { return id === 'theme-color' ? themeColor : null; },
    };
    vm.runInNewContext(themeBootstrapScript, { document, window });
    return { root, themeColor };
  }

  const saved = runBootstrap({ savedTheme: 'dark', systemDark: false });
  assert.equal(saved.root.dataset.theme, 'dark');
  assert.equal(saved.themeColor.getAttribute('content'), '#111827');

  const system = runBootstrap({ savedTheme: 'corrupted', systemDark: true });
  assert.equal(system.root.dataset.theme, 'dark');
  assert.equal(system.themeColor.getAttribute('content'), '#111827');

  assert.match(html, /@media\s*\(prefers-color-scheme:\s*dark\)[\s\S]*?html:not\(\[data-theme\]\)/i);
});
