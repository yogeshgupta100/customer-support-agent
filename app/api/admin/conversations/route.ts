import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    where: { messages: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { id: true, name: true, email: true } },
      _count: { select: { messages: true, agentLogs: true } },
    },
  });

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      customer: c.customer,
      messageCount: c._count.messages,
      logCount: c._count.agentLogs,
    })),
  });
}
