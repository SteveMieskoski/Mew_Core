const test = require('tape')
const MewEngine = require('../../../scripts/provider/mewEngine')
const fixtures = require('../../fixtures/index')
const common = require('../../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')
const MewCore = require('../../../scripts/core/index')
const GenerateTransaction = require('../../../scripts/provider/modules/generateTransaction.js')
const HttpTransport = require('../../../scripts/provider/modules/httpTransport')
const FromFile = require('../../../scripts/wallets/software/fromFile')
const LedgerWallet = require('../../../scripts/wallets/hardware/ledger')


let signedMessage = '0x47e43e737ff6711e1ad31ca09fb7bc1322a3bb83b2a3790e146289778ab842da1840ccb29e5c0382456251f4a1be50530265416942963d6b2ac987b8e082ec191c'
let signedTransaction = '0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a7640000801ba017fd0e39aa3ff47d46f582f9c3459f18771667df758e9ad8995881695217f24ca03adcea5af748f5dde51898607ae1e09af6f6dfd37f6fd0b2601d109fc0028f3d'

let optionsManualPrivateKey = {
  type: "manualPrivateKey",
  manualPrivateKey: "3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc"
}

let fileContent = { version: 3,
  id: '3e0a62d5-7156-4537-8632-2211deeae028',
  address: 'f97d4062a18d2730fbd39cff0fde80d71cbebf98',
  crypto:
    { ciphertext: 'f4285a17832661c5058ef15acfded6ed11e34cdd2941307d74111db1648d7c47',
      cipherparams: { iv: 'bf63538df19e761d38b0cae9bae5a9fb' },
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      kdfparams:
        { dklen: 32,
          salt: '1a191b2f7e3823c6fbfaf4b19bcf3071cc692748e696fa00986978bacb924a36',
          n: 8192,
          r: 8,
          p: 1 },
      mac: 'e29be364b8f6952f00ab35119ead6c500832c6c308f2aaafe02e5c72209f35dc' }
}

let optionsFromPrivateKeyFile = {
  type: "fromPrivateKeyFile",
  fileContent: fileContent,
  filePassword: "123456789"
}

test('use web3 methods to getAccount (Address) and sign message via Private Key', function (t) {
  t.plan(3)

   var toAddress = '0xE87395820dC5c005c2c580091b9aEd220240B099'

  // let fromFile = new FromFile(options)
  // let hardwareWalletProvider = new HardwareWalletProvider(fromFile)

  const demoSignConfig = {
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
      new fixtures.FixtureProvider({
        "eth_gasPrice": "0x3b9aca00",
        "eth_getTransactionCount": "0xa",
        "eth_blockNumber": "0x55d760",
        "eth_estimateGas": "0x5af3107a4000"
      })
    ],
    wallet: new LedgerWallet()
  }

  let fromFile = new FromFile(optionsManualPrivateKey)

  const mewcore = MewCore.init(demoSignConfig)
  mewcore.replaceWallet(fromFile)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      // console.log(_account[0]); // todo remove dev item
      t.ok(_account, 'address retrieved')
      return mewcore.web3.eth.sign("Hello world", _account[0])
    })
    .then(signed => {
      t.ok(signed, 'Message Signed')
      t.equal(signed, signedMessage, 'Message Properly Signed')
      console.log("signed", signed); // todo remove dev item
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item
      t.fail("getAccounts Error")
      t.end()
    })
})

test('use web3 methods to getAccount (Address) and sign transaction via Private Key', function (t) {
  t.plan(3)

  const demoSignConfig = {
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
      new fixtures.FixtureProvider({
        "eth_gasPrice": "0x3b9aca00",
        "eth_getTransactionCount": "0xa",
        "eth_blockNumber": "0x55d760",
        "eth_estimateGas": "0x5af3107a4000"
      })
    ],
    wallet: new LedgerWallet()
  }

  let fromFile = new FromFile(optionsManualPrivateKey)

  const mewcore = MewCore.init(demoSignConfig)
  mewcore.replaceWallet(fromFile)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      console.log(_account); // todo remove dev item
      t.ok(_account, 'account address(es) retrieved')
      return mewcore.web3.eth.signTransaction({
        from: _account[0],
        gasPrice: "20000000000",
        gas: "21000",
        to: '0x3535353535353535353535353535353535353535',
        value: "1000000000000000000",
        data: ""
      })

    })
    .then(_signedTx => {
      t.ok(_signedTx, 'Transaction Signed')
      t.equal(_signedTx, signedTransaction, " Transaction Properly Signed")
      console.log("_signedTx", _signedTx); // todo remove dev item
      t.end()
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item
      t.fail("getAccounts Error")
      t.end()
    })
})

