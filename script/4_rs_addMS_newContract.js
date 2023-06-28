console.clear();

require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,ContractExecuteTransaction, ContractFunctionParameters
} = require("@hashgraph/sdk");

// Import required functions from smart_contract folder
const utils = require("../utils/utils.js");

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID); //purchaser
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);



const contractId=process.env.NEW_CONTRACT_ID;

async function main() {

    
  
        console.log('MS added to:', contractId);

        console.log(`\n- Calling Add MS ......`);
        // STEP 1 =====================================
        const msParams = await utils.contractParamsBuilderMS(102,"file_hash2","MS_Title_2",3,"28-06-2023","04-07-2023",
        3,2);
        
        const gasLimit = 10000000;
        const addMS_Status = await utils.contractExecuteFcn(contractId, gasLimit, "addMilestone", msParams,client,2);
    
        console.log(`\n Add MS Status :${addMS_Status}`);

        

        
    
    
}
main();



   
