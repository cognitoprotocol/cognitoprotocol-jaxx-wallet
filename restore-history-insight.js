/**
 * Created by fieldtempus on 2016-11-10.
 */
///<reference path="../com/models.ts"/>
///<reference path="../com/Utils2.ts"/>
///<reference path="../com/service-mapper.ts"/>
var jaxx;
(function (jaxx) {
    var RestoreHistoryInsight = (function () {
        function RestoreHistoryInsight(config, generator) {
            this.config = config;
            this.generator = generator;
            this.attempts = 10;
            //receive_change:string;
            this.apiKey = '';
            this.requestDelays = 200;
            this.currentIndex = 0;
            this.limitOfTransactionsWithoutHistory = 10;
            //@note: @here: for relay managed classes. eventually it will be applicabe to all of the blockchains.
            this._relayManager = null;
            //@note: @here: for gathering _resolveTxList in a batch.
            this._batchSize = 20;
            this._enableLog = true;
            this.name = config.name;
            this.init();
        }
        /*initialize(name:string, relayManager:any):void {

        }*/
        RestoreHistoryInsight.prototype.init = function () {
            var _this = this;
            jaxx.Registry.application$.on(jaxx.Registry.KILL_HISTORY, function (evt, symbol) {
                console.log(_this.config.symbol + ' killing history ' + symbol);
                _this.deferred.reject({ error: 100, message: 'process killed' });
                setTimeout(function () { return _this.destroy(); }, 100);
            });
            //this.url = 'https://api.etherscan.io/api?module=account&action=txlist&address={{address}}&tag=latest';
            // this.url += this.apiKey;
            // this._name = this.generator.name;
        };
        RestoreHistoryInsight.prototype.wait = function () {
            this.onHold = true;
        };
        RestoreHistoryInsight.prototype.resume = function () {
            this.onHold = false;
            this.loadNextAddress();
        };
        RestoreHistoryInsight.prototype.destroy = function () {
            if (this.currentRequest) {
                this.currentRequest.abort();
                this.currentRequest = null;
            }
            this.addresses = null;
            this.transactions = null;
            this.balances = null;
            this.destroyed = true;
            if (this.onDestroyed)
                this.onDestroyed();
        };
        RestoreHistoryInsight.prototype.reset = function () {
            this.currentIndex = 0;
            this.withoutTransactions = 0;
            this.addresses = [];
            this.transactions = [];
            this.balances = [];
            this.attempts = 10;
            this.requestDelays = 20;
        };
        RestoreHistoryInsight.prototype.parse = function (result, address) {
            console.error('override this function');
            return result;
        };
        RestoreHistoryInsight.prototype.onError = function (num, url, message) {
            var _this = this;
            console.warn(this.attempts + '   error ' + message);
            this.attempts--;
            if (this.attempts < 0) {
                this.deferred.reject({
                    error: num,
                    attempts: this.attempts,
                    message: message,
                    url: url
                });
                this.destroy();
                return;
            }
            this.currentIndex--;
            setTimeout(function () { _this.loadNextAddress(); }, 10000);
        };
        //@note: @here: @codereview: wondering why this doesn't use the same interface as IRequestServer (which is what restore_ethereum.ts is being called from main_Ethereum.)
        RestoreHistoryInsight.prototype.restoreHistory = function (receive_change, startIndex) {
            //var promise:JQueryDeferred<{index:number,addresses:string[]}>
            console.log('%c ' + this.name + ' restoreHistory ' + receive_change + ' from ' + startIndex, 'color:brown');
            this.deferred = $.Deferred();
            this.receive_change = receive_change;
            this.reset();
            this.currentIndex = startIndex - 1;
            //setTimeout(() =>this.loadNextAddress(),50);
            this.loadNextAddress();
            return this.deferred;
        };
        RestoreHistoryInsight.prototype.loadNextAddress = function () {
            var _this = this;
            if (this.onHold || this.destroyed)
                return;
            this.currentIndex++;
            this.withoutTransactions++;
            if (this.withoutTransactions > this.limitOfTransactionsWithoutHistory) {
                // let length = this.balances.length - this.limitOfTransactionsWithoutHistory;
                var balanaces = this.balances.slice(0, -this.limitOfTransactionsWithoutHistory);
                var out = {
                    balances: balanaces,
                    //addresses:this.addresses.slice(0, this.addresses.length - this.limitOfTransactionsWithoutHistory),
                    transactions: this.transactions
                };
                console.log(this.config.symbol + ' restore history ends balances: ' + out.balances.length + ' ' + this.receive_change + ' transactions: ' + out.transactions.length);
                this.deferred.resolve(out);
                setTimeout(function () { return _this.destroy(); }, 100);
                return;
            }
            // var receive_change:string = this.receive_change;
            //  console.log('coin_HD_index  ' + this.coin_HD_index + '' +
            // ' ' + this.i +  '  nullcount: '+ this.limitOfTransactionsWithoutHistory + '  node: ' + this.receive_change);
            var currentIndex = this.currentIndex;
            // console.log(currentIndex);
            var address = this.generator.generateAddress(currentIndex, this.receive_change);
            var balance = new VOBalance({
                id: address,
                index: currentIndex,
                balance: '0',
                decimal: 0,
                type: this.receive_change == 'receive' ? 0 : 1
            });
            this.balances.push(balance);
            var url = this.config.urlTransactions.replace('{{address}}', address);
            this.addresses[currentIndex] = address;
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_RESTORE_HISTORY_NEXT);
            $.getJSON(url).done(function (res) {
                var transactions = _this.parse(res, address);
                if (transactions && transactions.length) {
                    _this.withoutTransactions = 0;
                    if (!Array.isArray(_this.transactions)) {
                        _this.transactions = [];
                        _this.destroy();
                    }
                    balance.trs = transactions.length;
                    if (!_this.transactions)
                        return;
                    _this.transactions = _this.transactions.concat(transactions);
                    // console.log('Transactions ', this.transactions);
                    console.log(_this.name + ' i ' + _this.currentIndex + ' ' + address + '   has ' + transactions.length + ' ' +
                        ' transactions ' + _this.receive_change);
                    setTimeout(function () { _this.loadNextAddress(); }, _this.requestDelays);
                }
                else {
                    if (_this.config.urlTransactionsUnconfirmed) {
                        var url2_1 = _this.config.urlTransactionsUnconfirmed.replace('{{address}}', address);
                        //  console.log(url2);
                        $.getJSON(url2_1).done(function (res) {
                            //  console.log(res);
                            var transactions = _this.parse(res, address);
                            if (transactions && transactions.length) {
                                _this.withoutTransactions = 0;
                                if (!Array.isArray(_this.transactions)) {
                                    _this.transactions = [];
                                    _this.destroy();
                                }
                                balance.trs += transactions.length;
                                _this.transactions = _this.transactions.concat(transactions);
                            }
                            console.log(_this.name + ' i ' + _this.currentIndex + ' ' + address + '   has ' + transactions.length + ' ' +
                                ' transactions UnC ' + _this.receive_change);
                            setTimeout(function () { _this.loadNextAddress(); }, _this.requestDelays);
                        }).fail(function (err) {
                            var e = new VOError('RestoreHistory', url2_1, err);
                            jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, e);
                            //When error from server go back in index and re-query  Error number in google docs "ERRORS jaxx"
                            _this.onError(204, url2_1, ' cant restore history restore-history-insight');
                        });
                    }
                    else {
                        console.log(_this.name + ' i ' + _this.currentIndex + ' ' + address + '   has ' + transactions.length + ' ' +
                            ' transactions ' + _this.receive_change);
                        setTimeout(function () { _this.loadNextAddress(); }, _this.requestDelays);
                    }
                    balance.trs = 0;
                }
            }).fail(function (err) {
                var e = new VOError('RestoreHistory', url, err);
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, e);
                //When error from server go back in index and re-query Error number in google docs "ERRORS jaxx"
                _this.onError(203, url, ' cant restore history restore-history-insight');
            });
        };
        return RestoreHistoryInsight;
    }());
    jaxx.RestoreHistoryInsight = RestoreHistoryInsight;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=restore-history-insight.js.map