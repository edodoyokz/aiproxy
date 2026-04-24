-- Alter ProviderConnection table to add encryptedApiKey field
ALTER TABLE "ProviderConnection" ADD COLUMN "encryptedApiKey" TEXT;
