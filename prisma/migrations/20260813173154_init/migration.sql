-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'DELIVERED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AgentLogStatus" AS ENUM ('STARTED', 'SUCCESS', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "AgentEventType" AS ENUM ('REQUEST_RECEIVED', 'CUSTOMER_LOOKUP_STARTED', 'CUSTOMER_LOOKUP_SUCCESS', 'CUSTOMER_LOOKUP_FAILED', 'ORDER_LOOKUP_STARTED', 'ORDER_LOOKUP_SUCCESS', 'ORDER_LOOKUP_FAILED', 'POLICY_RETRIEVED', 'ELIGIBILITY_CHECK_STARTED', 'ELIGIBILITY_CHECK_RESULT', 'REFUND_PROCESS_STARTED', 'REFUND_PROCESSED', 'REFUND_DENIED', 'TOOL_FAILED', 'TOOL_RETRY', 'AGENT_COMPLETED', 'AGENT_ERROR');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "paymentMethod" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundPolicy" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refundWindowDays" INTEGER NOT NULL,
    "nonRefundableCategories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "requestedAmountCents" INTEGER NOT NULL,
    "refundAmountCents" INTEGER NOT NULL,
    "status" "RefundRequestStatus" NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "policyVersion" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" "AgentEventType" NOT NULL,
    "toolName" TEXT,
    "status" "AgentLogStatus" NOT NULL,
    "durationMs" INTEGER,
    "retryAttempt" INTEGER,
    "message" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundPolicy_version_key" ON "RefundPolicy"("version");

-- CreateIndex
CREATE INDEX "RefundPolicy_isActive_idx" ON "RefundPolicy"("isActive");

-- CreateIndex
CREATE INDEX "RefundRequest_orderId_idx" ON "RefundRequest"("orderId");

-- CreateIndex
CREATE INDEX "RefundRequest_customerId_idx" ON "RefundRequest"("customerId");

-- CreateIndex
CREATE INDEX "Conversation_customerId_idx" ON "Conversation"("customerId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "AgentLog_conversationId_idx" ON "AgentLog"("conversationId");

-- CreateIndex
CREATE INDEX "AgentLog_timestamp_idx" ON "AgentLog"("timestamp");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
