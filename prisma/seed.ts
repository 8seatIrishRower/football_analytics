import { PrismaClient, TestValueType, TeamLevel } from "@prisma/client";

const prisma = new PrismaClient();

// Starting teams. Add more any time from the Teams page — this just saves
// a step for the two you already know you want tracked.
const teams = [
  { name: "My Team", level: TeamLevel.YOUTH },
  { name: "Notre Dame", level: TeamLevel.COLLEGE },
];

// Test types the entry form offers. Add more rows here any time — no
// deploy needed beyond re-running the seed (or add them straight to the
// database) since testing_results.test_type_id just references this table.
const testTypes = [
  {
    name: "10-yard sprint",
    unit: "seconds",
    valueType: TestValueType.TIME,
    lowerIsBetter: true,
    sortOrder: 1,
  },
  {
    name: "20-yard sprint",
    unit: "seconds",
    valueType: TestValueType.TIME,
    lowerIsBetter: true,
    sortOrder: 2,
  },
  {
    name: "Broad Jump",
    unit: "inches",
    valueType: TestValueType.DISTANCE,
    lowerIsBetter: false,
    sortOrder: 3,
  },
  {
    name: "Shuttle Run",
    unit: "seconds",
    valueType: TestValueType.TIME,
    lowerIsBetter: true,
    sortOrder: 4,
  },
];

async function main() {
  for (const testType of testTypes) {
    await prisma.testType.upsert({
      where: { name: testType.name },
      update: testType,
      create: testType,
    });
  }
  console.log(`Seeded ${testTypes.length} test type(s).`);

  for (const team of teams) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: {},
      create: team,
    });
  }
  console.log(`Seeded ${teams.length} team(s).`);

  // Any pre-existing player with no team (from before Teams existed) is
  // assumed to belong to the coach's own youth roster.
  const myTeam = await prisma.team.findUniqueOrThrow({ where: { name: "My Team" } });
  const { count } = await prisma.player.updateMany({
    where: { teamId: null },
    data: { teamId: myTeam.id },
  });
  if (count > 0) {
    console.log(`Assigned ${count} existing player(s) to "My Team".`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
