import http from 'http';

function makeRequest({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8085,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('       RUNNING COMPLETE ANTI-BOT & SECURITY TEST SUITE       ');
  console.log('=============================================================\n');

  const testCases = [
    // AI Crawlers & Scrapers
    {
      name: 'OpenAI GPTBot',
      path: '/api/health',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'Anthropic ClaudeBot',
      path: '/api/health',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'ByteDance Bytespider',
      path: '/api/health',
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0) Bytespider', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'Perplexity AI Bot',
      path: '/api/health',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'Common Crawl CCBot',
      path: '/api/health',
      headers: { 'User-Agent': 'CCBot/2.0 (https://commoncrawl.org/faq.html)', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'Scrapy Web Harvester',
      path: '/api/health',
      headers: { 'User-Agent': 'Scrapy/2.11.0 (+https://scrapy.org)', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    // Malformed & Automation Signatures
    {
      name: 'Empty User-Agent',
      path: '/api/health',
      headers: { 'User-Agent': '', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'Short / Suspicious User-Agent',
      path: '/api/health',
      headers: { 'User-Agent': 'Bot', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'Headless Browser Signature in UA',
      path: '/api/health',
      headers: { 'User-Agent': 'Mozilla/5.0 HeadlessChrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'en-US' },
      expectedCode: 403
    },
    {
      name: 'HTML Request Missing Accept-Language',
      path: '/index.html',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
      expectedCode: 403
    },
    // Allowed Policy Files
    {
      name: 'Public robots.txt Accessibility',
      path: '/robots.txt',
      headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)', 'Accept-Language': 'en-US' },
      expectedCode: 200
    },
    {
      name: 'Public ai.txt Accessibility',
      path: '/ai.txt',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept-Language': 'en-US' },
      expectedCode: 200
    },
    // Legitimate Human Browser Request
    {
      name: 'Legitimate Human Chrome Browser',
      path: '/api/health',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'application/json'
      },
      expectedCode: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    try {
      const res = await makeRequest(tc);
      const isPass = res.statusCode === tc.expectedCode;
      if (isPass) {
        passed++;
        console.log(`✅ [PASS] ${tc.name.padEnd(42)} Expected: ${tc.expectedCode}, Got: ${res.statusCode}`);
      } else {
        failed++;
        console.log(`❌ [FAIL] ${tc.name.padEnd(42)} Expected: ${tc.expectedCode}, Got: ${res.statusCode}`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ [ERR ] ${tc.name.padEnd(42)} Error: ${err.message}`);
    }
  }

  console.log('\n--- Testing Rate Limiting on /api/contact (Threshold: 5 req/min) ---');
  for (let i = 1; i <= 6; i++) {
    const expected = i <= 5 ? 200 : 429;
    const res = await makeRequest({
      path: '/api/contact',
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Tester', email: 'test@example.com', message: 'Test message #' + i })
    });

    const isPass = res.statusCode === expected;
    if (isPass) {
      passed++;
      console.log(`✅ [PASS] Contact API Burst Request #${i} (IP: 127.0.0.1)      Expected: ${expected}, Got: ${res.statusCode} ${expected === 429 ? '(Retry-After: ' + res.headers['retry-after'] + 's)' : ''}`);
    } else {
      failed++;
      console.log(`❌ [FAIL] Contact API Burst Request #${i}                    Expected: ${expected}, Got: ${res.statusCode}`);
    }
  }

  console.log('\n=============================================================');
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('=============================================================\n');
}

runTests();
