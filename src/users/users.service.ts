import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Milestone, User } from '@prisma/client';


// Importing all dependencies for hedera
const utils = require('../../utils/utils.js')


require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client, ContractExecuteTransaction, ContractFunctionParameters
} = require("@hashgraph/sdk");

// Import required functions from smart_contract folder
//const utils = require("../utils/utils.js");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID); //purchaser
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

//Bytecode from json
let contractCompiled = require("../../build/contracts/EscrowContract.json");
const bytecode = contractCompiled.bytecode;

// Factory contract Id
const contractId = process.env.FACTORY_CONTRACT_ID;

//New Escrow contract variable
let newContractId;
let newContractAddress;

// provider
const providerAccountId = AccountId.fromString(process.env.Account1_Id);
// mo
const moAccountId = AccountId.fromString(process.env.Account2_Id);
//credit address
const creditAccountId = AccountId.fromString(process.env.Account3_Id);



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

  //======================== Escrow Creation =============================


  // function to get all milestones based on user id and project id
  async createEscrow(userId: number, projectId: number): Promise<Milestone[]> {
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

    // Create Instance of Escrow Contract

    // STEP 1 =====================================
    console.log(`\nSTEP 1 ===================================\n`);
    console.log(`- File create bytecode...\n`);

    const [bytecodeFileId, fileAppendStatus] = await utils.createByteCodeFileId(bytecode, client, operatorKey);
    console.log(`\n bytecode file Id :${bytecodeFileId}`);

    console.log(`\n File append status:${fileAppendStatus}`);

    // STEP 2 ======================================

    console.log(`\nSTEP 2 ===================================\n`);
    console.log(`- Deploying contracts...\n`);
    let gasLim = 10000000;
    const params = await utils.contractParamsBuilderEscroContract(providerAccountId, moAccountId, operatorId, creditAccountId, 2);
    [newContractId, newContractAddress] = await utils.createEscrowContractId(bytecodeFileId, gasLim, params, client);
    console.log(`\n contract Id :${newContractId}`);
    console.log(`\n contract address :${newContractAddress}`);

    // Reading the contract counter value from .env
    const filePath = '.env';
    let contractVal = 'CONTRACT_COUNTER';
    let contractCounter;
    
    await utils.readVariableFromFile(contractVal, filePath)
      .then(value => {
        contractCounter = parseInt(value)+1;
      })
      .catch(error => {
        console.error(error);
      });




    // saving new contract id to file 
    const data=`\nNEW_CONTRACT_ID_E${contractCounter}=${newContractId}`;
    await utils.saveDataToFile(data,filePath);



    // retrieving the contract id from .env
    const variableName=`NEW_CONTRACT_ID_E${contractCounter}`;
    await utils.readVariableFromFile(variableName,filePath).then(value => {
      console.log(`Value of contractId ${variableName}: ${value}`);
    
    })
    .catch(error => {
      console.error(error);
    });

    //update contract counter value
  
    await utils.updateVariableValue(contractVal, contractCounter,filePath);


    // Adding offchain MS details to onchain

    // for (let i = 0; i < milestones.length; i++) {

    //   const msParams = await utils.contractParamsBuilderMS(milestones[i].milestone_id, milestones[i].description_file_hash,
    //     milestones[i].description, milestones[i].funds_allocated, milestones[i].start_date, milestones[i].completion_date,
    //     milestones[i].no_of_revision, 2);

    //   const gasLimit = 10000000;
    //   const addMS_Status = await utils.contractExecuteFcn(newContractId, gasLimit, "addMilestone", msParams, client, 2);

    //   console.log(`\n Add MS Status :${addMS_Status}`);

    // }



    return milestones;
  }





}



