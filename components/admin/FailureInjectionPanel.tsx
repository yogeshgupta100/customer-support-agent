"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const TOOL_OPTIONS = [
  "getCustomer",
  "getOrder",
  "getOrdersForCustomer",
  "getRefundPolicy",
  "checkRefundEligibility",
  "processRefund",
];

interface FailureInjectionPanelProps {
  conversationId: string | null;
}

export function FailureInjectionPanel({ conversationId }: FailureInjectionPanelProps) {
  const [toolName, setToolName] = useState(TOOL_OPTIONS[1]);
  const [status, setStatus] = useState<string | null>(null);
  const [isArming, setIsArming] = useState(false);

  async function handleArm() {
    if (!conversationId) return;
    setIsArming(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/simulate-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, toolName }),
      });
      if (!res.ok) throw new Error();
      setStatus(`Armed: next "${toolName}" call in this conversation will fail once, then retry.`);
    } catch {
      setStatus("Could not arm the failure. Try again.");
    } finally {
      setIsArming(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-warning/50 bg-warning-tint/40 p-3">
      <p className="text-xs font-semibold tracking-wide text-warning uppercase">
        Development / Demo Only
      </p>
      <p className="mt-1 text-xs text-foreground-muted">
        Forces the next call to the selected tool, in the selected conversation, to fail once and
        retry — a real failure through the real retry system, not a UI animation.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={toolName}
          onChange={(event) => setToolName(event.target.value)}
          className="min-w-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-accent"
        >
          {TOOL_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={handleArm}
          disabled={!conversationId || isArming}
          className="text-xs"
        >
          Simulate transient failure
        </Button>
      </div>
      {status && <p className="mt-2 text-xs text-foreground-muted">{status}</p>}
      {!conversationId && (
        <p className="mt-2 text-xs text-foreground-muted">Select a conversation first.</p>
      )}
    </div>
  );
}
