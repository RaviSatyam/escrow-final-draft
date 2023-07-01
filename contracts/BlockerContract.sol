// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


struct Blocker{
    int Id;
    string name;
    string email;

}

contract BlockerContract {

    Blocker[] public hederaBlockerList;

    event blockerList(int id,string name,string email);

    function setBlockerData(int _id,string memory _name, string memory _email) public {
    Blocker memory b;
    b.Id=_id;
    b.email=_email;
    b.name=_name;
   
   emit blockerList(_id,_name,_email);
    hederaBlockerList.push(b);
    
    }

    function blockerById(int _id) public view returns(Blocker memory blocker){
        for(uint i=0;i<hederaBlockerList.length;i++){
            if(hederaBlockerList[i].Id==_id){
                return hederaBlockerList[i];
            }
        }
    }

    function allBlockers() public view returns(Blocker[] memory blocker){
        return hederaBlockerList;
    }

    

}