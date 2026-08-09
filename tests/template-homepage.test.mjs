import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [homepage, script, style, about, publications, misc, home, selectedPublications, zhAbout, zhPublications, zhMisc, zhHome, zhSelectedPublications] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../script.js', import.meta.url), 'utf8'),
  readFile(new URL('../style.css', import.meta.url), 'utf8'),
  readFile(new URL('../pages/about.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/publications.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/misc.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/home.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/selected-publications.html', import.meta.url), 'utf8').catch(() => ''),
  readFile(new URL('../pages/zh/about.html', import.meta.url), 'utf8').catch(() => ''),
  readFile(new URL('../pages/zh/publications.html', import.meta.url), 'utf8').catch(() => ''),
  readFile(new URL('../pages/zh/misc.html', import.meta.url), 'utf8').catch(() => ''),
  readFile(new URL('../pages/zh/home.html', import.meta.url), 'utf8').catch(() => ''),
  readFile(new URL('../pages/zh/selected-publications.html', import.meta.url), 'utf8').catch(() => ''),
]);

const chineseSite = [zhAbout, zhPublications, zhMisc, zhHome, zhSelectedPublications].join('\n');
const englishSite = [homepage, script, style, about, publications, misc, home, selectedPublications].join('\n');
const site = [englishSite, chineseSite].join('\n');

