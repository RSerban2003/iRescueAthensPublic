import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAdmin, serverError } from "@/lib/api";
import { phoneForSaleSchema } from "@/lib/validation";

/** Admin: full refurbished inventory (all statuses). */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const phones = await prisma.phoneForSale.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ phones });
  } catch (error) {
    return serverError(error, "Failed to load inventory");
  }
}

/** Admin: add a phone to the inventory. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = await parseBody(request, phoneForSaleSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const phone = await prisma.phoneForSale.create({ data: parsed.data });
    return NextResponse.json({ phone }, { status: 201 });
  } catch (error) {
    return serverError(error, "Failed to add the phone");
  }
}
