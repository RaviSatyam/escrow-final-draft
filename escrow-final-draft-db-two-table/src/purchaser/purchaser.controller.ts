import { Controller, Get, Post, Body, ParseIntPipe, Put, Param, NotFoundException, Delete } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Purchaser, Milestone, Prisma } from '@prisma/client';

// Importing all dependencies for hedera
// const utils = require('../../utils/utils.js')
const utils = require("../../utils/utils.js");

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

const contractId = process.env.NEW_CONTRACT_ID;

@Controller('purchaser')
export class PurchaserController {
  constructor(private readonly prisma: PrismaService) { }

  @Get()
  async findAll(): Promise<Purchaser[]> {
    const purchaser = await this.prisma.purchaser.findMany();
    const milestone = await this.prisma.milestone.findMany();

    // for (let i = 0; i < blocker.length; i++) {

    //     const msParams = await utils.contractParamsBuilderMS(blocker[i].id, blocker[i].name, blocker[i].email, 2);

    //     const gasLimit = 10000000;
    //     const addMS_Status = await utils.contractExecuteFcn(contractId, gasLimit, "setBlockerData", msParams, client, 2);

    //     console.log(`\n Add MS Status :${addMS_Status}`);

    // }
    // console.log("Hi");
    // console.log(purchaser)
    // console.log(milestone)
    return purchaser;
  }

  @Post()
  async create(@Body() data: Prisma.PurchaserCreateInput): Promise<Purchaser> {
    // console.log("Hi I'm In POST");

    //     return await this.prisma.purchaser.create({ data:{
    //         name:"Ravi",
    // email:"rs@rsm.com",
    // projectName:"GreenTech",
    // milestones:{
    //     create:[
    //     {budget:4,description:"MS description",no_revision:5}] 
    //     } }});

    // }
    return await this.prisma.purchaser.create({ data });
  }

  @Post(':id')
  async createMilestone(
    @Param('id') id: number,
    @Body() milestoneData: { budget: number, description: string, no_revision: number },
  ): Promise<Milestone> {
    const { budget, description, no_revision } = milestoneData;
    //const ID=parseInt(id );
    // console.log("hi")
    // console.log(id)
    // console.log(typeof(id))
    const Id = Number(id)
    // console.log(typeof(Id))

    const purchaser = await this.prisma.purchaser.findUnique({
      where: { id: Id },
    });
    // console.log(purchaser)
    if (!purchaser) {
      throw new NotFoundException('Purchaser not found');
    }
    return this.prisma.milestone.create({
      data: {
        budget,
        description,
        no_revision,
        purchaser: { connect: { id: Id } },
      },
    });
  }

  @Get(':id')
  async getMilestonesByPurchaserId(@Param('id') id: number): Promise<Milestone[]> {
    const Id = Number(id)
    const purchaser = await this.prisma.purchaser.findUnique({
      where: { id: Id },
      include: { milestones: true }, // Include the associated milestones
    });

    if (!purchaser) {
      throw new NotFoundException('Purchaser not found');
    }
    console.log(purchaser.milestones)

    // Adding purchaser Info to onchain
    // const msParams = await utils.contractParamsBuilderFcnMS(purchaser.id,purchaser.email,purchaser.projectName,2);
    // const gasLimit = 10000000;
    // const purchaser_Status = await utils.contractExecuteFcn(contractId, gasLimit, "setPurchaserInfo", msParams, client, 2);
    // console.log(`\n Added purchaser with Status :${purchaser_Status}`);


    // Adding milestones details to onchain
    for (let i = 0; i < purchaser.milestones.length; i++) {

      const msParams = await utils.contractParamsBuilderMS(purchaser.milestones[i].id, purchaser.milestones[i].budget,
        purchaser.milestones[i].description, purchaser.milestones[i].no_revision, 2);

      const gasLimit = 10000000;
      const addMS_Status = await utils.contractExecuteFcn(contractId, gasLimit, "setMilestoneDetails", msParams, client, 2);

      console.log(`\n Add MS Status :${addMS_Status}`);

    }
    return purchaser.milestones;
  }


  // Delete all data from off chain table
  @Delete(':id')
  async deletePurchaserById(@Param('id') id: number): Promise<Purchaser> {
    const Id = Number(id)
    const purchaser = await this.prisma.purchaser.findUnique({
      where: { id: Id },
      include: { milestones: true },
    });

    if (!purchaser) {
      throw new NotFoundException('Purchaser not found');
    }

    const milestoneIds = purchaser.milestones.map((m) => m.id);

    await this.prisma.milestone.deleteMany({
      where: { id: { in: milestoneIds } },
    });

    return this.prisma.purchaser.delete({
      where: { id: Id },
    });
  }
}
