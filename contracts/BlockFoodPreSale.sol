pragma solidity ^0.4.0;


contract BlockFoodPreSale {

    address public owner;

    address public target;

    uint public endDate;

    uint public minCap;

    uint public maxCap;

    function BlockFoodPreSale(
    address _target,
    uint _endDate,
    uint _minCap,
    uint _maxCap
    )
    public
    {
        owner = msg.sender;

        target = _target;
        endDate = _endDate;
        minCap = _minCap;
        maxCap = _maxCap;
    }
}
