import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Milestone, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  // function to add new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: createUserDto });
  }

  //function to get all users info
  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }


  //function to get  user info-> project info and corresponding Ms
  async getProjectAndMsOfUser(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        projects: {
          include: {
            milestones: true,
          },
        },
      },

    });

    return user;
  }

  // function to get all milestones based on user id and project id
  async getMilestonesByUserIdAndProjectId(userId: number, projectId: number): Promise<Milestone[]> {
    const milestones = await this.prisma.milestone.findMany({
      where: {
        project: {
          user_id: userId,
          project_id: projectId,
        },
      },
    });

    if (!milestones) {
      throw new NotFoundException('Milestones not found');
    }

    return milestones;
  }


}



