import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // Create server client that reads cookies from the request
    const supabase = await createSupabaseServerClient();

    // Get the currently authenticated user from the cookie session
    const { data: userDataResp, error: userError } = await supabase.auth.getUser();
    const userData = userDataResp?.user;

    if (userError || !userData) {
      return NextResponse.json(
        { user: null, profile: null, error: userError },
        { status: 401 }
      );
    }

    console.log("User:", userData);

    //Fetch the user's profile (RLS will allow only their row)
    const { data: profileData, error: profileError } = await supabase
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
