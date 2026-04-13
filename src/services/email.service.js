require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Bank Ledger!';
    const text = `Hi ${name},\n\nThank you for registering with Bank Ledger. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Bank Ledger Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with Bank Ledger. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Bank Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, type) {
    const subject = `Transaction Alert: ${type} of ${amount}`;
    const text = `Hi ${name},\n\nA ${type} transaction of amount ${amount} has been made on your account. If you did not authorize this transaction, please contact our support team immediately.\n\nBest regards,\nThe Bank Ledger Team`;
    const html = `<p>Hi ${name},</p><p>A <strong>${type}</strong> transaction of amount <strong>${amount}</strong> has been made on your account. If you did not authorize this transaction, please contact our support team immediately.</p><p>Best regards,<br>The Bank Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, type) {
    const subject = `Transaction Failed: ${type} of ${amount}`;
    const text = `Hi ${name},\n\nWe attempted to process a ${type} transaction of amount ${amount} on your account, but it failed. Please check your account details and try again. If you need assistance, feel free to contact our support team.\n\nBest regards,\nThe Bank Ledger Team`;
    const html = `<p>Hi ${name},</p><p>We attempted to process a <strong>${type}</strong> transaction of amount <strong>${amount}</strong> on your account, but it failed. Please check your account details and try again. If you need assistance, feel free to contact our support team.</p><p>Best regards,<br>The Bank Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}


module.exports = { 
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};