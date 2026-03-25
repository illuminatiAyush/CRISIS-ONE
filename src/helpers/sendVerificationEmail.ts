import { resend } from "@/lib/resend";
import { verificationEmailHtml } from "../../emails/verificationEmail";
import { sendEmail } from "@/lib/email";

export async function sendVerificationEmail(
    email: string,
    verifyCode: string
): Promise<any> {
    try {
        await sendEmail({
            to: email,
            subject: 'CrisisOne | verification Code',
            html: verificationEmailHtml(verifyCode),
        });
        return {
            success: true,
            message: "verification code send successfully"
        }
    } catch (emailError) {
        console.error("Error sending verification email ", emailError)
        return {
            success: false,
            message: "Failed to send verification code"
        }
    }
}
