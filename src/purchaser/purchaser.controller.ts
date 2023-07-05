import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PurchaserService } from './purchaser.service';
import { Purchaser, Milestone } from '.prisma/client';
import { CreatePurchaserDto } from 'src/dto/create-purchaser.dto';
import { CreateMilestoneDto } from 'src/dto/create-milestone.dto';

@Controller('purchaser')
export class PurchaserController {
  constructor(private readonly purchaserService: PurchaserService) {}
  
  // Get all purchasers
  @Get()
  async getAllPurchasers(): Promise<Purchaser[]> {
    return this.purchaserService.getAllPurchasers();
  }
 
  //function to add purchaser
  @Post()
  async createPurchaser(@Body() data: CreatePurchaserDto): Promise<Purchaser> {
    return this.purchaserService.createPurchaser(data);
  }

  // function to add milestone based on purchaser id
  @Post(':id')
  async createMilestone(@Param('id') id: number, @Body() data: CreateMilestoneDto): Promise<Milestone> {
    const Id=Number(id);
    return this.purchaserService.createMilestone(Id, data);
  }

  //Function to get all ms of purchaser based on their id
  @Get(':id')
  async getPurchaserMilestones(@Param('id') id: number): Promise<Milestone[]> {
    const Id=Number(id);
    return this.purchaserService.getPurchaserMilestones(Id);
  }
}
