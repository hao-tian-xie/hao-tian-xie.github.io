// script.js — Cargo-style SPA

const links = document.querySelectorAll('a[data-page]');
const content = document.getElementById('content');

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
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();

    // Animate out
    content.classList.add('fading-out');
    await new Promise(r => setTimeout(r, 150));

    // Swap content
    content.innerHTML = html;
    window.scrollTo(0, 0);

    // Publications year grouping
    if (page === 'publications') {
      groupPublicationsByYear();
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
    const pageTitles = { about: 'About', publications: 'Publications', misc: 'Miscellaneous', home: 'Home' };
    document.title = pageTitles[page]
      ? `${pageTitles[page]} — Haotian Xie`
      : 'Haotian Xie — Operations Research & Complex Systems';

    // Animate in
    content.classList.remove('fading-out');
    content.classList.add('fading-in');
    setTimeout(() => {
      content.classList.remove('fading-in');
      initScrollReveal();
    }, 400);

  } catch (error) {
    console.error('Error loading page:', error);
    content.innerHTML = '<p>Error loading page. Please try again.</p>';
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

// Scroll reveal — Cargo-style scale-in
function initScrollReveal() {
  const targets = content.querySelectorAll('.year-section, .publication, .news-section');
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
    const newHash = page === 'about' ? '' : page;
    if (location.hash.slice(1) !== newHash) {
      location.hash = newHash || '#';
    }
    setActiveLink(page);
    loadPage(page);
  });
});

// Hash navigation (back/forward only — skip if triggered by click)
let lastLoadedPage = null;
window.addEventListener('hashchange', () => {
  const page = location.hash ? location.hash.slice(1) : 'about';
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
    modalImg.alt = img.alt || 'Publication figure';
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
    btn.textContent = open ? 'Close' : 'Menu';
    btn.setAttribute('aria-expanded', open);
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

// Mobile bottom bar
(function initMobileFooter() {
  document.querySelectorAll('#btn-top, #btn-top-right').forEach(btn => {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

// Initial load
const initialPage = location.hash ? location.hash.slice(1) : 'about';
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
