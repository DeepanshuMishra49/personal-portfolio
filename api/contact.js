import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ONLINE', gateway: 'Vercel Serverless' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, subject, message } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }

    const mailUsername = process.env.MAIL_USERNAME || 'deep270804@gmail.com';
    const mailPassword = process.env.MAIL_PASSWORD || 'egbdpqndxxtwbwao';
    const recipientEmail = 'deep270804@gmail.com';

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
