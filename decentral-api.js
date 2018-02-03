/**
 * Created by Vlad on 2017-07-13.
 */
///<reference path="../com/math.ts"/>
var jaxx;
(function (jaxx) {
    var DecentralApi = (function () {
        function DecentralApi(config, generator1, generator2) {
            this.config = config;
            this.generator = generator2 ? generator2 : generator1;
            for (var str in config)
                this[str] = config[str];
        } //  console.log(config)
        DecentralApi.prototype.downlaodNonces = function (addresses) {
            return null;
        };
        DecentralApi.prototype.stopAll = function () {
        };
        DecentralApi.prototype.lastBlock = function () {
            var url = this.config.urlLastBlock;
            return $.getJSON(url)
                .then(function (result) {
                return Number(result.height);
            });
        };
        DecentralApi.prototype.sendTransaction = function (transaction) {
            var hex = transaction.hex;
            var tosend;
            var url = this.config.urlSendTransaction;
            var deferred = $.Deferred();
            // promise.resolve(transaction);
            // console.log(url);
            $.ajax(url, {
                complete: function (ajaxRequest, status) {
                    console.log(ajaxRequest.responseText);
                    if (status === 'success') {
                        transaction.success = status;
                        deferred.resolve(transaction);
                    }
                    else {
                        deferred.reject({
                            error: ajaxRequest.responseText,
                            status: status
                        });
                    }
                },
                contentType: 'application/x-www-form-urlencoded',
                data: "transaction=" + hex,
                type: 'PUT'
            });
            return deferred.promise();
        };
        DecentralApi.prototype.downlaodUTXOs = function (addresses) {
            var deffered = $.Deferred();
            var url = this.config.urlUTXOs;
            url = url.replace('{{addresses}}', addresses.toString());
            //  console.log(url);
            $.get(url)
                .done(function (res) {
                //  console.log(res);
                var utxos = jaxx.ServiceMappers.mapUTXOsDecentral(res);
                //remove duplicates
                utxos = _.uniqBy(utxos, function (utxo) {
                    return [utxo.address, utxo.txid].join();
                });
                // console.log(utxos);
                deffered.resolve(utxos);
            });
            return deffered.promise();
        };
        DecentralApi.prototype.downloadTransactionsDetails = function (transactions) {
            // console.log('downloadTransactionsDetails  ', Utils.deepCopy(transactions));
            var deffered = $.Deferred();
            if (transactions.length === 0) {
                deffered.resolve(transactions);
                return deffered.promise();
            }
            var idsAll = _.map(transactions, 'id');
            var idsChunks = _.chunk(idsAll, 10);
            var results = [];
            var url = this.config.urlTransactionsDetails;
            // let urlBalanceUnconfirmed = this.urlBalanceUnconfirmed;
            var i = 0;
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var ids = idsChunks[i];
                if (!ids) {
                    console.error(idsChunks, i);
                    onFail();
                    return;
                }
                var turl = url.replace('{{trs-ids}}', ids.toString());
                // console.log(turl);
                $.getJSON(turl).done(function (res1) {
                    //    console.log(res1);
                    var out = jaxx.ServiceMappers.mapTransactionsDecentral(res1);
                    //
                    //  console.log(out);
                    onSuccess(out);
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (result) {
                results = results.concat(result);
                if (++i >= idsChunks.length) {
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
        DecentralApi.prototype.restoreHistory = function (receiveIndex, changeIndex) {
            var _this = this;
            //  console.warn('restoreHistory   ')
            var deffered = $.Deferred();
            var changeDone = false;
            var receiveDone = false;
            var onDone = function () {
                if (changeDone && receiveDone) {
                    deffered.resolve({
                        balancesChange: balancesChange,
                        balancesReceive: balancesReceive,
                        transactions: null,
                        transactionsids: transactions
                    });
                }
            };
            var restore1 = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            restore1.parse = function (res, address) {
                var trs = [];
                var _loop_1 = function (str) {
                    var ar = res[str];
                    ar.forEach(function (item) {
                        trs.push(new VOTransaction({
                            address: str,
                            id: item
                        }));
                    });
                };
                for (var str in res) {
                    _loop_1(str);
                }
                return trs;
            };
            var transactions = [];
            var balancesChange;
            var balancesReceive;
            restore1
                .restoreHistory('receive', receiveIndex)
                .done(function (res1) {
                //  console.log(res1);
                transactions = _.uniqBy(transactions.concat(res1.transactions), 'id');
                // let addresses1: string[] = res1.addresses;
                var balances1 = res1.balances;
                if (balances1.length === 0) {
                    balancesReceive = [];
                    receiveDone = true;
                    onDone();
                    return;
                }
                _this.downloadBalances(_.map(balances1, 'id')).done(function (balancesRes1) {
                    var indexed = _.keyBy(balancesRes1, 'id');
                    balances1.forEach(function (item) {
                        var bal = indexed[item.id];
                        if (bal) {
                            item.balance = bal.balance;
                            item.decimal = bal.decimal;
                        }
                        else
                            console.warn(' no balance ' + item.id);
                    });
                    // console.log(balances1);
                    balancesReceive = balances1;
                    receiveDone = true;
                    onDone();
                }).fail(deffered.reject);
            }).fail(deffered.reject);
            var restore2 = new jaxx.RestoreHistoryInsight(this.config, this.generator);
            restore2.parse = function (res, address) {
                var trs = [];
                var _loop_2 = function (str) {
                    var ar = res[str];
                    ar.forEach(function (item) {
                        trs.push(new VOTransaction({
                            addres: str,
                            id: item
                        }));
                    });
                };
                for (var str in res) {
                    _loop_2(str);
                }
                return trs;
            };
            restore2
                .restoreHistory('change', changeIndex).done(function (res2) {
                transactions = _.uniqBy(transactions.concat(res2.transactions), 'id');
                // console.log(' history restore change ', res2);
                // let addresses2: string[] = res2.addresses;
                var balances2 = res2.balances;
                if (balances2.length === 0) {
                    balancesChange = [];
                    changeDone = true;
                    onDone();
                    return;
                }
                _this.downloadBalances(_.map(balances2, 'id'))
                    .done(function (balancesRes) {
                    var indexed = _.keyBy(balancesRes, 'id');
                    balances2.forEach(function (item) {
                        var bal = indexed[item.id];
                        if (bal) {
                            item.balance = bal.balance;
                            item.decimal = bal.decimal;
                        }
                        else
                            console.warn(' no balance ' + item.id);
                    });
                    balancesChange = balances2;
                    changeDone = true;
                    onDone();
                }).fail(deffered.reject);
                // console.warn(res2)
            }).fail(deffered.reject);
            return deffered;
        };
        //urlUTXO: string;
        //urlBalance: string;
        // urlBalanceUnconfirmed: string;
        DecentralApi.prototype.downloadBalances = function (addressesOrig) {
            var errors = addressesOrig.filter(function (item) {
                return item.length < 20;
            });
            if (errors.length)
                console.error(' some address wrong : length<20', addressesOrig);
            var deffered = $.Deferred();
            var addressesChunks = _.chunk(addressesOrig, 10);
            ;
            // console.warn('downloadBalances ', addressesOrig.length);
            var results = [];
            var urlBalance = this.config.urlBalance;
            // let urlBalanceUnconfirmed = this.config.urlBalanceUnconfirmed;
            var i = 0;
            var downloadNext = function (onSuccess, onFail) {
                var addresses = addressesChunks[i];
                //console.log(' downloadNext  ' + i + addresses);
                var url = urlBalance.replace('{{addresses}}', addresses.toString());
                //console.log(url);
                $.getJSON(url).done(function (res1) {
                    var out = [];
                    // console.log(' downloadBalances Next res ' + i, res1);
                    for (var str in res1) {
                        var item = res1[str];
                        var error = (item.unconfirmed.amount == item.confirmed.amount);
                        var balance = new VOBalance({ id: str });
                        //if(item.unconfirmed.amount !== item.confirmed.amount){
                        balance.decimal = Number(item.confirmed.amount) + (error ? 0 : Number(item.unconfirmed.amount));
                        var confirmed = item.confirmed.amount;
                        balance.balance = '0';
                        if (confirmed !== '0')
                            balance.balance = jaxx.MATH.btcToSatoshi(confirmed);
                        var unconfirmed = item.unconfirmed.amount;
                        if (unconfirmed !== '0' && !error) {
                            unconfirmed = jaxx.MATH.btcToSatoshi(unconfirmed);
                            balance.balance = jaxx.MATH.sum([balance.balance, unconfirmed]);
                        }
                        out.push(balance);
                        // }
                    }
                    onSuccess(out);
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (balance) {
                results = results.concat(balance);
                if (++i >= addressesChunks.length) {
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
        DecentralApi.prototype.downloadTransactions = function (addresses) {
            var deffered = $.Deferred();
            var symbol = this.config.symbol;
            // console.log('downloadTransactions  ', addresses.length);
            var results = [];
            var urlTrans = this.config.urlTransactions;
            var unconfirmed = this.config.urlTransactionsUnconfirmed;
            var urlTransDetails = this.config.urlTransactionsDetails;
            var i = 0;
            var downloadNext = function (onSuccess, onFail) {
                //console.log(' downloadNext  ' + i);
                var address = addresses[i];
                var url1 = urlTrans.replace('{{address}}', address);
                //  console.log(url1);
                $.getJSON(url1).done(function (res1) {
                    //  console.log('downloadNext res '+i, res1);
                    var txids = _.values(res1)[0];
                    /// console.log(txids);
                    var urlU = unconfirmed.replace('{{address}}', address);
                    $.getJSON(urlU).done(function (resU) {
                        txids = _.uniq(txids.concat(_.values(resU)[0]));
                        // console.log(txids);
                        if (txids.length === 0) {
                            onSuccess([]);
                            return;
                        }
                        var url2 = urlTransDetails;
                        url2 = url2.replace('{{trs-ids}}', txids.toString());
                        //  console.log(url2);
                        $.getJSON(url2).done(function (res2) {
                            // console.log(res2);
                            var out = jaxx.ServiceMappers.mapTransactionsDecentral(res2);
                            //   console.log(out);
                            // console.log(out.length)
                            out = _.uniqBy(out, 'txid');
                            //  console.log(out);
                            onSuccess(out);
                        }).fail(function (err) { return onFail(err); });
                    });
                }).fail(function (err) { return onFail(err); });
            };
            var onDone = function (result) {
                results = results.concat(result);
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
        return DecentralApi;
    }());
    jaxx.DecentralApi = DecentralApi;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=decentral-api.js.map