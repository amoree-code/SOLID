import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client.js';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
      roles: ['admin'],
      permissions: ['items.read', 'items.create', 'items.update', 'items.delete', 'settings.read'],
    },
  });

  await prisma.item.createMany({
    data: [
      { name: 'First item', status: 'active' },
      { name: 'Second item', status: 'inactive' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded demo@example.com / password123 (verification code: 123456)');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
