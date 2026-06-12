import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, serverError } from "@/lib/api";
import { listingSchema } from "@/lib/validation";
import { renderAdminEmail, sendAdminEmail } from "@/lib/email";
import { formatEUR, CONDITION_LABELS } from "@/lib/format";

/** Creates a sell-your-phone request and notifies the shop. */
export async function POST(request: Request) {
  const parsed = await parseBody(request, listingSchema);
  if (!parsed.ok) return parsed.response;
  const data = parsed.data;

  try {
    const listing = await prisma.phoneListing.create({
      data: {
        brand: data.brand,
        model: data.model,
        storage: data.storage,
        condition: data.condition,
        description: data.description,
        askingPrice: data.askingPrice,
        images: data.images,
        name: data.contact.name,
        email: data.contact.email,
        phone: data.contact.phone,
      },
    });

    const { html, text } = renderAdminEmail(
      "New sell request",
      [
        ["Device", `${data.brand} ${data.model} (${data.storage})`],
        ["Condition", CONDITION_LABELS[data.condition]],
        ["Asking price", formatEUR(data.askingPrice)],
        ["Photos", String(data.images.length)],
        ["Seller", data.contact.name],
        ["Email", data.contact.email],
        ["Phone", data.contact.phone],
        ["Notes", data.description || "—"],
      ],
      "/admin/listings"
    );
    await sendAdminEmail({
      subject: `Sell request — ${data.brand} ${data.model}`,
      html,
      text,
      replyTo: data.contact.email,
    });

    return NextResponse.json({ success: true, listingId: listing.id }, { status: 201 });
  } catch (error) {
    return serverError(error, "Failed to submit your listing");
  }
}
