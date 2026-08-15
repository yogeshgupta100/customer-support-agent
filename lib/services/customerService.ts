import { prisma } from "@/lib/db/prisma";

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function listCustomers() {
  return prisma.customer.findMany({ orderBy: { name: "asc" } });
}
