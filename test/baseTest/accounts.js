const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
const FixtureProvider = require('../fixtures/fixtureProvider')
const common = require('../../scripts/common/index')
const createPayload = common.createPayload
const ethUtil = common.ethUtil
const injectMetrics = require('../fixtures/injectSubproviderMetrics')
const Transaction = common.tx

// const NonceTracker = require('../subproviders/nonce-tracker.js')
const HookedWalletProvider = require('../../scripts/wallets/scraps/hookedWalletDropIn')
// const HookedWalletTxProvider = require('../../scripts/wallets/hookedWalletTxDropIn')

test('no such account', function (t) {
  t.plan(1)

  var addressHex = '0x1234362ef32bcd26d3dd18ca749378213625ba0b'
  var otherAddressHex = '0x4321362ef32bcd26d3dd18ca749378213625ba0c'

  // sign all tx's
  var providerA = injectMetrics(new HookedWalletProvider({
    getAccounts: function (cb) {
      cb(null, [addressHex])
    }
  }))

  // handle nonce requests
  // var providerB = injectMetrics(new NonceTracker())
  // handle all bottom requests
  var providerC = injectMetrics(new FixtureProvider({
    eth_gasPrice: '0x1234',
    eth_getTransactionCount: '0x00',
    eth_sendRawTransaction: function (payload, next, done) {
      var rawTx = ethUtil.toBuffer(payload.params[0])
      var tx = new Transaction(rawTx)
      var hash = '0x' + tx.hash().toString('hex')
      done(null, hash)
    }
  }))
  // handle block requests
  // var providerD = injectMetrics(new TestBlockProvider())

  var engine = new MewEngine()
  engine.addProvider(providerA)
  // engine.addProvider(providerB)
  engine.addProvider(providerC)
  // engine.addProvider(providerD)

  var txPayload = {
    method: 'eth_sendTransaction',
    params: [{
      from: otherAddressHex,
      to: addressHex,
      value: '0x01',
      gas: '0x1234567890'
    }]
  }

  // engine.start()
  engine.sendAsync(createPayload(txPayload), function (err, response) {
    t.ok(err, 'did error')

    // engine.stop()
    t.end()
  })
})