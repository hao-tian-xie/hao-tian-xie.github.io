import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [homepage, script, style, about, publications, misc, home] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../script.js', import.meta.url), 'utf8'),
  readFile(new URL('../style.css', import.meta.url), 'utf8'),
  readFile(new URL('../pages/about.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/publications.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/misc.html', import.meta.url), 'utf8'),
  readFile(new URL('../pages/home.html', import.meta.url), 'utf8'),
]);

const site = [homepage, script, style, about, publications, misc, home].join('\n');

test('homepage uses the SimpleAcademicHomepage shell with Haotian Xie content', () => {
  assert.match(homepage, /class="sidebar"/);
  assert.match(homepage, /class="container"/);
  assert.match(homepage, /class="mobile-header"/);
  assert.match(homepage, /class="mobile-footer"/);
  assert.match(homepage, /id="content"/);
  assert.match(homepage, /data-page="about"/);
  assert.match(homepage, /data-page="publications"/);
  assert.match(homepage, /data-page="misc"/);
  assert.match(script, /pages\/\$\{page\}\.html/);
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
  assert.match(about, /I am actively seeking a Ph\.D\. position starting in Fall 2026 and welcome academic collaborations\./);
  assert.doesNotMatch(about, /Using data, mathematical models, and optimization to support better decisions\./);
  assert.doesNotMatch(about, /Applications across logistics, supply chains, transportation, and networked systems\./);
  assert.doesNotMatch(about, /Research connecting Operations Research with Complex Systems\./);
  assert.doesNotMatch(about, /class="interest-body"/);
  assert.doesNotMatch(about, /<details\b|<summary\b/);
  assert.equal((about.match(/class="interest"/g) ?? []).length, 3);
  assert.match(style, /\.interest::before\s*\{[\s\S]*?content:\s*'▶';[\s\S]*?pointer-events:\s*none;/);
  assert.doesNotMatch(style, /\.interest\s*>\s*summary|\.interest\[open\]/);
  const introPosition = about.indexOf('I am a Research Assistant');
  const phdPosition = about.indexOf('I am actively seeking');
  const workingPosition = about.indexOf('I am working on:');
  assert.ok(introPosition >= 0 && introPosition < phdPosition && phdPosition < workingPosition);
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
  assert.doesNotMatch(site, /Your Name|your@email\.com|Your Paper Title|Research Lab|University of XX|Advisor Name/);
});
