import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Milestone, User } from '@prisma/client';

// Define interface
interface MilestonesInfo {
  descriptionFileHash: string;
  title: string;

  budget: string;
  initDate: string;
  dueDate: string;
  numberRevisions: string;
  msId: string;


}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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
  // @Get(':userId')
  // getProjectAndMsOfuser(@Param('userId') userId: number): Promise<User> {
  //   const userID=Number(userId);
  //   const user=this.usersService.getProjectAndMsOfUser(userID);
  //   console.log(user)
  //   return user;
  // }

  //get api to retrieve all milestones based on user id and project id
  @Get(':userId/:projectId')
  async getMilestonesByUserIdAndProjectId(@Param('userId') userId: number, @Param('projectId') projectId: number): Promise<Milestone[]> {
    const userID = Number(userId);
    const projectID = Number(projectId);
    const milestones = this.usersService.getMilestonesByUserIdAndProjectId(userID, projectID);
    return milestones;
  }

  //===================== Escrow Creation ====================
  @Get('create/:userId/:projectId')
  async createEscrow(@Param('userId') userId: number, @Param('projectId') projectId: number): Promise<Milestone[]> {
    const userID = Number(userId);
    const projectID = Number(projectId);
    const milestones = this.usersService.createEscrow(userID, projectID);

    // Create Instance of Escrow Contract

    return milestones;
  }

  //
  @Get('create_escrow/:userId/:projectId')
  async createEscrowUsingFactory(@Param('userId') userId: number, @Param('projectId') projectId: number): Promise<Milestone[]> {
    const userID = Number(userId);
    const projectID = Number(projectId);
    const milestones = this.usersService.createEscrowUsingFactory(userID, projectID);

    // Create Instance of Escrow Contract

    return milestones;
  }

  //==== Doubt in decorator end point ======

  // This is optimised code ---> Need to more optimisation
  //get api to retrieve user details-> all project list and corressponding MS
  // @Get(':userId')
  // async getUserContractId(@Param('userId') userId: number): Promise<string[]> {

  //   try {
  //     const userID = Number(userId);
  //     const contract_id = await this.usersService.getUserContractId(userID);
  //     return contract_id;
  //   } catch (error) {
  //     console.error(`Error retrieving user contract ID: ${error.message}`);
  //     throw new Error('Failed to retrieve user contract ID.');
  //   }

  // }

  //====================
  // @Get(':contractId')
  // async getMilestonesInfoFromMirrorNode(@Param('contractId') contractId: string): Promise<MilestonesInfo> {

  //   try {
  //     //const userID = Number(userId);
  //     const result = await this.usersService.getMilestonesInfoFromMirrorNode(contractId);
  //     return result;
  //   } catch (error) {
  //     console.error(`Error retrieving user milestones: ${error.message}`);
  //     throw new Error('Failed to retrieve user milestones.');
  //   }

  // }

  //====================


  @Get(':contractId')
  async getAllMilestonesInfoFromMirrorNode(@Param('contractId') contractId: string): Promise<MilestonesInfo[]> {

    try {
      //const userID = Number(userId);
      const result = await this.usersService.getAllMilestonesInfoFromMirrorNode(contractId);
      return result;
    } catch (error) {
      console.error(`Error retrieving user milestones: ${error.message}`);
      throw new Error('Failed to retrieve user milestones.');
    }

  }

   // Provider side API to change milestone state and transfer payment.
   @Get('provider/:user_id/:project_id/:ms_id')
   async changeMilestoneStatus(@Param('user_id') user_id: number, @Param('project_id') project_id: number, @Param('ms_id') ms_id: number): Promise<Milestone> {
     const userID = Number(user_id);
     const projectID = Number(project_id);
     const msID = Number(ms_id);
     const milestones = this.usersService.changeMilestoneStatus(userID, projectID, msID);
 
     return milestones;
   }


}




