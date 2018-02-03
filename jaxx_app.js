var JaxxApp = function() {
    this._appVersion = "1.3.0";
    this._settings = new JaxxAppSettings();
    this._controller = new JaxxController();

    var ui  = new JaxxUI();
    jaxx.Registry.jaxxUI = ui;
    this._ui = ui;

    this._ui.addListeners();

    this._user = new JaxxUser();
   // this._txManager = new JaxxTXManager();
    this._shapeShiftHelper = new JaxxShapeShiftHelper();
    //this.//cryptoDispatcher$= $({});

   // this._globalDispatcher = new JaxxGlobalDispatcher();
    this._initializer = new JaxxInitializer();

  //  this._cryptoEnableDisable = new jaxx.CryptoEnableDisable();
   // this._relayManagerForCoin = {};
    
   // this._relayManagerBitcoin = null;
   // this._relayManagerLitecoin = null;
   // this._relayManagerZCash = null;
    //this._relayManagerDoge = null;
    
    //this._relayManagerImplementationBitcoin = null;
    //this._relayManagerImplementationLitecoin = null;
    //this._relayManagerImplementationZCash = null;
    //this._relayManagerImplementationDoge = null;
}

JaxxApp.prototype.initialize = function(config) {
///    //this._relayManagerBitcoin = new RelayManager();
    //this._relayManagerLitecoin = new RelayManager();
   // this._relayManagerZCash = new RelayManager();
   // this._relayManagerDoge = new RelayManager();

    this._settings.initialize();

    this._dataStoreController = new jaxx.JaxxDatastoreController(config);
    
    //this._relayManagerImplementationBitcoin = new RelayManagerBitcoin();
    //this._relayManagerImplementationLitecoin = new RelayManagerLitecoin();
   // this._relayManagerImplementationZCash = new RelayManagerZCash();
    //this._relayManagerImplementationDoge = new RelayManagerDoge();

    this._initializer.initialize();
    this._controller.initialize();

    this._ui.initialize();
    this._user.initialize();
   // this._txManager.initialize();
    this._shapeShiftHelper.initialize();
    this._dataStoreController.initialize(config);
   // this._globalDispatcher.initialize();
    //this._relayManagerBitcoin.initialize(this._relayManagerImplementationBitcoin);
    //this._relayManagerLitecoin.initialize(this._relayManagerImplementationLitecoin);
    //this._relayManagerZCash.initialize(this._relayManagerImplementationZCash);
   // this._relayManagerDoge.initialize(this._relayManagerImplementationDoge);
    
    //this._relayManagerForCoin[COIN_BITCOIN] = this._relayManagerBitcoin;
    ///this._relayManagerForCoin[COIN_LITECOIN] = this._relayManagerLitecoin;
    //this._relayManagerForCoin[COIN_ZCASH] = this._relayManagerZCash;
    ///this._relayManagerForCoin[COIN_DOGE] = this._relayManagerDoge;
    
}

/*JaxxApp.prototype.getRelays = function(coinType) {
    return coinType ? this._relayManagerForCoin[coinType] : this._relayManagerForCoin;
}*/
/*JaxxApp.prototype.setRelays = function(coinType, relayManager) {
    this._relayManagerForCoin[coinType] = relayManager;
}*/

JaxxApp.prototype.setupWithWallet = function(wallet) {
    // JaxxUser setup wallet does not even use wallet as a parameter so consider deleting it.
    this._user.setupWithWallet(wallet);
}

JaxxApp.prototype.getVersionCode = function() {
    return this._appVersion;
}

JaxxApp.prototype.getSettings = function() {
    return this._settings;
}

JaxxApp.prototype.getUI = function() {
    return this._ui;
}

JaxxApp.prototype.getUser = function() {
    return this._user;
}

JaxxApp.prototype.getTXManager = function() {
    return this._txManager;
}

JaxxApp.prototype.getShapeShiftHelper = function() {
    return this._shapeShiftHelper;
}

JaxxApp.prototype.getDataStoreController = function() {
    return this._dataStoreController;
}

JaxxApp.prototype.getCryptoControllerByCoinType = function(coinType) {
    return this._dataStoreController.getCryptoControllerById(coinType);
}

JaxxApp.prototype.getCryptoControllerByName = function(name) {
    return this._dataStoreController.getCryptoControllerByName(name);
}

JaxxApp.prototype.getGlobalDispatcher = function() {
    return this._globalDispatcher;
}

/*JaxxApp.prototype.getBitcoinRelays = function() {
    return this.getRelayManagerForCoin(COIN_BITCOIN);
}*/

/*JaxxApp.prototype.getLitecoinRelays = function() {
    return this.getRelayManagerForCoin(COIN_LITECOIN);
}*/

/*JaxxApp.prototype.getZCashRelays = function() {
    return this.getRelayManagerForCoin(COIN_ZCASH);
}*/

/*JaxxApp.prototype.getDogeRelays = function() {
    return this.getRelayManagerForCoin(COIN_DOGE);
}*/

JaxxApp.prototype.isReleaseVersion = function(){
    return IS_RELEASE_VERSION;
}

JaxxApp.prototype.getController = function(){
    return this._controller;
}

/*
JaxxApp.prototype.getRelayManagerForCoin = function(coinType){
    return this._relayManagerForCoin[coinType];
}
*/

JaxxApp.prototype.startJaxxWithReleaseNotesPage = function(){

}

JaxxApp.prototype.getInitializer = function(){
    return this._initializer;
}