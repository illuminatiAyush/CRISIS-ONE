
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from "@/app/types";

// Helper to map DB result to app Incident type
const mapDBToIncident = (data: any): Incident => ({
    id: data.id,
    category: data.category as IncidentCategory,
    severity: data.severity_level as IncidentSeverity,
    status: (data.status as IncidentStatus) || 'Pending',
    location: {
        lat: data.lat,
        lon: data.lng,
    },
    description: data.description,
    reporterId: data.user_id,
    agencies_assigned: data.agencies_assigned,
    estimatedAffected: data.estimated_people_affected,
    img_url: data.img_url,
    timestamp: new Date(data.created_at),
    lastUpdated: new Date(data.created_at),
});

export async function GET(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const incidents = (data || []).map(mapDBToIncident);
        return NextResponse.json({ success: true, data: incidents });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const formData = await req.formData();

        const category = formData.get('category') as string;
        const severity = formData.get('severity') as string;
        const description = formData.get('description') as string;
        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);
        const estimatedAffected = formData.get('estimatedAffected') ? Number(formData.get('estimatedAffected')) : undefined;
        const reporterId = formData.get('reporterId') as string;
        const imageFile = formData.get('image') as File | null;

        let imageUrl = null;

        // 1. Upload Image if exists
        if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('incidents')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                return NextResponse.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 });
            }

            const { data: { publicUrl } } = supabase.storage
                .from('incidents')
                .getPublicUrl(filePath);
            imageUrl = publicUrl;
        }

        // 2. Determine User ID
        let userId = reporterId;
        if (!userId || userId === 'anonymous') {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                userId = user.id;
            } else {
                userId = '00000000-0000-0000-0000-000000000000';
            }
        }

        // 3. Insert into DB
        const { data, error } = await supabase
            .from('incidents')
            .insert([
                {
                    category,
                    severity_level: severity,
                    description,
                    lat,
                    lng,
                    estimated_people_affected: estimatedAffected,
                    status: 'Pending',
                    agencies_assigned: ['00000000-0000-0000-0000-000000000000'],
                    img_url: imageUrl,
                    user_id: userId,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating incident:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: mapDBToIncident(data) });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