test('use web3 methods to getAccount (Address) and get balance via Private Key', function (t) {
  t.plan(3)

  const demoSignConfig = {
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
      new fixtures.FixtureProvider({
        "eth_gasPrice": "0x3b9aca00",
        "eth_getTransactionCount": "0xa",
        "eth_blockNumber": "0x55d760",
        "eth_estimateGas": "0x5af3107a4000"
      })
    ],
    wallet: new LedgerWallet()
  }

  let fromFile = new FromFile(optionsManualPrivateKey)

  const mewcore = MewCore.init(demoSignConfig)
  mewcore.replaceWallet(fromFile)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      t.ok(_account, 'account address(es) retrieved')
      t.equal(_account[0],'0xf97d4062a18D2730Fbd39CFf0fDE80d71cbEbf98', "Correct First Address Retrieved")
      return mewcore.web3.eth.getBalance(_account[0])
    })
    .then(_balance => {
      console.log(_balance); // todo remove dev item
      t.ok(_balance, 'balance retrieved')
      t.end()
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item    })
      t.fail("getAccounts Error")
      t.end()
    })
})
// ======================
test('use web3 methods to getAccount (Address) and sign message via Private Key File', function (t) {
  t.plan(3)

  var toAddress = '0xE87395820dC5c005c2c580091b9aEd220240B099'

  // let fromFile = new FromFile(options)
  // let hardwareWalletProvider = new HardwareWalletProvider(fromFile)

  const demoSignConfig = {
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
      new fixtures.FixtureProvider({
        "eth_gasPrice": "0x3b9aca00",
        "eth_getTransactionCount": "0xa",
        "eth_blockNumber": "0x55d760",
        "eth_estimateGas": "0x5af3107a4000"
      })
    ],
    wallet: new LedgerWallet()
  }

  let fromFile = new FromFile(optionsFromPrivateKeyFile)

  const mewcore = MewCore.init(demoSignConfig)
  mewcore.replaceWallet(fromFile)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      // console.log(_account[0]); // todo remove dev item
      t.ok(_account, 'address retrieved')
      return mewcore.web3.eth.sign("Hello world", _account[0])
    })
    .then(signed => {
      t.ok(signed, 'Message Signed')
      t.equal(signed, signedMessage, 'Message Properly Signed')
      console.log("signed", signed); // todo remove dev item
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item
      t.fail("getAccounts Error")
      t.end()
    })
})

test('use web3 methods to getAccount (Address) and sign transaction via Private Key File', function (t) {
  t.plan(3)

  const demoSignConfig = {
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
      new fixtures.FixtureProvider({
        "eth_gasPrice": "0x3b9aca00",
        "eth_getTransactionCount": "0xa",
        "eth_blockNumber": "0x55d760",
        "eth_estimateGas": "0x5af3107a4000"
      })
    ],
    wallet: new LedgerWallet()
  }

  let fromFile = new FromFile(optionsFromPrivateKeyFile)

  const mewcore = MewCore.init(demoSignConfig)
  mewcore.replaceWallet(fromFile)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      console.log(_account); // todo remove dev item
      t.ok(_account, 'account address(es) retrieved')
      return mewcore.web3.eth.signTransaction({
        from: _account[0],
        gasPrice: "20000000000",
        gas: "21000",
        to: '0x3535353535353535353535353535353535353535',
        value: "1000000000000000000",
        data: ""
      })

    })
    .then(_signedTx => {
      t.ok(_signedTx, 'Transaction Signed')
      t.equal(_signedTx, signedTransaction, " Transaction Properly Signed")
      console.log("_signedTx", _signedTx); // todo remove dev item
      t.end()
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item
      t.fail("getAccounts Error")
      t.end()
    })
})

test('use web3 methods to getAccount (Address) and get balance via Private Key File', function (t) {
  t.plan(3)

  const demoSignConfig = {
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
      new fixtures.FixtureProvider({
        "eth_gasPrice": "0x3b9aca00",
        "eth_getTransactionCount": "0xa",
        "eth_blockNumber": "0x55d760",
        "eth_estimateGas": "0x5af3107a4000"
      })
    ],
    wallet: new LedgerWallet()
  }

  let fromFile = new FromFile(optionsFromPrivateKeyFile)

  const mewcore = MewCore.init(demoSignConfig)

  mewcore.replaceWallet(fromFile)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      t.ok(_account, 'account address(es) retrieved')
      t.equal(_account[0],'0xf97d4062a18D2730Fbd39CFf0fDE80d71cbEbf98', "Correct First Address Retrieved")
      return mewcore.web3.eth.getBalance(_account[0])
    })
    .then(_balance => {
      console.log(_balance); // todo remove dev item
      t.ok(_balance, 'balance retrieved')
      t.end()
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item    })
      t.fail("getAccounts Error")
      t.end()
    })
})
