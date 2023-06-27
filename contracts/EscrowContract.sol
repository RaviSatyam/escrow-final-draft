// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import "./PaymentContract.sol";

contract EscrowContract is PaymentContract {

    //Purchaser, Provider and MO addresses
    address payable public purchaser_address;
    address payable public provider_address;
    address payable public mo_address;
    address payable public contract_address = payable(address(this));

    
    // address public contract_address = address(this);
   // uint256 public balance1 = 100;
   // uint256 public allocatedBalance;


    // Constructor with arguments 
    constructor(address payable _provider_address, address payable _mo_address,address payable _purchaser_address) {
        //purchaser_address = payable(msg.sender);
        provider_address = _provider_address;
        mo_address = _mo_address;
        purchaser_address=_purchaser_address;
       
    }
   
    

     // Modifier declaration 

    modifier onlyPurchaser() {
        require(msg.sender == purchaser_address);
        _;
    }

    modifier onlyProvider() {
        require(msg.sender == provider_address);
        _;
    }
    modifier onlyMO() {
        require(msg.sender == mo_address);
        _;
    }
//   function getBalance() public view returns (uint) {
  
//         return address(this).balance;

// }
}