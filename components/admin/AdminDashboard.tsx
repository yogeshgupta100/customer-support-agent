"use client";

import { useEffect, useState } from "react";
import type { AgentLogEntry, ConversationSummary } from "@/types/admin";
import { ConversationList } from "@/components/admin/ConversationList";
import { LogTimeline } from "@/components/admin/LogTimeline";
import { FailureInjectionPanel } from "@/components/admin/FailureInjectionPanel";

const CONVERSATIONS_POLL_MS = 4000;
const LOGS_POLL_MS = 2000;

export function AdminDashboard() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/conversations");
        const data: { conversations: ConversationSummary[] } = await res.json();
        if (!cancelled) setConversations(data.conversations);
      } catch {}
    }

    poll();
    const interval = setInterval(poll, CONVERSATIONS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleSelectConversation(id: string) {
    setLogs([]);
    setSelectedId(id);
  }

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/admin/logs?conversationId=${selectedId}`);
        const data: { logs: AgentLogEntry[] } = await res.json();
        if (!cancelled) setLogs(data.logs);
      } catch {}
    }

    poll();
    const interval = setInterval(poll, LOGS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-5xl flex-col px-4 py-4 sm:py-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium italic text-foreground">
          Agent Execution Logs
        </h1>
        <p className="text-xs text-foreground-muted">
          Structured tool-call events per conversation — no chain-of-thought, just what the agent did.
        </p>
      </header>

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 overflow-hidden md:grid-cols-[260px_1fr]">
        <aside className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
        </aside>

        <section className="flex flex-col gap-3 overflow-hidden">
          <FailureInjectionPanel conversationId={selectedId} />
          <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-background">
            {selectedId ? (
              <LogTimeline logs={logs} />
            ) : (
              <p className="p-6 text-sm text-foreground-muted">
                Select a conversation on the left to see its execution log.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
