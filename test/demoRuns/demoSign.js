const MewCore = require('../../scripts/core/index')
const demoSignConfig = require('./demoSignConfig')


const mewcore = MewCore.init(demoSignConfig)

mewcore.web3.eth.getAccounts()
  .then(_result => {
    console.log("\nTEST\n_result", _result); // todo remove dev item
    return _result[0]
  })
  .catch(_error => {
    console.log("error", _error); // todo remove dev item
  })


mewcore.walletAcess.getMultipleAccounts()
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



// let signedMessage = '0x5b2cb93f70da5a0c5af712759f2343391496194a443e3a773c7aa02127c42a6e357ae83e3a7b63936f3b4757b1a8f5cf4274a53b3286dc84eb4b1023e97a24ba00'
// let signedTransaction = '0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a03539f59efe39c10ddaafcefdeb5a4116017303fe7eaf53c853495b9ffa3ae0c5a00c9b17875d6056551b84654370ffe516022466c405641050cd42338c4cf25ba2'
