const test = require('tape')
const MewEngine = require('../scripts/provider/providerMewEngine')
const FixtureProvider = require('./fixtures/fixtureProvider')
const common = require('../scripts/provider/common/index')
const createPayload = common.createPayload
const ethUtil = common.ethUtil
const injectMetrics = require('./fixtures/injectSubproviderMetrics')
const Transaction = common.tx
const LedgerWallet = require('../scripts/wallets/hardware/ledger/ledgerWallet')
// const NonceTracker = require('../subproviders/nonce-tracker.js')
// const HookedWalletProvider = require('../scripts/wallets/scraps/hookedWalletDropIn')
const HookedWalletTxProvider = require('../scripts/wallets/scraps/hookedWalletTxDropIn')
const HardwareWalletProvider = require('../scripts/provider/modules/hardwareWalletProvider')

const ledgerAddress = '0x7676E10eefc7311970A12387518442136ea14D81'
/**
 * THESE TESTS DO/DID NOT WORK AS WRITTEN IN THE ENGINE-PROVIDER REPO
 */
//
// // personal_sign was declared without an explicit set of test data
// // so I made a script out of geth's internals to create this test data
// // https://gist.github.com/kumavis/461d2c0e9a04ea0818e423bb77e3d260
//
signatureTest({
  testLabel: 'kumavis fml manual test I',
  method: 'personal_sign',
  // "hello world"
  message: '0x68656c6c6f20776f726c64',
  signature: '0xce909e8ea6851bc36c007a0072d0524b07a3ff8d4e623aca4c71ca8e57250c4d0a3fc38fa8fbaaa81ead4b9f6bd03356b6f8bf18bccad167d78891636e1d69561b',
  addressHex: ledgerAddress,
  privateKey: new Buffer('6969696969696969696969696969696969696969696969696969696969696969', 'hex')
})

function signatureTest ({ testLabel, method, privateKey, addressHex, message, signature }) {
  // sign all messages
  console.log("\n\n\naddressHex", addressHex); // todo remove dev item

  var providerA = injectMetrics(new HardwareWalletProvider(new LedgerWallet()))

  var engine = new MewEngine()
  engine.addProvider(providerA)

  var payload = {
    method: method,
    params: [message, addressHex]
  }

  singleRpcTest({
    testLabel: `sign message ${method} - ${testLabel}`,
    payload,
    engine,
    expectedResult: signature
  })

  // Personal sign is supposed to have params
  // ordered in this direction, not the other.
  if (payload.method === 'personal_sign') {
    var payload = {
      method: method,
      params: [message, addressHex]
    }

    singleRpcTest({
      testLabel: `sign message ${method} - ${testLabel}`,
      payload,
      engine,
      expectedResult: signature
    })
  }
}

function singleRpcTest ({ testLabel, payload, expectedResult, engine }) {
  test(testLabel, function (t) {
    t.plan(3)

    // engine.start()
    engine.sendAsync(createPayload(payload), function (err, response) {
      if (err) {
        console.log('bad payload:', payload)
        console.error(err)
      }
      t.ifError(err)
      t.ok(response, 'has response')

      t.equal(response.result, expectedResult, 'rpc result is as expected')

      // engine.stop()
      t.end()
    })
  })
}
