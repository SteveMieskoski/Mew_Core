

const ExitToFiat = require("../../../../../scripts/core/modules/swap/exitToFiat");
const mockEndpoint = require("./mockEndpointServer")

let exitToFiat = new ExitToFiat();

const test = require('tape')

test('allow uncaught and permitted method to fall through', function (t) {
  t.plan(1)

  let exitToFiat = new ExitToFiat();

  exitToFiat.submitPhone("123456789")
    .then((_response) => {
      console.log(_response); // todo remove dev item
    })

  exitToFiat.verifyPhone("123456789")
    .then((_response) => {
      console.log(_response); // todo remove dev item
    })

  exitToFiat.createOrder("123456789")
    .then((_response) => {
      console.log(_response); // todo remove dev item
    })

})


test.onFinish(function(t){
  mockEndpoint.emit("closeServer");
})