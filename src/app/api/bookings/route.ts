import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, serverError } from "@/lib/api";
import { repairBookingSchema } from "@/lib/validation";
import { renderAdminEmail, sendAdminEmail } from "@/lib/email";
import { formatDate } from "@/lib/format";

/** Creates a repair appointment and notifies the shop. */
export async function POST(request: Request) {
  const parsed = await parseBody(request, repairBookingSchema);
  if (!parsed.ok) return parsed.response;
  const data = parsed.data;

  try {
    const date = new Date(`${data.date}T00:00:00Z`);

    const day = await prisma.availableDay.findFirst({
      where: { date, isActive: true },
    });
    if (!day) {
      return NextResponse.json(
        { error: "That day is not available for bookings" },
        { status: 409 }
      );
    }

    const slotTaken = await prisma.booking.findFirst({
      where: { date, timeSlot: data.timeSlot, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (slotTaken) {
      return NextResponse.json(
        { error: "That time slot was just taken — please pick another" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        type: "REPAIR",
        date,
        timeSlot: data.timeSlot,
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
        notes: data.notes,
        brand: data.brand,
        model: data.model,
        issues: data.issues,
        paymentMethod: "IN_STORE",
      },
    });

    const { html, text } = renderAdminEmail(
      "New repair booking",
      [
        ["Device", `${data.brand} ${data.model}`],
        ["Issues", data.issues.join(", ")],
        ["When", `${formatDate(booking.date)} at ${booking.timeSlot}`],
        ["Customer", data.contact.name],
        ["Email", data.contact.email],
        ["Phone", data.contact.phone],
        ["Notes", data.notes || "—"],
      ],
      "/admin/bookings"
    );
    await sendAdminEmail({
      subject: `Repair booking — ${data.brand} ${data.model}`,
      html,
      text,
      replyTo: data.contact.email,
    });

    return NextResponse.json({ success: true, bookingId: booking.id }, { status: 201 });
  } catch (error) {
    return serverError(error, "Failed to create the booking");
  }
}
