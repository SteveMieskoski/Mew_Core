const test = require('tape')
const LedgerWallet = require('../../../../scripts/wallets/hardware/ledger/ledgerWallet')

test('Get App Configuration (using defaults)', function (t) {
  t.plan(2)
  let ledger = new LedgerWallet()

  ledger.getAppConfig((err, data) => {
    console.log(err, data)
    t.error(err, 'No Error')
    t.ok(data, 'App Configuration Retrieved')
    t.end()
  })
})

test('Get First Account', function (t) {
  t.plan(2)
  let ledger = new LedgerWallet()

  ledger.getAccounts((err, data) => {
    console.log(err, data)
    t.error(err, 'No Error')
    t.ok(data, 'Account Retrieved')
    t.end()
  })
})

test('Get Multiple Accounts', function (t) {
  t.plan(3)

  let options = {
    networkId: 1, // mainnet
    path: "44'/60'/0'/0", // ledger default derivation path
    askConfirm: false,
    accountsLength: 5,
    accountsOffset: 0
  }
  let ledger = new LedgerWallet(options)

  ledger.getAccounts((err, accounts) => {
    console.log(err, accounts)
    t.error(err, 'No Error')
    t.ok(accounts, 'Accounts Retrieved')
    t.equal(accounts.length, 5, 'Five Accounts Retrieved')
    t.end()
  })
})

test('Invalid Path Throws', function (t) {
  t.plan(2)

  let options = {
    networkId: 1, // mainnet
    path: "44'/20'/0'/0", // ledger def let ledger = new LedgerWallet(options)ault derivation path
    askConfirm: false,
    accountsLength: 1,
    accountsOffset: 0
  }
  let error = false
  try {
    new LedgerWallet(options)
    error = true
  } catch (e) {
    t.ok(e, 'Error Caught')
  }
  // if error is not thrown then error = true and this will fail
  t.error(error, 'Error Thrown on Invalid Path')
})

test('Get offset Addresses', function (t) {
  t.plan(3)

  let options = {
    networkId: 1, // mainnet
    path: "44'/60'/0'/0", // ledger def let ledger = new LedgerWallet(options)ault derivation path
    askConfirm: false,
    accountsLength: 1,
    accountsOffset: 0
  }
  let ledger = new LedgerWallet(options)

  ledger.getMultipleAccounts(5, 5, (err, accounts) => {
    console.log(err, accounts)
    t.error(err, 'No Error')
    t.ok(accounts, 'Accounts Retrieved')
    t.equal(accounts.length, 5, 'Five Accounts Retrieved')
    t.end()
  })
})

test('Get offset Addresses via getAccounts', function (t) {
  t.plan(3)

  let options = {
    networkId: 1, // mainnet
    path: "44'/60'/0'/0", // ledger def let ledger = new LedgerWallet(options)ault derivation path
    askConfirm: false,
    accountsLength: 1,
    accountsOffset: 0
  }
  let ledger = new LedgerWallet(options)

  ledger.getAccounts(5, 5, (err, accounts) => {
    console.log(err, accounts)
    t.error(err, 'No Error')
    t.ok(accounts, 'Accounts Retrieved')
    t.equal(accounts.length, 5, 'Five Accounts Retrieved')
    t.end()
  })
})

test('Wait between get account requests', function (t) {
  t.plan(4)

  let options = {
    networkId: 1, // mainnet
    path: "44'/60'/0'/0", // ledger def let ledger = new LedgerWallet(options)ault derivation path
    askConfirm: false,
    accountsLength: 1,
    accountsOffset: 0
  }
  let ledger = new LedgerWallet(options)

  ledger.getAccounts((err, accounts) => {
    console.log(err, accounts)
    t.error(err, 'No Error')
    t.ok(accounts, 'Accounts Retrieved')
  })

  setTimeout(() => {
    ledger.getAccounts((err, accounts) => {
      console.log(err, accounts)
      t.error(err, 'No Error')
      t.ok(accounts, 'Accounts Retrieved')
      t.end()
    })
  }, 1000)


})
