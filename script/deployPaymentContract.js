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
const purchaserId= AccountId.fromString(process.env.THIRD_ACCOUNT_ID);
const purchaserPvKey=PrivateKey.fromString(process.env.THIRD_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
//const escrowContractId= (process.env.EscrowContractId).toSolidityAddress();

const escrowContractId=process.env.EscrowContractId;
const EscrowContractAddress=process.env.EscrowContractAddress;

// // const contractId=process.env.FactoryContractId;
// let contractCompiled = require("../build/contracts/PaymentContract.json");
// const bytecode = contractCompiled.bytecode;


async function main() {
	// STEP 1 =====================================
	// console.log(`\nSTEP 1 ===================================\n`);
	// console.log(`- File create bytecode...\n`);

    // const [bytecodeFileId,fileAppendStatus]=await utils.createByteCodeFileId(bytecode,client,operatorKey);
    // console.log(`\n bytecode file Id :${bytecodeFileId}`);

    // console.log(`\n File append status:${fileAppendStatus}`);

    // STEP 2 ======================================

    // console.log(`\nSTEP 2 ===================================\n`);
	// console.log(`- Deploying contracts...\n`);
    // let gasLim = 10000000;

    // const [contractId,contractAddress]=await utils.createPaymentContractId(bytecodeFileId,gasLim,client);
    // console.log(`\n contract Id :${contractId}`);
    // console.log(`\n contract address :${contractAddress}`)

    const [fromCallQuery2, fromInfoQuery2] = await utils.contractBalanceCheckerFcn(escrowContractId,client);
console.log("after transfer hbar contract id");
console.log(`\n- Contract balance (from getBalance fcn): ${fromCallQuery2} tinybars`);
console.log(`- Contract balance (from ContractInfoQuery): ${fromInfoQuery2.balance.toString()}`);

    console.log("My code is working .......");
    const hbarAmount = 10;
    const contractQueryResult=await utils.payOut(escrowContractId,client,providerId,hbarAmount,EscrowContractAddress);
    console.log(`\n Query result :${contractQueryResult}`);

///check contract Balance before transfer Hbar in contract Address
// Query the contract balance

console.log("My code is working2 .......");

const [fromCallQuery1, fromInfoQuery1] = await utils.contractBalanceCheckerFcn(escrowContractId,client);
console.log("after transfer hbar contract id");
console.log(`\n- Contract balance (from getBalance fcn): ${fromCallQuery1} tinybars`);
console.log(`- Contract balance (from ContractInfoQuery): ${fromInfoQuery1.balance.toString()}`);

    
    }
	

main();

   
