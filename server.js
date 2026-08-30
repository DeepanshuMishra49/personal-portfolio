import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8085;

// ==========================================
// LAYER 2 & 5: Security & Anti-Bot Middleware
// ==========================================

// Global Anti-AI / Anti-Scraper Response Headers
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet, noai, noimageai');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Known Bot / Scraper Signatures
const KNOWN_BOT_PATTERNS = [
  'gptbot',
  'chatgpt',
  'claudebot',
  'anthropic',
  'bytespider',
  'ccbot',
  'google-extended',
  'applebot-extended',
  'perplexity',
  'youbot',
  'cohere',
  'diffbot',
  'facebookbot',
  'meta-externalagent',
  'magpie-crawler',
  'imagesiftbot',
  'omgilibot',
  'meltwater',
  'ahrefs',
  'semrush',
  'scrapy',
  'python-requests',
  'aiohttp',
  'httpx',
  'wget',
  'curl',
  'httpclient',
  'headless',
  'playwright',
  'puppeteer',
  'selenium',
  'postmanruntime'
];

// Anti-Bot Request Validation Middleware
const antiBotValidator = (req, res, next) => {
  // Allow public robots.txt and ai.txt to be read by crawlers so they see disallow directives
  if (req.path === '/robots.txt' || req.path === '/ai.txt') {
    return next();
  }

  const userAgent = (req.get('User-Agent') || '').trim();
  const acceptLang = req.get('Accept-Language');

  // 1. Block empty or suspiciously short User-Agent
  if (!userAgent || userAgent.length < 10) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Forbidden: Missing or invalid client User-Agent signature.'
    });
  }

  // 2. Block known AI scrapers and automated tools
  const uaLower = userAgent.toLowerCase();
  const matchedBot = KNOWN_BOT_PATTERNS.find(pattern => uaLower.includes(pattern));
  if (matchedBot) {
    return res.status(403).json({
      error: 'Access Denied',
      message: `Forbidden: Automated crawler prohibited (${matchedBot}).`
    });
  }

  // 3. Block missing Accept-Language for standard HTML browsing requests
  const isHtmlRequest = (req.get('Accept') || '').includes('text/html');
  if (isHtmlRequest && !acceptLang) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Forbidden: Missing standard browser headers.'
    });
  }

  next();
};

app.use(antiBotValidator);

// ==========================================
// LAYER 4: In-Memory Sliding Window Rate Limiting
// ==========================================

const rateLimitStores = {
  general: new Map(),
  api: new Map(),
};

function createRateLimiter(zone, limit, windowMs = 60000) {
  const store = rateLimitStores[zone];

  return (req, res, next) => {
    // Get client IP (supports standard proxy headers)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const clientRecord = store.get(clientIp);

    if (!clientRecord || (now - clientRecord.windowStart) > windowMs) {
      store.set(clientIp, { count: 1, windowStart: now });
      return next();
    }

    if (clientRecord.count >= limit) {
      const retryAfterSeconds = Math.ceil((clientRecord.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit of ${limit} req/min exceeded. Please retry in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds
      });
    }

    clientRecord.count += 1;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - clientRecord.count));
    next();
  };
}

// Clean up stale rate limiter records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of Object.values(rateLimitStores)) {
    for (const [ip, entry] of store.entries()) {
      if (now - entry.windowStart > 120000) {
        store.delete(ip);
      }
    }
  }
}, 300000);

const generalLimiter = createRateLimiter('general', 30, 60000); // 30 req/min
const apiLimiter = createRateLimiter('api', 5, 60000);          // 5 req/min for APIs

// Apply rate limits
app.use('/api/contact', apiLimiter);
app.use('/api/messages', apiLimiter);
app.use(generalLimiter);

// Core Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static assets from public/ and dist/
app.use(express.static(path.join(__dirname, 'public')));
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// In-Memory Messages Store
const messageHistory = [];
const activeWsClients = new Set();

// Nodemailer Gmail SMTP Transporter
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

