import { NextRequest, NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/helpers/uploadImage";
import { saveTempFile, deleteTempFile } from "@/helpers/uploadTemp";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const GET = withUser(async (_req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("PROFILE FETCH ERROR:", profileError);
      return NextResponse.json(
        { message: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (profileData.role !== "agency") {
      console.warn("UNAUTHORIZED ACCESS:", profileData.role);
      return NextResponse.json(
        { message: "You are not eligible" },
        { status: 403 }
      );
    }

    const { data: agencyData, error: agencyError } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", profileData.id)
      .single();

    if (agencyError || !agencyData) {
      console.error("AGENCY FETCH ERROR:", agencyError);
      return NextResponse.json(
        { message: "Agency not found" },
        { status: 404 }
      );
    }

    const { data: resources, error: resourcesError } = await supabase
      .from("resources")
      .select(
        `
        id,
        name,
        count,
        currentCount,
        price_of_each,
        total_price,
        created_at
      `
      )
      .eq("agency_id", agencyData.id)
      .order("created_at", { ascending: false });

    if (resourcesError) {
      console.error("RESOURCES FETCH ERROR:", resourcesError);
      return NextResponse.json(
        { message: "Failed to fetch resources" },
        { status: 500 }
      );
    }

    return NextResponse.json({ resources }, { status: 200 });
  } catch (err) {
    console.error("UNHANDLED ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});
