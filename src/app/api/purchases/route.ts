import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, serverError, notFound } from "@/lib/api";
import { purchaseBookingSchema } from "@/lib/validation";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/site";
import { renderAdminEmail, sendAdminEmail } from "@/lib/email";
import { formatDate, formatEUR } from "@/lib/format";

/**
 * Creates a purchase pickup booking for a refurbished phone.
 * With paymentMethod ONLINE (and Stripe configured) it also creates a Stripe
 * Checkout session and returns its URL; otherwise the purchase is pay-in-store.
 */
export async function POST(request: Request) {
  const parsed = await parseBody(request, purchaseBookingSchema);
  if (!parsed.ok) return parsed.response;
  const data = parsed.data;

  try {
    const phone = await prisma.phoneForSale.findUnique({ where: { id: data.phoneId } });
    if (!phone || phone.status !== "AVAILABLE") {
      return notFound("This phone is no longer available");
    }

    const stripe = getStripe();
    if (data.paymentMethod === "ONLINE" && !stripe) {
      return NextResponse.json(
        { error: "Online payment is not available right now — choose pay in store" },
        { status: 400 }
      );
    }

    const date = new Date(`${data.date}T00:00:00Z`);
    const day = await prisma.availableDay.findFirst({ where: { date, isActive: true } });
    if (!day) {
      return NextResponse.json(
        { error: "That day is not available for pickup" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        type: "PURCHASE",
        // In-store purchases are confirmed immediately; online ones confirm on payment.
        status: data.paymentMethod === "IN_STORE" ? "CONFIRMED" : "PENDING",
        date,
        timeSlot: data.timeSlot,
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
        notes: data.notes,
        brand: phone.brand,
        model: phone.model,
        totalAmount: phone.price,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        phoneForSaleId: phone.id,
      },
    });

    let checkoutUrl: string | null = null;

    if (data.paymentMethod === "ONLINE" && stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: Math.round(phone.price * 100),
              product_data: {
                name: `${phone.brand} ${phone.model} (${phone.storage}, ${phone.color})`,
                description: "Refurbished device — iRescue Athens",
              },
            },
          },
        ],
        customer_email: data.contact.email,
        metadata: { bookingId: booking.id, phoneId: phone.id },
        success_url: `${siteUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/purchase?cancelled=1`,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripeSessionId: session.id },
      });
      checkoutUrl = session.url;
    }

    const { html, text } = renderAdminEmail(
      "New phone purchase",
      [
        ["Device", `${phone.brand} ${phone.model} (${phone.storage}, ${phone.color})`],
        ["Price", formatEUR(phone.price)],
        ["Payment", data.paymentMethod === "ONLINE" ? "Online (Stripe)" : "In store"],
        ["Pickup", `${formatDate(booking.date)} at ${booking.timeSlot}`],
        ["Customer", data.contact.name],
        ["Email", data.contact.email],
        ["Phone", data.contact.phone],
      ],
      "/admin/bookings"
    );
    await sendAdminEmail({
      subject: `Purchase — ${phone.brand} ${phone.model}`,
      html,
      text,
      replyTo: data.contact.email,
    });

    return NextResponse.json(
      { success: true, bookingId: booking.id, checkoutUrl },
      { status: 201 }
    );
  } catch (error) {
    return serverError(error, "Failed to complete the purchase");
  }
}
