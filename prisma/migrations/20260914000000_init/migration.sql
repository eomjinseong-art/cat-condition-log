-- CreateEnum
CREATE TYPE "Appetite" AS ENUM ('NONE', 'LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "WaterIntake" AS ENUM ('LITTLE', 'NORMAL', 'MUCH');

-- CreateEnum
CREATE TYPE "StoolQuality" AS ENUM ('NONE', 'HARD', 'NORMAL', 'SOFT', 'DIARRHEA');

-- CreateEnum
CREATE TYPE "Urine" AS ENUM ('LITTLE', 'NORMAL', 'MUCH', 'BLOOD');

-- CreateEnum
CREATE TYPE "Energy" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('MEDS', 'VACCINE', 'DEWORMING', 'LITTER_CHANGE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "disclaimerAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" DATE,
    "weightKg" DECIMAL(6,2),
    "photoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "loggedOn" DATE NOT NULL,
    "appetite" "Appetite",
    "foodNote" TEXT,
    "water" "WaterIntake",
    "stoolCount" INTEGER,
    "stoolQuality" "StoolQuality",
    "urine" "Urine",
    "vomit" BOOLEAN,
    "vomitNote" TEXT,
    "vomitPhotoUrl" TEXT,
    "energy" "Energy",
    "weightKg" DECIMAL(6,2),
    "memo" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "dueOn" DATE NOT NULL,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT,
    "logId" TEXT,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'photo',
    "filename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cats_userId_idx" ON "cats"("userId");

-- CreateIndex
CREATE INDEX "logs_userId_loggedOn_idx" ON "logs"("userId", "loggedOn");

-- CreateIndex
CREATE INDEX "logs_userId_catId_idx" ON "logs"("userId", "catId");

-- CreateIndex
CREATE UNIQUE INDEX "logs_catId_loggedOn_key" ON "logs"("catId", "loggedOn");

-- CreateIndex
CREATE INDEX "reminders_userId_dueOn_idx" ON "reminders"("userId", "dueOn");

-- CreateIndex
CREATE INDEX "media_userId_idx" ON "media"("userId");

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_logId_fkey" FOREIGN KEY ("logId") REFERENCES "logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
