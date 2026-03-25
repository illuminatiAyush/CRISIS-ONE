import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    // SERVER-SIDE TESTING BYPASS
    const isTestUser = email.endsWith("@gmail.com");
    
    // Server client for standard operations
    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = await createAdmin();

    if (isTestUser) {
      console.log(`[TEST BYPASS] Processing login for ${email} with role ${role}`);
      
      // 1. Check if profile exists
      let { data: profile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      // 2. If no profile, auto-create a verified test profile
      if (!profile) {
        console.log(`[TEST BYPASS] Creating auto-verified profile for ${email}`);
        const { data: newProfile, error: createErr } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: crypto.randomUUID(), // Dummy ID for test bypass
            email,
            role: role || "citizen",
            verified: true,
            full_name: email.split('@')[0],
          })
          .select()
          .single();

        if (createErr) {
          console.error("[TEST BYPASS] Profile creation failed:", createErr);
          return NextResponse.json({ error: "Failed to create test profile" }, { status: 500 });
        }
        profile = newProfile;
      }

      // 3. Return successful response with "Test Bypass" cookies
      const response = NextResponse.json({
        message: "Login successful (Test Bypass)",
        user: { email, id: profile.id, role: profile.role },
        profile: profile
      });

      // Use a special identifiable token for the middleware
      const testToken = `test-session-${Buffer.from(JSON.stringify({ email, id: profile.id, role: profile.role })).toString('base64')}`;

      response.cookies.set("sb-access-token", testToken, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    // --- STANDARD LOGIN FLOW (for non-test users) ---
    
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

    // Sign in using server client
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
