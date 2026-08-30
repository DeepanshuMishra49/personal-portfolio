// Vercel Proxy Middleware — Advanced Anti-Bot & AI Crawler Protection
// Runtime: Node.js (required for proxy entrypoint)

export const config = {
  runtime: 'nodejs',
};

// ─── Blocked User-Agent Patterns ────────────────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  // ── Anthropic / Claude ──
  'claudebot', 'anthropic-ai', 'claude-web',

  // ── OpenAI / ChatGPT ──
  'gptbot', 'chatgpt-user', 'oai-searchbot',

  // ── Google AI Training ──
  'google-extended',

  // ── Meta / Facebook AI ──
  'meta-externalagent', 'meta-externalfetcher', 'facebookbot',

  // ── Other AI Crawlers ──
  'bytespider', 'bytedance', 'ccbot', 'commoncrawl', 'diffbot',
  'perplexitybot', 'youbot', 'cohere-ai', 'omgilibot', 'omgili',
  'amazonbot', 'applebot-extended', 'timpibot', 'velenpublicwebcrawler',
  'webzio-extended', 'ia_archiver', 'archive.org_bot',

  // ── Headless Browsers & Automation Frameworks ──
  'headlesschrome', 'phantomjs',

  // ── Programmatic HTTP Libraries ──
  'python-requests', 'python-urllib', 'aiohttp', 'httpx',
  'libwww-perl', 'wget', 'curl/',

  // ── Scraping Frameworks ──
  'scrapy', 'selenium', 'puppeteer', 'playwright',
];

// ─── Legitimate Search Engines (always allowed) ─────────────────────────────
function isLegitimateSearchEngine(ua) {
  const allowed = ['googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp'];
  return allowed.some((engine) => ua.includes(engine));
}

// ─── Main Middleware ────────────────────────────────────────────────────────
export default function middleware(request) {
  const url = new URL(request.url);

  // Skip middleware for API routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Layer 1: User-Agent pattern matching against known AI bots
  const uaBlocked = BLOCKED_UA_PATTERNS.some((pattern) => userAgent.includes(pattern));

  if (uaBlocked) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Access Denied: AI crawler or automated bot detected.',
        status: 403,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Robots-Tag': 'noindex, nofollow, noai, noimageai',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  // Layer 2: Block requests with missing or suspiciously short User-Agent
  // (unless it's a legitimate search engine)
  if ((!userAgent || userAgent.length < 10) && !isLegitimateSearchEngine(userAgent)) {
    return new Response('403 Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Pass through to static assets
  return;
}
