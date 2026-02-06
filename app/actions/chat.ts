"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { createSupabaseAdminClient } from "@/features/auth/supabase/admin";

export async function getUserConversations() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get conversations where the current user is a participant
  const { data: participations, error: pError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (pError) throw pError;
  if (!participations || participations.length === 0) return [];

  const conversationIds = participations.map(p => p.conversation_id);

  // Fetch conversations with participants (excluding current user) and the latest message
  const { data: conversations, error: cError } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      conversation_participants!inner (
        user_id,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      ),
      messages (
        content,
        created_at
      )
    `)
    .in("id", conversationIds)
    .order("created_at", { foreignTable: "messages", ascending: false });

  if (cError) throw cError;

  return (conversations || []).map(conv => {
    const otherParticipant = conv.conversation_participants.find(p => p.user_id !== user.id);
    const lastMessage = conv.messages?.[0] || null;
    return {
      id: conv.id,
      otherUser: otherParticipant?.profiles || { full_name: "未知用户", avatar_url: null },
      lastMessage,
    };
  });
}

export async function getEmployerJobs() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("jobs")
    .select("id,title")
    .eq("creator_id", user.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMessages(conversationId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  if (!content.trim()) return { success: false };

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      type: "text",
      payload: null,
    });

  if (error) throw error;

  revalidatePath(`/dashboard/chat`);
  return { success: true };
}

export async function sendOffer(
  conversationId: string,
  jobId: string,
  amount: number,
  description: string
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("Invalid amount");
  }

  if (!jobId?.trim()) {
    throw new Error("Invalid jobId");
  }

  const content = `发起了一份聘书: ${normalizedAmount}`;

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      type: "offer",
      payload: {
        amount: normalizedAmount,
        status: "pending",
        description: (description ?? "").toString(),
        jobId: jobId.trim(),
      },
    });

  if (error) throw error;

  revalidatePath(`/dashboard/chat`);
  return { success: true };
}

export async function handleOffer(
  messageId: string,
  action: "accept" | "decline"
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const adminClient = createSupabaseAdminClient();
  const status = action === "accept" ? "accepted" : "rejected";

  // Step B: Get message and validate payload
  const { data: message, error: readError } = await adminClient
    .from("messages")
    .select("payload")
    .eq("id", messageId)
    .single();

  if (readError || !message) throw new Error(`Failed to read message: ${readError?.message}`);
  
  console.log('Offer Payload:', message.payload);

  const currentPayload =
    typeof message?.payload === "object" && message?.payload ? (message.payload as any) : {};

  // Step C: If accepted, perform "God update" on job (bypass RLS)
  if (action === "accept") {
    const jobId = currentPayload.jobId;
    if (!jobId) {
      throw new Error("Job ID missing in offer payload");
    }

    const { error: jobError } = await adminClient
      .from("jobs")
      .update({ 
        status: "in_progress", 
        worker_id: user.id 
      } as any)
      .eq("id", jobId);

    if (jobError) throw new Error(`Job update failed: ${jobError.message}`);
  }

  // Step D: Update message status using adminClient to ensure success
  const nextPayload = {
    ...currentPayload,
    status,
  };

  const { error: msgUpdateError } = await adminClient
    .from("messages")
    .update({
      payload: nextPayload,
    })
    .eq("id", messageId);

  if (msgUpdateError) throw new Error(`Message update failed: ${msgUpdateError.message}`);

  revalidatePath(`/dashboard/chat`);
  return { success: true };
}

export async function startChat(otherUserId: string) {
  console.log("🚀 Starting chat with:", otherUserId);

  if (!otherUserId || otherUserId === "undefined" || otherUserId === "null") {
    console.error("❌ Error: otherUserId is missing or invalid!");
    throw new Error("Target user ID is missing");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const { data: convId, error } = await supabase.rpc("get_or_create_conversation", {
      p_other_user_id: otherUserId
    });

    if (error) {
      console.error("❌ Supabase RPC Error (get_or_create_conversation):", error);
      throw new Error(error.message);
    }

    console.log("✅ Conversation established ID:", convId);
    redirect(`/dashboard/chat?id=${convId}`);
  } catch (err) {
    console.error("💥 Critical error in startChat:", err);
    throw err;
  }
}
