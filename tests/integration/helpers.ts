import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/client";

export async function createTestCustomer(overrides: Partial<{ name: string; email: string; phone: string }> = {}) {
  return prisma.customer.create({
    data: {
      name: overrides.name ?? "Test Customer",
      email: overrides.email ?? `test-${randomUUID()}@example.com`,
      phone: overrides.phone ?? "+1-000-000-0000",
    },
  });
}

export async function createTestOrder(
  customerId: string,
  overrides: Partial<{
    product: string;
    category: string;
    amountCents: number;
    orderDate: Date;
    deliveryDate: Date | null;
    paymentMethod: string;
    status: OrderStatus;
  }> = {},
) {
  return prisma.order.create({
    data: {
      customerId,
      product: overrides.product ?? "Test Product",
      category: overrides.category ?? "Electronics",
      amountCents: overrides.amountCents ?? 5000,
      orderDate: overrides.orderDate ?? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deliveryDate:
        overrides.deliveryDate === undefined
          ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          : overrides.deliveryDate,
      paymentMethod: overrides.paymentMethod ?? "Credit Card",
      status: overrides.status ?? "DELIVERED",
    },
  });
}

export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export async function createTestConversation(customerId: string) {
  return prisma.conversation.create({ data: { customerId } });
}
