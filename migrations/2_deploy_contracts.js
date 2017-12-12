const BlockFoodPreSale = artifacts.require('./BlockFoodPreSale.sol')

const config = require('../pre-sale/config')

module.exports = function (deployer) {
    console.log('Deploy BlockFoodPreSale', config)
    deployer.deploy(BlockFoodPreSale,
        config.target,
        config.endDate,
        web3.toWei(config.minContribution),
        web3.toWei(config.minCap, 'ether'),
        web3.toWei(config.maxCap, 'ether'),
    )
}
