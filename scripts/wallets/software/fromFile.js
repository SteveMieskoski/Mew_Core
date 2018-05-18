const common = require('../../common/index')
const stripHexPrefix = common.stripHexPrefix
const EthereumTx = common.tx
const crypto = common.crypto
const scrypt = common.scrypt
const ethUtil = common.ethUtil
const validator = common.validation
const bip39 = common.bip39
const HDKey = common.HDKey
const assert = require('assert')
const errors = require('../../errors/index')


class FromFile {
  constructor(options) {
    this.wallet = null;
    this.isMnemonic = false
    this.HDWallet = {}
    if (options) {
      this.decryptWallet(options)
    }
  }

  changeNetwork(networkId, path) {
    throw Object.create({message: 'ERROR: changeNetwork NOT IMPLEMENTED'})
  }

  getAccounts(callback) {
    try {
      let addressAsString = this.getAddressString()
      callback(null, addressAsString)
    } catch (e) {
      callback(e)
    }
  }

  getMultipleAccounts(count, offset, callback) {
    if (this.isMnemonic) {
      try {
        let addresses = this.setHDAddresses(offset, count);
        callback(null, addresses)
      } catch (e) {
        callback(e)
      }
    } else {
      return this.getAccounts(callback)
    }
    throw Object.create({message: 'ERROR: getMultipleAccounts NOT IMPLEMENTED'})
  }

  signTransaction(txData, callback) {
    try {
      // need to check that uiFunc rawTX is the txData being passed in here
      // And that the structure in compatible with the way web3 signs transactions
      let eTx = new EthereumTx(txData);
      if(!txData.privKey) txData.privKey = this.wallet.privKey;
      eTx.sign(new Buffer(txData.privKey, 'hex'));
      txData.rawTx = JSON.stringify(txData);
      txData.signedTx = '0x' + eTx.serialize().toString('hex');
      txData.isError = false;
      if (callback !== undefined) callback(null, '0x' + eTx.serialize().toString('hex'));
    } catch (e) {
      callback(e)
    }
  }

  signMessage(message, callback) {
    try {
      let thisMessage = message.data ? message.data : message
      let msg = ethUtil.hashPersonalMessage(ethUtil.toBuffer(thisMessage))
      let signed = ethUtil.ecsign(msg, this.wallet.privKey)
      let combined = Buffer.concat([Buffer.from(signed.r), Buffer.from(signed.s), Buffer.from([signed.v])])
      let combinedHex = combined.toString('hex')
      let signingAddr = this.getAddressString()
      let signedMsg = JSON.stringify({
        address: this.getAddressString(),
        msg: thisMessage,
        sig: '0x' + combinedHex,
        version: '3',
        signer: 'MEW'
      }, null, 2)
      callback(null, '0x' + combinedHex)
    } catch (e) {
      callback(e);
    }
  }

  createWallet(priv, pub, path, hwType, hwTransport) {
    let wallet = {}
    if (typeof priv != "undefined") {
      wallet.privKey = priv.length == 32 ? priv : Buffer(priv, 'hex')
    }
    wallet.pubKey = pub;
    wallet.path = path;
    wallet.hwType = hwType;
    wallet.hwTransport = hwTransport;
    wallet.type = "default";
    return wallet
  }

  getAddress() {
    if(!this.wallet) throw "no wallet present. wallet not have been decrypted"
    if (typeof this.wallet.pubKey == "undefined") {
      return ethUtil.privateToAddress(this.wallet.privKey)
    } else {
      return ethUtil.publicToAddress(this.wallet.pubKey, true)
    }
  }

  getAddressString() {
    return '0x' + this.getAddress().toString('hex')
  }

