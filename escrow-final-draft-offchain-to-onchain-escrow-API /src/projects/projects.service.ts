import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project, Milestone } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

// Function to get all projects by user id

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return this.prisma.project.findMany({ where: { user_id: userId } });
  }


// Function add project by user id

async createProject(userId: number, createProjectDto: CreateProjectDto): Promise<Project> {
  const userExists = await this.prisma.user.findUnique({ where: { user_id: userId } });
  if (!userExists) {
    throw new NotFoundException('User not found');
  }

  return this.prisma.project.create({ data: { ...createProjectDto, user_id: userId } });
}


}