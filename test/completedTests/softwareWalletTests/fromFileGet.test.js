const test = require('tape')
const FromFile = require('../../../scripts/wallets/software/fromFile')
const display = false

function displayResults(name, err, data, note) {
  if (display) {
    if (err) {
      if (note) {
        console.log(`\nCallback result for:\n Note: ${note}:\n ${name}:\n  Error: ${JSON.stringify(err)}\n  Data: ${data}\n\n`)
      } else {
        console.log(`\nCallback result for:\n ${name}:\n  Error: ${JSON.stringify(err)}\n  Data: ${data}\n\n`)
      }
    } else {
      if (note) {
        console.log(`\nCallback result for:\n Note: ${note}:\n ${name}:\n  Error: ${err}\n  Data: ${JSON.stringify(data)}\n\n`)
      } else {
        console.log(`\nCallback result for:\n ${name}:\n  Error: ${err}\n  Data: ${JSON.stringify(data)}\n\n`)
      }
    }
  }
}

test('Get Account  (i.e. address) via manual private key', function (t) {
  t.plan(3)
  let options = {
    type: "manualPrivateKey",
    manualPrivateKey: "3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc"
  }
  let fromFile = new FromFile(options)

  fromFile.getAccounts((err, data) => {
    displayResults(t.name, err, data)
    t.error(err, 'No Error')
    t.ok(data, 'Account Retrieved')
    t.equal(data, '0xf97d4062a18d2730fbd39cff0fde80d71cbebf98', "Correct Address Returned")
    t.end()
  })
})
// the private key used to encrypt is the same as the one above and the one feed into MyEtherWallet.com to create the
// other version of this test
test('Get Account (i.e. address) via private key file [created via web3 encrypt] (the json that would be in a file)', function (t) {
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
  fromFile.getAccounts((err, data) => {
    displayResults(t.name, err, data)
    t.error(err, 'No Error')
    t.ok(data, 'Account Retrieved')
    t.equal(data, '0xf97d4062a18d2730fbd39cff0fde80d71cbebf98', "Correct Address Returned")
    t.end()
  })
})
test('Get Account  (i.e. address) via private key file (the json that would be in a file)', function (t) {
  t.plan(3)

  let fileContent = {
    "version": 3,
    "id": "2d8c3170-1813-4ff2-8a0c-0e4259df617c",
    "address": "f97d4062a18d2730fbd39cff0fde80d71cbebf98",
    "Crypto": {
      "ciphertext": "559d85c63b9a8ab262fc5431616fe9796cc96ba17fbc9b4e2ed024ff899d0696",
      "cipherparams": {"iv": "8905df94d3bfcc2195f2943344c5b443"},
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "55e8a9fa279b447a082c803992c68840af2767c70de0d226b30a1e94109bcb2c",
        "n": 8192,
        "r": 8,
        "p": 1
      },
      "mac": "c7fbe08ce4604c20fc40903840a011e13d0408f1b30b08c3b1177534b2951748"
    }
  }
  let options = {
    type: "fromPrivateKeyFile",
    fileContent: fileContent,
    filePassword: "123456789"
  }
  let fromFile = new FromFile(options)
  fromFile.getAccounts((err, data) => {
    displayResults(t.name, err, data)
    t.error(err, 'No Error')
    t.ok(data, 'Account Retrieved')
    t.equal(data, '0xf97d4062a18d2730fbd39cff0fde80d71cbebf98', "Correct Address Returned")
    t.end()
  })
})
test('Throw error for non-string password', function (t) {
  t.plan(1)

  let fileContent = {
    "version": 3,
    "id": "2d8c3170-1813-4ff2-8a0c-0e4259df617c",
    "address": "f97d4062a18d2730fbd39cff0fde80d71cbebf98",
    "Crypto": {
      "ciphertext": "559d85c63b9a8ab262fc5431616fe9796cc96ba17fbc9b4e2ed024ff899d0696",
      "cipherparams": {"iv": "8905df94d3bfcc2195f2943344c5b443"},
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "55e8a9fa279b447a082c803992c68840af2767c70de0d226b30a1e94109bcb2c",
        "n": 8192,
        "r": 8,
        "p": 1
      },
      "mac": "c7fbe08ce4604c20fc40903840a011e13d0408f1b30b08c3b1177534b2951748"
    }
  }
  let options = {
    type: "fromPrivateKeyFile",
    fileContent: fileContent,
    filePassword: 123456789
  }

  try{
    new FromFile(options)
  } catch(e){
    t.ok(e, "Error Properly Thrown")
  }
  t.end()
})
