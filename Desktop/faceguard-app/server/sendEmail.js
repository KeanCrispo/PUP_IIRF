const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;
  if (!to) return res.status(400).json({ error: 'Missing "to" address' });
  try {
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text: message });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Email sending failed' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Email server listening on ${port}`));