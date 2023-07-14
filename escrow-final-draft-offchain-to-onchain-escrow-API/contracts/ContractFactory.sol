// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import './EscrowContract.sol';

contract ContractFactory{

    EscrowContract[] public escrow_contract;

     event ContractCreated(address newContract, uint256 timestamp);

    function createContract(address payable _provider_address, address payable _mo_address,address payable _purchaser_address,address payable _creditAddress) public {
        EscrowContract newContract = new EscrowContract(_provider_address,_mo_address,_purchaser_address,_creditAddress);
        escrow_contract.push(newContract);
        emit ContractCreated(address(newContract), block.timestamp);
    }

    function getDeployedContracts() public view returns (EscrowContract[] memory) {
        return escrow_contract;
    }

}



