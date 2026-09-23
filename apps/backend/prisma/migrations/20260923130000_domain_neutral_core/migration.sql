-- Domain-neutral core: auth leaves the template, and the reference resource
-- gets a neutral name. Renames (not drop + create) keep any existing rows;
-- the resulting schema is exactly what `prisma/schema.prisma` declares.

-- DropTable (auth is no longer part of the core template)
DROP TABLE "users";

-- RenameEnum
ALTER TYPE "ItemStatus" RENAME TO "ExampleResourceStatus";

-- RenameTable (renaming the primary-key constraint also renames its index)
ALTER TABLE "items" RENAME TO "example_resources";
ALTER TABLE "example_resources" RENAME CONSTRAINT "items_pkey" TO "example_resources_pkey";
