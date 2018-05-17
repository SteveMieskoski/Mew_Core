const MewCore = require('../../scripts/core/index')

const config = require("./extendedMethodsConfig")
const mewcore = MewCore.init(config)

let address = new Buffer('1234362ef32bcd26d3dd18ca749378213625ba0b', 'hex')
let addressHex = '0x42E1f52bdfE4475064dF1b92542e3f8aCA931ebc' //'0x' + address.toString('hex')

let txParams = {
  from: addressHex,
  to: addressHex,
  value: '1',
  gas: '0x1234567890',
};
console.log(mewcore.web3.currentProvider); // todo remove dev item
mewcore.web3.generateTransaction(txParams)
  .then(_result => {
    console.log("\nTEST\n_result", _result); // todo remove dev item
  })
  .catch(_error => {
    console.log("error", _error); // todo remove dev item
  })
