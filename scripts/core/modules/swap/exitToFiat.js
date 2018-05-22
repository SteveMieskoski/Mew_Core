const EventEmitter = require('events').EventEmitter
const common = require('../../../common/index');
const request = common.request;

const bityEndPoints = {
  submitPhone: "/api/v2/login/phone",
  submitTan: "/api/v2/login/phone",
  submitOrder: "/api/v2/orders/"
}

class ExitToFiat {
  constructor(/*mewcore*/) {
    // this.mewcore = mewcore;
    this.phone = null;
    this.bityExitUrlBase = "http://localhost:3000" // "https://bity.com"
    this.orders = {}; //new Map();
    this.currentOrder = null;
    this.currentOrderUrl = null;
    // mewcore.web3.eth.getAccounts()
    //   .then(_account => {})
  }

  setSendingAccount(address) {
    this.fromAddress = address;
  }

  // returns a promise
  createOrder(options) {
    // if (!options.payload) {
    //   throw "Error No POST payload supplied";
    // } else if (!options.payload.phone) {
    //   throw "Error No phone number supplied";
    // }
    // this.phone = options.phone;
    let requestOptions = {
      method: 'POST',
      uri: this.bityExitUrlBase + bityEndPoints.submitOrder,
      body: options,
      json: true, // Automatically stringifies the body to JSON
      resolveWithFullResponse: true,
      transform: (body, response, resolveWithFullResponse) => {
        this.currentOrderUrl = response.headers['Location'];
        return body;
      }
    };
    return request(requestOptions)
    // .then((_response) => {
    //   console.log(_response); // todo remove dev item
    //   // this.orders.set(_response.headers.)
    // })
  }


  // returns a promise
  submitPhone(phone) {
    this.phone = phone;
    let requestOptions = {
      method: 'POST',
      uri: this.bityExitUrlBase + bityEndPoints.submitPhone,
      body: phone,
      json: true, // Automatically stringifies the body to JSON
      resolveWithFullResponse: true
    };
    return request(requestOptions)
  }


  verifyPhone(tan) {
      // this.phone = options.phone;
      let requestOptions = {
        method: 'POST',
        uri: this.bityExitUrlBase + bityEndPoints.submitTan,
        body: {"tan": tan},
        json: true, // Automatically stringifies the body to JSON
        resolveWithFullResponse: true,
        transform: (body, response, resolveWithFullResponse) => {
          this.currentOrderUrl = response.headers['Location'];
          return body;
        }
      };
      return request(requestOptions)
  }

  queryStatus(){
    // this.phone = options.phone;
    let requestOptions = {
      method: 'GET',
      uri: this.currentOrderUrl + bityEndPoints.submitTan,
      // body: options.payload,
      json: true, // Automatically stringifies the body to JSON
      resolveWithFullResponse: true,
      transform: (body, response, resolveWithFullResponse) => {
        this.currentOrderUrl = response.headers['Location'];
        return body;
      }
    };
    return request(requestOptions)
  }

  makeTransaction() {
    // if (this.fromAddress) {
    //   return this.mewcore.web3.eth.signTransaction({
    //     from: this.fromAddress,
    //     gasPrice: "20000000000",
    //     gas: "21000",
    //     to: '0x3535353535353535353535353535353535353535',
    //     value: "1000000000000000000",
    //     data: ""
    //   })
    //     .then(_signedTx => {
    //       // t.ok(_signedTx, 'Transaction Signed')
    //       // t.equal(_signedTx, signedTransaction, " Transaction Properly Signed")
    //       console.log("_signedTx", _signedTx); // todo remove dev item
    //
    //     })
    //     .catch(_error => {
    //       console.error(_error); // todo remove dev item
    //       // t.fail("getAccounts Error")
    //       // t.end()
    //     })
    // }

  }


}


module.exports = ExitToFiat;