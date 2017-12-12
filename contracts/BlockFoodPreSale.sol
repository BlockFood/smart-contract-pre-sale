pragma solidity ^0.4.0;


contract BlockFoodPreSale {

    enum ApplicationState {Unset, Pending, Rejected, Accepted}

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
    uint public withdrawn;

    /*
        Events
    */
    event PendingApplication(address applicant, uint contribution, string id);
    event RejectedApplication(address applicant, uint contribution, string id);
    event AcceptedApplication(address applicant, uint contribution, string id);
    event Withdrawn(address target, uint amount);

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
        require(applications[msg.sender].state == ApplicationState.Unset);
        _;
    }

    modifier onlyPendingApplication(address applicant) {
        require(applications[applicant].contribution > 0);
        require(applications[applicant].state == ApplicationState.Pending);
        _;
    }

    modifier onlyMinCapReached() {
        require(contributionAccepted >= minCap);
        _;
    }

    modifier onlyNotWithdrawn(uint amount) {
        require(withdrawn + amount <= contributionAccepted);
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
        PendingApplication(msg.sender, msg.value, id);
    }

    function reject(address applicant)
    public
    onlyOwner
    onlyPendingApplication(applicant)
    {
        if (applications[applicant].contribution > 0) {
            applications[applicant].state = ApplicationState.Rejected;

            // protection against function reentry on an overriden transfer() function
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
    onlyPendingApplication(applicant)
    {
        applications[applicant].state = ApplicationState.Accepted;

        contributionPending -= applications[applicant].contribution;
        contributionAccepted += applications[applicant].contribution;

        AcceptedApplication(applicant, applications[applicant].contribution, applications[applicant].id);
    }

    function withdraw(uint amount)
    public
    onlyOwner
    onlyMinCapReached
    onlyNotWithdrawn(amount)
    {
        withdrawn += amount;
        target.transfer(amount);
        Withdrawn(target, amount);
    }
}
