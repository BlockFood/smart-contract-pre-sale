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
            minContribution,
            minCap,
            maxCap,
        ] = await Promise.all([
            instance.owner(),
            instance.target(),
            instance.endDate(),
            instance.minContribution(),
            instance.minCap(),
            instance.maxCap(),
        ])

        assert.equal(owner, accounts[0], 'owner is not correctly set')
        assert.equal(target, config.target, 'target is not correctly set')
        assert.equal(endDate, config.endDate, 'endDate is not correctly set')
        assert.equal(minContribution.toString(10), web3.toWei(config.minContribution, 'ether'), 'minContribution is not correctly set')
        assert.equal(minCap.toString(10), web3.toWei(config.minCap, 'ether'), 'minCap is not correctly set')
        assert.equal(maxCap.toString(10), web3.toWei(config.maxCap, 'ether'), 'maxCap is not correctly set')
    })

    const getNewInstance = async (config) => {
        return (await BlockFoodPreSale.new(
            config.target,
            config.endDate,
            web3.toWei(config.minContribution, 'ether'),
            web3.toWei(config.minCap, 'ether'),
            web3.toWei(config.maxCap, 'ether'),
        ))
    }

    describe('apply', () => {
        it('should not work after end', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(-10)
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await expectFailure(
                instance.apply('id42', { value: web3.toWei(0.01, 'ether') }),
                `Apply was called after end and did not throw error`
            )
        })

        it('should fail if msg.value below minContrib', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0.2
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await expectFailure(
                instance.apply('id42', { value: web3.toWei(0.1, 'ether') }),
                `Apply was called with value < minContribution and did not throw error`
            )
        })

        it('should fail if above maxCap', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0.2
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await expectFailure(
                instance.apply('id42', { value: web3.toWei(2, 'ether') }),
                `Apply was called with value < minContribution and did not throw error`
            )
        })

        it('should fail if address already applied', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0.2
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await instance.apply('id42', { value: web3.toWei(0.2, 'ether') })

            await expectFailure(
                instance.apply('id42', { value: web3.toWei(0.2, 'ether') }),
                `Apply was called with value < minContribution and did not throw error`
            )
        })

        it('should add application from the user and emit a PendingApplication event', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            const { logs } = await instance.apply('id42', { value: web3.toWei(0.1, 'ether') })

            const event = logs[0]

            assert.equal(event.event, 'PendingApplication', 'event name is wrong')
            assert.equal(event.args.applicant, accounts[0], 'applicant is wrong')
            assert.equal(event.args.contribution.toNumber(), web3.toWei(0.1, 'ether'), 'contribution is wrong')
            assert.equal(event.args.id, 'id42', 'id is wrong')

            const [contribution, id, state] = await instance.applications(accounts[0])

            assert.equal(contribution.toNumber(), web3.toWei(0.1, 'ether'), 'contribution is not correctly set')
            assert.equal(id, 'id42', 'id is not correctly set')
            assert.equal(state, 1, 'state is not correctly set')

            const contributionPending = await instance.contributionPending()

            assert.equal(contributionPending.toNumber(), web3.toWei(0.1, 'ether'), 'contributionPending is not correctly set')
        })
    })

    const getInstanceWithApplication = async (from) => {
        const configDuplicate = Object.assign({}, config)
        configDuplicate.endDate = getCurrentDate(10)
        configDuplicate.minContribution = 0
        configDuplicate.minCap = 0
        configDuplicate.maxCap = 1

        const instance = await getNewInstance(configDuplicate)

        await instance.apply('id42', { value: web3.toWei(0.1, 'ether'), from })

        return instance
    }

    const assertOnlyOwner = async (functionName, ...args) => {
        const instance = await getNewInstance(config)

        args.push({ from: accounts[1] })

        await expectFailure(
            instance[functionName].apply(instance, args),
            `${functionName}() did not throw error while called by not the owner`
        )
    }

    describe('reject', () => {
        it('is only callable by owner', async () => {
            await assertOnlyOwner(`reject`, accounts[0])
        })

        it('should reject the application, send Ether back to applicant and emit a RejectedApplication event', async () => {
            const instance = await getInstanceWithApplication(accounts[1])

            const balanceBefore = await getBalance(accounts[1])

            const { logs } = await instance.reject(accounts[1])

            const balanceAfter = await getBalance(accounts[1])

            const event = logs[0]

            assert.equal(event.event, 'RejectedApplication', 'event name is wrong')
            assert.equal(event.args.applicant, accounts[1], 'applicant is wrong')
            assert.equal(event.args.contribution.toNumber(), web3.toWei(0.1, 'ether'), 'contribution is wrong')
            assert.equal(event.args.id, 'id42', 'id is wrong')

            const [contribution, id, state] = await instance.applications(accounts[1])

            assert.equal(contribution.toNumber(), 0, 'contribution has not been reset')
            assert.equal(state, 2, 'state is not correctly set')

            assert.equal(
                balanceAfter.toNumber(),
                balanceBefore.plus(web3.toWei(0.1, 'ether')).toNumber(),
                'reject() did not transfer the Ether to the applicant'
            )
        })

        it('should update contributionPending and contributionRejected', async () => {
            const instance = await getInstanceWithApplication(accounts[1])

            const [
                contributionPendingBefore,
                contributionRejectedBefore,
                contributionAcceptedBefore
            ] = await Promise.all([
                instance.contributionPending(),
                instance.contributionRejected(),
                instance.contributionAccepted(),
            ])

            await instance.reject(accounts[1])

            const [
                contributionPendingAfter,
                contributionRejectedAfter,
                contributionAcceptedAfter
            ] = await Promise.all([
                instance.contributionPending(),
                instance.contributionRejected(),
                instance.contributionAccepted(),
            ])

            // invariant
            assert.equal(contributionAcceptedBefore.toNumber(), contributionAcceptedAfter.toNumber(), 'contributionAccepted was changed by a rejection')

            // before
            assert.equal(contributionPendingBefore.toNumber(), web3.toWei(0.1, 'ether'), 'contributionPending was wrong before rejection')
            assert.equal(contributionRejectedBefore.toNumber(), 0, 'contributionRejected was not correctly set')
            assert.equal(contributionAcceptedBefore.toNumber(), 0, 'contributionAccepted was not correctly set')

            // after
            assert.equal(contributionPendingAfter.toNumber(), 0, 'contributionPending was not correctly set')
            assert.equal(contributionRejectedAfter.toNumber(), web3.toWei(0.1, 'ether'), 'contributionPending was not correctly set')
        })

        it('should only work on pending applications', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await expectFailure(
                instance.reject(accounts[3]),
                'reject() did not throw while called on a non-pending application'
            )
        })
    })

    describe('accept', () => {
        it('is only callable by owner', async () => {
            await assertOnlyOwner(`accept`, accounts[0])
        })

        it('should accept the application and emit an AcceptedApplication event', async () => {
            const instance = await getInstanceWithApplication(accounts[1])

            const { logs } = await instance.accept(accounts[1])

            const event = logs[0]

            assert.equal(event.event, 'AcceptedApplication', 'event name is wrong')
            assert.equal(event.args.applicant, accounts[1], 'applicant is wrong')
            assert.equal(event.args.contribution.toNumber(), web3.toWei(0.1, 'ether'), 'contribution is wrong')
            assert.equal(event.args.id, 'id42', 'id is wrong')

            const [contribution, id, state] = await instance.applications(accounts[1])

            assert.equal(state, 3, 'state is not correctly set')
        })

        it('should update contributionPending and contributionAccepted', async () => {
            const instance = await getInstanceWithApplication(accounts[1])

            const [
                contributionPendingBefore,
                contributionRejectedBefore,
                contributionAcceptedBefore
            ] = await Promise.all([
                instance.contributionPending(),
                instance.contributionRejected(),
                instance.contributionAccepted(),
            ])

            await instance.accept(accounts[1])

            const [
                contributionPendingAfter,
                contributionRejectedAfter,
                contributionAcceptedAfter
            ] = await Promise.all([
                instance.contributionPending(),
                instance.contributionRejected(),
                instance.contributionAccepted(),
            ])

            // invariant
            assert.equal(contributionRejectedBefore.toNumber(), contributionRejectedAfter.toNumber(), 'contributionAccepted was changed by a rejection')

            // before
            assert.equal(contributionPendingBefore.toNumber(), web3.toWei(0.1, 'ether'), 'contributionPending was wrong before rejection')
            assert.equal(contributionRejectedBefore.toNumber(), 0, 'contributionRejected was not correctly set')
            assert.equal(contributionAcceptedBefore.toNumber(), 0, 'contributionAccepted was not correctly set')

            // after
            assert.equal(contributionPendingAfter.toNumber(), 0, 'contributionPending was not correctly set')
            assert.equal(contributionAcceptedAfter.toNumber(), web3.toWei(0.1, 'ether'), 'contributionPending was not correctly set')
        })

        it('should only work on pending applications', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0
            configDuplicate.minCap = 0
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await expectFailure(
                instance.accept(accounts[3]),
                'accept() did not throw while called on a non-pending application'
            )
        })
    })

    describe('withdraw', () => {
        it('is only callable by owner', async () => {
            await assertOnlyOwner(`withdraw`, 0)
        })

        it('can withdraw only if minCap is reached', async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0.1
            configDuplicate.minCap = 0.1
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await expectFailure(
                instance.withdraw(0.1),
                `withdraw() did not throw despite minCap not being reached`
            )

            await instance.apply('id42', { value: web3.toWei(0.1, 'ether') })

            await instance.accept(accounts[0])

            await instance.withdraw(0.1)
        })

        const getWithdrawableInstance = async () => {
            const configDuplicate = Object.assign({}, config)
            configDuplicate.endDate = getCurrentDate(10)
            configDuplicate.minContribution = 0.1
            configDuplicate.minCap = 0.1
            configDuplicate.maxCap = 1

            const instance = await getNewInstance(configDuplicate)

            await instance.apply('id42', { value: web3.toWei(0.1, 'ether'), from: accounts[0] })
            await instance.accept(accounts[0])

            await instance.apply('id52', { value: web3.toWei(0.1, 'ether'), from: accounts[1] })
            await instance.accept(accounts[1])

            return instance
        }

        it('updates withdrawn property', async () => {
            const instance = await getWithdrawableInstance()

            const withdrawnBefore = await instance.withdrawn()
            assert.equal(withdrawnBefore.toNumber(), 0, 'withdrawn was not 0 before call')

            await instance.withdraw(web3.toWei(0.1, 'ether'))

            const withdrawnAfter = await instance.withdrawn()
            assert.equal(withdrawnAfter.toNumber(), web3.toWei(0.1, 'ether'), 'withdrawn was not updated after call')
        })

        it('can only withdraw what is available and not already withdrawn', async () => {
            const instance = await getWithdrawableInstance()

            await instance.withdraw(web3.toWei(0.2, 'ether'))

            await expectFailure(
                instance.withdraw(web3.toWei(0.1, 'ether')),
                `withdraw() did not throw`
            )
        })

        it('transfer the funds to the target', async () => {
            const instance = await getWithdrawableInstance()

            const balanceBefore = await getBalance(config.target)

            await instance.withdraw(web3.toWei(0.2, 'ether'))

            const balanceAfter = await getBalance(config.target)

            assert.equal(
                balanceBefore.plus(web3.toWei(0.2, 'ether')).toNumber(),
                balanceAfter.toNumber(),
                `Funds were not transferred to the target`
            )
        })

        it('emits a Withdrawn event', async () => {
            const instance = await getWithdrawableInstance()

            const { logs } = await instance.withdraw(web3.toWei(0.2, 'ether'))

            const event = logs[0]

            assert.equal(event.event, 'Withdrawn', 'event name is wrong')
            assert.equal(event.args.target, config.target, 'target is wrong')
            assert.equal(event.args.amount.toNumber(), web3.toWei(0.2, 'ether'), 'amount is wrong')
        })
    })
})