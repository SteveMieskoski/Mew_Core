const test = require('tape')
const MewEngine = require('../../../../scripts/provider/mewEngine')
const HttpProvider = require('../../../../scripts/provider/modules/httpTransport.js')
const GanacheChain = require("./setupGnache")
const common = require('../../../../scripts/common/index')
const createPayload = common.createPayload
const Web3 = require('web3')
const FromFile = require('../../../../scripts/wallets/software/fromFile')

var secretKeys = [
  '0xda09f8cdec20b7c8334ce05b27e6797bef01c1ad79c59381666467552c5012e3',
  '0x0d14f32c8e3ed7417fb7db52ebab63572bf7cfcd557351d4ccf19a05edeecfa5',
  '0x0d80aca78bfaf3ab47865a53e5977e285c41c028a15313f917fe78abe5a50ef7',
  '0x00af8067d4c69abca7234194f154d7f31e13c0e53dae9260432f1bcc6d1d13fb',
  '0x8939a6a37b48c47f9bc683c371dd96e819d65f6138f3b376a622ecb40379bd22',
  '0x4a3665bf95efd38cb9820ce129a26fee03927f17930924c98908c8885ca53606',
  '0x111bd4b380f2eeb0d00b025d574908d59c1bfa0030d7a69f69445c171d8cfa27',
  '0x6aff34e843c3a99fe21dcc014e3b5bf6a160a4bb8c4c470ea79acd33d9bea41f',
  '0x12ae0eb585babc60c88a74190a6074488a0d2f296124ce37f85dbec1d693906f',
  '0xd46dc75904628a0b0eaffdda6acbe2687924299995708e30d05a1e8a2a1c5d45'
];
let ganacheChain = new GanacheChain();
let httpDetails = ganacheChain.start()

test('check web3 getCoinbase', function (t) {
  t.plan(3)
  let accounts, personalAccount;

  let optionsManualPrivateKey = {
    type: "manualPrivateKey",
    manualPrivateKey: "0xda09f8cdec20b7c8334ce05b27e6797bef01c1ad79c59381666467552c5012e3"
  }

// console.log("\n\n\n"); // todo remove dev item
  var engine = new MewEngine()
  let httpProvider = new HttpProvider(httpDetails)
  let walletProvider = new FromFile(optionsManualPrivateKey);
  engine.setTransport(httpProvider)
  engine.setNewWalletProvider(walletProvider)
  let web3 = new Web3(engine)

  // var txPayload = {
  //   flow: ["eth_coinbase", "eth_getBalance"],
  //   method: 'eth_coinbase',
  //   params: []
  // }

  let transaction_data = {
    from: null, // set by test
    to: null, // set by test
    value: "0xa",
    data: "0x0",//'0x552410770000000000000000000000000000000000000000000000000000000000000019', // sets value to 25 (base 10)
    gas: 3141592
  }

  web3.eth.getAccounts()
    .then(function (accs) {

      accounts = accs.map(function (val) {
        return val.toLowerCase();
      });
      // console.log(accounts[1]); // todo remove dev item
      // return web3.eth.personal.newAccount("password")
      transaction_data.from = accs[0]
      transaction_data.to = accs[0]
      // web3.eth.sendTransaction(transaction_data, function(err, result) {
      // console.log(err); // todo remove dev item
      //   console.log(result); // todo remove dev item
      // });
      // console.log("transaction_data", transaction_data); // todo remove dev item
      web3.eth.sendTransaction(transaction_data, function (err, result) {
        // console.log("tx error", err); // todo remove dev item
        // console.log("tx result" ,result); // todo remove dev item
        t.equal(result, "0x11b8edbf5ed8c53a7bc68f5792191e03102b8af2da226f2b057be08224990f83", "Expected Tx Hash Received"); // todo remove dev item
        t.ok(result, "Result received")
        t.notOk(err, "Request did not error")
        t.end()
      });

      // return web3.eth.getBalance(accs[0])
    })
    // .then(function (acct) {
    //   personalAccount = acct
    //   console.log(transaction_data); // todo remove dev item
    //   web3.eth.sendSignedTransaction(transaction_data, function (err, result) {
    //     console.log(err); // todo remove dev item
    //     console.log(result); // todo remove dev item
    //     t.end()
    //   });
    //
    // })


  // web3.eth.sendTransaction({
  //   from: accounts[0],
  //   to: senderAddress,
  //   value: '0x3141592',
  //   gas: 3141592
  // })
  // // engine.start()
  // engine.sendAsync(createPayload(txPayload), function (err, response) {
  //   t.ifError(err, 'did not error')
  //   t.ok(response, 'has response')
  //   console.log("response", response); // todo remove dev item
  //   t.end()
  // })
})

test.onFinish(() => {
  ganacheChain.stop(() => {
    // process.exit(0);
  });
})