  // can be accessed via the accessWallet property of MewCore
  decryptWallet(options) {
    try {
      switch (options.type) {
        case "fromMyEtherWalletKey": // TODO: STILL NEEDS TESTS
          this.wallet = this.fromMyEtherWalletKey(options.manualPrivateKey, options.privPassword);
          // walletService.password = privPassword;
          break;
        case "manualPrivateKey":
          let privKey = options.manualPrivateKey.indexOf("0x") === 0 ? options.manualPrivateKey : "0x" + options.manualPrivateKey;

          if (!validator.isValidHex(options.manualPrivateKey)) {
            throw "fromFile decryptWallet manualPrivateKey 1"
            // return;
          } else if (!ethUtil.isValidPrivate(ethUtil.toBuffer(privKey))) {
            this.wallet = null;
            throw "fromFile decryptWallet manualPrivateKey 2"
            // return;
          } else {
            this.wallet = this.createWallet(this.fixPkey(options.manualPrivateKey));
            // console.log(this.wallet); // todo remove dev item
            // walletService.password = '';
          }
          break;
        case "fromPrivateKeyFile":

          this.wallet = this.getWalletFromPrivKeyFile(options.fileContent, options.filePassword);
          // walletService.password = filePassword;
          break;
        case "fromMnemonic":  // TODO: STILL NEEDS TESTS
          // onHDDPathChange(mnemonicPassword);
          this.HDWallet.hdk = HDKey.fromMasterSeed(bip39.mnemonicToSeed(options.manualmnemonic.trim(), options.mnemonicPassword));
          this.setHDAddresses(0, 5);
          break;
        case "parity":  // TODO: STILL NEEDS TESTS
          this.wallet = this.fromParityPhrase(options.parityPhrase);
          break;
        default:
          break;
      }
    } catch (e) {
      throw e
      // throw"fromFile decryptWallet catch" +
    }

    if (this.wallet !== null) {
      // errors.simpleError("fromFile decryptWallet this.wallet !== null")
      this.wallet.type = "default";
    }
  };

  setHDAddresses(start, limit) {
    this.HDWallet.wallets = [];
    for (let i = start; i < start + limit; i++) {
      this.HDWallet.wallets.push(this.createWallet(this.HDWallet.hdk.derive(this.HDWallet.dPath + "/" + i)._privateKey));
      this.HDWallet.wallets[this.HDWallet.wallets.length - 1].setBalance(false);
    }
    this.HDWallet.id = 0;
    this.HDWallet.numWallets = start + limit;
  }

  fixPkey(key) {
    if (key.indexOf('0x') === 0) {
      return key.slice(2);
    }
    return key;
  }

  getWalletFromPrivKeyFile(strjson, password) {
    let jsonArr
    if (typeof strjson === 'string') {
      jsonArr = JSON.parse(strjson);
    } else {
      jsonArr = strjson
    }
    if (jsonArr.encseed != null) return this.fromEthSale(strjson, password);
    else if (jsonArr.Crypto != null || jsonArr.crypto != null) return this.fromV3(strjson, password, true);
    else if (jsonArr.hash != null) return this.fromMyEtherWallet(strjson, password);
    else if (jsonArr.publisher == "MyEtherWallet") return this.fromMyEtherWalletV2(strjson);
    else
      throw "Error decoding wallet from file"
  }

  fromMyEtherWalletKey(input, password) {
    let cipher = input.slice(0, 128)
    cipher = this.decodeCryptojsSalt(cipher)
    let evp = this.evp_kdf(new Buffer(password), cipher.salt, {
      keysize: 32,
      ivsize: 16
    })
    let decipher = crypto.createDecipheriv('aes-256-cbc', evp.key, evp.iv)
    let privKey = Wallet.decipherBuffer(decipher, new Buffer(cipher.ciphertext))
    privKey = new this((privKey.toString()), 'hex')
    return this.createWallet(privKey)
  }

