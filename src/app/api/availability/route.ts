import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api";
import { toDateKey } from "@/lib/format";
import { DEFAULT_SLOTS } from "@/lib/site";

/**
 * Public booking availability: upcoming open days, the configured time slots,
 * and per-day slots that are already taken by an active booking.
 */
export async function GET() {
  try {
    const today = new Date(`${toDateKey(new Date())}T00:00:00Z`);

    const [days, config, bookings] = await Promise.all([
      prisma.availableDay.findMany({
        where: { isActive: true, date: { gte: today } },
        orderBy: { date: "asc" },
      }),
      prisma.availabilityConfig.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.booking.findMany({
        where: { date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
        select: { date: true, timeSlot: true },
      }),
    ]);

    const booked: Record<string, string[]> = {};
    for (const booking of bookings) {
      const key = toDateKey(booking.date);
      (booked[key] ??= []).push(booking.timeSlot);
    }

    return NextResponse.json({
      days: days.map((day) => ({ date: toDateKey(day.date), note: day.note })),
      slots: config?.slots.length ? config.slots : DEFAULT_SLOTS,
      booked,
    });
  } catch (error) {
    return serverError(error, "Failed to load availability");
  }
}
