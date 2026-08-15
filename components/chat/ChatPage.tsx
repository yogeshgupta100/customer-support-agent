"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, CustomerSummary } from "@/types/chat";
import { CustomerSelector } from "@/components/chat/CustomerSelector";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { LoadingIndicator } from "@/components/chat/LoadingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/Button";

function newId(): string {
  return crypto.randomUUID();
}

export function ChatPage() {
  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data: { customers: CustomerSummary[] }) => setCustomers(data.customers))
      .catch(() => setError("Could not load the customer list. Please refresh the page."));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function startConversation(customerId: string) {
    setIsSwitching(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error("Failed to start a conversation.");
      const data: { conversationId: string } = await res.json();
      setConversationId(data.conversationId);
      setMessages([]);
    } catch {
      setError("Could not start a conversation. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  }

  function handleSelectCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    void startConversation(customerId);
  }

  function handleNewConversation() {
    if (!selectedCustomerId) return;
    void startConversation(selectedCustomerId);
  }

  async function handleSend(text: string) {
    if (!conversationId) return;

    setError(null);
    setMessages((prev) => [...prev, { id: newId(), role: "user", content: text }]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: data.reply, decision: data.decision ?? undefined },
      ]);
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  }

  const canChat = Boolean(conversationId) && !isSwitching;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col px-4 py-4 sm:py-6">
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium italic text-foreground">
            Refund Support
          </h1>
          <p className="text-xs text-foreground-muted">AI-assisted refund requests</p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {customers ? (
            <CustomerSelector
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onSelect={handleSelectCustomer}
              disabled={isSwitching}
            />
          ) : (
            <span className="text-sm text-foreground-muted">Loading customers…</span>
          )}
          <Button
            variant="secondary"
            onClick={handleNewConversation}
            disabled={!selectedCustomerId || isSwitching}
            className="shrink-0 whitespace-nowrap"
          >
            New conversation
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
        {!conversationId && !isSwitching && (
          <div className="flex flex-1 items-center justify-center text-center">
            <p className="max-w-xs text-sm text-foreground-muted">
              Select a customer above to start a conversation about a refund.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isSending && <LoadingIndicator />}

        <div ref={scrollRef} />
      </main>

      {error && (
        <div className="mb-3 rounded-lg border border-danger/30 bg-danger-tint px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="border-t border-border pt-4">
        <ChatInput
          onSend={handleSend}
          disabled={!canChat || isSending}
          placeholder={
            conversationId ? "Type a message…" : "Select a customer to begin…"
          }
        />
      </div>
    </div>
  );
}
