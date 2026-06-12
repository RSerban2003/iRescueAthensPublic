import type { Metadata } from "next";
import { RepairFlow } from "./RepairFlow";

export const metadata: Metadata = {
  title: "Book a repair",
  description:
    "Get an instant repair price for your phone and book a time slot — screens, batteries, cameras, charging ports and more.",
};

export default function RepairPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900">Book a repair</h1>
        <p className="mt-2 text-slate-500">
          Pick your device and what&apos;s wrong with it — you&apos;ll see the price before you book.
          Most repairs are done the same day.
        </p>
      </header>
      <RepairFlow />
    </div>
  );
}
