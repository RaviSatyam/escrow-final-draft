// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// Enum declared for state
enum State {
    Inprogress,
    Inreview,
    Completed,
    Rework,
    Forceclosed
}

// Milestone struct contains fields coming internally
struct MilestoneRequired {
    int msId;
    string descriptionFileLink; //string/link
    State state; //state-> init,done,rework,forcedClose
    bool isApproved;
    bool isclosed;
    string resolveTime;
    int revisionCounter;
}

// Milestone struct contains fields coming from UI
struct Milestone {
    string descriptionFileHash;
    string title;
    uint budget;
    string initDate;
    string dueDate;
    int numberRevisions;
    MilestoneRequired ms_req;
}

contract MilestoneContract {
    //Milestone array contains milestones
    Milestone[] public milestonesList;

    // Map to store milestones  msId=> milestone
    mapping(int => Milestone) milestones;

    // Event to track change state
    event trackState(State state);

    event milestoneList(
        string descriptionFileHash,
        string title,
        uint budget,
        string initDate,
        string dueDate,
        int numberRevisions,
        int msId
    );

    function addMilestone(
        int _msId,
        string memory _descriptionFileHash,
        string memory _title,
        int _budget,
        string memory _initDate,
        string memory _dueDate,
        int _numberRevisions
    ) public {
        Milestone memory ms;
        ms.descriptionFileHash = _descriptionFileHash;
        ms.title = _title;
        ms.budget = uint(_budget);
        ms.initDate = _initDate;
        ms.dueDate = _dueDate;
        ms.numberRevisions = _numberRevisions;

        MilestoneRequired memory msreq;
        msreq.msId = _msId; // need to modification and call id generator function
        msreq.descriptionFileLink = "www.google.com";
        msreq.state = State.Inprogress;
        msreq.isApproved = false;
        msreq.isclosed = false;
        msreq.resolveTime = "";
        msreq.revisionCounter = 0;

        emit milestoneList(
            _descriptionFileHash,
            _title,
            ms.budget,
            _initDate,
            _dueDate,
            _numberRevisions,
            _msId
        );

        // emit trackState(msreq.state);
         ms.ms_req = msreq;

        milestones[_msId] = ms;

        milestonesList.push(ms);
    }

    // Function called by provider to change MS state
    function changeMS_state(int _id) public {
        for (uint i = 0; i < milestonesList.length; i++) {
            if (milestonesList[i].ms_req.msId == _id) {
                milestonesList[i].ms_req.state = State.Completed;
            }
        }
        Milestone storage ms = milestones[_id];
        ms.ms_req.state = State.Completed;
        // milestones[_id]=ms;--> This may not req, have to check
    }

    // Approve MS status -> 1. Accept and payout function will call 2. Reject and State change to rework.
    function approveMS_status(
        int _id,
        bool _val,
        address payable provider_address
    ) public returns (bool approvedStatus, string memory message) {
        // Purchaser will Approve Provider request
        for (uint i = 0; i < milestonesList.length; i++) {
            if (milestonesList[i].ms_req.msId == _id && _val == true) {
                // Call fund transfer function
                address contractAddress = address(this);
                uint bal = (milestonesList[i].budget) * (10 ** 8);
                provider_address.transfer(
                    (contractAddress.balance) - (contractAddress.balance - bal)
                );

                return (true, "Fund transfer successfully ");
            } else if (milestonesList[i].ms_req.msId == _id && _val == false) {
                if (
                    milestonesList[i].ms_req.revisionCounter <
                    milestonesList[i].numberRevisions
                ) {
                    //Revision counter will increase---> Array
                    milestonesList[i].ms_req.revisionCounter =
                        milestonesList[i].ms_req.revisionCounter +
                        1;
                    milestonesList[i].ms_req.state = State.Rework;

                    //Revision counter will increase---> Map
                    Milestone storage ms = milestones[_id];
                    ms.ms_req.revisionCounter = ms.ms_req.revisionCounter +1;
                    ms.ms_req.state=State.Rework;

                    return (true, "MS status change to rework");
                } else {
                    // Penalty calculation function will call
                    // Need to add more functionalities
                    return (true, "Penalty calculation function called");
                }
            }
        }

        return (false, "MS id not found ");
    }

    // Get MS by Id
    function getMilestoneById(int _Id) public view returns (Milestone memory ms) {
        for (uint i = 0; i < milestonesList.length; i++) {
            if(milestonesList[i].ms_req.msId==_Id){
                return milestonesList[i];
            }
        }
        
    }

    // Get all MS
    function getAllMS() public view returns (Milestone[] memory msList) {
        return milestonesList;
    }

    // Penalty calculation--> 1.Based on number of revision counter

    function penaltyCalculation(int _Id) public view returns (uint penalty){
        for (uint i = 0; i < milestonesList.length; i++) {
            if(milestonesList[i].ms_req.msId==_Id){
                int n=(milestonesList[i].numberRevisions)-(milestonesList[i].ms_req.revisionCounter);
                return uint(n*100000000);
            }
        }
    }

}
