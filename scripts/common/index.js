
const common = require('./common')
const commonRequires = require('./commonRequires')
const signUtils = require('./signUtils')
const ethFuncs = require('./ethFuncs')
const ethUnits = require('./etherUnits')
const validation = require('./validation')
const ens = require('./ens')

module.exports = {
  ...ethUnits,
  ...ethFuncs,
  ...common,
  ...commonRequires,
  ...signUtils,
  validation,
  ens
}
// module.exports = {
//   createRandomId: common.createRandomId,
//   createPayload: common.createPayload,
//   ethUtil: commonRequires.ethUtil,
//   web3Util: commonRequires.web3Util,
//   tx: commonRequires.tx,
//   ethAbi: commonRequires.abi,
//   concatSig: signUtils.concatSig,
//   normalize: signUtils.normalize,
//   personalSign: signUtils.personalSign,
//   recoverPersonalSignature: signUtils.recoverPersonalSignature,
//   extractPublicKey: signUtils.extractPublicKey,
//   signTypedData: signUtils.signTypedData,
//   recoverTypedSignature: signUtils.recoverTypedSignature
// }
