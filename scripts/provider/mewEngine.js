const MewDefaults = require('./modules/mewDefaults')
const allowableCheck = require('./modules/allowableCheck')
const eachSeries = require('async/eachSeries')
const asyncMap = require('async/map')
const WalletWrapper = require('./modules/WalletWrapper')


class MewEngine extends MewDefaults {
  constructor(options) {
    super()
    options = options || {};
    this.debugOn = options.debug;
    // else this.debugOn = true;

    this.transportNotPresent = true;
    this.receivedMethods = new Set(); // todo remove dev item
    this.afterFunctions = new Map();
    this._providers = {all: []};
  }

  start() { // just emits 'block' to emulate provider-engine because some of their providers expect this to begin operation
    setTimeout(() => {
      this.emit('block')
    }, 100)
  }

  stop() {

  } // no-op

  addProvider(provider, method) {
    if (!provider) throw "No Provider Supplied"
    if (!method) {
      this._providers.all.push(provider) // these are provided the opportunity to interact with any method
    } else {
      if (this._providers[method]) { // these are provided the opportunity to interact with only one method
        this._providers[method].push(provider)
      } else {
        this._providers[method] = []
        this._providers[method].push(provider)
      }
    }
    provider.setEngine(this)
  }

  setTransport(transport) {
    this.transportNotPresent = false;
    this.transport = transport
    // console.log(this.network); // todo remove dev item
    this.transport.setNetwork(this.network)
  }

  setNewWalletProvider(walletProvider) {
    // console.log(this._providers.all.length); // todo remove dev item
    let newWalletSet = false;
    for (let i = 0; i < this._providers.all.length; i++) {
      if (this.walletConstructors.indexOf(this._providers.all[i].constructor.name) > -1) {
        // console.log("this._providers.all[i].constructor.name", this._providers.all[i].constructor.name); // todo remove dev item
        if (!Reflect.has(walletProvider, "handleRequest")) {
          this._providers.all[i] = new WalletWrapper(walletProvider)
          newWalletSet = true;
          break;
        } else {
          this._providers.all[i] = walletProvider
          newWalletSet = true;
          break;
        }

      }
    }
    if (!newWalletSet) {
      let newWallet;
      if (!Reflect.has(walletProvider, "handleRequest")) {
        // console.log("this._providers.all[i].constructor.name", walletProvider.constructor.name); // todo remove dev item

        newWallet = new WalletWrapper(walletProvider)
      } else {
        newWallet = walletProvider
      }
      this.addProvider(newWallet)
    }
  }

  setNetwork(networkDetails) {
    let createConfig = (_serverUrl, port, httpBasicAuthentication) => {
      let network = {};
      network.SERVERURL = port ? _serverUrl + ':' + port : _serverUrl;
      if (httpBasicAuthentication) {
        network.headers['Authorization'] = 'Basic ' + btoa(httpBasicAuthentication.user + ":" + httpBasicAuthentication.password);
      }
      return network;
    }
    // console.log(this.super.networkDefaults); // todo remove dev item
    // console.log(this.networkDefaults); // todo remove dev item
    this.network = networkDetails || this.networkDefaults
    this.network = Object.assign(this.network, createConfig(this.network.serverUrl, this.network.port, this.network.httpBasicAuthentication))
    if (!this.transportNotPresent) this.transport.setNetwork(this.network)
  }

  send(payload) {
    try {
      // let value;
      if (allowableCheck(payload.method) > -1) {
        this.transportSent(payload, "sync");
        return this.transport.send(payload) // could replace this with a provider that catches the 'send' methods (but then fallthrough wouldn't work)
      } else {
        throw new Error('Web3ProviderEngine does not support synchronous requests.')
      }
    } catch (e) {
      console.error(e)
    }
    //
  }

