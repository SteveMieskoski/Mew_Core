const EventEmitter = require('events').EventEmitter


class MewDefaults extends EventEmitter {
  constructor(overRides){
    super()

    this.walletConstructors = [
      "HookedWalletSubprovider",
      "WalletProvider",
      "FromFile",
      "LedgerWallet"
    ]

    this.nodeTypes = {
      ETH: "ETH",
      ETC: "ETC",
      MUS: "MUSIC",
      Ropsten: "ROPSTEN ETH",
      Kovan: "KOVAN ETH",
      Rinkeby: "RINKEBY ETH",
      RSK: "RSK",
      EXP: "EXP",
      UBQ: "UBQ",
      POA: "POA",
      TOMO: "TOMO",
      ELLA: "ELLA",
      ETSC: "ETSC",
      EGEM: "EGEM",
      CLO: "CLO",
      CLOT: "Testnet CLO",
      EAST: "EAST",
      Custom: "CUSTOM ETH"
    };

    // no transport provided catch object OR could be set with a default
    this.transport = {
      notPresent: true,
      send: () => {
        throw "no transport specified for send"
      },
      sendAsync: () => {
        throw "no transport specified for sendAsync"
      }
    }

    this.networkDefaults = {
      'name': 'ETH',
      'blockExplorerTX': 'https://etherscan.io/tx/[[txHash]]',
      'blockExplorerAddr': 'https://etherscan.io/address/[[address]]',
      'type': this.nodeTypes.ETH,
      'eip155': true,
      'chainId': 1,
      'tokenList': [],
      'abiList': [],
      'service': 'myetherapi.com',
      'serverUrl': 'https://api.myetherapi.com/eth',
      'port': ''
    }

  }

}


module.exports = MewDefaults


