const https = require('https');

const sendBrevoRequest = (payload, apiKey) => new Promise((resolve, reject) => {
  const request = https.request(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      }
    },
    (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve({ ok: true });
          return;
        }
        reject(new Error(`Brevo error (${response.statusCode}): ${data}`));
      });
    }
  );

  request.on('error', reject);
  request.write(JSON.stringify(payload));
  request.end();
});

const sendEmailVerification = async ({ to, name, code }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Flowers Forever';

  if (!apiKey || !sender) {
    console.warn('Brevo is not configured. Skipping email send.');
    return false;
  }

  const subject = 'Verify your email address';
  const safeName = name || 'there';
  const text = `Hi ${safeName},\n\nYour verification code is ${code}. It expires in 15 minutes.\n\nIf you did not create this account, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Hi ${safeName},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in 15 minutes.</p>
      <p>If you did not create this account, you can ignore this email.</p>
    </div>
  `;

  const payload = {
    sender: { email: sender, name: senderName },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html
  };

  try {
    await sendBrevoRequest(payload, apiKey);
    return true;
  } catch (error) {
    console.error('Brevo email send failed:', error.message || error);
    return false;
  }
};

module.exports = { sendEmailVerification };
