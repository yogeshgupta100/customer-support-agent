import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/services/customerService";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json({
    customers: customers.map((c) => ({ id: c.id, name: c.name, email: c.email })),
  });
}
