# BlockFood Pre-Sale Smart Contract

## Goal

The goal of this smart contract is to handle applications for the BlockFoodToken pre-sale.

The token sale behaviour is coded into the smart contract itself. Nothing is hidden.

## Usage

The BlockFood Token Sale Smart Contract will be deployed on the Ethereum blockchain before the date of the pre-sale.

Its address will be communicated from the [https://blockfood.io](https://bockfood.io) website.

## Dev

The smart contract has been written in test-driven development using the Truffle framework.

### Prerequisite

- Node.js 8+

- Truffle 4.0.1+

```bash
npm i -g truffle
```

### Launch tests

In a console, from the base directory of the project, type:

```bash
truffle test
```

This will output something like this:

```bash
$ truffle test
Using network 'test'.

Compiling .\contracts\BlockFoodPreSale.sol...
Deploy BlockFoodPreSale { target: '0xa3d736079d6bf7c14a96ab3ad131c349ceaf141e',
  endDate: 1518105600,
  minContribution: 0.1,
  minCap: 100,
  maxCap: 200 }
target= 0xa3d736079d6bf7c14a96ab3ad131c349ceaf141e
endDate= 1518105600
minContribution= 100000000000000000
minCap= 100000000000000000000
maxCap= 200000000000000000000

  Contract: BlockFoodPreSale
    √ should properly set the values from the constructor (62ms)
    Public functions
      apply
        √ should not work after end (101ms)
        √ should fail if msg.value below minContrib (82ms)
        √ should fail if above maxCap (92ms)
        √ should fail if address already applied (164ms)
        √ should add application from the user and emit a PendingApplication event (150ms)
        √ should accept application that exceeds the max cap if all accepted (205ms)
      withdraw
        √ is only callable by owner (81ms)
        √ can withdraw only if minCap is reached (244ms)
        √ updates withdrawn property (405ms)
        √ can only withdraw what is available and not already withdrawn (368ms)
        √ transfer the funds to the target (249ms)
        √ emits a Withdrawn event (298ms)
    Restricted functions
      reject
        √ is only callable by owner (83ms)
        √ should reject the application, send Ether back to applicant and emit a RejectedApplication event (222ms)
        √ should update contributionPending and contributionRejected (232ms)
        √ should only work on pending applications (97ms)
      accept
        √ is only callable by owner (96ms)
        √ should accept the application and emit an AcceptedApplication event (187ms)
        √ should update contributionPending and contributionAccepted (259ms)
        √ should only work on pending applications (94ms)
    Views
      getApplicants
        √ should return the application (357ms)
      getMaximumContributionPossible
        √ should return the maximum contribution in Ether (335ms)
    Maintenance functions
      failsafe
        √ should only be callable two months after this end (293ms)
        √ should only be callable by owner (648ms)
        √ should transfer ethereum to the target (689ms)
      changeOwner
        √ should only be callable by owner (100ms)
        √ should update the owner (130ms)
        √ should send a ContractUpdate event (128ms)
      changeTarget
        √ should only be callable by owner (91ms)
        √ should update the target (90ms)
        √ should send a ContractUpdate event (103ms)
      changeMinCap
        √ should only be callable by owner (42ms)
        √ should update the minCap (86ms)
        √ should send a ContractUpdate event (93ms)
      changeMaxCap
        √ should only be callable by owner (82ms)
        √ should update the maxCap (100ms)
        √ should send a ContractUpdate event (93ms)
      changeMinContribution
        √ should only be callable by owner (79ms)
        √ should update the minContribution (98ms)
        √ should send a ContractUpdate event (97ms)

  41 passing (8s)
```