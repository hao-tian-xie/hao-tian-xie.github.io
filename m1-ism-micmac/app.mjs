import {
  applySourceSelections,
  buildDirectMatrix,
  buildSubmission,
  createPairs,
  selectedTargetsForSource,
  tryWriteStorage,
} from './survey-core.mjs';
import { localisedFactors, studyConfig } from './survey-config.mjs';
import { copy, languageNames, locales } from './translations.mjs';

const STORAGE_KEY = `bextools:${studyConfig.id}:${studyConfig.version}`;
const NONE_VALUE = '__none__';
const factors = studyConfig.factors;
const factorIds = factors.map((factor) => factor.id);
const pairs = createPairs(factors);
const app = document.querySelector('#app');
const languageSwitch = document.querySelector('#language-switch');
const guideButton = document.querySelector('#guide-button');
const guideButtonLabel = document.querySelector('#guide-button-label');
const guideOverlay = document.querySelector('#guide-overlay');
const guideSpotlight = document.querySelector('#guide-spotlight');
const guideCallout = document.querySelector('#guide-callout');
const guideDialogStep = document.querySelector('#guide-dialog-step');
const guideDialogTitle = document.querySelector('#guide-dialog-title');
const guideDialogCopy = document.querySelector('#guide-dialog-copy');
const guideDots = document.querySelector('#guide-dots');
const guidePrevious = document.querySelector('#guide-previous');
const guideNext = document.querySelector('#guide-next');
const guideClose = document.querySelector('#guide-close');
const guideSteps = [
  { screen: 'welcome', target: '.hero-button', title: 'guideWelcomeTitle', text: 'guideWelcomeText' },
  { screen: 'profile', target: '.profile-form [name="code"]', title: 'guideCodeTitle', text: 'guideCodeText' },
  { screen: 'profile', target: '.profile-form [name="role"]', title: 'guideRoleTitle', text: 'guideRoleText' },
  { screen: 'profile', target: '.profile-form .primary-button', title: 'guideStartTitle', text: 'guideStartText' },
  { screen: 'survey', target: '.source-topic', title: 'guideIfTitle', text: 'guideIfText' },
  { screen: 'survey', target: '.target-fieldset', title: 'guideThenTitle', text: 'guideThenText' },
  { screen: 'survey', target: '.topic-notes', title: 'guideNotesTitle', text: 'guideNotesText' },
  { screen: 'survey', target: '.topic-actions .primary-button', title: 'guideNextTitle', text: 'guideNextText' },
  { screen: 'review', target: '.review-actions .primary-button', title: 'guideSubmitTitle', text: 'guideSubmitText' },
];

const roleKeys = ['roleOperations', 'roleEsg', 'roleTechnology', 'roleManagement', 'roleAcademic', 'roleOther'];
const experienceKeys = ['exp1', 'exp2', 'exp3', 'exp4'];
let storageAvailable = true;

function preferredLocale() {
  const queryLocale = new URLSearchParams(window.location.search).get('lang');
  if (locales.includes(queryLocale)) return queryLocale;

  const browserLocale = navigator.language || '';
  if (/^zh-(HK|TW|MO)/i.test(browserLocale)) return 'zh-HK';
  if (/^zh/i.test(browserLocale)) return 'zh-CN';
  return 'en';
}

function emptySelections() {
  return Object.fromEntries(factorIds.map((id) => [id, []]));
}

function blankState(locale = preferredLocale()) {
  return {
    locale,
    screen: 'welcome',
    participant: { code: '', role: '', experience: '' },
    answers: {},
    factorSelections: emptySelections(),
    noInfluenceFactors: [],
    reviewedFactors: [],
    currentIndex: 0,
    editingFromReview: false,
    showValidation: false,
    completedAt: '',
    submissionId: '',
    clientSubmissionId: '',
    submitState: 'idle',
    confirmNewResponse: false,
  };
}

function validTargetIds(sourceId, values) {
  if (!Array.isArray(values)) return [];
  const allowed = new Set(factorIds.filter((id) => id !== sourceId));
  return factorIds.filter((id) => allowed.has(id) && values.includes(id));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return blankState();

    const answers = saved.answers || {};
    const factorSelections = Object.fromEntries(factorIds.map((sourceId) => {
      const stored = saved.factorSelections?.[sourceId];
      const inferred = selectedTargetsForSource(answers, pairs, sourceId);
      return [sourceId, validTargetIds(sourceId, Array.isArray(stored) ? stored : inferred)];
    }));
    const legacyComplete = pairs.every((pair) => answers[pair.id]?.relation);
    const reviewedFactors = Array.isArray(saved.reviewedFactors)
      ? factorIds.filter((id) => saved.reviewedFactors.includes(id))
      : legacyComplete ? [...factorIds] : [];
    const noInfluenceFactors = Array.isArray(saved.noInfluenceFactors)
      ? factorIds.filter((id) => saved.noInfluenceFactors.includes(id))
      : reviewedFactors.filter((id) => factorSelections[id].length === 0);
    const submissionId = String(saved.submissionId || '');

    return {
      ...blankState(locales.includes(saved.locale) ? saved.locale : preferredLocale()),
      ...saved,
      screen: 'welcome',
      answers,
      factorSelections,
      noInfluenceFactors,
      reviewedFactors,
      participant: { ...blankState().participant, ...(saved.participant || {}) },
      currentIndex: Math.min(Math.max(Number(saved.currentIndex) || 0, 0), factors.length - 1),
      editingFromReview: false,
      submitState: 'idle',
      completedAt: submissionId ? saved.completedAt || '' : '',
      submissionId,
    };
  } catch {
    storageAvailable = false;
    return blankState();
  }
}

