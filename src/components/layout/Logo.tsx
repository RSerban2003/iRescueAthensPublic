import Link from "next/link";
import { SITE } from "@/lib/site";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${SITE.name} — home`}>
      <svg className="h-8 w-8" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#0d9488" />
        <rect x="22" y="12" width="20" height="40" rx="5" fill="none" stroke="#fff" strokeWidth="4" />
        <circle cx="32" cy="45" r="2.5" fill="#fff" />
        <path d="M40 22l8-8M44 26l8-8" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          inverted ? "text-white" : "text-slate-900"
        }`}
      >
        iRescue<span className="text-brand-600"> Athens</span>
      </span>
    </Link>
  );
}
