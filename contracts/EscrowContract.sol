// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./MilestoneContract.sol";

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
}
