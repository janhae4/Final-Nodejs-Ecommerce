const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc SMTP khác bạn dùng
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function sendResetEmail(toEmail, resetLink) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset.</p>
      <p>Click this link to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
