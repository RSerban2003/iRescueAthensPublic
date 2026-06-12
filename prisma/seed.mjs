/**
 * Demo seed: a demo admin account, two weeks of bookable days, refurbished
 * inventory, and bookings/sell-requests in various states.
 *
 * Re-running the seed RESETS all demo data (this is a demo database).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@demo.com";
const ADMIN_PASSWORD = "demo-admin-123"; // demo-only credentials, documented in the README

function utcDate(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

const PHONES = [
  {
    brand: "Apple", model: "iPhone 14 Pro", price: 689, condition: "LIKE_NEW",
    storage: "256 GB", color: "Deep Purple", year: 2022,
    description: "Battery health 96%. Always used with a case — virtually no signs of wear.",
    images: ["/images/phones/iphone-14-pro.jpg"],
  },
  {
    brand: "Apple", model: "iPhone 13 Pro", price: 519, condition: "EXCELLENT",
    storage: "128 GB", color: "Sierra Blue", year: 2021,
    description: "Battery health 91%. Tiny mark on the frame, screen flawless.",
    images: ["/images/phones/iphone-13-pro.jpg"],
  },
  {
    brand: "Apple", model: "iPhone 12", price: 309, condition: "GOOD",
    storage: "128 GB", color: "Black", year: 2020,
    description: "New battery fitted in-house. Light scratches on the back glass.",
    images: ["/images/phones/iphone-12.jpg"],
  },
  {
    brand: "Apple", model: "iPhone 11", price: 219, condition: "GOOD",
    storage: "64 GB", color: "White", year: 2019,
    description: "Great starter iPhone. Screen replaced with a high-grade panel, 6-month warranty.",
    images: [],
  },
  {
    brand: "Samsung", model: "Galaxy S23", price: 549, condition: "LIKE_NEW",
    storage: "256 GB", color: "Phantom Black", year: 2023,
    description: "Open-box condition with original charger and box.",
    images: [],
  },
  {
    brand: "Samsung", model: "Galaxy S22", price: 379, condition: "EXCELLENT",
    storage: "128 GB", color: "Bora Purple", year: 2022,
    description: "Battery health 93%. One owner, no repairs.",
    images: [],
  },
  {
    brand: "Samsung", model: "Galaxy A54", price: 239, condition: "EXCELLENT",
    storage: "128 GB", color: "Awesome Lime", year: 2023,
    description: "Barely used mid-ranger — 5G, great camera for the price.",
    images: [],
  },
  {
    brand: "Xiaomi", model: "Redmi Note 12 Pro", price: 199, condition: "LIKE_NEW",
    storage: "256 GB", color: "Sky Blue", year: 2023,
    description: "As new in box. 120 Hz AMOLED, 67 W fast charging.",
    images: [],
  },
  {
    brand: "Xiaomi", model: "Mi 11", price: 229, condition: "GOOD",
    storage: "256 GB", color: "Horizon Blue", year: 2021,
    description: "Flagship specs at a friendly price. Minor wear on corners.",
    images: [],
  },
  {
    brand: "Google", model: "Pixel 7", price: 339, condition: "EXCELLENT",
    storage: "128 GB", color: "Snow", year: 2022,
    description: "Clean Android, brilliant camera. Battery health 94%.",
    images: [],
  },
];

async function main() {
  console.log("Resetting demo data…");
  await prisma.booking.deleteMany();
  await prisma.phoneListing.deleteMany();
  await prisma.phoneForSale.deleteMany();
  await prisma.availableDay.deleteMany();
  await prisma.availabilityConfig.deleteMany();

  // ── Demo admin ──────────────────────────────────────────────────────────
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, name: "Demo Admin", password, role: "ADMIN" },
    update: { password, role: "ADMIN" },
  });
  console.log(`Admin user: ${ADMIN_EMAIL}`);

  // ── Booking availability: next 14 days except Sundays ──────────────────
  const days = [];
  for (let offset = 1; offset <= 14; offset++) {
    const date = utcDate(offset);
    if (date.getUTCDay() === 0) continue; // closed on Sundays
    days.push({ date, isActive: true });
  }
  await prisma.availableDay.createMany({ data: days });

  await prisma.availabilityConfig.create({
    data: {
      slots: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
    },
  });
  console.log(`Open days: ${days.length}, slots: 10`);

  // ── Refurbished inventory ───────────────────────────────────────────────
  const phones = [];
  for (const phone of PHONES) {
    phones.push(await prisma.phoneForSale.create({ data: phone }));
  }
  console.log(`Phones in stock: ${phones.length}`);

  // ── Bookings in assorted states ─────────────────────────────────────────
  const bookings = [
    {
      type: "REPAIR", status: "PENDING", date: utcDate(2), timeSlot: "11:00",
      name: "Maria Papadopoulou", email: "maria.demo@example.com", phone: "+30 690 000 0001",
      brand: "Apple", model: "iPhone 13", issues: ["Screen repair"],
      totalAmount: 179, paymentMethod: "IN_STORE",
      notes: "Screen cracked in the corner, touch still works.",
    },
    {
      type: "REPAIR", status: "CONFIRMED", date: utcDate(3), timeSlot: "16:00",
      name: "Nikos Georgiou", email: "nikos.demo@example.com", phone: "+30 690 000 0002",
      brand: "Samsung", model: "S21 FE", issues: ["Battery replacement", "Charging port repair"],
      totalAmount: 105, paymentMethod: "IN_STORE",
    },
    {
      type: "REPAIR", status: "COMPLETED", date: utcDate(-4), timeSlot: "12:00",
      name: "Eleni Dimitriou", email: "eleni.demo@example.com", phone: "+30 690 000 0003",
      brand: "Xiaomi", model: "Redmi Note 11", issues: ["Screen repair"],
      totalAmount: 109, paymentMethod: "IN_STORE",
    },
    {
      type: "REPAIR", status: "CANCELLED", date: utcDate(-2), timeSlot: "10:00",
      name: "Kostas Ioannou", email: "kostas.demo@example.com", phone: "+30 690 000 0004",
      brand: "Apple", model: "iPhone XR", issues: ["Battery replacement"],
      totalAmount: 49, paymentMethod: "IN_STORE",
      notes: "Customer rescheduled — will rebook next week.",
    },
    {
      type: "PURCHASE", status: "CONFIRMED", date: utcDate(2), timeSlot: "18:00",
      name: "Sofia Alexiou", email: "sofia.demo@example.com", phone: "+30 690 000 0005",
      brand: phones[1].brand, model: phones[1].model,
      totalAmount: phones[1].price, paymentMethod: "IN_STORE", paymentStatus: "PENDING",
      phoneForSaleId: phones[1].id,
    },
    {
      type: "PURCHASE", status: "COMPLETED", date: utcDate(-7), timeSlot: "13:00",
      name: "Giorgos Vasileiou", email: "giorgos.demo@example.com", phone: "+30 690 000 0006",
      brand: "Apple", model: "iPhone SE 2022",
      totalAmount: 189, paymentMethod: "ONLINE", paymentStatus: "PAID",
    },
  ];
  await prisma.booking.createMany({ data: bookings });
  console.log(`Bookings: ${bookings.length}`);

  // ── Sell requests ───────────────────────────────────────────────────────
  const listings = [
    {
      brand: "Apple", model: "iPhone 12 Mini", storage: "128 GB", condition: "GOOD",
      askingPrice: 220, status: "PENDING",
      description: "Battery at 85%, small scratch on screen. Box and cable included.",
      name: "Dimitra Nikolaou", email: "dimitra.demo@example.com", phone: "+30 690 000 0007",
      images: [],
    },
    {
      brand: "Samsung", model: "Galaxy S20", storage: "128 GB", condition: "FAIR",
      askingPrice: 130, status: "PENDING",
      description: "Works fine but the back glass is cracked.",
      name: "Petros Antoniou", email: "petros.demo@example.com", phone: "+30 690 000 0008",
      images: [],
    },
    {
      brand: "Apple", model: "iPhone 13 Pro Max", storage: "256 GB", condition: "EXCELLENT",
      askingPrice: 520, status: "APPROVED",
      description: "Pristine, always in a case with screen protector.",
      name: "Anna Karagianni", email: "anna.demo@example.com", phone: "+30 690 000 0009",
      images: [],
    },
    {
      brand: "Xiaomi", model: "Poco X4 Pro", storage: "128 GB", condition: "GOOD",
      askingPrice: 95, status: "SOLD",
      name: "Vasilis Markou", email: "vasilis.demo@example.com", phone: "+30 690 000 0010",
      images: [],
    },
    {
      brand: "Huawei", model: "P30 Lite", storage: "128 GB", condition: "FAIR",
      askingPrice: 150, status: "REJECTED",
      description: "Declined: asking price above market for the condition.",
      name: "Christina Pappa", email: "christina.demo@example.com", phone: "+30 690 000 0011",
      images: [],
    },
  ];
  await prisma.phoneListing.createMany({ data: listings });
  console.log(`Sell requests: ${listings.length}`);

  console.log("\nSeed complete. Sign in at /login with:");
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
