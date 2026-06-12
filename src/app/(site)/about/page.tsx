import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are and how we work — an independent phone repair shop in central Athens.",
};

const SERVICES = [
  {
    title: "Screen & glass",
    description: "Cracked displays, dead pixels, back glass — replaced with tested, high-grade parts.",
  },
  {
    title: "Batteries",
    description: "Health-checked replacements that restore all-day battery life, fitted while you wait.",
  },
  {
    title: "Charging & ports",
    description: "Charging ports, microphones, speakers and buttons — the fiddly stuff, done properly.",
  },
  {
    title: "Water damage",
    description: "Ultrasonic cleaning and board-level inspection to give soaked phones a second chance.",
  },
  {
    title: "Refurbished sales",
    description: "Traded-in devices fully tested, wiped and resold with warranty — at honest prices.",
  },
  {
    title: "Trade-ins",
    description: "Fair, transparent offers for your old device. Bring it in or start online in two minutes.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900">About {SITE.name}</h1>
        <p className="mt-4 leading-relaxed text-slate-600">
          We&apos;re an independent repair shop in the centre of Athens. We started fixing phones
          for friends and family; today we handle thousands of repairs a year — same honest
          approach, just more soldering irons.
        </p>
        <p className="mt-3 leading-relaxed text-slate-600">
          Every repair gets a six-month warranty, every refurbished phone is tested top to bottom,
          and every price is published before you walk in. No surprises is the whole business
          model.
        </p>
      </header>

      <section className="mt-12" aria-labelledby="services-heading">
        <h2 id="services-heading" className="font-display text-2xl font-bold text-slate-900">
          What we do
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-brand-700 px-6 py-10 text-center">
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
          Come say hi — or start online
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-100">
          {SITE.address} · {SITE.openingHours}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button href="/repair" className="bg-white text-brand-800 hover:bg-brand-50">
            Book a repair
          </Button>
          <Button href="/contact" className="border border-white/30 bg-transparent text-white hover:bg-white/10">
            Contact us
          </Button>
        </div>
      </section>
    </div>
  );
}
