const ModuleInterface = require('../../scripts/provider/modules/moduleInterface')
var chai = require('chai');
var assert = chai.assert;

class FakeHttpProvider {
  constructor(staticResponses){
    this.staticResponses = staticResponses || {}
    this.countId = 1;
    this.response = [];
    this.error = [];
    this.validation = [];
  }

  setNetwork(details){
    this.host = details.SERVERURL
    this.user = details.user
    this.password = details.password
    this.headers = details.headers
  }

  getResponseStub(payload){
    var staticResponse = this.staticResponses[payload.method]
    // async function
    if (typeof staticResponse === 'function') {
      staticResponse(payload)
      // static response - null is valid response
    } else if (staticResponse !== undefined) {
      // return result asynchronously
      return {
        jsonrpc: '2.0',
        id: this.countId,
        result: staticResponse
      }
      // no prepared response - skip
    } else {
      return {
        jsonrpc: '2.0',
        id: this.countId,
        result: payload.params //null
      }
    }
  }

  getErrorStub(){
   return {
     jsonrpc: '2.0',
     id: this.countId,
     error: {
       code: 1234,
       message: 'Stub error'
     }
   }
  }


  // handleRequest(payload, next, end) {
  //   switch (payload.method) {
  //     case 'eth_sendTransaction':
  //     case 'eth_sendRawTransaction':
  //       this.sendAsync(payload, end)
  //       break;
  //     default:
  //       next();
  //       return;
  //   }
  // }

  isObject(value){
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  sendAsync (payload, callback) {
    if (payload.id) {
      this.countId = payload.id;
    }

    assert.equal(Array.isArray(payload) || this.isObject(payload), true);
    assert.equal(typeof callback === "function", true);

    const validation = this.validation.shift();

    if (validation) {
      // imitate plain json object
      validation(JSON.parse(JSON.stringify(payload)), callback);
    }

    const response = this.getResponseOrError('response', payload);
    const error = this.getResponseOrError('error', payload);

    setTimeout(() => {
      callback(error, response);
    }, 1);
  }

  getResponseOrError(type, payload) {
    let response;

    if (type === 'error') {
      response = this.error.shift();
    } else {
      response = /*this.response.shift() || */this.getResponseStub(payload);
    }
console.log("\n\ngetResponseOrError", payload); // todo remove dev item
    if (response) {
      if (Array.isArray(response)) {
        response = response.map((resp, index) => {
          // eslint-disable-next-line no-param-reassign
          resp.id = payload[index]
            ? payload[index].id
            : this.countId++;

          return resp;
        });
      } else {
        response.id = payload.id;
      }
    }

    return response;
  }

  injectBatchResults (results, error) {
    this.response.push(results.map((r) => {
      let response;
      if (error) {
        response = this.getErrorStub();
        response.error.message = r;
      } else {
        response = this.getResponseStub();
        response.result = r;
      }

      return response;
    }));
  }

  injectResult (result) {
    const response = this.getResponseStub();
    response.result = result;

    this.response.push(response);
  }

  injectError (error)  {
    const errorStub = this.getErrorStub();
    errorStub.error = error;

    this.error.push(errorStub);
  }

  injectValidation (callback) {
    this.validation.push(callback);
  }
}

module.exports = FakeHttpProvider