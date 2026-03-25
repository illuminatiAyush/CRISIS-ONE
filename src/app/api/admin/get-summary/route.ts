import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const GET = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();

    //Total Verified Agencies Count
    const { count: agenciesCount, error: agenciesError } = await supabase
      .from("agencies")
      .select("id", { count: "exact", head: true })
      .eq("status", "verified");

    if (agenciesError) {
      return NextResponse.json(
        { message: agenciesError.message },
        { status: 400 }
      );
    }

    // Total Critical Incidents Count
    const { count: criticalIncidents, error: criticalError } = await supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("severity_level", "Critical");

    if (criticalError) {
      return NextResponse.json(
        { message: criticalError.message },
        { status: 400 }
      );
    }

    //Total Active Incidents Count
    const { count: activeIncidents, error: activeError } = await supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .in("status", ["Pending", "pending", "In progress", "in progress"]);

    if (activeError) {
      return NextResponse.json(
        { message: activeError.message },
        { status: 400 }
      );
    }

    // Total Volunteers Count
    const { count: volunteersCount, error: volunteerError } = await supabase
      .from("volunteers")
      .select("id", { count: "exact", head: true });

    if (volunteerError) {
      return NextResponse.json(
        { message: volunteerError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        totalActiveIncidents: activeIncidents ?? 0,
        totalCriticalIncidents: criticalIncidents ?? 0,
        totalAgencies: agenciesCount ?? 0,
        totalVolunteers: volunteersCount ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("fetch dashboard stats error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
});
