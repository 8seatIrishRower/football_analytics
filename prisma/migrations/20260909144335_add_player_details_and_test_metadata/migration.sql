/*
  Warnings:

  - You are about to drop the column `birthYear` on the `players` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestValueType" AS ENUM ('TIME', 'DISTANCE');

-- CreateEnum
CREATE TYPE "PadLevel" AS ENUM ('FULL_PADS_HELMET', 'FULL_PADS_NO_HELMET', 'NO_PADS_NO_HELMET');

-- AlterTable
ALTER TABLE "players" DROP COLUMN "birthYear",
ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "emergencyMedicalNotes" TEXT,
ADD COLUMN     "guardian1Email" TEXT,
ADD COLUMN     "guardian1Name" TEXT,
ADD COLUMN     "guardian1Phone" TEXT,
ADD COLUMN     "guardian2Email" TEXT,
ADD COLUMN     "guardian2Name" TEXT,
ADD COLUMN     "guardian2Phone" TEXT,
ADD COLUMN     "heightInches" DOUBLE PRECISION,
ADD COLUMN     "weightLbs" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "test_types" ADD COLUMN     "valueType" "TestValueType" NOT NULL DEFAULT 'TIME';

-- AlterTable
ALTER TABLE "testing_results" ADD COLUMN     "padLevel" "PadLevel";
