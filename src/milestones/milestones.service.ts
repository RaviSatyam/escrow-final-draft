import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { Milestone } from '@prisma/client';

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMilestone(createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    return this.prisma.milestone.create({ data: createMilestoneDto });
  }

  async getMilestonesByProjectId(projectId: number): Promise<Milestone[]> {
    return this.prisma.milestone.findMany({ where: { project_id: projectId } });
  }
}
