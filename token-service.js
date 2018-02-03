var jaxx;
(function (jaxx) {
    // declare var $:any;
    var TokenService = (function () {
        // emitter$:JQuery
        function TokenService(config) {
            this.config = config;
            this.ON_ERROR = 'ON_ERROR';
            // this.emitter$ = $({});
        }
        TokenService.prototype.stopAll = function () {
        };
        TokenService.prototype.lastBlock = function () {
            return null;
        };
        TokenService.prototype.downloadTransactions = function (addresses) {
            return null;
        };
        TokenService.prototype.downloadTransactionsDetails = function (transactions) {
            return null;
        };
        TokenService.prototype.restoreHistory = function (startIndex) {
            return null;
        };
        TokenService.prototype.downlaodUTXOs = function (addresses) {
            return null;
        };
        TokenService.prototype.downlaodNonces = function (addresses) {
            return null;
        };
        TokenService.prototype.sendTransaction = function (transaction) {
            var deferred = $.Deferred();
            //console.log(transaction);
            // let url = 'https://api.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex={{hex}}';
            var url = jaxx.Registry.getCryptoControllerByName('Ethereum').urlSendTransaction;
            url = url.replace('{{hex}}', transaction.hex);
            //  console.log(url);
            //return null
            $.getJSON(url)
                .then(function (res) {
                //   console.log(res);
                return res;
            })
                .done(function (result) {
                if (result.result)
                    transaction.success = 'success';
                transaction.result = result;
                // transaction.success= result;
                deferred.resolve(transaction);
            })
                .fail(function (error) {
                deferred.reject(error);
                console.error(error);
            });
            return deferred.promise();
        };
        TokenService.prototype.downloadBalances = function (addresses) {
            var address = addresses[0];
            var shiftCount = this.config.shiftCount;
            if (!address)
                console.error(address);
            var url = this.config.urlBalanceToken || 'https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress={{contractAddress}}&address={{address}}&tag=latest&apikey=WGWHHAU4F2Y58UW5FQWTUJWSXBNHU7WBSX';
            url = url.replace('{{contractAddress}}', this.config.contractAddress);
            url = url.replace('{{address}}', address);
            return $.getJSON(url)
                .then(function (item) {
                // if server error balance not valid
                if (!+item.status || item.message === 'NOTOK' || isNaN(+item.result)) {
                    return null;
                }
                var balance = item.result;
                if (shiftCount)
                    balance = jaxx.MATH.shiftRight(balance, shiftCount);
                return [new VOBalance({ id: address, balance: balance })];
            });
        };
        return TokenService;
    }());
    jaxx.TokenService = TokenService;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=token-service.js.map