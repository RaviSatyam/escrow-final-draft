
const {
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    TransferTransaction,
    ContractInfoQuery,
    ContractCreateFlow,
    Hbar,
    AccountCreateTransaction,
    FileAppendTransaction,
    FileCreateTransaction
} = require("@hashgraph/sdk");

const fs = require('fs');

const Web3 = require('web3');
//const web3 = new Web3;




              //###############################################################//
             //      Functions related to Contract deployment on hedera        //
//#############################################################################################################


// Function to create bytecode file Id using file append Txn function

async function createByteCodeFileId(bytecode,client,operatorKey) {
    const fileCreateTx = await new FileCreateTransaction()

        //Set the bytecode of the contract
        .setKeys([operatorKey])
        .freezeWith(client)
        .sign(operatorKey);

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    //Get the file ID from the receipt
    const bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    // console.log("The smart contract byte code file ID is " + bytecodeFileId)
    const fileAppendTx = await new FileAppendTransaction()
        .setFileId(bytecodeFileId)
        .setContents(bytecode)
        .setMaxChunks(1000)
        .freezeWith(client)
        .sign(operatorKey);

    const fileAppendSubmit = await fileAppendTx.execute(client);

    const fileAppendRx = fileAppendSubmit.getReceipt(client);
    const fileAppendStatus = (await fileAppendRx).status;

    return [bytecodeFileId, fileAppendStatus];


}

// Function to deploy contract on hedera network and return contract Id

async function createContractFactoryContractId(bytecodeFileId,gasLimit,client) {
    console.log("################### Calling createContractId function #######################################");
    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId(bytecodeFileId)
        //Set the gas to instantiate the contract
        .setGas(gasLimit);
            
        // .setConstructorParameters(new ContractFunctionParameters().addInt256(id)
        // .addString(name).addString(email).addString(project_name));

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const contractID = contractReceipt.contractId;

    //Log the smart contract ID
    // console.log("The smart contract ID is " + contractID);

    const contractAddress = contractID.toSolidityAddress();

    return [contractID, contractAddress];

}


// Function to deploy contract on hedera network and return contract Id

async function createEscrowContractId(bytecodeFileId,gasLimit,params,client) {
    console.log("################### Calling createContractId function #######################################");
    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId(bytecodeFileId)
        //Set the gas to instantiate the contract
        .setGas(gasLimit)
            
        .setConstructorParameters(params);

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const contractID = contractReceipt.contractId;

    //Log the smart contract ID
    // console.log("The smart contract ID is " + contractID);

    const contractAddress = contractID.toSolidityAddress();

    return [contractID, contractAddress];

}


             //####################################################################//
             //   Functions related to set the params and add the data on hedera  //
//#############################################################################################################

// To set parameters


async function contractParamsBuilderFcnMS(id,email,projectName, section) {
    console.log("Inside thepurchaser  Params fun ")
    let builtParams = [];
    if (section === 2) {
        builtParams = new ContractFunctionParameters()
            .addInt256(id)
            .addString(email)
            .addString(projectName);
       
    } else if(section===3){
        builtParams = new ContractFunctionParameters()
        .addUint256(provider);
    }
    else if(section===4){
        builtParams = new ContractFunctionParameters()
        .addUint256(provider);
    }
            
     else {
    }
    return builtParams;
}
// To set function parameters for add milestone 
// uint _msId,
// string memory _descriptionFileHash,
// string memory _title,
// uint _budget,
// string memory _initDate,
// string memory _dueDate,
// uint _numberRevisions

async function contractParamsBuilderMS(msId,descriptionFileHash,title,budget,initDate,dueDate,noRevision,section) {
    //console.log("Inside the Params fun ")
    let builtParams = [];
    if (section === 2) {
        builtParams = new ContractFunctionParameters()
            .addInt256(msId)
            .addString(descriptionFileHash)
            .addString(title)
            .addInt256(budget * 1e8)
            .addString(initDate)
            .addString(dueDate)
            .addInt256(noRevision);
       
    } else if(section===3){
        builtParams = new ContractFunctionParameters()
        .addUint256(provider);
    }
    else if(section===4){
        builtParams = new ContractFunctionParameters()
        .addUint256(provider);
    }
            
     else {
    }
    return builtParams;
}

