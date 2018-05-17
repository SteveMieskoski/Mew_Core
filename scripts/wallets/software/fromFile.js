
const common = require('../../common')
const stripHexPrefix = common.stripHexPrefix
const EthereumTx = common.tx
const crypto = common.crypto
const ethUtil = common.ethUtil




class FromFile {
  constructor (options) {
/*    Wallet.getWalletFromPrivKeyFile($scope.fileContent, $scope.filePassword);
    walletService.password = $scope.filePassword;*/
  }

  changeNetwork (networkId, path) {
    throw Object.create({message: 'ERROR: changeNetwork NOT IMPLEMENTED'})
  }
  getAccounts (callback) {
    throw Object.create({message: 'ERROR: getAccounts NOT IMPLEMENTED'})
  }

  getMultipleAccounts (count, offset, callback) {
    throw Object.create({message: 'ERROR: getMultipleAccounts NOT IMPLEMENTED'})
  }

  signTransaction (txData, callback) {
    throw Object.create({message: 'ERROR: signTransaction NOT IMPLEMENTED'})
  }

  signMessage (txData, callback) {
    throw Object.create({message: 'ERROR: signPersonalMessage NOT IMPLEMENTED'})
  }


  getWalletFromPrivKeyFile(strjson, password) {
    var jsonArr = JSON.parse(strjson);
    if (jsonArr.encseed != null) return Wallet.fromEthSale(strjson, password);
    else if (jsonArr.Crypto != null || jsonArr.crypto != null) return this.fromV3(strjson, password, true);
    else if (jsonArr.hash != null) return this.fromMyEtherWallet(strjson, password);
    else if (jsonArr.publisher == "MyEtherWallet") return this.fromMyEtherWalletV2(strjson);
    else
      throw globalFuncs.errorMsgs[2];
  }

  fromV3(input, password, nonStrict) {
    var json = (typeof input === 'object') ? input : JSON.parse(nonStrict ? input.toLowerCase() : input)
    if (json.version !== 3) {
      throw new Error('Not a V3 wallet')
    }
    var derivedKey
    var kdfparams
    if (json.crypto.kdf === 'scrypt') {
      kdfparams = json.crypto.kdfparams
      derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    } else if (json.crypto.kdf === 'pbkdf2') {
      kdfparams = json.crypto.kdfparams
      if (kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2')
      }
      derivedKey = ethUtil.crypto.pbkdf2Sync(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
    } else {
      throw new Error('Unsupported key derivation scheme')
    }
    var ciphertext = new Buffer(json.crypto.ciphertext, 'hex')
    var mac = ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))
    if (mac.toString('hex') !== json.crypto.mac) {
      throw new Error('Key derivation failed - possibly wrong passphrase')
    }
    var decipher = ethUtil.crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), new Buffer(json.crypto.cipherparams.iv, 'hex'))
    var seed = Wallet.decipherBuffer(decipher, ciphertext, 'hex')
    while (seed.length < 32) {
      var nullBuff = new Buffer([0x00]);
      seed = Buffer.concat([nullBuff, seed]);
    }
    return new Wallet(seed)
  }

  fromMyEtherWallet(input, password) {
    var json = (typeof input === 'object') ? input : JSON.parse(input)
    var privKey
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
      var cipher = json.encrypted ? json.private.slice(0, 128) : json.private
      cipher = this.decodeCryptojsSalt(cipher)
      var evp = this.evp_kdf(new Buffer(password), cipher.salt, {
        keysize: 32,
        ivsize: 16
      })
      var decipher = ethUtil.crypto.createDecipheriv('aes-256-cbc', evp.key, evp.iv)
      privKey = this.decipherBuffer(decipher, new Buffer(cipher.ciphertext))
      privKey = new Buffer((privKey.toString()), 'hex')
    }
    var wallet = new Wallet(privKey)
    if (wallet.getAddressString() !== json.address) {
      throw new Error('Invalid private key or address')
    }
    return wallet
  }

  fromMyEtherWalletV2(input) {
    var json = (typeof input === 'object') ? input : JSON.parse(input);
    if (json.privKey.length !== 64) {
      throw new Error('Invalid private key length');
    };
    var privKey = new Buffer(json.privKey, 'hex');
    return new Wallet(privKey);
  }

  fromEthSale(input, password) {
    var json = (typeof input === 'object') ? input : JSON.parse(input)
    var encseed = new Buffer(json.encseed, 'hex')
    var derivedKey = ethUtil.crypto.pbkdf2Sync(Buffer(password), Buffer(password), 2000, 32, 'sha256').slice(0, 16)
    var decipher = ethUtil.crypto.createDecipheriv('aes-128-cbc', derivedKey, encseed.slice(0, 16))
    var seed = Wallet.decipherBuffer(decipher, encseed.slice(16))
    var wallet = new Wallet(ethUtil.sha3(seed))
    if (wallet.getAddress().toString('hex') !== json.ethaddr) {
      throw new Error('Decoded key mismatch - possibly wrong passphrase')
    }
    return wallet
  }

  decipherBuffer(decipher, data) {
    return Buffer.concat([decipher.update(data), decipher.final()])
  }

  decodeCryptojsSalt(input) {
    var ciphertext = new Buffer(input, 'base64')
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
      var hash = crypto.createHash(opts.digest || 'md5')
      hash.update(block)
      hash.update(data)
      hash.update(salt)
      block = hash.digest()
      for (var i = 1; i < (opts.count || 1); i++) {
        hash = crypto.createHash(opts.digest || 'md5')
        hash.update(block)
        block = hash.digest()
      }
      return block
    }
    var keysize = opts.keysize || 16
    var ivsize = opts.ivsize || 16
    var ret = []
    var i = 0
    while (Buffer.concat(ret).length < (keysize + ivsize)) {
      ret[i] = iter((i === 0) ? new Buffer(0) : ret[i - 1])
      i++
    }
    var tmp = Buffer.concat(ret)
    return {
      key: tmp.slice(0, keysize),
      iv: tmp.slice(keysize, keysize + ivsize)
    }
  }

}

module.exports = FromFile
