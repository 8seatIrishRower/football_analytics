/*
  Warnings:

  - You are about to drop the column `formation` on the `plays` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `plays` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plays" DROP COLUMN "formation",
DROP COLUMN "notes",
ADD COLUMN     "blitz" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ourDefenseNotes" TEXT,
ADD COLUMN     "ourFormation" TEXT,
ADD COLUMN     "ourOffenseNotes" TEXT,
ADD COLUMN     "theirDefenseNotes" TEXT,
ADD COLUMN     "theirFormation" TEXT,
ADD COLUMN     "theirOffenseNotes" TEXT;
