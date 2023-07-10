
// Decode the contract events from Contract Factory using API
// For more informations plz refer mirror_node folder

console.clear();
require("dotenv").config();


const {
  ContractId
} = require("@hashgraph/sdk");

// Import required functions from mirror_node folder
const utils = require('../utils/mirror_utils')

let contractCompiled = require("../build/contracts/TestContract.json");
const abi = contractCompiled.abi;

const contractId = process.env.NEW_CONTRACT_ID;



async function main() {

  console.log(contractId);

  const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId}/results/logs`;

  const logData = await utils.getLogsTxnDetails(url);

  const eventName = 'milestoneList';

  // console.log(logData)

  // Decode the recent log data (at index 0)
  const decodedLog = utils.decodeEventLogData(logData.logs[0], abi, eventName);
  // console.log(decodedLog);
  // Decode all log data
  logData.logs.forEach(log => {
    const decodedLog = utils.decodeEventLogData(log, abi, eventName);
    console.log('######################################################')
    console.log(decodedLog);
  });


}

main();


