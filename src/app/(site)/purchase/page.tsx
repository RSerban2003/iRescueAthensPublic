import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { stripeEnabled } from "@/lib/stripe";
import { PurchaseCatalog, type PhoneDto } from "./PurchaseCatalog";

export const metadata: Metadata = {
  title: "Buy a refurbished phone",
  description:
    "Hand-checked refurbished phones with warranty. Reserve online, pay in store or by card.",
};

export const dynamic = "force-dynamic";

export default async function PurchasePage() {
  const phones = await prisma.phoneForSale.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
  });

  const dto: PhoneDto[] = phones.map((phone) => ({
    id: phone.id,
    brand: phone.brand,
    model: phone.model,
    price: phone.price,
    condition: phone.condition,
    storage: phone.storage,
    color: phone.color,
    year: phone.year,
    description: phone.description,
    images: phone.images,
  }));

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-slate-900">Refurbished phones</h1>
        <p className="mt-2 text-slate-500">
          Every device is tested, cleaned and battery-checked. Reserve a pickup slot online — pay
          in store{stripeEnabled() ? " or by card right now" : ""}.
        </p>
      </header>
      <PurchaseCatalog phones={dto} stripeEnabled={stripeEnabled()} />
    </div>
  );
}
