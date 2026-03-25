import { Incident } from "@/types/incident.type";
import { NextRequest, NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/helpers/uploadImage";
import { saveTempFile, deleteTempFile } from "@/helpers/uploadTemp";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const validateIncident = (data: Incident) => {
  const { category, description, lat, lng, severity_level } = data;

  if (!category || !description || !lat || !lng || !severity_level) {
    return { valid: false, error: "Please fill all required fields" };
  }

  const latNum = parseFloat(lat as string);
  const lngNum = parseFloat(lng as string);
  const estimatedNum = data.estimated_people_affected
    ? parseInt(data.estimated_people_affected as string)
    : null;

  if (isNaN(latNum) || isNaN(lngNum)) {
    return { valid: false, error: "Latitude and longitude must be numbers" };
  }

  return {
    valid: true,
    data: {
      ...data,
      lat: latNum,
      lng: lngNum,
      estimated_people_affected: estimatedNum,
    },
  };
};

export const POST = withUser(async (req: NextRequest, user) => {
  try {
    console.log("user ",user)
    const supabase = await createSupabaseServerClient()
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;
    const severity_level = formData.get("severity_level") as string;
    const estimated_people_affected = formData.get(
      "estimated_people_affected"
    ) as string | null;

    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "Please provide an image" },
        { status: 400 }
      );
    }

    const { valid, data, error } = validateIncident({
      category,
      description,
      lat,
      lng,
      severity_level,
      estimated_people_affected: estimated_people_affected!,
    });

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Convert File - Buffer

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempPath = await saveTempFile(buffer, image.name);

    const img_url = await uploadImageToSupabase(
      tempPath,
      `incident_${Date.now()}.jpg`,
      "incidents"
    );

    await deleteTempFile(tempPath);

    const incident: Incident = {
      user_id: user.id,
      category: data?.category,
      description: data?.description!,
      lat: data?.lat!,
      lng: data?.lng!,
      severity_level: data?.severity_level!,
      estimated_people_affected: data?.estimated_people_affected ?? undefined,
      agencies_assigned: [],
      status: "pending",
      img_url: img_url?.data?.publicUrl,
      created_at: new Date(),
    };

    const {data: incidentRes, error: incidentError} = await supabase.from("incidents").insert(incident)

    console.log("incident ",incidentRes, "Error ",incidentError)

    if(incidentError) return NextResponse.json({ error: "Server error" }, { status: 500 });


    return NextResponse.json(
      { message: "Incident created", incident },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
