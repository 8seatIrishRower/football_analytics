-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "positions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "birthYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "lowerIsBetter" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testing_results" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "testTypeId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recordedOn" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testing_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_types_name_key" ON "test_types"("name");

-- CreateIndex
CREATE INDEX "testing_results_playerId_idx" ON "testing_results"("playerId");

-- CreateIndex
CREATE INDEX "testing_results_testTypeId_idx" ON "testing_results"("testTypeId");

-- AddForeignKey
ALTER TABLE "testing_results" ADD CONSTRAINT "testing_results_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testing_results" ADD CONSTRAINT "testing_results_testTypeId_fkey" FOREIGN KEY ("testTypeId") REFERENCES "test_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
