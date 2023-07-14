import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Milestone, User } from '@prisma/client';


// Importing all dependencies for hedera
const utils = require('../../utils/utils.js');
const mirror_utils = require('../../utils/mirror_utils.js');


require("dotenv").config();
const {
  AccountId,
  PrivateKey, ContractId,
  Client, ContractExecuteTransaction, ContractFunctionParameters
} = require("@hashgraph/sdk");

// Import required functions from smart_contract folder
//const utils = require("../utils/utils.js");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID); //purchaser
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

//Bytecode and ABI from json
let contractCompiled = require("../../build/contracts/EscrowContract.json");
const bytecode = contractCompiled.bytecode;

let contractFactoryCompiled = require("../../build/contracts/MilestoneContract.json");
const abi = contractFactoryCompiled.abi;

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
        contractCounter = parseInt(value) + 1;
      })
      .catch(error => {
        console.error(error);
      });




    // saving new contract id to file 
    const data = `\nNEW_CONTRACT_ID_E${contractCounter}=${newContractId}`;
    await utils.saveDataToFile(data, filePath);



    // retrieving the contract id from .env
    const variableName = `NEW_CONTRACT_ID_E${contractCounter}`;
    await utils.readVariableFromFile(variableName, filePath).then(value => {
      console.log(`Value of contractId ${variableName}: ${value}`);

    })
      .catch(error => {
        console.error(error);
      });

    //update contract counter value

    await utils.updateVariableValue(contractVal, contractCounter, filePath);


    // Adding offchain MS details to onchain

    for (let i = 0; i < milestones.length; i++) {

      const msParams = await utils.contractParamsBuilderMS(milestones[i].milestone_id, milestones[i].description_file_hash,
        milestones[i].description, milestones[i].funds_allocated, milestones[i].start_date, milestones[i].completion_date,
        milestones[i].no_of_revision, 2);

      const gasLimit = 10000000;
      const addMS_Status = await utils.contractExecuteFcn(newContractId, gasLimit, "addMilestone", msParams, client, 2);

      console.log(`\n Add MS Status :${addMS_Status}`);

    }



    return milestones;
  }


  // function to get all milestones based on user id and project id
  async createEscrowUsingFactory(userId: number, projectId: number): Promise<Milestone[]> {
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

    //=============== Create Instance of Escrow Contract ===============

    let gasLim = 10000000;
    // Calling parameters builder function
    const params = await utils.contractParamsBuilderEscroContract(providerAccountId, moAccountId, operatorId, creditAccountId, 2);

    // Calling contract execute funnction  to create instance of Escrow
    const createEscrowContractStatus = await utils.contractExecuteFcn(contractId, gasLim, "createContract", params, client, 2);
    console.log(`\n Created new Escrow SC Status :${createEscrowContractStatus}`)


    // Decoding the newcEscrow-instance contract id from mirror node

    const logData = await mirror_utils.getLogsTxnDetails(contractId);// getting log from mirror node

    const eventName = 'ContractCreated';

    const decodedLog = await mirror_utils.decodeEventLogData(logData.logs[0], abi, eventName);// decoding the log data
    const newContractSolidityAddress = decodedLog.newContract;

    //console.log(decodedLog);

    console.log(newContractSolidityAddress);

    const new_contractId = ContractId.fromSolidityAddress(newContractSolidityAddress).toString();// retrieving new contract id from log
    console.log(new_contractId);

    // Inserting the newly created escrow contract id into the user table
    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        contract_id: {
          push: new_contractId,
        },
      },
    });

    // inserting the newly created contract id to the coressponding project table
    await this.prisma.project.update({
      where: { project_id: projectId },
      data: {
        project_contract_id: {
          set: new_contractId,
        },
      },
    });

    // Adding offchain MS details to onchain
    for (let i = 0; i < milestones.length; i++) {

      const msParams = await utils.contractParamsBuilderMS(milestones[i].milestone_id, milestones[i].description_file_hash,
        milestones[i].description, milestones[i].funds_allocated, milestones[i].start_date, milestones[i].completion_date,
        milestones[i].no_of_revision, 2);

      const gasLimit = 10000000;
      const addMS_Status = await utils.contractExecuteFcn(new_contractId, gasLimit, "addMilestone", msParams, client, 2);

      console.log(`\n Add MS Status :${addMS_Status}`);

    }
    return milestones;
  }


  //function to get  user info-> project info and corresponding Ms
  async getUserContractId(userId: number): Promise<String[]> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },

    });
    return user.contract_id;
  }

  // function to change state of a milestone by provider
  async changeMilestoneStatus(userId: number, projectId: number, msId: number): Promise<Milestone> {

    // find the milestone whose id is msId
    const milestone = await this.prisma.milestone.findUnique({
      where: {
        milestone_id: msId,
      },
    });
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // need to get the contract ID of the project to which this milestone belongs
    // 1 - get the project id of the entered milestone (only if project id is not provided in the api)
    // const project_id = await this.prisma.milestone.findUnique({
    //   where: { milestone_id:msId },
    // });

    // 2- check if any contract id exists for that project
    const project = await this.prisma.project.findUnique({
      where: { project_id: projectId },
      select: { project_contract_id: true },
    });
    const contract_id = project?.project_contract_id;
    console.log(contract_id);

    // change the state of the milestone by calling changeMsState
    // const msparams = await utils.contractParamsBuilderFcn1(msId);
    const gasLimit = 10000000;
    // const addMS_Status = await utils.changeMsState(contract_id, gasLimit, "changeMS_state", msparams , client);
    const change_ms_status = await utils.changeMsState(contract_id, gasLimit, msId, client);
    console.log(`\n Change milestone status :${change_ms_status}`);
    // const gasLimit = 10000000;
    // const change_ms_status = await utils.changeMsState("changeMS_state", msId, gasLimit, contract_id, client, 2);

    // console.log(`\n Change milestone Status :${change_ms_status}`);

    // get the milestone details
    console.log(`\n Fetching the milestone details`);
    const result = await utils.getMS_details('getAllMS', [], 10000000, contract_id, abi, client);
    console.log(result);

    // push the new state in the db
    try {
      await this.prisma.milestone.update({
        where: { milestone_id: msId },
        data: {
          status: 'Completed',
        },
      });
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      throw new Error('Failed to update milestone status');
    }

    // await this.prisma.milestone.update({
    //   where: { milestone_id: msId },
    //   data: {
    //     status: {
    //       set: result.status,
    //     },
    //   },
    // });

    return milestone;
  }

  async getMsDataFromMirrorNode(userId: number, projectId: number): Promise<string> {
    // check if the project exists in the db or not
    const project1 = await this.prisma.project.findUnique({
      where: {
        project_id: projectId,
      },
    });
    if (!project1) {
      throw new Error('Project not found');
    }

    // query the contract id of the project
    const project = await this.prisma.project.findUnique({
      where: { project_id: projectId },
      select: { project_contract_id: true },
    });
    const contract_id = project?.project_contract_id;
    console.log(contract_id);

    // query the mirror node
    const logData = await mirror_utils.getLogsTxnDetails(contract_id);

    const eventName = 'milestoneList';

    // decoding the log data
    const decodedLog = await mirror_utils.decodeEventLogData(logData.logs[0], abi, eventName);
    console.log(decodedLog);

    return "success";
  }


}



