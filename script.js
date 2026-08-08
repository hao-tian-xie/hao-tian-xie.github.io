// script.js - Cargo-style SPA

const links = document.querySelectorAll('a[data-page]');
const content = document.getElementById('content');
const pageVersion = '18';
const languageStorageKey = 'site-language';

const uiText = {
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    'nav-about': 'About Me',
    'nav-publications': 'Publications',
    'nav-misc': 'Misc.',
    language: '中文',
    switchLanguage: 'Switch to Chinese',
    top: 'Top',
    'easter-egg': 'Operations Research & Complex Systems',
    imagePreview: 'Image preview',
    closeImage: 'Close image preview',
    loadError: 'Error loading page. Please try again.'
  },
  zh: {
    skip: '跳转到主要内容',
    menu: '菜单',
    close: '关闭',
    'nav-about': '关于我',
    'nav-publications': '发表论文',
    'nav-misc': '其他',
    language: 'English',
    switchLanguage: '切换至英文',
    top: '回到顶部',
    'easter-egg': '运筹学与复杂系统',
    imagePreview: '图片预览',
    closeImage: '关闭图片预览',
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

  const languageToggle = document.getElementById('language-toggle');
  if (languageToggle) {
    languageToggle.textContent = text.language;
    languageToggle.setAttribute('aria-label', text.switchLanguage);
  }

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

  const page = lastLoadedPage || initialPage;
  setActiveLink(page);
  loadPage(page);
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

async function loadPage(page) {
  lastLoadedPage = page;
  document.body.classList.toggle('page-home', page === 'home');
  try {
    const pageRoot = currentLanguage === 'zh' ? 'pages/zh' : 'pages';
    const pageSources = page === 'home'
      ? [`${pageRoot}/home.html?v=${pageVersion}`, `${pageRoot}/about.html?v=${pageVersion}`, `${pageRoot}/selected-publications.html?v=${pageVersion}`]
      : [`${pageRoot}/${page}.html?v=${pageVersion}`];
    const responses = await Promise.all(pageSources.map(source => fetch(source)));
    const failedResponse = responses.find(response => !response.ok);
    if (failedResponse) throw new Error(`HTTP error! status: ${failedResponse.status}`);
    const htmlParts = await Promise.all(responses.map(response => response.text()));
    const html = htmlParts.join('\n');

    // Animate out
    content.classList.add('fading-out');
    await new Promise(r => setTimeout(r, 150));

    // Swap content
    content.innerHTML = html;
    window.scrollTo(0, 0);

    // Publications year grouping
    if (page === 'publications' || page === 'home') {
      groupPublicationsByYear();
    }

    if (page === 'publications') {
      initPubTabs();
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

    // Update page title
    const pageTitles = currentLanguage === 'zh'
      ? { about: '关于我', publications: '发表论文', misc: '其他', home: '主页' }
      : { about: 'About', publications: 'Publications', misc: 'Miscellaneous', home: 'Home' };
    document.title = pageTitles[page]
      ? `${pageTitles[page]} - Haotian Xie`
      : 'Haotian Xie - Operations Research & Complex Systems';

    // Animate in
    content.classList.remove('fading-out');
    content.classList.add('fading-in');
    setTimeout(() => {
      content.classList.remove('fading-in');
      initScrollReveal();
    }, 400);

  } catch (error) {
    console.error('Error loading page:', error);
    content.innerHTML = `<p>${uiText[currentLanguage].loadError}</p>`;
  }
}

function groupPublicationsByYear() {
  const pubs = Array.from(content.querySelectorAll('.publication'));
  if (!pubs.length) return;

  const container = pubs[0].parentNode;
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

function initPubTabs() {
  const tabs = content.querySelectorAll('.pub-tab');
  if (!tabs.length) return;

  function applyFilter(filter) {
    const pubs = content.querySelectorAll('.publication');
    pubs.forEach(pub => {
      const isSelected = pub.dataset.selected === 'true';
      pub.style.display = (filter === 'all' || isSelected) ? '' : 'none';
      pub.classList.remove('pub-last-visible');
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      applyFilter(tab.dataset.filter);
    });
  });

  const activeTab = content.querySelector('.pub-tab.active');
  applyFilter(activeTab ? activeTab.dataset.filter : 'selected');
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

// Navigation clicks
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (!page) return;
    const newHash = page === 'home' ? '' : page;
    if (location.hash.slice(1) !== newHash) {
      location.hash = newHash || '#';
    }
    setActiveLink(page);
    loadPage(page);
  });
});

// Hash navigation (back/forward only - skip if triggered by click)
let lastLoadedPage = null;
window.addEventListener('hashchange', () => {
  const page = location.hash ? location.hash.slice(1) : 'home';
  if (page === lastLoadedPage) return;
  setActiveLink(page);
  loadPage(page);
});

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
  const toggle = document.getElementById('language-toggle');
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    setLanguage(currentLanguage === 'en' ? 'zh' : 'en');

    if (sidebar?.classList.contains('menu-open') && menuToggle) {
      sidebar.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      updateMenuButtonLabel();
      menuToggle.focus();
    }
  });
})();

// Mobile bottom bar
(function initMobileFooter() {
  document.querySelectorAll('#btn-top, #btn-top-right').forEach(btn => {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

// Initial load
const initialPage = location.hash ? location.hash.slice(1) : 'home';
document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
updateInterfaceText();
setActiveLink(initialPage);
loadPage(initialPage);

// Easter egg
(function initEasterEgg() {
  const trigger = document.getElementById('easter-egg');
  const overlay = document.getElementById('easter-egg-overlay');
  if (!trigger || !overlay) return;

  trigger.addEventListener('click', () => overlay.classList.add('active'));
  overlay.addEventListener('click', () => overlay.classList.remove('active'));
})();
