// Vercel Edge Middleware - Hard Blocking AI Crawlers & Scrapers
export const config = {
  matcher: '/:path*',
};

const BLOCKED_USER_AGENTS = [
  // Anthropic / Claude
  'claudebot',
  'anthropic-ai',
  'claude-web',
  'claude',

  // OpenAI / ChatGPT
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',

  // Common AI Scrapers & Training Bots
  'bytespider',
  'bytedance',
  'ccbot',
  'commoncrawl',
  'diffbot',
  'perplexitybot',
  'youbot',
  'cohere-ai',
  'omgilibot',
  'omgili',
  'amazonbot',
  'applebot-extended',
  'facebookbot',
  'meta-externalagent',
  'meta-externalfetcher',
  'timpibot',
  'velenpublicwebcrawler',
  'webzio-extended',
  'google-extended',

  // Automated Scraper Tools & Headless Drivers
  'scrapy',
  'selenium',
  'puppeteer',
  'playwright',
  'headlesschrome',
  'phantomjs',
  'python-requests',
  'python-urllib',
  'aiohttp',
  'httpx',
  'libwww-perl',
  'wget',
];

export default function middleware(request) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Check if incoming request matches any blocked AI crawler or scraper pattern
  const isBlocked = BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (isBlocked) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Access Denied: AI crawler, scraper, or automated bot detected.',
        status: 403,
        detected_ua: userAgent,
      }),
      {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'Content-Type': 'application/json',
          'X-Robots-Tag': 'noindex, nofollow, noai, noimageai',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  // Allow regular browser traffic and legitimate search engines (Googlebot, Bingbot)
  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
      'X-Robots-Tag': 'noai, noimageai',
    },
  });
}
