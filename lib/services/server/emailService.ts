const nodemailer = require("nodemailer");

// Configure your email service credentials here
const transporter = nodemailer.createTransport({
  service: "gmail", // Change to your email service (gmail, outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your app password or email password
  },
  // For custom SMTP servers, use:
  // host: process.env.SMTP_HOST,
  // port: parseInt(process.env.SMTP_PORT || "587"),
  // secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASSWORD,
  // },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const buildFromAddress = (): string => {
  const fromName = process.env.EMAIL_FROM_NAME?.trim();
  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    process.env.EMAIL_USER?.trim();

  if (!fromAddress) {
    throw new Error("Missing email sender configuration.");
  }

  if (!fromName) {
    return fromAddress;
  }

  const escapedName = fromName.replace(/"/g, '\\"');
  return `"${escapedName}" <${fromAddress}>`;
};

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const from = buildFromAddress();

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Failed to send email");
  }
}

export async function verifyConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("Email service connected successfully");
    return true;
  } catch (error) {
    console.error("Email service connection failed:", error);
    return false;
  }
}

export async function sendDoctorWelcomeEmail(
  email: string,
  name: string,
  password: string,
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #333; margin: 0;">Welcome to elderycare</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Your doctor account has been created</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #666; line-height: 1.6;">
          Your doctor account has been successfully created in the elderycare system. 
          Below are your login credentials. Please keep them secure and change your password 
          after your first login.
        </p>
      </div>

      <div style="background-color: #f0f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
        <p style="margin: 0 0 10px 0; color: #333;"><strong>Login Credentials:</strong></p>
        <p style="margin: 5px 0; color: #333;">
          <strong>Email:</strong> <code style="background-color: #e8ecf1; padding: 2px 6px; border-radius: 3px;">${email}</code>
        </p>
        <p style="margin: 5px 0; color: #333;">
          <strong>Temporary Password:</strong> <code style="background-color: #e8ecf1; padding: 2px 6px; border-radius: 3px;">${password}</code>
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: #666; line-height: 1.6;">
          Please log in to the elderycare portal and update your password. 
          You can access the system at: <a href="${process.env.APP_URL}/login" style="color: #0066cc; text-decoration: none;">elderycare Login</a>
        </p>
      </div>

      <div style="border-top: 1px solid #ddd; padding-top: 15px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          If you did not create this account or have any questions, please contact the administration team.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to elderycare - Your Account Credentials",
    html,
    text: `Welcome to elderycare\n\nHello ${name},\n\nYour account has been created.\n\nLogin Credentials:\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease log in and change your password immediately.`,
  });
}