  fromV3(input, passwordRaw, nonStrict) {
    try {
      assert(typeof passwordRaw === 'string')
    } catch (e){
      throw `password must be a string. received ${typeof passwordRaw}`
    }

    let password = passwordRaw.toString()
    let seed // because let is block scoped
    try {
      let json;
      if(typeof input === 'object'){
        let stringJson = JSON.stringify(input)
        json = JSON.parse(nonStrict ? stringJson.toLowerCase() : stringJson)
      } else {
        json = JSON.parse(nonStrict ? input.toLowerCase() : input)
      }
      // json = (typeof input === 'object') ? input : JSON.parse(nonStrict ? input.toLowerCase() : input)
      if (json.version !== 3) {
        throw new Error('Not a V3 wallet')
      }
      let derivedKey
      let kdfparams
      if(!json.crypto && json.Crypto){
        json.crypto = json.Crypto
      }
      if (json.crypto.kdf === 'scrypt') {
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
      let ciphertext = new Buffer(json.crypto.ciphertext, 'hex')
      let mac = ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))
      if (mac.toString('hex') !== json.crypto.mac) {
        throw new Error('Key derivation failed - possibly wrong passphrase')
      }
      let decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), new Buffer(json.crypto.cipherparams.iv, 'hex'))
      seed = this.decipherBuffer(decipher, ciphertext, 'hex')
      while (seed.length < 32) {
        let nullBuff = new Buffer([0x00]);
        seed = Buffer.concat([nullBuff, seed]);
      }
    } catch (e) {
      console.error(e);
    }
    return this.createWallet(seed)
  }

  fromMyEtherWallet(input, password) {
    let json = (typeof input === 'object') ? input : JSON.parse(input)
    let privKey
    if (!json.locked) {
      if (json.private.length !== 64) {
        throw new Error('Invalid private key length')
      }
      privKey = new Buffer(json.private, 'hex')
    } else {
      if (typeof password !== 'string') {
        throw new Error('Password required')
      }
      if (password.length < 7) {
        throw new Error('Password must be at least 7 characters')
      }
      let cipher = json.encrypted ? json.private.slice(0, 128) : json.private
      cipher = this.decodeCryptojsSalt(cipher)
      let evp = this.evp_kdf(new Buffer(password), cipher.salt, {
        keysize: 32,
        ivsize: 16
      })
      let decipher = ethUtil.crypto.createDecipheriv('aes-256-cbc', evp.key, evp.iv)
      privKey = this.decipherBuffer(decipher, new Buffer(cipher.ciphertext))
      privKey = new Buffer((privKey.toString()), 'hex')
    }
    let wallet = this.createWallet(privKey)
    if (wallet.getAddressString() !== json.address) {
      throw new Error('Invalid private key or address')
    }
    return wallet
  }

  fromMyEtherWalletV2(input) {
    let json = (typeof input === 'object') ? input : JSON.parse(input);
    if (json.privKey.length !== 64) {
      throw new Error('Invalid private key length');
    }
    ;
    let privKey = new Buffer(json.privKey, 'hex');
    return this.createWallet(privKey);
  }

  fromEthSale(input, password) {
    let json = (typeof input === 'object') ? input : JSON.parse(input)
    let encseed = new Buffer(json.encseed, 'hex')
    let derivedKey = ethUtil.crypto.pbkdf2Sync(Buffer(password), Buffer(password), 2000, 32, 'sha256').slice(0, 16)
    let decipher = ethUtil.crypto.createDecipheriv('aes-128-cbc', derivedKey, encseed.slice(0, 16))
    let seed = this.decipherBuffer(decipher, encseed.slice(16))
    let wallet = this.createWallet(ethUtil.sha3(seed))
    if (wallet.getAddress().toString('hex') !== json.ethaddr) {
      throw new Error('Decoded key mismatch - possibly wrong passphrase')
    }
    return wallet
  }

  fromParityPhrase(phrase) {
    let hash = ethUtil.sha3(new Buffer(phrase));
    for (let i = 0; i < 16384; i++) hash = ethUtil.sha3(hash);
    while (ethUtil.privateToAddress(hash)[0] != 0) hash = ethUtil.sha3(hash);
    return this.createWallet(hash);
  }

  decipherBuffer(decipher, data) {
    return Buffer.concat([decipher.update(data), decipher.final()])
  }

  decodeCryptojsSalt(input) {
    let ciphertext = new Buffer(input, 'base64')
    if (ciphertext.slice(0, 8).toString() === 'Salted__') {
      return {
        salt: ciphertext.slice(8, 16),
        ciphertext: ciphertext.slice(16)
      }
    } else {
      return {
        ciphertext: ciphertext
      }
    }
  }

  evp_kdf(data, salt, opts) {
    // A single EVP iteration, returns `D_i`, where block equlas to `D_(i-1)`

    function iter(block) {
      let hash = crypto.createHash(opts.digest || 'md5')
      hash.update(block)
      hash.update(data)
      hash.update(salt)
      block = hash.digest()
      for (let i = 1; i < (opts.count || 1); i++) {
        hash = crypto.createHash(opts.digest || 'md5')
        hash.update(block)
        block = hash.digest()
      }
      return block
    }

    let keysize = opts.keysize || 16
    let ivsize = opts.ivsize || 16
    let ret = []
    let i = 0
    while (Buffer.concat(ret).length < (keysize + ivsize)) {
      ret[i] = iter((i === 0) ? new Buffer(0) : ret[i - 1])
      i++
    }
    let tmp = Buffer.concat(ret)
    return {
      key: tmp.slice(0, keysize),
      iv: tmp.slice(keysize, keysize + ivsize)
    }
  }

}

module.exports = FromFile
