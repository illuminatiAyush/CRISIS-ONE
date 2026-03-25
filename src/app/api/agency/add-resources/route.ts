import { NextRequest, NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/helpers/uploadImage";
import { saveTempFile, deleteTempFile } from "@/helpers/uploadTemp";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const POST = withUser(async (req: NextRequest, user) => {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
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
        console.warn("UNAUTHORIZED ROLE:", profileData.role);
        return NextResponse.json(
          { message: "You are not eligible" },
          { status: 403 }
        );
      }

      const body = await req.json();
      const { name, count, price_of_each } = body;
  
      if (!name || Number(count) <= 0 || Number(price_of_each) <= 0) {
        console.warn("INVALID INPUT:", body);
        return NextResponse.json(
          { message: "Invalid input data" },
          { status: 400 }
        );
      }

      const { data: agencyData, error: agencyError } = await supabase
        .from("agencies")
        .select("*")
        .eq("user_id", profileData.id)
        .single();
  
      if (agencyError || !agencyData) {
        console.error("AGENCY FETCH ERROR:", agencyError);
        return NextResponse.json(
          { message: "Agency not found" },
          { status: 404 }
        );
      }

      const { data: resourceData, error: resourceError } = await supabase
        .from("resources")
        .insert({
          name,
          count: Number(count),
          price_of_each: parseFloat(price_of_each),
          currentCount: Number(count),
          total_price: Number(count) * parseFloat(price_of_each),
          agency_id: agencyData.id,
        })
        .select("*")
        .single();
  
      if (resourceError || !resourceData) {
        console.error("RESOURCE INSERT ERROR:", {
          error: resourceError,
          payload: {
            name,
            count,
            price_of_each,
            agency_id: agencyData.id,
          },
        });
  
        return NextResponse.json(
          { message: "Failed to create resource" },
          { status: 500 }
        );
      }
  
      const updatedResources = [
        ...(agencyData.resources ?? []),
        resourceData.id,
      ];
  
      const { error: updateAgencyError } = await supabase
        .from("agencies")
        .update({ resources: updatedResources })
        .eq("id", agencyData.id);
  
      if (updateAgencyError) {
        console.error("AGENCY UPDATE ERROR:", updateAgencyError);
  
        return NextResponse.json(
          { message: "Failed to update agency resources" },
          { status: 500 }
        );
      }

      console.info("RESOURCE CREATED:", {
        resourceId: resourceData.id,
        agencyId: agencyData.id,
      });
  
      return NextResponse.json(
        { message: "Resource created successfully" },
        { status: 201 }
      );
    } catch (err) {
      console.error("UNHANDLED ERROR:", err);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  });
  
