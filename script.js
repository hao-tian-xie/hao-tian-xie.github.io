// script.js - Cargo-style SPA

const links = document.querySelectorAll('a[data-page]');
const content = document.getElementById('content');
const pageVersion = '56';
const languageStorageKey = 'site-language';
const routePages = new Set(['home', 'about', 'publications', 'misc']);
const publicationFilters = new Set(['selected', 'all', 'conference']);

let lastLoadedPage = null;
let applyPublicationFilter = null;
let activeLoadId = 0;
let pendingLoadPage = null;

function parseRoute(hash = location.hash) {
  const raw = hash.replace(/^#/, '');
  const [pagePart, query = ''] = raw.split('?');
  const page = routePages.has(pagePart) ? pagePart : 'home';
  const params = new URLSearchParams(query);
  const requestedFilter = params.get('filter');
  const filter = publicationFilters.has(requestedFilter) ? requestedFilter : 'selected';
  return { page, filter };
}

function buildRouteHash(page, filter = 'selected') {
  const safePage = routePages.has(page) ? page : 'home';
  if (safePage === 'home') return '#';
  if (safePage === 'publications' && filter !== 'selected') {
    return `#publications?filter=${filter}`;
  }
  return `#${safePage}`;
}

function pushRouteState(newHash, state) {
  if (window.history?.pushState) {
    window.history.pushState(state, '', newHash);
  } else {
    location.hash = newHash;
  }
}

const uiText = {
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    email: 'Email',
    scholar: 'Google Scholar',
    linkedin: 'LinkedIn',
    'nav-about': 'About Me',
    'nav-publications': 'Publications',
    'nav-misc': 'Misc.',
    language: 'Eng / 中',
    switchLanguage: 'Switch to Chinese',
    top: 'Top',
    'easter-egg': 'Operations Research & Complex Systems',
    imagePreview: 'Image preview',
    closeImage: 'Close image preview',
    citeLabel: 'Copy APA citation',
    citeCopied: 'Citation copied',
    citeFailed: 'Unable to copy citation',
    citeCopiedLabel: '[copied]',
    citeFailedLabel: '[copy failed]',
    loadError: 'Error loading page. Please try again.'
  },
  zh: {
    skip: '跳转到主要内容',
    menu: '菜单',
    close: '关闭',
    email: '电子邮件',
    scholar: '谷歌学术',
    linkedin: '领英',
    'nav-about': '关于我',
    'nav-publications': '学术出版物列表',
    'nav-misc': '其他',
    language: 'Eng / 中',
    switchLanguage: '切换至英文',
    top: '回到顶部',
    'easter-egg': '运筹学与复杂系统',
    imagePreview: '图片预览',
    closeImage: '关闭图片预览',
    citeLabel: '复制 APA 引用',
    citeCopied: '引用已复制',
    citeFailed: '复制引用失败',
    citeCopiedLabel: '[已复制]',
    citeFailedLabel: '[复制失败]',
    loadError: '页面加载失败，请稍后重试。'
  }
};

let currentLanguage = 'en';
try {
  currentLanguage = localStorage.getItem(languageStorageKey) === 'zh' ? 'zh' : 'en';
} catch {
  currentLanguage = 'en';
}

function updateMenuButtonLabel() {
  const menuButton = document.getElementById('menu-toggle');
  if (!menuButton) return;
  const text = uiText[currentLanguage];
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.textContent = isOpen ? text.close : text.menu;
  menuButton.setAttribute('aria-label', isOpen ? text.close : text.menu);
}

function updateInterfaceText() {
  const text = uiText[currentLanguage];
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const translation = text[element.dataset.i18n];
    if (translation) element.textContent = translation;
  });

  document.querySelectorAll('.language-toggle').forEach(languageToggle => {
    languageToggle.textContent = text.language;
    languageToggle.setAttribute('aria-label', text.switchLanguage);
  });

  const modal = document.getElementById('image-modal');
  if (modal) modal.setAttribute('aria-label', text.imagePreview);

  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.setAttribute('aria-label', text.closeImage);

  updateMenuButtonLabel();
}

function setLanguage(language) {
  const nextLanguage = language === 'zh' ? 'zh' : 'en';
  if (nextLanguage === currentLanguage) return;

  currentLanguage = nextLanguage;
  try {
    localStorage.setItem(languageStorageKey, currentLanguage);
  } catch {
    // The site still works when storage is unavailable.
  }

  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
  updateInterfaceText();

  const route = parseRoute();
  setActiveLink(route.page);
  loadPage(route.page, route.filter);
}

