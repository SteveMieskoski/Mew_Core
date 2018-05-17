/*
 * Emulate 'eth_accounts' / 'eth_sendTransaction' using 'eth_sendRawTransaction'
 *
 * The two callbacks a user needs to implement are:
 * - getAccounts() -- array of addresses supported
 * - signTransaction(tx) -- sign a raw transaction object
 */

const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
// const inherits = require('util').inherits
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const extend = require('xtend')
const Semaphore = require('semaphore')
const Subprovider = require('./subproviderDropIn')
// const estimateGas = require('../util/estimate-gas.js')
const hexRegex = /^[0-9A-Fa-f]+$/g

// handles the following RPC methods:
//   eth_coinbase
//   eth_accounts
//   eth_sendTransaction
//   eth_sign
//   eth_signTypedData
//   personal_sign
//   personal_ecRecover
//   parity_postTransaction
//   parity_checkRequest
//   parity_defaultAccount

//
// Tx Signature Flow
//
// handleRequest: eth_sendTransaction
//   validateTransaction (basic validity check)
//     validateSender (checks that sender is in accounts)
//   processTransaction (sign tx and submit to network)
//     approveTransaction (UI approval hook)
//     checkApproval
//     finalizeAndSubmitTx (tx signing)
//       nonceLock.take (bottle neck to ensure atomic nonce)
//         fillInTxExtras (set fallback gasPrice, nonce, etc)
//         signTransaction (perform the signature)
//         publishTransaction (publish signed tx to network)
//

class HookedWalletDropIn extends Subprovider {
  constructor (opts) {
    super()
    // control flow
    this.nonceLock = Semaphore(1)

    // data lookup
    if (opts.getAccounts) this.getAccounts = opts.getAccounts
    // high level override
    if (opts.processTransaction) this.processTransaction = opts.processTransaction
    if (opts.processMessage) this.processMessage = opts.processMessage
    if (opts.processPersonalMessage) this.processPersonalMessage = opts.processPersonalMessage
    if (opts.processTypedMessage) this.processTypedMessage = opts.processTypedMessage
    // approval hooks
    this.approveTransaction = opts.approveTransaction || this.autoApprove
    this.approveMessage = opts.approveMessage || this.autoApprove
    this.approvePersonalMessage = opts.approvePersonalMessage || this.autoApprove
    this.approveTypedMessage = opts.approveTypedMessage || this.autoApprove
    // actually perform the signature
    if (opts.signTransaction) this.signTransaction = opts.signTransaction || mustProvideInConstructor('signTransaction')
    if (opts.signMessage) this.signMessage = opts.signMessage || mustProvideInConstructor('signMessage')
    if (opts.signPersonalMessage) this.signPersonalMessage = opts.signPersonalMessage || mustProvideInConstructor('signPersonalMessage')
    if (opts.signTypedMessage) this.signTypedMessage = opts.signTypedMessage || mustProvideInConstructor('signTypedMessage')
    if (opts.recoverPersonalSignature) this.recoverPersonalSignature = opts.recoverPersonalSignature
    // publish to network
    if (opts.publishTransaction) this.publishTransaction = opts.publishTransaction
  }

