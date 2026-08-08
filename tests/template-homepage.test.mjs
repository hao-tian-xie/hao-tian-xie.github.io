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

test('homepage uses the SimpleAcademicHomepage shell with Haotian Xie content', () => {
  assert.match(homepage, /class="sidebar"/);
  assert.match(homepage, /class="container"/);
  assert.match(homepage, /class="mobile-header"/);
  assert.match(homepage, /class="mobile-footer"/);
  assert.match(homepage, /id="content"/);
  assert.match(homepage, /href="style\.css\?v=29"/);
  assert.match(homepage, /<script src="script\.js\?v=29"><\/script>/);
  assert.match(homepage, /class="mobile-header-name" href="#" data-page="about"/);
  assert.match(homepage, /<h1><a href="#" data-page="about">/);
  assert.match(homepage, /data-page="about"/);
  assert.match(homepage, /data-page="publications"/);
  assert.match(homepage, /data-page="misc"/);
  assert.match(homepage, /class="language-switcher"/);
  assert.match(homepage, /class="language-switcher"[\s\S]*id="language-toggle"[\s\S]*>中文\/English<\/button>[\s\S]*<footer class="site-footer site-footer--sidebar">/);
  assert.match(homepage, /data-i18n="nav-about"/);
  assert.match(homepage, /data-i18n="nav-publications"/);
  assert.match(homepage, /data-i18n="nav-misc"/);
  assert.match(homepage, /<div class="sidebar-info">[\s\S]*?<a href="mailto:haotiantimxie@gmail\.com">Email<\/a>[\s\S]*?<a href="https:\/\/scholar\.google\.com\/citations\?user=X42fddQAAAAJ" target="_blank" rel="noopener noreferrer">Google Scholar<\/a>\s*<a href="https:\/\/www\.linkedin\.com\/in\/haotianxiehtxie\/" target="_blank" rel="noopener noreferrer">LinkedIn<\/a>/);
  assert.doesNotMatch(homepage, /Hong Kong, China/);
  assert.match(script, /`\$\{pageRoot\}\/\$\{page\}\.html\?v=\$\{pageVersion\}`/);
  assert.match(script, /const pageVersion = '29';/);
  assert.match(script, /let currentLanguage/);
  assert.match(script, /localStorage/);
  assert.match(script, /pages\/zh/);
  assert.match(script, /language-toggle/);
  assert.match(script, /language: '中文\/English'/);
  assert.match(script, /setLanguage/);
  assert.match(script, /document\.documentElement\.lang/);
  assert.match(script, /sidebar\.classList\.remove\('menu-open'\)/);
  assert.match(script, /menuToggle\.focus\(\)/);
  assert.match(script, /const pageSources = page === 'home'/);
  assert.match(script, /`\$\{pageRoot\}\/home\.html\?v=\$\{pageVersion\}`, `\$\{pageRoot\}\/about\.html\?v=\$\{pageVersion\}`, `\$\{pageRoot\}\/selected-publications\.html\?v=\$\{pageVersion\}`/);
  assert.match(script, /if \(page === 'publications' \|\| page === 'home'\)/);
  assert.match(script, /const newHash = page === 'about' \? '' : page;/);
  assert.match(script, /const page = location\.hash\.slice\(1\) \|\| 'about';/);
  assert.match(script, /const initialPage = location\.hash\.slice\(1\) \|\| 'about';/);
  assert.match(script, /groupPublicationsByYear/);
  assert.match(script, /initPubTabs/);
  assert.match(style, /\.sidebar\s*\{[\s\S]*?width:\s*45%;[\s\S]*?max-width:\s*500px;[\s\S]*?position:\s*fixed[\s\S]*?left:\s*0/);
  assert.match(style, /main\s*\{[\s\S]*?margin-left:\s*20%[\s\S]*?max-width:\s*80%/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?main\s*\{[\s\S]*?margin-left:\s*0[\s\S]*?max-width:\s*100%/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.mobile-header\s*\{[\s\S]*?padding-top:\s*max\(0\.1rem,\s*env\(safe-area-inset-top\)\)/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.sidebar\s*\{[\s\S]*?min-height:\s*100dvh/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.sidebar-info a\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.nav-index a\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.pub-tab\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?\.mobile-footer-btn\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(homepage, /Haotian Xie/);
  assert.match(homepage, /haotiantimxie@gmail\.com/);
  assert.match(about, /Operations Research/);
  assert.match(about, /<strong>Operations Research with Complex Systems<\/strong>/);
  assert.match(about, /Department of Industrial and Systems Engineering \(ISE\)/);
  assert.match(about, /Department of Data and Systems Engineering \(DASE\)/);
  assert.match(about, /B\.Sc\. in <a href="https:\/\/sss\.bnu\.edu\.cn\/en\/"[^>]*>Systems Science<\/a> and a B\.Ec\. in Finance/);
  assert.match(about, /<a href="https:\/\/www\.polyu\.edu\.hk\/ise\/"[^>]*>Department of Industrial and Systems Engineering \(ISE\)<\/a>/);
  assert.match(about, /<a href="https:\/\/www\.polyu\.edu\.hk\/"[^>]*>The Hong Kong Polytechnic University \(PolyU\)<\/a>/);
  assert.match(about, /Dr\. <a href="https:\/\/research\.polyu\.edu\.hk\/en\/persons\/yung-po-tsang\/"[^>]*>Paul Tsang<\/a>/);
  assert.match(about, /M\.Sc\.\(Eng\) in the/);
  assert.match(about, /<a href="https:\/\/www\.dase\.hku\.hk\/"[^>]*>Department of Data and Systems Engineering \(DASE\)<\/a>/);
  assert.match(about, /<a href="https:\/\/www\.hku\.hk\/"[^>]*>The University of Hong Kong \(HKU\)<\/a>/);
  assert.match(about, /Prof\. <a href="https:\/\/www\.dase\.hku\.hk\/people\/j-y-li"[^>]*>Jiayang Li<\/a>/);
  assert.match(about, /B\.Sc\. in <a href="https:\/\/sss\.bnu\.edu\.cn\/en\/"[^>]*>Systems Science<\/a>/);
  assert.match(about, /B\.Ec\. in Finance/);
  assert.match(about, /<a href="https:\/\/sss\.bnu\.edu\.cn\/en\/"[^>]*>Systems Science<\/a>/);
  assert.match(about, /<a href="https:\/\/www\.bnu\.edu\.cn\/"[^>]*>Beijing Normal University \(BNU\)<\/a>/);
  assert.match(about, /Prof\. <a href="https:\/\/sss\.bnu\.edu\.cn\/en\/Faculty\/Professor\/1fb42055bc1e42ca8e13c27e378e2d82\.htm"[^>]*>Zengru Di<\/a>/);
  assert.match(about, /Data-driven decision making/);
  assert.match(about, /Logistics and supply chain management/);
  assert.match(about, /Complex networks theory/);
  assert.match(about, /Starting Spring 2027, I will join the .*ISE.* at .*PolyU.* as a Ph\.D\. student\./);
  assert.match(about, /class="about-grid"/);
  assert.match(about, /class="about-panel about-intro"/);
  assert.match(about, /class="about-panel about-interests"/);
  assert.match(about, /class="about-panel about-phd"/);
  assert.match(about, /class="about-panel about-contact"/);
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
  assert.equal((publications.match(/class="publication"/g) ?? []).length, 7);
  assert.equal((publications.match(/data-selected="true"/g) ?? []).length, 3);
  assert.match(publications, /PREPRINT ARTICLES/);
  const sentenceCasePublicationTitles = [
    'Forecasting return time of extreme precipitation by large deviation theory',
    'Topological persistence pinpoints higher-order network vulnerabilities',
    'A virtual node based zero-shot learning framework for link prediction in complex networks',
    'Decentralized autonomous organizations in e-commerce supply chains: a bayesian method to barrier identification and interrelationship mapping',
    'Evaluating airline service quality through a comprehensive text-mining and multi-criteria decision-making analysis',
    'Exploring the drivers of green supply chain management in the chinese electronics industry: evidence from a gdematel–aism approach',
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
  assert.match(publications, /Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\.\*/);
  assert.match(publications, /Topological persistence pinpoints higher-order network vulnerabilities/);
  assert.match(publications, /A virtual node based zero-shot learning framework for link prediction in complex networks/);
  assert.match(publications, /10\.1016\/j\.ins\.2026\.123522/);
  assert.equal((publications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length, 7);
  assert.doesNotMatch(style, /\.pub-image\s*\{[\s\S]*?filter:\s*grayscale/);
  assert.doesNotMatch(style, /\.pub-image:hover\s*\{[\s\S]*?filter:\s*grayscale/);
  assert.equal((selectedPublications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length, 3);
  assert.equal((publications.match(/class="cite-link"/g) ?? []).length, 7);
  assert.equal((selectedPublications.match(/class="cite-link"/g) ?? []).length, 3);
  assert.equal((publications.match(/width="960" height="540"/g) ?? []).length, 7);
  assert.equal((selectedPublications.match(/width="960" height="540"/g) ?? []).length, 3);
  assert.match(style, /\.journal-metrics\s*\{[\s\S]*?color:\s*var\(--swatch-4\)/);
  assert.match(style, /\.cite-link\s*\{[\s\S]*?cursor:\s*pointer;/);
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /copyCitation/);
  assert.match(script, /cite-link/);
  assert.match(script, /citeCopied/);
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
  assert.match(misc, /2025\.4 - 2026\.6[\s\S]*?<strong>Research Assistant<\/strong>[\s\S]*?ISE, PolyU/);
  assert.match(misc, /2026\.7 - present[\s\S]*?<strong>Research Associate<\/strong>[\s\S]*?ISE, PolyU/);
  assert.match(misc, /2024\.9 - 2025\.11[\s\S]*?<strong>Master of Science in Industrial Engineering and Logistics Management<\/strong>[\s\S]*?DASE, HKU/);
  assert.match(misc, /2020\.9 - 2024\.6[\s\S]*?<strong>Bachelor of Science in Systems Science<\/strong>[\s\S]*?BNU/);
  assert.match(misc, /2020\.9 - 2024\.6[\s\S]*?<strong>Bachelor of Economics in Finance<\/strong>[\s\S]*?BNU/);
  assert.equal((misc.match(/<strong>Bachelor of /g) ?? []).length, 2);
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
  assert.match(misc, /Reviewer, Information Processing &amp; Management <span class="journal-metrics">\(JCR Q1; IF 8\.1\)<\/span>/);
  assert.match(misc, /Reviewer, Journal of Air Transport Management <span class="journal-metrics">\(JCR Q2; IF 4\.6\)<\/span>/);
  assert.match(misc, /Reviewer, Scientific Reports <span class="journal-metrics">\(JCR Q1; IF 4\.9\)<\/span>/);
  assert.doesNotMatch(misc, /Reviewer, Discover Analytics <span class="journal-metrics">/);
  assert.doesNotMatch(misc, /Reviewer, Humanities &amp; Social Sciences Communications <span class="journal-metrics">/);
  assert.doesNotMatch(misc, /Reviewer, Journal of Ambient Intelligence and Humanized Computing <span class="journal-metrics">/);
  assert.doesNotMatch(misc, /Reviewer, Operations Research Forum <span class="journal-metrics">/);
  assert.doesNotMatch(misc, /Reviewer, Quality &amp; Quantity <span class="journal-metrics">/);
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
  assert.match(zhAbout, /数据与系统工程学系（DASE）/);
  assert.match(zhAbout, /系统科学/);
  assert.match(zhAbout, /金融学/);
  assert.match(zhAbout, /2027年春季/);
  assert.match(zhAbout, /我的研究将<strong>运筹学与复杂系统<\/strong>相结合，利用数据、数学模型和优化方法/);
  assert.match(zhAbout, /如果你对相近的研究方向感兴趣，或希望进一步交流/);
  assert.match(zhAbout, /class="about-panel about-intro"/);
  assert.match(zhAbout, /class="about-panel about-interests"/);
  assert.match(zhAbout, /class="about-panel about-phd"/);
  assert.match(zhAbout, /class="about-panel about-contact"/);
  assert.equal((zhAbout.match(/class="about-panel about-/g) ?? []).length, (about.match(/class="about-panel about-/g) ?? []).length);
  assert.doesNotMatch(zhAbout, /About Me|I am working on|If you share similar interests/);
  assert.match(zhPublications, /<h3>论文发表<\/h3>/);
  assert.match(zhPublications, /\* 表示通讯作者。/);
  assert.match(zhPublications, />精选论文<\/button>/);
  assert.match(zhPublications, />全部论文<\/button>/);
  assert.match(zhPublications, /预印本/);
  assert.match(zhPublications, /Chaos: An Interdisciplinary Journal of Nonlinear Science, 2026<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 3\.3）<\/span>/);
  assert.match(zhPublications, /Information Sciences, 748 \(2026\), 123522<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 6\.0）<\/span>/);
  assert.match(zhPublications, /Electronic Commerce Research and Applications, 2025<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 6\.8）<\/span>/);
  assert.match(zhPublications, /Journal of Air Transport Management, 2024<\/span><\/em>\s*<span class="journal-metrics">（JCR Q2；IF 4\.6）<\/span>/);
  assert.match(zhPublications, /Cleaner Logistics and Supply Chain, 2023<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 6\.6）<\/span>/);
  assert.match(zhPublications, /iScience, 2022<\/span><\/em>\s*<span class="journal-metrics">（JCR Q1；IF 4\.5）<\/span>/);
  assert.match(zhPublications, /Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\.\*/);
  assert.doesNotMatch(publications, /Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\.\* \(2026\)/);
  assert.doesNotMatch(zhPublications, /Xie, H\., Liu, H\., Fan, J\., &amp; Tang, Y\.\* \(2026\)/);
  assert.equal((zhPublications.match(/class="publication"/g) ?? []).length, (publications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhPublications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length, (publications.match(/src="asset\/publications\/[^\"]+\.png\?v=28"/g) ?? []).length);
  assert.equal((zhSelectedPublications.match(/class="publication"/g) ?? []).length, (selectedPublications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhPublications.match(/class="cite-link"/g) ?? []).length, (zhPublications.match(/class="publication"/g) ?? []).length);
  assert.equal((zhSelectedPublications.match(/class="cite-link"/g) ?? []).length, (selectedPublications.match(/class="cite-link"/g) ?? []).length);
  assert.match(zhMisc, /<h3>其他<\/h3>/);
  assert.match(zhMisc, /教育背景/);
  assert.match(zhMisc, /荣誉与奖项/);
  assert.match(zhMisc, /同行评审经历/);
  assert.match(zhMisc, /2026\.7 - 至今/);
  assert.match(zhMisc, /ISE，PolyU/);
  assert.match(zhMisc, /DASE，HKU/);
  assert.match(zhMisc, /BNU/);
  assert.doesNotMatch(zhMisc, /香港理工大学|香港大学|北京师范大学|工业及系统工程学系|数据与系统工程学系/);
  assert.match(zhMisc, /Best Industry &amp; Impact Paper Award/);
  assert.match(zhMisc, /<strong>99 Yuan Chuan Scholarship<\/strong>，BNU，2023/);
  assert.doesNotMatch(chineseSite, /PREPRINT ARTICLES|About Me|Full List|Misc\./);
});
