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
let contractCompiled = require("../build/contracts/TestContract.json");
const abi = contractCompiled.abi;
const bytecode = contractCompiled.bytecode;

async function main() {

    // STEP 1 =====================================
    //console.log(abi);
    console.log(contractId);
    console.log(`\n Calling noOfmS func`);
    const result1 = await utils.getMS_details('allMilestones', [], 10000000, contractId, abi,client);
    console.log(result1);
     
    // console.log('At index 0');
    // console.log(result1[0]);

    

}
main();


// // checking if change milestone status works fine
// async function main() {
//     const contractExecuteTx = new ContractExecuteTransaction()
//     .setContractId(contractId)
//     .setGas(10000000)
//     .setFunction(
//       "changeMS_state",
//       new ContractFunctionParameters().addUint256(1)
//     );
//   const contractExecuteSubmit = await contractExecuteTx.execute(client);
//   const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
//   // console.log("The transaction status is " +receipt2.status.toString());
//   console.log(`- Contract function call status: ${contractExecuteRx.status} \n`);
// }
// main();