  handleRequest (payload, next, end) {
    this._parityRequests = {}
    this._parityRequestCount = 0

    // switch statement is not block scoped
    // sp we cant repeat var declarations
    let txParams, msgParams, extraParams
    let message, address

    switch (payload.method) {
      case 'eth_coinbase':
        // process normally
        this.getAccounts(function (err, accounts) {
          if (err) return end(err)
          let result = accounts[0] || null
          end(null, result)
        })
        return

      case 'eth_accounts':
        // process normally
        this.getAccounts(function (err, accounts) {
          if (err) return end(err)
          end(null, accounts)
        })
        return

      case 'eth_sendTransaction':
        txParams = payload.params[0]
        waterfall([
          (cb) => this.validateTransaction(txParams, cb),
          (cb) => this.processTransaction(txParams, cb)
        ], end)
        return

      case 'eth_signTransaction':
        txParams = payload.params[0]
        waterfall([
          (cb) => this.validateTransaction(txParams, cb),
          (cb) => this.processSignTransaction(txParams, cb)
        ], end)
        return

      case 'eth_sign':
        // process normally
        address = payload.params[0]
        message = payload.params[1]
        // non-standard "extraParams" to be appended to our "msgParams" obj
        // good place for metadata
        extraParams = payload.params[2] || {}
        msgParams = extend(extraParams, {
          from: address,
          data: message
        })
        waterfall([
          (cb) => this.validateMessage(msgParams, cb),
          (cb) => this.processMessage(msgParams, cb)
        ], end)
        return

      case 'personal_sign':
        // process normally
        const first = payload.params[0]
        const second = payload.params[1]

        // We initially incorrectly ordered these parameters.
        // To gracefully respect users who adopted this API early,
        // we are currently gracefully recovering from the wrong param order
        // when it is clearly identifiable.
        //
        // That means when the first param is definitely an address,
        // and the second param is definitely not, but is hex.
        if (resemblesData(second) && resemblesAddress(first)) {
          let warning = `The eth_personalSign method requires params ordered `
          warning += `[message, address]. This was previously handled incorrectly, `
          warning += `and has been corrected automatically. `
          warning += `Please switch this param order for smooth behavior in the future.`
          console.warn(warning)

          address = payload.params[0]
          message = payload.params[1]
        } else {
          message = payload.params[0]
          address = payload.params[1]
        }

        // non-standard "extraParams" to be appended to our "msgParams" obj
        // good place for metadata
        extraParams = payload.params[2] || {}
        msgParams = extend(extraParams, {
          from: address,
          data: message
        })
        waterfall([
          (cb) => this.validatePersonalMessage(msgParams, cb),
          (cb) => this.processPersonalMessage(msgParams, cb)
        ], end)
        return

      case 'personal_ecRecover':
        message = payload.params[0]
        let signature = payload.params[1]
        // non-standard "extraParams" to be appended to our "msgParams" obj
        // good place for metadata
        extraParams = payload.params[2] || {}
        msgParams = extend(extraParams, {
          sig: signature,
          data: message
        })
        this.recoverPersonalSignature(msgParams, end)
        return

      case 'eth_signTypedData':
        // process normally
        message = payload.params[0]
        address = payload.params[1]
        extraParams = payload.params[2] || {}
        msgParams = extend(extraParams, {
          from: address,
          data: message
        })
        waterfall([
          (cb) => this.validateTypedMessage(msgParams, cb),
          (cb) => this.processTypedMessage(msgParams, cb)
        ], end)
        return

      case 'parity_postTransaction':
        txParams = payload.params[0]
        this.parityPostTransaction(txParams, end)
        return

      case 'parity_postSign':
        address = payload.params[0]
        message = payload.params[1]
        this.parityPostSign(address, message, end)
        return

      case 'parity_checkRequest':
        const requestId = payload.params[0]
        this.parityCheckRequest(requestId, end)
        return

      case 'parity_defaultAccount':
        this.getAccounts(function (err, accounts) {
          if (err) return end(err)
          const account = accounts[0] || null
          end(null, account)
        })
        return

      default:
        next()
    }
  }

  //
  // data lookup
  //

  getAccounts (cb) {
    cb(null, [])
  }

  //
  // "process" high level flow
  //

  processTransaction (txParams, cb) {
    waterfall([
      (cb) => this.approveTransaction(txParams, cb),
      (didApprove, cb) => this.checkApproval('transaction', didApprove, cb),
      (cb) => this.finalizeAndSubmitTx(txParams, cb)
    ], cb)
  }

  processSignTransaction (txParams, cb) {
    waterfall([
      (cb) => this.approveTransaction(txParams, cb),
      (didApprove, cb) => this.checkApproval('transaction', didApprove, cb),
      (cb) => this.finalizeTx(txParams, cb)
    ], cb)
  }

  processMessage (msgParams, cb) {
    waterfall([
      (cb) => this.approveMessage(msgParams, cb),
      (didApprove, cb) => this.checkApproval('message', didApprove, cb),
      (cb) => this.signMessage(msgParams, cb)
    ], cb)
  }

