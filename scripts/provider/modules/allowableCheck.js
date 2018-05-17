const methods = require('./rpcMethods')

module.exports = function (method, methodSet = 'all') {
  console.log("allowableCheck", method); // todo remove dev item
  return methods[methodSet].indexOf(method) > -1
}
