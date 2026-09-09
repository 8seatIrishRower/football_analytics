-- CreateEnum
CREATE TYPE "TeamLevel" AS ENUM ('YOUTH', 'HIGH_SCHOOL', 'COLLEGE', 'NFL');

-- CreateEnum
CREATE TYPE "GameSide" AS ENUM ('OFFENSE', 'DEFENSE', 'SPECIAL_TEAMS');

-- CreateEnum
CREATE TYPE "PlayType" AS ENUM ('RUN', 'PASS', 'PUNT', 'KICKOFF', 'FIELD_GOAL', 'EXTRA_POINT', 'TWO_POINT', 'PENALTY', 'KNEEL', 'SPIKE', 'OTHER');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('BALL_CARRIER', 'PASSER', 'RECEIVER', 'TACKLE', 'ASSIST_TACKLE', 'SACK', 'FORCED_FUMBLE', 'FUMBLE_RECOVERY', 'INTERCEPTION');

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "TeamLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "opponentName" TEXT NOT NULL,
    "playedOn" DATE NOT NULL,
    "teamScore" INTEGER,
    "opponentScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plays" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playNumber" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "down" INTEGER,
    "distance" INTEGER,
    "side" "GameSide" NOT NULL,
    "formation" TEXT,
    "playType" "PlayType" NOT NULL,
    "yardsGained" INTEGER,
    "fumble" BOOLEAN NOT NULL DEFAULT false,
    "teamScoreAfter" INTEGER,
    "opponentScoreAfter" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_participants" (
    "id" TEXT NOT NULL,
    "playId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,

    CONSTRAINT "play_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "games_teamId_idx" ON "games"("teamId");

-- CreateIndex
CREATE INDEX "plays_gameId_idx" ON "plays"("gameId");

-- CreateIndex
CREATE INDEX "play_participants_playId_idx" ON "play_participants"("playId");

-- CreateIndex
CREATE INDEX "play_participants_playerId_idx" ON "play_participants"("playerId");

-- CreateIndex
CREATE INDEX "players_teamId_idx" ON "players"("teamId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plays" ADD CONSTRAINT "plays_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_participants" ADD CONSTRAINT "play_participants_playId_fkey" FOREIGN KEY ("playId") REFERENCES "plays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_participants" ADD CONSTRAINT "play_participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
