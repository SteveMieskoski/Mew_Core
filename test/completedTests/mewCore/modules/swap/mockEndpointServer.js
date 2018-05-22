const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const Events = require("events").EventEmitter;

const emitter = new Events();
server.listen(3000, (req, res) => {

});

emitter.on("closeServer", () =>{
  server.close(()=>{
    console.log("server closed"); // todo remove dev item
  })
})

app.post("/api/v2/orders/phone", (req, res) => {
console.log(req.headers); // todo remove dev item
  res.send("OK")
})

app.post("/api/v2/orders/mtan", (req, res) => {
  console.log(req.headers); // todo remove dev item
  res.send({
    "token": "123"
  });
})

/*app.get("/api/v2/orders/mtan", (req, res) => {

})*/

app.post("/api/v2/orders/", (req, res) => {
  console.log(req.headers); // todo remove dev item
  // res.location('/foo/bar');
  res.set({
    'location': '/api/v2/orders/456',
    'x-phone-token': '123'
  });
  res.send("OK")
  /*
  {
  "phone_number": "+41790000000",
  "input": {
    "amount": "0.12",
    "currency": "ETH"
  },
  "output": {
    "currency": "CHF",
    "type": "bank_account",
    "iban": "CH3600000000000000000",
    "bic_swift": "",
    "aba_number": "",
    "sort_code": "",
    "bank": {
      "name": "",
      "address": "",
      "address_complement": "",
      "zip": "",
      "city": "",
      "state": "",
      "country": ""
    }
  },
}
  */
})


app.get("/api/v2/orders/:id", (req, res) => {
  console.log(req.headers); // todo remove dev item
  let resObject = {
    "status": "",
    "payment_details": {
      "crypto_address": ""
    },
    "input": {
      "amount": "0.12",
      "currency": "ETH",
      "type": "crypto_address",
      "address": ""
    },
    "output": {
      "amount": "900.12",
      "currency": "CHF",
      "type": "bank_account",
      "iban": "CH3600000000000000000"
    }
  };
  res.send(resObject)
})

module.exports = emitter;