// wallet interface to show expected API methods
const ModuleInterface = require('scripts/provider/modules/moduleInterface.js')
class WalletInterface {
  constructor (options) {
    // this.askForOnDeviceConfirmation = askForOnDeviceConfirmation
    // this.getNetworkId = getNetworkId
    // this.isU2FSupported = null
    // this.connectionOpened = false
    // this.getAppConfig = this.getAppConfig.bind(this)
    // this.getAccounts = this.getAccounts.bind(this)
    // this.getMultipleAccounts = this.getMultipleAccounts.bind(this)
    // this.signTransaction = this.signTransaction.bind(this)
    // this.signPersonalMessage = this.signPersonalMessage.bind(this)
    // this.getConnection = this.getConnection.bind(this)
    // this.setDerivationPath = this.setDerivationPath.bind(this)
    // this.setDerivationPath(path)
  }

  changeNetwork (networkId, path) {
    throw Object.create({message: 'ERROR: changeNetwork NOT IMPLEMENTED'})
  }
  // getTransport () {
  //   throw Object.create({message: 'ERROR: getAppConfig NOT IMPLEMENTED'})
  // }
  // getAppConfig () {
  //   throw Object.create({message: 'ERROR: getAppConfig NOT IMPLEMENTED'})
  // }
  getAccounts (callback) {
    throw Object.create({message: 'ERROR: getAccounts NOT IMPLEMENTED'})
  }

  getMultipleAccounts (count, offset, callback) {
    throw Object.create({message: 'ERROR: getMultipleAccounts NOT IMPLEMENTED'})
  }

  signTransaction (txData, callback) {
    throw Object.create({message: 'ERROR: signTransaction NOT IMPLEMENTED'})
  }

  // getConnection () {
  //   throw Object.create({message: 'ERROR: getConnection NOT IMPLEMENTED'})
  // }

  signMessage (txData, callback) {
    throw Object.create({message: 'ERROR: signPersonalMessage NOT IMPLEMENTED'})
  }

  // setDerivationPath () {
  //   throw Object.create({message: 'ERROR: setDerivationPath NOT IMPLEMENTED'})
  // }
}

module.exports = WalletInterface
