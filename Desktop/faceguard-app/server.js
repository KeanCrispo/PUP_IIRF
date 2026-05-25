const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/api/send-email', async (req, res) => {
  const { to, subject = 'Notification', message = '' } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Missing "to" field' });

  // If SMTP credentials are set, send a real email; otherwise return a mock success for dev.
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject,
        text: message,
      });

      return res.json({ success: true });
    } catch (err) {
      console.error('Email send error', err);
      return res.status(500).json({ error: err.message || 'Failed to send email' });
    }
  } else {
    console.log('Mock email:', { to, subject, message });
    return res.json({ success: true, mock: true });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));