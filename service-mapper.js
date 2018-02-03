/**
 * Created by Vlad on 10/9/2016.
 */
///<reference path="./models.ts"/>
///<reference path="./Utils.ts"/>
var jaxx;
(function (jaxx) {
    var ServiceMappers = (function () {
        function ServiceMappers() {
        }
        ServiceMappers.mapUTXOsDecentral = function (result) {
            var out = [];
            var obj = result;
            var _loop_1 = function (str) {
                var item = obj[str];
                var utxos = item.map(function (item) {
                    return new VOutxo({
                        address: str,
                        vout: item.vout,
                        amount: item.amount,
                        decimal: +item.amount,
                        block: item.confirmed,
                        satoshis: jaxx.MATH.btcToSatoshi(item.amount),
                        txid: item.txhash
                    });
                });
                out = out.concat(utxos);
            };
            for (var str in obj) {
                _loop_1(str);
            }
            return out;
        };
        ServiceMappers.mapTransactionsDecentral = function (result) {
            var out = [];
            var obj = result;
            for (var str in obj) {
                var item = obj[str];
                var t = new VOTransaction({
                    id: item.hash,
                    block: item.height,
                    from: item.vin[0].address,
                    timestamp: item.time_utc ? Math.ceil((new Date(item.time_utc)).getTime() / 1000) : Math.ceil(item.storedTime / 1e3),
                    confirmations: item.confirmations
                });
                //  console.log(item);
                t.tos = item.vout.map(function (item) {
                    return item.address;
                });
                t.values = item.vout.map(function (item) {
                    return +item.amount;
                });
                t.total = item.vin.reduce(function (sum, vin) {
                    return sum += -vin.amount;
                }, 0);
                t.miningFee = (t.total - _.sum(t.values)).toPrecision(2);
                ///console.log(t);
                out.push(t);
            }
            return out;
        };
        /*static mapTransactionsInsight(result):VOTransaction[]{

            let out:VOTransaction[] = [];
            let obj = result.byAddress;

            for(let str in obj){

                let trxs:any[] = obj[str];

                trxs.forEach(function (item) {

                    let t:VOTransaction = new VOTransaction({
                        id:item.txid,
                        block:item.blockheight,
                        form:item.vin[0].addr,
                        timestamp:item.blocktime,
                        confirmations:item.confirmations
                    });

                    t.tos = item.vout.reduce(function (sum, item) {
                        return sum.concat(item.scriptPubKey.addresses);
                    },[]);

                    t.values = item.vout.map(function (item) {
                        return +item.value;
                    });

                    t.total = item.vin.reduce(function (sum, vin) {
                        sum+=+vin.value;
                    },0);

                    out.push(t);

                })

            }

            return out

        }
*/
        ServiceMappers.mapBitcoinUTXO = function (ar) {
            return ar.map(function (item) {
                return new VOutxo({
                    decimal: +item.amount / 1e8,
                    address: item.address,
                    vout: item.vout,
                    block: item.height,
                    confirmations: item.confirmations,
                    satoshis: item.satoshis + '',
                    amount: item.amount,
                    timestamp: Date.now()
                });
            });
        };
        ServiceMappers.mapBitcoinBalance = function (address, data, confirmed) {
            return new VOBalance({ id: address, balance: String(data), confirmed: confirmed });
        };
        ServiceMappers.parseTransactionsETHjaxxio = function (respond, address) {
            return respond.map(function (item) {
                if (item.timeStamp)
                    item.timestamp = item.timeStamp;
                var date = new Date(+item.timestamp * 1000);
                return new VOTransaction({
                    id: item.hash,
                    address: address,
                    from: item.from,
                    to: item.to,
                    value: (address === item.from) ? -Number(item.value) : Number(item.value),
                    // tax:+item.gasUsed,
                    miningFee: +item.gasUsed,
                    nonce: +item.nonce,
                    confirmations: +item.confirmations,
                    timestamp: +item.timestamp,
                    date: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
                    block: +item.blockNumber,
                });
            });
        };
        ServiceMappers.parseBalanceETHjaxxio = function (respond) {
            var stamp = Math.round(Date.now() / 1000);
            // console.log(respond);
            var out = [];
            for (var str in respond) {
                out.push(new VOBalance({
                    id: str,
                    balance: +respond[str],
                    timestamp: stamp
                }));
            }
            return out;
        };
        ServiceMappers.parseUTXOsBlocker = function (response) {
            if (!Array.isArray(response.data))
                response.data = [response.data];
            var data = response.data;
            var out = [];
            data.forEach(function (addressutxos) {
                var address = addressutxos.address;
                var unspent = addressutxos.unspent;
                out = out.concat(unspent.map(function (item) {
                    return new VOutxo({
                        address: address,
                        amountBtc: item.amount,
                        amount: (+item.amount * 1e8),
                        txid: item.tx,
                        vout: item.n,
                        confirmations: item.confirmations,
                        timestamp: Date.now()
                    });
                }));
            });
            return out;
        };
        ServiceMappers.parseUTXOsCoinfabrikLTC = function (data) {
            var out = [];
            var _loop_2 = function (str) {
                var items = data[str];
                items.forEach(function (item) {
                    out.push(new VOutxo({
                        address: str,
                        amountBtc: item.amount,
                        amount: +item.litoshis,
                        txid: item.txhash,
                        vout: item.vout,
                        confirmations: (item.confirmations || -1)
                    }));
                });
            };
            for (var str in data) {
                _loop_2(str);
            }
            return out;
        };
        ServiceMappers.parseUTXOsCoinfabrikBTC = function (respond) {
            var out = [];
            return respond.map(function (item) {
                return new VOutxo({
                    address: item.address,
                    amountBtc: item.amount + '',
                    amount: +item.satoshis,
                    txid: item.txid,
                    vout: item.vout,
                    confirmations: item.confirmations
                });
            });
        };
        ServiceMappers.parseUTXOsCoinfabrikZCash = function (data) {
            var out = [];
            var _loop_3 = function (str) {
                var items = data[str];
                items.forEach(function (item) {
                    out.push(new VOutxo({
                        address: str,
                        amountBtc: item.amount,
                        amount: +item.zatoshis,
                        txid: item.txhash,
                        vout: item.vout,
                        confirmations: (item.confirmations || -1)
                    }));
                });
            };
            for (var str in data) {
                _loop_3(str);
            }
            return out;
        };
        ServiceMappers.mapBalancesCoinfabric = function (response) {
            var out = [];
            for (var address in response) {
                var item = response[address];
                var ac = +item.confirmed.zatoshis;
                // console.log(address + ' item.confirmed  ', item.confirmed);
                // console.log(address + ' item.unconfirmed  ', item.unconfirmed);
                var uc = +item.unconfirmed.zatoshis;
                if (uc < 0)
                    uc = 0;
                out.push(new VOBalance({
                    id: address,
                    balance: ac + uc
                }));
            }
            return out;
        };
        ServiceMappers.mapUTXOsCoinfabrik = function (data) {
            var out = [];
            var _loop_4 = function (str) {
                var items = data[str];
                items.forEach(function (item) {
                    out.push(new VOutxo({
                        address: str,
                        amountBtc: item.amount,
                        amount: +item.zatoshis,
                        txid: item.txhash,
                        vout: item.vout,
                        confirmations: (item.confirmations || -1)
                    }));
                });
            };
            for (var str in data) {
                _loop_4(str);
            }
            return out;
        };
        ServiceMappers.mapEtherTransactions = function (ar, address) {
            return ar.map(function (item) {
                if (item.timeStamp)
                    item.timestamp = item.timeStamp;
                var date = new Date(+item.timestamp * 1000);
                return new VOTransaction({
                    id: item.hash,
                    address: address,
                    from: item.from,
                    to: item.to,
                    value: (address === item.from) ? -Number(item.value) : Number(item.value),
                    // tax:+item.gasUsed,
                    miningFee: +item.gasUsed,
                    gasUsed: item.gasUsed,
                    gasPrice: item.gasPrice,
                    //nonce:+item.nonce,
                    confirmations: +item.confirmations,
                    timestamp: +item.timestamp,
                    date: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
                    block: +item.blockNumber
                    // address_index:address_index,
                    // receive_change:receive_change
                });
            });
        };
        ServiceMappers.mapBlockrTransactions = function (ar, address) {
            return ar.map(function (item) {
                return new VOTransaction({
                    id: item.tx,
                    address: address,
                    // from:item.from,
                    // to:item.to,
                    value: +item.amount,
                    // miningFee:+item.gasUsed,
                    // nonce:+item.nonce,
                    confirmed: +item.confirmations,
                    timestamp: +item.timeStamp,
                });
            });
        };
        return ServiceMappers;
    }());
    jaxx.ServiceMappers = ServiceMappers;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=service-mapper.js.map