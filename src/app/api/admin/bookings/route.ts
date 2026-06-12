import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, serverError } from "@/lib/api";

/** Admin: list bookings, optionally filtered by ?status= and ?type=. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const params = new URL(request.url).searchParams;
    const status = params.get("status");
    const type = params.get("type");

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status && ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)
          ? { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" }
          : {}),
        ...(type && ["REPAIR", "PURCHASE"].includes(type)
          ? { type: type as "REPAIR" | "PURCHASE" }
          : {}),
      },
      include: { phoneForSale: { select: { brand: true, model: true, storage: true } } },
      orderBy: [{ date: "desc" }, { timeSlot: "asc" }],
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return serverError(error, "Failed to load bookings");
  }
}
