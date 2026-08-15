export type ReasonCode =
  | "OK"
  | "WINDOW_EXPIRED"
  | "NON_REFUNDABLE_CATEGORY"
  | "ALREADY_REFUNDED"
  | "ORDER_NOT_FOUND"
  | "CUSTOMER_MISMATCH";

export interface EligibilityOrder {
  id: string;
  customerId: string;
  category: string;
  amountCents: number;
  deliveryDate: Date | null;
  status: "PLACED" | "DELIVERED" | "REFUNDED";
}

export interface EligibilityPolicy {
  version: number;
  refundWindowDays: number;
  nonRefundableCategories: string[];
}

export interface EligibilityDecision {
  eligible: boolean;
  reasonCode: ReasonCode;
  reason: string;
  refundAmountCents: number;
  policyVersion: number;
}
