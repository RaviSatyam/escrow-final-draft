console.clear();


const {
    AccountId,
    PrivateKey,
    Client
} = require("@hashgraph/sdk");
require("dotenv").config({path:'../.env'});

const utils = require("../utils/utils.js");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.OPERATOR_ACCOUNT_ID); //purchaser
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);

// Provider
const providerId= AccountId.fromString(process.env.FIRST_ACCOUNT_ID);
// MO
const moId= AccountId.fromString(process.env.SECOND_ACCOUNT_ID);
const purchaserId= AccountId.fromString(process.env.ACCOUNT_ID4);
const purchaserPvKey=PrivateKey.fromString(process.env.ACCOUNT_ID4_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// const contractId=process.env.FactoryContractId;
let contractCompiled = require("../build/contracts/EscrowContract.json");
const bytecode = contractCompiled.bytecode;


async function main() {
	// STEP 1 =====================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- File create bytecode...\n`);

    const [bytecodeFileId,fileAppendStatus]=await utils.createByteCodeFileId(bytecode,client,operatorKey);
    console.log(`\n bytecode file Id :${bytecodeFileId}`);

    console.log(`\n File append status:${fileAppendStatus}`);

    // STEP 2 ======================================

    console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Deploying contracts...\n`);
    let gasLim = 10000000;

    const [contractId,contractAddress]=await utils.createEscrowContractId(bytecodeFileId,gasLim,client,providerId,moId,purchaserId);
    console.log(`\n contract Id :${contractId}`);
    console.log(`\n contract address :${contractAddress}`);
///check contract Balance before transfer Hbar in contract Address
// Query the contract balance

const [fromCallQuery, fromInfoQuery] = await utils.contractBalanceCheckerFcn(contractId,client);
console.log("before transfer hbar contract id");
console.log(`\n- Contract balance (from getBalance fcn): ${fromCallQuery} tinybars`);
console.log(`- Contract balance (from ContractInfoQuery): ${fromInfoQuery.balance.toString()}`);

// Transfer HBAR to smart contract using TransferTransaction()
const hbarAmount = 100;
const transferRx= await utils.hbarTransferFcn(purchaserId, contractAddress, purchaserPvKey,hbarAmount,client);
console.log(`\n- Transfer ${hbarAmount} HBAR from purchaser to contract: ${transferRx.status}`);

const [fromCallQuery1, fromInfoQuery1] = await utils.contractBalanceCheckerFcn(contractId,client);
console.log("after transfer hbar contract id");
console.log(`\n- Contract balance (from getBalance fcn): ${fromCallQuery1} tinybars`);
console.log(`- Contract balance (from ContractInfoQuery): ${fromInfoQuery1.balance.toString()}`);

}



main();

   