  processPersonalMessage (msgParams, cb) {
    waterfall([
      (cb) => this.approvePersonalMessage(msgParams, cb),
      (didApprove, cb) => this.checkApproval('message', didApprove, cb),
      (cb) => this.signPersonalMessage(msgParams, cb)
    ], cb)
  }

  processTypedMessage (msgParams, cb) {
    waterfall([
      (cb) => this.approveTypedMessage(msgParams, cb),
      (didApprove, cb) => this.checkApproval('message', didApprove, cb),
      (cb) => this.signTypedMessage(msgParams, cb)
    ], cb)
  }

  //
  // approval
  //

  autoApprove (txParams, cb) {
    cb(null, true)
  }

  checkApproval (type, didApprove, cb) {
    cb(didApprove ? null : new Error('User denied ' + type + ' signature.'))
  }

  //
  // parity
  //

  parityPostTransaction (txParams, cb) {
    // get next id
    const count = this._parityRequestCount
    const reqId = `0x${count.toString(16)}`
    this._parityRequestCount++

    this.emitPayload({
      method: 'eth_sendTransaction',
      params: [txParams]
    }, function (error, res) {
      if (error) {
        this._parityRequests[reqId] = { error }
        return
      }
      const txHash = res.result
      this._parityRequests[reqId] = txHash
    })

    cb(null, reqId)
  }

  parityPostSign (address, message, cb) {
    // get next id
    const count = this._parityRequestCount
    const reqId = `0x${count.toString(16)}`
    this._parityRequestCount++

    this.emitPayload({
      method: 'eth_sign',
      params: [address, message]
    }, function (error, res) {
      if (error) {
        this._parityRequests[reqId] = { error }
        return
      }
      const result = res.result
      this._parityRequests[reqId] = result
    })

    cb(null, reqId)
  }

  parityCheckRequest (reqId, cb) {
    const result = this._parityRequests[reqId] || null
    // tx not handled yet
    if (!result) return cb(null, null)
    // tx was rejected (or other error)
    if (result.error) return cb(result.error)
    // tx sent
    cb(null, result)
  }

  //
  // signature and recovery
  //

  recoverPersonalSignature (msgParams, cb) {
    let senderHex
    try {
      senderHex = sigUtil.recoverPersonalSignature(msgParams)
    } catch (err) {
      return cb(err)
    }
    cb(null, senderHex)
  }

  //
  // validation
  //

  validateTransaction (txParams, cb) {
    // shortcut: undefined sender is invalid
    if (txParams.from === undefined) return cb(new Error(`Undefined address - from address required to sign transaction.`))
    this.validateSender(txParams.from, function (err, senderIsValid) {
      if (err) return cb(err)
      if (!senderIsValid) return cb(new Error(`Unknown address - unable to sign transaction for this address: "${txParams.from}"`))
      cb()
    })
  }

  validateMessage (msgParams, cb) {
    if (msgParams.from === undefined) return cb(new Error(`Undefined address - from address required to sign message.`))
    this.validateSender(msgParams.from, function (err, senderIsValid) {
      if (err) return cb(err)
      if (!senderIsValid) return cb(new Error(`Unknown address - unable to sign message for this address: "${msgParams.from}"`))
      cb()
    })
  }

  validatePersonalMessage (msgParams, cb) {
    if (msgParams.from === undefined) return cb(new Error(`Undefined address - from address required to sign personal message.`))
    if (msgParams.data === undefined) return cb(new Error(`Undefined message - message required to sign personal message.`))
    if (!isValidHex(msgParams.data)) return cb(new Error(`HookedWalletSubprovider - validateMessage - message was not encoded as hex.`))
    this.validateSender(msgParams.from, function (err, senderIsValid) {
      if (err) return cb(err)
      if (!senderIsValid) return cb(new Error(`Unknown address - unable to sign message for this address: "${msgParams.from}"`))
      cb()
    })
  }

  validateTypedMessage (msgParams, cb) {
    if (msgParams.from === undefined) return cb(new Error(`Undefined address - from address required to sign typed data.`))
    if (msgParams.data === undefined) return cb(new Error(`Undefined data - message required to sign typed data.`))
    this.validateSender(msgParams.from, function (err, senderIsValid) {
      if (err) return cb(err)
      if (!senderIsValid) return cb(new Error(`Unknown address - unable to sign message for this address: "${msgParams.from}"`))
      cb()
    })
  }

