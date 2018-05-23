const swap = require("./swap")
const polling = require("./blockPolling")

module.exports = {
  ...swap,
  ...polling
}