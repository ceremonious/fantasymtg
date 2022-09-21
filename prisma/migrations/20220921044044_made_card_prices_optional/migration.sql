/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "CardPrice" ALTER COLUMN "amountNormal" DROP NOT NULL,
ALTER COLUMN "amountFoil" DROP NOT NULL;

-- DropTable
DROP TABLE "Example";
