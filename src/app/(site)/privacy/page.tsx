import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How iRescue Athens handles your personal data.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: `When you book a repair, buy a device, or submit a trade-in request, we collect the details you give us: your name, email address, phone number, the device information, and any notes or photos you attach. If you pay online, the payment itself is processed by Stripe — we never see or store your card details.`,
  },
  {
    title: "How we use it",
    body: `We use your details only to provide the service you asked for: scheduling your appointment, contacting you about your device, completing a sale or trade-in, and sending you the related confirmations. We don't sell your data and we don't send marketing email.`,
  },
  {
    title: "How long we keep it",
    body: `Booking and sales records are kept for as long as we're required to for accounting purposes. Trade-in requests that don't result in a sale are deleted after six months. You can ask us to delete your data sooner at any time.`,
  },
  {
    title: "Your rights",
    body: `Under the GDPR you can request a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Email us and we'll respond within 30 days.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Privacy policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: June 2026</p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-lg font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-900">Contact</h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            Questions about your data? Reach us at{" "}
            <a href={`mailto:${SITE.email}`} className="font-medium text-brand-700 hover:text-brand-800">
              {SITE.email}
            </a>{" "}
            or visit us at {SITE.address}.
          </p>
        </section>
      </div>
    </div>
  );
}
