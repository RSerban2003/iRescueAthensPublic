import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAdmin, serverError, notFound } from "@/lib/api";
import { phoneForSaleUpdateSchema } from "@/lib/validation";

/** Admin: update an inventory phone (details, price, status). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await parseBody(request, phoneForSaleUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const { id } = await params;

  try {
    const existing = await prisma.phoneForSale.findUnique({ where: { id } });
    if (!existing) return notFound("Phone not found");

    const phone = await prisma.phoneForSale.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ phone });
  } catch (error) {
    return serverError(error, "Failed to update the phone");
  }
}

/** Admin: remove an inventory phone. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await prisma.phoneForSale.findUnique({ where: { id } });
    if (!existing) return notFound("Phone not found");

    await prisma.phoneForSale.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, "Failed to delete the phone");
  }
}
