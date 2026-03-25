import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    const supabaseAdmin = await createAdmin();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    //  Fetch profile
    const profile = await supabaseAdmin
      ?.from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profile?.error || !profile?.data) {
      return NextResponse.json(
        {
          error: "Profile not found",
          action: "REGISTER_AGAIN",
        },
        { status: 404 }
      );
    }

    //  Already verified
    if (profile?.data.verified) {
      return NextResponse.json(
        {
          error: "Account already verified",
          action: "LOGIN",
        },
        { status: 409 }
      );
    }

    //  OTP mismatch
    if (profile?.data.otp !== otp) {
      return NextResponse.json(
        {
          error: "Invalid OTP",
          action: "RETRY",
        },
        { status: 401 }
      );
    }

    //  OTP expired
    const now = new Date();
    const expiry = new Date(profile?.data.otp_expires_at);

    if (expiry < now) {
      return NextResponse.json(
        {
          error: "OTP expired",
          action: "REGISTER_AGAIN",
        },
        { status: 410 }
      );
    }

    //  Mark verified
    const update = await supabaseAdmin
      ?.from("profiles")
      .update({
        verified: true,
        otp: null,
        otp_expires_at: null,
      })
      .eq("id", profile?.data.id);
    if (update?.error) {
      return NextResponse.json(
        { error: "Failed to verify account" },
        { status: 500 }
      );
    }

    //  Success
    return NextResponse.json(
      {
        message: "OTP verified successfully",
        action: "LOGIN",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
