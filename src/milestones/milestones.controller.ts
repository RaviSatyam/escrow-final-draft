import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { Milestone } from '@prisma/client';

@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  createMilestone(@Body() createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    return this.milestonesService.createMilestone(createMilestoneDto);
  }

  @Get(':projectId')
  getMilestonesByProjectId(@Param('projectId') projectId: number): Promise<Milestone[]> {
    return this.milestonesService.getMilestonesByProjectId(projectId);
  }
}
