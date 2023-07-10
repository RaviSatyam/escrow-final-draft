-- CreateTable
CREATE TABLE "Purchaser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,

    CONSTRAINT "Purchaser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" SERIAL NOT NULL,
    "budget" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "no_revision" INTEGER NOT NULL,
    "purchaserId" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchaser_email_key" ON "Purchaser"("email");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "Purchaser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
