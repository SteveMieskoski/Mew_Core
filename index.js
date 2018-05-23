const MewCore = require("./scripts/core")
const MewEngine = require("./scripts/provider")
const Wallets = require("./scripts/wallets")
module.exports = {
  MewCore:{
    ...MewCore
  },
  MewEngine: {
    ...MewEngine
  },
  ...Wallets
}