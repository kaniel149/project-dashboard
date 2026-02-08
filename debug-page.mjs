import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  // Collect failed requests
  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  // Collect network requests
  const networkRequests = [];
  page.on('response', resp => {
    networkRequests.push({ url: resp.url(), status: resp.status() });
  });

  console.log('--- Navigating to http://localhost:5173 ---');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  // Wait a bit for any async rendering
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: '/Users/kanieltordjman/Desktop/projects/project-dashboard/debug-screenshot.png', fullPage: true });
  console.log('Screenshot saved to debug-screenshot.png');

  // Check page title
  const title = await page.title();
  console.log('\n--- Page Title ---');
  console.log(title);

  // Check body background color
  const bodyBg = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      className: body.className,
    };
  });
  console.log('\n--- Body Styles ---');
  console.log('Background color:', bodyBg.backgroundColor);
  console.log('Text color:', bodyBg.color);
  console.log('Body className:', bodyBg.className);

  // Check #root element
  const rootInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return { exists: false };
    return {
      exists: true,
      childCount: root.children.length,
      innerHTML: root.innerHTML.substring(0, 5000),
      outerHTML: root.outerHTML.substring(0, 500),
      className: root.className,
      computedBg: window.getComputedStyle(root).backgroundColor,
    };
  });
  console.log('\n--- #root Element ---');
  console.log('Exists:', rootInfo.exists);
  if (rootInfo.exists) {
    console.log('Child count:', rootInfo.childCount);
    console.log('className:', rootInfo.className);
    console.log('Background:', rootInfo.computedBg);
    console.log('outerHTML:', rootInfo.outerHTML);
    console.log('innerHTML:', rootInfo.innerHTML || '(empty)');
  }

  // Check for loaded stylesheets (safely)
  const stylesheetInfo = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(s => {
      let ruleCount = 'N/A';
      try { ruleCount = s.cssRules?.length || 0; } catch(e) { ruleCount = 'cross-origin'; }
      return { href: s.href, rules: ruleCount, disabled: s.disabled };
    });
  });
  console.log('\n--- Stylesheets ---');
  stylesheetInfo.forEach(s => console.log(`  ${s.href} (${s.rules} rules, disabled=${s.disabled})`));

  // Check all loaded scripts
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => ({
      src: s.src,
      type: s.type,
      hasContent: s.textContent.length > 0,
    }));
  });
  console.log('\n--- Scripts ---');
  scripts.forEach(s => console.log(`  src=${s.src} type=${s.type} hasContent=${s.hasContent}`));

  // Console logs
  console.log('\n--- Console Messages ---');
  if (consoleLogs.length === 0) {
    console.log('(none)');
  } else {
    consoleLogs.forEach(l => console.log(`  [${l.type}] ${l.text}`));
  }

  // Page errors
  console.log('\n--- Page Errors (uncaught exceptions) ---');
  if (pageErrors.length === 0) {
    console.log('(none)');
  } else {
    pageErrors.forEach(e => console.log(`  ${e}`));
  }

  // Failed requests
  console.log('\n--- Failed Requests ---');
  if (failedRequests.length === 0) {
    console.log('(none)');
  } else {
    failedRequests.forEach(r => console.log(`  ${r.url} - ${r.failure}`));
  }

  // Network requests
  console.log('\n--- Network Requests (non-200) ---');
  const nonOk = networkRequests.filter(r => r.status !== 200 && r.status !== 304);
  if (nonOk.length === 0) {
    console.log('(all requests returned 200/304)');
  } else {
    nonOk.forEach(r => console.log(`  [${r.status}] ${r.url}`));
  }

  // Check full HTML head for any clues
  const headContent = await page.evaluate(() => {
    return document.head.innerHTML.substring(0, 3000);
  });
  console.log('\n--- <head> content (first 3000 chars) ---');
  console.log(headContent);

  // Check for any visible text on the page
  const visibleText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts = [];
    let node;
    while ((node = walker.nextNode()) && texts.length < 20) {
      const trimmed = node.textContent.trim();
      if (trimmed) texts.push(trimmed);
    }
    return texts;
  });
  console.log('\n--- Visible Text Content ---');
  if (visibleText.length === 0) {
    console.log('(no visible text found)');
  } else {
    visibleText.forEach(t => console.log(`  "${t}"`));
  }

  // Check body direct children
  const bodyStructure = await page.evaluate(() => {
    const children = Array.from(document.body.children);
    return children.map(c => ({
      tag: c.tagName,
      id: c.id,
      className: (c.className && typeof c.className === 'string') ? c.className.substring(0, 200) : '',
      childCount: c.children.length,
      computedDisplay: window.getComputedStyle(c).display,
      computedVisibility: window.getComputedStyle(c).visibility,
      computedOpacity: window.getComputedStyle(c).opacity,
      computedBg: window.getComputedStyle(c).backgroundColor,
      computedHeight: window.getComputedStyle(c).height,
    }));
  });
  console.log('\n--- Body Direct Children ---');
  bodyStructure.forEach(c => {
    console.log(`  <${c.tag} id="${c.id}" class="${c.className}">`);
    console.log(`    children: ${c.childCount}, display: ${c.computedDisplay}, visibility: ${c.computedVisibility}, opacity: ${c.computedOpacity}`);
    console.log(`    bg: ${c.computedBg}, height: ${c.computedHeight}`);
  });

  // Check the full body HTML
  const fullBodyHTML = await page.evaluate(() => document.body.outerHTML.substring(0, 5000));
  console.log('\n--- Full body outerHTML (first 5000 chars) ---');
  console.log(fullBodyHTML);

  await browser.close();
  console.log('\n--- Done ---');
})();
