import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project, Milestone } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get(':userId')
  getProjectsByUserId(@Param('userId') userId: number): Promise<Project[]> {
    return this.projectsService.getProjectsByUserId(userId);
  }
}
