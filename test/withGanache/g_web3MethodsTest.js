const test = require('tape')
const MewEngine = require('../../scripts/provider/mewEngine')
const HttpProvider = require('../../scripts/provider/modules/httpTransport.js')
const common = require('../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')

test('check web3 getCoinbase', function (t) {
  t.plan(1)

  var engine = new MewEngine()
  let httpProvider = new HttpProvider()
  engine.addTransport(httpProvider)
  let web3 = new Web3(engine)

  let response = web3.eth.getCoinbase()
  response.then(_result => {
    t.ok(_result, 'has response')
    t.end()
  })
    .catch(error => {
      t.ifError(error, 'did not error')
      t.end()
    })
})


test('check web3 getBalance', function (t) {
  t.plan(2)

  var engine = new MewEngine()
  let httpProvider = new HttpProvider()
  engine.addTransport(httpProvider)
  let web3 = new Web3(engine)

  let response = web3.eth.getCoinbase()
  response.then(_result => {
    t.ok(_result, 'get coinbase address')
    return web3.eth.getBalance(_result)
  })
    .then(_balance => {
      t.ok(_balance, 'get coinbase balance')
      t.end()
    })
    .catch(error => {
      t.ifError(error, 'did not error')
      t.end()
    })
})
test('check web3 getTransactionCount', function (t) {
  t.plan(2)

  var engine = new MewEngine()
  let httpProvider = new HttpProvider()
  engine.addTransport(httpProvider)
  let web3 = new Web3(engine)

  let response = web3.eth.getCoinbase()
  response.then(_result => {
    t.ok(_result, 'get coinbase address')
    return web3.eth.getTransactionCount(_result)
  })
    .then(_txCount => {
      t.equal(_txCount, 0,  'transaction count is correct')
      t.end()
    })
    .catch(error => {
      t.ifError(error, 'did not error')
      t.end()
    })
})
