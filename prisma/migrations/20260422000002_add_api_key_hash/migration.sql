-- Add keyHash column to ApiKey table
ALTER TABLE "ApiKey" ADD COLUMN "keyHash" TEXT NOT NULL DEFAULT '';

-- Create unique index on keyHash
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- Backfill keyHash for existing keys (if any)
UPDATE "ApiKey" SET "keyHash" = encode(digest("key", 'sha256'), 'hex') WHERE "keyHash" = '';
