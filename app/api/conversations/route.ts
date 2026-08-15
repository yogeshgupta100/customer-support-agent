import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCustomerById } from "@/lib/services/customerService";
import { createConversationRequestSchema } from "@/lib/validation/chatSchemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createConversationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const customer = await getCustomerById(parsed.data.customerId);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const conversation = await prisma.conversation.create({ data: { customerId: customer.id } });

  return NextResponse.json({
    conversationId: conversation.id,
    customer: { id: customer.id, name: customer.name, email: customer.email },
  });
}
