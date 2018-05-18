const test = require('tape')
const LedgerWallet = require('../../../../scripts/wallets/hardware/ledger/ledgerWallet')

test('Sign Transaction', function (t) {
  t.plan(2)
  let ledger = new LedgerWallet()

  let getAccountCallback = (err, addresses) => {
    console.log(err, addresses)
    var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
    var addressHex = '0x' + address.toString('hex')
    const tx = {
      from: addresses[0],
      to: addressHex,
      value: '0x01',
      gas: '0x1234567890'
    }

    ledger.signTransaction(tx, (err, data) => {
      console.log(err, data)
      t.error(err, 'No Error')
      t.ok(data, 'Transaction Signed')
      t.end()
    })
  }

  ledger.getAccounts(getAccountCallback)
})

test('Sign message', function (t) {
  t.plan(2)
  let ledger = new LedgerWallet()

  let getAccountCallback = (err, addresses) => {
    console.log(err, addresses)
    var address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
    var addressHex = '0x' + address.toString('hex')
    let message = {
      from: addresses[0],
      data: Buffer.from('test').toString('hex')
    }

    ledger.signPersonalMessage(message, (err, data) => {
      console.log(err, data)
      t.error(err, 'No Error')
      t.ok(data, 'Message Signed')
      t.end()
    })
  }

  ledger.getAccounts(getAccountCallback)
})
