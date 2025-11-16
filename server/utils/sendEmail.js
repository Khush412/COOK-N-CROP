const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Log email attempt for debugging
    console.log('Attempting to send email:', {
      to: options.email,
      subject: options.subject,
      hasMessage: !!options.message,
      messageLength: options.message ? options.message.length : 0
    });

    // 1) Create a transporter using SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add debugging options
      logger: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development',
    });

    // 2) Define the email options
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // 3) Actually send the email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      recipient: options.email,
      subject: options.subject,
      response: result.response // This will show the SMTP server response
    });
    return result;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      recipient: options.email,
      subject: options.subject,
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? '*** configured ***' : '*** missing ***'
      }
    });
    throw error;
  }
};

module.exports = sendEmail;