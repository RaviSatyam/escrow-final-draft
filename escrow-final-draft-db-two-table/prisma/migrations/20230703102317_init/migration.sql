/*
  Warnings:

  - The primary key for the `Milestone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ms_id` on the `Milestone` table. All the data in the column will be lost.
  - The primary key for the `Purchaser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `project_name` on the `Purchaser` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Purchaser` table. All the data in the column will be lost.
  - Added the required column `purchaserId` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `Purchaser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_ms_id_fkey";

-- AlterTable
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_pkey",
DROP COLUMN "ms_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "purchaserId" INTEGER NOT NULL,
ADD CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Purchaser" DROP CONSTRAINT "Purchaser_pkey",
DROP COLUMN "project_name",
DROP COLUMN "user_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "projectName" TEXT NOT NULL,
ADD CONSTRAINT "Purchaser_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "Purchaser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
