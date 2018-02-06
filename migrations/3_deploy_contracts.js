const BlockFoodExtendedPreSale = artifacts.require('./BlockFoodExtendedPreSale.sol')

const config = require('../pre-sale/config')

module.exports = function (deployer) {
    console.log('Deploy BlockFoodExtendedPreSale', config)

    deployer.deploy(BlockFoodExtendedPreSale,
        config.target,
        config.endDate,
        web3.toWei(config.minContribution),
        web3.toWei(config.minCap, 'ether'),
        web3.toWei(config.maxCap, 'ether'),
        { from: web3.eth.accounts[2] }
    )

    console.log('target=', config.target)
    console.log('endDate=', config.endDate)
    console.log('minContribution=', web3.toWei(config.minContribution))
    console.log('minCap=', web3.toWei(config.minCap, 'ether'))
    console.log('maxCap=', web3.toWei(config.maxCap, 'ether'))
}
