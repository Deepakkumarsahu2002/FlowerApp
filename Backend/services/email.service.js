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

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      sender: { email: sender, name: senderName },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo email send failed:', errorText);
    return false;
  }
  return true;
};

module.exports = { sendEmailVerification };
