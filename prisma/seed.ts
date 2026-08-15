import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const POLICY_VERSION = 1;
const REFUND_WINDOW_DAYS = 30;
const NON_REFUNDABLE_CATEGORIES = ["Digital Downloads", "Perishables"];

type SeedOrder = {
  product: string;
  category: string;
  amountCents: number;
  deliveredDaysAgo: number;
  paymentMethod: string;
  alreadyRefunded?: boolean;
};

type SeedCustomer = {
  name: string;
  email: string;
  phone: string;
  note: string;
  orders: SeedOrder[];
};

const CUSTOMERS: SeedCustomer[] = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+1-415-555-0101",
    note: "DEMO: eligible refund",
    orders: [
      {
        product: "Wireless Noise-Cancelling Headphones",
        category: "Electronics",
        amountCents: 12999,
        deliveredDaysAgo: 5,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Alex Chen",
    email: "alex.chen@example.com",
    phone: "+1-415-555-0102",
    note: "DEMO: eligible refund (variant)",
    orders: [
      {
        product: "Organic Cotton T-Shirt",
        category: "Apparel",
        amountCents: 2499,
        deliveredDaysAgo: 12,
        paymentMethod: "PayPal",
      },
    ],
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "+1-415-555-0103",
    note: "DEMO: refund window expired",
    orders: [
      {
        product: "Portable Bluetooth Speaker",
        category: "Electronics",
        amountCents: 5999,
        deliveredDaysAgo: 45,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "+1-415-555-0104",
    note: "DEMO: non-refundable category",
    orders: [
      {
        product: "Complete Web Development Course",
        category: "Digital Downloads",
        amountCents: 19900,
        deliveredDaysAgo: 3,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1-415-555-0105",
    note: "DEMO: already refunded",
    orders: [
      {
        product: "Trail Running Shoes",
        category: "Footwear",
        amountCents: 8999,
        deliveredDaysAgo: 8,
        paymentMethod: "Debit Card",
        alreadyRefunded: true,
      },
    ],
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1-415-555-0106",
    note: "DEMO: multiple orders (agent must ask which one)",
    orders: [
      {
        product: "Mechanical Keyboard",
        category: "Electronics",
        amountCents: 7999,
        deliveredDaysAgo: 6,
        paymentMethod: "Credit Card",
      },
      {
        product: "USB-C Charging Cable",
        category: "Electronics",
        amountCents: 1299,
        deliveredDaysAgo: 40,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1-415-555-0107",
    note: "filler",
    orders: [
      {
        product: "Yoga Mat",
        category: "Fitness",
        amountCents: 3499,
        deliveredDaysAgo: 15,
        paymentMethod: "PayPal",
      },
    ],
  },
  {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1-415-555-0108",
    note: "filler",
    orders: [
      {
        product: "Drip Coffee Maker",
        category: "Home & Kitchen",
        amountCents: 14999,
        deliveredDaysAgo: 20,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Jessica Martinez",
    email: "jessica.martinez@example.com",
    phone: "+1-415-555-0109",
    note: "filler",
    orders: [
      {
        product: "Winter Jacket",
        category: "Apparel",
        amountCents: 15999,
        deliveredDaysAgo: 2,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Daniel Lee",
    email: "daniel.lee@example.com",
    phone: "+1-415-555-0110",
    note: "filler: non-refundable category variety",
    orders: [
      {
        product: "Fresh Organic Fruit Box",
        category: "Perishables",
        amountCents: 4500,
        deliveredDaysAgo: 4,
        paymentMethod: "Debit Card",
      },
    ],
  },
  {
    name: "Ashley Taylor",
    email: "ashley.taylor@example.com",
    phone: "+1-415-555-0111",
    note: "filler",
    orders: [
      {
        product: "LED Desk Lamp",
        category: "Home & Kitchen",
        amountCents: 3999,
        deliveredDaysAgo: 25,
        paymentMethod: "PayPal",
      },
    ],
  },
  {
    name: "Christopher Anderson",
    email: "christopher.anderson@example.com",
    phone: "+1-415-555-0112",
    note: "filler",
    orders: [
      {
        product: "Wireless Gaming Mouse",
        category: "Electronics",
        amountCents: 4999,
        deliveredDaysAgo: 7,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Amanda White",
    email: "amanda.white@example.com",
    phone: "+1-415-555-0113",
    note: "filler",
    orders: [
      {
        product: "Skincare Gift Set",
        category: "Beauty",
        amountCents: 6999,
        deliveredDaysAgo: 18,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Matthew Harris",
    email: "matthew.harris@example.com",
    phone: "+1-415-555-0114",
    note: "filler",
    orders: [
      {
        product: "Board Game Collection",
        category: "Toys & Games",
        amountCents: 5499,
        deliveredDaysAgo: 9,
        paymentMethod: "PayPal",
      },
    ],
  },
  {
    name: "Olivia Clark",
    email: "olivia.clark@example.com",
    phone: "+1-415-555-0115",
    note: "filler: non-refundable category variety",
    orders: [
      {
        product: "Digital Piano Masterclass Bundle",
        category: "Digital Downloads",
        amountCents: 8900,
        deliveredDaysAgo: 6,
        paymentMethod: "Credit Card",
      },
    ],
  },
  {
    name: "Ryan Lewis",
    email: "ryan.lewis@example.com",
    phone: "+1-415-555-0116",
    note: "filler",
    orders: [
      {
        product: "Hiking Backpack",
        category: "Outdoor",
        amountCents: 9999,
        deliveredDaysAgo: 14,
        paymentMethod: "Debit Card",
      },
    ],
  },
];

async function main() {
  console.log("Seeding refund policy...");
  await prisma.refundPolicy.upsert({
    where: { version: POLICY_VERSION },
    update: {},
    create: {
      version: POLICY_VERSION,
      isActive: true,
      refundWindowDays: REFUND_WINDOW_DAYS,
      nonRefundableCategories: NON_REFUNDABLE_CATEGORIES,
    },
  });

  console.log(`Seeding ${CUSTOMERS.length} customers...`);
  for (const c of CUSTOMERS) {
    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: { name: c.name, email: c.email, phone: c.phone },
    });

    for (const o of c.orders) {
      const deliveryDate = daysAgo(o.deliveredDaysAgo);
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          product: o.product,
          category: o.category,
          amountCents: o.amountCents,
          orderDate: daysAgo(o.deliveredDaysAgo + 2),
          deliveryDate,
          paymentMethod: o.paymentMethod,
          status: o.alreadyRefunded ? "REFUNDED" : "DELIVERED",
        },
      });

      if (o.alreadyRefunded) {
        await prisma.refundRequest.create({
          data: {
            orderId: order.id,
            customerId: customer.id,
            requestedAmountCents: o.amountCents,
            refundAmountCents: o.amountCents,
            status: "APPROVED",
            reasonCode: "OK",
            reason: "Refund approved: within policy window, eligible category, not previously refunded.",
            policyVersion: POLICY_VERSION,
          },
        });
      }
    }

    console.log(`  - ${c.name} (${c.note})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
