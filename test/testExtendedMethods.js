const test = require('tape')
const MewEngine = require('../scripts/provider/mewEngine')
const fixtures = require('./fixtures/index')
const common = require('../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')
const MewCore = require('../scripts/core/index')
const GenerateTransaction = require('../scripts/provider/modules/generateTransaction.js')

test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(1)

  const web3Extensions = [
    {
      provider: GenerateTransaction,
      providerOptions: undefined,
      method: 'generate_transaction',
      methodName: 'generateTransaction',
      paramCount: 1
    }
  ]

  let staticResponses = {
    "eth_getBalance": "0xde0b6b3a7640000",
    "eth_gasPrice": "0x3b9aca00",
    "eth_getTransactionCount": "0xa",
    "eth_blockNumber": "0x55d760",
    "eth_estimateGas": "0x5af3107a4000"
  }
  const providers = [
    new fixtures.FixtureProvider(staticResponses)
  ]

  const transport = new fixtures.FakeHttpProvider(staticResponses)

  const mewcore = MewCore.init({web3Extensions, providers, transport})

  let address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
  let addressHex = '0x' + address.toString('hex')

  let txParams = {
    from: addressHex,
    to: addressHex,
    value: '0x01',
    gas: '0x1234567890',
  };

  mewcore.web3.generateTransaction(txParams)
    .then(_result => {
      console.log("\nTEST\n_result", _result); // todo remove dev item
      t.ok(_result, "received result")
      t.end()
    })
    .catch(_error => {
      console.log("error", _error); // todo remove dev item
      t.end()
    })
})
