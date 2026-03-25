import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// @ts-ignore
export const GET = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: incidents, error } = await supabase
      .from("incidents")
      .select("*");
    if (error)
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    console.log("incidents ", incidents);
    return NextResponse.json({
      message: "Successfully fetched incidents ",
      incidents,
      status: 200,
    });
  } catch (error) {
    console.log("citizen/ ", error);
    NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
