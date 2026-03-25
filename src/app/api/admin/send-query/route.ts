import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import transporter from "@/lib/nodemailer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export const POST = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify Admin Role via Profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error in send-query:", profileError);
      return NextResponse.json(
        { message: "Unauthorized: Profile not found" },
        { status: 403 }
      );
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { agencyEmail, message, agencyName } = await req.json();

    if (!agencyEmail || !message) {
      return NextResponse.json(
        { message: "Email and message are required" },
        { status: 400 }
      );
    }

    // 2. Send Email via Nodemailer
    try {
      await sendEmail({
        to: agencyEmail,
        subject: `Query from Admin regarding ${agencyName || "Agency Registration"}`,
        html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #2563eb;">CrisisOne Admin Query</h2>
                        <p>Dear ${agencyName || "Agency Representative"},</p>
                        <p>You have received a query regarding your registration with CrisisOne.</p>
                        
                        <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                            <strong>Message:</strong><br/>
                            ${message.replace(/\n/g, "<br/>")}
                        </div>

                        <p>Please reply to this email directly to address the query.</p>
                        <br/>
                        <p style="font-size: 12px; color: #666;">
                            Best regards,<br/>
                            CrisisOne Administration Team
                        </p>
                    </div>
                `,
      });

      return NextResponse.json(
        { success: true, message: "Email sent successfully" },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error("Nodemailer send error:", emailError);
      return NextResponse.json(
        {
          message: "Failed to send email. Please check SMTP configuration.",
          details: emailError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("send query error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
});
