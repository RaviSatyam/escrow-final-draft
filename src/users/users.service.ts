import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Milestone, User } from '@prisma/client';


// Importing all dependencies for hedera
const utils = require('../../utils/utils.js');
const mirror_utils = require('../../utils/mirror_utils.js');
const nft_utils = require('../../utils/nft_utils');


require("dotenv").config();
const {
  AccountId, TransferTransaction,
  PrivateKey, ContractId,
  Client, ContractExecuteTransaction, ContractFunctionParameters
} = require("@hashgraph/sdk");

// Import required functions from smart_contract folder
//const utils = require("../utils/utils.js");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID); //purchaser
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// provider
const providerId = AccountId.fromString(process.env.Account1_Id);
const providerKey = PrivateKey.fromString(process.env.Account1_PVKEY);

// 3rd person
const thirdPersonId = AccountId.fromString(process.env.Account2_Id);
const thirdPersonKey = PrivateKey.fromString(process.env.Account2_PVKEY);

// 4th person
const fourthPersonId = AccountId.fromString(process.env.Account3_Id);
const fourthPersonKey = PrivateKey.fromString(process.env.Account3_PVKEY);

const supplyKey = operatorKey;//PrivateKey.generateED25519();
const adminKey = operatorKey; //PrivateKey.generateED25519();

//Bytecode and ABI from json
let contractCompiled = require("../../build/contracts/EscrowContract.json");
const bytecode = contractCompiled.bytecode;
const escrowABI = contractCompiled.abi;

let contractFactoryCompiled = require("../../build/contracts/ContractFactory.json");
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
// string descriptionFileHash,
// string title,
// uint budget,
// string initDate,
// string dueDate,
// int numberRevisions,
// int msId


