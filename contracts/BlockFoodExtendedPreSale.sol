pragma solidity ^0.4.18;

import './BlockFoodPreSale.sol';

contract BlockFoodExtendedPreSale is BlockFoodPreSale {

    address public owner;

    event Debug(address lol);

    /*
        Constructor
    */
    function BlockFoodExtendedPreSale(
        address blockFoodPreSale_,
        address target_,
        uint endDate_,
        uint minContribution_,
        uint minCap_,
        uint maxCap_
    )
    BlockFoodPreSale(
        target_,
        endDate_,
        minContribution_,
        minCap_,
        maxCap_
    )
    payable
    public
    {
        Debug(blockFoodPreSale_);
        BlockFoodPreSale preSale = BlockFoodPreSale(blockFoodPreSale_);

        owner = preSale.owner();
                target = preSale.target();
                endDate = preSale.endDate();
                minContribution = preSale.minContribution();
                minCap = preSale.minCap();
                maxCap = preSale.maxCap();
    }

}
