import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project, Milestone } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({ data: createProjectDto });
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return this.prisma.project.findMany({ where: { user_id: userId } });
  }
}
