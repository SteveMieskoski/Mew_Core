
const fixtures = require('../fixtures/index')
const GenerateTransaction = require('../../scripts/provider/modules/generateTransaction.js')
const HttpTransport = require('../../scripts/provider/modules/httpTransport')
const LedgerWallet = require('../../scripts/wallets/hardware/ledger')

let staticResponses = {
  // "eth_getBalance": "0xde0b6b3a7640000",
  "eth_gasPrice": "0x3b9aca00",
  "eth_getTransactionCount": "0xa",
  "eth_blockNumber": "0x55d760",
  "eth_estimateGas": "0x5af3107a4000"
  // "sign_tx": "0xa2870db1d0c26ef93c7b72d2a0830fa6b841e0593f7186bc6c7cc317af8cf3a42fda03bd589a49949aa05db83300cdb553116274518dbe9d90c65d0213f4af491b"
}

module.exports = {
  transport: new HttpTransport(), // new HttpTransport(),
  web3Extensions: [
    {
      provider: new GenerateTransaction(),
      providerOptions: undefined,
      method: 'generate_transaction',
      methodName: 'generateTransaction',
      paramCount: 1
    }
  ],
  providers: [
    new fixtures.FixtureProvider(staticResponses)
  ],
  hardwareWallets: [
    new LedgerWallet()
  ]
}