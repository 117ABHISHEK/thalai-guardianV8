const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"ThalAI Guardian Test" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER, // sending it to self
  subject: 'Test Email from ThalAI',
  text: 'If you receive this, the email service is working.',
};

console.log('Attempting to send email using:', process.env.EMAIL_USER);

transporter.sendMail(mailOptions)
  .then(info => {
    console.log('Email sent successfully:', info.messageId);
    process.exit(0);
  })
  .catch(error => {
    console.error('Email sending failed:', error);
    process.exit(1);
  });
