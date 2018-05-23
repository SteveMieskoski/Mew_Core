/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @file httpprovider.js
 * @authors:
 *   Marek Kotewicz <marek@ethdev.com>
 *   Marian Oancea <marian@ethdev.com>
 *   Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

// var errors = require('./errors');
const ModuleInterface = require('./moduleInterface')
const allowableCheck = require('./allowableCheck')

// workaround to use httpprovider in different envs

// browser
if (typeof window !== 'undefined' && window.XMLHttpRequest) {
// eslint-disable-next-line no-global-assign
  XMLHttpRequest = window.XMLHttpRequest // jshint ignore: line
// node
} else {
// eslint-disable-next-line no-global-assign
  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest // jshint ignore: line
}

var XHR2 = require('xhr2') // jshint ignore: line

class HttpTransport extends ModuleInterface {
  /**
   * HttpProvider should be used to send rpc calls over http
   */
  constructor(host, timeout, user, password, headers) {
    super()
    this.network = {
      host: host || 'http://localhost:7545',
      timeout: timeout || 0,
      user: user,
      password: password,
      headers: headers
    }
    this.host = this.network.host
    this.timeout = this.network.timeout || 0
    this.user = this.network.user
    this.password = this.network.password
    this.headers = this.network.headers
  }

  handleRequest(payload, next, end) {
    console.log("handleRequest", payload); // todo remove dev item
    switch (payload.method) {
      case 'eth_sendTransaction':
      case 'eth_sendRawTransaction':
        this.sendAsync(payload, end)
        break
      default:
        if (allowableCheck(payload, "safeExternal")) {
          this.sendAsync(payload, end)
        } else {
          next()
        }
    }
  }

  setNetwork(details) {
    this.network = Object.assign(this.network, details);
    // this.host = details.SERVERURL
    // this.user = details.user
    // this.password = details.password
    // this.headers = details.headers
  }

  /**
   * Should be called to prepare new XMLHttpRequest
   *
   * @method prepareRequest
   * @param {Boolean} true if request should be async
   * @return {XMLHttpRequest} object
   */
  prepareRequest(async) {
    var request

    if (async) {
      request = new XHR2()
      request.timeout = this.timeout
    } else {
      request = new XMLHttpRequest()
    }

    request.open('POST', this.host, async)
    if (this.user && this.password) {
      let auth = 'Basic ' + new Buffer(this.user + ':' + this.password).toString('base64')
      request.setRequestHeader('Authorization', auth)
    }
    request.setRequestHeader('Content-Type', 'application/json')
    if (this.headers) {
      this.headers.forEach(function (header) {
        request.setRequestHeader(header.name, header.value)
      })
    }
    return request
  };

  /**
   * Should be called to make sync request
   *
   * @method send
   * @param {Object} payload
   * @return {Object} result
   */
  send(payload) {
    var request = this.prepareRequest(false)

    try {
      request.send(JSON.stringify(payload))
    } catch (error) {
      console.error('InvalidConnection:', this.host) // todo remove dev item
      console.error(error) // todo remove dev item

      // throw errors.InvalidConnection(this.host);
    }

    var result = request.responseText

    try {
      result = JSON.parse(result)
    } catch (e) {
      console.error('InvalidResponse:', request.responseText) // todo remove dev item

      console.error(e) // todo remove dev item
      // throw errors.InvalidResponse(request.responseText);
    }

    return result
  };

  /**
   * Should be used to make async request
   *
   * @method sendAsync
   * @param {Object} payload
   * @param {Function} callback triggered on end with (err, result)
   */
  sendAsync(payload, callback) {
    var request = this.prepareRequest(true)
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.timeout !== 1) {
        var result = request.responseText
        var error = null

        try {
          if(typeof result === 'string' && result !== ""){
            result = JSON.parse(result)
          }

        } catch (e) {
          console.error('InvalidResponse:', request.responseText) // todo remove dev item

          console.error(e) // todo remove dev item
          error = request.responseText
        }

        callback(error, result)
      }
    }

    request.ontimeout = function () {
      callback(this.timeout)
    }

    try {
      request.send(JSON.stringify(payload))
    } catch (error) {
      callback(this.host)
    }
  };

  /**
   * Synchronously tries to make Http request
   *
   * @method isConnected
   * @return {Boolean} returns true if request haven't failed. Otherwise false
   */
  isConnected() {
    try {
      this.send({
        id: 9999999999,
        jsonrpc: '2.0',
        method: 'net_listening',
        params: []
      })
      return true
    } catch (e) {
      return false
    }
  };
}

module.exports = HttpTransport