@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {
  }


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
  async createEscrow(userId: number, projectId: number): Promise<{ success: boolean, msg: string, status_code: string, contract_id: string }> {


    try {
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
      const cid = ContractId.fromSolidityAddress(newContractAddress).toString();


      // Inserting the newly created escrow contract id into the user table
      await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          contract_id: {
            push: cid,
          },
        },
      });

      // inserting the newly created contract id to the coressponding project table 

      await this.prisma.project.update({
        where: { project_id: projectId },
        data: {
          project_contract_id: {
            set: cid,
          },
        },
      });

      // Adding offchain MS details to onchain


      for (let i = 0; i < milestones.length; i++) {

        const msParams = await utils.contractParamsBuilderMS(milestones[i].milestone_id, milestones[i].description_file_hash,
          milestones[i].description, milestones[i].funds_allocated, milestones[i].start_date, milestones[i].completion_date,
          milestones[i].no_of_revision, 2);


        const addMS_Status = await utils.contractExecuteFcn(newContractId, gasLim, "addMilestone", msParams, client, 2);

        console.log(`\n Added MS Status with id ${milestones[i].milestone_id} is:${addMS_Status}`);

      }

      return { success: true, msg: `Escrow created successfully`, status_code: "200", contract_id: cid };

    } catch (error) {
      return { success: false, msg: error.message, status_code: "400", contract_id: "NA" };
    }


  }

  // function to lock funds to contract
  async lockFunds(userId: number, projectId: number): Promise<{
    success: boolean, msg: string,
    status_code: string, locked_funds_amount: string
  }> {

    try {
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

      // check if any contract id exists for that project
      const project = await this.prisma.project.findUnique({
        where: { project_id: projectId },
        select: { project_contract_id: true },
      });

      const contract_id = project?.project_contract_id;
      console.log("contract id", contract_id);
      // Calculate to project funds

      let totalFunds = 0;
      for (let i = 0; i < milestones.length; i++) {
        totalFunds += milestones[i].funds_allocated;
      }


      const gasLimit = 10000000;

      // Checking bal of contract
      await utils.showContractBalanceFcn(contract_id, client)

      const lockFundRx = await utils.hbarTransferFcn(operatorId, contract_id, operatorKey, totalFunds, client)

      console.log("funds locked with status:", lockFundRx.status.toString());

      await utils.showContractBalanceFcn(contract_id, client)

      return { success: true, msg: `Funds locked to the contract successfully`, status_code: "200", locked_funds_amount: totalFunds + "Hbar" };
    } catch (error) {
      return { success: false, msg: error.message, status_code: "400", locked_funds_amount: "NA" };
    }
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

    console.log("log Data", logData)

    const eventName = 'ContractCreated';

    const decodedLog = await mirror_utils.decodeEventLogData(logData.logs[0], abi, eventName);// decoding the log data
    const newContractSolidityAddress = decodedLog.newContract;

    console.log("Decode results :-----")
    console.log(decodedLog);

    console.log("new contract id address", newContractSolidityAddress);

    const new_contractId = ContractId.fromSolidityAddress(newContractSolidityAddress).toString()// retrieving new contract id from log
    console.log("Newwwww---------")
    console.log("new contract id", new_contractId);

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

    console.log("MS+++++++++")
    console.log(milestones);

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




  //function to get  user contract Id details
  async getUserContractId(userId: number): Promise<string[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
        select: {
          contract_id: true,
        },

      });
      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      return user.contract_id;

    } catch (error) {
      // Handle the error appropriately
      console.error(`Error retrieving user contract ID: ${error.message}`);
      throw new Error('Failed to retrieve user contract ID.');
    }

  }

  // Function to retrieve recent MS detais from mirror node 
  // Based on user id and contract id

  async getMilestonesInfoFromMirrorNode(contract_Id: string): Promise<MilestonesInfo> {

    // Decoding the newcEscrow-instance contract id from mirror node

    const logData = await mirror_utils.getLogsTxnDetails(contract_Id);// getting log from mirror node

    const eventName = 'milestoneList';
    console.log(logData.logs);

    const decodedLog = await mirror_utils.decodeEventLogData(logData.logs[0], escrowABI, eventName);// decoding the log data
    console.log(decodedLog);

    const milestonesInfo: MilestonesInfo = {

      descriptionFileHash: decodedLog.descriptionFileHash,
      title: decodedLog.title,
      budget: `${decodedLog.budget}`,
      initDate: decodedLog.initDate,
      dueDate: decodedLog.dueDate,
      numberRevisions: `${decodedLog.numberRevisions}`,
      msId: `${decodedLog.msId}`,

    };

    console.log(decodedLog.msId, typeof (decodedLog.msId))
    console.log(decodedLog.budget, typeof (decodedLog.budget))

    return milestonesInfo;
  }


  // Function to retrieve all MS detais from mirror node 
  // Based on user id and contract id

  async getAllMilestonesInfoFromMirrorNode(contract_Id: string): Promise<MilestonesInfo[]> {

    // Decoding the newcEscrow-instance contract id from mirror node

    let milestonesList: MilestonesInfo[] = [];

    const logData = await mirror_utils.getLogsTxnDetails(contract_Id);// getting log from mirror node

    const eventName = 'milestoneList';


    for (let i = 0; i < logData.logs.length; i++) {
      const decodedLog = await mirror_utils.decodeEventLogData(logData.logs[i], escrowABI, eventName);// decoding the log data
      console.log("================================");
      console.log(decodedLog);
      //Adding the decoded ms info into new interface
      const milestonesInfo: MilestonesInfo = {

        descriptionFileHash: decodedLog.descriptionFileHash,
        title: decodedLog.title,
        budget: `${decodedLog.budget}`,
        initDate: decodedLog.initDate,
        dueDate: decodedLog.dueDate,
        numberRevisions: `${decodedLog.numberRevisions}`,
        msId: `${decodedLog.msId}`,

      };

      milestonesList.push(milestonesInfo);

    }




    return milestonesList;
  }



  //=================================

  // function to change state of a milestone by provider
  async changeMilestoneStatus(userId: number, projectId: number, msId: number): Promise<{
    success: boolean, msg: string,
    status_code: string, ms_status: string
  }> {

    try {

      console.log("msid is", msId);

      // find the milestone whose id is msId
      const milestone = await this.prisma.milestone.findUnique({
        where: {
          milestone_id: msId,
        },
      });

      // 2- check if any contract id exists for that project
      const project = await this.prisma.project.findUnique({
        where: { project_id: projectId },
        select: { project_contract_id: true },
      });
      const contract_id = project?.project_contract_id;
      console.log(contract_id);


      const gasLimit = 10000000;
      // const addMS_Status = await utils.changeMsState(contract_id, gasLimit, "changeMS_state", msparams , client);
      const change_ms_status = await utils.changeMsState(contract_id, gasLimit, msId, client);
      console.log(`\n Change milestone status :${change_ms_status}`);

      // push the new state in the db
      await this.prisma.milestone.update({
        where: { milestone_id: msId },
        data: {
          status: 'Completed',
        },
      });


      return { success: true, msg: "Milestone status updated successfully", status_code: "200", ms_status: "Completed" };

    } catch (error) {
      return { success: false, msg: error.message, status_code: "400", ms_status: "Not Updated" };
    }

  }


  // function to change state of a milestone by provider
  async approveMilestoneStatus(userId: number, projectId: number, msId: number): Promise<{
    success: boolean, msg: string,
    status_code: string, ms_status: string
  }> {

    try {
      // find the milestone whose id is msId
      const milestone = await this.prisma.milestone.findUnique({
        where: {
          milestone_id: msId,
        },
      });
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // 2- check if any contract id exists for that project
      const project = await this.prisma.project.findUnique({
        where: { project_id: projectId },
        select: { project_contract_id: true },
      });
      const contract_id = project?.project_contract_id;
      console.log(contract_id);

      const amount = milestone.funds_allocated;
      const gasLimit = 10000000;

      // Checking bal of contract
      await utils.showContractBalanceFcn(contract_id, client)
      // const addMS_Status = await utils.changeMsState(contract_id, gasLimit, "changeMS_state", msparams , client);
      const approve_ms_status = await utils.approveMsState(contract_id, gasLimit, amount, client);
      console.log(`\n Change milestone status :${approve_ms_status}`);


      // Checking bal of contract
      await utils.showContractBalanceFcn(contract_id, client)

      return { success: true, msg: "Milestone status approved successfully", status_code: "200", ms_status: "Approved" };;
    } catch (error) {
      return { success: false, msg: error.message, status_code: "400", ms_status: "Not Approved" };
    }

  }





  //========== NFT functionalities ========

  async createNFT(userId: number, projectId: number): Promise<{
    success: boolean, msg: string,
    status_code: string, nft_id: string
  }> {

    try {
      //Find all milestones corresponding to project id
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
      // Check for all milestone status
      let no_of_ms = milestones.length;
      let status_count = 0;
      for (let i = 0; i < milestones.length; i++) {
        if (milestones[i].status === 'Completed') {
          status_count++;
        }
      }


      const CID = "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn";
      if (status_count == no_of_ms) {
        // Create NFT with Royalty
        const nftTokenId = await nft_utils.createNftTokenWithRoyalty(50, providerId, CID, "RaviSat NFT", "RSM", operatorId, adminKey, supplyKey,
          client, operatorKey);
        return { success: true, msg: "NFT created successfully", status_code: "200", nft_id: nftTokenId.toString() };
      }
      return { success: false, msg: "All milestones are not completed", status_code: "400", nft_id: "NA" };
    } catch (error) {
      return { success: false, msg: error.message, status_code: "400", nft_id: "NA" };
    }
  }



  async mintNFT(userId: number, tokenId: string): Promise<{
    success: boolean, msg: string,
    status_code: string
  }> {
    try {
      const CID = "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn";
      const mintRx = await nft_utils.tokenMinterFcn(CID, tokenId, client, supplyKey);
      return { success: false, msg: "NFT minted successfully", status_code: "200" };

    } catch (error) {
      return { success: false, msg: error.message, status_code: "400" };
    }
  }



  async associateNFT(userId: number, tokenId: string, accountId: string, accountKey: string): Promise<{
    success: boolean, msg: string,
    status_code: string
  }> {
    try {
      const account_key = PrivateKey.fromString(accountKey);

      const associateAccRx = await nft_utils.associateAccountWithToken(accountId, tokenId, account_key, client);

      console.log(`- NFT association with account: ${associateAccRx.status}\n`);
      return { success: false, msg: "NFT associated successfully", status_code: "200" };

    } catch (error) {
      return { success: false, msg: error.message, status_code: "400" };
    }
  }



  async transferNFT(userId: number, tokenId: string, senderID: string, receiverID: string,serial:number,amount:number,senderKey:string,receiverKey:string): Promise<{
    success: boolean, msg: string,
    status_code: string
  }> {
    try {

      const receiver_key = PrivateKey.fromString(receiverKey);
      const sender_key=PrivateKey.fromString(senderKey);
      //  NFT TRANSFER 
      let tokenTransferTx2 = await new TransferTransaction()
        .addNftTransfer(tokenId, serial, senderID, receiverID)
        .addHbarTransfer(senderID, amount)
        .addHbarTransfer(receiverID, -amount)
        .freezeWith(client)
        .sign(sender_key); 
      const tokenTransferTx2Sign = await tokenTransferTx2.sign(receiver_key);
      let tokenTransferSubmit2 = await tokenTransferTx2Sign.execute(client);
      let tokenTransferRx2 = await tokenTransferSubmit2.getReceipt(client);
      console.log(
        `\n NFT transfer sender->receiver with status: ${tokenTransferRx2.status} \n`
      );
      return { success: false, msg: "NFT transferred successfully", status_code: "200" };

    } catch (error) {
      return { success: false, msg: error.message, status_code: "400" };
    }
  }




}





