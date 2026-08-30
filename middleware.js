// Vercel Edge Middleware — Advanced Anti-Bot & AI Crawler Protection
// Runtime: Edge (runs globally at Vercel's CDN edge before static assets)

export const config = {
  runtime: 'edge',
};

// ─── Blocked User-Agent Patterns ────────────────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  // ── Anthropic / Claude ──
  'claudebot', 'anthropic-ai', 'claude-web', 'claude',

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

// ─── Suspicious Header Patterns ─────────────────────────────────────────────
function hasSuspiciousHeaders(request) {
  const ua = request.headers.get('user-agent') || '';

  // No user-agent at all → likely a raw script
  if (!ua || ua.length < 10) return true;

  // Accept header missing or generic → likely not a real browser
  const accept = request.headers.get('accept') || '';
  if (!accept && request.method === 'GET') return true;

  return false;
}

// ─── Main Middleware ────────────────────────────────────────────────────────
export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip middleware for API routes (let serverless functions handle them)
  if (pathname.startsWith('/api/')) {
    return;
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Layer 1: User-Agent pattern matching
  const uaBlocked = BLOCKED_UA_PATTERNS.some((pattern) => userAgent.includes(pattern));

  // Layer 2: Suspicious header analysis
  const headersSuspicious = hasSuspiciousHeaders(request);

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

  if (headersSuspicious && !isLegitimateSearchEngine(userAgent)) {
    return new Response('403 Forbidden', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Blocked-Reason': 'suspicious-headers',
      },
    });
  }

  // Pass through — return nothing so Vercel serves the static asset
  return;
}

// ─── Allow Legitimate Search Engines ────────────────────────────────────────
function isLegitimateSearchEngine(ua) {
  const allowed = ['googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp'];
  return allowed.some((engine) => ua.includes(engine));
}
