import nodemailer from 'nodemailer';

// In-Memory Rate Limiting Cache for Serverless Invocation Warm Instances
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const KNOWN_BOTS = [
  'gptbot', 'claudebot', 'bytespider', 'ccbot', 'anthropic', 'perplexity',
  'scrapy', 'python', 'curl', 'wget', 'httpclient', 'headless', 'playwright',
  'puppeteer', 'selenium', 'postman'
];

export default async function handler(req, res) {
  // CORS & Security Response Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noai, noimageai');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ONLINE',
      gateway: 'Vercel Serverless',
      protection: 'Active (RateLimit + AntiBot + AntiAI)'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ==========================================
  // Bot Validation & Header Security Checks
  // ==========================================
  const userAgent = (req.headers['user-agent'] || '').trim();
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();

  // 1. Block empty or suspiciously short User-Agent
  if (!userAgent || userAgent.length < 10) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Forbidden: Missing or invalid User-Agent.'
    });
  }

  // 2. Block known automated scraping bots
  const uaLower = userAgent.toLowerCase();
  const detectedBot = KNOWN_BOTS.find(bot => uaLower.includes(bot));
  if (detectedBot) {
    return res.status(403).json({
      error: 'Access Denied',
      message: `Forbidden: Automated crawler disallowed (${detectedBot}).`
    });
  }

  // ==========================================
  // Rate Limiting (5 requests / min per IP)
  // ==========================================
  const now = Date.now();
  const entry = rateLimitCache.get(clientIp);

  if (!entry || (now - entry.startTime) > RATE_LIMIT_WINDOW_MS) {
    rateLimitCache.set(clientIp, { count: 1, startTime: now });
  } else {
    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.ceil((entry.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `API rate limit of ${MAX_REQUESTS_PER_WINDOW} req/min exceeded. Please retry in ${retryAfter} seconds.`,
        retryAfter
      });
    }
    entry.count += 1;
  }

  try {
    const { name, email, subject, message } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }

    const mailUsername = process.env.MAIL_USERNAME || 'deep270804@gmail.com';
    const mailPassword = process.env.MAIL_PASSWORD || 'egbdpqndxxtwbwao';
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'deep270804@gmail.com';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUsername,
        pass: mailPassword,
      },
    });

    const timestamp = new Date().toISOString();
    const id = `msg_${Math.random().toString(36).substring(2, 10)}`;

    const mailOptions = {
      from: `"Deepanshu's Messenger" <${mailUsername}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `[Deepanshu's Messenger] ${subject || 'New Message'} (from ${name || email})`,
      text: `Hello Deepanshu,

You received a new message through Deepanshu's Messenger on your Portfolio:

======================================================
Sender Name:    ${name || 'Anonymous Visitor'}
Sender Email:   ${email}
Subject:        ${subject || 'General Inquiry'}
Timestamp:      ${timestamp}
Message ID:     ${id}
======================================================

Message Content:
${message}

======================================================
Reply directly to this email to respond to ${name || 'the sender'} (${email}).
`,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Message delivered to Deepanshu!',
      messageId: info.messageId,
    });
  } catch (err) {
    console.error('Failed to send email:', err);
    return res.status(500).json({
      error: 'Failed to send email notification: ' + err.message,
    });
  }
}
