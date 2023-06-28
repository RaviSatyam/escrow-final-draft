
// Decode the contract events from Contract Factory using API
// For more informations plz refer mirror_node folder

console.clear();
require("dotenv").config();


const {
  ContractId
} = require("@hashgraph/sdk");

// Import required functions from mirror_node folder
const utils = require('../utils/mirror_utils')

let contractFactoryCompiled = require("../build/contracts/ContractFactory.json");
const abi = contractFactoryCompiled.abi;

const contractId = process.env.CONTRACT_FACTORY_CONTRACT_ID;



async function main() {

//console.log(contractId);
  const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId}/results/1685790454.141821834`;

  const url1 = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId}/results/logs`;


  const logData = await utils.getLogsTxnDetails(url1);

  const eventName = 'ContractCreated';

   //console.log(logData.logs[0]);



  // Decode the recent log data (at index 0)

  const decodedLog = utils.decodeEventLogData(logData.logs[0], abi, eventName);
  const newContractSolidityAddress = decodedLog.newContract;

  console.log(decodedLog);

  console.log(newContractSolidityAddress);

  const new_contractId = ContractId.fromSolidityAddress(newContractSolidityAddress).toString();
  console.log(new_contractId);




  // Decode all log data
  // logData.logs.forEach(log => {
  //   const decodedLog = utils.decodeEventLogData(log, abi, eventName);
  //   console.log('######################################################')
  //   const newContractSolidityAddress = decodedLog.newContract;
  //   console.log(newContractSolidityAddress);

  //   const new_contractId = ContractId.fromSolidityAddress(newContractSolidityAddress).toString();
  //   console.log(new_contractId);

  // });




}
main();


