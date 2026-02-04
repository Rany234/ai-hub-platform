import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/features/auth/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("[Stripe Webhook] Missing orderId in session metadata");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // First, fetch the order to see if it's a job order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, type, job_id, proposal_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error("[Stripe Webhook] Failed to fetch order", fetchError);
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        escrow_status: "held",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[Stripe Webhook] Failed to update order", updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // If this is a job order, update job and proposals
    if (order.type === "job" && order.job_id && order.proposal_id) {
      // Update job status to in_progress
      const { error: jobUpdateError } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", order.job_id);

      if (jobUpdateError) {
        console.error("[Stripe Webhook] Failed to update job status", jobUpdateError);
      }

      // Update the accepted proposal status to accepted (if not already)
      const { error: proposalAcceptError } = await supabase
        .from("proposals")
        .update({ status: "accepted" })
        .eq("id", order.proposal_id);

      if (proposalAcceptError) {
        console.error("[Stripe Webhook] Failed to update accepted proposal", proposalAcceptError);
      }

      // Reject all other proposals for this job
      const { error: otherProposalsError } = await supabase
        .from("proposals")
        .update({ status: "rejected" })
        .eq("job_id", order.job_id)
        .neq("id", order.proposal_id);

      if (otherProposalsError) {
        console.error("[Stripe Webhook] Failed to reject other proposals", otherProposalsError);
      }

      console.log(`[Stripe Webhook] Job ${order.job_id} set to in_progress, proposal ${order.proposal_id} accepted`);
    }

    console.log(`[Stripe Webhook] Order ${orderId} marked as paid`);
  }

  return NextResponse.json({ received: true });
}
