import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "@/components/layout/Logo";

const COLUMNS = [
  {
    title: "Services",
    links: [
      { href: "/repair", label: "Book a repair" },
      { href: "/purchase", label: "Buy refurbished" },
      { href: "/sell", label: "Sell your phone" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-500">
            Independent phone repair shop and refurbished-device store in the heart of Athens.
            Transparent prices, fast turnaround, six-month warranty on repairs.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {column.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Visit us</h3>
          <address className="mt-3 space-y-2 text-sm not-italic text-slate-600">
            <p>{SITE.address}</p>
            <p>{SITE.openingHours}</p>
            <p>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                {SITE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${SITE.email}`} className="hover:text-brand-700">
                {SITE.email}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4">
        <p className="mx-auto max-w-content px-4 text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
