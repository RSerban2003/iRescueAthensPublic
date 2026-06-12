import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, serverError } from "@/lib/api";

/** Admin: list sell requests, optionally filtered by ?status=. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const status = new URL(request.url).searchParams.get("status");

    const listings = await prisma.phoneListing.findMany({
      where:
        status && ["PENDING", "APPROVED", "REJECTED", "SOLD"].includes(status)
          ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "SOLD" }
          : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    return serverError(error, "Failed to load listings");
  }
}
