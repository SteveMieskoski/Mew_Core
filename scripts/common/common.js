const ethUtil = require('./commonRequires').ethUtil
const ethCrypto = require('./commonRequires').crypto

module.exports = {
  createRandomId,
  createPayload,
  estimateGas,
  stripHexPrefix,
  isStrongPass,
  hexToAscii,
  isAlphaNumeric,
  getRandomBytes
}

function createRandomId () {
  // 13 time digits
  var datePart = new Date().getTime() * Math.pow(10, 3)
  // 3 random digits
  var extraPart = Math.floor(Math.random() * Math.pow(10, 3))
  // 16 digits
  return datePart + extraPart
}

function estimateGas (provider, txParams, cb) {
  provider.sendAsync(createPayload({
    method: 'eth_estimateGas',
    params: [txParams]
  }), function (err, res) {
    if (err) {
      // handle simple value transfer case
      if (err.message === 'no contract code at given address') {
        return cb(null, '0xcf08')
      } else {
        return cb(err)
      }
    }
    cb(null, res.result)
  })
}

// breaking here if data is an array
function createPayload (data) {
  if(Array.isArray(data)){
    let arrayPayload = data.map(_element => Object.assign({
      // defaults
      id: _element.id ? _element.id : createRandomId(),
      jsonrpc: '2.0',
      params: []
      // user-specified
    }, _element))
    // console.log("arrayPayload", arrayPayload); // todo remove dev item
    return arrayPayload
  } else {
    return Object.assign({
      // defaults
      id: data.id ? data.id : createRandomId(),
      jsonrpc: '2.0',
      params: []
      // user-specified
    }, data)
  }

}

/**
 * Removes '0x' from a given `String` if present
 * @param {String} str the string value
 * @return {String|Optional} a string by pass if necessary
 */
function stripHexPrefix (str) {
  if (typeof str !== 'string') {
    return str
  }

  return str.slice(0, 2) === '0x' ? str.slice(2) : str
}

function isStrongPass (password) {
  return password.length > 8
}

function hexToAscii (hex) {
  return hex.match(/.{1,2}/g).map(function (v) {
    return String.fromCharCode(parseInt(v, 16))
  }).join('')
}

function isAlphaNumeric (value) {
  return !/[^a-zA-Z0-9]/.test(value)
}

function getRandomBytes (num) {
  return ethCrypto.randomBytes(num)
}
