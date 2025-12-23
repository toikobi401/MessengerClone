import nodemailer from 'nodemailer';

/**
 * Email Service for OTP delivery
 * Configuration: SMTP (Gmail App Password or Mailtrap for testing)
 */

// Create nodemailer transporter
const createTransporter = () => {
  // Development: Use Mailtrap (sandbox email testing)
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER || 'your_mailtrap_username',
        pass: process.env.SMTP_PASS || 'your_mailtrap_password'
      }
    });
  }

  // Production: Use Gmail SMTP with App Password
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Gmail App Password (NOT regular password)
    }
  });
};

/**
 * Send OTP Email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - 'registration' or 'login_2fa'
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  try {
    const transporter = createTransporter();

    // Determine email content based on purpose
    const subject = purpose === 'registration' 
      ? '🔐 Verify Your Email - Messenger Clone'
      : '🔒 Your Login Verification Code - Messenger Clone';

    const heading = purpose === 'registration'
      ? 'Welcome to Messenger Clone!'
      : 'Login Verification';

    const message = purpose === 'registration'
      ? 'Thank you for registering! Please verify your email address to complete your account setup.'
      : 'We detected a login attempt to your account. Please enter this code to continue.';

    // Styled HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #0f0f13;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(154, 134, 243, 0.2);
          }
          .header {
            background: linear-gradient(135deg, #9a86f3 0%, #667eea 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
            color: #e5e7eb;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .otp-box {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid #9a86f3;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 900;
            color: #9a86f3;
            letter-spacing: 12px;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            padding: 16px;
            border-radius: 8px;
            color: #fca5a5;
            font-size: 14px;
            margin-top: 20px;
          }
          .footer {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 13px;
          }
          .footer a {
            color: #9a86f3;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${heading}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>${message}</p>
            
            <div class="otp-box">
              <div class="otp-label">Your Verification Code</div>
              <h2 class="otp-code">${otp}</h2>
            </div>

            <p>This code will expire in <strong>5 minutes</strong>. Please do not share this code with anyone.</p>

            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> If you did not request this code, please ignore this email or contact support immediately.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Messenger Clone. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@messengerclone.com">Contact Support</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Messenger Clone" <${process.env.EMAIL_USER || 'noreply@messengerclone.com'}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      // Fallback plain text
      text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`
    });

    console.log('✅ OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

/**
 * Test email configuration
 */
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

export default {
  sendOTPEmail,
  testEmailConfig
};
