
const fixtures = require('../fixtures/index')
const GenerateTransaction = require('../../scripts/provider/modules/generateTransaction.js')
const HttpTransport = require('../../scripts/provider/modules/httpTransport')

let staticResponses = {
  "eth_getBalance": "0xde0b6b3a7640000",
  "eth_gasPrice": "0x3b9aca00",
  "eth_getTransactionCount": "0xa",
  "eth_blockNumber": "0x55d760",
  "eth_estimateGas": "0x5af3107a4000",
  "sign_tx": "0xa2870db1d0c26ef93c7b72d2a0830fa6b841e0593f7186bc6c7cc317af8cf3a42fda03bd589a49949aa05db83300cdb553116274518dbe9d90c65d0213f4af491b"
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

  ]
}
// const web3Extensions = [
//   {
//     provider: GenerateTransaction,
//     providerOptions: undefined,
//     method: 'generate_transaction',
//     methodName: 'generateTransaction',
//     paramCount: 1
//   }
// ]

//
// const providers = [
//   new fixtures.FixtureProvider(staticResponses)
// ]
//
// // const transport = new fixtures.FakeHttpProvider(staticResponses)
// const transport = new HttpTransport()
// const mewcore = MewCore.init({web3Extensions, providers, transport})
//
// let address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
// let addressHex = '0x42E1f52bdfE4475064dF1b92542e3f8aCA931ebc' //'0x' + address.toString('hex')
//
// let txParams = {
//   from: addressHex,
//   to: addressHex,
//   value: '1',
//   gas: '0x1234567890',
// };
//
// mewcore.web3.generateTransaction(txParams)
//   .then(_result => {
//     console.log("\nTEST\n_result", _result); // todo remove dev item
//   })
//   .catch(_error => {
//     console.log("error", _error); // todo remove dev item
//   })
