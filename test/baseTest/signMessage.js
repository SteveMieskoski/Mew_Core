const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
// const FixtureProvider = require('../fixtures/fixtureProvider')
const common = require('../../scripts/common/index')
const createPayload = common.createPayload
// const ethUtil = common.ethUtil
const injectMetrics = require('../fixtures/injectSubproviderMetrics')
// const Transaction = common.tx

// const NonceTracker = require('../subproviders/nonce-tracker.js')
// const HookedWalletProvider = require('../../scripts/wallets/hookedWalletDropIn')
const HookedWalletTxProvider = require('../../scripts/wallets/scraps/hookedWalletTxDropIn')

test('sign message', function (t) {
  t.plan(3)

  var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
  var addressHex = '0x1234362ef32bcd26d3dd18ca749378213625ba0b'

  var message = 'haay wuurl'
  var signature = '0x68dc980608bceb5f99f691e62c32caccaee05317309015e9454eba1a14c3cd4505d1dd098b8339801239c9bcaac3c4df95569dcf307108b92f68711379be14d81c'

  // sign all messages
  var providerA = injectMetrics(new HookedWalletTxProvider({
    getAccounts: function (cb) {
      cb(null, [addressHex])
    },
    getPrivateKey: function (address, cb) {
      cb(null, privateKey)
    }
  }))

  // handle block requests
  // var providerB = injectMetrics(new TestBlockProvider())

  var engine = new MewEngine()
  engine.addProvider(providerA)
  // engine.addProvider(providerB)

  var payload = {
    method: 'eth_sign',
    params: [
      addressHex,
      message
    ]
  }

  // engine.start()
  engine.sendAsync(createPayload(payload), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')

    t.equal(response.result, signature, 'signed response is correct')

    // engine.stop()
    t.end()
  })
})
