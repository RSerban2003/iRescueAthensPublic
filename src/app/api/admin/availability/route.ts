import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAdmin, serverError } from "@/lib/api";
import { availableDaySchema, slotsUpdateSchema } from "@/lib/validation";
import { toDateKey } from "@/lib/format";
import { DEFAULT_SLOTS } from "@/lib/site";

/** Admin: every configured day (including past/inactive) plus the slot config. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [days, config] = await Promise.all([
      prisma.availableDay.findMany({ orderBy: { date: "asc" } }),
      prisma.availabilityConfig.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      days: days.map((day) => ({ ...day, date: toDateKey(day.date) })),
      slots: config?.slots.length ? config.slots : DEFAULT_SLOTS,
    });
  } catch (error) {
    return serverError(error, "Failed to load availability");
  }
}

/** Admin: add an open day, or update it if the date already exists. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await parseBody(request, availableDaySchema);
  if (!parsed.ok) return parsed.response;
  const data = parsed.data;

  try {
    const date = new Date(`${data.date}T00:00:00Z`);
    const day = await prisma.availableDay.upsert({
      where: { date },
      create: { date, note: data.note, isActive: data.isActive },
      update: { note: data.note, isActive: data.isActive },
    });

    return NextResponse.json({ day: { ...day, date: toDateKey(day.date) } }, { status: 201 });
  } catch (error) {
    return serverError(error, "Failed to save the day");
  }
}

/** Admin: replace the bookable time slots. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await parseBody(request, slotsUpdateSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const slots = [...parsed.data.slots].sort();
    const existing = await prisma.availabilityConfig.findFirst({ where: { isActive: true } });

    const config = existing
      ? await prisma.availabilityConfig.update({ where: { id: existing.id }, data: { slots } })
      : await prisma.availabilityConfig.create({ data: { slots } });

    return NextResponse.json({ slots: config.slots });
  } catch (error) {
    return serverError(error, "Failed to update time slots");
  }
}

/** Admin: remove a day by ?id=. */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing day id" }, { status: 400 });
  }

  try {
    const existing = await prisma.availableDay.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    await prisma.availableDay.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, "Failed to delete the day");
  }
}
