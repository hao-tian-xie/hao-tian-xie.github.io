import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [homepage, script, style, about, publications, misc, home, selectedPublications] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../script.js', import.meta.url), 'utf8'),
  readFile(new URL('../style.css', import.meta.url), 'utf8'),
  readFile(new URL('../pages/about.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/publications.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/misc.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/home.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/selected-publications.html', import.meta.url), 'utf8').catch(() => ''),
]);

const site = [homepage, script, style, about, publications, misc, home, selectedPublications].join('\n');

test('homepage uses the SimpleAcademicHomepage shell with Haotian Xie content', () => {
  assert.match(homepage, /class="sidebar"/);
  assert.match(homepage, /class="container"/);
  assert.match(homepage, /class="mobile-header"/);
  assert.match(homepage, /class="mobile-footer"/);
  assert.match(homepage, /id="content"/);
  assert.match(homepage, /href="style\.css\?v=4"/);
  assert.match(homepage, /<script src="script\.js\?v=4"><\/script>/);
  assert.match(homepage, /class="mobile-header-name" href="#" data-page="home"/);
  assert.match(homepage, /<h1><a href="#" data-page="home">/);
  assert.match(homepage, /data-page="about"/);
  assert.match(homepage, /data-page="publications"/);
  assert.match(homepage, /data-page="misc"/);
  assert.match(script, /pages\/\$\{page\}\.html/);
  assert.match(script, /const pageVersion = '4';/);
  assert.match(script, /const pageSources = page === 'home'/);
  assert.match(script, /`pages\/home\.html\?v=\$\{pageVersion\}`, `pages\/about\.html\?v=\$\{pageVersion\}`, `pages\/selected-publications\.html\?v=\$\{pageVersion\}`/);
  assert.match(script, /if \(page === 'publications' \|\| page === 'home'\)/);
  assert.match(script, /const newHash = page === 'home' \? '' : page;/);
  assert.match(script, /const page = location\.hash \? location\.hash\.slice\(1\) : 'home';/);
  assert.match(script, /const initialPage = location\.hash \? location\.hash\.slice\(1\) : 'home';/);
  assert.match(script, /groupPublicationsByYear/);
  assert.match(script, /initPubTabs/);
  assert.match(style, /\.sidebar\s*\{[\s\S]*?width:\s*45%;[\s\S]*?max-width:\s*500px;[\s\S]*?position:\s*fixed[\s\S]*?left:\s*0/);
  assert.match(style, /main\s*\{[\s\S]*?margin-left:\s*20%[\s\S]*?max-width:\s*80%/);
  assert.match(style, /@media\s*\(max-width:\s*768px\)[\s\S]*?main\s*\{[\s\S]*?margin-left:\s*0[\s\S]*?max-width:\s*100%/);
  assert.match(homepage, /Haotian Xie/);
  assert.match(homepage, /haotiantimxie@gmail\.com/);
  assert.match(about, /Operations Research/);
  assert.match(about, /Data-driven decision making/);
  assert.match(about, /Logistics and supply chain management/);
  assert.match(about, /Complex networks theory/);
  assert.match(about, /I will join PolyU ISE as a Ph\.D\. student in Spring 2027\./);
  assert.match(about, /class="about-grid"/);
  assert.match(about, /class="about-panel about-intro"/);
  assert.match(about, /class="about-panel about-interests"/);
  assert.match(about, /class="about-panel about-phd"/);
  assert.match(about, /class="about-panel about-contact"/);
  assert.match(about, /<a href="https:\/\/www\.linkedin\.com\/in\/haotianxiehtxie\/?" target="_blank" rel="noopener noreferrer">LinkedIn<\/a>/);
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
  const introPosition = about.indexOf('I am a Research Assistant');
  const workingPosition = about.indexOf('I am working on:');
  const phdPosition = about.indexOf('I will join PolyU ISE');
  const contactPosition = about.indexOf('If you share similar interests');
  assert.ok(introPosition >= 0 && introPosition < workingPosition && workingPosition < phdPosition && phdPosition < contactPosition);
  assert.match(publications, /data-year="2026"/);
  assert.equal((publications.match(/class="publication"/g) ?? []).length, 6);
  assert.match(publications, /Topological persistence pinpoints higher-order network vulnerabilities/);
  assert.match(publications, /A virtual node based zero-shot learning framework for link prediction in complex networks/);
  assert.match(publications, /10\.1016\/j\.ins\.2026\.123522/);
  assert.match(misc, /The University of Hong Kong/);
  assert.match(misc, /Beijing Normal University/);
  assert.match(misc, /Tony Reynolds Academic Excellence Prize/);
  assert.match(misc, /Mandarin \(Native\), Cantonese \(Native\), English \(C1\)/);
  assert.match(home, /The Hong Kong Polytechnic University/);
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
  assert.match(selectedPublications, /Decentralized autonomous organizations in e-commerce supply chains/);
  assert.match(style, /\.selected-publications\s*\{[\s\S]*?margin-top:\s*2rem;/);
  assert.doesNotMatch(site, /Your Name|your@email\.com|Your Paper Title|Research Lab|University of XX|Advisor Name/);
});
