import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL; 

const isSmtpConfigured = !!(SMTP_HOST && SMTP_PORT && SMTP_PASS && FROM_EMAIL);

if (!isSmtpConfigured) {
  console.warn("WARNING: SMTP environment variables are not set. Email functionality will be disabled.");
}

export const transporter = isSmtpConfigured 
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: FROM_EMAIL,
        pass: SMTP_PASS,
      },
    })
  : null;


export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!transporter) {
    console.warn("WARNING: SMTP transporter is not configured. Email will not be sent to:", to);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return info.response
  } catch (err) {
    console.error("Error sending email:", err);
  }
};
