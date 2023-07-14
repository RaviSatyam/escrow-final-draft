import { Status } from "@prisma/client";

export class CreateMilestoneDto {
    milestone_code: string;
    description: string;
    requirements: string;
    funds_allocated: number;
    start_date: Date;
    acceptance_criteria: string;
    completion_date: Date;
    status: Status;
    no_of_revision: number;
    penalty: number;
    description_file_hash?: string;
    description_file_link?: string;
    approved?: boolean;
    closed?: boolean;
    resolve_time?: number;
    revision_counter?: number;
    project_id: number;
  }
  