// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// Compile with remix for remote imports to work - otherwise keep precompiles locally
import "../precompiled-contracts/HederaTokenService.sol";
import "../precompiled-contracts/HederaResponseCodes.sol";
import "./EscrowContract.sol";



contract PaymentContract is HederaTokenService{



    //============================================ 
    // GETTING HBAR TO THE CONTRACT
    //============================================ 
    // Lock Funds to the Contract from the Purchaser
    receive() external payable {}

    fallback() external payable {}



    function payout(address payable _providerAddress, uint256 _amount,address payable contract_address ) public {

      // require(providerAddress == _providerAddress, "Address doesn't match");
      // contract_address = payable(this);
      uint256 price = contract_address.balance - (contract_address.balance - _amount);
      _providerAddress.transfer(price);


    }


    // Extra Funds returned to the Purchaser by Escrow SC
    function releaseFreeBalance(address payable _purhaserAddress,address payable contract_address) public {
      // contract_address = payable(this);
     uint256 _amount = contract_address.balance;
      _purhaserAddress.transfer(_amount);
    }

    // Allocated Funds to 3rd Party
    function releaseFunds(address payable _creditAddress, address payable contract_address) public{

      // contract_address = payable(this);
     uint256 _amount = contract_address.balance;
      _creditAddress.transfer(_amount);
    }


    //============================================ 
    // CHECKING THE HBAR BALANCE OF THE CONTRACT
    //============================================ 
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}