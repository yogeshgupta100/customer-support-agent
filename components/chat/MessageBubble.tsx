import type { ChatMessage } from "@/types/chat";
import { RefundDecisionCard } from "@/components/chat/RefundDecisionCard";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`animate-fade-in-up flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-accent text-accent-foreground rounded-br-sm"
            : "bg-surface text-foreground border border-border rounded-bl-sm shadow-sm"
        }`}
      >
        {message.content}
      </div>
      {message.decision && <RefundDecisionCard decision={message.decision} />}
    </div>
  );
}
