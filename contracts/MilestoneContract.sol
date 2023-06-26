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
    uint msId;
    string descriptionFileLink; //string/link
    State state; //state-> init,done,rework,forcedClose
    bool isApproved;
    bool isclosed;
    string resolveTime;
    uint revisionCounter;
}

// Milestone struct contains fields coming from UI
struct Milestone {
    string descriptionFileHash;
    string title;
    uint budget;
    string initDate;
    string dueDate;
    uint numberRevisions;
    MilestoneRequired ms_req;
}

contract MilestoneContract {
    //Milestone array contains milestones
    Milestone[] public milestonesList;

    // Map to store milestones  msId=> milestone
    mapping(uint => Milestone) milestones;

    // Event to track change state
    event trackState(State state);

    event milestoneList(
        string descriptionFileHash,
        string title,
        uint budget,
        string initDate,
        string dueDate,
        uint numberRevisions,
        uint msId

    );

    function addMilestone(
        uint msId,
        string memory _descriptionFileHash,
        string memory _title,
        uint _budget,
        string memory _initDate,
        string memory _dueDate,
        uint _numberRevisions
    ) public {
        Milestone memory ms;
        ms.descriptionFileHash = _descriptionFileHash;
        ms.title = _title;
        ms.budget = _budget;
        ms.initDate = _initDate;
        ms.dueDate = _dueDate;
        ms.numberRevisions = _numberRevisions;

        MilestoneRequired memory msreq;
        msreq.msId = msId; // need to modification and call id generator function
        msreq.descriptionFileLink = "www.google.com";
        msreq.state = State.Inprogress;
        msreq.isApproved = false;
        msreq.isclosed = false;
        msreq.resolveTime = "";
        msreq.revisionCounter = 0;

        emit milestoneList(
            _descriptionFileHash,
            _title,
            _budget,
            _initDate,
            _dueDate,
            _numberRevisions,
            msId
        );

        emit trackState(msreq.state);
        ms.ms_req = msreq;

        milestones[msId] = ms;

        milestonesList.push(ms);
    }

    // Function called by provider to change MS state
    function changeMS_state(uint _id) public {
        for (uint i = 0; i < milestonesList.length; i++) {
            if (milestonesList[i].ms_req.msId == _id) {
                milestonesList[i].ms_req.state = State.Completed;
            }
        }
        Milestone storage ms = milestones[_id];
        ms.ms_req.state = State.Completed;
        // milestones[_id]=ms;--> This may not req, have to check
    }
}
