let fileContent = {
  version: 3,
  id: '04e9bcbb-96fa-497b-94d1-14df4cd20af6',
  address: '2c7536e3605d9c16a7a3d7b1898e529396a65c23',
  crypto: {
    ciphertext: 'a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251',
    cipherparams: {iv: '2885df2b63f7ef247d753c82fa20038a'},
    cipher: 'aes-128-ctr',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      salt: '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
      n: 262144,
      r: 8,
      p: 1
    },
    mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6'
  }
}


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
// content portion must be an array
let result = mewcore.web3.eth.accounts.wallet.decrypt([fileContent], 'test!')
// console.log("currentProvider", mewcore.web3.currentProvider); // todo remove dev item
console.log("decrypt result", result); // todo remove dev item
// mewcore.web3.eth.accounts.wallet.add(result);
mewcore.web3.eth.getAccounts()
  .then(_result => {
    console.log("\nTEST\n_result", _result); // todo remove dev item
    return _result[0]
  })
  .catch(_error => {
    console.log("error", _error); // todo remove dev item
  })


/*
mewcore.web3.eth.getAccounts()
  .then(_result => {
    console.log("\nTEST\n_result", _result); // todo remove dev item
    return _result[0]
  })
  .then(_account =>{
    console.log(_account); // todo remove dev item
    mewcore.web3.eth.sign("Hello world", _account)
      .then(signed =>{
        console.log(signed); // todo remove dev item
        mewcore.web3.eth.signTransaction({
          from: _account,
          gasPrice: "20000000000",
          gas: "21000",
          to: '0x3535353535353535353535353535353535353535',
          value: "1000000000000000000",
          data: ""
        }).then(console.log);
      });

    return mewcore.web3.eth.getBalance(_account)
  })
  .then(_balance => {
    console.log(_balance); // todo remove dev item
  })
  .catch(_error => {
    console.log("error", _error); // todo remove dev item
  })
*/


// .then(_result => {
  //   console.log("\nTEST\n_result", _result); // todo remove dev item
  // })
  // .catch(_error => {
  //   console.log("error", _error); // todo remove dev item
  // })
