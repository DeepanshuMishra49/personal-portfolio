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

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

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
  const id = 'msg_' + Math.random().toString(36).substring(2, 10);
  const timestamp = new Date().toISOString();

  const record = { id, name, email, subject, message, type: 'REST', status: 'DELIVERED', timestamp };
  messageHistory.push(record);

  console.log(`📬 [REST API] Message from ${name} (${email}): ${subject}`);

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

wss.on('connection', (ws) => {
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
  console.log(`📧 [Email Target] Dispatching incoming messages to: ${recipientEmail}`);
});