async function contractParamsBuilderEscroContract(providerAddress,moAddress,purchaserAddress,creditAddress,section) {
    //console.log("Inside the Params fun ")
    let builtParams = [];
    if (section === 2) {
        builtParams = new ContractFunctionParameters()
            .addAddress(providerAddress.toSolidityAddress())
            .addAddress(moAddress.toSolidityAddress())
            .addAddress(purchaserAddress.toSolidityAddress())
            .addAddress(creditAddress.toSolidityAddress());
       
    } else if(section===3){
        builtParams = new ContractFunctionParameters()
        .addUint256(provider);
    }
    else if(section===4){
        builtParams = new ContractFunctionParameters()
        .addUint256(provider);
    }
            
     else {
    }
    return builtParams;
}





// Contract execute function to add MS

async function contractExecuteFcn(cId, gasLim, fcnName, params,client,section) {
    if(section===2){

        const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(cId)
        .setGas(gasLim)
        .setFunction(fcnName, params);

    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const getReceipt=await contractExecuteSubmit.getReceipt(client);
    return getReceipt.status;

    } else if(section===3){
        const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(cId)
        .setGas(gasLim)
        .setFunction(fcnName)
        .setPayableAmount(amountHbar);
    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    //const contractExecuteRec = await contractExecuteSubmit.getRecord(client);// This will return all data->including logs,txnId,Timestamp etc
    const getReceipt=await contractExecuteSubmit.getReceipt(client);
    return getReceipt.status;
    }
    return "Parameters mismatch";
   
}



//


async function contractParamsBuilderFcn( name, resolveTime, budget, noRevision, section) {
    let builtParams = [];
    if (section === 2) {
        builtParams = new ContractFunctionParameters()
            // .addAddress(aId.toSolidityAddress())
            // .addAddress(tId.toSolidityAddress());
            //.addUint256(id)
            .addString(name)
            .addUint256(resolveTime)
            .addUint256(budget * 1e8)
            .addUint256(noRevision);
    } else if (section === 3) {
        builtParams = new ContractFunctionParameters()
        .addUint256(id);
            // .addAddress(budget.toSolidityAddress())
            // .addAddress(noRevision.toSolidityAddress());
            
    } 
    return builtParams;
}


//

async function addMS_details(functionName, parameters, gas, contractId, abi,client,amountHbar) {
    try {
        const transaction = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(gas)
    .setFunction(functionName, parameters)
    .setPayableAmount(amountHbar);
    const contractExecuteSubmit = await transaction.execute(client);
    const record = await contractExecuteSubmit.getRecord(client);
    return record;
        
    } catch (error) {
        console.log(error);
        return error;
    }
    
}


// Encode the function

async function encodeFunctionCall(functionName, parameters, abi) {
    const functionAbi = abi.find(func => (func.name === functionName && func.type === "function"));
    const encodedParametersHex = Web3.eth.abi.encodeFunctionCall(functionAbi, parameters).slice(2);
    return Buffer.from(encodedParametersHex, 'hex');
}


// Decode the function results

async function decodeFunctionResult(functionName, resultAsBytes, abi) {

    console.log("decodeFunctionResult STARTS HERE");
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;

    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));

    const result = Web3.eth.abi.decodeParameters(functionParameters, resultHex);

    return result;
}


//


              //######################################################//
             //       Query the smart contract functions             //
//#############################################################################################################


// Get MS Info

async function getMS_details(functionName, parameters, gas, contractId, abi,client) {

    // generate function call with function name and parameters
    const functionCallAsUint8Array = await encodeFunctionCall(functionName, parameters, abi);

    // execute the transaction
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(gas)
        .execute(client);
    //get receipt
    const receipt = await transaction.getReceipt(client);
    // a record contains the output of the function
    const record = await transaction.getRecord(client);

   
    const results = await decodeFunctionResult(functionName, record.contractFunctionResult.bytes, abi);
    return results;
}


