"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
          }
        }}
        disabled={disabled}
        placeholder={placeholder ?? "Type a message…"}
        rows={1}
        className="min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm outline-none placeholder:text-foreground-muted focus:border-accent disabled:opacity-50"
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
}
