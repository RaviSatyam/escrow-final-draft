import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Purchaser, Milestone, Prisma } from '.prisma/client';
import { CreatePurchaserDto } from 'src/dto/create-purchaser.dto';
import { CreateMilestoneDto } from 'src/dto/create-milestone.dto';

@Injectable()
export class PurchaserService {
  constructor(private readonly prisma: PrismaService) {}

 // To get all purchaser
  async getAllPurchasers(): Promise<Purchaser[]> {
    return this.prisma.purchaser.findMany();
  }

  //Function to add purchaser
  async createPurchaser(data: CreatePurchaserDto): Promise<Purchaser> {
    return this.prisma.purchaser.create({ data });
  }

 //Function to create milestone 
  async createMilestone(purchaserId: number, data: CreateMilestoneDto): Promise<Milestone> {
    const purchaser = await this.prisma.purchaser.findUnique({ where: { id: purchaserId } });
    if (!purchaser) {
      throw new NotFoundException('Purchaser not found');
    }
    return this.prisma.milestone.create({
      data: {
        ...data,
        purchaser: { connect: { id: purchaserId } },
      },
    });
  }

  // Get all milestones based on purchaser id
  async getPurchaserMilestones(purchaserId: number): Promise<Milestone[]> {
    return this.prisma.milestone.findMany({
      where: { purchaserId },
    });
  }
}
