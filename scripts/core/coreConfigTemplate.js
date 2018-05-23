module.exports = {
  engineOptions: { // options passed to MewEngine
    debug: true
  },
  web3Extensions: [
    /* Array of objects defining extensions to web3
    * */
    {
      provider: "", // instantiated handler of the new method
      // providerOptions: undefined,
      method: 'generate_transaction', // name of the new method used in RPC calls
      methodName: 'generateTransaction', // name of the new method exposed on web3
      paramCount: 1 // number of parameters the new method expects
    }
  ],
  transport: "", // new HttpTransport(),
  providers: [
    // array of providers to use,
  ],
  wallet: "" // wallet provider to use [this can also be supplied via the providers array
}