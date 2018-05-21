const EventEmitter = require('events').EventEmitter
const common = require('../../../common/index');
const request = common.request;


class ExitToFiat {
  constructor(mewcore) {
    this.mewcore = mewcore;
    this.phone = null;
    this.bityExitUrlBase = "https://bity.com/api"
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
    if (!options.payload) {
      throw "Error No POST payload supplied";
    } else if (!options.payload.phone) {
      throw "Error No phone number supplied";
    }
    this.phone = options.phone;
    let requestOptions = {
      method: 'POST',
      uri: this.bityExitUrlBase + "/api/v2/orders/",
      body: options.payload,
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
  submitPhone(options) {
    // just a placeholder for now
  }


  verifyPhone(tan) {
    if (this.currentOrderUrl) {
      this.phone = options.phone;
      let requestOptions = {
        method: 'POST',
        uri: this.currentOrderUrl + "/mtan",
        body: options.payload,
        json: true, // Automatically stringifies the body to JSON
        resolveWithFullResponse: true,
        transform: (body, response, resolveWithFullResponse) => {
          this.currentOrderUrl = response.headers['Location'];
          return body;
        }
      };
      return request(requestOptions)
    }
  }

  makeTransaction() {
    if (this.fromAddress) {
      return this.mewcore.web3.eth.signTransaction({
        from: this.fromAddress,
        gasPrice: "20000000000",
        gas: "21000",
        to: '0x3535353535353535353535353535353535353535',
        value: "1000000000000000000",
        data: ""
      })
        .then(_signedTx => {
          // t.ok(_signedTx, 'Transaction Signed')
          // t.equal(_signedTx, signedTransaction, " Transaction Properly Signed")
          console.log("_signedTx", _signedTx); // todo remove dev item

        })
        .catch(_error => {
          console.error(_error); // todo remove dev item
          // t.fail("getAccounts Error")
          // t.end()
        })
    }

  }


}