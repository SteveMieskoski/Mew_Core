
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
  constructor () {
    super()
    // console.log(ethFuncs); // todo remove dev item
  }

  emitPayload (payload, cb) {
    super.emitPayload(payload, cb)
  }

  // need to account for offline case
  handleRequest (payload, next, end) {
    let txData
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
            console.log("genTxWithInfo", data); // todo remove dev item
            var rawTx = {
              nonce: sanitizeHex(data.nonce),
              gasPrice: data.isOffline ? sanitizeHex(data.gasprice) : sanitizeHex(addTinyMoreToGas(data.gasprice)),
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
              method: 'sign_tx',
              params: [rawTx]
            }, end)
          }

          if (txData.nonce || txData.gasPrice) {
            var data = {
              nonce: txData.nonce,
              gasprice: txData.gasPrice
            }
            data.isOffline = txData.isOffline ? txData.isOffline : false
            genTxWithInfo(null, data)
          } else {
            this.emitIntermediate({
              type: "batch",
              balance: {
                'id': getRandomBytes(16).toString('hex'),
                'jsonrpc': '2.0',
                'method': 'eth_getBalance',
                'params': [txData.from, 'pending']
              },
              gasprice: {
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

  cloneTxParams (txParams) {
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
