import { prisma } from "@/lib/db/prisma";
import { getOrderById, hasApprovedRefund } from "@/lib/services/orderService";
import { getActivePolicy } from "@/lib/services/refundPolicyService";
import { checkRefundEligibility } from "@/lib/services/eligibility";
import type { EligibilityDecision, EligibilityOrder } from "@/types/refund";
import type { Order } from "@/lib/generated/prisma/client";

async function loadEligibilityContext(orderId: string, requestingCustomerId: string) {
  const [order, policy] = await Promise.all([getOrderById(orderId), getActivePolicy()]);

  const eligibilityOrder: EligibilityOrder | null = order
    ? {
        id: order.id,
        customerId: order.customerId,
        category: order.category,
        amountCents: order.amountCents,
        deliveryDate: order.deliveryDate,
        status: order.status,
      }
    : null;

  const hasPriorApprovedRefund = order ? await hasApprovedRefund(order.id) : false;

  const decision = checkRefundEligibility({
    requestingCustomerId,
    order: eligibilityOrder,
    policy,
    hasPriorApprovedRefund,
  });

  return { order, decision };
}

export async function evaluateEligibility(
  orderId: string,
  requestingCustomerId: string,
): Promise<EligibilityDecision> {
  const { decision } = await loadEligibilityContext(orderId, requestingCustomerId);
  return decision;
}

export async function processRefund(
  orderId: string,
  requestingCustomerId: string,
): Promise<EligibilityDecision & { order: Order | null }> {
  const { order, decision } = await loadEligibilityContext(orderId, requestingCustomerId);

  if (!order) {
    return { ...decision, order: null };
  }

  const auditDataBase = {
    orderId: order.id,
    customerId: requestingCustomerId,
    requestedAmountCents: order.amountCents,
    policyVersion: decision.policyVersion,
  };

  if (!decision.eligible) {
    await prisma.refundRequest.create({
      data: {
        ...auditDataBase,
        refundAmountCents: decision.refundAmountCents,
        status: "REJECTED",
        reasonCode: decision.reasonCode,
        reason: decision.reason,
      },
    });
    return { ...decision, order };
  }

  const claim = await prisma.order.updateMany({
    where: { id: order.id, status: { not: "REFUNDED" } },
    data: { status: "REFUNDED" },
  });

  if (claim.count === 0) {
    const raceDecision: EligibilityDecision = {
      eligible: false,
      reasonCode: "ALREADY_REFUNDED",
      reason: "This order has already been refunded and cannot be refunded again.",
      refundAmountCents: 0,
      policyVersion: decision.policyVersion,
    };
    await prisma.refundRequest.create({
      data: {
        ...auditDataBase,
        refundAmountCents: 0,
        status: "REJECTED",
        reasonCode: raceDecision.reasonCode,
        reason: raceDecision.reason,
      },
    });
    const currentOrder = await getOrderById(order.id);
    return { ...raceDecision, order: currentOrder };
  }

  await prisma.refundRequest.create({
    data: {
      ...auditDataBase,
      refundAmountCents: decision.refundAmountCents,
      status: "APPROVED",
      reasonCode: decision.reasonCode,
      reason: decision.reason,
    },
  });
  const updatedOrder = await getOrderById(order.id);
  return { ...decision, order: updatedOrder };
}
