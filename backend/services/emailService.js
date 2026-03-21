const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");

// Load env explicitly from backend/.env to avoid CWD issues
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const SENDER_NAME = process.env.EMAIL_SENDER_NAME || 'Department of Computer Science, Gujarat University';

// Create transporter for nodemailer
const createTransporter = () => {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_SERVICE,
    EMAIL_USERNAME,
    EMAIL_PASSWORD,
  } = process.env;

  // Debug: Check what's actually being loaded
  console.log('[emailService] ENV Variables:', {
    EMAIL_HOST: EMAIL_HOST || 'not set',
    EMAIL_PORT: EMAIL_PORT || 'not set',
    EMAIL_SECURE: EMAIL_SECURE || 'not set',
    EMAIL_USERNAME: EMAIL_USERNAME ? '***' : 'MISSING',
    EMAIL_PASSWORD: EMAIL_PASSWORD ? '***' : 'MISSING'
  });

  // Validate required credentials
  if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
    console.error('[emailService] ERROR: Email credentials missing!');
    throw new Error('Email credentials not configured. Check your .env file');
  }

  if (EMAIL_HOST) {
    const transport = {
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      secure: EMAIL_SECURE === 'true',
      auth: { 
        user: EMAIL_USERNAME, 
        pass: EMAIL_PASSWORD 
      },
    };
    console.log(`[emailService] Using custom SMTP host ${transport.host}:${transport.port} secure=${transport.secure}`);
    return nodemailer.createTransport(transport);
  }

  if (EMAIL_SERVICE) {
    console.log(`[emailService] Using service ${EMAIL_SERVICE}`);
    return nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: { 
        user: EMAIL_USERNAME, 
        pass: EMAIL_PASSWORD 
      },
    });
  }

  // Fallback to Gmail defaults with explicit settings
  console.log('[emailService] Using Gmail SMTP with TLS');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: { 
      user: EMAIL_USERNAME, 
      pass: EMAIL_PASSWORD 
    },
  });
};

// Generate unsubscribe token
const generateUnsubscribeToken = (email) => {
  const secret = process.env.NEWSLETTER_SUBSCRIBE_SECRET;
  return crypto.createHmac("sha256", secret).update(email).digest("hex");
};

// Send subscription confirmation email
const sendConfirmationEmail = async (email, unsubscribeLink) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${SENDER_NAME}" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Welcome to the Placement Updates – Department of Computer Science, Gujarat University",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Placement Updates</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Department of Computer Science</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 14px;">Gujarat University</p>
    </div>
    <div style="padding: 30px 20px; text-align: center;">
      <h2 style="color: #1f2937; margin-bottom: 15px;">You're subscribed to placement updates</h2>
      <p style="color: #6b7280; line-height: 1.6; margin: 0;">
        Thank you for subscribing. You'll now receive information about job opportunities, placement activities, and career resources from the Department of Computer Science, Gujarat University.
      </p>
      <div style="margin: 30px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Open Placement Portal
        </a>
      </div>
    </div>
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #6b7280; margin: 0 0 15px; font-size: 14px;">
        You're receiving this email because you signed up for updates from the Department of Computer Science, Gujarat University.
      </p>
      <div style="margin-bottom: 15px;">
        <a href="${unsubscribeLink}" style="color: #ef4444; text-decoration: none; font-size: 14px;">
          Unsubscribe from our updates
        </a>
      </div>
      <p style="color: #9ca3af; margin: 0; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Department of Computer Science, Gujarat University. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return false;
  }
};

// Send newsletter to all subscribers
const sendBulkNewsletter = async (
  subscribers,
  subject,
  content,
  unsubscribeLinkGenerator
) => {
  const transporter = createTransporter();

  for (const subscriber of subscribers) {
    const unsubscribeLink = unsubscribeLinkGenerator(subscriber.email);

    const mailOptions = {
      from: `"${SENDER_NAME}" <${process.env.EMAIL_USERNAME}>`,
      to: subscriber.email,
      subject: subject,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Placement Update – Department of Computer Science, Gujarat University</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 25px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">Department of Computer Science</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 13px;">Gujarat University</p>
    </div>
    <div style="padding: 30px 20px;">
      ${content}
    </div>
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #6b7280; margin: 0 0 15px; font-size: 14px;">You're receiving this email because you subscribed to placement updates.</p>
      <a href="${unsubscribeLink}" style="color: #ef4444; text-decoration: none; font-size: 14px;">
        Unsubscribe
      </a>
      <p style="color: #9ca3af; margin: 15px 0 0; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Department of Computer Science, Gujarat University.
      </p>
    </div>
  </div>
</body>
</html>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Newsletter sent to ${subscriber.email}`);
    } catch (error) {
      console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
    }
  }
};

// Send a generic email to a list of recipients
const sendBulkEmail = async (emails, subject, html) => {
  try {
    const transporter = createTransporter();
    
    console.log(`[emailService] Preparing to send to ${emails?.length || 0} recipients. Subject: ${subject}`);
    
    // Verify connection first
    try {
      await transporter.verify();
      console.log('[emailService] ✅ SMTP connection verified successfully');
    } catch (verifyErr) {
      console.error('[emailService] ❌ SMTP verification failed:', verifyErr.message);
      throw verifyErr;
    }
    
    let sent = 0;
    const failures = [];
    
    for (const to of emails) {
      const mailOptions = {
        from: `"${SENDER_NAME}" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html,
      };

      try {
        console.log(`[emailService] Sending email to ${to}`);
        await transporter.sendMail(mailOptions);
        sent += 1;
        console.log(`[emailService] ✅ Email sent to ${to}`);
      } catch (error) {
        console.error(`❌ Failed to send to ${to}:`, error.message);
        failures.push({ to, error: String(error?.message || error) });
      }
    }
    
    const summary = { sent, failed: failures.length, failures };
    console.log(`[emailService] 📊 Delivery summary: sent=${summary.sent} failed=${summary.failed}`);
    return summary;
  } catch (error) {
    console.error('[emailService] ❌ Bulk email sending failed:', error);
    throw error;
  }
};

// Test email function
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is properly configured');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};

module.exports = {
  generateUnsubscribeToken,
  sendConfirmationEmail,
  sendBulkNewsletter,
  sendBulkEmail,
  testEmailConnection,
  createTransporter
};