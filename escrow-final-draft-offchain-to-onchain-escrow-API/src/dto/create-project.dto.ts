export class CreateProjectDto {
    project_code: string;
    title: string;
    project_scope: string;
    project_decriptions: string;
    requirements?: string;
    terms_and_conditions?: string;
    total_fund: number;
    duration: Date;
    deliverables: string;
    category: string;
    penalty: number;
    fund_transfer_type: string;
    user_id: number;
  }
  