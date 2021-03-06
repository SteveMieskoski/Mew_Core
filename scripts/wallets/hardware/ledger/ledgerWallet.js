/* eslint-disable */
// const WalletInterface = require('../../walletInterface')
const common = require('../../../common')
const stripHexPrefix = common.stripHexPrefix
const EthereumTx = common.tx
const ethUtil = common.ethUtil
const U2fCheck = require('../u2fCheck') // this should be moved up to be common to all or most hw device initial requests
const Ledger = require('@ledgerhq/hw-app-eth').default
const u2fTransport = require('@ledgerhq/hw-transport-u2f').default
const nodeTransport = require('@ledgerhq/hw-transport-node-hid').default
const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)

// const allowedHdPaths = ["44'/60'", "44'/61'"]
const NOT_SUPPORTED_ERROR_MSG =
  'LedgerWallet uses U2F which is not supported by your browser. ' +
  'Use Chrome, Opera or Firefox with a U2F extension.' +
  "Also make sure you're on an HTTPS connection"

/**
 * THE CONNECTION STATUS, STATE, AND ACTIONS ALL OPERATE FROM THE TRANSPORT INSTANCE PASSED TO THE LEDGER APP INTERFACE
 */
class LedgerWallet {
  constructor(opts) {
    // super()
    let options = opts || {}
    this.allowedHdPaths = options.options || ["44'/60'", "44'/61'"]
    this.defaultOptions = {
      networkId: 1, // mainnet
      path: "44'/60'/0'/0", // ledger default derivation path
      askConfirm: false,
      accountsLength: 5,
      accountsOffset: 0
    }

    const currentOptions = {
      ...this.defaultOptions,
      ...options
    }
    this.checkIfAllowedPath(currentOptions.path)

    this.networkId = currentOptions.networkId
    this.path = currentOptions.path
    this.askConfirm = currentOptions.askConfirm
    this.accountsLength = currentOptions.accountsLength
    this.accountsOffset = currentOptions.accountsOffset
    this.addressToPathMap = {}
    this.pathComponents = this.obtainPathComponentsFromDerivationPath(this.path)

    this.isU2FSupported = true
    this.activeConnection = null
    this.accountsRetrieved = false;
    this.connectionOpened = false
    // console.log(this); // todo remove dev item
    this.getAppConfig = this.getAppConfig.bind(this)
    this.getAccounts = this.getAccounts.bind(this)
    this.getMultipleAccounts = this.getMultipleAccounts.bind(this)
    this.signTransaction = this.signTransaction.bind(this)
    this.signMessage = this.signPersonalMessage.bind(this)
    this.changeNetwork = this.changeNetwork.bind(this)
    // this.getLedgerConnection = this.getLedgerConnection.bind(this)
    // this.setDerivationPath = this.setDerivationPath.bind(this)
    // this.setDerivationPath(path)
  }

  changeNetwork(networkId, path) {
    this.networkId = networkId
    this.path = path
  }

  getAccounts(callback) {
    let _this = this;
    if(arguments.length > 1){
      _this.getMultipleAccounts(arguments[0], arguments[1], arguments[2])
    } else {
console.log("CONSOLE.LOG"); // todo remove dev item
      _this._getAccounts()
        .then(res => callback(null, Object.values(res)))
        .catch(err => callback(err, null));
    }
  }

  getMultipleAccounts(count, offset, callback) {
    this._getAccounts(count, offset)
      .then(res => callback(null, Object.values(res)))
      .catch(err => callback(err, null));
  }

  signPersonalMessage (txData, callback)  {
    this._signPersonalMessage(txData)
    .then(res => callback(null, res))
    .catch(err => callback(err, null));
  }

  signTransaction (txData, callback)  {
    this._signTransaction(txData)
    .then(res => callback(null, res))
    .catch(err => callback(err, null));
  }

  checkIfAllowedPath(path){
    if (!this.allowedHdPaths.some(hdPref => path.startsWith(hdPref))) {
      throw this.makeError(
        'Ledger derivation path allowed are ' +
        this.allowedHdPaths.join(', ') +
        '. ' +
        path +
        ' is not supported',
        'InvalidDerivationPath'
      )
    }
  }

  makeError(msg, id) {
    const err = new Error(msg)
    // $FlowFixMe
    err.id = id
    return err
  }

