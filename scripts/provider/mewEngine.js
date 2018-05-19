const MewDefaults = require('./modules/mewDefaults')
const allowableCheck = require('./modules/allowableCheck')
const eachSeries = require('async/eachSeries')
const asyncMap = require('async/map')
const HardwareWalletProvider = require('../provider/modules/hardwareWalletProvider')


class MewEngine extends MewDefaults {
  constructor () {
    super()
    this.receivedMethods = []; // todo remove dev item
    this._providers = {all: []}
  }

  addProvider (provider, method) {
    if(!provider) throw "No Provider Supplied"
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

  setTransport (transport) {
    this.transport = transport
    this.transport.setNetwork(this.network)
  }

  setNewWalletProvider(walletProvider){
    console.log(this._providers.all.length); // todo remove dev item
    for(let i=0; i<this._providers.all.length; i++){
      if(Reflect.has(this._providers.all[i], "thisIsWalletProvider")){
        this._providers.all[i] = walletProvider
        break;
      }
    }
  }

  setNetwork (networkDetails) {
    let createConfig = (_serverUrl, port, httpBasicAuthentication) => {
      this.network.SERVERURL = port ? _serverUrl + ':' + port : _serverUrl;
      if (httpBasicAuthentication) {
        this.network.headers['Authorization'] = 'Basic ' + btoa(httpBasicAuthentication.user + ":" + httpBasicAuthentication.password);
      }
    }
    this.network = networkDetails ? networkDetails : this.networkDefaults
    createConfig(this.network.serverUrl, this.network.port, this.network.httpBasicAuthentication)
    if(!this.transport.notPresent) this.transport.setNetwork(this.network)
  }

  send (payload) {
    try {
      // let value;
      if (allowableCheck(payload.method) > -1) {
        return this.transport.send(payload) // could replace this with a provider that catches the 'send' methods (but then fallthrough wouldn't work)
      } else {
        throw new Error('Web3ProviderEngine does not support synchronous requests.')
      }
    } catch (e) {
      console.error(e)
    }
    //
  }

  async sendAsync (payload, cb) {
    // if (allowableCheck(payload.method) > -1) {
      if (Array.isArray(payload)) {
        // handle batch
        console.log("\n\nhandle batch", payload); // todo remove dev item

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

  _handleAsync (payload, finished) {
    var _this = this
    var currentProvider = {all: -1}
    if (this._providers[payload.method]) {
      currentProvider[payload.method] = -1
    }
    console.log("\n_handleAsync", payload); // todo remove dev item
    var result = null
    var error = null

    var stack = []

    let end = (_error, _result) => {
      error = _error
      result = _result

      eachSeries(stack, function (fn, callback) {
        if (fn) {
          fn(error, result, callback)
        } else {
          callback()
        }
      }, function () {
        // console.log('COMPLETED:', payload)
        // console.log('RESULT: ', result)

        var resultObj = {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: result
        }
        // console.log("resultObj 1", resultObj); // todo remove dev item
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
console.log("\n\nthis.receivedMethods", _this.receivedMethods); // todo remove dev item
        if (error != null) {
          resultObj.error = {
            message: error.stack || error.message || error,
            code: -32000
          }
          // respond with both error formats
          finished(error, resultObj)
        } else {
          // console.log("\nmewEngine:139 resultObj", resultObj); // todo remove dev item
          finished(null, resultObj)
        }
      })
    }

    let next = (after) => {
      if (currentProvider[payload.method]) {
        currentProvider[payload.method] += 1
      } else {
        currentProvider.all += 1
      }
      this.receivedMethods.push(payload.method)
      stack.unshift(after)

      // Bubbled down as far as we could go, and the request wasn't
      // handled. Return an error.
      var provider
      if (this._providers[payload.method]) {
        if (currentProvider[payload.method] >= _this._providers[payload.method].length) {
          if (allowableCheck(payload.method) > -1) {
            console.log("engine transport", payload); // todo remove dev item
            this.transport.sendAsync(payload, end)
          } else {
            end(new Error('Request for method "' + payload.method + '" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'))
          }
        } else {
          try {
            // console.log("engine transport", payload); // todo remove dev item
            // console.log(currentProvider) // todo remove dev item
            provider = _this._providers[payload.method][currentProvider[payload.method]]
            provider.handleRequest(payload, next, end)
          } catch (e) {
            end(e)
          }
        }
      } else {
        if (currentProvider.all >= _this._providers.all.length) {
          if (allowableCheck(payload.method) > -1) {
            console.log("engine transport", payload); // todo remove dev item
            this.transport.sendAsync(payload, end)
          } else {
            end(new Error('Request for method "' + payload.method + '" not handled by any subprovider. Please check your subprovider configuration to ensure this method is handled.'))
          }
        } else {
          try {
            provider = _this._providers.all[currentProvider.all]
            provider.handleRequest(payload, next, end)
          } catch (e) {
            end(e)
          }
        }
      }
    }

    next()
  }
}

module.exports = MewEngine
