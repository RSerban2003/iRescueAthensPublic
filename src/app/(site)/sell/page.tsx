import type { Metadata } from "next";
import { SellFlow } from "./SellFlow";

export const metadata: Metadata = {
  title: "Sell your phone",
  description:
    "Tell us about your phone, name your price, and get an offer — usually within one business day.",
};

export default function SellPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900">Sell your phone</h1>
        <p className="mt-2 text-slate-500">
          Three quick steps: describe the device, add photos and your asking price, and leave your
          contact details. We usually reply with an offer within one business day.
        </p>
      </header>
      <SellFlow />
    </div>
  );
}