function setActiveLink(page) {
  links.forEach(link => {
    const isActive = link.dataset.page === page;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function loadPage(page, filter = 'selected') {
  const loadId = ++activeLoadId;
  pendingLoadPage = page;
  const language = currentLanguage;
  try {
    const pageRoot = language === 'zh' ? 'pages/zh' : 'pages';
    const pageSources = page === 'home'
      ? [`${pageRoot}/home.html?v=${pageVersion}`, `${pageRoot}/about.html?v=${pageVersion}`, `${pageRoot}/selected-publications.html?v=${pageVersion}`]
      : [`${pageRoot}/${page}.html?v=${pageVersion}`];
    const responses = await Promise.all(pageSources.map(source => fetch(source)));
    if (loadId !== activeLoadId) return;
    const failedResponse = responses.find(response => !response.ok);
    if (failedResponse) throw new Error(`HTTP error! status: ${failedResponse.status}`);
    const htmlParts = await Promise.all(responses.map(response => response.text()));
    if (loadId !== activeLoadId) return;
    const html = htmlParts.join('\n');

    // Animate out
    applyPublicationFilter = null;
    document.body.classList.toggle('page-home', page === 'home');
    content.classList.add('fading-out');
    await new Promise(r => setTimeout(r, 150));
    if (loadId !== activeLoadId) return;

    // Swap content
    content.innerHTML = html;
    lastLoadedPage = page;
    pendingLoadPage = null;
    window.scrollTo(0, 0);
    updateTopButtonVisibility();

    // Publications year grouping
    if (page === 'publications' || page === 'home') {
      groupPublicationsByYear();
    }

    if (page === 'publications') {
      initPubTabs(filter);
    }

    if (page === 'home') initGallery();

    // Make pub-images keyboard accessible
    content.querySelectorAll('.pub-image').forEach(img => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
    });

    // Make home gallery images keyboard accessible
    content.querySelectorAll('.gallery-slide img').forEach(img => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Open image preview');
    });

    content.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', scheduleTopButtonUpdate, { once: true });
    });

    // Update page title
    const pageTitles = language === 'zh'
      ? { about: '关于我', publications: '学术出版物列表', misc: '其他', home: '主页' }
      : { about: 'About', publications: 'Publications', misc: 'Miscellaneous', home: 'Home' };
    document.title = pageTitles[page]
      ? `${pageTitles[page]} - Haotian Xie`
      : 'Haotian Xie - Operations Research & Complex Systems';

    // Animate in
    content.classList.remove('fading-out');
    content.classList.add('fading-in');
    setTimeout(() => {
      if (loadId !== activeLoadId) return;
      content.classList.remove('fading-in');
      initScrollReveal();
    }, 400);

  } catch (error) {
    if (loadId !== activeLoadId) return;
    pendingLoadPage = null;
    console.error('Error loading page:', error);
    document.body.classList.toggle('page-home', page === 'home');
    content.classList.remove('fading-out');
    content.classList.remove('fading-in');
    content.innerHTML = `<p>${uiText[language].loadError}</p>`;
    updateTopButtonVisibility();
  }
}

function groupPublicationList(container) {
  const pubs = Array.from(container.children)
    .filter(child => child.classList.contains('publication'));
  if (!pubs.length) return;

  const placeholder = document.createElement('div');
  container.insertBefore(placeholder, pubs[0]);

  let currentSection = null;
  let currentContent = null;
  let lastYear = null;

  pubs.forEach(pub => {
    let year = pub.dataset.year || pub.getAttribute('data-year');
    if (!year) {
      const text = pub.textContent || '';
      const match = text.match(/(19|20)\d{2}/);
      if (match) year = match[0];
    }
    if (!year) year = lastYear;
    if (!year) year = '';

    if (year !== lastYear || !currentSection) {
      currentSection = document.createElement('div');
      currentSection.className = 'year-section';

      const label = document.createElement('div');
      label.className = 'year-label';
      label.textContent = year;

      currentContent = document.createElement('div');
      currentContent.className = 'year-content';

      currentSection.appendChild(label);
      currentSection.appendChild(currentContent);
      container.insertBefore(currentSection, placeholder);

      lastYear = year;
    }

    currentContent.appendChild(pub);
  });

  container.removeChild(placeholder);
}

function groupPublicationsByYear() {
  const publicationLists = Array.from(content.querySelectorAll('[data-publication-list]'));
  if (publicationLists.length) {
    publicationLists.forEach(groupPublicationList);
    return;
  }

  const firstPublication = content.querySelector('.publication');
  if (firstPublication) groupPublicationList(firstPublication.parentNode);
}

