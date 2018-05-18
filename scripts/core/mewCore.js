const MewEngine = require('../provider/mewEngine')
const HardwareWalletProvider = require('../provider/modules/hardwareWalletProvider')
const Web3 = require('web3')

function MewCore() {
}

MewCore.init = function (options) {
  this.mewEngine = this.setupProviders(options.providers)
  this.addHardwareWallets(options.hardwareWallets)
  this.mewEngine.setNetwork(options.network)
  this.mewEngine.setTransport(options.transport)
  this.web3 = new Web3(this.mewEngine)
  if(options.web3Extensions){
    if(Array.isArray(options.web3Extensions)){
      for(let i=0; i<options.web3Extensions.length; i++){
        this.web3Extend(options.web3Extensions[i])
      }
    }
  }
  return this
}

MewCore.setupProviders = function (providersArray = []) {
  const mewEngine = new MewEngine()
  for (let i = 0; i < providersArray.length; i++) {
    if (Reflect.has(providersArray[i], 'method')) {
      mewEngine.addProvider(providersArray[i], providersArray[i].method)
    } else {
      mewEngine.addProvider(providersArray[i])
    }
  }
  return mewEngine
}

MewCore.addHardwareWallets = function (hardwareWallets) {
  if(!hardwareWallets) return
  for (let i = 0; i < hardwareWallets.length; i++) {
    this.walletAcess = hardwareWallets[i] // expose wallet on MewCore
    this.mewEngine.addProvider(new HardwareWalletProvider(hardwareWallets[i]))
  }
}

// Some How this MUST NOT BE PUBLICLY ACCESSIBLE (must be limited in scope)
MewCore.addOperation = function (name, operator) {
  Object.defineProperty(this, name, {
    value: operator,
    writable: false
  })
}

MewCore.web3Extend = function (item) {
  if(Reflect.has(item, 'provider') && Reflect.has(item, 'method') && Reflect.has(item, 'methodName')){
    // console.log("item.provider", item.provider); // todo remove dev item
    // let newProvider = item.providerOptions ? new item.provider() : new item.provider(item.providerOptions)
    this.mewEngine.addProvider(item.provider)
    this.web3.extend({
      methods: [
        {
          name: item.methodName,
          call: item.method,
          params: item.paramCount ? item.paramCount : 0
        }
      ]
    })
  }

}

//
// MewCore.web3Extend = function (item) {
//   this.web3.extend({
//     methods: [
//       {
//         name: 'generateTransaction',
//         call: 'generate_transaction',
//         params: 2
//       },
//       // {
//       //   name: 'directCall',
//       //   call: 'eth_callForFun',
//       // },
//       // {
//       //   name: 'directCall',
//       //   call: 'eth_callForFun',
//       // },
//       // {
//       //   name: 'directCall',
//       //   call: 'eth_callForFun',
//       // },
//       // {
//       //   name: 'directCall',
//       //   call: 'eth_callForFun',
//       // },
//       // {
//       //   name: 'directCall',
//       //   call: 'eth_callForFun',
//       // }
//     ]
//   })
// }

module.exports = MewCore;