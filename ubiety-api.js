/**
 * Created by jnewlands on 2017-SEP-01.
 */
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
    var UbietyApi = (function (_super) {
        __extends(UbietyApi, _super);
        function UbietyApi(config, db, generator) {
            return _super.call(this, config, generator) || this;
            // for (let str in config) this[str] = config[str]
        }
        UbietyApi.prototype.lastBlock = function () {
            var url = this.config.urlLastBlock;
            return $.getJSON(url)
                .then(function (result) {
                //console.log(result);
                return result.height || 0;
            });
        };
        UbietyApi.prototype.downloadBalances = function (addresses) {
            var deffered = jQuery.Deferred();
            // console.log('downloadBalances ', addresses);
            var results = [];
            var urlBalance = this.config.urlBalance;
            var urlBalanceUnconfirmed = this.config.urlBalanceUnconfirmed;
            var i = 0;
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var address = addresses[i];
                var url = urlBalance.replace('{{address}}', address);
                //console.log(url);
                $.getJSON(url).done(function (res1) {
                    //  console.log('downloadNext res '+i, res1);
                    var balance1 = jaxx.ServiceMappers.mapBitcoinBalance(address, res1, true);
                    url = urlBalanceUnconfirmed.replace('{{address}}', address);
                    $.getJSON(url).done(function (res2) {
                        var balance2 = jaxx.ServiceMappers.mapBitcoinBalance(address, res2, false);
                        if (balance1.balance !== balance2.balance) {
                            balance1.decimal = (+balance1.balance + +balance2.balance) / 1e8;
                            balance1.balance = jaxx.MATH.sum([balance1.balance, balance2.balance]);
                        }
                        balance1.timestamp = Date.now();
                        onSuccess(balance1);
                    }).fail(function (err) { return onFail(err); });
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (balance) {
                results.push(balance);
                if (++i >= addresses.length) {
                    //   console.log(results)
                    deffered.resolve(results);
                }
                else
                    downloadNext(onDone, onError);
            };
            var onError = function (err) {
                deffered.reject(err);
            };
            downloadNext(onDone, onError);
            return deffered.promise();
            /// return this.crypto_class.downloadBalances(addresses);
        };
        UbietyApi.prototype.sendTransaction = function (transaction) {
            var url = this.config.urlSendTransaction;
            var hex = transaction.hex;
            var deferred = $.Deferred();
            $.post(url, { rawtx: hex })
                .done(function (res) {
                if (res.txid) {
                    transaction.success = 'success';
                    deferred.resolve(transaction);
                }
                else
                    deferred.reject(res);
            }).fail(function (err) {
                deferred.reject(err);
            });
            /*$.ajax(url, {
                complete: function(ajaxRequest, status) {
                    console.log(status, ajaxRequest);
                    if (status === 'success')     deferred.resolve(JSON.stringify(ajaxRequest.responseText));
                    else  deferred.resolve({error:ajaxRequest.responseText});

                },
                contentType: 'application/x-www-form-urlencoded',
                data: "transaction="+ hex,
                type: 'PUT'
            });*/
            return deferred.promise();
        };
        UbietyApi.mapBitcoinUTXO = function (ar) {
            return ar.map(function (item) {
                return new VOutxo({
                    decimal: +item.amount,
                    address: item.address,
                    vout: item.vout,
                    block: item.height,
                    confirmations: item.confirmations,
                    satoshis: item.satoshis + '',
                    amount: item.amount,
                    txid: item.txid,
                    scriptPubKey: item.scriptPubKey,
                    timestamp: Date.now()
                });
            });
        };
        UbietyApi.prototype.downlaodUTXOs = function (addresses) {
            var deffered = jQuery.Deferred();
            var url = this.config.urlUTXOs;
            url = url.replace('{{addresses}}', addresses.toString());
            //  console.log(url);
            $.getJSON(url)
                .then(function (result) {
                //   console.log('UTXOs ', result);
                jaxx.InsightApi.mapBitcoinUTXO(result);
                var utxos = jaxx.InsightApi.mapBitcoinUTXO(result);
                jaxx.InsightApi.removeDuplicatesUTXOs(utxos);
                deffered.resolve(utxos);
            });
            return deffered.promise();
        };
        UbietyApi.parseTransaction = function (item) {
            //  console.log(item);
            if (!item.txid || !item.vin) {
                console.warn(item);
                return null;
            }
            var t = new VOTransaction({
                id: item.txid,
                block: item.block,
                from: item.vin.length ? item.vin[0].addr : 'BTC',
                timestamp: item.blocktime,
                confirmations: item.confirmations
            });
            t.total = item.vin.reduce(function (sum, vin) {
                return sum += +vin.value;
            }, 0);
            t.values = item.vout.map(function (item) {
                return +item.value;
            });
            t.tos = item.vout.reduce(function (sum, item) {
                return sum.concat(item.scriptPubKey.addresses);
            }, []);
            t.miningFee = (t.total - _.sum(t.values)).toPrecision(2);
            return t;
        };
        UbietyApi.prototype.downloadTransactionsDetails = function (transactions) {
            //  let urlTemplate = this.config.urlTransactionsDetails;
            var deffered = $.Deferred();
            if (transactions.length === 0) {
                deffered.resolve(transactions);
                return deffered.promise();
            }
            var idsAll = _.map(transactions, 'id');
            //let idsChunks = _.chunk(idsAll, 10);
            var results = [];
            var urlTemplate = this.config.urlTransactionsDetails;
            // let urlBalanceUnconfirmed = this.urlBalanceUnconfirmed;
            var i = 0;
            var valid = idsAll.every(function (item) {
                return !!item && !_.isUndefined(item);
            });
            if (!valid) {
                console.error(idsAll);
                deffered.reject(idsAll);
                return deffered.promise();
            }
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var txid = idsAll[i];
                if (!txid || _.isUndefined(txid)) {
                    console.error(idsAll, i);
                    onFail(idsAll);
                    return;
                }
                var url = urlTemplate.replace('{{txid}}', txid);
                //  console.log(turl);
                $.getJSON(url).done(function (res1) {
                    ///console.log(res1);
                    var out = UbietyApi.parseTransaction(res1); //
                    // console.log(out);
                    if (!out) {
                        console.warn(url, out);
                        onError(new VOError('ubiety.downloadTransactionsDetails no details', url, {}, 'BCH'));
                    }
                    else
                        onSuccess(out);
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (result) {
                if (result)
                    results = results.concat(result);
                if (++i >= idsAll.length) {
                    //   console.log(results)
                    deffered.resolve(results);
                }
                else
                    downloadNext(onDone, onError);
            };
            var onError = function (err) {
                deffered.reject(err);
            };
            downloadNext(onDone, onError);
            return deffered.promise();
        };
        UbietyApi.prototype.restoreHistory = function (receiveIndex, changeIndex) {
            var _this = this;
            var deffered = jQuery.Deferred();
            var restore1 = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            restore1.parse = this.transactionsIdsParser;
            var transactions = [];
            var balancesChange;
            var balancesReceive;
            var receiveDone;
            var changeDone;
            restore1.restoreHistory('receive', receiveIndex).done(function (res1) {
                // console.warn('receive ', res1);
                transactions = _.uniqBy(transactions.concat(res1.transactions), 'id');
                // let addresses1: string[] = res1.addresses;
                var balances1 = res1.balances;
                if (balances1.length === 0) {
                    receiveDone = true;
                    balancesReceive = [];
                    if (changeDone) {
                        deffered.resolve({
                            balancesChange: balancesChange,
                            balancesReceive: balancesReceive,
                            transactionsids: transactions
                        });
                    }
                    return;
                }
                _this.downloadBalances(_.map(balances1, 'id')).done(function (balancesRes) {
                    var indexed = _.keyBy(balancesRes, 'id');
                    balances1.forEach(function (item) {
                        var bal = indexed[item.id];
                        item.balance = bal.balance;
                        item.decimal = bal.decimal;
                    });
                    //   console.log(balances1);
                    receiveDone = true;
                    balancesReceive = balances1;
                    if (changeDone)
                        deffered.resolve({
                            balancesChange: balancesChange,
                            balancesReceive: balancesReceive,
                            transactionsids: transactions
                        });
                });
            }).fail(deffered.reject);
            var restore2 = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            restore2.parse = this.transactionsIdsParser;
            restore2.restoreHistory('change', changeIndex).done(function (res2) {
                // console.warn('change ', res2);
                transactions = _.uniqBy(transactions.concat(res2.transactions), 'id');
                // let addresses2: string[] = res2.addresses;
                var balances2 = res2.balances;
                if (balances2.length == 0) {
                    changeDone = true;
                    balancesChange = [];
                    if (receiveDone) {
                        deffered.resolve({
                            balancesChange: balancesChange,
                            balancesReceive: balancesReceive,
                            transactionsids: transactions
                        });
                    }
                    return;
                }
                _this.downloadBalances(_.map(balances2, 'id')).done(function (balancesRes) {
                    //   console.log(balances2);
                    var indexed = _.keyBy(balancesRes, 'id');
                    balances2.forEach(function (item) {
                        var bal = indexed[item.id];
                        item.balance = bal.balance;
                        item.decimal = bal.decimal;
                    });
                    balancesChange = balances2;
                    changeDone = true;
                    if (receiveDone)
                        deffered.resolve({
                            balancesChange: balancesChange,
                            balancesReceive: balancesReceive,
                            transactionsids: transactions
                        });
                });
                // console.warn(res2)
            }).fail(deffered.reject);
            return deffered;
        };
        UbietyApi.prototype.transactionsIdsParser = function (result, address) {
            return result.map(function (item) {
                return new VOTransaction({
                    id: item.txid,
                    txid: item.txid
                });
            });
        };
        UbietyApi.prototype.downloadTransactions = function (addresses) {
            var deffered = $.Deferred();
            console.log('   downloadTransactions  ', addresses.length);
            if (addresses.length === 0) {
                return deffered.resolve([]).promise();
            }
            var self = this;
            var results = [];
            var urlTrans = this.config.urlTransactions;
            var urlDetails = this.config.urlTransactionsDetails;
            var urlTransDetails = this.config.urlTransactionsDetails;
            var i = 0;
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var address = addresses[i];
                var url = urlTrans.replace('{{address}}', address);
                //console.log(url);
                $.getJSON(url).done(function (res1) {
                    //console.log('downloadNext res ' + i, res1);
                    var txids = self.transactionsIdsParser(res1, address);
                    // console.log(txids);
                    self.downloadTransactionsDetails(txids).done(function (transaction) {
                        //console.log(transaction);
                        onSuccess(transaction);
                    });
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (trs) {
                results = results.concat(trs);
                if (++i >= addresses.length) {
                    //   console.log(results)
                    deffered.resolve(results);
                }
                else
                    downloadNext(onDone, onError);
            };
            var onError = function (err) {
                deffered.reject(err);
            };
            downloadNext(onDone, onError);
            return deffered.promise();
        };
        return UbietyApi;
    }(jaxx.InsightApi));
    jaxx.UbietyApi = UbietyApi;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=ubiety-api.js.map