import { prisma } from "@/lib/db/prisma";

export async function getOrderById(id: string) {
  return prisma.order.findUnique({ where: { id } });
}

export async function listOrdersForCustomer(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { orderDate: "desc" },
  });
}

export async function hasApprovedRefund(orderId: string) {
  const approved = await prisma.refundRequest.findFirst({
    where: { orderId, status: "APPROVED" },
  });
  return approved !== null;
}
