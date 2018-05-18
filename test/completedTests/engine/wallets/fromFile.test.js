const test = require('tape')
const MewEngine = require('../../../../scripts/provider/mewEngine')
const common = require('../../../../scripts/common/index')
const createPayload = common.createPayload
const injectMetrics = require('../../../fixtures/injectSubproviderMetrics')
const FromFile = require('../../../../scripts/wallets/software/fromFile')
const display = false

const HardwareWalletProvider = require('../../../../scripts/provider/modules/hardwareWalletProvider')

const fromAddress = '0x7676E10eefc7311970A12387518442136ea14D81'
/**
 * THESE TESTS DO/DID NOT WORK AS WRITTEN IN THE ENGINE-PROVIDER REPO
 */
test('sign transaction (via engine)', function (t) {
  t.plan(5)
  let signedTx = '0xf862808085123456789094e87395820dc5c005c2c580091b9aed220240b09901801ca0ee93ef86a6e6c49f8fcbe6b117bbadc51418b69fb7624201baa3a20a7620aa7aa040475b85d1c9129c532cd542b8799a3ee5d6c22d90581d607a075d5b6eb7d053'
  var toAddress = '0xE87395820dC5c005c2c580091b9aEd220240B099'
  let options = {
    type: "manualPrivateKey",
    manualPrivateKey: "3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc"
  }
  let fromFile = new FromFile(options)
  let hardwareWalletProvider = new HardwareWalletProvider(fromFile)
  // sign all tx's
  var providerA = injectMetrics(hardwareWalletProvider)

  var engine = new MewEngine()
  engine.addProvider(providerA)

  var txPayload = {
    method: 'eth_signTransaction',
    params: [{
      from: fromAddress,
      to: toAddress,
      value: '0x01',
      gas: '0x1234567890'
    }]
  }

  engine.sendAsync(createPayload(txPayload), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
console.log(response); // todo remove dev item
    // intial tx request
    t.equal(providerA.getWitnessed('eth_signTransaction').length, 1, 'providerA did see "signTransaction"')
    t.equal(providerA.getHandled('eth_signTransaction').length, 1, 'providerA did handle "signTransaction"')
    t.equal(response.result, signedTx, 'signed transaction is correct')
    t.end()
  })
})

test('sign message (via engine)', function (t) {
  t.plan(3)

  var message = 'haay wuurl'
  // signed with first address of MyEtherWallet Developer Ledger [replace with signature from a specific ledger if using a different device]
  var signature = '0xdc6038488fb5e4323557b57ad0c44005bc79639c3e595af4f3d315fa0cd17e61631b8469e4d89ef5340b1092ff779c2746df5a7fabd240e7257b158e58db79231b'
  let options = {
    type: "manualPrivateKey",
    manualPrivateKey: "3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc"
  }
  // sign all messages
  let fromFile = new FromFile(options)
  let hardwareWalletProvider = new HardwareWalletProvider(fromFile)

  var providerA = injectMetrics(hardwareWalletProvider)
  var engine = new MewEngine()
  engine.addProvider(providerA)

  var payload = {
    method: 'eth_sign',
    params: [
      fromAddress,
      message
    ]
  }

  engine.sendAsync(createPayload(payload), function (err, response) {
    console.log(err, response); // todo remove dev item
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
    t.equal(response.result, signature, 'signed message is correct')
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

