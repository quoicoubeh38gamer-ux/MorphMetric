-- AlterEnum: add the Premium tier
ALTER TYPE "Plan" ADD VALUE 'PREMIUM';

-- A Stripe customer/subscription must map to at most one local subscription.
-- This makes webhook lookups unambiguous and blocks duplicate-mapping abuse.
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- Retention sweeps scan by deletion deadline.
CREATE INDEX "Scan_deleteAt_idx" ON "Scan"("deleteAt");
