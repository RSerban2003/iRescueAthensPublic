-- PostgreSQL schema for iRescue application

-- Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "timeSlot" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "type" TEXT NOT NULL,
  "brand" TEXT,
  "model" TEXT,
  "issues" TEXT,
  "totalAmount" REAL,
  "paymentMethod" TEXT,
  "paymentStatus" TEXT,
  "stripePaymentIntentId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- AdminUser table
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- PhoneListing table
CREATE TABLE IF NOT EXISTS "PhoneListing" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "price" REAL NOT NULL,
  "condition" TEXT NOT NULL,
  "storage" TEXT NOT NULL,
  "description" TEXT,
  "images" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "username" TEXT UNIQUE,
  "password" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- PhoneForSale table
CREATE TABLE IF NOT EXISTS "PhoneForSale" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "price" REAL NOT NULL,
  "condition" TEXT NOT NULL,
  "storage" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "description" TEXT,
  "images" TEXT NOT NULL,
  "year" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
); 