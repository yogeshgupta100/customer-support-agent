import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runAgentTurn, type ChatTurn } from "@/lib/agent/orchestrator";
import { AgentError } from "@/lib/agent/errors";
import { chatRequestSchema } from "@/lib/validation/chatSchemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { conversationId, message } = parsed.data;

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const priorMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  const history: ChatTurn[] = priorMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  await prisma.message.create({ data: { conversationId, role: "USER", content: message } });
  history.push({ role: "user", content: message });

  try {
    const result = await runAgentTurn({
      conversationId,
      customerId: conversation.customerId,
      history,
    });

    await prisma.message.create({ data: { conversationId, role: "ASSISTANT", content: result.reply } });

    return NextResponse.json({ reply: result.reply, decision: result.decision ?? null });
  } catch (err) {
    if (err instanceof AgentError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("Unexpected error in /api/chat:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
