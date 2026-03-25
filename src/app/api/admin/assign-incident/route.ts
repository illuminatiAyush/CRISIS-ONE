import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const POST = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();

    // Authorization
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { message: "You are not eligible for this functionality." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Convert & validate incident_id
    const incident_id = Number(body.incident_id);
    const agency_ids: string[] = body.agency_ids;

    if (
      !Number.isInteger(incident_id) ||
      incident_id <= 0 ||
      !Array.isArray(agency_ids) ||
      agency_ids.length === 0
    ) {
      return NextResponse.json(
        { message: "Valid Incident ID and Agency IDs array are required." },
        { status: 400 }
      );
    }

    // Fetch incident
    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .select("id, agencies_assigned")
      .eq("id", incident_id)
      .single();

    if (incidentError || !incident) {
      return NextResponse.json(
        { message: "Incident not found." },
        { status: 404 }
      );
    }

    // Validate agencies (bulk check)
    const { data: agencies, error: agenciesError } = await supabase
      .from("agencies")
      .select("id")
      .in("id", agency_ids);

    if (agenciesError || !agencies || agencies.length !== agency_ids.length) {
      return NextResponse.json(
        { message: "One or more agencies are invalid." },
        { status: 404 }
      );
    }

    // Existing agencies (ensure array)
    const existingAgencies: string[] = Array.isArray(incident.agencies_assigned)
      ? incident.agencies_assigned
      : [];

    // Merge + dedupe
    const updatedAgencies = Array.from(
      new Set([...existingAgencies, ...agency_ids])
    );

    // Update incident
    const { data: updatedIncident, error: updateError } = await supabase
      .from("incidents")
      .update({
        status: "in progress",
        agencies_assigned: updatedAgencies,
      })
      .eq("id", incident_id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          message: "Failed to assign agencies to incident.",
          error: updateError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Agencies assigned successfully.",
        incident: updatedIncident,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("assign incident error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
});
