/**
 * Anti-Bot & Anti-Headless Fingerprint Guard
 * Detects automated browsers (Puppeteer, Playwright, Selenium, Headless Chrome)
 * and prevents DOM scraping by malicious clients.
 */
(function () {
  'use strict';

  function detectAutomationEnvironment() {
    try {
      // 1. Check navigator.webdriver standard automation flag
      if (navigator.webdriver === true) {
        return 'navigator.webdriver flag detected';
      }

      // 2. Check for missing language parameters (typical in basic headless instances)
      if (!navigator.languages || navigator.languages.length === 0) {
        return 'empty navigator.languages';
      }

      // 3. Check for window dimension anomalies (0x0 screens in headless mode)
      if (window.outerWidth === 0 && window.outerHeight === 0) {
        return 'zero window outer dimensions';
      }

      // 4. Check for automation driver artifacts & globals
      const automationGlobals = [
        '_phantom',
        '__nightmare',
        'callPhantom',
        '_selenium',
        '__selenium_evaluate',
        '__webdriver_evaluate',
        '__driver_evaluate',
        '__webdriver_script_function',
        '__webdriver_script_func',
        '__webdriver_script_fn',
        '__fxdriver_evaluate',
        '__fxdriver_script_fn',
        'document.__selenium_unwrapped',
        'document.__webdriver_unwrapped',
        'document.__driver_unwrapped'
      ];

      for (let i = 0; i < automationGlobals.length; i++) {
        const prop = automationGlobals[i];
        if (prop.startsWith('document.')) {
          const docProp = prop.replace('document.', '');
          if (document[docProp]) return `automation object: ${prop}`;
        } else if (window[prop]) {
          return `automation object: ${prop}`;
        }
      }

      // 5. Chrome runtime signature check
      const isChromeUA = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/.test(navigator.userAgent);
      if (isChromeUA && !isMobileUA && !window.chrome) {
        return 'missing window.chrome signature in Chrome browser';
      }

      return null;
    } catch (e) {
      // Fail open on obscure runtime errors to protect legitimate users
      return null;
    }
  }

  const reason = detectAutomationEnvironment();

  if (reason) {
    console.warn('[Security Guard] Automated bot signature detected:', reason);
    // Replace content with security challenge message
    if (document.documentElement) {
      document.documentElement.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#080606;color:#f87171;font-family:sans-serif;text-align:center;padding:20px;">
          <div>
            <h2 style="font-size:24px;margin-bottom:12px;">Security Verification Failed</h2>
            <p style="color:#94a3b8;font-size:14px;">Automated access and scraping are prohibited on this resource.</p>
          </div>
        </div>
      `;
    }
    throw new Error('Access Denied: ' + reason);
  } else {
    // Legitimate client confirmed -> Remove cloak as soon as DOM is accessible
    function uncloak() {
      const cloak = document.getElementById('anti-bot-cloak');
      if (cloak && cloak.parentNode) {
        cloak.parentNode.removeChild(cloak);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', uncloak);
    } else {
      uncloak();
    }
  }
})();
