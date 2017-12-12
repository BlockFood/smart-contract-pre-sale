pragma solidity ^0.4.0;


contract BlockFoodPreSale {

    enum ApplicationState {Pending, Rejected, Accepted}

    struct Application {
        uint contribution;
        string id;
        ApplicationState state;
    }


    /*
        Set by constructor
    */
    address public owner;
    address public target;
    uint public endDate;
    uint public minContribution;
    uint public minCap;
    uint public maxCap;

    /*
        Set by functions
    */
    mapping(address => Application) public applications;
    uint public contributionPending;
    uint public contributionRejected;
    uint public contributionAccepted;

    /*
        Events
    */
    event NewApplication(address applicant, uint contribution, string id);
    event RejectedApplication(address applicant, uint contribution, string id);
    event AcceptedApplication(address applicant, uint contribution, string id);

    /*
        Modifiers
    */
    modifier onlyBeforeEnd() {
        require(now <= endDate);
        _;
    }

    modifier onlyMoreThanMinContribution() {
        require(msg.value >= minContribution);
        _;
    }

    modifier onlyMaxCapNotReached() {
        require((contributionPending + contributionAccepted + msg.value) <= maxCap);
        _;
    }

    modifier onlyOwner () {
        require(msg.sender == owner);
        _;
    }

    modifier onlyNewApplicant () {
        require(applications[msg.sender].contribution == 0);
        _;
    }

    /*
        Constructor
    */

    function BlockFoodPreSale(
        address _target,
        uint _endDate,
        uint _minContribution,
        uint _minCap,
        uint _maxCap
    )
    public
    {
        owner = msg.sender;

        target = _target;
        endDate = _endDate;
        minContribution = _minContribution;
        minCap = _minCap;
        maxCap = _maxCap;
    }

    function apply(string id)
    payable
    public
    onlyBeforeEnd
    onlyMoreThanMinContribution
    onlyMaxCapNotReached
    onlyNewApplicant
    {
        applications[msg.sender] = Application(msg.value, id, ApplicationState.Pending);
        contributionPending += msg.value;
        NewApplication(msg.sender, msg.value, id);
    }

    function reject(address applicant)
    public
    onlyOwner
    {
        if (applications[applicant].contribution > 0) {
            applications[applicant].state = ApplicationState.Rejected;

            // protection against function reentry on an overriden transfer function
            uint contribution = applications[applicant].contribution;
            applications[applicant].contribution = 0;
            applicant.transfer(contribution);

            contributionPending -= contribution;
            contributionRejected += contribution;

            RejectedApplication(applicant, contribution, applications[applicant].id);
        }
    }

    function accept(address applicant)
    public
    onlyOwner
    {
        AcceptedApplication(applicant, applications[applicant].contribution, applications[applicant].id);
    }
}
