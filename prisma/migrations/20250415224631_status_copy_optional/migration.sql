/*
  Warnings:

  - Made the column `devolutionAt` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Copy" ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "devolutionAt" SET NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL;
