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
  @Get('create')
  async createEscrow(@Body('user_id') user_id: number, @Body('project_id') project_id: number) {
  

    const userID = Number(user_id);
    const projectID = Number(project_id);
    const ms = this.usersService.createEscrow(userID, projectID);
    console.log("========")
     console.log(ms);
    // Create Instance of Escrow Contract

    return ms;
      
    
  }

  @Get('lockFunds')
  async lockFunds(@Body('user_id') user_id: number, @Body('project_id') project_id: number) {
    const userID = Number(user_id);
    const projectID = Number(project_id);
    const msg = this.usersService.lockFunds(userID, projectID);

    // Create Instance of Escrow Contract
    return msg;
  }

  //
  @Get('createEscrow/:userId/:projectId')
  async createEscrowUsingFactory(@Param('userId') userId: number, @Param('projectId') projectId: number): Promise<Milestone[]> {
    const userID = Number(userId);
    const projectID = Number(projectId);
    const milestones = this.usersService.createEscrowUsingFactory(userID, projectID); 

    // Create Instance of Escrow Contract

    return milestones;
  }



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
   @Post('change')
   async changeMilestoneStatus(@Body('user_id') user_id: number, @Body('project_id') project_id: number, @Body('ms_id') ms_id: number) {
     const userID = Number(user_id);
     const projectID = Number(project_id);
     const msID = Number(ms_id);
     const msg = this.usersService.changeMilestoneStatus(userID, projectID, msID); 
 
     return msg;
   }
 //@Get('purchaser/:user_id/:project_id/:ms_i')
   // Provider side API to change milestone state and transfer payment. 
   @Post('approve')
   async approveMilestoneStatus(@Body('user_id') user_id: number, @Body('project_id') project_id: number, @Body('ms_id') ms_id: number){
     const userID = Number(user_id);
     const projectID = Number(project_id);
     const msID = Number(ms_id);
     const msg = this.usersService.approveMilestoneStatus(userID, projectID, msID);
 
     return msg;  
   }

   //========== NFT functionalities ========
   @Post('createNFT')
   async createNFT(@Body('user_id') user_id: number, @Body('project_id') project_id: number){
     const userID = Number(user_id);
     const projectID = Number(project_id);
     const msg = this.usersService.createNFT(userID, projectID);
 
     return msg;  
   }

   @Post('mintNFT')
   async mintNFT(@Body('user_id') user_id: number, @Body('nft_id') nft_id: string){
     const userID = Number(user_id);
     const msg = this.usersService.mintNFT(userID, nft_id);
 
     return msg;  
   }

   @Post('associateNFT')
   async associateNFT(@Body('user_id') user_id: number, @Body('nft_id') nft_id: string,@Body('account_id') account_id: string,
   @Body('account_key') account_key: string){
     const userID = Number(user_id);
     const msg = this.usersService.associateNFT(userID, nft_id,account_id,account_key);
 
     return msg;  
   }


   @Post('transferNFT')
   async transferNFT(@Body('user_id') user_id: number, @Body('nft_id') nft_id: string,@Body('sender_id') sender_id: string,
   @Body('receiver_id') receiver_id: string,@Body('serial') serial: number,@Body('exchange_amount') exchange_amount: number,
   @Body('sender_key')sender_key:string,@Body('receiver_key')receiver_key:string){
     const userID = Number(user_id);
     const msg = this.usersService.transferNFT(userID, nft_id,sender_id,receiver_id,serial,exchange_amount,sender_key,receiver_key);
 
     return msg;  
   }

   //userId: number, tokenId: string, senderID: string, receiverID: string,serial:number,amount:number,receiverKey:string

}




