const armed = new Map<string, Set<string>>();

export function armFailureInjection(conversationId: string, toolName: string): void {
  const set = armed.get(conversationId) ?? new Set<string>();
  set.add(toolName);
  armed.set(conversationId, set);
}

export function consumeFailureInjection(conversationId: string, toolName: string): boolean {
  const set = armed.get(conversationId);
  if (!set || !set.has(toolName)) return false;
  set.delete(toolName);
  return true;
}
