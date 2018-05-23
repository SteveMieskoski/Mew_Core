

const ExitToFiat = require("../../../../../index").MewCore.modules.ExitToFiat
  console.log(ExitToFiat); // todo remove dev item
  //
  //require("../../../../../scripts/core/modules/swap/exitToFiat");
const mockEndpoint = require("./mockEndpointServer")

let exitToFiat = new ExitToFiat();

const test = require('tape')

test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(3)

  let exitToFiat = new ExitToFiat();

  exitToFiat.submitPhone("123456789")
    .then((_response) => {
      t.equal(_response.headers['x-phone-token'], "123", "correct phone token")
      console.log("_response", _response.headers['x-phone-token']); // todo remove dev item
      console.log("\n"); // todo remove dev item
      return exitToFiat.verifyPhone("123456789")
    })
    .then((_response) => {
      t.equal(_response.headers['x-phone-token'], "123", "correct phone token")
      console.log("_response", _response.headers['x-phone-token']); // todo remove dev item
      console.log("\n"); // todo remove dev item
      return exitToFiat.createOrder("123456789")
    })
    .then((_response) => {
      t.equal(_response.headers['x-phone-token'], "123", "correct phone token")
      console.log("_response", _response.headers['x-phone-token']); // todo remove dev item
      console.log("\n"); // todo remove dev item
      t.end()
    })
    .catch(err => {
      console.error(err);
      t.end()
    })

})


test.onFinish(function(t){
  setTimeout(()=>{
    mockEndpoint.emit("closeServer");
  }, 1000)
})