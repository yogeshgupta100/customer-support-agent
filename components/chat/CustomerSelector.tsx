"use client";

import type { CustomerSummary } from "@/types/chat";

interface CustomerSelectorProps {
  customers: CustomerSummary[];
  selectedCustomerId: string | null;
  onSelect: (customerId: string) => void;
  disabled?: boolean;
}

export function CustomerSelector({
  customers,
  selectedCustomerId,
  onSelect,
  disabled,
}: CustomerSelectorProps) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-sm">
      <span className="text-foreground-muted whitespace-nowrap">Acting as</span>
      <select
        className="min-w-0 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground shadow-sm outline-none focus:border-accent disabled:opacity-50"
        value={selectedCustomerId ?? ""}
        disabled={disabled}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          Select a customer&hellip;
        </option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
    </label>
  );
}
