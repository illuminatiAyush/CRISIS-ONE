import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const GET = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();

    //Read query param: /api/agencies?id=xxxx
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("id");

    //CASE 1: if id is present -> fetch specific agency (full data)
    if (agencyId) {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .single();

      if (error) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ data }, { status: 200 });
    }

    //sCASE 2: no id -> fetch all agencies (limited fields)
    const { data, error } = await supabase
      .from("agencies")
      .select("id, agency_name, status, agency_address, agency_type, city, state, team_size");

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("fetch agencies error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
});
