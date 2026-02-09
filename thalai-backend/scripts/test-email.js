require('dotenv').config(); // Loads from .env in current directory (thalai-backend root)
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('--- Email Configuration Check ---');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******' : 'NOT SET');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Missing email credentials in .env file.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Attempting to verify transporter connection...');
    await transporter.verify();
    console.log('✅ Server is ready to take our messages');

    const mailOptions = {
        from: `"ThalAI Guardian Test" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self for testing
        subject: 'ThalAI Guardian Mailing System Test',
        text: 'This is a test email from the ThalAI Guardian system. If you received this, the mailing system is working correctly!',
        html: '<b>This is a test email from the ThalAI Guardian system.</b><br>If you received this, the mailing system is working correctly!'
    };

    console.log(`Sending test email to ${process.env.EMAIL_USER}...`);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    if (error.code === 'EAUTH') {
        console.error('Hint: Check your email password or app-specific password.');
    }
  }
};

testEmail();