function contrastRatio(foreground, background) {
  const toRgb = hex => [0, 2, 4].map(offset => parseInt(hex.slice(1 + offset, 3 + offset), 16) / 255);
  const toLinear = channel => channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
  const luminance = hex => {
    const [r, g, b] = toRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test('homepage uses the SimpleAcademicHomepage shell with Haotian Xie content', () => {
  assert.match(homepage, /class="sidebar"/);
  assert.match(homepage, /class="container"/);
  assert.match(homepage, /class="mobile-header"/);
  assert.match(homepage, /class="mobile-footer"/);
  assert.equal((homepage.match(/id="btn-top"/g) ?? []).length, 1);
  assert.doesNotMatch(homepage, /id="btn-top-right"/);
  assert.match(homepage, /id="content"/);
  assert.match(homepage, /href="style\.css\?v=39"/);
  assert.match(homepage, /<script src="script\.js\?v=39"><\/script>/);
  assert.match(homepage, /class="mobile-header-name" href="#" data-page="home"/);
  assert.match(homepage, /<h1><a href="#" data-page="home">/);
  assert.match(homepage, /data-page="about"/);
  assert.match(homepage, /data-page="publications"/);
  assert.match(homepage, /data-page="misc"/);
  assert.match(homepage, /class="language-switcher"/);
  assert.match(homepage, /class="language-switcher"[\s\S]*id="language-toggle"[\s\S]*>Eng \/ 中<\/button>[\s\S]*<footer class="site-footer site-footer--sidebar">/);
  assert.match(homepage, /data-i18n="nav-about"/);
  assert.match(homepage, /data-i18n="nav-publications"/);
  assert.match(homepage, /data-i18n="nav-misc"/);
  assert.match(homepage, /<div class="sidebar-info">[\s\S]*?<a href="mailto:haotiantimxie@gmail\.com" data-i18n="email">Email<\/a>[\s\S]*?<a href="https:\/\/scholar\.google\.com\/citations\?user=X42fddQAAAAJ" target="_blank" rel="noopener noreferrer" data-i18n="scholar">Google Scholar<\/a>\s*<a href="https:\/\/www\.linkedin\.com\/in\/haotianxiehtxie\/" target="_blank" rel="noopener noreferrer" data-i18n="linkedin">LinkedIn<\/a>/);
  assert.doesNotMatch(homepage, /Hong Kong, China/);
  assert.match(script, /`\$\{pageRoot\}\/\$\{page\}\.html\?v=\$\{pageVersion\}`/);
  assert.match(script, /const pageVersion = '39';/);
  assert.match(script, /let currentLanguage/);
  assert.match(script, /localStorage/);
  assert.match(script, /pages\/zh/);
  assert.match(script, /language-toggle/);
  assert.match(script, /language: 'Eng \/ 中'/);
  assert.match(script, /email: '电子邮件'/);
  assert.match(script, /scholar: '谷歌学术'/);
  assert.match(script, /linkedin: '领英'/);
  assert.match(script, /setLanguage/);
  assert.match(script, /document\.documentElement\.lang/);
  assert.match(script, /sidebar\.classList\.remove\('menu-open'\)/);
  assert.match(script, /menuToggle\.focus\(\)/);
  assert.match(script, /const pageSources = page === 'home'/);
  assert.match(script, /`\$\{pageRoot\}\/home\.html\?v=\$\{pageVersion\}`, `\$\{pageRoot\}\/about\.html\?v=\$\{pageVersion\}`, `\$\{pageRoot\}\/selected-publications\.html\?v=\$\{pageVersion\}`/);
  assert.match(script, /if \(page === 'publications' \|\| page === 'home'\)/);
  assert.match(script, /function parseRoute\(hash = location\.hash\)/);
  assert.match(script, /URLSearchParams/);
  assert.match(script, /filter=\$\{filter\}/);
  assert.match(script, /history\.pushState/);
  assert.match(script, /window\.addEventListener\('popstate'/);
  assert.match(script, /window\.addEventListener\('hashchange'/);
  assert.match(script, /loadPage\(route\.page, route\.filter\)/);
  assert.match(script, /function initPubTabs\(initialFilter = 'selected'\)/);
  assert.match(script, /querySelector\('#btn-top'\)/);
  assert.doesNotMatch(script, /#btn-top-right/);
  assert.match(script, /groupPublicationsByYear/);
  assert.match(script, /initPubTabs/);
  assert.match(script, /data-publication-list/);
  assert.match(script, /filter === 'conference'/);
  assert.match(style, /\.sidebar\s*\{[\s\S]*?width:\s*45%;[\s\S]*?max-width:\s*500px;[\s\S]*?position:\s*fixed[\s\S]*?left:\s*0/);
  assert.match(style, /main\s*\{[\s\S]*?margin-left:\s*20%[\s\S]*?max-width:\s*80%/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?main\s*\{[\s\S]*?margin-left:\s*0[\s\S]*?max-width:\s*100%/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.mobile-header\s*\{[\s\S]*?padding-top:\s*max\(0\.1rem,\s*env\(safe-area-inset-top\)\)/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?min-height:\s*100dvh/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.sidebar-info a\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.nav-index a\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.pub-tab\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.mobile-footer-btn\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.mobile-footer\s*\{[\s\S]*?justify-content:\s*flex-start/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(homepage, /Haotian Xie/);
  assert.match(homepage, /haotiantimxie@gmail\.com/);
  assert.match(about, /Operations Research/);
  assert.match(about, /<strong>Operations Research with Complex Systems<\/strong>/);
  assert.match(about, /Department of Industrial and Systems Engineering \(ISE\)/);
  assert.match(about, /<a href="https:\/\/www\.polyu\.edu\.hk\/ise\/"[^>]*>Department of Industrial and Systems Engineering \(ISE\)<\/a>/);
  assert.match(about, /<a href="https:\/\/www\.polyu\.edu\.hk\/"[^>]*>The Hong Kong Polytechnic University \(PolyU\)<\/a>/);
  assert.match(about, /Dr\. <a href="https:\/\/research\.polyu\.edu\.hk\/en\/persons\/yung-po-tsang\/"[^>]*>Paul Tsang<\/a>/);
  assert.match(about, /obtained an M\.Sc\.\(Eng\) from/);
  assert.match(about, /<a href="https:\/\/www\.hku\.hk\/"[^>]*>The University of Hong Kong \(HKU\)<\/a>/);
  assert.match(about, /B\.Sc\. and a B\.Ec\. from/);
  assert.match(about, /<a href="https:\/\/sss\.bnu\.edu\.cn\/en\/"[^>]*>Systems Science<\/a>/);
  assert.match(about, /<a href="https:\/\/www\.bnu\.edu\.cn\/"[^>]*>Beijing Normal University \(BNU\)<\/a>/);
  assert.match(about, /Prof\. <a href="https:\/\/www\.dase\.hku\.hk\/people\/j-y-li"[^>]*>Jiayang Li<\/a>/);
  assert.match(about, /Prof\. <a href="https:\/\/sss\.bnu\.edu\.cn\/en\/Faculty\/Professor\/1fb42055bc1e42ca8e13c27e378e2d82\.htm"[^>]*>Zengru Di<\/a>/);
  assert.match(about, /Prof\. <a href="https:\/\/bibs\.bnu\.edu\.cn\/teachers\/qzjs\/zg\/1030da90293e4df386079cdb673f6619\.htm"[^>]*>Lei Chen<\/a>/);
  assert.match(about, /Data-driven decision making/);
  assert.match(about, /Logistics and supply chain management/);
  assert.match(about, /Complex networks theory/);
  assert.match(about, /Starting Spring 2027, I will join the .*ISE.* at .*PolyU.* as a Ph\.D\. student\./);
  assert.match(about, /class="about-grid"/);
  assert.match(about, /class="about-panel about-intro"/);
  assert.match(about, /class="about-panel about-interests"/);
  assert.match(about, /class="about-panel about-phd"/);
  assert.match(about, /class="about-panel about-contact"/);
  assert.match(about, /class="about-background"/);
  assert.match(style, /\.about-background\s*\{/);
  assert.doesNotMatch(about, /LinkedIn/);
  assert.doesNotMatch(about, /news-section|<h3>News<\/h3>/);
  assert.doesNotMatch(style, /\.news-section|\.news-list/);
  assert.doesNotMatch(script, /\.news-section/);
  assert.doesNotMatch(about, /Using data, mathematical models, and optimization to support better decisions\./);
  assert.doesNotMatch(about, /Applications across logistics, supply chains, transportation, and networked systems\./);
  assert.doesNotMatch(about, /Research connecting Operations Research with Complex Systems\./);
  assert.doesNotMatch(about, /class="interest-body"/);
  assert.doesNotMatch(about, /<details\b|<summary\b/);
  assert.equal((about.match(/class="interest"/g) ?? []).length, 3);
  assert.match(style, /\.interest::before\s*\{[\s\S]*?content:\s*'▶';[\s\S]*?pointer-events:\s*none;/);
  assert.doesNotMatch(style, /\.interest\s*>\s*summary|\.interest\[open\]/);
  assert.match(style, /\.about-grid\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*3fr\s+2fr;[\s\S]*?grid-template-areas:\s*'intro interests'\s*'phd contact'/);
  assert.match(style, /\.about-intro\s*\{[\s\S]*?grid-area:\s*intro/);
  assert.match(style, /\.about-interests\s*\{[\s\S]*?grid-area:\s*interests/);
  assert.match(style, /\.about-phd\s*\{[\s\S]*?grid-area:\s*phd/);
  assert.match(style, /\.about-contact\s*\{[\s\S]*?grid-area:\s*contact/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.about-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(style, /\.language-switcher button\s*\{[\s\S]*?font-family:\s*inherit;[\s\S]*?font-size:\s*1rem;[\s\S]*?font-weight:\s*500;/);
  assert.match(style, /\.sidebar-bottom\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?bottom:\s*0;[\s\S]*?left:\s*0;/);
  const introPosition = about.indexOf('I am a Research Associate');
  const workingPosition = about.indexOf('I am working on:');
  const phdPosition = about.indexOf('Starting Spring 2027');
  const contactPosition = about.indexOf('If you share similar interests');
  assert.ok(introPosition >= 0 && introPosition < workingPosition && workingPosition < phdPosition && phdPosition < contactPosition);
  assert.match(publications, /data-year="2026"/);
  assert.equal((publications.match(/class="publication"/g) ?? []).length, 9);
  assert.equal((publications.match(/data-selected="true"/g) ?? []).length, 3);
  assert.equal((publications.match(/data-selected="false"/g) ?? []).length, 3);
  assert.match(publications, /PREPRINT ARTICLES/);
  assert.match(publications, /CONFERENCE PAPERS/);
  assert.match(publications, /<div class="pub-tabs"[\s\S]*?<button class="pub-tab" data-filter="conference"[^>]*>Conference Papers<\/button>/);
  assert.equal((publications.match(/data-publication-list="articles"/g) ?? []).length, 1);
  assert.equal((publications.match(/data-publication-list="conference"/g) ?? []).length, 1);
  const sentenceCasePublicationTitles = [
    'Forecasting return time of extreme precipitation by large deviation theory',
    'BEXTools-ESGPath: A text-mining-based ESG report analyser for advancing supply chain sustainability',
    'Topological persistence pinpoints higher-order network vulnerabilities',
    'A virtual node based zero-shot learning framework for link prediction in complex networks',
    'Decentralized autonomous organizations in e-commerce supply chains: a bayesian method to barrier identification and interrelationship mapping',
    'Evaluating airline service quality through a comprehensive text-mining and multi-criteria decision-making analysis',
    'Exploring the drivers of green supply chain management in the chinese electronics industry: evidence from a gdematel–aism approach',
    'AISM: A novel method for node importance ranking in complex network',
    'Classifying drosophila olfactory projection neuron boutons by quantitative analysis of electron microscopic reconstruction'
  ];
  for (const title of sentenceCasePublicationTitles) {
    assert.ok(publications.includes(title), `publications should use sentence case: ${title}`);
    assert.ok(zhPublications.includes(title), `Chinese publications should use sentence case: ${title}`);
  }
  const publicationDisplay = publications.replace(/ data-citation="[^"]*"/g, '');
  assert.doesNotMatch(publicationDisplay, /Forecasting Return Time of Extreme Precipitation by Large Deviation Theory/);
  assert.doesNotMatch(publicationDisplay, /: A bayesian method/);
  assert.doesNotMatch(publicationDisplay, /: Evidence from a GDEMATEL–AISM approach/);
  assert.doesNotMatch(publicationDisplay, /Classifying Drosophila olfactory projection neuron boutons/);
  assert.match(publications, /<p><strong>Xie, H\.<\/strong>, Liu, H\., Fan, J\., &amp; Tang, Y\.\*<\/p>/);
  assert.match(publications, /Topological persistence pinpoints higher-order network vulnerabilities/);
  assert.match(publications, /A virtual node based zero-shot learning framework for link prediction in complex networks/);
  assert.match(publications, /10\.1016\/j\.ins\.2026\.123522/);
  assert.match(publications, /<h4 class="publication-list-title">CONFERENCE PAPERS<\/h4>[\s\S]*?<h4>BEXTools-ESGPath: A text-mining-based ESG report analyser for advancing supply chain sustainability<\/h4>[\s\S]*?<p><strong>H\. Xie<\/strong>, G\. Yim, Y\. P\. Tsang\*, C\. K\. M\. Lee, &amp; C\. H\. Wu<\/p>[\s\S]*?The 8th International Conference on Decision Science &amp; Management, 24-26 April 2026, Hong Kong/);
  assert.match(publications, /<h4>AISM: A novel method for node importance ranking in complex network<\/h4>[\s\S]*?<p><strong>H\. Xie\*<\/strong>, C\. Zhang<\/p>[\s\S]*?The 12th International Conference on Complex Networks and their Applications, 28-30 November 2023, Menton, France/);
  for (const conferenceFormat of [
    'The 8th International Conference on Decision Science &amp; Management, 24-26 April 2026, Hong Kong',
    'The 12th International Conference on Complex Networks and their Applications, 28-30 November 2023, Menton, France'
  ]) {
    assert.ok(publications.includes(conferenceFormat), `English conference format should be standardized: ${conferenceFormat}`);
    assert.ok(zhPublications.includes(conferenceFormat), `Chinese conference format should be standardized: ${conferenceFormat}`);
  }
  assert.doesNotMatch(publications, /ICDSM 2026, The International Conference on Decision Science &amp; Management, Hong Kong/);
  assert.doesNotMatch(zhPublications, /ICDSM 2026, The International Conference on Decision Science &amp; Management, Hong Kong/);
  assert.doesNotMatch(publications, /12th International Conference on Complex Networks and their Applications, 28–30 November 2023/);
  assert.doesNotMatch(zhPublications, /12th International Conference on Complex Networks and their Applications, 28–30 November 2023/);
  const articleList = publications.slice(publications.indexOf('data-publication-list="articles"'), publications.indexOf('data-publication-list="conference"'));
  const conferenceList = publications.slice(publications.indexOf('data-publication-list="conference"'));
  assert.doesNotMatch(articleList, /BEXTools-ESGPath|AISM: A novel method/);
  assert.equal((conferenceList.match(/class="publication"/g) ?? []).length, 2);
  assert.doesNotMatch(conferenceList, /<img\b/);
  assert.doesNotMatch(selectedPublications, /BEXTools-ESGPath|AISM: A novel method/);
  assert.equal((publications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length, 7);
  assert.doesNotMatch(style, /\.pub-image\s*\{[\s\S]*?filter:\s*grayscale/);
  assert.doesNotMatch(style, /\.pub-image:hover\s*\{[\s\S]*?filter:\s*grayscale/);
  assert.equal((selectedPublications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length, 3);
  assert.equal((publications.match(/class="cite-link"/g) ?? []).length, 9);
  assert.equal((selectedPublications.match(/class="cite-link"/g) ?? []).length, 3);
  assert.equal((publications.match(/>\[Cite \(APA\)\]<\/button>/g) ?? []).length, 9);
  assert.equal((selectedPublications.match(/>\[Cite \(APA\)\]<\/button>/g) ?? []).length, 3);
  assert.equal((publications.match(/width="960" height="540"/g) ?? []).length, 7);
  assert.equal((selectedPublications.match(/width="960" height="540"/g) ?? []).length, 3);
  const secondaryColor = style.match(/--swatch-4:\s*(#[0-9a-f]{6})/i)?.[1];
  assert.ok(secondaryColor, 'secondary color token should be a hex color');
  assert.ok(contrastRatio(secondaryColor, '#ffffff') >= 4.5, 'secondary text should meet WCAG AA contrast');
  assert.match(style, /\.year-label\s*\{[\s\S]*?opacity:\s*1/);
  assert.match(style, /--swatch-4:\s*#666666;/);
  assert.match(style, /\.journal-metrics\s*\{[\s\S]*?color:\s*var\(--swatch-4\)/);
  assert.match(style, /\.cite-link\s*\{[\s\S]*?cursor:\s*pointer;/);
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /copyCitation/);
  assert.match(script, /cite-link/);
  assert.match(script, /citeCopied/);
  assert.match(script, /button\.textContent = '\[Cite \(APA\)\]';/);
  assert.doesNotMatch(site, /metrics-note|JCR release|JCR 版本/);
  assert.doesNotMatch(publications, /not a JCR-indexed journal/);
  assert.doesNotMatch(zhPublications, /非 JCR 收录期刊/);
  assert.match(publications, /Chaos: An Interdisciplinary Journal of Nonlinear Science, 2026<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 3\.3\)<\/span>/);
  assert.match(publications, /Information Sciences, 748 \(2026\), 123522<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 6\.0\)<\/span>/);
  assert.match(publications, /Electronic Commerce Research and Applications, 2025<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 6\.8\)<\/span>/);
  assert.match(publications, /Journal of Air Transport Management, 2024<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q2; IF 4\.6\)<\/span>/);
  assert.match(publications, /Cleaner Logistics and Supply Chain, 2023<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 6\.6\)<\/span>/);
  assert.match(publications, /iScience, 2022<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 4\.5\)<\/span>/);
  assert.match(selectedPublications, /Chaos: An Interdisciplinary Journal of Nonlinear Science, 2026<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 3\.3\)<\/span>/);
  assert.match(selectedPublications, /Information Sciences, 748 \(2026\), 123522<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 6\.0\)<\/span>/);
  assert.match(selectedPublications, /Electronic Commerce Research and Applications, 2025<\/span><\/em>\s*<span class="journal-metrics">\(JCR Q1; IF 6\.8\)<\/span>/);
  assert.match(publications, /data-citation="Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\. \(2026\)\.[^"]+arXiv\. https:\/\/doi\.org\/10\.48550\/arXiv\.2604\.10890"/);
  assert.match(publications, /data-citation="Xie, H\., &amp; Ding, B\. \(2026\)\.[^"]+Chaos: An Interdisciplinary Journal of Nonlinear Science, 36\(1\), 013116\./);
  assert.doesNotMatch(site, /asset\/placeholder\.svg/);
  assert.doesNotMatch(misc, /<h4>Experience<\/h4>|<h4>Education<\/h4>/);
  assert.match(about, /2025\.4 - 2026\.6[\s\S]*?<strong>Research Assistant<\/strong>[\s\S]*?ISE, PolyU/);
  assert.match(about, /2026\.7 - present[\s\S]*?<strong>Research Associate<\/strong>[\s\S]*?ISE, PolyU/);
  assert.ok(about.indexOf('2026.7 - present') < about.indexOf('2025.4 - 2026.6'));
  assert.match(about, /2024\.9 - 2025\.11[\s\S]*?<strong>[\s\S]*?Master of Science in Industrial Engineering and Logistics Management[\s\S]*?<\/strong>[\s\S]*?DASE, HKU/);
  assert.match(about, /2020\.9 - 2024\.6[\s\S]*?<strong>[\s\S]*?Bachelor of Science in[\s\S]*?Systems Science[\s\S]*?<\/strong>[\s\S]*?BNU/);
  assert.match(about, /2020\.9 - 2024\.6[\s\S]*?<strong>[\s\S]*?Bachelor of Economics in[\s\S]*?Finance[\s\S]*?<\/strong>[\s\S]*?BNU/);
  assert.equal((about.match(/<strong>Bachelor of /g) ?? []).length, 2);
  assert.doesNotMatch(misc, /Bachelor of Science in Systems Science and Bachelor of Economics in Finance/);
  assert.doesNotMatch(misc, /The Hong Kong Polytechnic University|Department of Industrial and Systems Engineering|The University of Hong Kong|Department of Data and Systems Engineering|Beijing Normal University/);
  assert.doesNotMatch(misc, /2025 — Present/);
  assert.match(misc, /<h4>ACADEMIC SERVICES \/<br>PEER REVIEW EXPERIENCE<\/h4>/);
  assert.match(misc, /Member of Technical Committee, ICPR-APR 2025/);
  assert.match(misc, /Volunteer, ICLR 2022/);
  assert.match(misc, /Reviewer, Information Processing &amp; Management/);
  assert.match(misc, /Reviewer, Humanities &amp; Social Sciences Communications/);
  assert.match(misc, /Reviewer, Chaos: An Interdisciplinary Journal of Nonlinear Science/);
  assert.match(misc, /Reviewer, Journal of Air Transport Management/);
  assert.match(misc, /Reviewer, Quality &amp; Quantity/);
  assert.match(misc, /Reviewer, Clean Technologies and Environmental Policy/);
  assert.match(misc, /Reviewer, Cognitive Computation/);
  assert.match(misc, /Reviewer, Journal of Ambient Intelligence and Humanized Computing/);
  assert.match(misc, /Reviewer, Scientific Reports/);
  assert.match(misc, /Reviewer, Operations Research Forum/);
  assert.match(misc, /Reviewer, Discover Analytics/);
  assert.match(misc, /Reviewer, Discover Applied Sciences/);
  const reviewerJournals = [
    'Reviewer, Chaos: An Interdisciplinary Journal of Nonlinear Science',
    'Reviewer, Clean Technologies and Environmental Policy',
    'Reviewer, Cognitive Computation',
    'Reviewer, Discover Analytics',
    'Reviewer, Discover Applied Sciences',
    'Reviewer, Humanities &amp; Social Sciences Communications',
    'Reviewer, Information Processing &amp; Management',
    'Reviewer, Journal of Air Transport Management',
    'Reviewer, Journal of Ambient Intelligence and Humanized Computing',
    'Reviewer, Operations Research Forum',
    'Reviewer, Quality &amp; Quantity',
    'Reviewer, Scientific Reports'
  ].map(entry => misc.indexOf(entry));
  assert.ok(reviewerJournals.every(position => position >= 0));
  assert.ok(reviewerJournals.every((position, index) => index === 0 || position > reviewerJournals[index - 1]));
  assert.match(misc, /Reviewer, Chaos: An Interdisciplinary Journal of Nonlinear Science <span class="journal-metrics">\(JCR Q1; IF 3\.3\)<\/span>/);
  assert.match(misc, /Reviewer, Clean Technologies and Environmental Policy <span class="journal-metrics">\(JCR Q2; IF 5\.1\)<\/span>/);
  assert.match(misc, /Reviewer, Cognitive Computation <span class="journal-metrics">\(JCR Q1; IF 7\.4\)<\/span>/);
  assert.match(misc, /Reviewer, Discover Applied Sciences <span class="journal-metrics">\(JCR Q1; IF 3\.8\)<\/span>/);
  assert.match(misc, /Reviewer, Humanities &amp; Social Sciences Communications <span class="journal-metrics">\(JCR Q1; IF 4\.8\)<\/span>/);
  assert.match(misc, /Reviewer, Information Processing &amp; Management <span class="journal-metrics">\(JCR Q1; IF 8\.1\)<\/span>/);
  assert.match(misc, /Reviewer, Journal of Air Transport Management <span class="journal-metrics">\(JCR Q2; IF 4\.6\)<\/span>/);
  assert.match(misc, /Reviewer, Quality &amp; Quantity <span class="journal-metrics">\(JCR Q1; IF 4\.3\)<\/span>/);
  assert.match(misc, /Reviewer, Scientific Reports <span class="journal-metrics">\(JCR Q1; IF 4\.9\)<\/span>/);
  assert.doesNotMatch(misc, /Reviewer, Discover Analytics <span class="journal-metrics">/);
  assert.doesNotMatch(misc, /Reviewer, Journal of Ambient Intelligence and Humanized Computing <span class="journal-metrics">/);
  assert.doesNotMatch(misc, /Reviewer, Operations Research Forum <span class="journal-metrics">/);
  assert.match(misc, /<strong>Best Industry &amp; Impact Paper Award<\/strong>, 2026 ICDSM, 2026/);
  assert.match(misc, /<strong>99 Yuan Chuan Scholarship<\/strong>, BNU, 2023/);
  assert.doesNotMatch(misc, /Top \d+%/);
  assert.doesNotMatch(misc, /<h4>Skills<\/h4>|<dt>Languages<\/dt>/);
  assert.match(misc, /Tony Reynolds Academic Excellence Prize/);
  assert.match(home, /The Hong Kong Polytechnic University/);
  assert.match(home, /<strong>Research Associate<\/strong>/);
  assert.match(home, /Department of Industrial and Systems Engineering \(ISE\)/);
  assert.match(about, /I am a Research Associate/);
  assert.match(homepage, /a Research Associate at The Hong Kong Polytechnic University/);
  assert.equal((englishSite.match(/Research Assistant/g) ?? []).length, 1);
  assert.doesNotMatch(home, /Research focus: optimization, networks, and data-driven decisions\./);
  assert.doesNotMatch(home, /My research connects Operations Research with Complex Systems\. I use data, mathematical models, and optimization to support better decisions in logistics, supply chains, transportation, and networked systems\./);
  assert.match(about, /<h3 class="about-title">About Me<\/h3>/);
  assert.match(style, /\.page-home \.about-title\s*\{\s*display:\s*none;\s*\}/);
  assert.match(style, /\.interests-list\s*\{\s*margin:\s*0\.8rem 0;\s*\}/);
  assert.match(style, /\.interest\s*\{[\s\S]*?line-height:\s*1\.2;[\s\S]*?margin-bottom:\s*0;[\s\S]*?padding:\s*0;/);
  assert.match(style, /\.sidebar\s*\{[\s\S]*?pointer-events:\s*none;/);
  assert.match(style, /\.sidebar a,\s*\.sidebar #easter-egg\s*\{[\s\S]*?pointer-events:\s*auto;/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?pointer-events:\s*auto;/);
  assert.match(publications, /<p>\* indicates the corresponding author\.<\/p>/);
  assert.match(selectedPublications, /<p>\* indicates the corresponding author\.<\/p>/);
  assert.doesNotMatch(publications, /通讯作者/);
  assert.doesNotMatch(selectedPublications, /通讯作者/);
  assert.match(selectedPublications, /class="selected-publications"/);
  assert.match(selectedPublications, /<h3>Selected Publications<\/h3>/);
  assert.equal((selectedPublications.match(/class="publication"/g) ?? []).length, 3);
  assert.match(selectedPublications, /Topological persistence pinpoints higher-order network vulnerabilities/);
  assert.match(selectedPublications, /A virtual node based zero-shot learning framework for link prediction in complex networks/);
  assert.match(selectedPublications, /Decentralized autonomous organizations in e-commerce supply chains: a bayesian method to barrier identification and interrelationship mapping/);
  assert.match(style, /\.selected-publications\s*\{[\s\S]*?margin-top:\s*2rem;/);
  assert.doesNotMatch(site, /Your Name|your@email\.com|Your Paper Title|Research Lab|University of XX|Advisor Name/);
  assert.doesNotMatch(site, /—/);

  assert.match(zhHome, /谢昊天 Haotian Xie/);
  assert.match(zhHome, /Research Associate（研究助理）/);
  assert.match(zhHome, /香港理工大学/);
  assert.match(zhAbout, /<h3 class="about-title">关于我<\/h3>/);
  assert.match(zhAbout, /运筹学与复杂系统/);
  assert.match(zhAbout, /工业及系统工程学系（ISE）/);
  assert.match(zhAbout, /工业工程与物流管理/);
  assert.doesNotMatch(zhAbout, /数据与系统工程学系（DASE）/);
  assert.match(zhAbout, /系统科学/);
  assert.match(zhAbout, /金融学/);
  assert.match(zhAbout, /导师：<a href="https:\/\/research\.polyu\.edu\.hk\/en\/persons\/yung-po-tsang\/"[^>]*>曾榕波博士<\/a>/);
  assert.match(zhAbout, /导师：<a href="https:\/\/www\.dase\.hku\.hk\/people\/j-y-li"[^>]*>李加阳教授<\/a>/);
  assert.match(zhAbout, /金融学.*经济学学士学位/);
  assert.match(zhAbout, /<a href="https:\/\/bibs\.bnu\.edu\.cn\/en\/index\.htm"[^>]*>金融学经济学学士学位<\/a>/);
  assert.match(zhAbout, /<a href="https:\/\/www\.dase\.hku\.hk\/teaching-and-learning\/prospective-students\/master-of-science-in-engineering-and-logistics-management"[^>]*>工业工程与物流管理工学硕士学位<\/a>/);
  assert.match(zhAbout, /我目前在<a href="https:\/\/www\.polyu\.edu\.hk\/"[^>]*>香港理工大学（PolyU）<\/a>的<a href="https:\/\/www\.polyu\.edu\.hk\/ise\/"[^>]*>工业及系统工程学系（ISE）<\/a>担任研究助理/);
  assert.doesNotMatch(zhAbout, /担任 Research Associate/);
  assert.match(zhAbout, /导师：<a href="https:\/\/sss\.bnu\.edu\.cn\/en\/Faculty\/Professor\/1fb42055bc1e42ca8e13c27e378e2d82\.htm"[^>]*>狄增如教授<\/a>/);
  assert.match(zhAbout, /导师：<a href="https:\/\/bibs\.bnu\.edu\.cn\/teachers\/qzjs\/zg\/1030da90293e4df386079cdb673f6619\.htm"[^>]*>陈蕾教授<\/a>/);
  assert.doesNotMatch(zhAbout, /M\.Sc\.\(Eng\)|金融学方向/);
  assert.match(zhAbout, /2027年春季/);
  assert.match(zhAbout, /我的研究将<strong>运筹学与复杂系统<\/strong>相结合，利用数据、数学模型和优化方法/);
  assert.match(zhAbout, /如果你对相近的研究方向感兴趣，或希望进一步交流/);
  assert.match(zhAbout, /class="about-panel about-intro"/);
  assert.match(zhAbout, /class="about-panel about-interests"/);
  assert.match(zhAbout, /class="about-panel about-phd"/);
  assert.match(zhAbout, /class="about-panel about-contact"/);
  assert.equal((zhAbout.match(/class="about-panel about-/g) ?? []).length, (about.match(/class="about-panel about-/g) ?? []).length);
  assert.doesNotMatch(zhAbout, /About Me|I am working on|If you share similar interests/);
  assert.match(zhPublications, /<h3>学术出版物列表<\/h3>/);
  assert.match(zhPublications, /\* 表示通讯作者。/);
  assert.match(zhPublications, />精选论文<\/button>/);
  assert.match(zhPublications, />全部论文<\/button>/);
  assert.match(zhPublications, /<button class="pub-tab" data-filter="conference"[^>]*>会议论文<\/button>/);
  assert.equal((zhPublications.match(/data-publication-list="articles"/g) ?? []).length, 1);
  assert.equal((zhPublications.match(/data-publication-list="conference"/g) ?? []).length, 1);
  assert.match(zhPublications, /预印本/);
  assert.match(zhPublications, /会议论文/);
  assert.match(zhPublications, /BEXTools-ESGPath: A text-mining-based ESG report analyser for advancing supply chain sustainability/);
  assert.match(zhPublications, /AISM: A novel method for node importance ranking in complex network/);
  assert.match(zhPublications, /Chaos: An Interdisciplinary Journal of Nonlinear Science, 2026<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 3\.3）<\/span>/);
  assert.match(zhPublications, /Information Sciences, 748 \(2026\), 123522<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 6\.0）<\/span>/);
  assert.match(zhPublications, /Electronic Commerce Research and Applications, 2025<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 6\.8）<\/span>/);
  assert.match(zhPublications, /Journal of Air Transport Management, 2024<\/span><\/em>\s*<span class="journal-metrics">（JCR Q2；IF 4\.6）<\/span>/);
  assert.match(zhPublications, /Cleaner Logistics and Supply Chain, 2023<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 6\.6）<\/span>/);
  assert.match(zhPublications, /iScience, 2022<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 4\.5）<\/span>/);
  assert.match(zhPublications, /<p><strong>Xie, H\.<\/strong>, Liu, H\., Fan, J\., &amp; Tang, Y\.\*<\/p>/);
  assert.doesNotMatch(publications, /Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\.\* \(2026\)/);
  assert.doesNotMatch(zhPublications, /Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\.\* \(2026\)/);
  assert.equal((zhPublications.match(/class="publication"/g) ?? []).length, (publications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhPublications.match(/class="cite-link"/g) ?? []).length, 9);
  assert.equal((zhPublications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length, (publications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length);
  assert.equal((zhSelectedPublications.match(/class="publication"/g) ?? []).length, (selectedPublications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhPublications.match(/class="cite-link"/g) ?? []).length, (zhPublications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhSelectedPublications.match(/class="cite-link"/g) ?? []).length, (selectedPublications.match(/class="cite-link"/g) ?? []).length);
  assert.equal((zhPublications.match(/>\[Cite \(APA\)\]<\/button>/g) ?? []).length, (zhPublications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhSelectedPublications.match(/>\[Cite \(APA\)\]<\/button>/g) ?? []).length, (zhSelectedPublications.match(/class="publication"/g) ?? []).length);
  assert.match(zhMisc, /<h3>其他<\/h3>/);
  assert.match(zhMisc, /荣誉与奖项/);
  assert.match(zhMisc, /同行评审经历/);
  assert.doesNotMatch(zhMisc, /工作经历|教育背景/);
  assert.match(zhAbout, /2026\.7 - 至今[\s\S]*?Research Associate（研究助理）[\s\S]*?ISE，PolyU/);
  assert.match(zhAbout, /2024\.9 - 2025\.11[\s\S]*?工业工程与物流管理工学硕士[\s\S]*?DASE，HKU/);
  assert.match(zhAbout, /2020\.9 - 2024\.6[\s\S]*?金融学经济学学士[\s\S]*?BNU/);
  assert.doesNotMatch(zhMisc, /香港理工大学|香港大学|北京师范大学|工业及系统工程学系|数据与系统工程学系/);
  assert.match(zhMisc, /<strong>最佳产业与影响力论文奖<\/strong>，2026 ICDSM，2026/);
  assert.match(zhMisc, /<strong>Tony Reynolds 学术卓越奖<\/strong>，HKU，2025/);
  assert.equal((zhMisc.match(/优秀毕业论文/g) ?? []).length, 2);
  assert.match(zhMisc, /<strong>久久源川奖学金<\/strong>，BNU，2023/);
  assert.match(zhMisc, /<strong>一等学术奖学金<\/strong>，BNU，2023/);
  assert.doesNotMatch(zhMisc, /担任/);
  assert.match(zhMisc, /Humanities &amp; Social Sciences Communications 审稿人 <span class="journal-metrics">（JCR Q1；IF 4\.8）<\/span>/);
  assert.match(zhMisc, /Quality &amp; Quantity 审稿人 <span class="journal-metrics">（JCR Q1；IF 4\.3）<\/span>/);
  assert.doesNotMatch(chineseSite, /PREPRINT ARTICLES|About Me|Full List|Misc\./);
});

test('moves experience and education into about with updated academic copy', () => {
  assert.match(about, /class="about-background"/);
  assert.match(about, /<h4>Experience<\/h4>[\s\S]*?2026\.7 - present[\s\S]*?Research Associate[\s\S]*?Paul Tsang/);
  assert.match(about, /<h4>Education<\/h4>[\s\S]*?Master of Science in Industrial Engineering and Logistics Management[\s\S]*?Jiayang Li[\s\S]*?Bachelor of Science in[\s\S]*?Systems Science[\s\S]*?Zengru Di[\s\S]*?Bachelor of Economics in[\s\S]*?Finance[\s\S]*?Lei Chen/);
  assert.doesNotMatch(about, /completed an M\.Sc\./);
  assert.match(about, /obtained an M\.Sc\.\(Eng\)/);
  assert.match(about, /1030da90293e4df386079cdb673f6619\.htm/);
  assert.match(zhAbout, /class="about-background"/);
  assert.match(zhAbout, /获得了工学硕士学位/);
  assert.doesNotMatch(zhAbout, /完成了/);
  assert.match(zhAbout, /师从[\s\S]*狄增如教授[\s\S]*陈蕾教授/);
  assert.match(zhAbout, /1030da90293e4df386079cdb673f6619\.htm/);
  assert.doesNotMatch(misc, /<h4>Experience<\/h4>|<h4>Education<\/h4>/);
  assert.doesNotMatch(zhMisc, /<h4>工作经历<\/h4>|<h4>教育背景<\/h4>/);
  assert.match(style, /\.about-background\s*\{/);
  assert.match(homepage, /href="style\.css\?v=39"/);
  assert.match(homepage, /<script src="script\.js\?v=39"><\/script>/);
  assert.match(script, /const pageVersion = '39';/);
});

test('preprint exposes DOI and Google Scholar links in both languages', () => {
  const preprintTitle = 'Forecasting return time of extreme precipitation by large deviation theory';
  const doiLink = 'href="https://doi.org/10.48550/arXiv.2604.10890"';
  const scholarLink = 'href="https://scholar.google.com/scholar?q=Forecasting+return+time+of+extreme+precipitation+by+large+deviation+theory"';

  for (const [language, page] of [['English', publications], ['Chinese', zhPublications]]) {
    const preprint = page.slice(page.indexOf(preprintTitle));
    assert.ok(preprint.includes(preprintTitle), `${language} page should include the preprint`);
    assert.match(preprint, new RegExp(doiLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(preprint, new RegExp(scholarLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(preprint, /\[DOI\]/);
    assert.match(preprint, /\[Google Scholar\]/);
  }
});
