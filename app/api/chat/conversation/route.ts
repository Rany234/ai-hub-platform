import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as null | {
      sellerId?: string;
      orderId?: string | null;
    };

    const sanitizeNullableUuid = (value: unknown): string | null => {
      if (value === null || value === undefined) return null;
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      if (trimmed.length === 0) return null;
      if (trimmed.toLowerCase() === "null") return null;
      return trimmed;
    };

    const sellerId = sanitizeNullableUuid(body?.sellerId);
    const orderId = sanitizeNullableUuid(body?.orderId);
    const buyerId = sanitizeNullableUuid(user.id);

    if (!sellerId) {
      return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    }

    if (!buyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent self-chat
    if (buyerId === sellerId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    const { data: existing, error: findError } = await supabase
      .from("conversations")
      .select("id")
      .eq("buyer_id", buyerId)
      .eq("seller_id", sellerId)
      .eq("order_id", orderId)
      .maybeSingle();

    if (findError) {
      console.error("Error finding existing conversation:", findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (existing?.id) {
      return NextResponse.json({ conversationId: existing.id });
    }

    const { data: created, error: createError } = await supabase
      .from("conversations")
      .insert({ buyer_id: buyerId, seller_id: sellerId, order_id: orderId })
      .select("id")
      .single();

    if (createError) {
      console.error("Error creating conversation:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ conversationId: created.id });
  } catch (err) {
    console.error("Unexpected error in conversation creation:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
