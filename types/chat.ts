export interface RefundDecisionSummary {
  eligible: boolean;
  reasonCode: string;
  reason: string;
  refundAmount: string;
  policyVersion: number;
  executed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  decision?: RefundDecisionSummary;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
}