  async sendAsync(payload, cb) {
    // if (allowableCheck(payload.method) > -1) {
    // console.log("\n--------------------------------\nsendAsync", payload); // todo remove dev item
    this.receivedMethods.add(payload.method)
    // handle batch
    if (Array.isArray(payload)) {
      try {
        asyncMap(payload, this._handleAsync.bind(this), cb)
      } catch (e) {
        cb(e)
      }
    } else {
      // handle single
      this._handleAsync(payload, cb)
    }
    // } else {
    //   throw new Error('Web3ProviderEngine does not support synchronous requests.')
    // }
  }

  _handleAsync(payload, finished) {
    var _this = this
    var currentProvider = {all: -1}
    if (this._providers[payload.method]) {
      currentProvider[payload.method] = -1
    }
    // console.log("\n--------------------------------\n_handleAsync", payload); // todo remove dev item
    var result = null
    var error = null
    this.afterFunctions.clear();
    var stack = []

    let end = (_error, _result) => {
      error = _error
      result = _result
      // console.log("afterFunctions", this.afterFunctions); // todo remove dev item
      // let stack = Array.from(this.afterFunctions.values());
      eachSeries(stack, function (fn, callback) {
        if (fn) {
          fn(error, result, callback)
        } else {
          callback()
        }
      }, function () {
        _this.debugLogging('COMPLETED:', payload)
        _this.debugLogging('RESULT: ', result)
        // _this.afterFunctions.delete(payload.method);
        // _this.receivedMethods.delete(payload.method);

        var resultObj = {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: result
        }
        if (resultObj.result) {
          if (resultObj.result.jsonrpc === '2.0') {
            resultObj = resultObj.result
          } else {
            resultObj = {
              id: payload.id,
              jsonrpc: payload.jsonrpc,
              result: result
            }
          }
        }
// console.log("\n\nthis.receivedMethods", _this.receivedMethods); // todo remove dev item
        if (error != null) {
          resultObj.error = {
            message: error.stack || error.message || error,
            code: -32000
          }
          // respond with both error formats
          // _this.receivedMethods.pop();
          finished(error, resultObj)
        } else {
          // console.log("\n===============================\n finished", resultObj); // todo remove dev item
          // _this.receivedMethods.pop();
          finished(null, resultObj)
        }
      })
    }

    let next = (_after) => {
      let after = _after;
      if (currentProvider[payload.method]) {
        currentProvider[payload.method] += 1
      } else {
        currentProvider.all += 1
      }
      if (_after) {
        // this.debugLogging("after", after); // todo remove dev item
        this.afterFunctions.set(payload.method, _after);
        stack.push(_after);
      }

      // Bubbled down as far as we could go, and the request wasn't
      // handled. Return an error.
      var provider
      if (this._providers[payload.method]) {
        if (currentProvider[payload.method] >= _this._providers[payload.method].length) {
          if (allowableCheck(payload.method) > -1) {
            this.transportSent(payload, "sendAsync:METHOD");
            this.transport.sendAsync(payload, end)
          } else {
            end(new Error('Request for method "' + payload.method + '" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'))
          }
        } else {
          try {
            provider = _this._providers[payload.method][currentProvider[payload.method]]
            provider.handleRequest(payload, next, end)
          } catch (e) {
            console.error(e);
            end(e)
          }
        }
      } else {
        if (currentProvider.all >= _this._providers.all.length) {
          if (allowableCheck(payload.method) > -1) {
            this.transportSent(payload, "sendAsync");
            this.transport.sendAsync(payload, end)
          } else {
            end(new Error('Request for method "' + payload.method + '" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'))
          }
        } else {
          try {
            provider = _this._providers.all[currentProvider.all]
            provider.handleRequest(payload, next, end)
          } catch (e) {
            console.error(e);
            end(e)
          }
        }
      }
    }

    next()
  }


  transportSent(payload, msg) {
    if (this.debugOn) {
      if (msg) {
        console.log("\nTRANSPORT SENT", payload, "\nSENT VIA: ", msg, "\n"); // todo remove dev item

      } else {
        console.log("\nTRANSPORT SENT", payload); // todo remove dev item

      }
    }
  }

  debugLogging(...args) {
    if (this.debugOn) {
      console.log(args); // todo remove dev item
    }
  }
}

module.exports = MewEngine
