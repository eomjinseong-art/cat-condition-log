-- CreateEnum
CREATE TYPE "ChangeLevel" AS ENUM ('LESS', 'SAME', 'MORE');

-- CreateEnum
CREATE TYPE "Mobility" AS ENUM ('GOOD', 'STIFF', 'PAIN', 'HARD');

-- CreateEnum
CREATE TYPE "NightVocal" AS ENUM ('NONE', 'SOME', 'MUCH');

-- CreateEnum
CREATE TYPE "MedFrequency" AS ENUM ('DAILY', 'TIMES_PER_DAY', 'WEEKDAYS', 'EVERY_N_DAYS');

-- CreateEnum
CREATE TYPE "FluidSite" AS ENUM ('LEFT_SCRUFF', 'RIGHT_SCRUFF', 'OTHER');

-- AlterTable
ALTER TABLE "cats" ADD COLUMN "seniorCare" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cats" ADD COLUMN "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "logs" ADD COLUMN "waterChange" "ChangeLevel";
ALTER TABLE "logs" ADD COLUMN "urineChange" "ChangeLevel";
ALTER TABLE "logs" ADD COLUMN "mobility" "Mobility";
ALTER TABLE "logs" ADD COLUMN "nightVocal" "NightVocal";

-- CreateTable
CREATE TABLE "medication_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "doseNotes" TEXT,
    "frequency" "MedFrequency" NOT NULL,
    "timesPerDay" INTEGER,
    "weekdays" TEXT,
    "intervalDays" INTEGER,
    "startOn" DATE,
    "endOn" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_doses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "takenOn" DATE NOT NULL,
    "slot" INTEGER NOT NULL DEFAULT 0,
    "givenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_doses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "visitOn" DATE NOT NULL,
    "clinicName" TEXT,
    "reason" TEXT,
    "reminderOn" DATE,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "takenOn" DATE NOT NULL,
    "creatinine" DECIMAL(8,3),
    "sdma" DECIMAL(8,2),
    "bun" DECIMAL(8,2),
    "phosphorus" DECIMAL(8,2),
    "t4" DECIMAL(8,2),
    "bloodPressure" INTEGER,
    "weightKg" DECIMAL(6,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fluid_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "givenOn" DATE NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "site" "FluidSite",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fluid_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medication_plans_userId_catId_idx" ON "medication_plans"("userId", "catId");

-- CreateIndex
CREATE UNIQUE INDEX "medication_doses_planId_takenOn_slot_key" ON "medication_doses"("planId", "takenOn", "slot");

-- CreateIndex
CREATE INDEX "medication_doses_userId_takenOn_idx" ON "medication_doses"("userId", "takenOn");

-- CreateIndex
CREATE INDEX "visits_userId_visitOn_idx" ON "visits"("userId", "visitOn");

-- CreateIndex
CREATE INDEX "lab_entries_userId_catId_takenOn_idx" ON "lab_entries"("userId", "catId", "takenOn");

-- CreateIndex
CREATE INDEX "fluid_logs_userId_catId_givenOn_idx" ON "fluid_logs"("userId", "catId", "givenOn");

-- AddForeignKey
ALTER TABLE "medication_plans" ADD CONSTRAINT "medication_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_plans" ADD CONSTRAINT "medication_plans_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_doses" ADD CONSTRAINT "medication_doses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_doses" ADD CONSTRAINT "medication_doses_planId_fkey" FOREIGN KEY ("planId") REFERENCES "medication_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_doses" ADD CONSTRAINT "medication_doses_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_entries" ADD CONSTRAINT "lab_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_entries" ADD CONSTRAINT "lab_entries_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fluid_logs" ADD CONSTRAINT "fluid_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fluid_logs" ADD CONSTRAINT "fluid_logs_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
