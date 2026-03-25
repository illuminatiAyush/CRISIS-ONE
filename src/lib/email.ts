import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL; 

if (!SMTP_HOST || !SMTP_PORT || !SMTP_PASS || !FROM_EMAIL) {
  throw new Error("SMTP environment variables are not set!");
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: FROM_EMAIL,
    pass: SMTP_PASS,
  },
});


export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
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
