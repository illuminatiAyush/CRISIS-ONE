import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    // --- TEST BYPASS: return fake profile without any DB call ---
    if (token?.startsWith("test-session-")) {
      try {
        const payloadBase64 = token.replace("test-session-", "");
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
        console.log("[TEST BYPASS] Recognized session for:", decoded.email);

        const fakeName = (decoded.email?.split('@')[0] || 'TestUser');
        const fakeProfile = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || "citizen",
          verified: true,
          full_name: fakeName.charAt(0).toUpperCase() + fakeName.slice(1),
        };

        return NextResponse.json({
          user: { id: decoded.id, email: decoded.email },
          profile: fakeProfile,
          status: 200
        });
      } catch (e) {
        return NextResponse.json(
          { user: null, profile: null, error: "Invalid test token" },
          { status: 401 }
        );
      }
    }

    // --- STANDARD FLOW for real users ---
    const supabase = await createSupabaseServerClient();
    const { data: userDataResp, error: userError } = await supabase.auth.getUser();
    const userData = userDataResp?.user;

    if (userError || !userData) {
      return NextResponse.json(
        { user: null, profile: null, error: userError },
        { status: 401 }
      );
    }

    console.log("User:", userData);

    const supabaseAdmin = createAdmin();
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userData.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { user: userData, profile: null, error: profileError },
        { status: 500 }
      );
    }

    console.log("Profile:", profileData);

    return NextResponse.json({ user: userData, profile: profileData, status: 200 });
  } catch (err) {
    console.error("GET user/profile error:", err);
    return NextResponse.json(
      { user: null, profile: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