// Function to send email notification to Deepanshu
async function sendEmailNotification(data) {
  const { name, email, subject, message, id, timestamp } = data;

  const mailOptions = {
    from: `"Deepanshu's Messenger" <${mailUsername}>`,
    to: recipientEmail,
    replyTo: email,
    subject: `[Deepanshu's Messenger] ${subject || 'New Message'} (from ${name})`,
    text: `Hello Deepanshu,

You received a new message through Deepanshu's Messenger on your Portfolio:

======================================================
Sender Name:    ${name}
Sender Email:   ${email}
Subject:        ${subject}
Timestamp:      ${timestamp || new Date().toISOString()}
Message ID:     ${id}
======================================================

Message Content:
${message}

======================================================
Reply directly to this email to respond to ${name} (${email}).
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Successfully delivered email to ${recipientEmail} [MessageId: ${info.messageId}]`);
    return true;
  } catch (err) {
    console.error(`⚠️ [Email Service] Error sending email: ${err.message}`);
    return false;
  }
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  res.json({
    status: 'ONLINE',
    runtime: `Node.js ${process.version}`,
    node: 'deepanshu-cloud-ap-south-1',
    activeRegion: 'ap-south-1 (Mumbai)',
    uptimeSeconds,
    heapMemoryMB: memUsage,
    activeWebSocketConnections: activeWsClients.size,
    totalMessagesReceived: messageHistory.length,
    securityGuard: 'ACTIVE (RateLimiter + AntiBot + AntiAI)',
    cloudStack: ['Node.js', 'Express', 'WebSocket (ws)', 'Nodemailer', 'Docker', 'AWS EC2'],
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/messages', (req, res) => {
  res.json({
    count: messageHistory.length,
    messages: messageHistory,
  });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  const id = 'msg_' + Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString();

  const record = { id, name: name || 'Anonymous', email, subject: subject || 'Portfolio Contact', message, type: 'REST', status: 'DELIVERED', timestamp };
  messageHistory.push(record);

  console.log(`📬 [REST API] Message from ${record.name} (${email}): ${record.subject}`);

  // Send Email in background
  sendEmailNotification(record).catch(console.error);

  res.json({
    success: true,
    message: 'Message delivered directly to Deepanshu! Thank you for reaching out.',
    id,
    timestamp,
  });
});

// Serve Authentic 1-Page PDF Resume
app.get('/resume.pdf', (req, res) => {
  const possiblePaths = [
    path.join(__dirname, 'public', 'resume.pdf'),
    path.join(__dirname, '..', 'public', 'resume.pdf'),
    path.join(__dirname, 'src', 'main', 'resources', 'static', 'resume.pdf'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Resume-Deepanshu-Mishra.pdf"');
      return res.sendFile(p);
    }
  }

  res.status(404).send('Resume PDF not found.');
});

// WebSocket Server attached to HTTP server
const wss = new WebSocketServer({ server, path: '/ws/messages' });

wss.on('connection', (ws, req) => {
  // Validate User-Agent for WebSocket handshakes
  const ua = req.headers['user-agent'] || '';
  const uaLower = ua.toLowerCase();
  if (KNOWN_BOT_PATTERNS.some(b => uaLower.includes(b))) {
    ws.close(1008, 'Automated scraper disallowed');
    return;
  }

  activeWsClients.add(ws);
  console.log(`🟢 [WebSocket] Client connected. Total active: ${activeWsClients.size}`);

  // Send initial handshake
  const welcome = {
    id: 'sys_' + Date.now(),
    name: 'System',
    email: 'system@deepanshumishra.cloud',
    subject: 'Connection Established',
    message: "Connected to Deepanshu Mishra's Cloud Node WebSocket Gateway (ap-south-1).",
    type: 'SYSTEM',
    timestamp: new Date().toISOString(),
    status: 'CONNECTED',
  };
  ws.send(JSON.stringify(welcome));

  ws.on('message', async (data) => {
    try {
      const payload = JSON.parse(data.toString());
      const id = 'msg_' + Math.random().toString(36).substring(2, 10);
      const timestamp = new Date().toISOString();

      const record = {
        id,
        name: payload.name || 'Anonymous',
        email: payload.email || 'noreply@visitor.com',
        subject: payload.subject || 'Portfolio Inquiry',
        message: payload.message || '',
        type: 'CHAT',
        status: 'DELIVERED',
        timestamp,
      };

      messageHistory.push(record);

      console.log('=================================================');
      console.log('📬 NEW WEBSOCKET MESSAGE FOR DEEPANSHU');
      console.log(`From: ${record.name} (${record.email})`);
      console.log(`Subject: ${record.subject}`);
      console.log(`Message: ${record.message}`);
      console.log('=================================================');

      // Forward directly to Gmail inbox
      sendEmailNotification(record).catch(console.error);

      // Send instant ACK back to client
      const ack = {
        id,
        name: 'Deepanshu Mishra Cloud Node',
        email: 'deep270804@gmail.com',
        subject: 'Message Acknowledged',
        message: 'Your message has been delivered directly to Deepanshu. Thank you!',
        type: 'ACK',
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(ack));
      }
    } catch (err) {
      console.error('❌ [WebSocket] Parse error:', err.message);
    }
  });

  ws.on('close', () => {
    activeWsClients.delete(ws);
    console.log(`🔴 [WebSocket] Client disconnected. Active: ${activeWsClients.size}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 [Node.js Backend] Server & WebSocket running on port ${PORT}`);
  console.log(`🛡️  [Security Engine] Rate Limiting & Anti-Scraper Validation Active`);
  console.log(`📧 [Email Target] Dispatching incoming messages to: ${recipientEmail}`);
});
