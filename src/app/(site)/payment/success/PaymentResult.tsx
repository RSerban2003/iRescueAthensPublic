"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatEUR } from "@/lib/format";

interface VerifiedBooking {
  id: string;
  date: string;
  timeSlot: string;
  device: string;
  totalAmount: number | null;
}

type State =
  | { status: "verifying" }
  | { status: "paid"; booking: VerifiedBooking }
  | { status: "unpaid" }
  | { status: "error" };

export function PaymentResult() {
  const sessionId = useSearchParams().get("session_id");
  const [state, setState] = useState<State>({ status: "verifying" });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error" });
      return;
    }

    let cancelled = false;
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) setState({ status: "error" });
        else if (data.paid) setState({ status: "paid", booking: data.booking });
        else setState({ status: "unpaid" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.status === "verifying") {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <Spinner className="h-8 w-8 text-brand-600" />
        <p className="text-slate-600">Confirming your payment…</p>
      </Card>
    );
  }

  if (state.status === "paid") {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        <h1 className="font-display text-2xl font-bold text-slate-900">Payment received</h1>
        <p className="mt-2 text-slate-600">
          {state.booking.device}
          {state.booking.totalAmount ? ` — ${formatEUR(state.booking.totalAmount)}` : ""}
        </p>
        <p className="mt-1 font-medium text-slate-700">
          Pickup: {formatDate(state.booking.date)} at {state.booking.timeSlot}
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Reference <span className="font-mono font-semibold text-slate-700">{state.booking.id}</span>
          <br />
          A confirmation has been recorded — bring a photo ID to pickup.
        </p>
        <div className="mt-6">
          <Button href="/">Back to home</Button>
        </div>
      </Card>
    );
  }

  if (state.status === "unpaid") {
    return (
      <Card className="p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Payment not completed</h1>
        <p className="mt-2 text-slate-600">
          Your payment hasn&apos;t gone through yet. You can try again from the phone listing, or
          choose pay-in-store at pickup.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/purchase" variant="outline">
            Back to phones
          </Button>
          <Button href="/contact">Contact us</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-900">
        We couldn&apos;t verify this payment
      </h1>
      <p className="mt-2 text-slate-600">
        If you were charged, don&apos;t worry — we&apos;ll reconcile it on our side. Reach out and
        we&apos;ll sort it out quickly.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button href="/purchase" variant="outline">
          Back to phones
        </Button>
        <Button href="/contact">Contact us</Button>
      </div>
    </Card>
  );
}