  validateSender (senderAddress, cb) {
    // shortcut: undefined sender is invalid
    if (!senderAddress) return cb(null, false)
    this.getAccounts(function (err, accounts) {
      if (err) return cb(err)
      const senderIsValid = (accounts.map(toLowerCase).indexOf(senderAddress.toLowerCase()) !== -1)
      cb(null, senderIsValid)
    })
  }

  //
  // tx helpers
  //

  finalizeAndSubmitTx (txParams, cb) {
    // can only allow one tx to pass through this flow at a time
    // so we can atomically consume a nonce
    this.nonceLock.take(function () {
      waterfall([
        this.fillInTxExtras.bind(this, txParams),
        this.signTransaction.bind(this),
        this.publishTransaction.bind(this)
      ], function (err, txHash) {
        this.nonceLock.leave()
        if (err) return cb(err)
        cb(null, txHash)
      })
    })
  }

  finalizeTx (txParams, cb) {
    // can only allow one tx to pass through this flow at a time
    // so we can atomically consume a nonce
    this.nonceLock.take(function () {
      waterfall([
        this.fillInTxExtras.bind(this, txParams),
        this.signTransaction.bind(this)
      ], function (err, signedTx) {
        this.nonceLock.leave()
        if (err) return cb(err)
        cb(null, {raw: signedTx, tx: txParams})
      })
    })
  }

  publishTransaction (rawTx, cb) {
    this.emitPayload({
      method: 'eth_sendRawTransaction',
      params: [rawTx]
    }, function (err, res) {
      if (err) return cb(err)
      cb(null, res.result)
    })
  }

  fillInTxExtras (txParams, cb) {
    const address = txParams.from
    // console.log('fillInTxExtras - address:', address)

    const reqs = {}

    if (txParams.gasPrice === undefined) {
      // console.log("need to get gasprice")
      reqs.gasPrice = this.emitPayload.bind(this, { method: 'eth_gasPrice', params: [] })
    }

    if (txParams.nonce === undefined) {
      // console.log("need to get nonce")
      reqs.nonce = this.emitPayload.bind(this, { method: 'eth_getTransactionCount', params: [address, 'pending'] })
    }

    if (txParams.gas === undefined) {
      // console.log("need to get gas")
      reqs.gas = estimateGas.bind(null, this.engine, cloneTxParams(txParams))
    }

    parallel(reqs, function (err, result) {
      if (err) return cb(err)
      // console.log('fillInTxExtras - result:', result)

      const res = {}
      if (result.gasPrice) res.gasPrice = result.gasPrice.result
      if (result.nonce) res.nonce = result.nonce.result
      if (result.gas) res.gas = result.gas

      cb(null, extend(txParams, res))
    })
  }
}

// util

// we use this to clean any custom params from the txParams
function cloneTxParams (txParams) {
  return {
    from: txParams.from,
    to: txParams.to,
    value: txParams.value,
    data: txParams.data,
    gas: txParams.gas,
    gasPrice: txParams.gasPrice,
    nonce: txParams.nonce
  }
}

function toLowerCase (string) {
  return string.toLowerCase()
}

function resemblesAddress (string) {
  const fixed = ethUtil.addHexPrefix(string)
  const isValid = ethUtil.isValidAddress(fixed)
  return isValid
}

// Returns true if resembles hex data
// but definitely not a valid address.
function resemblesData (string) {
  const fixed = ethUtil.addHexPrefix(string)
  const isValidAddress = ethUtil.isValidAddress(fixed)
  return !isValidAddress && isValidHex(string)
}

function isValidHex (data) {
  const isString = typeof data === 'string'
  if (!isString) return false
  const isHexPrefixed = data.slice(0, 2) === '0x'
  if (!isHexPrefixed) return false
  const nonPrefixed = data.slice(2)
  const isValid = nonPrefixed.match(hexRegex)
  return isValid
}

function mustProvideInConstructor (methodName) {
  return function (params, cb) {
    cb(new Error('ProviderEngine - HookedWalletSubprovider - Must provide "' + methodName + '" fn in constructor options'))
  }
}

module.exports = HookedWalletDropIn
