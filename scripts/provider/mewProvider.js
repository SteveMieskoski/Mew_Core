

class MewProvider{
  constructor(){
    this.providers = [];
  }


  addProvider(provider){
    this.providers.push(provider);
    provider.setEngine(this);
  }

}
