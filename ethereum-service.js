var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var jaxx;
(function (jaxx) {
    var EthereumService = (function () {
        function EthereumService(config, db) {
            this.config = config;
            this.db = db;
            this.generator = new jaxx.GeneratorBlockchain(config);
        }
        EthereumService.mapTransaction = function (item) {
            return new VOTransaction({
                id: item.hash,
                from: item.from,
                to: item.to,
                miningFee: item.gasUsed * item.gasPrice / 1e18,
                value: item.value,
                timestamp: item.timeStamp ? +item.timeStamp : +item.timestamp,
                block: +item.blockNumber,
                confirmations: +item.confirmations
            });
        };
        /// returning only transactions after timestamp
        EthereumService.filterTransaction = function (item) {
            if (item.hasOwnProperty('timeStamp'))
                item.timestamp = +item.timeStamp;
            if (item.timestamp > this['timestamp']) {
                item.id = item.hash;
                item.miningFee = item.gasUsed * item.gasPrice / 1e18; //+MATH.weiToEther(String(+item.gasUsed * + item.gasPrice)),
                item.timestamp = +item.timeStamp;
                item.block = +item.blockNumber;
                item.confirmations = +item.confirmations;
                return true;
            }
            return false;
        };
        EthereumService.prototype.lastBlock = function () {
            var url = this.config.urlLastBlock;
            return $.getJSON(url)
                .then(function (result) {
                return Number(result.result);
            });
        };
        EthereumService.prototype.stopAll = function () {
        };
        EthereumService.prototype.downloadTransactions = function (addresses, timestamp) {
            if (timestamp === void 0) { timestamp = 5; }
            var differed = $.Deferred();
            var results = [];
            var urlTransactions = this.config.urlTransactions;
            var onDownlaodNext = function (i) {
                i++;
                if (i < addresses.length) {
                    var address = addresses[i];
                    var url = urlTransactions.replace('{{address}}', address);
                    $.get(url).then(function (respond) {
                        //only including in respose transactions after timestamp provided
                        return respond.result.filter(EthereumService.filterTransaction, { timestamp: timestamp });
                        /*  return respond.result.map(function (item) {
                              return EthereumService.mapTransaction(item);
                          });*/
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
        EthereumService.prototype.downlaodNonces = function (addresses) {
            var differed = $.Deferred();
            var results = {};
            var urlTransactions = this.config.urlTransactionCount;
            var onDownlaodNext = function (i) {
                i++;
                if (i < addresses.length) {
                    var address_1 = addresses[i];
                    var url = urlTransactions.replace('{{address}}', address_1);
                    //console.log(url);
                    $.get(url).then(function (respond) {
                        // console.warn(item);
                        return { address: address_1, nonce: Number(respond.result) };
                    }).done(function (result) {
                        results[result.address] = result.nonce;
                        onDownlaodNext(i);
                    }).fail(differed.reject);
                }
                else
                    differed.resolve(results);
            };
            onDownlaodNext(-1);
            return differed.promise();
        };
        EthereumService.prototype.downlaodNoncesOld = function (addresses) {
            var differed = $.Deferred();
            var results = {};
            var urlTransactions = this.config.urlTransactions;
            var onDownlaodNext = function (i) {
                i++;
                if (i < addresses.length) {
                    var address_2 = addresses[i];
                    var url = urlTransactions.replace('{{address}}', address_2);
                    //console.log(url);
                    $.get(url).then(function (respond) {
                        // console.warn(item);
                        var transactions = respond.result.filter(function (item) {
                            return item.from === address_2;
                        });
                        return { address: address_2, nonce: transactions.length };
                    }).done(function (result) {
                        results[result.address] = result.nonce;
                        onDownlaodNext(i);
                    }).fail(differed.reject);
                }
                else
                    differed.resolve(results);
            };
            onDownlaodNext(-1);
            return differed.promise();
        };
        EthereumService.prototype.downloadTransactionsDetails = function (transactions) {
            console.error(' all ethereum transactions have to have confirmations');
            jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('EthereumService.downloadTransactionsDetails', ' all ethereum transactions have to have confirmations', transactions, this.config.symbol));
            var deffered = $.Deferred();
            transactions.forEach(function (item) {
                if (!item.confirmations) {
                    item.confirmations = 1;
                }
            });
            deffered.resolve(transactions);
            return deffered.promise();
        };
        EthereumService.prototype.sendTransaction = function (transaction) {
            var deferred = $.Deferred();
            var transactions = transaction.transactionsETH;
            // let url:string = this.config.urlSendTransaction;
            var urlSendTransaction = this.config.urlSendTransaction; //.split('&apikey')[0];
            var sendNext = function (i) {
                i++;
                if (i < transactions.length) {
                    var transactionToSend_1 = transactions[i];
                    var url = urlSendTransaction
                        .replace("{{hex}}", transactionToSend_1.hex);
                    $.getJSON(url).then(function (respond) {
                        if (respond.error) {
                            // if(respond.error.message && respond.error.message.indexOf('nonce') !==-1){
                            //   deferred.reject('nonce');
                            // return;
                            //}
                            // console.error(respond);
                            transactionToSend_1.error = respond;
                            if (!transaction.error)
                                transaction.error = [];
                            transaction.error.push(respond);
                        }
                        transactionToSend_1.result = respond.result;
                        return transactionToSend_1;
                    }).done(function (result) {
                        sendNext(i);
                    }).fail(deferred.reject);
                }
                else {
                    if (!transaction.error)
                        transaction.success = 'success';
                    deferred.resolve(transaction);
                }
            };
            sendNext(-1);
            return deferred.promise();
        };
        EthereumService.prototype.downloadBalances = function (addresses) {
            var request = new RequestDownloadBalancesETH();
            return request.downloadBalances(addresses, this.config.urlBalance, 10);
        };
        EthereumService.prototype.restoreHistory = function (startIndex) {
            var _this = this;
            var promise = $.Deferred();
            var history = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            history.parse = function (res) {
                return res.result.map(function (item) {
                    return EthereumService.mapTransaction(item);
                });
            };
            history.restoreHistory('receive', 0).done(function (resultHistory) {
                var balances = resultHistory.balances;
                if (balances.length === 0) {
                    promise.resolve({ balancesReceive: [], balancesChange: null, transactions: [] });
                }
                var addresses = _.map(balances, 'id');
                _this.downloadBalances(addresses).done((function (result) {
                    //console.log(balances.length +'  '+result.length);
                    var indexed = _.keyBy(result, 'id');
                    balances.forEach(function (item) {
                        var bal = indexed[item.id];
                        if (bal) {
                            item.balance = bal.balance;
                            item.decimal = bal.decimal;
                            item.timestamp = Math.ceil(Date.now() / 1000);
                        }
                        else {
                            console.warn('  no balance for ' + item.id);
                        }
                    });
                    promise.resolve({ balancesReceive: balances, balancesChange: null, transactions: resultHistory.transactions });
                })).fail(promise.reject);
            }).fail(promise.reject);
            return promise;
        };
        //////////////////////////////////////    Generator
        EthereumService.prototype.addKeyPairToBalances = function (balances) {
            var _this = this;
            var i;
            balances.forEach(function (balance) {
                // console.log(balance);
                var address = balance.id;
                i = _this.db.getAddressesReceive().indexOf(address);
                balance.keyPair = _this.getKeyPairReceive(i);
            });
        };
        EthereumService.prototype.getKeyPairReceive = function (index) {
            return this.generator.generateKeyPairReceive(index);
        };
        EthereumService.prototype.getSignatureForIndex = function (index) {
            //  console.error(index);
            return this.generator.getSignatureForIndex(index);
        };
        EthereumService.prototype.downlaodUTXOs = function (addresses) {
            return null;
        };
        return EthereumService;
    }());
    jaxx.EthereumService = EthereumService;
    var RequestDownloadBalances = (function () {
        function RequestDownloadBalances() {
        }
        RequestDownloadBalances.prototype.downloadBalances = function (addresses, urlTemplate, length) {
            if (length === void 0) { length = 20; }
            var deferred = $.Deferred();
            var urlT = urlTemplate;
            var idsChunks = _.chunk(addresses, length);
            var i = -1;
            var results = [];
            this._downloadBalances(urlT, i, idsChunks, results, deferred);
            return deferred.promise();
        };
        RequestDownloadBalances.prototype._downloadBalances = function (urlT, i, idsChunks, results, deferred) {
            var _this = this;
            i++;
            if (i >= idsChunks.length) {
                deferred.resolve(results);
                return;
            }
            var isDataReceived = false;
            var waitTime = 20000;
            var url = urlT.replace('{{addresses}}', idsChunks[i].toString());
            var request = $.getJSON(url).done(function (res) {
                if (res.message !== 'NOTOK') {
                    isDataReceived = true;
                    var ar = _this.parser(res, url);
                    if (ar.length)
                        results = results.concat(ar);
                    setTimeout(function () { return _this._downloadBalances(urlT, i, idsChunks, results, deferred); }, 200);
                }
                else {
                    deferred.reject(new VOError('ethservice', '', res, 'ETH'));
                }
            }).fail(function (err) {
                isDataReceived = true;
                console.error(err, url);
                deferred.reject(new VOError('serverstable', 'Cant collect balances for all addresses', {}, 'ETH'));
            });
            setTimeout(function () {
                if (!isDataReceived) {
                    console.error(' timeout on url  ', url);
                    request.abort();
                    deferred.reject(new VOError('serverstable', 'Cant collect balances for all addresses', {}, 'ETH'));
                }
            }, waitTime);
        };
        return RequestDownloadBalances;
    }());
    jaxx.RequestDownloadBalances = RequestDownloadBalances;
    var RequestDownloadBalancesETH = (function (_super) {
        __extends(RequestDownloadBalancesETH, _super);
        function RequestDownloadBalancesETH() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RequestDownloadBalancesETH.prototype.parser = function (result, url) {
            return result.result.map(function (item) {
                return new VOBalance({
                    id: item.account,
                    balance: item.balance,
                    decimal: +item.balance / 1e18,
                    timestamp: Date.now()
                });
            });
        };
        return RequestDownloadBalancesETH;
    }(RequestDownloadBalances));
    jaxx.RequestDownloadBalancesETH = RequestDownloadBalancesETH;
    var RequestDownloadBalancesETC = (function (_super) {
        __extends(RequestDownloadBalancesETC, _super);
        function RequestDownloadBalancesETC() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RequestDownloadBalancesETC.prototype.parser = function (result, url) {
            // console.log(result);
            var out = [];
            for (var str in result)
                out.push(new VOBalance({
                    id: str,
                    balance: result[str],
                    decimal: result[str] / 1e18,
                    timestamp: Date.now()
                }));
            return out;
        };
        return RequestDownloadBalancesETC;
    }(RequestDownloadBalances));
    jaxx.RequestDownloadBalancesETC = RequestDownloadBalancesETC;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=ethereum-service.js.map