import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const POST = withUser(async (req: NextRequest, user) => {
    try {
        const supabase = await createSupabaseServerClient();

        // Fetch user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            console.error("Profile fetch error in admin route:", profileError);
            return NextResponse.json({ message: "Unauthorized: Profile not found" }, { status: 403 });
        }

        // Ensure user is admin
        if (profile.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 });
        }

        const { agencyId, status, rejectionReason } = await req.json();

        if (!agencyId || !status) {
            return NextResponse.json({ message: "Agency ID and Status are required" }, { status: 400 });
        }

        // If rejecting, we need the agency email
        if (status === 'rejected') {
            const { data: agencyData, error: fetchError } = await supabase
                .from("agencies")
                .select("agency_email, agency_name")
                .eq("id", agencyId)
                .single();

            if (!fetchError && agencyData?.agency_email) {
                // Send Rejection Email
                try {
                    const transporter = (await import('@/lib/nodemailer')).default;
                    if (transporter) {
                        await transporter.sendMail({
                        from: process.env.SMTP_USER,
                        to: agencyData.agency_email,
                        subject: `Agency Registration Update: ${agencyData.agency_name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h2>Application Update</h2>
                                <p>Hello <strong>${agencyData.agency_name}</strong>,</p>
                                <p>We regret to inform you that your agency registration for CrisisOne has been <strong>rejected</strong>.</p>
                                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <strong style="color: #991b1b;">Reason for Rejection:</strong>
                                    <p style="margin-top: 5px;">${rejectionReason || "Requirements not met."}</p>
                                </div>
                                <p>You may log in to the dashboard to correct your details and re-submit your application.</p>
                                <p>Best Regards,<br>CrisisOne Admin Team</p>
                            </div>
                        `
                    });
                    }
                } catch (emailError) {
                    console.error("Failed to send rejection email:", emailError);
                    // We continue even if email fails, or we could return error.
                    // Let's continue but log it.
                }
            } else {
                console.warn("Could not find agency email for rejection notification.", fetchError);
            }
        }

        const { error } = await supabase
            .from("agencies")
            .update({ status: status })
            .eq("id", agencyId);

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, message: `Agency status updated to ${status}` }, { status: 200 });
    } catch (error) {
        console.error("update status error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
});
