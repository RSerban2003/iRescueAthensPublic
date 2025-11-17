-- Check if the table exists first
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE tablename = 'AvailableHours'
  ) THEN
    -- Create the AvailableHours table if it doesn't exist
    CREATE TABLE "AvailableHours" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "hours" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Add UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add initial default hours if no records exist
INSERT INTO "AvailableHours" ("id", "hours", "isActive")
SELECT 
  uuid_generate_v4(), 
  '09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM "AvailableHours" WHERE "isActive" = true
); 