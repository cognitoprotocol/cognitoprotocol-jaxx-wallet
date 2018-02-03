///<reference path="../com/models.ts"/>
///<reference path="../com/Utils.ts"/>
///<reference path="../com/Utils2.ts"/>
///<reference path="../com/datastore_local.ts"/>
///<reference path="../archive/services/token_ethereum/ethereum_token.ts"/>
var jaxx;
(function (jaxx) {
    // import Utils2 = jaxx.Utils2;
    var CoinService = (function () {
        function CoinService(config, _db, generator) {
            this._db = _db;
            this.errors = [];
            for (var str in config)
                this[str] = config[str];
            this.generator = generator ? generator : new jaxx.GeneratorBlockchain(config);
            if (config.symbol === 'BTC')
                this.request = new jaxx.InsightApi(config, this.generator);
            else
                this.request = new jaxx.DecentralApi(config, this.generator);
            // this.balances$ = $({});
            ///console.log(this. name + ' : ' + settings.request + ' coin_HD_index   ' + this.coin_HD_index);
        }
        CoinService.prototype.lastBlock = function () {
            return this.request.lastBlock();
        };
        CoinService.prototype.sendTransaction = function (transaction) {
            return this.request.sendTransaction(transaction);
        };
        CoinService.prototype.downlaodUTXOs = function (addresses) {
            return this.request.downlaodUTXOs(addresses);
        };
        CoinService.prototype.downloadBalances = function (addresses) {
            return this.request.downloadBalances(addresses);
        };
        CoinService.prototype.downloadTransactionsDetails = function (transactions) {
            return this.request.downloadTransactionsDetails(transactions);
        };
        CoinService.prototype.stopAll = function () {
            this.request.stopAll();
        };
        CoinService.prototype.downlaodNonces = function (addresses) {
            return null;
        };
        CoinService.prototype.downloadTransactions = function (addresses) {
            return this.request.downloadTransactions(addresses);
        };
        CoinService.prototype.getKeyPairReceive = function (index) {
            return this.generator.generateKeyPairReceive(index);
        };
        CoinService.prototype.getKeyPairChange = function (index) {
            return this.generator.generateKeyPairChange(index);
        };
        CoinService.prototype.onError = function (err) {
            console.error(err);
            this.errors.push(err);
            if (this.errors.length > 1000)
                this.errors.shift();
        };
        CoinService.prototype.restoreHistory = function (receiveIndex, changeIndex) {
            return this.request.restoreHistory(receiveIndex, changeIndex);
        };
        // ON_RESTORED_HISTORY_RECEIVE: string = 'ON_RESTORED_HISTORY_RECEIVE';
        CoinService.prototype.checkAddressesForTranasactions = function (addresses) {
            //console.warn(addresses);
            return null;
            /*  return this.crypto_class.checkAddressesForTranasactions(addresses).then(result => {
                  console.log(result);
                  return result;
              });*/
        };
        return CoinService;
    }());
    jaxx.CoinService = CoinService;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=coin-service.js.map