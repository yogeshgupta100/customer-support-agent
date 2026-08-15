import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { armFailureInjection } from "@/lib/agent/debugFailureInjection";
import { TOOL_NAMES } from "@/lib/agent/tools";

const bodySchema = z.object({
  conversationId: z.string().min(1),
  toolName: z.enum(TOOL_NAMES),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { conversationId, toolName } = parsed.data;

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  armFailureInjection(conversationId, toolName);

  return NextResponse.json({ armed: true, conversationId, toolName });
}