let state = loadState();
let guideIndex = 0;
let guideReturnScreen = state.screen;
let guideIsOpen = false;

function t(key, values = {}) {
  const template = copy[state.locale][key] || copy.en[key] || key;
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function localeText(value) {
  return value?.[state.locale] || value?.en || '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reviewedCount() {
  return state.reviewedFactors.length;
}

function allTopicsReviewed() {
  return reviewedCount() === factors.length;
}

function progressPercent() {
  return factors.length ? Math.round((reviewedCount() / factors.length) * 100) : 0;
}

function directLinkCount() {
  return factorIds.reduce((total, id) => total + (state.factorSelections[id]?.length || 0), 0);
}

function factorFor(id) {
  const factor = factors.find((item) => item.id === id);
  return {
    id: factor.id,
    label: localeText(factor.name),
    description: localeText(factor.description),
  };
}

function selectedTargets(sourceId) {
  return validTargetIds(sourceId, state.factorSelections[sourceId]);
}

function createClientSubmissionId() {
  if (typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  if (typeof window.crypto?.getRandomValues === 'function') {
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `m1-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function hasExplicitNone(sourceId) {
  return state.noInfluenceFactors.includes(sourceId);
}

function persist() {
  if (!storageAvailable) return false;

  const snapshot = {
    ...state,
    screen: undefined,
    editingFromReview: false,
    submitState: 'idle',
  };
  try {
    storageAvailable = tryWriteStorage(window.localStorage, STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

function pageTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function focusPageHeading() {
  document.querySelector('[data-page-title]')?.focus({ preventScroll: true });
}

function goTo(screen, { scroll = true } = {}) {
  state.screen = screen;
  render();
  if (scroll) pageTop();
  focusPageHeading();
}

function renderLanguages() {
  const languageLabel = {
    'zh-CN': '语言切换',
    'zh-HK': '語言切換',
    en: 'Language',
  }[state.locale];
  languageSwitch.setAttribute('aria-label', languageLabel);
  languageSwitch.innerHTML = locales.map((locale) => `
    <button type="button" data-locale="${locale}" class="${state.locale === locale ? 'is-active' : ''}" aria-pressed="${state.locale === locale}">
      ${languageNames[locale]}
    </button>
  `).join('');
}

function renderGuide() {
  if (!guideOverlay) return;
  guideButtonLabel.textContent = t('guideButton');
  guideButton.title = t('guideTitle');
  guideOverlay.hidden = !guideIsOpen;
  if (!guideIsOpen) return;

  const step = guideSteps[guideIndex];
  guideDialogStep.textContent = t('guideStep', { i: guideIndex + 1, total: guideSteps.length });
  guideDialogTitle.textContent = t(step.title);
  guideDialogCopy.textContent = t(step.text);
  guideCallout.setAttribute('aria-label', t(step.title));
  guideClose.setAttribute('aria-label', t('guideClose'));
  guidePrevious.textContent = t('guidePrevious');
  guidePrevious.disabled = guideIndex === 0;
  guideNext.textContent = guideIndex === guideSteps.length - 1 ? t('guideFinish') : t('guideNext');
  guideDots.innerHTML = guideSteps.map((item, index) => `<span class="${index === guideIndex ? 'is-active' : ''}"></span>`).join('');
  requestAnimationFrame(positionGuide);
}

function positionGuide(allowScrollAdjust = false) {
  if (!guideIsOpen || !guideOverlay || guideOverlay.hidden) return;
  const step = guideSteps[guideIndex];
  const target = document.querySelector(step.target);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const padding = 7;
  guideSpotlight.style.left = `${Math.max(8, rect.left - padding)}px`;
  guideSpotlight.style.top = `${Math.max(8, rect.top - padding)}px`;
  guideSpotlight.style.width = `${Math.max(24, rect.width + padding * 2)}px`;
  guideSpotlight.style.height = `${Math.max(24, rect.height + padding * 2)}px`;

  const calloutWidth = guideCallout.offsetWidth || 320;
  const calloutHeight = guideCallout.offsetHeight || 240;
  const gap = 16;
  const edge = 16;
  let left = rect.right + gap;
  let top = rect.top;

  if (left + calloutWidth > window.innerWidth - edge) {
    const leftSide = rect.left - calloutWidth - gap;
    if (leftSide >= edge) {
      left = leftSide;
    } else {
      left = rect.left;
      top = rect.bottom + gap;
    }
  }
  if (top + calloutHeight > window.innerHeight - edge) {
    top = rect.top - calloutHeight - gap;
  }
  if (top < edge) top = edge;
  if (left + calloutWidth > window.innerWidth - edge) left = window.innerWidth - calloutWidth - edge;
  if (left < edge) left = edge;

  const targetRight = rect.left + rect.width;
  const targetBottom = rect.top + rect.height;
  const overlapsTarget = left < targetRight + padding
    && left + calloutWidth > rect.left - padding
    && top < targetBottom + padding
    && top + calloutHeight > rect.top - padding;
  if (overlapsTarget && !allowScrollAdjust) {
    target.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'auto' });
    requestAnimationFrame(() => positionGuide(true));
    return;
  }

  guideCallout.style.left = `${left}px`;
  guideCallout.style.top = `${top}px`;
}

function showGuideStep(index) {
  guideIndex = Math.min(Math.max(index, 0), guideSteps.length - 1);
  const step = guideSteps[guideIndex];
  if (state.screen !== step.screen) {
    state.screen = step.screen;
    render();
  } else {
    renderGuide();
  }

  requestAnimationFrame(() => {
    const target = document.querySelector(step.target);
    target?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    requestAnimationFrame(positionGuide);
  });
  guideNext?.focus({ preventScroll: true });
}

function openGuide() {
  guideReturnScreen = state.screen;
  guideIsOpen = true;
  guideIndex = 0;
  showGuideStep(0);
}

function closeGuide() {
  if (!guideIsOpen) return;
  guideIsOpen = false;
  state.screen = guideReturnScreen;
  render();
  guideButton?.focus({ preventScroll: true });
}

function renderStepper() {
  const activeIndex = {
    profile: 0,
    survey: 1,
    review: 2,
    complete: 2,
  }[state.screen] ?? 0;
  const steps = [t('stepProfile'), t('stepSurvey'), t('stepReview')];

  return `
    <aside class="step-sidebar" aria-label="${escapeHtml(t('progressLabel'))}">
      <div class="mini-brand">M1 <span>·</span> ISM / MICMAC</div>
      <ol class="steps">
        ${steps.map((label, index) => `
          <li class="${index === activeIndex ? 'is-active' : ''} ${index < activeIndex ? 'is-done' : ''}" ${index === activeIndex ? 'aria-current="step"' : ''}>
            <span>${String(index + 1).padStart(2, '0')}</span>
            <b>${escapeHtml(label)}</b>
          </li>
        `).join('')}
      </ol>
      <div class="sidebar-progress">
        <div class="sidebar-progress-copy">
          <span>${escapeHtml(t('progressLabel'))}</span>
          <b data-progress-percent>${progressPercent()}%</b>
        </div>
        <progress class="native-progress" max="${factors.length}" value="${reviewedCount()}" aria-label="${escapeHtml(t('progressLabel'))}"></progress>
        <small data-progress-count>${escapeHtml(t('confirmedProgress', { n: reviewedCount(), total: factors.length }))}</small>
      </div>
    </aside>
  `;
}

function renderShell(content, className = '') {
  return `
    <main class="app-shell ${className}">
      ${renderStepper()}
      <section class="content-stage">${content}</section>
    </main>
  `;
}

function renderWelcome() {
  const hasProgress = reviewedCount() > 0
    || factorIds.some((id) => selectedTargets(id).length || hasExplicitNone(id))
    || state.participant.code;
  const factorCards = factors.map((factor) => `
    <details class="factor-preview">
      <summary><span>${factor.id}</span><b>${escapeHtml(localeText(factor.name))}</b><i aria-hidden="true">+</i></summary>
      <p>${escapeHtml(localeText(factor.description))}</p>
    </details>
  `).join('');

  return `
    <main class="welcome-page">
      <section class="welcome-hero">
        <div class="welcome-copy">
          <p class="eyebrow">${escapeHtml(t('eyebrow'))}</p>
          <h1 data-page-title tabindex="-1">${escapeHtml(t('heroTitle'))}</h1>
          <div class="scope-card">
            <span>${escapeHtml(t('scopeLabel'))}</span>
            <p>${escapeHtml(localeText(studyConfig.scope))}</p>
          </div>

          <div class="study-stats" aria-label="${escapeHtml(t('overviewLabel'))}">
            <span class="study-summary">${escapeHtml(t('minutesUnit'))}</span>
          </div>

          <button class="primary-button hero-button" type="button" data-action="start">
            ${escapeHtml(hasProgress ? t('continue') : t('start'))}<span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section class="factor-section">
        <div class="section-heading">
          <div><p class="eyebrow">M1</p><h2>${escapeHtml(t('factorList'))}</h2></div>
        </div>
        <div class="factor-preview-grid">${factorCards}</div>
      </section>
    </main>
  `;
}

function renderProfile() {
  const codeHasError = state.showValidation && !state.participant.code.trim();
  const roleHasError = state.showValidation && !state.participant.role;
  const hasError = codeHasError || roleHasError;
  const roleOptions = roleKeys.map((key) => `
    <option value="${key}" ${state.participant.role === key ? 'selected' : ''}>${escapeHtml(t(key))}</option>
  `).join('');
  const experiences = experienceKeys.map((key) => `
    <label class="radio-card">
      <input type="radio" name="experience" value="${key}" ${state.participant.experience === key ? 'checked' : ''} />
      <span>${escapeHtml(t(key))}</span>
    </label>
  `).join('');

  return renderShell(`
    <div class="form-page">
      <header class="page-heading">
        <p class="eyebrow">${escapeHtml(t('profileEyebrow'))}</p>
        <h1 data-page-title tabindex="-1">${escapeHtml(t('profileTitle'))}</h1>
      </header>

      <form class="profile-form" id="profile-form" novalidate>
        <label class="field-group">
          <span>${escapeHtml(t('codeLabel'))}<em>*</em></span>
          <input name="code" type="text" maxlength="36" autocomplete="off" required aria-required="true" value="${escapeHtml(state.participant.code)}" placeholder="${escapeHtml(t('codePlaceholder'))}" aria-invalid="${codeHasError}" ${codeHasError ? 'aria-describedby="profile-error"' : ''} />
        </label>

        <label class="field-group">
          <span>${escapeHtml(t('roleLabel'))}<em>*</em></span>
          <select name="role" required aria-required="true" aria-invalid="${roleHasError}" ${roleHasError ? 'aria-describedby="profile-error"' : ''}>
            <option value="">${escapeHtml(t('rolePlaceholder'))}</option>
            ${roleOptions}
          </select>
        </label>

        <fieldset class="field-group experience-group">
          <legend>${escapeHtml(t('experienceLabel'))}</legend>
          <div class="radio-grid">${experiences}</div>
        </fieldset>

        ${hasError ? `<p class="form-error" id="profile-error" role="alert">${escapeHtml(t('requiredMessage'))}</p>` : ''}

        <div class="form-actions">
          <button class="text-button" type="button" data-action="back-welcome"><span aria-hidden="true">←</span>${escapeHtml(t('back'))}</button>
          <button class="primary-button" type="submit">${escapeHtml(t('beginTopics'))}<span aria-hidden="true">→</span></button>
        </div>
      </form>
    </div>
  `, 'form-shell');
}

function targetOption(source, target) {
  const selected = selectedTargets(source.id).includes(target.id);
  return `
    <label class="target-option ${selected ? 'is-selected' : ''}">
      <input type="checkbox" name="direct-target" value="${target.id}" data-source-id="${source.id}" ${selected ? 'checked' : ''} />
      <span class="target-code">${target.id}</span>
      <span class="target-copy">
        <strong>${escapeHtml(target.label)}</strong>
      </span>
    </label>
  `;
}

function renderSurvey() {
  const source = factorFor(factors[state.currentIndex].id);
  const targets = factors
    .filter((factor) => factor.id !== source.id)
    .map((factor) => factorFor(factor.id));
  const noneSelected = hasExplicitNone(source.id);
  const hasChoice = selectedTargets(source.id).length > 0 || noneSelected;
  const isLast = state.currentIndex === factors.length - 1;
  const topicNotes = targets.map((target) => `
    <li><b>${escapeHtml(target.id)} · ${escapeHtml(target.label)}</b><span>${escapeHtml(target.description)}</span></li>
  `).join('');

  return renderShell(`
    <div class="survey-page topic-survey">
      <header class="survey-topline">
        <div>
          <p class="eyebrow">${escapeHtml(t('surveyEyebrow'))}</p>
          <p class="pair-position">${escapeHtml(t('topicPosition', { i: state.currentIndex + 1, total: factors.length }))}</p>
        </div>
        <div class="topic-progress">
          <span>${escapeHtml(t('confirmedProgress', { n: reviewedCount(), total: factors.length }))}</span>
          <progress max="${factors.length}" value="${reviewedCount()}" aria-label="${escapeHtml(t('progressLabel'))}"></progress>
        </div>
      </header>

      <div class="topic-workspace">
        <section class="source-topic" aria-labelledby="source-topic-name">
          <span class="topic-kicker">${escapeHtml(t('ifLabel'))}</span>
          <div>
            <span class="source-code">${source.id}</span>
            <h2 id="source-topic-name">${escapeHtml(source.label)}</h2>
            <p>${escapeHtml(source.description)}</p>
          </div>
        </section>

        <section class="topic-decision">
          <div class="topic-question">
            <span class="question-kicker">${escapeHtml(t('thenLabel'))}</span>
            <h1 data-page-title tabindex="-1">${escapeHtml(t('topicQuestion'))}</h1>
            <p class="choice-hint" id="choice-help">${escapeHtml(t('selectTargets'))}</p>
          </div>

          <fieldset class="target-fieldset" aria-describedby="choice-help">
            <legend class="visually-hidden">${escapeHtml(t('targetLegend'))}</legend>
            <div class="target-list">
              ${targets.map((target) => targetOption(source, target)).join('')}
              <label class="target-option none-option ${noneSelected ? 'is-selected' : ''}">
                <input type="checkbox" name="direct-target" value="${NONE_VALUE}" data-source-id="${source.id}" ${noneSelected ? 'checked' : ''} />
                <span class="target-code">—</span>
                <span class="target-copy">
                  <strong>${escapeHtml(t('noneOption'))}</strong>
                </span>
              </label>
            </div>
          </fieldset>
        </section>
      </div>

      <div class="survey-actions topic-actions">
        <button class="text-button" type="button" data-action="previous-topic" ${state.currentIndex === 0 ? 'disabled' : ''}>
          <span aria-hidden="true">←</span>${escapeHtml(t('previousTopic'))}
        </button>
        <button class="primary-button" type="button" data-action="confirm-topic" ${hasChoice ? '' : 'disabled'}>
          ${escapeHtml(state.editingFromReview ? t('confirmAndReview') : isLast ? t('confirmAndReview') : t('confirmAndNext'))}<span aria-hidden="true">→</span>
        </button>
      </div>
      <section class="topic-notes" aria-label="${escapeHtml(t('candidateNotes'))}">
        <h2>${escapeHtml(t('candidateNotes'))}</h2>
        <ul>${topicNotes}</ul>
      </section>
    </div>
  `, 'survey-shell');
}

function renderMatrix() {
  const localFactors = localisedFactors(state.locale);
  const matrix = buildDirectMatrix(localFactors, state.answers);
  const idIndex = new Map(localFactors.map((factor, index) => [factor.id, index]));

  function cell(rowFactor, columnFactor) {
    if (rowFactor.id === columnFactor.id) return '<td class="matrix-self">·</td>';
    const value = matrix[idIndex.get(rowFactor.id)][idIndex.get(columnFactor.id)];
    if (value === null) return '<td class="matrix-empty"></td>';
    return `<td class="matrix-${value}">${value}</td>`;
  }

  return `
    <p class="matrix-swipe-hint">${escapeHtml(t('matrixSwipeHint'))}</p>
    <div class="matrix-scroll" tabindex="0" role="region" aria-labelledby="matrix-title">
      <table class="direction-matrix">
        <thead><tr><th></th>${localFactors.map((factor) => `<th title="${escapeHtml(factor.label)}">${factor.id}</th>`).join('')}</tr></thead>
        <tbody>
          ${localFactors.map((rowFactor) => `
            <tr><th title="${escapeHtml(rowFactor.label)}">${rowFactor.id}</th>${localFactors.map((columnFactor) => cell(rowFactor, columnFactor)).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function pairArrow(relation) {
  return { V: '→', A: '←', X: '↔', O: '—' }[relation] || '?';
}

function pairRelationText(relation) {
  return {
    V: t('leftToRightShort'),
    A: t('rightToLeftShort'),
    X: t('bothDirectionsShort'),
    O: t('noRelationShort'),
  }[relation] || t('unanswered');
}

function renderPairReview(isLocked = false) {
  return pairs.map((pair, index) => {
    const left = factorFor(pair.leftId);
    const right = factorFor(pair.rightId);
    const relation = state.answers[pair.id]?.relation;
    return `
      <div class="pair-review-row">
        <span class="pair-review-index">${index + 1}</span>
        <span class="pair-review-factors">
          <button type="button" data-action="edit-topic" data-factor-id="${left.id}" aria-label="${escapeHtml(t('editTopicLabel', { topic: left.label }))}" ${isLocked ? 'disabled' : ''}>${escapeHtml(left.label)}</button>
          <i aria-hidden="true">${pairArrow(relation)}</i>
          <button type="button" data-action="edit-topic" data-factor-id="${right.id}" aria-label="${escapeHtml(t('editTopicLabel', { topic: right.label }))}" ${isLocked ? 'disabled' : ''}>${escapeHtml(right.label)}</button>
        </span>
        <span class="pair-review-result">${escapeHtml(pairRelationText(relation))}</span>
      </div>
    `;
  }).join('');
}

function renderReview() {
  const isSubmitting = state.submitState === 'submitting';
  const topicRows = factors.map((factor, index) => {
    const source = factorFor(factor.id);
    const selected = selectedTargets(source.id).map((id) => factorFor(id).label);
    return `
      <button class="topic-review-row" type="button" data-action="edit-topic" data-factor-id="${source.id}" ${isSubmitting ? 'disabled' : ''}>
        <span class="review-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="topic-review-source"><b>${escapeHtml(source.label)}</b><small>${source.id}</small></span>
        <span class="topic-review-result"><i aria-hidden="true">→</i>${escapeHtml(selected.length ? selected.join(t('listSeparator')) : t('noneResult'))}</span>
        <span class="review-edit">${escapeHtml(t('edit'))} →</span>
      </button>
    `;
  }).join('');
  return renderShell(`
    <div class="review-page">
      <header class="page-heading review-heading">
        <p class="eyebrow">${escapeHtml(t('reviewEyebrow'))}</p>
        <h1 data-page-title tabindex="-1">${escapeHtml(t('reviewTitle'))}</h1>
      </header>

      <div class="review-summary">
        <article><span>${escapeHtml(t('confirmedTopics'))}</span><b>${reviewedCount()} / ${factors.length}</b></article>
        <article><span>${escapeHtml(t('directLinks'))}</span><b>${directLinkCount()}</b></article>
        <article><span>${escapeHtml(t('allTopics'))}</span><b>${factors.length}</b></article>
      </div>

      <div class="review-actions">
        <button class="text-button" type="button" data-action="back-survey" ${isSubmitting ? 'disabled' : ''}><span aria-hidden="true">←</span>${escapeHtml(t('back'))}</button>
        <button class="primary-button" type="button" data-action="submit-response" ${isSubmitting || !allTopicsReviewed() ? 'disabled' : ''}>
          ${escapeHtml(isSubmitting ? t('submitting') : t('submitResponse'))}<span aria-hidden="true">→</span>
        </button>
      </div>
      ${state.submitState === 'error' ? `
        <div class="submit-error" role="alert">
          <span>${escapeHtml(t('submitError'))}</span>
          <button type="button" data-action="submit-response">${escapeHtml(t('retrySubmit'))}</button>
        </div>
      ` : ''}

      <section class="review-panel topic-list-panel">
        <div class="panel-heading">
          <div><h2>${escapeHtml(t('topicListTitle'))}</h2></div>
        </div>
        <div class="topic-review-list">${topicRows}</div>
      </section>

      <details class="review-panel pair-check-panel">
        <summary class="matrix-summary">
          <span><b>${escapeHtml(t('pairListTitle'))}</b></span>
          <i aria-hidden="true">+</i>
        </summary>
        <div class="pair-review-list">${renderPairReview(isSubmitting)}</div>
      </details>

      <details class="review-panel matrix-panel">
        <summary class="matrix-summary">
          <span><b id="matrix-title">${escapeHtml(t('matrixTitle'))}</b></span>
          <i aria-hidden="true">+</i>
        </summary>
        ${renderMatrix()}
      </details>
    </div>
  `, 'review-shell');
}

function renderComplete() {
  return renderShell(`
    <div class="complete-page">
      <h1 data-page-title tabindex="-1">${escapeHtml(t('completeTitle'))}</h1>

      <div class="receipt-block">
        <span>${escapeHtml(t('receiptLabel'))}</span>
        <strong>${escapeHtml(state.submissionId)}</strong>
      </div>

      <div class="complete-actions">
        <button class="secondary-button ${state.confirmNewResponse ? 'confirm-reset' : ''}" type="button" data-action="new-response">
          ${escapeHtml(state.confirmNewResponse ? t('confirmNewResponse') : t('newResponse'))}
        </button>
      </div>
    </div>
  `, 'complete-shell');
}

function render() {
  document.documentElement.lang = state.locale;
  document.body.dataset.screen = state.screen;
  document.title = `${localeText(studyConfig.title)} | BEXtools`;
  document.querySelector('meta[name="description"]').content = t('heroTitle');
  document.querySelector('#brand-subtitle').textContent = t('brand').replace('BEXtools', '').trim();
  renderLanguages();

  app.innerHTML = {
    welcome: renderWelcome,
    profile: renderProfile,
    survey: renderSurvey,
    review: renderReview,
    complete: renderComplete,
  }[state.screen]();
  renderGuide();
}

function profileIsReady() {
  return Boolean(state.participant.code.trim() && state.participant.role);
}

function updateProfileValidation() {
  if (!state.showValidation) return;
  const codeIsValid = Boolean(state.participant.code.trim());
  const roleIsValid = Boolean(state.participant.role);
  const codeInput = document.querySelector('[name="code"]');
  const roleSelect = document.querySelector('[name="role"]');
  codeInput?.setAttribute('aria-invalid', String(!codeIsValid));
  if (codeIsValid) codeInput?.removeAttribute('aria-describedby');
  else codeInput?.setAttribute('aria-describedby', 'profile-error');
  roleSelect?.setAttribute('aria-invalid', String(!roleIsValid));
  if (roleIsValid) roleSelect?.removeAttribute('aria-describedby');
  else roleSelect?.setAttribute('aria-describedby', 'profile-error');
  if (codeIsValid && roleIsValid) {
    state.showValidation = false;
    document.querySelector('#profile-error')?.remove();
  }
}

function firstUnreviewedIndex() {
  const index = factors.findIndex((factor) => !state.reviewedFactors.includes(factor.id));
  return index < 0 ? 0 : index;
}

function markCurrentTopicPending(sourceId) {
  state.reviewedFactors = state.reviewedFactors.filter((id) => id !== sourceId);
  state.completedAt = '';
  state.submissionId = '';
  state.clientSubmissionId = '';
  state.submitState = 'idle';
}

function updateSurveySelectionUi(sourceId) {
  const selected = new Set(selectedTargets(sourceId));
  const noneSelected = hasExplicitNone(sourceId);
  document.querySelectorAll('[name="direct-target"]').forEach((input) => {
    const checked = input.value === NONE_VALUE ? noneSelected : selected.has(input.value);
    input.checked = checked;
    input.closest('.target-option')?.classList.toggle('is-selected', checked);
  });

  const confirmButton = document.querySelector('[data-action="confirm-topic"]');
  if (confirmButton) confirmButton.disabled = !selected.size && !noneSelected;

  document.querySelectorAll('[data-progress-percent]').forEach((node) => {
    node.textContent = `${progressPercent()}%`;
  });
  document.querySelectorAll('[data-progress-count]').forEach((node) => {
    node.textContent = t('confirmedProgress', { n: reviewedCount(), total: factors.length });
  });
  document.querySelectorAll('progress').forEach((node) => {
    node.value = reviewedCount();
  });
  const topicProgress = document.querySelector('.topic-progress span');
  if (topicProgress) topicProgress.textContent = t('confirmedProgress', { n: reviewedCount(), total: factors.length });
}

function confirmCurrentTopic() {
  const sourceId = factors[state.currentIndex].id;
  const selected = selectedTargets(sourceId);
  if (!selected.length && !hasExplicitNone(sourceId)) return;

  state.answers = applySourceSelections(state.answers, pairs, sourceId, selected);
  if (!state.reviewedFactors.includes(sourceId)) state.reviewedFactors.push(sourceId);
  state.reviewedFactors = factorIds.filter((id) => state.reviewedFactors.includes(id));
  const returnToReview = state.editingFromReview;
  state.editingFromReview = false;
  persist();

  if (returnToReview || state.currentIndex === factors.length - 1) {
    if (allTopicsReviewed()) {
      goTo('review');
    } else {
      state.currentIndex = firstUnreviewedIndex();
      persist();
      render();
      pageTop();
      focusPageHeading();
    }
    return;
  }

  state.currentIndex += 1;
  persist();
  render();
  pageTop();
  focusPageHeading();
}

function buildCurrentSubmission() {
  const participant = {
    code: state.participant.code.trim(),
    role: state.participant.role ? t(state.participant.role) : '',
    roleCode: state.participant.role,
    experience: state.participant.experience ? t(state.participant.experience) : '',
    experienceCode: state.participant.experience,
  };
  const submission = buildSubmission({
    studyId: studyConfig.id,
    locale: state.locale,
    participant,
    factors: localisedFactors(state.locale),
    answers: state.answers,
    submittedAt: new Date().toISOString(),
  });

  return {
    ...submission,
    clientSubmissionId: state.clientSubmissionId,
    status: 'complete',
    collectionMethod: 'source-topic-multi-select-v1',
    confirmedTopics: {
      ids: [...state.reviewedFactors],
      total: factors.length,
      complete: allTopicsReviewed(),
    },
    sourceSelections: factorIds.map((sourceId) => ({
      sourceId,
      targetIds: selectedTargets(sourceId),
      noDirectInfluence: hasExplicitNone(sourceId),
    })),
    study: {
      title: localeText(studyConfig.title),
      scope: localeText(studyConfig.scope),
      factorVersion: studyConfig.version,
      relationDefinition: t('directOnly'),
      coding: { V: 'i→j', A: 'j→i', X: 'i↔j', O: 'no direct influence' },
    },
  };
}

async function submitResponse() {
  if (!allTopicsReviewed() || state.submitState === 'submitting') return;
  let clientSubmissionId = state.clientSubmissionId;
  state.submitState = 'submitting';
  render();

  try {
    if (!clientSubmissionId) {
      clientSubmissionId = createClientSubmissionId();
      state.clientSubmissionId = clientSubmissionId;
      persist();
    }
    const response = await fetch('/api/m1-submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildCurrentSubmission()),
    });
    if (!response.ok) throw new Error('submit failed');
    const receipt = await response.json();
    if (!receipt.submissionId) throw new Error('missing receipt');
    if (state.clientSubmissionId !== clientSubmissionId) return;

    state.submissionId = receipt.submissionId;
    state.completedAt = receipt.receivedAt || new Date().toISOString();
    state.submitState = 'success';
    persist();
    goTo('complete');
  } catch {
    if (clientSubmissionId && state.clientSubmissionId !== clientSubmissionId) return;
    state.submitState = 'error';
    render();
    document.querySelector('.submit-error')?.focus?.();
  }
}

languageSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('[data-locale]');
  if (!button) return;
  state.locale = button.dataset.locale;
  const url = new URL(window.location.href);
  url.searchParams.set('lang', state.locale);
  window.history.replaceState(null, '', url);
  persist();
  render();
  languageSwitch.querySelector(`[data-locale="${state.locale}"]`)?.focus({ preventScroll: true });
});

guideButton?.addEventListener('click', openGuide);
guideClose?.addEventListener('click', closeGuide);
guidePrevious?.addEventListener('click', () => {
  if (guideIndex === 0) return;
  showGuideStep(guideIndex - 1);
});
guideNext?.addEventListener('click', () => {
  if (guideIndex === guideSteps.length - 1) {
    closeGuide();
    return;
  }
  showGuideStep(guideIndex + 1);
});
guideOverlay?.addEventListener('click', (event) => {
  if (event.target === guideOverlay) closeGuide();
});
guideOverlay?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeGuide();
  }
});
window.addEventListener('resize', positionGuide);
window.addEventListener('scroll', positionGuide, { passive: true });

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'profile-form') return;
  event.preventDefault();
  state.showValidation = true;
  if (!profileIsReady()) {
    render();
    document.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  state.showValidation = false;
  state.currentIndex = firstUnreviewedIndex();
  persist();
  goTo('survey');
});

app.addEventListener('input', (event) => {
  if (event.target.name !== 'code') return;
  state.participant.code = event.target.value;
  updateProfileValidation();
  persist();
});

app.addEventListener('change', (event) => {
  const target = event.target;
  if (target.name === 'role') {
    state.participant.role = target.value;
    updateProfileValidation();
    persist();
    return;
  }
  if (target.name === 'experience') {
    state.participant.experience = target.value;
    persist();
    return;
  }
  if (target.name !== 'direct-target') return;

  const sourceId = target.dataset.sourceId;
  if (target.value === NONE_VALUE) {
    state.factorSelections[sourceId] = [];
    state.noInfluenceFactors = target.checked
      ? [...new Set([...state.noInfluenceFactors, sourceId])]
      : state.noInfluenceFactors.filter((id) => id !== sourceId);
  } else {
    const selected = new Set(selectedTargets(sourceId));
    if (target.checked) selected.add(target.value);
    else selected.delete(target.value);
    state.factorSelections[sourceId] = factorIds.filter((id) => selected.has(id));
    state.noInfluenceFactors = state.noInfluenceFactors.filter((id) => id !== sourceId);
  }

  markCurrentTopicPending(sourceId);
  persist();
  updateSurveySelectionUi(sourceId);
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (state.submitState === 'submitting') return;

  switch (button.dataset.action) {
    case 'start':
      if (state.submissionId) {
        goTo('complete');
      } else if (profileIsReady() && allTopicsReviewed()) {
        goTo('review');
      } else if (profileIsReady()) {
        state.currentIndex = firstUnreviewedIndex();
        goTo('survey');
      } else {
        goTo('profile');
      }
      break;
    case 'back-welcome':
      goTo('welcome');
      break;
    case 'previous-topic':
      if (state.currentIndex > 0) state.currentIndex -= 1;
      state.editingFromReview = false;
      persist();
      render();
      pageTop();
      focusPageHeading();
      break;
    case 'confirm-topic':
      confirmCurrentTopic();
      break;
    case 'edit-topic':
      state.currentIndex = factors.findIndex((factor) => factor.id === button.dataset.factorId);
      state.editingFromReview = true;
      persist();
      goTo('survey');
      break;
    case 'back-survey':
      state.currentIndex = factors.length - 1;
      state.editingFromReview = true;
      persist();
      goTo('survey');
      break;
    case 'submit-response':
      void submitResponse();
      break;
    case 'new-response':
      if (!state.confirmNewResponse) {
        state.confirmNewResponse = true;
        render();
        document.querySelector('[data-action="new-response"]')?.focus({ preventScroll: true });
        break;
      }
      {
        const locale = state.locale;
        try {
          if (storageAvailable) window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          storageAvailable = false;
        }
        state = blankState(locale);
        render();
        pageTop();
        focusPageHeading();
      }
      break;
    default:
      break;
  }
});

render();
