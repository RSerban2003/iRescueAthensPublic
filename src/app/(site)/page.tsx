import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { REPAIR_CATALOG } from "@/lib/repair-catalog";
import { formatEUR } from "@/lib/format";
import { SITE } from "@/lib/site";

const JOURNEYS = [
  {
    href: "/repair",
    title: "Repair your phone",
    description:
      "Cracked screen, dead battery, charging issues — get an instant price and book a time slot that suits you.",
    cta: "Get a repair price",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.65 2.65 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
  },
  {
    href: "/purchase",
    title: "Buy refurbished",
    description:
      "Hand-checked, fully tested devices at fair prices. Every phone comes with a warranty and a fresh battery check.",
    cta: "Browse phones",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    href: "/sell",
    title: "Sell your old phone",
    description:
      "Tell us the model and condition, name your price, and we'll come back with an offer — usually within a day.",
    cta: "Get an offer",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Six-month warranty",
    description: "Every repair is covered for six months — parts and labour.",
  },
  {
    title: "Transparent pricing",
    description: "Prices are published up front. What you see is what you pay.",
  },
  {
    title: "Same-day turnaround",
    description: "Most screen and battery jobs are ready the same day, often within the hour.",
  },
  {
    title: "Quality parts",
    description: "We fit tested, high-grade parts and check every device before handover.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Screen replaced in 40 minutes while I had a coffee next door. Price matched the website exactly.",
    name: "Maria K.",
    detail: "iPhone 13 screen",
  },
  {
    quote:
      "Bought a refurbished Galaxy here a year ago — still flawless. They showed me the battery report before I paid.",
    name: "Nikos P.",
    detail: "Refurbished Galaxy S22",
  },
  {
    quote:
      "Sold them my old phone in one visit. Fair offer, instant payment, zero haggling stress.",
    name: "Elena D.",
    detail: "Sold an iPhone 12",
  },
];

function minPrice(brand: string, issue: "screen" | "battery"): number | null {
  const models = REPAIR_CATALOG[brand] ?? [];
  const prices = models
    .map((model) => model.prices[issue])
    .filter((price): price is number => typeof price === "number");
  return prices.length ? Math.min(...prices) : null;
}

export default function HomePage() {
  const teasers = [
    { label: "iPhone screen repair", price: minPrice("Apple", "screen") },
    { label: "iPhone battery swap", price: minPrice("Apple", "battery") },
    { label: "Samsung screen repair", price: minPrice("Samsung", "screen") },
    { label: "Xiaomi battery swap", price: minPrice("Xiaomi", "battery") },
  ].filter((teaser) => teaser.price !== null);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #14b8a6 0, transparent 40%), radial-gradient(circle at 80% 70%, #0f766e 0, transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-content px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-brand-200 ring-1 ring-inset ring-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            Same-day repairs in central Athens
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your phone, rescued.
            <span className="block text-brand-400">Repair, buy, or sell — all in one place.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Up-front prices, quality parts, and a six-month warranty on every repair. Refurbished
            phones you can trust, and fair offers for the one in your drawer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/repair" size="lg">
              Book a repair
            </Button>
            <Button
              href="/purchase"
              size="lg"
              className="border border-white/20 bg-white/10 text-white hover:bg-white/20 active:bg-white/25"
            >
              Browse phones
            </Button>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              ["10k+", "repairs completed"],
              ["60 min", "average screen fix"],
              ["6 mo", "repair warranty"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl font-bold text-white">{value}</dd>
                <dd className="text-sm text-slate-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Three journeys */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6" aria-labelledby="journeys-heading">
        <h2 id="journeys-heading" className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          What brings you in today?
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {JOURNEYS.map((journey) => (
            <Card key={journey.href} hover className="flex flex-col p-6">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                {journey.icon}
              </span>
              <h3 className="font-display text-lg font-semibold text-slate-900">{journey.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                {journey.description}
              </p>
              <Link
                href={journey.href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {journey.cta}
                <span aria-hidden="true">→</span>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Price teasers */}
      <section className="bg-white py-16" aria-labelledby="prices-heading">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="prices-heading" className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                Popular repairs, honest prices
              </h2>
              <p className="mt-2 text-slate-500">
                Full price list shown during booking — no surprises at the counter.
              </p>
            </div>
            <Button href="/repair" variant="outline">
              See all prices
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teasers.map((teaser) => (
              <div
                key={teaser.label}
                className="rounded-xl border border-slate-200 p-5"
              >
                <p className="text-sm font-medium text-slate-500">{teaser.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">
                  from {formatEUR(teaser.price as number)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6" aria-labelledby="features-heading">
        <h2 id="features-heading" className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Why people trust {SITE.name}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z" clipRule="evenodd" />
                </svg>
              </span>
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <h2 id="testimonials-heading" className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            From our customers
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-xl bg-slate-50 p-6">
                <div className="mb-3 flex gap-0.5 text-accent-500" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg key={index} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 0 0-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.286-3.957a1 1 0 0 0-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-slate-700">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-slate-900">{testimonial.name}</span>
                  <span className="text-slate-400"> · {testimonial.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-content px-4 pb-20 pt-4 sm:px-6">
        <div className="rounded-2xl bg-brand-700 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Broken screen ruining your day?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-brand-100">
            Get an instant price and a same-day slot. Walk-ins welcome at {SITE.address}.
          </p>
          <div className="mt-6">
            <Button href="/repair" size="lg" className="bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100">
              Book a repair now
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
