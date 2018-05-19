const test = require('tape')
const MewEngine = require('../../../scripts/provider/mewEngine')
const fixtures = require('../../fixtures/index')
const common = require('../../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')
const MewCore = require('../../../scripts/core/index')
const GenerateTransaction = require('../../../scripts/provider/modules/generateTransaction.js')
const HttpTransport = require('../../../scripts/provider/modules/httpTransport')
const LedgerWallet = require('../../../scripts/wallets/hardware/ledger')

test('use web3 methods to getAccount (Address) and sign message via Ledger', function (t) {
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

  const mewcore = MewCore.init(demoSignConfig)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      // console.log(_account[0]); // todo remove dev item
      t.ok(_account, 'address retrieved')
      return mewcore.web3.eth.sign("Hello world", _account[0])
    })
    .then(signed => {
      t.ok(signed, 'Message Signed')
      t.equal(signed, '0x5b2cb93f70da5a0c5af712759f2343391496194a443e3a773c7aa02127c42a6e357ae83e3a7b63936f3b4757b1a8f5cf4274a53b3286dc84eb4b1023e97a24ba00', 'Message Properly Signed')
      console.log("signed", signed); // todo remove dev item
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item
      t.fail("getAccounts Error")
      t.end()
    })
})

test('use web3 methods to getAccount (Address) and sign transaction via Ledger', function (t) {
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
    hardwareWallets: [
      new LedgerWallet()
    ]
  }

  const mewcore = MewCore.init(demoSignConfig)

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
      t.equal(_signedTx, '0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a03539f59efe39c10ddaafcefdeb5a4116017303fe7eaf53c853495b9ffa3ae0c5a00c9b17875d6056551b84654370ffe516022466c405641050cd42338c4cf25ba2', " Transaction Properly Signed")
      console.log("_signedTx", _signedTx); // todo remove dev item
      t.end()
    })
    .catch(_error => {
      console.error(_error); // todo remove dev item
      t.fail("getAccounts Error")
      t.end()
    })
})

test('use web3 methods to getAccount (Address) and get balance via Ledger', function (t) {
  t.plan(7)

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
    hardwareWallets: [
      new LedgerWallet()
    ]
  }

  const mewcore = MewCore.init(demoSignConfig)

  mewcore.web3.eth.getAccounts()
    .then(_account => {
      t.ok(_account, 'account address(es) retrieved')
      t.equal(_account[0],'0x7676E10eefc7311970A12387518442136ea14D81', "Correct First Address Retrieved")
      t.equal(_account[1],
        '0x3E3b1BaC1b77009f3C3b4a40f4A774144902527b', "Correct Second Address Retrieved")
      t.equal(_account[2],
        '0x185bF60cE7e9Ad9d4ebD373885382133d6827636', "Correct Third Address Retrieved")
      t.equal(_account[3],
        '0x3019aae26C346F07dAF7d060db65f5c166E875d7', "Correct Fourth Address Retrieved")
      t.equal(_account[4],
        '0x524F05547Fc48a3f4A17Eb167feAbD0051919F6F', "Correct Fifth Address Retrieved")
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
/*
test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(4)

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
    hardwareWallets: [
      new LedgerWallet()
    ]
  }

  const mewcore = MewCore.init(demoSignConfig)

    mewcore.web3.eth.getAccounts()
      .then(_result => {
        console.log("\nTEST\n_result", _result); // todo remove dev item
        return _result[0]
      })
      .catch(_error => {
        console.log("error", _error); // todo remove dev item
      })


    mewcore.walletAcess.getMultipleAccounts()

})*/
