/*
 * Emulate 'eth_accounts' / 'eth_sendTransaction' using 'eth_sendRawTransaction'
 *
 * The two callbacks a user needs to implement are:
 * - getAccounts() -- array of addresses supported
 * - signTransaction(tx) -- sign a raw transaction object
 */

// const waterfall = require('async/waterfall')
// const parallel = require('async/parallel')
// const inherits = require('util').inherits
const ethUtil = require('ethereumjs-util')
// const sigUtil = require('../../provider/common/signUtils')
// const extend = require('xtend')
const Semaphore = require('semaphore')
const ModuleInterface = require('./moduleInterface')
// const estimateGas = require('../../provider/common/common').estimateGas
const hexRegex = /^[0-9A-Fa-f]+$/g

// handles the following RPC methods:
//   eth_accounts
//   eth_sendTransaction
//   eth_sign
//   eth_signTypedData
//   personal_sign

class HardwareWalletProvider extends ModuleInterface {
  constructor (walletProvider) {
    super()
    // control flow
    this.nonceLock = Semaphore(1)

    if (this.confirmMethodsArePresent(walletProvider)) {
      this.walletProvider = walletProvider
    } else if (Reflect.has(walletProvider, 'signPersonalMessage')) {
      this.walletProvider = walletProvider
      this.walletProvider.signMessage = walletProvider.signPersonalMessage
    }
    // data lookup
  }

  // this could be moved to mewCore (Wallet provider gets set when type is selected)
  // NOTE: NEED TO THINK ABOUT THIS
  setActiveWallet(activeWallet){
    if (this.confirmMethodsArePresent(activeWallet)) {
      this.walletProvider = activeWallet
    } else if (Reflect.has(activeWallet, 'signPersonalMessage')) {
      this.walletProvider = activeWallet
      this.walletProvider.signMessage = activeWallet.signPersonalMessage
    }
  }

  confirmMethodsArePresent (walletProvider) {
    return (
      Reflect.has(walletProvider, 'signTransaction') &&
    Reflect.has(walletProvider, 'getAccounts') &&
    Reflect.has(walletProvider, 'signMessage'))
  }

  handleRequest (payload, next, end) {
    // switch statement is not block scoped  so we cant repeat var declarations
    let txParams, msgParams, extraParams
    let message, address

    switch (payload.method) {
      // LET FALL THROUGH
      // case 'eth_coinbase':
      //   return

      case 'eth_accounts':
        // process normally
        this.walletProvider.getAccounts((err, accounts) => {
          if (err) return end(err)
          end(null, accounts)
        })
        return

      // case 'eth_sendTransaction':
      //   txParams = payload.params[0]
      //   return

      case 'eth_signTransaction':
        if (payload.txData) {
          txParams = payload.txData
        } else {
          txParams = payload.params[0]
        }

        this.walletProvider.signTransaction(txParams, end)
        return

      case 'eth_sign':
      case 'personal_sign':
      case 'eth_signTypedData':
        // process normally
        const first = payload.params[0]
        const second = payload.params[1]
        console.log(payload) // todo remove dev item
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
          message = payload.params[1]
          address = payload.params[0]
        }

        // non-standard "extraParams" to be appended to our "msgParams" obj
        // good place for metadata
        extraParams = payload.params[2] || {}

        if (!resemblesData(message)) {
          message = Buffer.from(message).toString('hex')
        }

        msgParams = Object.assign(extraParams, {
          from: address,
          data: message
        })
        console.log(msgParams) // todo remove dev item
        this.walletProvider.signMessage(msgParams, end)
        return

      default:
        next()
    }
  }
}

// function toLowerCase (string) {
//   return string.toLowerCase()
// }

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

module.exports = HardwareWalletProvider
