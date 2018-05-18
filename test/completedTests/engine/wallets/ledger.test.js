const test = require('tape')
const MewEngine = require('../../../../scripts/provider/mewEngine')
const FixtureProvider = require('../../../fixtures/fixtureProvider')
const common = require('../../../../scripts/common/index')
const createPayload = common.createPayload
const ethUtil = common.ethUtil
const injectMetrics = require('../../../fixtures/injectSubproviderMetrics')
const Transaction = common.tx
const LedgerWallet = require('../../../../scripts/wallets/hardware/ledger/ledgerWallet')
const HardwareWalletProvider = require('../../../../scripts/provider/modules/hardwareWalletProvider')

const ledgerAddress = '0x7676E10eefc7311970A12387518442136ea14D81'
/**
 * THESE TESTS DO/DID NOT WORK AS WRITTEN IN THE ENGINE-PROVIDER REPO
 */
test('sign transaction', function (t) {
  t.plan(4)

  let signedTx = '0xf862808085123456789094e87395820dc5c005c2c580091b9aed220240b099018026a0c5d4e417e0a1e98e3fdd71b7b76a9b48880d1a7626f1cacdbc028678524ce473a05c67e5f4955d7f7ad20f4ac7bb13acbaf4ebf3bc53882747d7e04ab36f4e31d7'
  var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
  var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
  var addressHex = '0xE87395820dC5c005c2c580091b9aEd220240B099'

  // sign all tx's
  var providerA = injectMetrics(new HardwareWalletProvider(new LedgerWallet()))

  // handle block requests
  // var providerD = injectMetrics(new TestBlockProvider())

  var engine = new MewEngine()
  engine.addProvider(providerA)

  var txPayload = {
    method: 'eth_signTransaction',
    params: [{
      from: ledgerAddress,
      to: addressHex,
      value: '0x01',
      gas: '0x1234567890'
    }]
  }

  // engine.start()
  engine.sendAsync(createPayload(txPayload), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
    t.equal(response.result, signedTx, "Transaction properly signed")
console.log(response); // todo remove dev item
    // intial tx request
    t.equal(providerA.getWitnessed('eth_signTransaction').length, 1, 'providerA did see "signTransaction"')
    t.equal(providerA.getHandled('eth_signTransaction').length, 1, 'providerA did handle "signTransaction"')


    // engine.stop()
    t.end()
  })
})
/** not yet implemented **/
// test('send transaction [not yet implemented]', function (t) {
//   t.plan(10)
//
//   var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
//   var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
//   var addressHex = '0xE87395820dC5c005c2c580091b9aEd220240B099'
//
//   // sign all tx's
//   var providerA = injectMetrics(new HardwareWalletProvider(new LedgerWallet()))
//
//   // handle nonce requests
//   // var providerB = injectMetrics(new NonceTracker())
//   // handle all bottom requests
//   var providerC = injectMetrics(new FixtureProvider({
//     eth_gasPrice: '0x1234',
//     eth_getTransactionCount: '0x00',
//     eth_sendRawTransaction: function (payload, next, done) {
//       var rawTx = ethUtil.toBuffer(payload.params[0])
//       var tx = new Transaction(rawTx)
//       var hash = '0x' + tx.hash().toString('hex')
//       done(null, hash)
//     }
//   }))
//   // handle block requests
//   // var providerD = injectMetrics(new TestBlockProvider())
//
//   var engine = new MewEngine()
//   engine.addProvider(providerA)
//   // engine.addProvider(providerB)
//   engine.addProvider(providerC)
//   // engine.addProvider(providerD)
//
//   var txPayload = {
//     method: 'eth_sendTransaction',
//     params: [{
//       from: ledgerAddress,
//       to: addressHex,
//       value: '0x01',
//       gas: '0x1234567890'
//     }]
//   }
//
//   // engine.start()
//   engine.sendAsync(createPayload(txPayload), function (err, response) {
//     t.ifError(err, 'did not error')
//     t.ok(response, 'has response')
//
//     // intial tx request
//     t.equal(providerA.getWitnessed('eth_sendTransaction').length, 1, 'providerA did see "signTransaction"')
//     t.equal(providerA.getHandled('eth_sendTransaction').length, 1, 'providerA did handle "signTransaction"')
//
//     // tx nonce
//     // t.equal(providerB.getWitnessed('eth_getTransactionCount').length, 1, 'providerB did see "eth_getTransactionCount"')
//     // t.equal(providerB.getHandled('eth_getTransactionCount').length, 0, 'providerB did NOT handle "eth_getTransactionCount"')
//     t.equal(providerC.getWitnessed('eth_getTransactionCount').length, 1, 'providerC did see "eth_getTransactionCount"')
//     t.equal(providerC.getHandled('eth_getTransactionCount').length, 1, 'providerC did handle "eth_getTransactionCount"')
//
//     // gas price
//     t.equal(providerC.getWitnessed('eth_gasPrice').length, 1, 'providerB did see "eth_gasPrice"')
//     t.equal(providerC.getHandled('eth_gasPrice').length, 1, 'providerB did handle "eth_gasPrice"')
//
//     // send raw tx
//     t.equal(providerC.getWitnessed('eth_sendRawTransaction').length, 1, 'providerC did see "eth_sendRawTransaction"')
//     t.equal(providerC.getHandled('eth_sendRawTransaction').length, 1, 'providerC did handle "eth_sendRawTransaction"')
//
//     // engine.stop()
//     t.end()
//   })
// })

test('sign message', function (t) {
  t.plan(3)
  let signedMessage = '0xc7be115376fb5674ba29b30a7b19f6009994e32bc6cd8fbd05c9a7c926a9d10704152549ec75ea2dd833eea1f45e1d7161d5901203d8496f540bfdad944251e901'
  // var privateKey = new Buffer('cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9', 'hex')
  var addressHex = ledgerAddress

  var message = 'haay wuurl'
  // signed with first address of MyEtherWallet Developer Ledger [replace with signature from a specific ledger if using a different device]
  var signature = '0xc7be115376fb5674ba29b30a7b19f6009994e32bc6cd8fbd05c9a7c926a9d10704152549ec75ea2dd833eea1f45e1d7161d5901203d8496f540bfdad944251e901'

  // sign all messages

  var engine = new MewEngine()
  engine.addProvider(new HardwareWalletProvider(new LedgerWallet()))
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
    console.log(err, response); // todo remove dev item
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
    t.equal(response.result, signedMessage, "Transaction properly signed")
    console.log(response); // todo remove dev item

    t.equal(response.result, signature, 'signed response is correct')

    // engine.stop()
    t.end()
  })
})
