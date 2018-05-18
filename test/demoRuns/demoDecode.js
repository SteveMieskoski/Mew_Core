const common = require('../../scripts/common')
const stripHexPrefix = common.stripHexPrefix
const EthereumTx = common.tx
const crypto = common.crypto
const scrypt = common.scrypt
const ethUtil = common.ethUtil
const validator = common.validation
const bip39 = common.bip39
const HDKey = common.HDKey
const scryptsy = require('scrypt.js')
const assert = require('assert')
const Web3 = require('web3')
// const errors = require('../../errors')

const web3 = new Web3()

let encrypted = web3.eth.accounts.encrypt("0x3cffe6ebdb1f9e90c2cc6dd2d9ce22f7927ea9499e8a89745ff333c29a7b2bdc", '123456789')
console.log(encrypted); // todo remove dev item
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

fromV3(options.fileContent, options.filePassword, true)
// fromV3EthereumJs(options.fileContent, options.filePassword, true)

function fromV3(input, passwordRaw, nonStrict) {
  let password = passwordRaw.toString()
  try {
    let json = (typeof input === 'object') ? input : JSON.parse(nonStrict ? input.toLowerCase() : input)
    if (json.version !== 3) {
      throw new Error('Not a V3 wallet')
    }
    console.log("fromV3", input); // todo remove dev item
    let derivedKey
    let kdfparams
    if(!json.crypto && json.Crypto){
      json.crypto = json.Crypto
    }
    if (json.crypto.kdf === 'scrypt') {
      console.log(json.crypto); // todo remove dev item
      kdfparams = json.crypto.kdfparams
      derivedKey = scrypt(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    } else if (json.crypto.kdf === 'pbkdf2') {
      kdfparams = json.crypto.kdfparams
      if (kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2')
      }
      derivedKey = crypto.pbkdf2Sync(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
    } else {
      throw new Error('Unsupported key derivation scheme')
    }
    var ciphertext = new Buffer(json.crypto.ciphertext, 'hex')
    var mac = ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))
    console.log("mac.toString('hex')", mac.toString('hex')); // todo remove dev item
    console.log("json.crypto.mac", json.crypto.mac); // todo remove dev item
    if (mac.toString('hex') !== json.crypto.mac) {
      throw new Error('Key derivation failed - possibly wrong passphrase')
    }
    var decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), new Buffer(json.crypto.cipherparams.iv, 'hex'))
    var seed = this.decipherBuffer(decipher, ciphertext, 'hex')
    while (seed.length < 32) {
      var nullBuff = new Buffer([0x00]);
      seed = Buffer.concat([nullBuff, seed]);
    }
  } catch (e) {
    console.error(e);
  }
  // return this.createWallet(seed)
}


function fromV3EthereumJs(input, password, nonStrict) {
  assert(typeof password === 'string')
  var json = (typeof input === 'object') ? input : JSON.parse(nonStrict ? input.toLowerCase() : input)

  if (json.version !== 3) {
    throw new Error('Not a V3 wallet')
  }

  var derivedKey
  var kdfparams
  if(!json.crypto && json.Crypto){
    json.crypto = json.Crypto
  }
  if (json.crypto.kdf === 'scrypt') {
    kdfparams = json.crypto.kdfparams

    // FIXME: support progress reporting callback
    derivedKey = scryptsy(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
  } else if (json.crypto.kdf === 'pbkdf2') {
    kdfparams = json.crypto.kdfparams

    if (kdfparams.prf !== 'hmac-sha256') {
      throw new Error('Unsupported parameters to PBKDF2')
    }

    derivedKey = crypto.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
  } else {
    throw new Error('Unsupported key derivation scheme')
  }

  var ciphertext = Buffer.from(json.crypto.ciphertext, 'hex')

  var mac = ethUtil.sha3(Buffer.concat([ derivedKey.slice(16, 32), ciphertext ]))
  if (mac.toString('hex') !== json.crypto.mac) {
    throw new Error('Key derivation failed - possibly wrong passphrase')
  }

  var decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, 'hex'))
  var seed = decipherBuffer(decipher, ciphertext, 'hex')

  // return new Wallet(seed)
}

function decipherBuffer (decipher, data) {
  return Buffer.concat([ decipher.update(data), decipher.final() ])
}