let galleryTimer = null;
let galleryResetTimer = null;
function initGallery() {
  if (galleryTimer) { clearInterval(galleryTimer); galleryTimer = null; }
  if (galleryResetTimer) { clearTimeout(galleryResetTimer); galleryResetTimer = null; }
  const gallery = content.querySelector('.home-gallery');
  if (!gallery) return;

  const track = gallery.querySelector('.gallery-track');
  const caption = gallery.querySelector('.gallery-caption');
  if (!track) return;

  track.querySelectorAll('.gallery-slide[data-clone="true"]').forEach(slide => slide.remove());
  const slides = Array.from(track.querySelectorAll('.gallery-slide'));
  if (!slides.length) return;

  const firstClone = slides[0].cloneNode(true);
  firstClone.dataset.clone = 'true';
  firstClone.setAttribute('aria-hidden', 'true');
  track.appendChild(firstClone);

  const interval = parseInt(gallery.dataset.interval, 10) || 5000;
  const transitionMs = 600;
  const realCount = slides.length;
  let idx = 0;
  let isResetting = false;

  function show(i, animate = true) {
    idx = i;
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translateX(-${idx * 100}%)`;
    const realIdx = idx % realCount;
    if (caption) caption.innerHTML = slides[realIdx].dataset.caption || '';
    slides.forEach((slide, slideIdx) => {
      slide.setAttribute('aria-hidden', slideIdx === realIdx ? 'false' : 'true');
    });
    if (!animate) {
      void track.offsetWidth;
      track.style.transition = '';
    }
  }

  show(0);
  if (slides.length < 2) return;

  galleryTimer = setInterval(() => {
    if (isResetting) return;

    const nextIdx = idx + 1;
    if (nextIdx >= realCount) {
      isResetting = true;
      show(realCount);
      galleryResetTimer = setTimeout(() => {
        show(0, false);
        isResetting = false;
      }, transitionMs + 30);
      return;
    }
    show(nextIdx);
  }, interval);
}

function initPubTabs(initialFilter = 'selected') {
  const tabs = content.querySelectorAll('.pub-tab');
  if (!tabs.length) return;

  function applyFilter(filter) {
    const pubs = content.querySelectorAll('.publication');
    pubs.forEach(pub => {
      const isSelected = pub.dataset.selected === 'true';
      const publicationList = pub.closest('[data-publication-list]');
      const isConference = publicationList?.dataset.publicationList === 'conference';
      const isVisible = filter === 'conference'
        ? isConference
        : !isConference && (filter === 'all' || isSelected);
      pub.style.display = isVisible ? '' : 'none';
      pub.classList.remove('pub-last-visible');
    });

    content.querySelectorAll('[data-publication-list]').forEach(publicationList => {
      const hasVisiblePublication = Array.from(publicationList.querySelectorAll('.publication'))
        .some(pub => pub.style.display !== 'none');
      publicationList.style.display = hasVisiblePublication ? '' : 'none';
    });

    let firstVisibleSection = null;
    content.querySelectorAll('.year-section').forEach(section => {
      section.classList.remove('year-first-visible');
      const visiblePubs = Array.from(section.querySelectorAll('.publication'))
        .filter(p => p.style.display !== 'none');
      if (visiblePubs.length) {
        section.style.display = '';
        visiblePubs[visiblePubs.length - 1].classList.add('pub-last-visible');
        if (!firstVisibleSection) firstVisibleSection = section;
      } else {
        section.style.display = 'none';
      }
    });
    if (firstVisibleSection) firstVisibleSection.classList.add('year-first-visible');
  }

  function selectFilter(filter, { updateRoute = true } = {}) {
    const nextFilter = publicationFilters.has(filter) ? filter : 'selected';
    tabs.forEach(tab => {
      const isActive = tab.dataset.filter === nextFilter;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
    applyFilter(nextFilter);

    if (updateRoute) {
      const newHash = buildRouteHash('publications', nextFilter);
      if (location.hash !== newHash) {
        pushRouteState(newHash, { page: 'publications', filter: nextFilter });
      }
    }
  }

  applyPublicationFilter = selectFilter;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectFilter(tab.dataset.filter);
    });
  });

  selectFilter(initialFilter, { updateRoute: false });
}

// Scroll reveal - Cargo-style scale-in
function initScrollReveal() {
  const targets = content.querySelectorAll('.year-section, .publication');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
}

function handleRoute() {
  const route = parseRoute();
  setActiveLink(route.page);

  if (route.page === lastLoadedPage) {
    if (pendingLoadPage && pendingLoadPage !== route.page) {
      activeLoadId++;
      pendingLoadPage = null;
      document.body.classList.toggle('page-home', route.page === 'home');
      content.classList.remove('fading-out');
      content.classList.remove('fading-in');
    }

    if (route.page === 'publications' && applyPublicationFilter) {
      applyPublicationFilter(route.filter, { updateRoute: false });
    }
    return;
  }

  loadPage(route.page, route.filter);
}

function navigateTo(page) {
  const newHash = buildRouteHash(page);
  if (location.hash !== newHash) {
    pushRouteState(newHash, { page, filter: 'selected' });
  }
  handleRoute();
}

// Navigation clicks
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) navigateTo(page);
  });
});

// Hash and history navigation
window.addEventListener('hashchange', handleRoute);
window.addEventListener('popstate', handleRoute);

// Lightbox Modal
(function initLightbox() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.getElementById('modal-close');
  if (!modal || !modalImg || !closeBtn) return;

  let lastFocused = null;

  function openModal(img) {
    lastFocused = document.activeElement;
    modal.classList.add('active');
    modalImg.src = img.src;
    modalImg.alt = img.alt || uiText[currentLanguage].imagePreview;
    document.body.style.overflow = 'hidden';
    modal.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', e => {
    if (e.target.matches('.pub-image, .gallery-slide img')) openModal(e.target);
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('.pub-image, .gallery-slide img') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openModal(e.target);
    }
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
})();

// Copy publication citations
async function copyCitation(button) {
  const citation = button.dataset.citation;
  if (!citation) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(citation);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = citation;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      if (!copied) throw new Error('Clipboard copy was rejected');
    }

    button.textContent = uiText[currentLanguage].citeCopiedLabel;
    button.setAttribute('aria-label', uiText[currentLanguage].citeCopied);
  } catch (error) {
    console.error('Error copying citation:', error);
    button.textContent = uiText[currentLanguage].citeFailedLabel;
    button.setAttribute('aria-label', uiText[currentLanguage].citeFailed);
  }

  clearTimeout(button.citeResetTimer);
  button.citeResetTimer = setTimeout(() => {
    button.textContent = '[Cite (APA)]';
    button.setAttribute('aria-label', uiText[currentLanguage].citeLabel);
  }, 1500);
}

document.addEventListener('click', event => {
  const citeButton = event.target.closest('.cite-link');
  if (!citeButton) return;
  event.preventDefault();
  copyCitation(citeButton);
});

// Mobile menu toggle
(function initMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!btn || !sidebar) return;

  function setMenuState(open) {
    sidebar.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    updateMenuButtonLabel();
  }

  btn.addEventListener('click', () => {
    setMenuState(!sidebar.classList.contains('menu-open'));
  });

  // Close menu when a nav link is clicked
  sidebar.addEventListener('click', e => {
    if (e.target.matches('a[data-page]') || e.target.closest('a[data-page]')) {
      setMenuState(false);
    }
  });
})();

// Language switcher
(function initLanguageSwitcher() {
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const toggles = document.querySelectorAll('.language-toggle');
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      setLanguage(currentLanguage === 'en' ? 'zh' : 'en');

      if (sidebar?.classList.contains('menu-open') && menuToggle) {
        sidebar.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        updateMenuButtonLabel();
        menuToggle.focus();
      }
    });
  });
})();

// Conditional top control
let topButtonFrame = null;

function updateTopButtonVisibility() {
  const button = document.querySelector('#btn-top');
  if (!button) return;

  const pageCanScroll = document.documentElement.scrollHeight > window.innerHeight + 1;
  const shouldShow = pageCanScroll && window.scrollY > 160;
  button.hidden = !shouldShow;
}

function scheduleTopButtonUpdate() {
  if (topButtonFrame !== null) return;
  topButtonFrame = window.requestAnimationFrame(() => {
    topButtonFrame = null;
    updateTopButtonVisibility();
  });
}

window.addEventListener('scroll', scheduleTopButtonUpdate, { passive: true });
window.addEventListener('resize', scheduleTopButtonUpdate);
window.addEventListener('load', scheduleTopButtonUpdate);

(function initTopControl() {
  const btn = document.querySelector('#btn-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  updateTopButtonVisibility();
})();

// Initial load
const initialRoute = parseRoute();
document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
updateInterfaceText();
setActiveLink(initialRoute.page);
loadPage(initialRoute.page, initialRoute.filter);

// Easter egg
(function initEasterEgg() {
  const trigger = document.getElementById('easter-egg');
  const overlay = document.getElementById('easter-egg-overlay');
  if (!trigger || !overlay) return;

  trigger.addEventListener('click', () => overlay.classList.add('active'));
  overlay.addEventListener('click', () => overlay.classList.remove('active'));
})();
