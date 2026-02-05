import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { jobId, proposalId } = (await req.json()) as {
      jobId?: unknown;
      proposalId?: unknown;
    };

    if (typeof jobId !== "string" || typeof proposalId !== "string") {
      return NextResponse.json({ error: "Invalid jobId or proposalId" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify job ownership
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, creator_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job || job.creator_id !== user.id) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
    }

    // Get proposal and freelancer
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("id, freelancer_id, price, days, cover_letter")
      .eq("id", proposalId)
      .eq("job_id", jobId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Create an order (job order)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: proposal.freelancer_id,
        listing_id: null,
        type: "job",
        job_id: jobId,
        proposal_id: proposalId,
        amount: proposal.price,
        status: "pending",
        escrow_status: "held",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Update proposal status to accepted
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ status: "accepted" })
      .eq("id", proposalId);

    if (updateError) {
      console.error("Failed to update proposal status:", updateError);
    }

    // Optionally reject other proposals for this job
    await supabase
      .from("proposals")
      .update({ status: "rejected" })
      .eq("job_id", jobId)
      .neq("id", proposalId);

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const unitAmount = Math.round(Number(proposal.price) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: {
              name: `任务订单 - ${jobId}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/orders/${order.id}?success=true`,
      cancel_url: `${baseUrl}/dashboard/jobs/${jobId}?canceled=true`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[POST /api/jobs/hire]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
