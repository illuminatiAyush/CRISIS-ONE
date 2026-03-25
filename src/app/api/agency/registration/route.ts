import { Incident } from "@/types/incident.type";
import { NextRequest, NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/helpers/uploadImage";
import { saveTempFile, deleteTempFile } from "@/helpers/uploadTemp";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// agency types
type AgencyType =
  | "Government"
  | "Healthcare Responder"
  | "NGO"
  | "Volunteer Organization"
  | "Infrastructure Team";

type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved";

const isValidPinCode = (pin?: string) => !!pin && /^[0-9]{6}$/.test(pin);

const isValidPAN = (pan?: string) =>
  !!pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

const isValidGST = (gst?: string) =>
  !!gst && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst);

const requiredFieldsCheck = (body: any, fields: string[]) => {
  return fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ""
  );
};

const getAgencyRequirements = (type: AgencyType) => {
  const base = [
    "agency_name",
    "agency_description",
    "agency_address",
    "city",
    "state",
    "pin_code",
    "services_offered",
    "team_size",
  ];

  switch (type) {
    case "NGO":
      return {
        required: [
          ...base,
          "pan",
          "ngo_darpan_id",
          "registration_certificate_url",
        ],
        validate: ["PAN"],
      };

    case "Volunteer Organization":
      return {
        required: [...base],
        validate: [],
      };

    case "Healthcare Responder":
      return {
        required: [...base, "clinic_license_url"],
        validate: ["GST_OPTIONAL"],
      };

    case "Infrastructure Team":
      return {
        required: [...base, "gst", "business_reg_url"], // strict for infra
        validate: ["GST"],
      };

    case "Government":
      return {
        required: [...base],
        validate: [],
      };

    default:
      return { required: base, validate: [] };
  }
};

