/**
 * Created by Vlad on 2017-07-13.
 */
var jaxx;
(function (jaxx) {
    var InsightApi = (function () {
        function InsightApi(config, generator1, generator2) {
            // for (let str in config) this[str] = config[str]
            this.config = config;
            this.generator = generator2 ? generator2 : generator1;
        }
        InsightApi.prototype.downlaodNonces = function (addresses) {
            return null;
        };
        InsightApi.prototype.lastBlock = function () {
            var url = this.config.urlLastBlock;
            return $.getJSON(url)
                .then(function (result) {
                return Number(result.info.blocks);
            });
        };
        InsightApi.prototype.stopAll = function () {
        };
        InsightApi.prototype.sendTransaction = function (transaction) {
            var url = this.config.urlSendTransaction;
            var hex = transaction.hex;
            //  console.log(url);
            // console.log(hex);
            var deferred = $.Deferred();
            // deferred.resolve(transaction);
            $.post(url, { rawtx: hex })
                .done(function (res) {
                console.log(res);
                transaction.success = 'success';
                deferred.resolve(transaction);
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
        InsightApi.removeDuplicatesUTXOs = function (ar) {
            var testObj = {};
            for (var i = ar.length - 1; i >= 0; i--) {
                var utxo = ar[i];
                var uid = utxo.address + utxo.txid + utxo.satoshis;
                if (testObj[uid])
                    ar.splice(i, 1);
                testObj[uid] = true;
            }
        };
        InsightApi.mapBitcoinUTXO = function (ar) {
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
        InsightApi.prototype.downlaodUTXOs = function (addresses) {
            var deffered = jQuery.Deferred();
            var url = this.config.urlUTXOs;
            url = url.replace('{{addresses}}', addresses.toString());
            //  console.log(url);
            $.getJSON(url)
                .then(function (result) {
                var utxos;
                try {
                    utxos = InsightApi.mapBitcoinUTXO(result);
                    InsightApi.removeDuplicatesUTXOs(utxos);
                }
                catch (e) {
                    deffered.reject(e);
                }
                if (utxos) {
                    deffered.resolve(utxos);
                }
            });
            return deffered.promise();
        };
        InsightApi.prototype.downloadTransactionsDetails = function (transactions) {
            //  console.log(transactions);
            var urlDetails = this.config.urlTransactionsDetails;
            var txIds = _.map(transactions, 'id');
            var deffered = jQuery.Deferred();
            var results = [];
            var i = 0;
            var self = this;
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var txid = txIds[i];
                var url = urlDetails.replace('{{txid}}', txid);
                //   console.log(url);
                $.getJSON(url).done(function (res) {
                    //  console.log(res)
                    //  console.log('downloadNext res '+i, res1);
                    onSuccess(self.parseTransaction(res));
                    onSuccess(res);
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (result) {
                results.push(result);
                if (++i >= txIds.length) {
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
        InsightApi.prototype.parseTransaction = function (data) {
            return InsightApi.parseTransaction(data);
        };
        InsightApi.parseTransaction = function (item) {
            //console.log('parseTransaction ', item);
            var t = new VOTransaction({
                id: item.txid,
                block: item.blockheight < 0 ? 0 : item.blockheight,
                from: item.vin[0].addr,
                timestamp: item.blocktime || item.time,
                confirmations: item.confirmations
            });
            t.tos = item.vout.reduce(function (sum, item) {
                return sum.concat(item.scriptPubKey.addresses);
            }, []);
            t.values = item.vout.map(function (item) {
                return +item.value;
            });
            t.total = item.vin.reduce(function (sum, vin) {
                sum += +vin.value;
            }, 0);
            t.miningFee = item.fees.toPrecision(2);
            return t;
        };
        InsightApi.transactionsParserOLd = function (result, address) {
            var out = [];
            for (var str in result) {
                var trxs = result[str];
                trxs.forEach(function (item) {
                    var t = InsightApi.parseTransaction(item);
                    out.push(t);
                });
            }
            return out;
        };
        InsightApi.transactionsParserNew = function (trxs, address) {
            return trxs.map(function (item) {
                return InsightApi.parseTransaction(item);
            });
        };
        InsightApi.prototype.transactionsParser = function (result, address) {
            return result.byAddress ? InsightApi.transactionsParserOLd(result.byAddress, address) : InsightApi.transactionsParserNew(result.items, address);
        };
        InsightApi.prototype.restoreHistory = function (receiveIndex, changeIndex) {
            var _this = this;
            /// console.warn(this);
            var deffered = jQuery.Deferred();
            //console.log(this.config);
            var restore1 = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            restore1.parse = this.transactionsParser;
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
                            transactions: transactions
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
                            transactions: transactions
                        });
                });
            }).fail(deffered.reject);
            var restore2 = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            restore2.parse = this.transactionsParser; //ServiceMappers.mapTransactionsInsight;
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
                            transactions: transactions
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
                            transactions: transactions
                        });
                });
                // console.warn(res2)
            }).fail(deffered.reject);
            return deffered;
        };
        InsightApi.prototype.downloadBalances = function (addresses) {
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
                        //console.log(' BitcoinBalance  ' +address +'  ' + res2 +'  ');
                        var balance2 = jaxx.ServiceMappers.mapBitcoinBalance(address, res2, false);
                        balance1.decimal = (+balance1.balance + +balance2.balance) / 1e8;
                        balance1.timestamp = Date.now();
                        balance1.balance = jaxx.MATH.sum([balance1.balance, balance2.balance]);
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
        InsightApi.prototype.downloadTransactions = function (addresses) {
            var deffered = $.Deferred();
            // console.log('downloadTransactions  ', addresses.length);
            var results = [];
            var urlTrans = this.config.urlTransactions;
            var urlTransDetails = this.config.urlTransactionsDetails;
            var i = 0;
            var self = this;
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var address = addresses[i];
                var url = urlTrans.replace('{{address}}', address);
                //console.log(url);
                $.getJSON(url).done(function (res1) {
                    //console.log('downloadNext res ' + i, res1);
                    var out = self.transactionsParser(res1, address);
                    onSuccess(out);
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
        return InsightApi;
    }());
    jaxx.InsightApi = InsightApi;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=insight-api.js.map