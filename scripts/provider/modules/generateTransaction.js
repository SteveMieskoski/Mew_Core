const common = require('../../common/index')
const ethFuncs = common.ethFuncs
const etherUnits = common.etherUnits
const EthTx = common.tx
const getRandomBytes = common.getRandomBytes
const sanitizeHex = common.sanitizeHex
const decimalToHex = common.decimalToHex
const addTinyMoreToGas = common.addTinyMoreToGas
const toWei = common.toWei
const ModuleInterface = require('./moduleInterface')

class GenerateTransaction extends ModuleInterface {
  constructor(opts) {
    super()
    let options = opts || {};
    this.signMethod = options.signMethod || "sign_tx";
    // console.log(ethFuncs); // todo remove dev item
  }

  emitPayload(payload, cb) {
    super.emitPayload(payload, cb)
  }

  // need to account for offline case
  handleRequest(payload, next, end) {
    let txData, data;
    switch (payload.method) {
      case 'generate_transaction':
        if (payload.txData) {
          txData = payload.txData
        } else {
          txData = payload.params[0]
        }
        try {
          var genTxWithInfo = (error, data) => {
            // if(error) throw error
            var rawTx = {
              nonce: sanitizeHex(data.nonce),
              gasPrice: data.isOffline ? sanitizeHex(data.gasPrice) : !data.gasPrice ? sanitizeHex(addTinyMoreToGas(txData.gasPrice)) : sanitizeHex(addTinyMoreToGas(data.gasPrice)),
              gasLimit: txData.gasLimit ? sanitizeHex(decimalToHex(txData.gasLimit)) : sanitizeHex(decimalToHex(txData.gas)),
              to: sanitizeHex(txData.to),
              value: sanitizeHex(decimalToHex(toWei(txData.value, txData.unit))),
              data: txData.data ? sanitizeHex(txData.data) : ''
            }

            if (this.engine.network.eip155) rawTx.chainId = this.engine.network.chainId
            rawTx.data = rawTx.data === '' ? '0x' : rawTx.data
            // var eTx = new EthTx(rawTx)

            this.emitPayload({
              id: payload.id,
              method: this.signMethod,
              params: [rawTx]
            }, end)
          }
          if (txData.nonce && txData.gasPrice) {
            data = {
              nonce: txData.nonce,
              gasPrice: txData.gasPrice
            }
            data.isOffline = txData.isOffline ? txData.isOffline : false

            genTxWithInfo(null, data)

          } else if (!txData.nonce && txData.gasPrice) {
            data = {
              nonce: txData.nonce,
              gasPrice: txData.gasPrice
            }
            data.isOffline = txData.isOffline ? txData.isOffline : false
console.log(txData); // todo remove dev item
            this.emitIntermediate({
              type: "batch",
              balance: {
                'id': getRandomBytes(16).toString('hex'),
                'jsonrpc': '2.0',
                'method': 'eth_getBalance',
                'params': [txData.from, 'pending']
              },
              nonce: {
                'id': getRandomBytes(16).toString('hex'),
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionCount',
                'params': [txData.from, 'pending']
              }
            }, genTxWithInfo)

          } else {
            this.emitIntermediate({
              type: "batch",
              balance: {
                'id': getRandomBytes(16).toString('hex'),
                'jsonrpc': '2.0',
                'method': 'eth_getBalance',
                'params': [txData.from, 'pending']
              },
              gasPrice: {
                'id': getRandomBytes(16).toString('hex'),
                'jsonrpc': '2.0',
                'method': 'eth_gasPrice',
                'params': []
              },
              nonce: {
                'id': getRandomBytes(16).toString('hex'),
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionCount',
                'params': [txData.from, 'pending']
              }
            }, genTxWithInfo)
            // ajaxReq.getTransactionData(txData.from, function(data) {
            //   if (data.error && callback !== undefined) {
            //     callback({
            //       isError: true,
            //       error: e
            //     });
            //   } else {
            //     data = data.data;
            //     data.isOffline = txData.isOffline ? txData.isOffline : false;
            //     genTxWithInfo(data);
            //   }
            // });
          }
        } catch (e) {
          if (end !== undefined) {
            end({
              isError: true,
              error: e
            })
          }
        }

        return
      default:
        next()
        return
    }
  }

  getnonce() {

  }

  getGasPrice() {

  }

  cleanTxDataProperties(txParams) {
    return {
      from: txParams.from,
      to: txParams.to,
      value: txParams.value,
      data: txParams.data,
      gas: txParams.gas,
      gasPrice: txParams.gasPrice,
      nonce: txParams.nonce
    }
  }
}


module.exports = GenerateTransaction
