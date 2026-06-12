import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions we hear most — warranties, turnaround times, payments and data.",
};

const FAQS = [
  {
    question: "How long does a repair take?",
    answer:
      "Most screen and battery replacements are done within an hour. More involved repairs (water damage, board work) usually take one to three business days — we'll give you an estimate before we start.",
  },
  {
    question: "Is there a warranty on repairs?",
    answer:
      "Yes — every repair comes with a six-month warranty covering both the part and the work. It doesn't cover new accidental damage, but if a part we fitted fails, we'll make it right at no charge.",
  },
  {
    question: "Will my data be safe?",
    answer:
      "We never need your passcode for most repairs and we never wipe a device without asking first. Still, we recommend a backup before any repair — it's good hygiene regardless.",
  },
  {
    question: "What do refurbished phones include?",
    answer:
      "A full functional test, a battery health check, a deep clean, a charger cable, and a warranty. The exact battery health and cosmetic condition are listed on each device.",
  },
  {
    question: "How do trade-in offers work?",
    answer:
      "Submit your device online with photos and your asking price. We'll reply with an offer, usually within one business day. If you accept, bring the phone in — we verify the condition and pay you on the spot.",
  },
  {
    question: "How can I pay?",
    answer:
      "Card or cash in store. For refurbished phones you can also pay online by card when you reserve, so the device is yours before you even arrive.",
  },
  {
    question: "Do I need an appointment?",
    answer:
      "Walk-ins are welcome, but booking online guarantees your slot and lets us have parts ready — especially useful for less common models.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">Frequently asked questions</h1>
        <p className="mt-2 text-slate-500">
          Can&apos;t find what you need? <a href="/contact" className="font-medium text-brand-700 hover:text-brand-800">Send us a message</a>.
        </p>
      </header>

      <div className="space-y-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-slate-200 bg-white shadow-card open:ring-1 open:ring-brand-200"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              {faq.question}
              <svg
                className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
