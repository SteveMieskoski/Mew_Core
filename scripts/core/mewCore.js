const MewEngine = require('../provider/mewEngine')
const HardwareWalletProvider = require('../provider/modules/WalletWrapper')
const Web3 = require('web3')

function MewCore() {
  this.walletSet = false;
  this.engineOptions = {};
}

MewCore.init = function (options) {
  this.mewEngine = this.setupProviders(options.providers)
  if(options.wallet) this.addHardwareWallet(options.wallet)
  if(options.engineOptions) this.engineOptions = options.engineOptions
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
  this.engine = this.mewEngine; // alias for mewEngine
  this.mewEngine.start(); // just emits 'block' to emulate provider-engine because some of their providers expect this to begin operation
  return this
}



MewCore.setupProviders = function (providersArray = []) {
  const mewEngine = new MewEngine(this.engineOptions)
  for (let i = 0; i < providersArray.length; i++) {
    if (Reflect.has(providersArray[i], 'method')) {
      mewEngine.addProvider(providersArray[i], providersArray[i].method)
    } else {
      if(providersArray[i].constructor.name === "HookedWalletSubprovider"){
        this.walletSet = true;
      }
      mewEngine.addProvider(providersArray[i])
    }
  }
  return mewEngine
}

MewCore.addHardwareWallet = function (Wallet) {
  if(!Wallet) return
  if(this.walletSet){
    console.warn( "A wallet provider already exists.  Multiple wallet providers can cause unexpected behavior")
  }
  this.walletAcess = Wallet // expose wallet on MewCore
  if(Wallet.constructor.name === "HookedWalletSubprovider"){
    this.mewEngine.addProvider(Wallet)
    console.warn("Provider Engine HookedWalletSubprovider Based providers SHOULD be added via the providers array")
    // throw "Provider Engine HookedWalletSubprovider Based providers MUST be added via the providers array"
  } else {
    this.mewEngine.addProvider(new HardwareWalletProvider(Wallet))
  }
}

MewCore.replaceWallet = function (hardwareWallet) {
  if(!hardwareWallet) return
  this.walletAcess = hardwareWallet // expose wallet on MewCore
  this.mewEngine.setNewWalletProvider(new HardwareWalletProvider(hardwareWallet))
}

// Some How this MUST NOT BE PUBLICLY ACCESSIBLE (must be limited in scope)
MewCore.addOperation = function (name, operator) {
  Object.defineProperty(this, name, {
    value: operator,
    writable: false
  })
}

MewCore.web3Extend = function (item) {
  if(!item) return;
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