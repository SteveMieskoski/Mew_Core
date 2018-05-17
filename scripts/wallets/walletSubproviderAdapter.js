const WalletInterface = require('./walletInterface')

class walletSubproviderAdapter {
  constructor (options) {
    // Likely unnecessary to have this else block.
    if (options.getAccounts) self.getAccounts = options.getAccounts
    // high level override
    if (options.processTransaction) self.processTransaction = options.processTransaction
    if (options.processMessage) self.processMessage = options.processMessage
    if (options.processPersonalMessage) self.processPersonalMessage = options.processPersonalMessage
    if (options.processTypedMessage) self.processTypedMessage = options.processTypedMessage
    // approval hooks
    self.approveTransaction = options.approveTransaction // || self.autoApprove
    self.approveMessage = options.approveMessage // || self.autoApprove
    self.approvePersonalMessage = options.approvePersonalMessage // || self.autoApprove
    self.approveTypedMessage = options.approveTypedMessage // || self.autoApprove
    // actually perform the signature
    if (options.signTransaction) self.signTransaction = options.signTransaction // || mustProvideInConstructor('signTransaction')
    if (options.signMessage) self.signMessage = options.signMessage // || mustProvideInConstructor('signMessage')
    if (options.signPersonalMessage) self.signPersonalMessage = options.signPersonalMessage//  || mustProvideInConstructor('signPersonalMessage')
    if (options.signTypedMessage) self.signTypedMessage = options.signTypedMessage // || mustProvideInConstructor('signTypedMessage')
    if (options.recoverPersonalSignature) self.recoverPersonalSignature = options.recoverPersonalSignature
    // publish to network
    if (options.publishTransaction) self.publishTransaction = options.publishTransaction
  }

  handleRequest (payload, next, end) {

  }


}

module.exports = walletSubproviderAdapter
