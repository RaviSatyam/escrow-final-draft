import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Milestone, User } from '@prisma/client';



@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //post api to add new user
  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  //get api to retrieve all users details
  @Get()
  getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  //get api to retrieve user details-> all project list and corressponding MS
  @Get(':userId')
  getProjectAndMsOfuser(@Param('userId') userId: number): Promise<User> {
    const userID=Number(userId);
    const user=this.usersService.getProjectAndMsOfUser(userID);
    console.log(user)
    return user;
  }

  //get api to retrieve all milestones based on user id and project id
  @Get(':userId/:projectId')
  async getMilestonesByUserIdAndProjectId(@Param('userId') userId: number, @Param('projectId') projectId: number): Promise<Milestone[]> {
    const userID=Number(userId);
    const projectID=Number(projectId);
    const milestones=this.usersService.getMilestonesByUserIdAndProjectId(userID,projectID);
    return milestones;
}

//===================== Escrow Creation ====================
@Get('create/:userId/:projectId')
  async createEscrow(@Param('userId') userId: number, @Param('projectId') projectId: number): Promise<Milestone[]> {
    const userID=Number(userId);
    const projectID=Number(projectId);
    const milestones=this.usersService.createEscrow(userID,projectID);

    // Create Instance of Escrow Contract

    return milestones;
}

}


