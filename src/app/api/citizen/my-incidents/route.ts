import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const GET = withUser(async (req: NextRequest, user) => {
    try {
      const supabase = await createSupabaseServerClient()
      const {data, error} = await supabase.from("incidents").select("*").eq("user_id",user?.id)

      if(error){
        return NextResponse.json({status: 400, error: error})
      }

      return NextResponse.json({incidents: data})
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
});
  