// validation only for SUBMITTED forms
const validateSubmittedApplication = (body: any) => {
  const errors: string[] = [];

  if (!body.agency_type) {
    errors.push("agency type is required");
  }

  const { required, validate } = getAgencyRequirements(body.agency_type);

  const missing = requiredFieldsCheck(body, required);

  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(", ")}`);
  }

  if (!isValidPinCode(body.pin_code)) {
    errors.push("pin code must be a valid 6 digit value");
  }

  if (validate.includes("PAN") && !isValidPAN(body.pan)) {
    errors.push("PAN format is invalid");
  }

  if (validate.includes("GST") && !isValidGST(body.gst)) {
    errors.push("GST format is invalid");
  }

  if (validate.includes("GST_OPTIONAL") && body.gst && !isValidGST(body.gst)) {
    errors.push("GST format is invalid");
  }
  return errors;
};

async function uploadDocIfPresent(
  file: File | null,
  folder: string,
  user: any
) {
  if (!file) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1) save file in temp
  const tempPath = await saveTempFile(buffer);

  try {
    const url = await uploadImageToSupabase(
      tempPath,
      `${user.id}-${file.name}-${new Date()}`,
      folder
    );

    return url?.data?.publicUrl;
  } catch (error) {
    await deleteTempFile(tempPath);
    throw error;
  } finally {
    await deleteTempFile(tempPath);
  }
}

function getStoragePathFromUrl(fileUrl: string) {
  // Example URL:
  // https://xxxx.supabase.co/storage/v1/object/public/agency_docs/ngo/123.png

  const parts = fileUrl.split("/storage/v1/object/public/");
  if (parts.length < 2) return null;

  return parts[1];
  // returns: "agency_docs/ngo/123.png"
}

async function deleteFileByPublicUrl(supabase: any, fileUrl: string) {
  const storagePath = getStoragePathFromUrl(fileUrl);
  if (!storagePath) return;

  // bucket name is first part before "/"
  const [bucketName, ...restPath] = storagePath.split("/");
  const filePath = restPath.join("/");

  if (!bucketName || !filePath) return;

  await supabase.storage.from(bucketName).remove([filePath]);
}

async function checkIfExists(
  supabase: any,
  field: string,
  value: string,
  userId: string,
  label: string
) {
  const { data, error } = await supabase
    .from("agencies")
    .select("id")
    .eq(field, value)
    .neq("user_id", userId)
    .limit(1);

  if (error) {
    throw new Error(`DB error while checking ${label}`);
  }

  if (data && data.length > 0) {
    return `${label} already exists`;
  }

  return null;
}

export const GET = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: agency, error } = await supabase
      .from("agencies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(error);
      return NextResponse.json(
        { error: "Database error", message: error.message },
        { status: 500 }
      );
    }

    if (!agency) {
      return NextResponse.json({
        status: "unregistered",
        agency: null,
      });
    }

    return NextResponse.json({
      status: agency.status, // "draft" | "submitted" | "approved" | "rejected"
      agency: agency,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});

export const POST = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();
    const formData = await req.formData();

    const isDraft =
      String(formData.get("isDraft") ?? "true").toLowerCase() === "true";

    const agencyPayload: Record<string, any> = {
      user_id: user.id,
      agency_description: String(formData.get("agency_description") ?? ""),
      agency_name: String(formData.get("agency_name") ?? ""),
      agency_address: String(formData.get("agency_address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      pin_code: String(formData.get("pin_code") ?? ""),
      services_offered: String(formData.get("services_offered") ?? "").split(
        ", "
      ),
      team_size: formData.get("team_size")
        ? Number(formData.get("team_size"))
        : null,
      agency_type: String(formData.get("agency_type") ?? ""),
      pan: String(formData.get("pan") ?? ""),
      ngo_darpan_id: String(formData.get("ngo_darpan_id") ?? ""),
      medical_reg_number: String(formData.get("medical_reg_number") ?? ""),
      gst: String(formData.get("gst") ?? ""),
      cin: String(formData.get("cin") ?? ""),
      owner_aadhaar_masked: String(formData.get("owner_aadhaar_masked") ?? ""),
      owner_pan_masked: String(formData.get("owner_pan_masked") ?? ""),
      owner_phone: String(formData.get("owner_phone") ?? ""),
      phone_verified:
        String(formData.get("phone_verified") ?? "false") === "true",
      status: isDraft ? "draft" : "submitted",
      agency_email: user.email, // Store user email
    };

    // handle file uploads
    const registrationCertificateFile = formData.get(
      "registration_certificate"
    ) as File | null;
    const clinicLicenseFile = formData.get("clinic_license") as File | null;
    const businessRegFile = formData.get("business_reg") as File | null;

    const { data: existingAgency, error: fetchError } = await supabase
      .from("agencies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error(fetchError);
      return NextResponse.json(
        { error: "Database fetch error", message: fetchError.message },
        { status: 500 }
      );
    }

    if (existingAgency) {
      // NGO certificate
      if (
        registrationCertificateFile &&
        existingAgency.registration_certificate_url
      ) {
        await deleteFileByPublicUrl(
          supabase,
          existingAgency.registration_certificate_url
        );
      }

      // Clinic license
      if (clinicLicenseFile && existingAgency.clinic_license_url) {
        await deleteFileByPublicUrl(
          supabase,
          existingAgency.clinic_license_url
        );
      }

      // Business registration
      if (businessRegFile && existingAgency.business_reg_url) {
        await deleteFileByPublicUrl(supabase, existingAgency.business_reg_url);
      }
    }

    const [registration_certificate_url, clinic_license_url, business_reg_url] =
      await Promise.all([
        uploadDocIfPresent(
          registrationCertificateFile,
          "agency_docs/ngo",
          user
        ),
        uploadDocIfPresent(clinicLicenseFile, "agency_docs/healthcare", user),
        uploadDocIfPresent(businessRegFile, "agency_docs/business", user),
      ]);

    if (registration_certificate_url)
      agencyPayload.registration_certificate_url = registration_certificate_url;
    if (clinic_license_url)
      agencyPayload.clinic_license_url = clinic_license_url;
    if (business_reg_url) agencyPayload.business_reg_url = business_reg_url;

    // validation for non-draft
    if (!isDraft) {
      if (agencyPayload.pan) {
        const err = await checkIfExists(
          supabase,
          "pan",
          agencyPayload.pan,
          user.id,
          "PAN"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      // Aadhaar
      if (agencyPayload.owner_aadhaar_masked) {
        const err = await checkIfExists(
          supabase,
          "owner_aadhaar_masked",
          agencyPayload.owner_aadhaar_masked,
          user.id,
          "Aadhaar"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      // NGO Darpan
      if (agencyPayload.ngo_darpan_id) {
        const err = await checkIfExists(
          supabase,
          "ngo_darpan_id",
          agencyPayload.ngo_darpan_id,
          user.id,
          "NGO Darpan ID"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      // GST
      if (agencyPayload.gst) {
        const err = await checkIfExists(
          supabase,
          "gst",
          agencyPayload.gst,
          user.id,
          "GST"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      // CIN
      if (agencyPayload.cin) {
        const err = await checkIfExists(
          supabase,
          "cin",
          agencyPayload.cin,
          user.id,
          "CIN"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      // Medical Registration
      if (agencyPayload.medical_reg_number) {
        const err = await checkIfExists(
          supabase,
          "medical_reg_number",
          agencyPayload.medical_reg_number,
          user.id,
          "Medical Registration Number"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      // Phone
      if (agencyPayload.owner_phone) {
        const err = await checkIfExists(
          supabase,
          "owner_phone",
          agencyPayload.owner_phone,
          user.id,
          "Phone number"
        );
        if (err) {
          return NextResponse.json({ error: err }, { status: 409 });
        }
      }

      const errors = validateSubmittedApplication(agencyPayload);
      if (errors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", issues: errors },
          { status: 400 }
        );
      }
    }

    let data;
    if (existingAgency) {
      // Update existing agency
      const { data: updatedData, error: updateError } = await supabase
        .from("agencies")
        .update(agencyPayload)
        .eq("id", existingAgency.id)
        .select("*")
        .single();

      if (updateError) {
        console.error(updateError);
        return NextResponse.json(
          { error: "Database update error", message: updateError.message },
          { status: 500 }
        );
      }
      data = updatedData;
    } else {
      // Insert new agency
      const { data: insertedData, error: insertError } = await supabase
        .from("agencies")
        .insert([agencyPayload])
        .select("*")
        .single();

      if (insertError) {
        console.error(insertError);
        return NextResponse.json(
          { error: "Database insert error", message: insertError.message },
          { status: 500 }
        );
      }
      data = insertedData;
    }

    return NextResponse.json({
      success: true,
      message: isDraft ? "Draft saved" : "Application submitted",
      agency: data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