  obtainPathComponentsFromDerivationPath(derivationPath) {
    // check if derivation path follows 44'/60'/x'/n pattern
    const regExp = /^(44'\/(?:1|60|61)'\/\d+'?\/)(\d+)$/
    const matchResult = regExp.exec(derivationPath)
    if (matchResult === null) {
      throw this.makeError(
        "To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ",
        'InvalidDerivationPath'
      )
    }
    return {basePath: matchResult[1], index: parseInt(matchResult[2], 10)}
  }

  async getTransport() {
    if (this.connectionOpened) {
      throw new Error(
        'You can only have one ledger connection active at a time'
      )
    } else {
      this.connectionOpened = true
      // eslint-disable-next-line new-cap
      // return await u2fTransport.create(3000, 3000) // todo uncomment after dev
      return U2fCheck.isNode
        ? await nodeTransport.create(5000)
        : await u2fTransport.create(3000, 3000) // really only need one because it is a web app (node is just for now)
    }
  }

  async _getAccounts(_accountsLength, _accountsOffset) {
    const transport = await this.getTransport()
    try {
      const accountsOffset = _accountsOffset || this.accountsOffset
      const accountsLength = _accountsLength || this.accountsLength
      const eth = new Ledger(transport)
      const addresses = {}
      for (let i = accountsOffset; i < accountsOffset + accountsLength; i++) {
        const path =
          this.pathComponents.basePath + (this.pathComponents.index + i).toString()
        const address = await eth.getAddress(path, this.askConfirm, false)
        addresses[path] = address.address
        this.addressToPathMap[address.address.toLowerCase()] = path
      }

      return addresses
    } finally {
      transport.close()
        .then(() => {this.connectionOpened = false})
        .catch((error) => {throw error})
    }
  }

  async getAppConfig(callback) {
    const transport = await this.getTransport()
    try {
      const eth = new Ledger(transport)
      const appConfig = await eth.getAppConfiguration()
      callback(null, appConfig)
    } catch(e){
      callback(e)
    } finally{
      transport.close()
        .then(() => {this.connectionOpened = false})
        .catch((error) => {throw error})
    }
  }

  async checkIfKnownAddress(data){
    // await this._getAccounts()
    let path;
    if (!this.accountsRetrieved){
      await this._getAccounts()
      path = this.addressToPathMap[data.from.toLowerCase()]
      if(!path) throw new Error("address unknown '" + data.from + "'")
      return path
    } else {
      path = this.addressToPathMap[data.from.toLowerCase()]
      if(!path) throw new Error("address unknown '" + data.from + "'")
      return path
    }
  }

  async _signPersonalMessage(msgData) {
    const path = await this.checkIfKnownAddress(msgData)
    console.log(path); // todo remove dev item
    const transport = await this.getTransport()
    try {
      const eth = new Ledger(transport)
      const result = await eth.signPersonalMessage(
        path,
        stripHexPrefix(msgData.data)
      )
      const v = parseInt(result.v, 10) - 27
      let vHex = v.toString(16)
      if (vHex.length < 2) {
        vHex = `0${v}`
      }
      return `0x${result.r}${result.s}${vHex}`
    } finally {
      transport.close()
        .then(() => {this.connectionOpened = false})
        .catch((error) => {throw error})
    }
  }

  async _signTransaction(txData) {
    // const path = this.addressToPathMap[txData.from.toLowerCase()]
    // if (!path) throw new Error("address unknown '" + txData.from + "'")
    const path = await this.checkIfKnownAddress(txData)
    const transport = await this.getTransport()
    try {
      const eth = new Ledger(transport)
      const tx = new EthereumTx(txData)

      // Set the EIP155 bits
      tx.raw[6] = Buffer.from([this.networkId]) // v
      tx.raw[7] = Buffer.from([]) // r
      tx.raw[8] = Buffer.from([]) // s

      // Pass hex-rlp to ledger for signing
      const result = await eth.signTransaction(
        path,
        tx.serialize().toString('hex')
      )

      // Store signature in transaction
      tx.v = Buffer.from(result.v, 'hex')
      tx.r = Buffer.from(result.r, 'hex')
      tx.s = Buffer.from(result.s, 'hex')

      // EIP155: v should be chain_id * 2 + {35, 36}
      const signedChainId = Math.floor((tx.v[0] - 35) / 2)
      const validChainId = this.networkId & 0xff // FIXME this is to fixed a current workaround that app don't support > 0xff
      if (signedChainId !== validChainId) {
        throw this.makeError(
          'Invalid networkId signature returned. Expected: ' +
          this.networkId +
          ', Got: ' +
          signedChainId,
          'InvalidNetworkId'
        )
      }

      return `0x${tx.serialize().toString('hex')}`
    } finally {
      transport.close()
        .then(() => {this.connectionOpened = false})
        .catch((error) => {throw error})
    }
  }
}

module.exports = LedgerWallet
