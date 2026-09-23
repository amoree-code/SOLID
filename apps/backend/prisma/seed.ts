import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client.js';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Idempotent: only seeds an empty table, so re-running never duplicates rows.
  if ((await prisma.exampleResource.count()) > 0) {
    console.log('example_resources already has rows — skipping seed.');
    return;
  }

  await prisma.exampleResource.createMany({
    data: [
      { name: 'First example', status: 'active' },
      { name: 'Second example', status: 'inactive' },
    ],
  });

  console.log('Seeded 2 example resources.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
