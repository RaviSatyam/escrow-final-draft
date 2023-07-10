import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { Blocker, Prisma } from '@prisma/client';
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



const contractId = process.env.NEW_CONTRACT_ID;




@Controller('blocker')




export class BlockerController {

    constructor(private readonly prisma: PrismaService) { }




    @Get()

    async findAll(): Promise<Blocker[]> {
        const blocker = await this.prisma.blocker.findMany();

        for (let i = 0; i < blocker.length; i++) {

            const msParams = await utils.contractParamsBuilderMS(blocker[i].id, blocker[i].name, blocker[i].email, 2);

            const gasLimit = 10000000;
            const addMS_Status = await utils.contractExecuteFcn(contractId, gasLimit, "setBlockerData", msParams, client, 2);

            console.log(`\n Add MS Status :${addMS_Status}`);

        }


        return blocker;

    }






    @Post()

    async create(@Body() data: Prisma.BlockerCreateInput): Promise<Blocker> {

        return await this.prisma.blocker.create({ data });

    }




    @Put(':id')

    async update(

        @Param('id', ParseIntPipe) id: number,

        @Body() data: Prisma.BlockerUpdateInput,

    ): Promise<Blocker> {

        return await this.prisma.blocker.update({

            where: { id },

            data,

        });

    }




    @Delete(':id')

    async delete(@Param('id', ParseIntPipe) id: number): Promise<Blocker> {

        return await this.prisma.blocker.delete({

            where: { id },

        });

    }

}