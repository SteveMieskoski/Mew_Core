const HardwareWallets = require("./hardware")
const SoftwareWallets = require("./software")

// const LedgerWallet = require()

module.exports = {
  ...HardwareWallets,
  ...SoftwareWallets
}