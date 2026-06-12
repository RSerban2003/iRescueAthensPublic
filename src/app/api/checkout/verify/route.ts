import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api";
import { getStripe } from "@/lib/stripe";

/**
 * Confirms a Stripe Checkout session after redirect and marks the booking
 * paid. Idempotent: safe to call multiple times for the same session.
 * (A webhook would be the production-grade alternative; for a local demo the
 * redirect verification keeps setup to zero extra processes.)
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ paid: false });
    }

    const booking = await prisma.booking.findFirst({
      where: { stripeSessionId: session.id },
      include: { phoneForSale: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.paymentStatus !== "PAID") {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        }),
        ...(booking.phoneForSaleId
          ? [
              prisma.phoneForSale.update({
                where: { id: booking.phoneForSaleId },
                data: { status: "SOLD" },
              }),
            ]
          : []),
      ]);
    }

    return NextResponse.json({
      paid: true,
      booking: {
        id: booking.id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        device: booking.phoneForSale
          ? `${booking.phoneForSale.brand} ${booking.phoneForSale.model}`
          : `${booking.brand ?? ""} ${booking.model ?? ""}`.trim(),
        totalAmount: booking.totalAmount,
      },
    });
  } catch (error) {
    return serverError(error, "Failed to verify the payment");
  }
}
