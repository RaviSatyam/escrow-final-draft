// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// Compile with remix for remote imports to work - otherwise keep precompiles locally
import "../precompiled-contracts/HederaTokenService.sol";
import "../precompiled-contracts/HederaResponseCodes.sol";




contract PaymentContract is HederaTokenService{



    //============================================ 
    // GETTING HBAR TO THE CONTRACT
    //============================================ 
    // Lock Funds to the Contract from the Purchaser
    receive() external payable {}

    fallback() external payable {}


   // Payout to provider
    function payout(address payable _providerAddress, uint256 _amount) public {

      _providerAddress.transfer(_amount);


    }


    // // Extra Funds returned to the Purchaser by Escrow SC
    function releaseFreeBalance(address payable _purhaserAddress) public {
      
      _purhaserAddress.transfer(address(this).balance);
    }

    // Allocated Funds to 3rd Party
    function releaseFunds(address payable _creditAddress) public{

      _creditAddress.transfer(address(this).balance);
    }


    //============================================ 
    // CHECKING THE HBAR BALANCE OF THE CONTRACT
    //============================================ 
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}