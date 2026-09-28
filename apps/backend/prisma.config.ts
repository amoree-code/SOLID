import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prisma CLI uses the direct URL for migrations and introspection.
    // Runtime queries use DATABASE_URL in PrismaService.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
