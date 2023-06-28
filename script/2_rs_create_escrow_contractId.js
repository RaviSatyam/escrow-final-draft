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

// Provider
const providerId= AccountId.fromString(process.env.Account1_Id);
// MO
const moId= AccountId.fromString(process.env.Account2_Id);

//credit address
const creditAddress=AccountId.fromString(process.env.Account3_Id);


const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const contractId=process.env.CONTRACT_FACTORY_CONTRACT_ID;

async function main() {
  
        //console.log('contractID', contractId);

        console.log(`\n- New Contract Id created ......`);
        // STEP 1 =====================================

        // Set Params

       const msParams = await utils.contractParamsBuilderFcnMS(providerId,moId,operatorId,creditAddress,2);
        const gasLimit = 10000000;
        

       // console.log(msParams);

    
        //const msParams=[];
        const createEscrowContractStatus = await utils.contractExecuteFcn(contractId, gasLimit, "createContract", msParams,client,2);
    
        console.log(`\n Created new Escrow SC Status :${createEscrowContractStatus}`)
       

        

}
main();

   
