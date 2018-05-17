const ethUtil = require('./commonRequires').ethUtil
const BigNumber = require('./commonRequires').bigNumber
const ethFuncs = require('./ethFuncs')
const etherUnits = require('./etherUnits')
const gasAdjustment = 40;

module.exports = {
  validateEtherAddress,
  isChecksumAddress,
  validateHexString,
  sanitizeHex,
  trimHexZero,
  padLeftEven,
  addTinyMoreToGas,
  decimalToHex,
  hexToDecimal,
  contractOutToArray,
  getNakedAddress,
  getDeteministicContractAddress,
  padLeft,
  getDataObj,
  getFunctionSignature,
  estimateGas,
  gasAdjustment: gasAdjustment
}

// ethFuncs.gasAdjustment = 40
function validateEtherAddress (address) {
  if (address.substring(0, 2) !== '0x') return false
  else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false
  else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) return true
  else { return isChecksumAddress(address) }
}
function isChecksumAddress (address) {
  return address === ethUtil.toChecksumAddress(address)
}
function validateHexString (str) {
  if (str === '') return true
  str = str.substring(0, 2) === '0x' ? str.substring(2).toUpperCase() : str.toUpperCase()
  var re = /^[0-9A-F]+$/g
  return re.test(str)
}
function sanitizeHex (hex) {
  hex = hex.substring(0, 2) === '0x' ? hex.substring(2) : hex
  if (hex === '') return ''
  return '0x' + padLeftEven(hex)
}
function trimHexZero (hex) {
  if (hex === '0x00' || hex === '0x0') return '0x0'
  hex = sanitizeHex(hex)
  hex = hex.substring(2).replace(/^0+/, '')
  return '0x' + hex
}
function padLeftEven (hex) {
  hex = hex.length % 2 !== 0 ? '0' + hex : hex
  return hex
}
function addTinyMoreToGas (hex) {
  hex = sanitizeHex(hex)
  console.log(hex); // todo remove dev item
  return new BigNumber(gasAdjustment * etherUnits.getValueOfUnit('gwei')).toString(16)
}
function decimalToHex (dec) {
  return new BigNumber(dec).toString(16)
}
function hexToDecimal (hex) {
  return new BigNumber(sanitizeHex(hex)).toString()
}
function contractOutToArray (hex) {
  hex = hex.replace('0x', '').match(/.{64}/g)
  for (var i = 0; i < hex.length; i++) {
    hex[i] = hex[i].replace(/^0+/, '')
    hex[i] = hex[i] === '' ? '0' : hex[i]
  }
  return hex
}
function getNakedAddress (address) {
  return address.toLowerCase().replace('0x', '')
}
function getDeteministicContractAddress (address, nonce) {
  nonce = new BigNumber(nonce).toString()
  address = address.substring(0, 2) === '0x' ? address : '0x' + address
  return '0x' + ethUtil.generateAddress(address, nonce).toString('hex')
}
function padLeft (n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
function getDataObj (to, func, arrVals) {
  var val = ''
  for (var i = 0; i < arrVals.length; i++) val += padLeft(arrVals[i], 64)
  return {
    to: to,
    data: func + val
  }
}
function getFunctionSignature (name) {
  return ethUtil.sha3(name).toString('hex').slice(0, 8)
};
function estimateGas (dataObj, callback) {
  var adjustGas = function (gasLimit) {
    if (gasLimit === '0x5209') return '21000'
    if (new BigNumber(gasLimit).gt(4000000)) return '-1'
    return new BigNumber(gasLimit).toString()
  }
  // ajaxReq.getEstimatedGas(dataObj, function (data) {
  //   if (data.error) {
  //     callback(data)
  //   } else {
  //     callback({
  //       'error': false,
  //       'msg': '',
  //       'data': adjustGas(data.data)
  //     })
  //   }
  // })
}
