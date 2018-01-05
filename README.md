# BlockFood Token Sale Smart Contract

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

Deploy BlockFoodPreSale { target: '0xa3d736079d6bf7c14a96ab3ad131c349ceaf141e',
  endDate: 1518105600,
  minContribution: 0.1,
  minCap: 100,
  maxCap: 200 }

  Contract: BlockFoodPreSale
    √ should properly set the values from the constructor (59ms)
    Public functions
      apply
        √ should not work after end (93ms)
        √ should fail if msg.value below minContrib (90ms)
        √ should fail if above maxCap (98ms)
        √ should fail if address already applied (165ms)
        √ should add application from the user and emit a PendingApplication event (151ms)
        √ should accept application that exceeds the max cap if all accepted (204ms)
      withdraw
        √ is only callable by owner (92ms)
        √ can withdraw only if minCap is reached (218ms)
        √ updates withdrawn property (395ms)
        √ can only withdraw what is available and not already withdrawn (419ms)
        √ transfer the funds to the target (351ms)
        √ emits a Withdrawn event (302ms)
    Restricted functions
      reject
        √ is only callable by owner (87ms)
        √ should reject the application, send Ether back to applicant and emit a RejectedApplication event (175ms)
        √ should update contributionPending and contributionRejected (213ms)
        √ should only work on pending applications (72ms)
      accept
        √ is only callable by owner (93ms)
        √ should accept the application and emit an AcceptedApplication event (197ms)
        √ should update contributionPending and contributionAccepted (224ms)
        √ should only work on pending applications (91ms)
    Views
      getApplicants
        √ should return the application (353ms)
      getMaximumContributionPossible
        √ should return the maximum contribution in Ether (366ms)
    Maintenance functions
      failsafe
        √ should only be callable two months after this end (312ms)
        √ should only be callable by owner (666ms)
        √ should transfer ethereum to the target (728ms)
      changeOwner
        √ should only be callable by owner (101ms)
        √ should update the owner (109ms)
      changeTarget
        √ should only be callable by owner (71ms)
        √ should update the owner (96ms)


  30 passing (7s)
```