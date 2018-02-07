const config = require('../pre-sale/config')
const dateInSeconds = (jsonDateString) => ~~(Date.parse(jsonDateString) / 1000)

const BlockFoodPreSale = artifacts.require('./BlockFoodPreSale.sol')
const BlockFoodExtendedPreSale = artifacts.require('./BlockFoodExtendedPreSale.sol')

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

const moveTimeForward = async (seconds) => {
    await web3.currentProvider.send({ jsonrpc: '2.0', method: 'evm_increaseTime', params: [seconds], id: 0 })
    timeAdjustement += seconds
}

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

contract('BlockFoodExtendedPreSale', function (accounts) {

    const ownerAccount = accounts[2]
    const notOwnerAccount = accounts[1]

    it.only('should properly replicate the values from BlockFoodPreSale', async () => {
        const preSale = await BlockFoodPreSale.new(
            accounts[1],
            dateInSeconds('2018-02-08T16:00:00.000Z'),
            web3.toWei(1, 'ether'),
            web3.toWei(0, 'ether'),
            web3.toWei(2, 'ether'),
            { from: ownerAccount }
        )

        await preSale.apply('id42', { value: web3.toWei(1, 'ether'), from: notOwnerAccount })
        await preSale.accept(notOwnerAccount, { from: ownerAccount })

        console.log('???',preSale.address.toString(), typeof preSale.address)

        const extendedPreSale = await BlockFoodExtendedPreSale.new(
            preSale.address.toString(),
            accounts[1],
            dateInSeconds('2018-02-22T16:00:00.000Z'),
            web3.toWei(1, 'ether'),
            web3.toWei(0, 'ether'),
            web3.toWei(2, 'ether'),
            { from: ownerAccount }
        )

        assert.equal(await extendedPreSale.owner(), await preSale.owner())
        assert.equal(await extendedPreSale.target(), await preSale.target())
        assert.equal((await extendedPreSale.endDate()).toNumber(), (await preSale.endDate()).toNumber())
        assert.equal((await extendedPreSale.minContribution()).toNumber(), (await preSale.minContribution()).toNumber())
        assert.equal((await extendedPreSale.minCap()).toNumber(), (await preSale.minCap()).toNumber())
        assert.equal((await extendedPreSale.maxCap()).toNumber(), (await preSale.maxCap()).toNumber())
    })

})