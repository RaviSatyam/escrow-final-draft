// Import web3 and axios

const Web3 = require('web3');
//const web3 = new Web3;
const axios = require('axios');


// function to get logs data of events from api url, for smart contract

async function getLogsTxnDetails(apiUrl) {

    const promise = axios.get(apiUrl)

    const dataPromise = promise.then((response) => response.data)

    return dataPromise

}

// function to decode the log data coming from api url of smart contract

 function decodeEventLogData(log, abi, eventName) {
    let logStringHex = log.data;
    let logTopics = [];
    log.topics.forEach(topic => {
        logTopics.push(topic);
    });
    // console.log('\n Print topics \n \n');
    // console.log(logTopics);
    const result =  decodeEvent(eventName, logStringHex, logTopics.slice(0), abi);
    // console.log('\n Print results \n \n');
    // console.log(result);
    return result;
}

// Function to decode the hex string log data of event

 function decodeEvent(eventName, log, topics, abi) {

    const eventAbi = abi.find(event => (event.name === eventName && event.type === "event"));
    const decodedLog = Web3.eth.abi.decodeLog(eventAbi.inputs, log, topics);

    return decodedLog;
}


module.exports = { getLogsTxnDetails, decodeEventLogData }