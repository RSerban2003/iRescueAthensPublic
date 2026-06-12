import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toDateKey, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_TONES } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const todayStart = new Date(`${toDateKey(new Date())}T00:00:00Z`);

  const [pendingBookings, todaysBookings, pendingListings, availablePhones, recentBookings] =
    await Promise.all([
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({
        where: { date: todayStart, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.phoneListing.count({ where: { status: "PENDING" } }),
      prisma.phoneForSale.count({ where: { status: "AVAILABLE" } }),
      prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  const stats = [
    { label: "Pending bookings", value: pendingBookings, href: "/admin/bookings" },
    { label: "Appointments today", value: todaysBookings, href: "/admin/bookings" },
    { label: "Sell requests to review", value: pendingListings, href: "/admin/listings" },
    { label: "Phones in stock", value: availablePhones, href: "/admin/inventory" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="p-5">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 font-display text-3xl font-bold text-slate-900">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section aria-labelledby="recent-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-heading" className="font-display text-lg font-semibold text-slate-900">
            Latest bookings
          </h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            View all →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="New repair and purchase bookings will show up here."
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Customer</TH>
                <TH>Type</TH>
                <TH>Device</TH>
                <TH>When</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <TBody>
              {recentBookings.map((booking) => (
                <TR key={booking.id}>
                  <TD className="font-medium text-slate-900">{booking.name}</TD>
                  <TD>{booking.type === "REPAIR" ? "Repair" : "Purchase"}</TD>
                  <TD>
                    {booking.brand} {booking.model}
                  </TD>
                  <TD>
                    {formatDate(booking.date)} · {booking.timeSlot}
                  </TD>
                  <TD>
                    <Badge tone={BOOKING_STATUS_TONES[booking.status]}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>
    </div>
  );
}
