/*
  Warnings:

  - Added the required column `imageURI` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scryfallURI` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setName` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "imageURI" TEXT NOT NULL,
ADD COLUMN     "scryfallURI" TEXT NOT NULL,
ADD COLUMN     "setName" TEXT NOT NULL;
