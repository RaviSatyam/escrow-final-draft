// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./MilestoneContract.sol";
//import "./PaymentContract.sol";
import "../precompiled-contracts/HederaTokenService.sol";
import "../precompiled-contracts/HederaResponseCodes.sol";


contract EscrowContract is MilestoneContract {
    //Purchaser, Provider and MO addresses
    address payable public purchaser_address;
    address payable public provider_address;
    address payable public mo_address;

    address payable public creditAddress;

    // Constructor with arguments
    constructor(
        address payable _provider_address,
        address payable _mo_address,
        address payable _purchaser_address,
        address payable _creditAddress
    ) {
        provider_address = _provider_address;
        mo_address = _mo_address;
        purchaser_address = _purchaser_address;
        creditAddress = _creditAddress;
    }

     //============================================ 
    // GETTING HBAR TO THE CONTRACT
    //============================================ 
    // Lock Funds to the Contract from the Purchaser
    receive() external payable {}

    fallback() external payable {}

    //============================================ 
    // CHECKING THE HBAR BALANCE OF THE CONTRACT
    //============================================ 
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Payout to provider
    function payout( int _amount) public {
        uint bal=uint(_amount)*(10**8);

      provider_address.transfer(bal);


    }

    
}
