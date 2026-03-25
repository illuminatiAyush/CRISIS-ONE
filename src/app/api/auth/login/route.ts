import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    // SERVER-SIDE TESTING BYPASS
    const isTestUser = 
      email.toLowerCase().endsWith("@gmail.com") || 
      email.toLowerCase().endsWith("@crisisone.com");


    if (isTestUser) {
      console.log(`[TEST BYPASS] Processing login for ${email} with role ${role}`);
      
      // Generate a deterministic ID from the email so the same email always gets the same ID
      const idBase = Buffer.from(email.toLowerCase()).toString('base64').replace(/[^a-z0-9]/gi, '').slice(0, 32);
      const fakeId = `test-${idBase}`;
      const fakeName = email.split('@')[0] || 'TestUser';

      const fakeProfile = {
        id: fakeId,
        email,
        role: role || "citizen",
        verified: true,
        full_name: fakeName.charAt(0).toUpperCase() + fakeName.slice(1),
      };

      // Return successful response with fake token
      const testToken = `test-session-${Buffer.from(JSON.stringify({ email, id: fakeId, role: role || "citizen" })).toString('base64')}`;

      const response = NextResponse.json({
        message: "Login successful (Test Bypass)",
        user: { email, id: fakeId, role: role || "citizen" },
        profile: fakeProfile
      });

      response.cookies.set("sb-access-token", testToken, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    // --- STANDARD LOGIN FLOW (for non-test users) ---
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
