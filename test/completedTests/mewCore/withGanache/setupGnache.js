

var Ganache = require("ganache-core");
// var server = Ganache.server();
// server.listen(port, function(err, blockchain) {...});

function GnacheChain(){}
GnacheChain.prototype.start = function(port){
  let PORT = port || 7545;
  var logger = {
    log: function(message) {
      console.log("\nGnacheChain Logger:")
      console.log(message);
    }
  };
  this.server = Ganache.server({
    logger: logger,
    seed: "1337",
    // so that the runtime errors on call test passes
  });


  this.server.listen(PORT, function(err) {
    console.log("Gnache Listening on http://localhost:" + PORT)
  });
  return "http://localhost:" + PORT;

};

GnacheChain.prototype.stop = function(callback){
  if(typeof callback !== "function"){
    callback = function(){
      console.log("Ganache Closed/Shutdown")
    }
  }
  this.server.close(callback);
};

module.exports = GnacheChain;