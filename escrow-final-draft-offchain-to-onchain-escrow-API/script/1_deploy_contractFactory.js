// ********* Deploying Factory contract *********

console.clear();
require("dotenv").config();

const {
    Client, AccountId, PrivateKey
} = require("@hashgraph/sdk");


// Import required functions 
const utils=require("../utils/utils");

const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);



let contractCompiled = require("../build/contracts/ContractFactory.json");
const bytecode = contractCompiled.bytecode;



// Provider
const providerId= AccountId.fromString(process.env.Account1_Id);
// MO
const moId= AccountId.fromString(process.env.Account2_Id);



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

    const [contractId,contractAddress]=await utils.createContractFactoryContractId(bytecodeFileId,gasLim,client);
    console.log(`\n contract Id :${contractId}`);
    console.log(`\n contract address :${contractAddress}`);


	
}
main();