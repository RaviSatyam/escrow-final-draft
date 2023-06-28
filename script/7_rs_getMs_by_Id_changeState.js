console.clear();
require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client
    
} = require("@hashgraph/sdk");


const utils = require("../utils/utils.js");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID); //purchaser
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const contractId = process.env.NEW_CONTRACT_ID;
let contractCompiled = require("../build/contracts/EscrowContract.json");
const abi = contractCompiled.abi;
const bytecode = contractCompiled.bytecode;

async function main() {

    // STEP 1 =====================================
    console.log(`\n Calling getMS by Id func`);
    const result1 = await utils.getMS_details('getMilestoneById', [101], 10000000, contractId, abi,client);
    console.log(result1);

    // STEP 2 =====================================
    console.log(`\n Calling  change state func.....`);
    const receiptStatus = await utils.callFunction('changeMS_state', [101], 10000000, contractId, abi,client);
    console.log(receiptStatus.toString());

    // STEP 3 =====================================

    console.log(`\n Calling getMS by Id func`);
    const result2 = await utils.getMS_details('getMilestoneById', [101], 10000000, contractId, abi,client);
    console.log(result2);


}
main();








