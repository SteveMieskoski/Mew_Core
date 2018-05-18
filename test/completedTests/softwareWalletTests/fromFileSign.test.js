const test = require('tape')
const FromFile = require('../../../scripts/wallets/software/fromFile')
const display = true

function displayResults(name, err, data, note){
  if(display){
    if(err){
      if(note){
        console.log(`\nCallback result for:\n Note: ${note}:\n ${name}:\n  Error: ${JSON.stringify(err)}\n  Data: ${data}\n\n`)
      } else {
        console.log(`\nCallback result for:\n ${name}:\n  Error: ${JSON.stringify(err)}\n  Data: ${data}\n\n`)
      }
    } else {
      if(note){
        console.log(`\nCallback result for:\n Note: ${note}:\n ${name}:\n  Error: ${err}\n  Data: ${JSON.stringify(data)}\n\n`)
      } else {
        console.log(`\nCallback result for:\n ${name}:\n  Error: ${err}\n  Data: ${JSON.stringify(data)}\n\n`)
      }
    }
  }



}
// ===================================================================================
// SIGN TRANSACTION TESTS
test('Sign Transaction (private key supplied)', function (t) {
  t.plan(3)
  let options = {
    type: "manualPrivateKey",
    manualPrivateKey: "3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc"
  }
  let fromFile = new FromFile(options)

  let getAccountCallback = (err, addresses) => {
    displayResults(t.name, err, addresses, "getAccountCallback")
    var toAddress = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
    var toAddressHex = '0x' + toAddress.toString('hex')
    let address = extractAddress(addresses)

    const tx = {
      from: address,
      to: toAddressHex,
      value: '0x01',
      gas: '0x1234567890'
    }

    fromFile.signTransaction(tx, (err, data) => {
      displayResults(t.name, err, data)
      t.error(err, 'No Error')
      t.ok(data, 'Transaction Signed')
      t.equal(data, "0xf8628080851234567890941234362ef32bcd26d3dd18ca749378213625ba0b01801ca03df2e3c12304ac3bf9ca979399e3b7fbdb61715b06f5a0556fc43924da0f17e7a04aff600df003e4d0432e50ddfa807c4271e5c52df2394967deb867e2b4813ecf", "Transaction Properly Signed")
      console.log("\n")
      t.end()
    })
  }

  fromFile.getAccounts(getAccountCallback)
})
test('Sign Transaction (private key file supplied)', function (t) {
  t.plan(3)
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
        mac: 'e29be364b8f6952f00ab35119ead6c500832c6c308f2aaafe02e5c72209f35dc' } }

  let options = {
    type: "fromPrivateKeyFile",
    fileContent: fileContent,
    filePassword: "123456789"
  }
  let fromFile = new FromFile(options)

  let getAccountCallback = (err, addresses) => {
    displayResults(t.name, err, addresses, "getAccountCallback")
    var toAddress = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
    var toAddressHex = '0x' + toAddress.toString('hex')
    let address = extractAddress(addresses)

    const tx = {
      from: address,
      to: toAddressHex,
      value: '0x01',
      gas: '0x1234567890'
    }

    fromFile.signTransaction(tx, (err, data) => {
      displayResults(t.name, err, data)
      t.error(err, 'No Error')
      t.ok(data, 'Transaction Signed')
      t.equal(data, "0xf8628080851234567890941234362ef32bcd26d3dd18ca749378213625ba0b01801ca03df2e3c12304ac3bf9ca979399e3b7fbdb61715b06f5a0556fc43924da0f17e7a04aff600df003e4d0432e50ddfa807c4271e5c52df2394967deb867e2b4813ecf", "Transaction Properly Signed")
      console.log("\n")
      t.end()
    })
  }

  fromFile.getAccounts(getAccountCallback)
})

// ===================================================================================
// SIGN MESSAGE TESTS
test('Sign message (private key supplied)', function (t) {
  t.plan(3)
  let options = {
    type: "manualPrivateKey",
    manualPrivateKey: "3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc"
  }
  let fromFile = new FromFile(options)

  let getAccountCallback = (err, addresses) => {
    displayResults(t.name, err, addresses, "getAccountCallback")

    let address = extractAddress(addresses)

    let message = {
      from: address,
      data: Buffer.from('test').toString('hex')
    }

    fromFile.signMessage(message, (err, data) => {
      displayResults(t.name, err, data)
      t.error(err, 'No Error')
      t.ok(data, 'Transaction Signed')

      t.equal(data, "0xfc73baf00732270f0bcb04879660c67b9af9547c1e4668c680d72a16a388d2e07a0fe402b7f97385983a7d0ee19ed2699201bda707e015840413a3f5f8d55e9e1c", "Message Properly Signed")
      console.log("\n")
      t.end()
    })
  }

  fromFile.getAccounts(getAccountCallback)
})
test('Sign message (private key file supplied)', function (t) {
  t.plan(3)
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
        mac: 'e29be364b8f6952f00ab35119ead6c500832c6c308f2aaafe02e5c72209f35dc' } }

  let options = {
    type: "fromPrivateKeyFile",
    fileContent: fileContent,
    filePassword: "123456789"
  }
  let fromFile = new FromFile(options)



  let getAccountCallback = (err, addresses) => {
    displayResults(t.name, err, addresses, "getAccountCallback")

    let address = extractAddress(addresses)

    let message = {
      from: address,
      data: Buffer.from('test').toString('hex')
    }

    fromFile.signMessage(message, (err, data) => {
      displayResults(t.name, err, data)
      t.error(err, 'No Error')
      t.ok(data, 'Transaction Signed')

      t.equal(data, "0xfc73baf00732270f0bcb04879660c67b9af9547c1e4668c680d72a16a388d2e07a0fe402b7f97385983a7d0ee19ed2699201bda707e015840413a3f5f8d55e9e1c", "Message Properly Signed")
      console.log("\n")
      t.end()
    })
  }

  fromFile.getAccounts(getAccountCallback)
})



function extractAddress(addressOrAddressArray){
  if(Array.isArray(addressOrAddressArray)) {
    return addressOrAddressArray[0]
  } else {
    return addressOrAddressArray
  }
}