import type { RefundDecisionSummary } from "@/types/chat";

const REASON_LABELS: Record<string, string> = {
  OK: "Eligible",
  WINDOW_EXPIRED: "Refund window expired",
  NON_REFUNDABLE_CATEGORY: "Non-refundable category",
  ALREADY_REFUNDED: "Already refunded",
  ORDER_NOT_FOUND: "Order not found",
  CUSTOMER_MISMATCH: "Order does not belong to this account",
};

export function RefundDecisionCard({ decision }: { decision: RefundDecisionSummary }) {
  const approved = decision.eligible && decision.executed;

  return (
    <div
      className={`animate-fade-in-up mt-2 max-w-[85%] rounded-xl border-l-4 bg-surface p-4 shadow-sm ${
        approved ? "border-l-success" : "border-l-danger"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            approved ? "bg-success-tint text-success" : "bg-danger-tint text-danger"
          }`}
          aria-hidden
        >
          {approved ? "✓" : "✕"}
        </span>
        <p className={`text-sm font-semibold ${approved ? "text-success" : "text-danger"}`}>
          {approved ? "Refund approved" : "Refund denied"}
        </p>
      </div>

      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-foreground-muted">Reason</dt>
        <dd className="text-foreground">{REASON_LABELS[decision.reasonCode] ?? decision.reasonCode}</dd>
        {approved && (
          <>
            <dt className="text-foreground-muted">Amount</dt>
            <dd className="font-medium text-foreground">{decision.refundAmount}</dd>
          </>
        )}
        <dt className="text-foreground-muted">Policy</dt>
        <dd className="text-foreground-muted">v{decision.policyVersion}</dd>
      </dl>
    </div>
  );
}
