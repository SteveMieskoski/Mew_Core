
const Transaction = require('ethereumjs-tx')
const ethUtil = require('ethereumjs-util')
const FixtureProvider = require('web3-provider-engine/subproviders/fixture.js')
const NonceTracker = require('web3-provider-engine/subproviders/nonce-tracker.js')
const HookedWalletProvider = require('web3-provider-engine/subproviders/hooked-wallet.js')
const HookedWalletTxProvider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx.js')
const TestBlockProvider = require('web3-provider-engine/test/util/block.js')
const createPayload = require('web3-provider-engine/util/create-payload.js')
const injectMetrics = require('web3-provider-engine/test/util/inject-metrics')

var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
var addressHex = '0x'+address.toString('hex')

// sign all tx's
var providerA = injectMetrics(new HookedWalletProvider({
  getAccounts: function(cb){
    cb(null, [addressHex])
  },
  signTransaction: function(txParams, cb){
    var tx = new Transaction(txParams)
    tx.sign(privateKey)
    var rawTx = '0x'+tx.serialize().toString('hex')
    cb(null, rawTx)
  },
}))

let proto = Reflect.getPrototypeOf(providerA);

console.log(providerA.constructor.name == "HookedWalletSubprovider"); // todo remove dev item
console.log(providerA.toString()); // todo remove dev item

console.log(proto); // todo remove dev item

console.log(proto["HookedWalletSubprovider"]); // todo remove dev item


console.log(Object.keys(proto)); // todo remove dev item
