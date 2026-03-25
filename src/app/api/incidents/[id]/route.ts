
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createSupabaseServerClient();
        const id = (await params).id;
        const body = await req.json();

        // Check what fields are being updated. For now incidentService only updates status.
        // We can allow updating other fields if needed.
        const updates: any = {};
        if (body.status) updates.status = body.status;

        // Add other fields here if needed in the future

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { error } = await supabase
            .from('incidents')
            .update(updates)
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
