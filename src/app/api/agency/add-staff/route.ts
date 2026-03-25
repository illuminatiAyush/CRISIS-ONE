import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/lib/middleware/withUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { roleEmailHTML } from "@/templates/roleEmail";

export const POST = withUser(async (req: NextRequest, user) => {
  try {
    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = await createAdmin();

    // Fetch current agency profile
    const { data: agencyProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

      const {data: agency_org} = await supabase.from("agencies").select("*").eq("user_id",agencyProfile.id).single()

    if (!agencyProfile || agencyProfile.role !== "agency") {
      return NextResponse.json(
        { message: "Not eligible to add staff" },
        { status: 403 }
      );
    }

    const staffList = (await req.json()) as { email: string; role: string }[];
    if (!Array.isArray(staffList) || staffList.length === 0) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const results: any[] = [];

    for (const staff of staffList) {
      const email = staff.email.toLowerCase().trim();
      const role = staff.role;

      if (!email || !["volunteer", "coordinator"].includes(role)) {
        results.push({ email, status: "failed", reason: "Invalid input" });
        continue;
      }

      // Check if auth user exists
      const data = await supabaseAdmin
        ?.from("auth.users")
        .select("*")
        .eq("email", email)
        .single();

      const authUser = data?.data;

      let profileId: string | null = null;
      let isNewUser = false;

      if (!authUser) {
        try {
          let insertRes;
          if (role === "volunteer") {
            insertRes = await supabase
              .from("volunteers")
              .insert({ agency_id: agency_org.id, email })
              .select()
              .single();
          } else {
            insertRes = await supabase
              .from("coordinators")
              .insert({ agency_id: agency_org.id, email })
              .select()
              .single();
          }
      
          if (insertRes?.error) {
            console.error("Failed to insert into role table:", insertRes.error);
            results.push({ email, status: "failed", reason: "Failed to add to role table" });
            continue;
          }
      
          // Send registration email
          await sendEmail({
            to: email,
            subject: "Registration Required",
            html: roleEmailHTML({ profile: agency_org, role, email }),
          });
      
          results.push({
            email,
            status: "pending",
            reason: "Auth user not found, registration email sent",
          });
        } catch (err) {
          console.error("Error adding to role table:", err);
          results.push({ email, status: "failed", reason: "Error adding to role table" });
        }
      
        continue; // move to next staff
      }

      // Auth user exists → fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile) {
        // Profile missing → add to role table without linking user_id
        if (role === "volunteer") {
          await supabase
            .from("volunteers")
            .insert({ agency_id: agency_org.id, email });
        } else if (role === "coordinator") {
          await supabase
            .from("coordinators")
            .insert({ agency_id: agency_org.id, email });
        }

        // Send email to register
        await sendEmail({
          to: email,
          subject: "Registration Required",
          html: roleEmailHTML({ profile: agency_org, role, email }),
        });

        results.push({
          email,
          status: "pending",
          reason: "Profile missing, registration email sent",
        });
        continue;
      }

      profileId = profile.id;

      // If profile role is different → update profile and role tables
      if (profile.role !== role) {
        // Remove from old role table
        if (profile.role === "volunteer")
          await supabase.from("volunteers").delete().eq("user_id", profileId);
        if (profile.role === "coordinator")
          await supabase.from("coordinators").delete().eq("user_id", profileId);

        // Update profile role
        await supabase.from("profiles").update({ role }).eq("id", profileId);
      }

      // Add to role table if not already present
      if (role === "volunteer") {
        const { data: existingVolunteer } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", profileId)
          .maybeSingle();
        if (!existingVolunteer)
          await supabase
            .from("volunteers")
            .insert({ user_id: profileId, agency_id: agency_org.id });
      } else if (role === "coordinator") {
        const { data: existingCoordinator } = await supabase
          .from("coordinators")
          .select("id")
          .eq("user_id", profileId)
          .maybeSingle();
        if (!existingCoordinator)
          await supabase
            .from("coordinators")
            .insert({ user_id: profileId, agency_id: agency_org.id });
      }

      // Send role update email
      await sendEmail({
        to: email,
        subject: "Role Updated",
        html: roleEmailHTML({ profile: agency_org, role, email }),
      });

      results.push({ email, status: "success", role });
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Add staff error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
