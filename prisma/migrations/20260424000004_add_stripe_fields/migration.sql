-- Add Stripe customer and subscription IDs to Workspace
ALTER TABLE "Workspace" ADD COLUMN "stripeCustomerId" TEXT UNIQUE;
ALTER TABLE "Workspace" ADD COLUMN "stripeSubscriptionId" TEXT;
CREATE INDEX "Workspace_stripeCustomerId_idx" ON "Workspace"("stripeCustomerId");
