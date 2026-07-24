const nodemailer = require("nodemailer");

/**
 * Helper to get configured nodemailer transporter.
 * Handles space stripping from password automatically.
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  let pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  // Strip any whitespace characters from the password
  pass = pass.replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass
    }
  });
};

/**
 * Sends a login OTP email to the user.
 * Falls back to logging the OTP to the console if SMTP environment variables are not configured.
 * 
 * @param {string} email - Recipient email address
 * @param {string} otp - The 6-digit OTP code to send
 * @returns {Promise<boolean>}
 */
const sendOTPEmail = async (email, otp) => {
  const transporter = getTransporter();

  // Fallback if email configurations are not set
  if (!transporter) {
    console.log("\n==================================================");
    console.log(`[DEV MODE] OTP Generated for ${email}: ${otp}`);
    console.log("==================================================\n");
    return true;
  }

  const user = process.env.EMAIL_USER;
  const mailOptions = {
    from: `"LMS Authentication" <${user}>`,
    to: email,
    subject: "Your LMS Login OTP Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">LMS Portal Access</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Secure verification code</p>
        </div>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">You requested a One-Time Password (OTP) to log in to your account. Please use the verification code below to complete your login process:</p>
        <div style="text-align: center; margin: 35px 0;">
          <span style="display: inline-block; font-size: 38px; font-weight: 800; color: #4f46e5; background-color: #f5f3ff; padding: 12px 30px; border-radius: 10px; letter-spacing: 6px; border: 2px solid #ddd6fe;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #dc2626; font-weight: 600; margin-bottom: 25px;">Note: This verification code is valid for 5 minutes only.</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you did not request this login code, you can safely ignore this email. Your account remains secure.</p>
        <div style="margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
          This is an automated security email from the Learning Management System. Please do not reply to this message.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[OTP] Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("[OTP] Failed to send email via SMTP:", error.message);
    console.log("\n==================================================");
    console.log(`[FALLBACK] OTP for ${email} is: ${otp}`);
    console.log("==================================================\n");
    return false;
  }
};

/**
 * Sends a welcome email to a newly registered user.
 * 
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient's name
 * @returns {Promise<boolean>}
 */
const sendWelcomeEmail = async (email, name) => {
  const transporter = getTransporter();

  // Fallback if email configurations are not set
  if (!transporter) {
    console.log("\n==================================================");
    console.log(`[DEV MODE] Welcome Email triggered for ${name} (${email})`);
    console.log("==================================================\n");
    return true;
  }

  const user = process.env.EMAIL_USER;
  const mailOptions = {
    from: `"LMS Team" <${user}>`,
    to: email,
    subject: "Welcome to the Learning Management System!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to LMS!</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 15px;">Your journey to knowledge begins here.</p>
        </div>
        
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">
          We are thrilled to welcome you to our Learning Management System (LMS) platform! Whether you're here to acquire new skills as a student or share your expertise as an instructor, we're committed to providing you with the best learning and teaching experience.
        </p>
        
        <div style="background: linear-gradient(135deg, #f5f3ff 0%, #edd9ff 100%); padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #ddd6fe;">
          <h3 style="margin-top: 0; color: #4f46e5; font-size: 16px; font-weight: 700;">Here's how to get started:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
            <li>Explore our wide selection of high-quality courses.</li>
            <li>Track your learning progress dynamically.</li>
            <li>Interact with instructors and peers directly.</li>
            <li>Access courses anytime, anywhere.</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/frontend/index.html" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); transition: background-color 0.2s;">
            Go to LMS Dashboard
          </a>
        </div>
        
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          If you have any questions, feel free to contact our support team. We're here to help you every step of the way.
        </p>
        
        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 25px;">
          Best Regards,<br>
          <strong>The LMS Team</strong>
        </p>
        
        <div style="margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
          This email was sent to ${email} because you created an account on our platform.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[WELCOME] Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("[WELCOME] Failed to send welcome email via SMTP:", error.message);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
