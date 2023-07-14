// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


struct Milestone{
    int Id;
    int budget;
    string description;
    int noRevision;

}

contract TestContract {

    Milestone[] public milestonesList;

    event purchaserDetails(int id,string email,string projectName);

    function setPurchaserInfo(int _id,string memory _email,string memory _projectName)public{
        emit purchaserDetails(_id,_email,_projectName);
         
    }

    event milestoneList(int id,int budget,string description,int noRevision);

    function setMilestoneDetails(int _id,int  _budget,string memory _description, int _noRevision) public {
    Milestone memory ms;
    ms.Id=_id;
    ms.budget=_budget;
    ms.description=_description;
    ms.noRevision=_noRevision;
   
   emit milestoneList(_id,_budget,_description,_noRevision);
    milestonesList.push(ms);
    
    }

    function milestoneById(int _id) public view returns(Milestone memory milestone){
        for(uint i=0;i<milestonesList.length;i++){
            if(milestonesList[i].Id==_id){
                return milestonesList[i];
            }
        }
    }

    function allMilestones() public view returns(Milestone[] memory milestones){
        return milestonesList;
    }

    

}