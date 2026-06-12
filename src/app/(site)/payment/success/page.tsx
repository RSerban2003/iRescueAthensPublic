import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "./PaymentResult";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Payment status",
};

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <Suspense fallback={<Skeleton className="h-64" />}>
        <PaymentResult />
      </Suspense>
    </div>
  );
}
