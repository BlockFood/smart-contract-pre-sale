const config = require('../pre-sale/config')

const BlockFoodPreSale = artifacts.require('./BlockFoodPreSale.sol')

const getBalance = (addr) => new Promise((resolve, reject) =>
    web3.eth.getBalance(addr, (err, result) => {
        if (err) {
            console.log('Failed to get balance', err)
            reject(err)
        } else {
            resolve(result)
        }
    })
)

let timeAdjustement = 0
const getCurrentDate = (diffInSeconds) => ~~((Date.now() + (diffInSeconds + timeAdjustement) * 1000) / 1000)

const expectFailure = async (promise, errorMessage) => {
    let hasFailed
    try {
        await promise
        hasFailed = false
    } catch (e) {
        hasFailed = true
    }
    assert.equal(hasFailed, true, errorMessage)
}

contract('BlockFoodPreSale', function (accounts) {

    it('should properly set the values from the constructor', async () => {
        const instance = await BlockFoodPreSale.deployed()

        const [
            owner,
            target,
            endDate,
            minCap,
            maxCap,
        ] = await Promise.all([
            instance.owner(),
            instance.target(),
            instance.endDate(),
            instance.minCap(),
            instance.maxCap(),
        ])

        assert.equal(owner, accounts[0], 'owner is not correctly set')
        assert.equal(target, config.target, 'target is not correctly set')
        assert.equal(endDate, config.endDate, 'endDate is not correctly set')
        assert.equal(minCap.toString(10), web3.toWei(config.minCap, 'ether'), 'minCap is not correctly set')
        assert.equal(maxCap.toString(10), web3.toWei(config.maxCap, 'ether'), 'maxCap is not correctly set')
    })

    const getNewInstance = async (config) => {
        return (await BlockFoodPreSale.new(
            config.target,
            config.endDate,
            web3.toWei(config.minCap, 'ether'),
            web3.toWei(config.maxCap, 'ether'),
        ))
    }
})