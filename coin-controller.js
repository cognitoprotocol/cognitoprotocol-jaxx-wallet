///<reference path="../com/models.ts"/>
///<reference path="../app/Registry.ts"/>
///<reference path="../com/Utils.ts"/>
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
    // declare let $: any;
    var CoinController = (function (_super) {
        __extends(CoinController, _super);
        function CoinController(config) {
            var _this = _super.call(this, config) || this;
            // intervalAllBalancesCheckDefault:number ;
            _this.intervalAllBalancesCheckCurrent = 30000;
            _this.intervalCurrentBalanceCheck = 10000;
            _this.spentUTXOs = [];
            _this._coinType = config.coinType;
            _this.init();
            return _this;
        }
        CoinController.prototype.init = function () {
            var _this = this;
            this.miningFeeController = new jaxx.MiningFeeController(this.config, this._db);
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_SATUS_CHANGED, function (evt, name, enbl) {
                console.log(name, enbl);
                if (name == _this.name) {
                    _this.enabled = enbl;
                }
            });
            // let updateOptions = {updateTimeout: 10000, confirmations: 12};
            //if (this.name.indexOf('Ethereum') === -1) updateOptions.confirmations = 6;
        };
        // interface to retrieve mining fee value according user set option
        CoinController.prototype.getMiningFeeValueCtr = function () {
            return this.miningFeeController;
        };
        // interface to retrieve user option for mining fee
        CoinController.prototype.getIMiningFeeOptionCtr = function () {
            return this.miningFeeController;
        };
        CoinController.prototype.getDisplayBalance = function (balance) {
            return jaxx.MATH.satoshiToBtc(balance);
        };
        CoinController.prototype.getBalanceDisplay = function () {
            if (this.isRestoringHistory)
                return '-1';
            return jaxx.MATH.satoshiToBtc(this.getBalance());
        };
        CoinController.prototype.getBalance = function () {
            //if(this.balanceCache) return this.balanceCache;
            var balances = this._db.getBalancesAll(true);
            if (balances.length === 0)
                return '-1';
            var ar = balances
                .reduce(function (ar, item) { if (item.balance !== '0')
                ar.push(item.balance); return ar; }, []);
            var balance = jaxx.MATH.sum(ar);
            if (!!this.spentBalances && this.spentBalances.length) {
                var spentAr = this.spentBalances.map(function (item) { return item.balance; });
                var spent = jaxx.MATH.sum(spentAr);
                if (+spent > +balance) {
                    console.warn(' spent more! balance: ' + balance + ' spent: ' + spent);
                }
                else {
                    balance = jaxx.MATH.subtract(balance, spent);
                }
            }
            // console.log(this.symbol + ' balance ' + result + ' spent: ' + spent + ' was ' + balance);
            this.balanceCache = balance;
            // if (+res < 0) res = '0';
            // console.log('%c '+this.config.symbol + ' balance: '+ balance, 'color:brown');
            return this.balanceCache;
        };
        //         calculateSpendable(utxos: VOutxo[], spentUtxos: VOutxo[]): string {
        //
        //             let outUTXOS:VOutxo[] = utxos;
        //
        //             console.log(Utils.deepCopy(utxos), Utils.deepCopy(spentUtxos));
        //
        //             if(spentUtxos.length){
        //
        //                 outUTXOS = Utils.subtractUTXOS(utxos, spentUtxos);
        //
        //                 console.log(Utils.deepCopy(outUTXOS));
        //
        //             }
        //
        //
        //             let ar = outUTXOS.map(function (item) {
        //                 return item.satoshis;
        //             });
        //
        //
        //             let total = MATH.sum(ar);
        // /*
        //             spentUtxos.forEach(function (item) {
        //                 total = MATH.subtract(total, item.satoshis);
        //             });*/
        //
        //             let mf = this.getMiningFee();
        //
        //             total = MATH.subtract(total, mf);
        //
        //             console.warn('  calculateSpendable  ' + total);
        //
        //             if (+total < 0) return '0';
        //
        //
        //
        //             // if (MATH.lessAthenB(total, mf)) ;
        //             // console.log(this.name + ' spendable ' + total);
        //
        //             return MATH.satoshiToBtc(total);
        //         }
        CoinController.prototype.getSpendable = function () {
            var utxos = this.getSpendableUTXOs();
            var outUTXOS = utxos;
            if (this.spentUTXOs.length) {
                outUTXOS = jaxx.Utils.subtractUTXOS(utxos, this.spentUTXOs);
            }
            var ar = outUTXOS.map(function (item) {
                return item.satoshis;
            });
            var pricePerbyte = this.getMiningPrice();
            var total = jaxx.MATH.sum(ar);
            //console.log('%c ' +this.config.symbol + ' you have total ' + total, 'color:brown');
            total = this.subtractMiningFee(total, outUTXOS.length);
            if (+total < 0 || isNaN(Number(total))) {
                return '0';
            }
            total = jaxx.MATH.satoshiToBtc(total);
            return total;
        };
        CoinController.prototype.getSpendableBalance = function (callback) {
            var _this = this;
            var cachedUTXOs = this._db.getUTXOsFromCache();
            if (cachedUTXOs === null) {
                this.downloadUTXOs(function () {
                    var downloadedTotal = _this.calculateSpendableFromUTXOs(_this.getUTXOs());
                    callback(downloadedTotal);
                });
            }
            else {
                var retVal = this.calculateSpendableFromUTXOs(cachedUTXOs);
                callback(retVal);
            }
        };
        CoinController.prototype.calculateSpendableFromUTXOs = function (utxos) {
            var bytesPerInput = 148;
            var miningFee = Number(this.getMiningPrice());
            var feeToSpend = (bytesPerInput * miningFee);
            var outUTXOS;
            if (this.symbol === 'BTC') {
                outUTXOS = utxos.filter(function (utxo) {
                    return utxo.amount * 1e8 > feeToSpend;
                });
            }
            else {
                outUTXOS = utxos;
            }
            if (this.spentUTXOs.length) {
                outUTXOS = jaxx.Utils.subtractUTXOS(outUTXOS, this.spentUTXOs);
            }
            var ar = outUTXOS.map(function (item) {
                return item.satoshis;
            });
            var total = jaxx.MATH.sum(ar);
            total = this.subtractMiningFee(total, outUTXOS.length);
            if (+total < 0 || isNaN(Number(total))) {
                return '0';
            }
            total = jaxx.MATH.satoshiToBtc(total);
            return total;
        };
        CoinController.prototype.subtractMiningFee = function (total, length) {
            return this.getMiningFeeValueCtr().subtractMiningFee(total, length);
            // let mf = this.getMiningFee();
            //return MATH.subtract(total, mf);
        };
        CoinController.prototype.getMiningPrice = function () {
            return this.getMiningFeeValueCtr().getMiningFeePerByte();
            //return 200;
        };
        CoinController.prototype.getMiningFeeStatic = function () {
            return this.config.miningFee;
        };
        CoinController.prototype.startDownloadUTXOs = function () {
            var _this = this;
            this.stopDownloadUTXOs();
            this.intervalUTXOs = setInterval(function () {
                _this.downloadUTXOs(null);
            }, 20000);
            this.downloadUTXOs(null);
        };
        CoinController.prototype.stopDownloadUTXOs = function () {
            clearInterval(this.intervalUTXOs);
            this.intervalUTXOs = 0;
        };
        CoinController.prototype.isIntersect = function (spent, server) {
            var indexed = {};
            spent.forEach(function (item) {
                indexed[item.txid + item.address];
            });
            for (var i = 0, n = server.length; i < n; i++) {
                var utxo = server[i];
                if (indexed[utxo.txid + utxo.address])
                    return true;
            }
            return false;
        };
        CoinController.prototype.downloadUTXOs = function (callBack) {
            var _this = this;
            if (!this.isActive) {
                this.stopDownloadUTXOs();
                return;
            }
            if (this.isRestoringHistory)
                return;
            var bals = this.getBalancesNot0();
            var addresses = bals.map(function (item) {
                return item.id;
            });
            var start = Date.now();
            console.log(this.symbol + ' downloadUTXOs ' + addresses.length);
            /* let bals = this._db.getBalancesAll(true);
             let addresses:string[] = [];

             bals.forEach(function (item) {
                 if(item.balance !='0') addresses.push(item.id);
             });*/
            if (addresses.length === 0) {
                if (callBack)
                    callBack();
                return;
            }
            this.coinService.downlaodUTXOs(addresses)
                .done(function (utxos) {
                console.log(_this.symbol + ' downloaded utxos in ' + ((Date.now() - start) / 1000).toPrecision(2) + 'sec', utxos);
                var oldValue = jaxx.MATH.sumUTXOs(_this.getUTXOs());
                var newValue = jaxx.MATH.sumUTXOs(utxos);
                if (_this.spentUTXOs.length) {
                    console.log('spent: ', _this.spentUTXOs);
                }
                if (oldValue !== newValue)
                    jaxx.Registry.walletValue$.triggerHandler(jaxx.Registry.ON_WALLET_VALUE_CHANGE);
                var isInresect = _this.isIntersect(_this.spentUTXOs, utxos);
                if (_this.spentUTXOs.length && !isInresect) {
                    console.log(' spent utxos are removed on server they intersect: ' + isInresect);
                    // if(this._db.getUTXOs().length)
                    _this.spentUTXOs = [];
                }
                _this._db.saveUTXOs(utxos);
                if (callBack)
                    callBack();
            }).fail(function (error) {
                this.onError(error);
                if (callBack)
                    callBack(error);
            });
        };
        CoinController.prototype.deactivate = function () {
            this.miningFeeController.deactivate();
            return _super.prototype.deactivate.call(this);
        };
        CoinController.prototype.activate = function () {
            // this.buildTransaction('0.00086474','18jJvZHU1YFK7h7Z2G7mueBQ2Na7nar19t');
            // timestamp = null;
            /* console.log('%c ' + this.name + ' try  activate  timestamp ' + timestamp, 'color:red');
             if (this.isActive) return;
             this.isActive = true;*/
            if (!_super.prototype.activate.call(this))
                return false;
            this.startDownloadUTXOs();
            //this.loadMiningFee();
            this.miningFeeController.activate();
            // this.downloadNewTransactionsForAddresses(['1Fo92AdKZTPXQpoGcBLpbe5xw8sAhZ9Nhb'])
            /*
                        this.coinService.downloadTransactions(['1LtkDq3guaRR2uiCDoB9zXotGE9i3FBrgE']).done(res=>{
                            console.warn(res);
                        })*/
            // this.downloadUTXOs()
            // this.isRestoringHistory = false;
            //this.downloadingBalancesCounter = 0;
            // console.log(Date.now() - starttime);
            // console.log('%c activating ' + this.name + ' hasIndexes: ' + this.getHistoryTimestamp() + ' recieve ' + this._db.getCurrentIndexReceive() + ' change: ' + this._db.getCurrentIndexChange(), 'color:green');
            //this.transactionController.activate();
            this.transactionsUpdater.activate();
            return true;
        };
        CoinController.prototype.getSpendableUTXOs = function () {
            var utxos = this.getUTXOs();
            var bytesPerInput = 148;
            var miningPrice = this.getMiningFeeValueCtr().getMiningFeePerByte();
            var feeToSpend = (bytesPerInput * miningPrice);
            var outUTXOS;
            outUTXOS = utxos.filter(function (utxo) {
                return +utxo.satoshis > feeToSpend;
            });
            /// added console logs to help why spendable zero even user has balance
            if (utxos.length && outUTXOS.length === 0) {
                console.log(' you have dust only. Price per byte: ' + miningPrice);
            }
            // log dust to see why $50 BTC coming to $5 spendable
            if (outUTXOS.length !== utxos.length) {
                console.log(' you have dust ' +
                    utxos
                        .filter(function (item) { return +item.satoshis < feeToSpend; })
                        .map(function (item) { return item.satoshis; }));
            }
            return outUTXOS;
        };
        CoinController.prototype.getUTXOs = function () {
            return this._db.getUTXOs(); //     this.transactionController.getUTXOsNotInQueue();//getTransactionsUnspent();
        };
        CoinController.prototype.getBalancesNot0 = function () {
            return this._db.getBalancesNot0();
        };
        ////////////////////// Addresses////////////////////
        CoinController.prototype.isAddressChange = function (address) {
            var bals = this._db.getBalancesChange(true);
            var addresses = bals.map(function (item) {
                return item.id;
            });
            return addresses.indexOf(address) !== -1;
        };
        CoinController.prototype.getKeyPairReceive = function (address) {
            var i = this._db.getAddressesReceive().indexOf(address);
            if (i === -1) {
                console.error(' ho index for address ' + address);
                return '';
            }
            return this.coinService.generator.generateKeyPairReceive(i);
        };
        CoinController.prototype.getKeyPairChange = function (address) {
            var bals = this._db.getBalancesChange(true);
            var addresses = bals.map(function (item) {
                return item.id;
            });
            var i = addresses.indexOf(address);
            return (i === -1) ? null : this.coinService.generator.generateKeyPairChange(i);
        };
        CoinController.prototype.getKeyPair = function (address) {
            this._db.getAddressesReceive();
            var keyPairEC = this.getKeyPairChange(address);
            if (!keyPairEC)
                keyPairEC = this.getKeyPairReceive(address);
            return keyPairEC;
        };
        // Just a default.... Might be undefined.
        CoinController.prototype.getPrivateKeyWifByAddress = function (address) {
            // Returns '' if a private key cannot be retrieved.
            var keyPairEC = this.getKeyPair(address);
            return keyPairEC.toWIF();
        };
        //Todo: Needs optimization
        CoinController.prototype.mapDisplayTransactions = function (trs) {
            var walletAddresses = this.getAddressesAll();
            jaxx.Utils.mapTransactionsBitcoin(trs, walletAddresses);
        };
        // Takes a raw VOTransaction and returns one that is ready for UI display
        // UI display has properties such as 'displayAddress' or 'incoming' that are not
        // present on raw transactions and have to be deduced from inputs/outputs
        CoinController.prototype.processTransactionForDisplay = function (tx) {
            var new_tx_data = jaxx.Utils.deepCopy(tx);
            var tx_array = [new_tx_data];
            jaxx.Utils.mapTransactionsBitcoin(tx_array, this.getAddressesAll());
            return tx_array[0];
        };
        CoinController.prototype.supportsTransactionHistory = function () {
            return true;
        };
        CoinController.prototype.getTransactionsDisplay = function () {
            // const requiredTxConfirmations = 6; // ToDo: Get from config
            // let txes:VOTransaction[]     = Utils.deepCopy(super.getTransactionsDisplay().transactions);
            var txes = jaxx.Utils.deepCopy(this._db.getTransactionsReceive()).reverse();
            var self = this;
            var notReadytoDisplay = txes.filter(function (item) {
                return !item.displayValue;
            });
            console.log('%c ' + this.symbol + ' transactions not ready to display ' + notReadytoDisplay.length, 'color:red');
            if (notReadytoDisplay.length) {
                this.mapDisplayTransactions(notReadytoDisplay);
                this._db.saveTransactionsReceive();
            }
            return {
                symbol: this.symbol,
                transactions: txes,
                blockexplorer_url: this.config.blockexplorer_url,
                trsConfirmations: this.config.trsConfirmations
            };
        };
        CoinController.prototype.getCurrentAddressChange = function () {
            var balances = this._db.getBalancesChange(true);
            if (balances.length == 0) {
                console.warn(' no addressess change');
                var addressChange = this.coinService.generator.generateAddressChange(0);
                this._db.saveBalancesChange([new VOBalance({
                        id: addressChange,
                        balance: '0',
                        decimal: 0,
                        index: 0,
                        type: 1
                    })]);
                return addressChange;
            }
            var balance = balances[balances.length - 1];
            if (balance.balance !== '0') {
                // last balance in array has to have the highest index generated by HD system
                var index = _.last(balances).index + 1;
                balance = new VOBalance({
                    id: this.coinService.generator.generateAddressChange(index),
                    balance: '0',
                    decimal: 0,
                    index: index,
                    type: 1
                });
                balances.push(balance);
                this._db.saveBalancesChange(balances);
            }
            return balance.id;
        };
        CoinController.prototype.getAddressesAll = function () {
            var balances = this._db.getBalancesReceive(true);
            var addresses = balances.map(function (item) {
                return item.id;
            });
            balances = this._db.getBalancesChange(true);
            addresses = addresses.concat(balances.map(function (item) {
                return item.id;
            }));
            return addresses;
        };
        CoinController.prototype.getQRCode = function () {
            //thirdparty.qrImage.imageSync(uri, {type: "png", ec_level: "H", size: 7, margin: 1}).toString('base64');
            return '';
        };
        ////////////////////////////////////////// Transactions///////////////////////
        CoinController.prototype.adjustUTXOs = function (transactions) {
            var spentUtxos = transactions.inputs;
            if (!spentUtxos) {
                return;
            }
            var hasSpentUTXOs = spentUtxos.every(function (spentUTXO) {
                return !!spentUTXO.txid;
            });
            if (hasSpentUTXOs)
                this.spentUTXOs = this.spentUTXOs.concat(spentUtxos);
        };
        CoinController.prototype.adjustBalances = function (transaction) {
            var spent = transaction.totalSpent;
            var change = transaction.changeAmount;
            //let realSpent = MATH.subtract(spent, change);
            var balance = new VOBalance({
                id: '',
                balance: spent,
                decimal: +jaxx.MATH.satoshiToBtc(spent)
            });
            console.log(this.symbol + ' added temp balance  spent  ' + spent + ' change  ' + change);
            // let spentUtxos: VOutxo[] = transactions.inputs;
            /*
                        let spentBalances: VOBalance[] = spentUtxos.map(function (item) {
                            return new VOBalance({
                                id: item.address,
                                balance: item.satoshis
                            })
                        });*/
            this.spentBalances = [balance]; ////this.spentBalances.concat(spentBalances);
        };
        CoinController.prototype.sendTransaction = function (transaction) {
            var _this = this;
            var deferred = $.Deferred();
            var tr = transaction.transactionBTC;
            console.log(transaction);
            var hex = transaction.hex;
            //  console.log(hex)
            this.coinService.sendTransaction(transaction)
                .done(function (result) {
                console.log(_this.symbol + '   transaction sent ', result);
                // console.log(result);
                _this.adjustBalances(transaction);
                _this.adjustUTXOs(transaction);
                console.log(_this.getSpendable());
                _this.dispatchBalance();
                deferred.resolve(transaction);
            }).fail(function (error) {
                deferred.reject(error);
                _this.onError(error);
            });
            return deferred;
        };
        CoinController.prototype.buildTransaction = function (amount, addressTo, isMax, customGasLimit, customData) {
            var _this = this;
            var spendable = this.getSpendable();
            ///one mo time check if for some reason requested amount more then spendable considering input was wrong and sending max;
            if (!isMax && +amount >= +spendable)
                isMax = true;
            var deferred = $.Deferred();
            var utxos = this.getSpendableUTXOs();
            var privateKeys = {};
            utxos.forEach(function (utxo) {
                privateKeys[utxo.address] = _this.getKeyPair(utxo.address);
            });
            var amountSatoshi = jaxx.MATH.btcToSatoshi(amount);
            //console.log(this.name + ' buildTransaction   amountBTC ' + amount + ' amountSatoshi '+amountSatoshi+ ' to   ' + addressTo);
            var miningFeeStatic = this.getMiningFeeStatic();
            var addressChange = this.getCurrentAddressChange();
            var miningFeePerByte = this.getMiningPrice();
            var transaction;
            if (this.symbol === 'BCH') {
                transaction = jaxx.TransactionsUtilsBitcoin.buildBCHPerbyte(amountSatoshi, addressTo, utxos, privateKeys, null, addressChange, this.config.network, this.symbol, isMax, miningFeePerByte);
            }
            else {
                transaction = jaxx.TransactionsUtilsBitcoin.buildBTC(amountSatoshi, addressTo, utxos, privateKeys, null, addressChange, this.config.network, this.symbol, isMax, miningFeePerByte);
            }
            console.log(transaction);
            deferred.resolve(transaction);
            return deferred.promise();
        };
        CoinController.prototype.onTransactionUserConfirmed = function (data) {
            this.rawTransaction = data;
        };
        CoinController.prototype.setCurrentAddresses = function () {
            var lastIndexReceive = this._db.getCurrentAddressReceive();
        };
        CoinController.prototype.onCurrentReceiveAddressGotBalance = function (balance) {
            this.goToNextAddressReceive();
            this.downloadBalancesAll(null);
        };
        CoinController.prototype.downloadTransactionsDetails = function (transactions) {
            var _this = this;
            this.coinService.downloadTransactionsDetails(transactions).done(function (res) {
                //  console.log(res);
                //  let addressses = this._db.getAddressesAll();
                //if(trs) return trs;
                //Utils.mapTransactionsDisplay(res, addressses);
                _this._db.saveTransactionsReceive(res);
                _this.dispatchTransactions();
            });
        };
        CoinController.prototype.restoreHistory = function (callBack) {
            var _this = this;
            this.isRestoringHistory = true;
            this.stopBalancesCheck();
            //  let obj ={symbol:this.symbol, name:this.name};
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_RESTORE_HISTORY_START, this);
            // Registry.application$.triggerHandler( Registry.ON_BALANCE_CHANGED, obj)
            this.coinService.restoreHistory(0, 0)
                .done(function (result) {
                if (result.transactions) {
                    _this._db.saveTransactionsReceive(result.transactions);
                }
                else {
                    _this.downloadTransactionsDetails(result.transactionsids);
                }
                // before saving new Balances returned from restore history process check are all addresses in array generated without gaps and no duplicates
                // if array contained gaps or duplicated problem was solved by HealthAddressesHD class and flag wasProblem set to true.
                var check = new jaxx.HealthAddressHD(result.balancesReceive, _this.generator, false);
                if (check.wasProblem)
                    console.warn(' was problem  restoring history balancesReceive ' + _this.config.symbol);
                //else console.log('addresses OK');
                check = new jaxx.HealthAddressHD(result.balancesChange, _this.generator, true);
                if (check.wasProblem)
                    console.warn(' was problem  restoring history balancesChange ' + _this.config.symbol);
                //else console.log('addresses OK');
                _this._db.saveBalancesChange(result.balancesChange);
                _this._db.saveBalancesReceive(result.balancesReceive);
                _this.goToNextAddressReceive();
                _this.goToNextAddressChange();
                _this.setHistoryTimestamp();
                _this.isRestoringHistory = false;
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_RESTORE_HISTORY_DONE, _this);
                _this.startBalancesCheck();
                if (result.transactions) {
                    _this.dispatchTransactions();
                }
                if (callBack) {
                    callBack();
                }
            }).fail(function (error) {
                _this.isRestoringHistory = false;
                _this.onError(error);
            });
        };
        return CoinController;
    }(jaxx.CoinControllerBase));
    jaxx.CoinController = CoinController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=coin-controller.js.map