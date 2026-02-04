import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) {
      const code = (error as unknown as { code?: string }).code;

      // 23503 = foreign_key_violation
      if (code === "23503") {
        const { error: archiveError } = await supabase
          .from("listings")
          .update({ status: "archived" })
          .eq("id", id);

        if (archiveError) {
          return NextResponse.json({ error: archiveError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, archived: true });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/listings/:id]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
