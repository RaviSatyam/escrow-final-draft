import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { Milestone } from '@prisma/client';

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}


// Post api to add milestone based on project id
@Post(':project_id')
createMilestone(@Param('project_id') projectId: number, @Body() createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
  const projectID=Number(projectId);
  console.log("Hey",projectID)
  return this.milestonesService.createMilestone(projectID, createMilestoneDto);
}

// Get api retrieve milestones details based on project id
@Get(':project_id')
getMilestonesByProjectId(@Param('project_id') projectId: number): Promise<Milestone[]> {
  const projectID=Number(projectId);
  return this.milestonesService.getMilestonesByProjectId(projectID);
}

}
