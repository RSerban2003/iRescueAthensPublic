import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAdmin, serverError, notFound } from "@/lib/api";
import { bookingUpdateSchema } from "@/lib/validation";

/** Admin: update a booking's status or notes. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await parseBody(request, bookingUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const { id } = await params;

  try {
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return notFound("Booking not found");

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
      },
    });

    // Completing a paid-online purchase keeps the phone sold; completing an
    // in-store purchase marks the reserved phone as sold now.
    if (
      booking.type === "PURCHASE" &&
      booking.phoneForSaleId &&
      parsed.data.status === "COMPLETED"
    ) {
      await prisma.phoneForSale.update({
        where: { id: booking.phoneForSaleId },
        data: { status: "SOLD" },
      });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return serverError(error, "Failed to update the booking");
  }
}
