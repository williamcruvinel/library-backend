/*
  Warnings:

  - You are about to drop the `BookCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CopyReservation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookCategory" DROP CONSTRAINT "BookCategory_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BookCategory" DROP CONSTRAINT "BookCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CopyReservation" DROP CONSTRAINT "CopyReservation_copyId_fkey";

-- DropForeignKey
ALTER TABLE "CopyReservation" DROP CONSTRAINT "CopyReservation_reservationId_fkey";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "categories" TEXT[];

-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "reservationId" INTEGER;

-- DropTable
DROP TABLE "BookCategory";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "CopyReservation";

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
