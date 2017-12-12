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
Compiling .\contracts\BlockFoodPreSale.sol...
Compiling .\contracts\Migrations.sol...
Deploy BlockFoodPreSale { target: '0xa3d736079d6bf7c14a96ab3ad131c349ceaf141e',
  endDate: 1518105600,
  minContribution: 1,
  minCap: 100,
  maxCap: 500 }


  Contract: BlockFoodPreSale
    √ should properly set the values from the constructor (116ms)
    apply
      √ should not work after end (93ms)
      √ should fail if msg.value below minContrib (97ms)
      √ should fail if above maxCap (92ms)
      √ should fail if address already applied (138ms)
      √ should add application from the user and emit a NewApplication event (167ms)
    reject
      √ is only callable by owner (95ms)
      √ should reject the application, send Ether back to applicant and emit a RejectedApplication event (195ms)
      √ should update contributionPending and contributionRejected (265ms)
    accept
      √ is only callable by owner (75ms)
      √ should accept the application and emit an AcceptedApplication event (150ms)


  11 passing (2s)
```