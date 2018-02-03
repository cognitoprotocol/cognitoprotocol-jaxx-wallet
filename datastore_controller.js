var jaxx;
(function (jaxx) {
    var JaxxDatastoreController = (function () {
        function JaxxDatastoreController(config) {
            this.totalChange$ = $({}); // evt,number
            config.coins.forEach(function (item) {
                var ctr;
                if (item.enabled) {
                    if (item.controller === 'EthereumController') {
                        ctr = new jaxx.EthereumController(item);
                        if (item.name === 'Ethereum')
                            jaxx.Registry.Ethereum = ctr;
                    }
                    else
                        ctr = new jaxx.CoinController(item);
                    if (jaxx.Registry.jaxxApp._settings.isCryptoCurrencyEnabled(ctr.symbol) && _.isEmpty(localStorage.getItem('upgradeFrom1.2'))) {
                        localStorage.setItem('upgradeFrom1.2', 'true');
                        ctr.enabled = true;
                    }
                    jaxx.Registry.addCryptoController(ctr);
                }
            });
            config.tokens.forEach(function (item) {
                if (item.enabled) {
                    var ctr = new jaxx.TokenController(item);
                    jaxx.Registry.addCryptoController(ctr);
                    if (jaxx.Registry.jaxxApp._settings.isCryptoCurrencyEnabled(ctr.symbol) && _.isEmpty(localStorage.getItem('upgradeFrom1.2'))) {
                        localStorage.setItem('upgradeFrom1.2', 'true');
                        ctr.enabled = true;
                    }
                }
            });
            var ar = config.coins;
            ar = ar.concat(config.tokens);
            jaxx.Registry.setConfigCoins(ar);
            this.config = config;
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_SEQUENCE_CHANGED, function (evt, obj) {
                // console.log(obj);
                jaxx.Registry.getAllCryptoControllers().forEach(function (item) {
                    item.sort = obj[item.symbol];
                });
            });
            jaxx.Registry.datastore_controller_test = this;
            jaxx.Registry.application$.triggerHandler('JaxxDatastoreController', this);
        }
        JaxxDatastoreController.prototype.initialize = function (config) {
            console.log("[ JaxxDatastoreController :: Initialize ]");
        };
        JaxxDatastoreController.prototype.enableWallet = function () {
            // Registry.ja
        };
        JaxxDatastoreController.prototype.getHistory = function () {
            return null;
            //return this.currentModel.getTransactions();
        };
        JaxxDatastoreController.onNetworkError = function () {
            JaxxDatastoreController.emitter$.triggerHandler(JaxxDatastoreController.ON_NETWORK_ERROR, [arguments]);
        };
        JaxxDatastoreController.onNewTransactions = function () {
            JaxxDatastoreController.emitter$.triggerHandler(JaxxDatastoreController.ON_TRANSACTIONS_CHANGE, [arguments]);
        };
        return JaxxDatastoreController;
    }());
    /* setDefault(coinType: string): void {
         this.defaultName = coinType;
     }*/
    JaxxDatastoreController.ON_NETWORK_ERROR = 'ON_NETWORK_ERROR';
    JaxxDatastoreController.ON_TRANSACTIONS_CHANGE = 'ON_TRANSACTIONS_CHANGE';
    JaxxDatastoreController.emitter$ = $({});
    jaxx.JaxxDatastoreController = JaxxDatastoreController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=datastore_controller.js.map