import { prisma } from "@/lib/db/prisma";
import type { EligibilityPolicy } from "@/types/refund";

export async function getActivePolicy(): Promise<EligibilityPolicy> {
  const policy = await prisma.refundPolicy.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
  });

  if (!policy) {
    throw new Error("No active refund policy is configured.");
  }

  return {
    version: policy.version,
    refundWindowDays: policy.refundWindowDays,
    nonRefundableCategories: policy.nonRefundableCategories,
  };
}

export interface RefundPolicyDescription extends EligibilityPolicy {
  rules: string[];
}

export function describePolicy(policy: EligibilityPolicy): RefundPolicyDescription {
  return {
    ...policy,
    rules: [
      "Order must exist and belong to the requesting customer.",
      `Refund must be requested within ${policy.refundWindowDays} days of delivery.`,
      policy.nonRefundableCategories.length > 0
        ? `Non-refundable categories: ${policy.nonRefundableCategories.join(", ")}.`
        : "No categories are excluded from refunds.",
      "An order that has already been refunded cannot be refunded again.",
      "Refund amount equals the original order amount exactly (no partial refunds).",
    ],
  };
}
