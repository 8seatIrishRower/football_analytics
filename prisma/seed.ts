import { PrismaClient, TestValueType } from "@prisma/client";

const prisma = new PrismaClient();

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
