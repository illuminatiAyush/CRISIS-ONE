import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    //Server client reads HTTP-only cookies (will be empty on login)
    const supabase = await createSupabaseServerClient();

    // Fetch profile first
    const { data: profileData, error: profileError } = await supabase
      ?.from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!profileData.verified) {
      return NextResponse.json({ error: "OTP not verified" }, { status: 401 });
    }

    // 2Sign in using server client
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !loginData.session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { access_token, refresh_token, expires_at } = loginData.session;

    // Set HTTP-only cookies
    const response = NextResponse.json({
      message: "Login successful",
      user: loginData.user,
      profile: profileData
    });

    response.cookies.set("sb-access-token", access_token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_at ? expires_at - Math.floor(Date.now() / 1000) : 60 * 60, // fallback 1h
    });

    response.cookies.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
