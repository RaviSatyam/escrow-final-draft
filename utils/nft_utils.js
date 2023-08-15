const {
    AccountId,
  PrivateKey,
  Client,
  TokenCreateTransaction,
  TokenInfoQuery,
  TokenType,
  CustomRoyaltyFee,
  CustomFixedFee,
  Hbar,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  AccountUpdateTransaction,
  TokenAssociateTransaction,
  TokenNftInfoQuery,
  NftId,
  AccountCreateTransaction,
  } = require("@hashgraph/sdk");
  require("dotenv").config();
  let fs = require('fs');



//############################################################################################

async function createNftToken(contractId,funcName,nftName,nftSymbol,memo,maxSupply,client){
    // Create NFT from precompile
const createToken = new ContractExecuteTransaction()
.setContractId(contractId)
.setGas(4000000) // Increase if revert
.setPayableAmount(50) // Increase if revert
.setFunction(funcName,
    new ContractFunctionParameters()
    .addString(nftName) // NFT name
    .addString(nftSymbol) // NFT symbol
    .addString(memo) // NFT memo
    .addInt64(maxSupply) // NFT max supply
    .addInt64(7000000) // Expiration: Needs to be between 6999999 and 8000001
    );
const createTokenTx = await createToken.execute(client);
const createTokenRx = await createTokenTx.getRecord(client);
const tokenIdSolidityAddr = createTokenRx.contractFunctionResult.getAddress(0);
const tokenId = TokenId.fromSolidityAddress(tokenIdSolidityAddr);

return [tokenIdSolidityAddr,tokenId];

}


//############################################################################################

 async function mintToken(metadata,contractId,funcName,tokenAddress,client){

// IPFS URI
//const metadata = "ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json";

// Mint NFT
const mintToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000)
    .setMaxTransactionFee(new Hbar(20)) //Use when HBAR is under 10 cents
    .setFunction(funcName,
        new ContractFunctionParameters()
        .addAddress(tokenAddress) // Token address
        .addBytesArray([Buffer.from(metadata)]) // Metadata
        );

const mintTokenTx = await mintToken.execute(client);
const mintTokenRx = await mintTokenTx.getRecord(client);
const serial = mintTokenRx.contractFunctionResult.getInt64(0);


//console.log(`Minted NFT with serial: ${serial} \n`);
return serial;

 }


 async function associateAccountWithToken(accountId,tokenId,accountPvKey,client){
     //Create the associate transaction and sign with Alice's key 
     const associateAliceTx = await new TokenAssociateTransaction()
     .setAccountId(accountId)
     .setTokenIds([tokenId])
     .freezeWith(client)
     .sign(accountPvKey);

 //Submit the transaction to a Hedera network
 const associateAliceTxSubmit = await associateAliceTx.execute(client);

 //Get the transaction receipt
 const associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

 return associateAliceRx;

 }


 async function transferNft(contractId,funcName,tokenAddress,receiverAccount,serial,accountPvKey,client){

// Transfer NFT to Account1
const transferToken = await new ContractExecuteTransaction()
.setContractId(contractId)
.setGas(10000000)
.setFunction(funcName,
    new ContractFunctionParameters()
    .addAddress(tokenAddress) // Token address
    .addAddress(receiverAccount.toSolidityAddress()) // Token receiver (Alice)
    .addInt64(serial)) // NFT serial number
.freezeWith(client) // freezing using client
.sign(accountPvKey); // Sign transaction with Alice

const transferTokenTx = await transferToken.execute(client);
const transferTokenRx = await transferTokenTx.getReceipt(client);


console.log(`Transfer status: ${transferTokenRx.status} \n`);


 }


 //=========================== NFT Royalty Functionalities ====================
 async function createNftTokenWithRoyalty(royaltyFee,feeCollectorAccId,CID,tokenName,tokenSymbol,
    treasuryId,adminKey,supplyKey,client,treasuryKey){

  // DEFINE CUSTOM FEE SCHEDULE (50% royalty fee - 5/10ths)
  let nftCustomFee = new CustomRoyaltyFee()
  .setNumerator(royaltyFee)
  .setDenominator(100)
  .setFeeCollectorAccountId(feeCollectorAccId)
  //the fallback fee is set to 1 hbar.
  .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(2)));


  // IPFS CONTENT IDENTIFIERS FOR WHICH WE WILL CREATE NFTs
//   let CID = [
//     "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
//     "QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
//     "QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
//     "Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5",
//     "QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw",
//   ];

  // CREATE NFT WITH CUSTOM FEE
  let nftCreate = await new TokenCreateTransaction()
    .setTokenName(tokenName)
    .setTokenSymbol(tokenSymbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(CID.length)
    .setCustomFees([nftCustomFee])
    .setAdminKey(adminKey)
    .setSupplyKey(supplyKey)
    .freezeWith(client)
    .sign(treasuryKey);

  let nftCreateTxSign = await nftCreate.sign(adminKey);
  let nftCreateSubmit = await nftCreateTxSign.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log(`Created NFT with Token ID: ${tokenId} \n`);

   return tokenId;
 }

// TOKEN INFO FUNCTION ============================================
 async function tokenNftInfo(tokenId,client){
    // TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT
  let tokenInfo = await new TokenInfoQuery()
  .setTokenId(tokenId)
  .execute(client);
console.table(tokenInfo.customFees[0]);
return tokenNftInfo;
 }


  // TOKEN MINTER FUNCTION ==========================================
  async function tokenMinterFcn(CID,tokenId,client,supplyKey) {
    mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(CID)])
      .freezeWith(client);
    let mintTxSign = await mintTx.sign(supplyKey);
    let mintTxSubmit = await mintTxSign.execute(client);
    let mintRx = await mintTxSubmit.getReceipt(client);
    return mintRx;
  }

  // TOKEN ASSOCIATE FUNCTION =======================================



  // BALANCE CHECKER FUNCTION ==========================================
  async function balCheckerFcn(accountId,tokenId,client) {
    balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    return [
      balanceCheckTx.tokens._map.get(tokenId.toString()),
      balanceCheckTx.hbars,
    ];
  }


  // TOKEN TRANSFER FUNCTION =======================================
  async function nftTransfer(tokenId,serial,senderId,senderKey,receiverId,receiverKey,client){
  let tokenTransferTx = await new TransferTransaction()
  .addNftTransfer(tokenId,serial , senderId, receiverId)
  .freezeWith(client)
  .sign(senderKey);
  if(!receiverKey){
    let tokenTransferSign=await tokenTransferTx.sign(receiverKey);
    tokenTransferTx=tokenTransferSign;
  }
let tokenTransferSubmit = await tokenTransferTx.execute(client);
let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
//console.log( `\n NFT transfer Treasury->Alice status: ${tokenTransferRx.status} \n`);
return tokenTransferRx;
  }
  


 module.exports={createNftToken,mintToken,associateAccountWithToken,transferNft,createNftTokenWithRoyalty,
    tokenNftInfo,tokenMinterFcn,balCheckerFcn,nftTransfer}

