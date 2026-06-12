import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAdmin, serverError, notFound } from "@/lib/api";
import { listingUpdateSchema } from "@/lib/validation";

/** Admin: change a sell request's status (review workflow). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await parseBody(request, listingUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const { id } = await params;

  try {
    const existing = await prisma.phoneListing.findUnique({ where: { id } });
    if (!existing) return notFound("Listing not found");

    const listing = await prisma.phoneListing.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    return serverError(error, "Failed to update the listing");
  }
}

/** Admin: remove a sell request. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await prisma.phoneListing.findUnique({ where: { id } });
    if (!existing) return notFound("Listing not found");

    await prisma.phoneListing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, "Failed to delete the listing");
  }
}
