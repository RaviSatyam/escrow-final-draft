/*
  Warnings:

  - You are about to drop the `Blocker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Blocker";

-- CreateTable
CREATE TABLE "Purchaser" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,

    CONSTRAINT "Purchaser_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "ms_id" SERIAL NOT NULL,
    "budget" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "no_revision" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("ms_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchaser_email_key" ON "Purchaser"("email");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_ms_id_fkey" FOREIGN KEY ("ms_id") REFERENCES "Purchaser"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
