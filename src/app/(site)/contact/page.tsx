import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with iRescue Athens — questions, quotes, or anything else.",
};

const DETAILS = [
  { label: "Visit", value: SITE.address },
  { label: "Hours", value: SITE.openingHours },
  { label: "Call", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900">Contact us</h1>
        <p className="mt-2 text-slate-500">
          Question about a repair, a device, or an offer? Send a message and we&apos;ll get back to
          you within one business day.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          {DETAILS.map((detail) => (
            <Card key={detail.label} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {detail.label}
              </p>
              {detail.href ? (
                <a
                  href={detail.href}
                  className="mt-1 block font-medium text-brand-700 hover:text-brand-800"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="mt-1 font-medium text-slate-800">{detail.value}</p>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-6 lg:col-span-2">
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
