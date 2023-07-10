import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project, Milestone } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

// Post api to add project based on user id
  @Post(':user_id')
  createProject(@Param('user_id') userId: number, @Body() createProjectDto: CreateProjectDto): Promise<Project> {
    const userID=Number(userId);
    return this.projectsService.createProject(userID, createProjectDto);
  }

// Get api retrieve project details based on user id
  @Get(':userId')
  getProjectsByUserId(@Param('userId') userId: number): Promise<Project[]> {
    const userID=Number(userId);
    return this.projectsService.getProjectsByUserId(userID);
  }
  
}



  
