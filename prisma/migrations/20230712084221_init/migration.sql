-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PURCHASER', 'PROVIDER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Inprogress', 'Inreview', 'Completed', 'Rework', 'Forceclosed');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "account_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "About" TEXT,
    "Portfolio" TEXT,
    "attach_photo" TEXT DEFAULT 'default.png',
    "Street_Address" TEXT,
    "City" TEXT,
    "State" TEXT,
    "Postal_Code" INTEGER,
    "Country" TEXT,
    "Position_Last_Held" TEXT,
    "company" TEXT,
    "Start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "End_date" TIMESTAMP(3),
    "contract_id" TEXT[],
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" SERIAL NOT NULL,
    "project_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project_scope" TEXT NOT NULL,
    "project_decriptions" TEXT NOT NULL,
    "requirements" VARCHAR(1000),
    "terms_and_conditions" VARCHAR(1000),
    "total_fund" DOUBLE PRECISION NOT NULL,
    "duration" TIMESTAMP(3) NOT NULL,
    "deliverables" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "project_contract_id" TEXT,
    "penalty" DOUBLE PRECISION NOT NULL,
    "fund_transfer_type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "milestone_id" SERIAL NOT NULL,
    "milestone_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "funds_allocated" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptance_criteria" TEXT NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Inprogress',
    "no_of_revision" INTEGER NOT NULL,
    "penalty" DOUBLE PRECISION NOT NULL,
    "description_file_hash" TEXT,
    "description_file_link" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "resolve_time" INTEGER,
    "revision_counter" INTEGER NOT NULL DEFAULT 0,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("milestone_id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "provider_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_account_id_key" ON "User"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_project_id_key" ON "Project"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_project_code_key" ON "Project"("project_code");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_milestone_code_key" ON "Milestone"("milestone_code");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_id_key" ON "Provider"("provider_id");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
