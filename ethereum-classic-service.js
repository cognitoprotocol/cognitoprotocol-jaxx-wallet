///<reference path="../com/models.ts"/>
var jaxx;
(function (jaxx) {
    // import Utils2 = jaxx.Utils2;
    var EthereumClassicService = (function () {
        function EthereumClassicService(config, db) {
            this.config = config;
            this.db = db;
            this.generator = new jaxx.GeneratorBlockchain(config);
        }
        EthereumClassicService.prototype.stopAll = function () {
        };
        EthereumClassicService.prototype.lastBlock = function () {
            var url = this.config.urlLastBlock;
            return $.getJSON(url).then(function (result) {
                return Number(result.latestBlockNumberInserted);
            });
        };
        EthereumClassicService.prototype.sendTransaction = function (transaction) {
            var differed = $.Deferred();
            var transactions = transaction.transactionsETH;
            var urlSendTransaction = this.config.urlSendTransaction;
            var symbol = this.config.symbol;
            /* console.log('JN Send ETC', transaction);*/
            var sendNext = function (i) {
                i++;
                if (i < transactions.length) {
                    var transactionToSend_1 = transactions[i];
                    // console.log(symbol + ' Send URL ', urlSendTransaction);
                    $.ajax({
                        url: urlSendTransaction,
                        accepts: {
                            "ContentType": 'application/json'
                        },
                        type: 'PUT',
                        headers: {
                            'Cache-Control': 'no-cache',
                            transaction: transactionToSend_1.hex
                        }
                    }).done(function (result) {
                        transactionToSend_1.result = result;
                        sendNext(i);
                    }).fail(function (error) {
                        var e = new VOError('EthereumClassicService.sendTransaction', error.responseText, transactionToSend_1);
                        jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, e);
                        differed.reject({ error: error.status, message: error.responseText });
                    });
                }
                else {
                    transaction.success = 'success';
                    differed.resolve(transaction);
                }
            };
            // for testing max send
            // transaction.success = 'success';
            //differed.resolve(transaction);
            sendNext(-1);
            return differed.promise();
        };
        EthereumClassicService.prototype.downlaodNonces = function (addresses) {
            var differed = $.Deferred();
            var results = {};
            var urlTransactions = this.config.urlTransactions;
            var onDownlaodNext = function (i) {
                i++;
                if (i < addresses.length) {
                    var address_1 = addresses[i];
                    var url = urlTransactions.replace('{{address}}', address_1);
                    console.log(url);
                    $.get(url).then(function (respond) {
                        // console.warn(respond);
                        var transactions = respond.transactions.filter(function (item) {
                            return item.from === address_1;
                        });
                        return { address: address_1, nonce: transactions.length };
                    }).done(function (result) {
                        results[result.address] = result.nonce;
                        onDownlaodNext(i);
                        //  differed.resolve(result);
                    }).fail(differed.reject);
                }
                else
                    differed.resolve(results);
            };
            onDownlaodNext(-1);
            return differed.promise();
        };
        EthereumClassicService.prototype.downloadTransactions = function (addresses) {
            var differed = $.Deferred();
            var results = [];
            var urlTransactions = this.config.urlTransactions;
            var onDownlaodNext = function (i) {
                i++;
                if (i < addresses.length) {
                    var address = addresses[i];
                    var url = urlTransactions.replace('{{address}}', address);
                    //console.log(url);
                    $.get(url).then(function (respond) {
                        // console.warn(respond);
                        return respond.transactions.map(function (item) {
                            item.timeStamp = item.timestamp;
                            return jaxx.EthereumService.mapTransaction(item);
                        });
                    }).done(function (result) {
                        results = results.concat(result);
                        onDownlaodNext(i);
                        //  differed.resolve(result);
                    }).fail(differed.reject);
                }
                else
                    differed.resolve(results);
            };
            onDownlaodNext(-1);
            return differed.promise();
        };
        EthereumClassicService.prototype.downloadTransactionsDetails = function (tarnsactions) {
            console.error(' all ethereum transactions have to have confirmations ');
            var deffered = $.Deferred();
            tarnsactions.forEach(function (item) {
                if (!item.confirmations) {
                    item.confirmations = 1;
                }
            });
            deffered.resolve(tarnsactions);
            return deffered.promise();
        };
        EthereumClassicService.prototype.downloadBalances = function (addresses) {
            var r = new jaxx.RequestDownloadBalancesETC();
            return r.downloadBalances(addresses, this.config.urlBalance);
        };
        EthereumClassicService.prototype.restoreHistory = function (startIndex) {
            var _this = this;
            var promise = $.Deferred();
            // let url = this.config.urlTransactions;
            var history = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            history.parse = function (res, address) {
                // console.log(res);
                return res.transactions.map(function (item) {
                    item.timeStamp = item.timestamp;
                    return jaxx.EthereumService.mapTransaction(item);
                });
            };
            history.restoreHistory('receive', startIndex)
                .done(function (resultHistory) {
                //  console.log(resultHistory);
                var balances = resultHistory.balances;
                if (balances.length === 0) {
                    promise.resolve({ balancesReceive: [], balancesChange: null, transactions: [] });
                    return;
                }
                var addresses = _.map(balances, 'id');
                _this.downloadBalances(addresses).done((function (result) {
                    var indexed = _.keyBy(result, 'id');
                    balances.forEach(function (item) {
                        var bal = indexed[item.id];
                        item.balance = bal.balance;
                        item.decimal = bal.decimal;
                        item.timestamp = Date.now();
                    });
                    promise.resolve({ balancesReceive: balances, balancesChange: null, transactions: resultHistory.transactions });
                })).fail(promise.reject);
            });
            // $.getJSON(url)
            return promise;
        };
        EthereumClassicService.prototype.stop = function () {
        };
        EthereumClassicService.prototype.downlaodUTXOs = function (addresses) {
            return null;
        };
        //////////////////////////////////////    Generator
        EthereumClassicService.prototype.addKeyPairToBalances = function (balances) {
            var _this = this;
            var i;
            balances.forEach(function (balance) {
                // console.log(balance);
                var address = balance.id;
                i = _this.db.getAddressesReceive().indexOf(address);
                balance.keyPair = _this.getKeyPairReceive(i);
            });
        };
        EthereumClassicService.prototype.getKeyPairReceive = function (index) {
            return this.generator.generateKeyPairReceive(index);
        };
        EthereumClassicService.prototype.getSignatureForIndex = function (index) {
            return this.generator.getSignatureForIndex(index);
        };
        EthereumClassicService.prototype.getKeyPairChange = function (index) {
            return this.generator.generateKeyPairChange(index);
        };
        EthereumClassicService.prototype.getAddressReceive = function (index) {
            return this.generator.generateAddressReceive(index);
        };
        return EthereumClassicService;
    }());
    jaxx.EthereumClassicService = EthereumClassicService;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=ethereum-classic-service.js.map