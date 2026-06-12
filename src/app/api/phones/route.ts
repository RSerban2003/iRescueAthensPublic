import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api";

/** Public storefront: refurbished phones currently available for purchase. */
export async function GET() {
  try {
    const phones = await prisma.phoneForSale.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ phones });
  } catch (error) {
    return serverError(error, "Failed to load phones");
  }
}
