import { NextResponse } from "next/server";
import { parseBody, serverError } from "@/lib/api";
import { contactMessageSchema } from "@/lib/validation";
import { renderAdminEmail, sendAdminEmail } from "@/lib/email";

export async function POST(request: Request) {
  const parsed = await parseBody(request, contactMessageSchema);
  if (!parsed.ok) return parsed.response;
  const data = parsed.data;

  try {
    const { html, text } = renderAdminEmail(`Contact form: ${data.subject}`, [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone || "Not provided"],
      ["Subject", data.subject],
      ["Message", data.message],
    ]);

    await sendAdminEmail({
      subject: `New contact message — ${data.subject}`,
      html,
      text,
      replyTo: data.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, "Failed to send your message");
  }
}
