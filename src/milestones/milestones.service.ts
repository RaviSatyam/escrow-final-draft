import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { Milestone } from '@prisma/client';

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}


// Function to get all milestones based on projects id

async getMilestonesByProjectId(projectId: number): Promise<Milestone[]> {
  return this.prisma.milestone.findMany({ where: { project_id: projectId } });
}


// Function to add milestones based on project id

async createMilestone(projectId: number, createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
const projectExists = await this.prisma.project.findUnique({ where: { project_id: projectId } });
if (!projectExists) {
  throw new NotFoundException('Project not found');
}

return this.prisma.milestone.create({ data: { ...createMilestoneDto, project_id: projectId } });
}
}
