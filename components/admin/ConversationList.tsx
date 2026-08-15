import type { ConversationSummary } from "@/types/admin";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return <p className="p-4 text-sm text-foreground-muted">No conversations yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border overflow-y-auto">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        return (
          <li key={conversation.id}>
            <button
              onClick={() => onSelect(conversation.id)}
              className={`w-full px-4 py-3 text-left transition-colors ${
                isSelected ? "bg-accent-soft" : "hover:bg-border/20"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{conversation.customer.name}</p>
              <p className="text-xs text-foreground-muted">
                {formatTime(conversation.createdAt)} &middot; {conversation.messageCount} messages &middot;{" "}
                {conversation.logCount} events
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
