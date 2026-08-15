export interface ToolContext {
  conversationId: string;
  customerId: string;
}

export interface ToolExecutionResult {
  output: unknown;
  isError: boolean;
}
