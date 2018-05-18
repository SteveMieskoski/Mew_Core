const ethFuncs = require('./ethFuncs')
const common = require('./common')
const WAValidator = require('./commonRequires').WAValidator
const bip39 = require('./commonRequires').bip39
const ens = require('./ens')

module.exports = {
  isValidAddress,
  isChecksumAddress,
  isValidENSorEtherAddress,
  isValidSubName,
  isValidENSName,
  isValidTxHash,
  isValidENSAddress,
  isValidBTCAddress,
  isPositiveNumber,
  isValidHex,
  isValidPrivKey,
  isValidMnemonic,
  isPasswordLenValid,
  isAlphaNumeric,
  isAlphaNumericSpace,
  isJSON,
  isValidURL
}

function isValidAddress(address) {
  if (address && address == "0x0000000000000000000000000000000000000000") return false;
  if (address)
    return ethFuncs.validateEtherAddress(address);
  return false;
}
function isChecksumAddress(address) {
  return ethFuncs.isChecksumAddress(address);
}
function isValidENSorEtherAddress(address) {
  return (isValidAddress(address) || isValidENSAddress(address));
}
function isValidSubName(str) {
  try {
    return (str.length > 0 && ens.normalise(str) != '' && str.substring(0, 2) != '0x');
  } catch (e) {
    return false;
  }
}
function isValidENSName(str) {
  try {
    return (str.length > 6 && ens.normalise(str) != '' && str.substring(0, 2) != '0x');
  } catch (e) {
    return false;
  }
}
function isValidTxHash(txHash) {
  return txHash.substring(0, 2) == "0x" && txHash.length == 66 && isValidHex(txHash);
}
function isValidENSAddress(address) {
  address = ens.normalise(address);
  return address.lastIndexOf(".") != -1;
}
function isValidBTCAddress(address) {
  return WAValidator.validate(address, 'BTC');
}
function isPositiveNumber(value) {
  return common.isNumeric(value) && parseFloat(value) >= 0;
}
function isValidHex(hex) {
  return ethFuncs.validateHexString(hex);
}
function isValidPrivKey(privkeyLen) {
  return privkeyLen == 64 || privkeyLen == 66 || privkeyLen == 128 || privkeyLen == 132;
}
function isValidMnemonic(mnemonic) {
  return bip39.validateMnemonic(mnemonic);
}
function isPasswordLenValid(pass, len) {
  if (pass === 'undefined' || pass == null) return false;
  return pass.length > len;
}
function isAlphaNumeric(value) {
  return common.isAlphaNumeric(value);
}
function isAlphaNumericSpace(value) {
  if (!value) return false;
  return common.isAlphaNumeric(value.replace(/ /g, ''));
}
function isJSON(json) {
  try {
    return !!JSON.parse(json);
  } catch (e) {
    return false;
  }
}
function isValidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}