// Encode the function

async function encodeFunctionCall(functionName, parameters, abi) {
    const functionAbi = abi.find(func => (func.name === functionName && func.type === "function"));
    const encodedParametersHex = Web3.eth.abi.encodeFunctionCall(functionAbi, parameters).slice(2);
    return Buffer.from(encodedParametersHex, 'hex');
}


// Decode the function results

async function decodeFunctionResult(functionName, resultAsBytes, abi) {

    console.log("decodeFunctionResult STARTS HERE");
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;

    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));

    const result = Web3.eth.abi.decodeParameters(functionParameters, resultHex);

    return result;
}


// Call function

async function callFunction(functionName, parameters, gas, contractId, abi,client) {

    // generate function call with function name and parameters
    const functionCallAsUint8Array = await encodeFunctionCall(functionName, parameters, abi);

    // execute the transaction
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(gas)
        .execute(client);
    //get receipt
    const receipt = await transaction.getReceipt(client);
   
    return receipt.status;
}

// Function to save data to file
async function saveDataToFile(data,filePath) {
    //const filePath = '../../.env';
    fs.appendFile(filePath, data, (err) => {
      if (err) {
        console.error('Error writing data to file:', err);
      } else {
        console.log('Data saved to file successfully!');
      }
    });
  }


  // Function to read data from .env
  async function readDataFromFile(filePath) {
   // const filePath = '/path/to/your/.env'; // Replace with the correct directory path
  
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading data from file:', err);
      } else {
        console.log('Data read from file:', data);
      }
    });
  }

//   // Function to read specific data
//   async function readVariableFromFile(variableName,filePath) {
//     //const filePath = '/path/to/your/.env'; // Replace with the correct directory path
//     let name,value;
//     fs.readFile(filePath, 'utf8', (err, data) => {
//       if (err) {
//         console.error('Error reading data from file:', err);
//       } else {
//         const lines = data.split('\n');
//         for (const line of lines) {
//            [name, value] = line.split('=');
//           if (name === variableName) {
//             console.log(`Value of ${variableName}:`, value);
//             return value; // Exit the function after finding the variable
//           }
//         }
//         console.log(`Variable ${variableName} not found in file.`);
//       }
//     });
    
//   }


  ///
  async function readVariableFromFile(variableName,filePath) {
    //const filePath = '/path/to/your/.env'; // Replace with the correct directory path
  
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading data from file:', err);
          reject(err);
        } else {
          const lines = data.split('\n');
          for (const line of lines) {
            const [name, value] = line.split('=');
            if (name === variableName) {
              resolve(value);
              return; // Exit the function after finding the variable
            }
          }
          reject(`Variable ${variableName} not found in file.`);
        }
      });
    });
  }


  // Update variable value in file
  

async function updateVariableValue(variableName, newValue, filePath) {
  //const filePath = '/path/to/your/.env'; // Replace with the correct directory path

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data from file:', err);
      return;
    }

    const lines = data.split('\n');
    let updatedContent = '';
    let variableUpdated = false;

    for (const line of lines) {
      const [name, value] = line.split('=');

      if (name === variableName) {
        updatedContent += `${name}=${newValue}\n`;
        variableUpdated = true;
      } else {
        updatedContent += `${name}=${value}\n`;
      }
    }

    if (!variableUpdated) {
      console.log(`Variable ${variableName} not found in file.`);
      return;
    }

    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing data to file:', err);
      } else {
        console.log(`Variable ${variableName} updated successfully.`);
      }
    });
  });
}



  
  
  
  
  
  
  
  
  
  


module.exports={createByteCodeFileId,createContractFactoryContractId,contractParamsBuilderFcnMS,contractExecuteFcn,
    contractParamsBuilderFcn,addMS_details,getMS_details,contractParamsBuilderMS,callFunction,contractParamsBuilderEscroContract,
    createEscrowContractId,saveDataToFile,readVariableFromFile,updateVariableValue}