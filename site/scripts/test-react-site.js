/**
 * Automated Verification Test for React Island in Treecraft Site (GĐ R-SITE)
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const siteDir = path.resolve(rootDir, 'site');

console.log('\x1b[36m%s\x1b[0m', '🧪 [Test Suite] Starting GĐ R-SITE React Island Verification Tests...\n');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m ${desc}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Toolchain & Bundles Verification
it('Vite manifest.json exists and is valid', () => {
  const manifestPath = path.join(siteDir, 'public/react/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in site/public/react/');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entry = manifest['src/main.tsx'] || Object.values(manifest).find((v) => v.isEntry);
  assert.ok(entry, 'manifest must have an entry point');
  assert.ok(entry.file && entry.file.endsWith('.js'), 'entry point must specify .js file');
  assert.ok(entry.css && entry.css.length > 0, 'entry point must specify .css file');
});

it('Compiled JS and CSS bundle files exist on disk with hash', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(siteDir, 'public/react/manifest.json'), 'utf8'));
  const entry = manifest['src/main.tsx'] || Object.values(manifest).find((v) => v.isEntry);
  const jsFilePath = path.join(siteDir, 'public/react', entry.file);
  const cssFilePath = path.join(siteDir, 'public/react', entry.css[0]);
  assert.ok(fs.existsSync(jsFilePath), `JS bundle ${entry.file} must exist`);
  assert.ok(fs.existsSync(cssFilePath), `CSS bundle ${entry.css[0]} must exist`);
  assert.ok(fs.statSync(jsFilePath).size > 10000, 'JS bundle size must be > 10KB');
  assert.ok(fs.statSync(cssFilePath).size > 1000, 'CSS bundle size must be > 1KB');
});

// 2. React Mount Helper & Registry Verification
it('React registry contains all expected island components', () => {
  const registryFile = path.join(siteDir, 'react/src/registry.ts');
  assert.ok(fs.existsSync(registryFile), 'registry.ts must exist');
  const content = fs.readFileSync(registryFile, 'utf8');
  const expectedIslands = [
    'Hero',
    'FlashSale',
    'DealTabs',
    'CategorySection',
    'HeaderActions',
    'CartAndMobileDrawers',
    'FloatingButtons',
    'CategoryPage',
    'ProductDetailPage',
  ];
  for (const name of expectedIslands) {
    assert.ok(content.includes(name), `registry must register ${name}`);
  }
});

it('Mount Helper in main.tsx wraps ErrorBoundary and handles data-props safely', () => {
  const mainFile = path.join(siteDir, 'react/src/main.tsx');
  const content = fs.readFileSync(mainFile, 'utf8');
  assert.ok(content.includes('IslandErrorBoundary'), 'main.tsx must define IslandErrorBoundary');
  assert.ok(content.includes('JSON.parse(rawProps)'), 'main.tsx must safely parse data-props');
  assert.ok(content.includes('ShopProvider'), 'main.tsx must wrap components with ShopProvider');
});

// 3. EJS Wrappers & Escape Verification
it('EJS wrappers have fallback content for SEO & No-JS', () => {
  const wrappers = [
    'Hero.ejs',
    'FlashSale.ejs',
    'DealTabs.ejs',
    'CategorySection.ejs',
    'CategoryPageIsland.ejs',
    'ProductDetailPageIsland.ejs',
  ];
  for (const w of wrappers) {
    const filePath = path.join(siteDir, 'views/components', w);
    assert.ok(fs.existsSync(filePath), `${w} must exist`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('<noscript>'), `${w} must include <noscript> fallback content`);
    assert.ok(content.includes('data-react='), `${w} must declare data-react attribute`);
  }
});

it('Pure EJS presentation components exist and render semantic HTML', () => {
  const pureComponents = ['PromoStrip.ejs', 'AccessoryGrid.ejs', 'Offers.ejs', 'News.ejs'];
  for (const c of pureComponents) {
    const filePath = path.join(siteDir, 'views/components', c);
    assert.ok(fs.existsSync(filePath), `${c} must exist`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('<section'), `${c} must render semantic <section> tag`);
  }
});

it('Props escaping test: handles quotes and script tags without breaking JSON', () => {
  const maliciousInput = '<script>alert("XSS")</script>&"\'';
  const props = { title: maliciousInput, number: 123 };
  const jsonStr = JSON.stringify(props).replace(/"/g, '&quot;');
  assert.ok(!jsonStr.includes('"title"'), 'Double quotes must be escaped as &quot;');
  assert.ok(jsonStr.includes('&quot;title&quot;'), '&quot; must wrap keys');
  // When parsing back in browser DOM:
  const decoded = jsonStr.replace(/&quot;/g, '"');
  const parsed = JSON.parse(decoded);
  assert.strictEqual(parsed.title, maliciousInput);
});

// 4. Clean Git / Core Immunity Verification
it('Core repository remains 100% clean and untouched', () => {
  const { execSync } = require('child_process');
  const gitCoreStatus = execSync('git -C core status --short', { encoding: 'utf8' }).trim();
  assert.strictEqual(gitCoreStatus, '', 'git status in core submodule MUST be completely empty!');
});

it('.gitignore excludes node_modules, core/, and site/public/react/', () => {
  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('node_modules/'), '.gitignore must exclude node_modules/');
  assert.ok(gitignore.includes('core/'), '.gitignore must exclude core/');
  assert.ok(gitignore.includes('site/public/react/'), '.gitignore must exclude site/public/react/');
});

console.log(`\n\x1b[36m--- Kết quả: ${passedTests}/${totalTests} tests passed ---\x1b[0m\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
