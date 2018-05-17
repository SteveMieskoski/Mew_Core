const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
const MewRelay = require('../../scripts/provider/engine/mewRelay')
const HttpProvider = require('../../scripts/provider/modules/httpTransport.js')

const common = require('../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')

// test('try to implement a relay', function (t) {
//   t.plan(2)
//
//   var engine = new MewEngine()
//
//   let httpProvider = new HttpProvider()
//   engine.addTransport(httpProvider)
//   var relay = new MewRelay(engine)
//   let web3 = new Web3(relay)
//
//   var txPayload = {
//     method: 'eth_coinbase',
//     params: []
//   }
//
//   // engine.start()
//   relay.sendAsync(createPayload(txPayload), function (err, response) {
//     t.ifError(err, 'did not error')
//     t.ok(response, 'has response')
//     t.end()
//   })
// })

test('check web3 getCoinbase', function (t) {
  t.plan(2)
console.log("\n\n\n"); // todo remove dev item
  var engine = new MewEngine()
  let httpProvider = new HttpProvider()
  engine.addTransport(httpProvider)
  var relay = new MewRelay(engine)
  let web3 = new Web3(relay)

  var txPayload = {
    flow: ["eth_coinbase", "eth_getBalance"],
    method: 'eth_coinbase',
    params: []
  }

  // engine.start()
  relay.sendAsync(createPayload(txPayload), function (err, response) {
    t.ifError(err, 'did not error')
    t.ok(response, 'has response')
    console.log("response", response); // todo remove dev item
    t.end()
  })
})


// test('check web3 getBalance', function (t) {
//   t.plan(2)
//   console.log("\n\n\n"); // todo remove dev item
//
//   var engine = new MewEngine()
//   let httpProvider = new HttpProvider()
//   engine.addTransport(httpProvider)
//   var relay = new MewRelay(engine)
//   let web3 = new Web3(relay)
//
//   var txPayload = {
//     method: 'eth_coinbase',
//     params: []
//   }
//
//   // engine.start()
//   relay.sendAsync(createPayload(txPayload), function (err, response) {
//     t.ifError(err, 'did not error')
//     t.ok(response, 'has response')
//     console.log("response", response); // todo remove dev item
//     t.end()
//   })
// })
// test('check web3 getTransactionCount', function (t) {
//   t.plan(2)
//   console.log("\n\n\n"); // todo remove dev item
//
//   var engine = new MewEngine()
//   let httpProvider = new HttpProvider()
//   engine.addTransport(httpProvider)
//   var relay = new MewRelay(engine)
//   let web3 = new Web3(relay)
//
//   var txPayload = {
//     method: 'eth_coinbase',
//     params: []
//   }
//
//   // engine.start()
//   relay.sendAsync(createPayload(txPayload), function (err, response) {
//     t.ifError(err, 'did not error')
//     t.ok(response, 'has response')
//     console.log("response", response); // todo remove dev item
//     t.end()
//   })
// })
