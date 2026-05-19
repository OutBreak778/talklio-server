import nodemailer from "nodemailer";
import logger from "./logger.js";

const emailTemplates = {
  // Verification OTP Email
  verificationOTP: (otp, expiresIn = 10) => ({
    subject: "Verify Your Email Address - Talklio",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
          .otp-code { font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: white; border-radius: 8px; letter-spacing: 5px; color: #667eea; margin: 20px 0; border: 2px dashed #667eea; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; margin-top: 20px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Talklio</h1>
            <p>Verify Your Email Address</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>Thank you for registering with <strong>Talklio</strong>. Please use the verification code below to complete your registration.</p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <p>This code will expire in <strong>${expiresIn} minutes</strong>.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Talklio staff will never ask for your verification code.
            </div>
            
            <p>If you didn't create an account with Talklio, please ignore this email.</p>
            
            <hr>
            <p style="font-size: 14px;">Need help? Contact our support team at <a href="mailto:support@talklio.com">support@talklio.com</a></p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Talklio. All rights reserved.</p>
            <p>123 Chat Street, Digital City, DC 12345</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Talklio - Email Verification
      
      Hello!
      
      Thank you for registering with Talklio. Your verification code is: ${otp}
      
      This code will expire in ${expiresIn} minutes.
      
      Security Notice: Never share this OTP with anyone. Talklio staff will never ask for your verification code.
      
      If you didn't create an account with Talklio, please ignore this email.
      
      Need help? Contact us at support@talklio.com
      
      © 2026 Talklio. All rights reserved.
    `,
  }),

  // Welcome Email (after verification)
  welcome: (fullName) => ({
    subject: "🎉 Welcome to Talklio - Let's Get Started!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Talklio</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Talklio, ${fullName}! 🎉</h1>
          </div>
          <div class="content">
            <p>We're thrilled to have you on board! Your email has been successfully verified.</p>
            
            <div class="feature">
              <h3>✨ What's Next?</h3>
              <ul>
                <li>Complete your profile</li>
                <li>Connect with friends</li>
                <li>Start chatting in real-time</li>
                <li>Share your moments</li>
              </ul>
            </div>

            <p>Need help getting started? Check out our <a href="https://talklio.com/guide">Quick Start Guide</a>.</p>
            
            <hr>
            <p style="font-size: 14px;">Follow us for updates and tips:</p>
            <p>
              <a href="https://twitter.com/talklio">Twitter</a> | 
              <a href="https://facebook.com/talklio">Facebook</a> | 
              <a href="https://instagram.com/talklio">Instagram</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Talklio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Talklio, ${fullName}!
      
      Your email has been successfully verified.
      
      What's Next?
      - Complete your profile
      - Connect with friends
      - Start chatting in real-time
      - Share your moments
      
      Login to your account: https://talklio.com/login
      
      Need help? Check out our Quick Start Guide: https://talklio.com/guide
      
      Follow us for updates:
      Twitter: https://twitter.com/talklio
      Facebook: https://facebook.com/talklio
      Instagram: https://instagram.com/talklio
      
      © 2026 Talklio. All rights reserved.
    `,
  }),

  // Password Reset Email
  passwordReset: (resetToken, expiresIn = 60) => ({
    subject: "🔒 Password Reset Request - Talklio",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: #ff6b6b; color: white; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; font-size: 14px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>We received a request to reset your password for your Talklio account.</p>
            
            <div style="text-align: center;">
              <a href="https://talklio.com/reset-password?token=${resetToken}" style="color: #ffffff !important; text-decoration: none;" class="button">Reset Password</a>
            </div>
            
            <p>Or copy this link: <br> <code>https://talklio.com/reset-password?token=${resetToken}</code></p>
            
            <p>This link will expire in <strong>${expiresIn} minutes</strong>.</p>
            
            <div class="warning">
              <strong>⚠️ Didn't request this?</strong> You can safely ignore this email. Your password will not be changed.
            </div>
            
            <hr>
            <p style="font-size: 14px;">For security reasons, never share this link with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Talklio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - Talklio
      
      We received a request to reset your password.
      
      Reset your password here: https://talklio.com/reset-password?token=${resetToken}
      
      This link will expire in ${expiresIn} minutes.
      
      Didn't request this? You can safely ignore this email. Your password will not be changed.
      
      For security reasons, never share this link with anyone.
      
      © 2026 Talklio. All rights reserved.
    `,
  }),

  // Login Alert Email
  loginAlert: (fullName, deviceName, location, time) => ({
    subject: "🔐 New Login to Your Talklio Account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Alert</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: #4caf50; color: white; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Detected</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Your Talklio account was just accessed from a new device.</p>
            
            <div class="info-box">
              <h3>📱 Login Details:</h3>
              <p><strong>Device:</strong> ${deviceName}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>
            
            <p>If this was you, you can ignore this email.</p>
            
            <div style="text-align: center;">
              <a href="https://talklio.com/account/security" class="button" style="color: #ffffff !important; text-decoration: none;">Secure Your Account</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Not you?</strong> Click the button above to secure your account immediately or contact support.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2026 Talklio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Login to Your Talklio Account
      
      Hello ${fullName},
      
      Your Talklio account was just accessed from a new device.
      
      Login Details:
      Device: ${deviceName}
      Location: ${location}
      Time: ${time}
      
      If this was you, you can ignore this email.
      
      Not you? Secure your account immediately: https://talklio.com/account/security
      
      © 2026 Talklio. All rights reserved.
    `,
  }),
};

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        pool: true, // Use pooled connections
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second
        rateLimit: 10, // Max 10 emails per second
      });

      logger.info("✉️ Email service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize email service:", error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("✅ Email service connection verified");
      return true;
    } catch (error) {
      logger.error("❌ Email service connection failed:", error);
      return false;
    }
  }

  async sendEmail(to, template, templateData = {}) {
    try {
      // Validate email
      if (!to || !this.isValidEmail(to)) {
        throw new Error("Invalid recipient email address");
      }

      // Get template content
      const emailContent = template(templateData);

      if (!emailContent || !emailContent.subject || !emailContent.html) {
        throw new Error("Invalid email template");
      }

      const mailOptions = {
        from: `"Talklio" <${process.env.MAIL_USER}>`,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text || this.stripHtml(emailContent.html),
        headers: {
          "X-Priority": "3",
          "X-Mailer": "Talklio Email Service",
          "List-Unsubscribe": `<mailto:unsubscribe@talklio.com>`,
        },
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`📧 Email sent successfully`, {
        messageId: info.messageId,
        to: to,
        subject: emailContent.subject,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: info.messageId,
        to: to,
        subject: emailContent.subject,
      };
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, {
        error: error.message,
        code: error.code,
        responseCode: error.responseCode,
      });

      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  // Specific email methods
  async sendVerificationOTP(email, otp, expiresIn = 10) {
    return this.sendEmail(
      email,
      (data) => emailTemplates.verificationOTP(data.otp, data.expiresIn),
      { otp, expiresIn },
    );
  }

  async sendWelcomeEmail(email, fullName) {
    return this.sendEmail(
      email,
      (data) => emailTemplates.welcome(data.fullName),
      { fullName },
    );
  }

  async sendPasswordReset(email, resetToken, expiresIn = 60) {
    return this.sendEmail(
      email,
      (data) => emailTemplates.passwordReset(data.resetToken, data.expiresIn),
      { resetToken, expiresIn },
    );
  }

  async sendLoginAlert(email, fullName, deviceName, location, time) {
    return this.sendEmail(
      email,
      (data) =>
        emailTemplates.loginAlert(
          data.fullName,
          data.deviceName,
          data.location,
          data.time,
        ),
      {
        fullName,
        deviceName,
        location,
        time,
      },
    );
  }

  // Helper methods
  isValidEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Bulk email sending (with rate limiting)
  async sendBulkEmails(emails, template, templateData) {
    const results = [];
    const batchSize = 10;
    const delay = 1000; // 1 second delay between batches

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map((email) =>
        this.sendEmail(email, template, templateData).catch((error) => ({
          success: false,
          email,
          error: error.message,
        })),
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export both the service and templates
export { emailService, emailTemplates };
export default emailService;
