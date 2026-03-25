import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = await createAdmin();

    // Check if email already exists in any role table
    const volunteerCheck = await supabase.from("volunteers").select("id, user_id").eq("email", email).maybeSingle();
    const coordinatorCheck = await supabase.from("coordinators").select("id, user_id").eq("email", email).maybeSingle();

    // If already added by agency, enforce same role
    if (volunteerCheck.data && role !== "volunteer") {
      return NextResponse.json({ error: "Role mismatch: Already added as volunteer", status: "ROLE_MISMATCH" }, { status: 400 });
    }
    if (coordinatorCheck.data && role !== "coordinator") {
      return NextResponse.json({ error: "Role mismatch: Already added as coordinator", status: "ROLE_MISMATCH" }, { status: 400 });
    }

    // Check if auth user exists
    const listUsersResponse = await supabaseAdmin?.auth.admin.listUsers();
    const users =
      listUsersResponse && "data" in listUsersResponse && Array.isArray((listUsersResponse.data as any).users)
        ? (listUsersResponse.data as any).users
        : [];
    const authUser = users.find((u: any) => u.email === email);

    if (!authUser) {
      // Auth user not found → prompt registration via email
      return NextResponse.json({ error: "Auth user not found", status: 404 });
    }

    const userId = authUser.id;

    // Check if profile exists
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();

    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = () => new Date(Date.now() + 10 * 60 * 1000);

    // CASE A: Profile does NOT exist → create profile
    if (!profile) {
      const verifyCode = generateOTP();
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          role,
          otp: verifyCode,
          otp_expires_at: expiresAt(),
          verified: false,
        })
        .select()
        .single();

      if (error || !newProfile) {
        return NextResponse.json({ error: "Failed to create profile", details: error }, { status: 500 });
      }

      //Link profile to role table if email already exists in volunteer/coordinator table
      if (volunteerCheck.data) await supabase.from("volunteers").update({ user_id: newProfile.id }).eq("email", email);
      if (coordinatorCheck.data) await supabase.from("coordinators").update({ user_id: newProfile.id }).eq("email", email);

      await sendVerificationEmail(email, verifyCode);
      return NextResponse.json({ message: "OTP sent to email", status: "NEW_PROFILE" });
    }

    // CASE B: Profile exists and verified → user should login
    if (profile.verified) {
      return NextResponse.json({ error: "User already verified. Please login.", status: "ALREADY_VERIFIED" }, { status: 409 });
    }

    // CASE C: Profile exists but NOT verified → handle OTP
    const now = new Date();
    const otpExpired = !profile.otp_expires_at || new Date(profile.otp_expires_at) < now;
    const otpNotExpired = profile.otp_expires_at && new Date(profile.otp_expires_at) > now;

    if (otpExpired) {
      const verifyCode = generateOTP();
      await supabase.from("profiles").update({ otp: verifyCode, otp_expires_at: expiresAt(), role }).eq("id", userId);
      await sendVerificationEmail(email, verifyCode);
      return NextResponse.json({ message: "OTP regenerated and sent", status: "OTP_SENT" });
    }

    if (otpNotExpired) {
      await sendVerificationEmail(email, profile.otp);
      return NextResponse.json({ message: "OTP resent", status: "OTP_RESENT" });
    }

    return NextResponse.json({ error: "Unexpected case" }, { status: 500 });
  } catch (err) {
    console.error("Create Profile Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
