/*
  Warnings:

  - Added the required column `seating_capacity` to the `theaters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "theaters" ADD COLUMN     "seating_capacity" INTEGER NOT NULL;
