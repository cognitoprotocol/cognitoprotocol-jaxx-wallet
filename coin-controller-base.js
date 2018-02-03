/**
 * Created by Vlad on 2017-07-10.
 */
var jaxx;
(function (jaxx) {
    //declare var $:any;
    var BalanceControllerBase = (function () {
        function BalanceControllerBase() {
        }
        BalanceControllerBase.prototype.getCurrentBallance = function () {
            return '0';
        };
        return BalanceControllerBase;
    }());
    jaxx.BalanceControllerBase = BalanceControllerBase;
    var CoinControllerBase = (function () {
        function CoinControllerBase(config) {
            this.config = config;
            this.spentBalances = [];
            this.delayBalancesCheckCurrent = 10000;
            this.delayBalanceCheckAll = 30000;
            this.delayDisplayReceiveAddressRefresh = 10000;
            this.intervalBalancesCheck = 0;
            // this array keeps sent transaction IDs that haven't been downloaded by the data layer yet 
            this.monitoredTransactions = [];
            this.monitoredTransactionsMaxAttempts = 10; // controls how many times it will be attempted to download the transaction
            this.monitoredTransactionsRefreshIntervalMSec = 15000; // controls how often the attempts are made to download the transactions
            this.monitoredTransactionsTimer = null; // keeps track of the timer ID used to refresh monitored transactions
            this.attempt = 0;
            this.errors = [];
            for (var str in config)
                this[str] = config[str];
            if (!this.shiftCount)
                this.shiftCount = 1;
            this._db = new jaxx.CoinStorage(config);
            this.initService();
            this.emitter$ = $({});
            this.transactionsUpdater = new jaxx.TransactionsUpdater(this, this.coinService, config);
            this.initEvents();
        }
        CoinControllerBase.prototype.initService = function () {
            var cl = 'CoinService';
            var config = this.config;
            if (config.coinService)
                cl = config.coinService;
            console.log(cl);
            var fn = jaxx[cl];
            if (typeof fn !== 'function') {
                console.error(' class not included ');
            }
            //console.log(cl);
            if (!isNaN(config.hd_index))
                this.generator = new jaxx.GeneratorBlockchain(config);
            this.coinService = new fn(config, this._db, this.generator);
        };
        CoinControllerBase.prototype.getCoinService = function () {
            return this.coinService;
        };
        // returns reference to current address generator
        CoinControllerBase.prototype.getGenerator = function () {
            return this.coinService.generator;
        };
        CoinControllerBase.prototype.restoreHistory2 = function (callBack) {
            var _this = this;
            var balancesReceive = this._db.getBalancesReceive(true);
            var balanceReceive = _.last(balancesReceive);
            var indexReceive = balancesReceive.length;
            var balancesChange = this._db.getBalancesChange(true);
            var balanceChange = _.last(balancesChange);
            var indexChange = balancesChange.length;
            if (this.isRestoringHistory) {
                callBack();
                return;
            }
            ;
            this.coinService.restoreHistory(indexReceive - 1, indexChange - 1)
                .done(function (result) {
                var newAddresses = [];
                if (result.balancesReceive.length) {
                    balancesReceive.pop();
                    // Using class to detect  all addresses returned in strict  HD sequence   : no gaps and no duplicates.
                    // If was error class will fill gaps and remove duplicates, For now we only can see a warning during development.
                    var check = new jaxx.HealthAddressHD(balancesReceive, _this.generator, false);
                    if (check.wasProblem)
                        console.warn(' was problem  restoring history out of sync');
                    balancesReceive = balancesReceive.concat(result.balancesReceive);
                    _this._db.saveBalancesReceive(balancesReceive);
                    newAddresses = _.map(result.balancesReceive, 'id');
                }
                if (result.balancesChange) {
                    if (result.balancesChange.length) {
                        balancesChange.pop();
                        balancesChange = balancesChange.concat(result.balancesChange);
                        // Using class to detect  all addresses returned in strict  HD sequence   : no gaps and no duplicates
                        var chck = new jaxx.HealthAddressHD(balancesChange, _this.generator, true);
                        if (chck.wasProblem) {
                            console.warn(' was problem  restoring history out of sync');
                            //this.onError(new VOError('coin-controller-base', 'after restoring history balances went wrong',{}, this.config.symbol ));
                        }
                        _this._db.saveBalancesChange(balancesChange);
                        newAddresses = newAddresses.concat(_.map(result.balancesChange, 'id'));
                        _this.goToNextAddressChange();
                    }
                }
                if (newAddresses.length) {
                    _this.attempt = 0;
                    _this.downloadNewTransactionsForAddresses(newAddresses);
                }
                _this.goToNextAddressReceive();
                callBack();
                //this.downloadNewTransactionsForAddresses(addresses);
                //console.log(balances);
            }).fail(function (err) {
                callBack(err);
            });
        };
        CoinControllerBase.prototype.checkSync = function (callBack) {
            var _this = this;
            if (!this.HD) {
                callBack();
                return;
            }
            if (this.isRestoringHistory) {
                callBack();
                return;
            }
            ;
            var address = this.getCurrentAddress();
            var addressChange = this.getCurrentAddressChange();
            var addresses = addressChange ? [address, addressChange] : [address];
            console.log('%c ' + this.symbol + ' checking sync for address: ' + address, 'color:coral');
            this.coinService.downloadTransactions(addresses)
                .done(function (transactions) {
                if (transactions.length === 0) {
                    console.log('%c ' + _this.symbol + ' no new transactions ', 'color:coral');
                    callBack();
                    return;
                }
                ;
                // let newTrs:VOTransaction[] = this._db.addTransactions(transactions, true);
                //if(newTrs.length == 0){
                //    console.warn(this.symbol + ' no new transactions something went wrong');
                // }else console.log('%c ' + this.symbol + ' have new transactions restoring history ','color:coral');
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_OUT_OF_SYNC, _this);
                _this.restoreHistory2(callBack);
                // let balance:VOBalance = this.getCurrentBalance();
            }).fail(function (err) {
                callBack(err);
                _this.onError(err);
                console.error(err);
            });
        };
        CoinControllerBase.prototype.resetStorage = function (needRestore) {
            this._db.clearStorage();
            if (needRestore)
                this.resetHistoryTimestamp();
            else
                this.setHistoryTimestamp();
            //  console.log('TODO');
        };
        /**
         * Starts monitoring the provided transaction ID, if
         * - it is not monitored already
         * - it is not already cached
         *
         *
         * @param arg_txid - The transaction ID
         */
        CoinControllerBase.prototype.monitorTransaction = function (arg_txid) {
            // find if we are already monitoring the transaction
            var existingMonitoredTXes = this.monitoredTransactions.filter(function (tx) { return (arg_txid == tx); });
            if (existingMonitoredTXes.length > 0) {
                return; // we are already keeping tabs on it, nothing to do
            }
            // find if we already cached the TX
            var existingCachedTXes = this._db.getTransactionByIdReceive(arg_txid);
            if (existingCachedTXes !== null) {
                return; // we cached it already, do nothing
            }
            this.monitoredTransactions.push({
                txid: arg_txid,
                attemptsMade: 0
            });
            if (this.isActive) {
                this.activateTransactionMonitoring();
            }
        };
        // enables timer for refreshing monitored transactions
        CoinControllerBase.prototype.activateTransactionMonitoring = function () {
            if (this.monitoredTransactionsTimer == null) {
                this.monitoredTransactionsTimer = setInterval(this.refreshAndStoreMonitoredTransactions.bind(this), this.monitoredTransactionsRefreshIntervalMSec);
                console.log('%c ' + this.symbol + ': Transaction monitoring ACTIVATED.', 'color: DarkSeaGreen');
            }
        };
        // disables timer for refreshing monitored transactions
        CoinControllerBase.prototype.deactivateTransactionMonitoring = function () {
            if (this.monitoredTransactionsTimer != null) {
                clearInterval(this.monitoredTransactionsTimer);
                this.monitoredTransactionsTimer = null;
                console.log('%c ' + this.symbol + ': Transaction monitoring DEACTIVATED.', 'color: DarkSeaGreen');
            }
        };
        /**
         * Called by monitoring timer, It downloads and stores transaction details if:
         * - transaction is not already cached
         * - it has made less than monitoredTransactionsMaxAttempts attempts to donwload the transaction details
         *
         * Fires ON_TRANSACTION_DROPPED event if a transaction is being attempted too many (see above) times.
         *
         */
        CoinControllerBase.prototype.refreshAndStoreMonitoredTransactions = function () {
            var _this = this;
            var txesToBeDownloaded = [];
            var cachedTxes = this._db.getTransactionsReceive();
            // go through each TX to be monitored
            this.monitoredTransactions.forEach(function (monitoredTx, txIndex) {
                // if we did not cache this particular TX already
                if (cachedTxes.filter(function (item) { return item.id == monitoredTx.txid; }).length == 0) {
                    // if we made less that max allowed attempts to download this monitored transaction
                    if (monitoredTx.attemptsMade < _this.monitoredTransactionsMaxAttempts) {
                        txesToBeDownloaded.push({ id: monitoredTx.txid });
                    }
                    else {
                        // the transaction might have been dropped from the mempool, update UI.
                        jaxx.Registry.application$.trigger(jaxx.Registry.ON_TRANSACTION_DROPPED, monitoredTx.txid);
                        // also remove it from our monitored list
                        _this.monitoredTransactions.splice(txIndex, 1);
                    }
                }
                else {
                    // we already cached it, let's stop monitoring it
                    _this.monitoredTransactions.splice(txIndex, 1);
                }
            });
            if (this.monitoredTransactions.length == 0) {
                this.deactivateTransactionMonitoring();
                return;
            }
            console.log('%c Refreshing details for ' + txesToBeDownloaded.length + ' monitored transactions.', 'color: DarkSeaGreen');
            this.coinService.downloadTransactionsDetails(txesToBeDownloaded).done(function (downloadedTxes) {
                if (downloadedTxes.length > 0) {
                    var diff = jaxx.Utils.transactionsDiff(cachedTxes, downloadedTxes);
                    if (diff.length > 0) {
                        _this.mapDisplayTransactions(diff);
                        _this._db.addTransactions(diff);
                        _this.dispatchTransactions();
                        _this.monitoredTransactions = [];
                        _this.deactivateTransactionMonitoring();
                    }
                }
            }).fail(function (error) {
                _this.monitoredTransactions.forEach(function (value) { value.attemptsMade++; });
                _this.onError(error);
            });
        };
        CoinControllerBase.prototype.initEvents = function () {
            var _this = this;
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_SATUS_CHANGED, function (evt, name, enbl) {
                // console.log(name, enbl);
                if (name == _this.name) {
                    _this.enabled = enbl;
                }
            });
            this.transactionsUpdater.emitter$.on(this.transactionsUpdater.ON_TRANSACTION_CONFIRM_CHANGES, function (evt, data) {
                console.log('%c ' + _this.symbol + ' saving confirmations +1', 'color:blue');
                var transactions = jaxx.Utils.deepCopy(data.transactions); // the transactions are being altered until reaching all event handlers, best to make a copy of the data
                _this._db.saveTransactionsReceive();
                jaxx.Registry.transactions$.triggerHandler(jaxx.Registry.ON_TRANSACTIONS_CONFIRMATIONS, { symbol: _this.symbol, transactions: transactions });
            });
            this.transactionsUpdater.emitter$.on(this.transactionsUpdater.ON_TRANSACTION_INBLOCK, function (evt, data) {
                console.log('%c ' + _this.symbol + ' saving confirmations in block ', 'color:blue');
                var transactions = jaxx.Utils.deepCopy(data.transactions); // the transactions are being altered until reaching all event handlers, best to make a copy of the data
                _this._db.saveTransactionsReceive();
                jaxx.Registry.transactions$.triggerHandler(jaxx.Registry.ON_TRANSACTION_INBLOCK, { symbol: _this.symbol, transactions: transactions });
            });
            // Once our user has sent a transaction we attempt to fetch it from the server                       
            jaxx.Registry.application$.on(jaxx.Registry.ON_SEND_TRANSACTION, function (ev, sent_tx) {
                if (_this.isActive == true && _this.supportsTransactionHistory() == true && sent_tx.symbol == _this.symbol) {
                    _this.monitorTransaction(sent_tx.txid);
                }
            });
        };
        CoinControllerBase.prototype.generateAddress = function (index, type) {
            return this.coinService.generator.generateAddress(index, type);
        };
        CoinControllerBase.prototype.getCurrentBalance = function () {
            var balances = this._db.getBalancesReceive(true);
            if (balances.length == 0) {
                var address = this.generateAddress(0, 'receive');
                var balance = new VOBalance({
                    id: address,
                    balance: '0',
                    decimals: 0,
                    index: 0,
                    type: 0
                });
                this._db.saveBalancesReceive([balance]);
                return balance;
            }
            var currentIndex = this.config.HD ? balances.length - 1 : 0;
            return balances[currentIndex];
        };
        CoinControllerBase.prototype.getCurrentAddress = function () {
            return this.getCurrentBalance().id;
        };
        Object.defineProperty(CoinControllerBase.prototype, "sort", {
            get: function () {
                return +localStorage.getItem(this.symbol + 'sort');
            },
            set: function (num) {
                localStorage.setItem(this.symbol + 'sort', num + '');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CoinControllerBase.prototype, "enabled", {
            get: function () {
                var enabled = localStorage.getItem(this.symbol + 'enabled') === 'true';
                // console.log(this.name + '  ' + enabled);
                return enabled;
            },
            set: function (enabled) {
                //was setting undefinedEnabled in localstorage
                if (this.symbol) {
                    localStorage.setItem(this.symbol + 'enabled', (enabled ? 'true' : 'false'));
                }
            },
            enumerable: true,
            configurable: true
        });
        CoinControllerBase.prototype.goSleep = function () {
            this.isWasActive = this.isActive;
            if (this.isWasActive)
                console.log('%c  ' + this.name + ' go sleep  ', 'color:red');
            this.deactivate();
        };
        CoinControllerBase.prototype.wakeUp = function () {
            if (this.isWasActive) {
                console.log('%c  ' + this.name + ' waking up   ', 'color:red');
                this.activate();
            }
        };
        CoinControllerBase.prototype.setStartOption = function (option) {
            localStorage.setItem(this.symbol + 'start-option', option);
        };
        CoinControllerBase.prototype.getStartOption = function () {
            return localStorage.getItem(this.symbol + 'start-option');
        };
        CoinControllerBase.prototype.deleteStartOption = function () {
            localStorage.removeItem(this.symbol + 'start-option');
        };
        CoinControllerBase.prototype.getSpendable = function () {
            console.error('override this fumction');
            return '0';
        };
        CoinControllerBase.prototype.resetHistoryTimestamp = function () {
            localStorage.removeItem(this.symbol + 'historyTimestamp');
        };
        CoinControllerBase.prototype.setHistoryTimestamp = function () {
            localStorage.setItem(this.symbol + 'historyTimestamp', (new Date()).toISOString());
        };
        CoinControllerBase.prototype.getHistoryTimestamp = function () {
            return localStorage.getItem(this.symbol + 'historyTimestamp');
        };
        CoinControllerBase.prototype.getAddressesAll = function () {
            return _.map(this._db.getBalancesAll(true), 'id');
        };
        /*  getTransactions(): VOTransaction[] {
              return this._db.getTransactionsReceive();
          }*/
        CoinControllerBase.prototype.goToNextAddressReceive = function () {
            // make sure HD value (type: boolean) is set in jaxx-config.json for each coin
            if (this.config.HD !== undefined && !this.config.HD) {
                return;
            }
            var balances = this._db.getBalancesReceive(true);
            var index = 0;
            if (balances.length) {
                var health = new jaxx.HealthAddressHD(balances, this.generator, false);
                index = _.last(balances).index + 1;
            }
            // checking is balances all organized before generating a new address
            // let currentBalance:VOBalance = this.getCurrentBalance();
            // console.log('%c '+ this.symbol + ' goToNextAddressReceive length ' + balances.length + ' index ' + currentBalance.index, 'color:violet');
            var address = this.coinService.generator.generateAddressReceive(index);
            balances.push(new VOBalance({
                id: address,
                balance: '0',
                index: index,
                decimal: 0,
                type: 0
            }));
            this._db.saveBalancesReceive(balances);
            this.dispatchAddress();
        };
        CoinControllerBase.prototype.goToNextAddressChange = function () {
            var balances = this._db.getBalancesChange(true);
            // checking is balances all organized before generating a new address
            var index = 0;
            if (balances.length) {
                var health = new jaxx.HealthAddressHD(balances, this.generator, true);
                index = _.last(balances).index + 1;
            }
            var address = this.coinService.generator.generateAddressChange(index);
            balances.push(new VOBalance({
                id: address,
                balance: '0',
                index: index,
                decimal: 0,
                type: 1
            }));
            this._db.saveBalancesChange(balances);
            //this.dispatchAddress();
        };
        CoinControllerBase.prototype.onCurrentAddressGotBalance = function (balance) {
            if (this.HD) {
                this.goToNextAddressReceive();
                console.log('%c ' + this.symbol + ' because of HD go to next address: ', 'color:red');
                this.dispatchAddress();
            }
            else {
            }
            this.downloadBalancesAll(function () {
                //TODO: what do i need to do here?
            });
        };
        CoinControllerBase.prototype.checkBalanceCurrentReceive = function () {
            var _this = this;
            if (this.isRestoringHistory) {
                console.warn(' restoring history ');
                return;
            }
            if (!this.isActive) {
                this.stopBalancesCheck();
                return;
            }
            var balanceOld = this.getCurrentBalance();
            if (this.isRestoringHistory) {
                return;
            }
            var timestamp = Date.now();
            if (balanceOld.id.length < 20) {
                return;
            }
            this.coinService.downloadBalances([balanceOld.id]).done(function (balances) {
                var balanceNew = balances[0];
                if (balanceNew && _this.HD && balanceNew.balance !== '0') {
                    _this.onCurrentAddressGotBalance(balanceNew);
                }
                else if (balanceNew && balanceOld.balance !== balanceNew.balance) {
                    _this.onCurrentAddressGotBalance(balanceNew);
                }
                else if (balanceOld.balance !== balanceNew.balance) {
                    var delta = +balanceNew.balance - +balanceOld.balance;
                    var precision = Math.round(+balanceNew.balance / 1e5);
                    if (delta && Math.abs(delta) < precision) {
                        if (delta > 0)
                            console.log(' ignoring delta too small' + jaxx.MATH.toDecimal(delta + ''));
                        delta = 0;
                    }
                    if (delta) {
                        _this.onCurrentAddressGotBalance(balanceNew);
                    }
                }
            });
        };
        CoinControllerBase.prototype.downloadNewTransactionsForAddresses = function (addresses) {
            var _this = this;
            if (!addresses)
                return;
            this.attempt++;
            if (this.attempt > 20) {
                return;
            }
            // console.log(addresses);
            if (addresses.length === 0) {
                console.error(' no addresses ');
                return;
            }
            var invalid = addresses.filter(function (item) { return item.length < 20; });
            if (invalid.length) {
                console.error('invalid addresses ', invalid);
                addresses = addresses.filter(function (item) { return item.length > 20; });
            }
            console.log('%c ' + this.symbol + ' download new transactions for addresses ' + addresses.toString() + ' count ' + this.attempt, 'color:blue');
            this.addressesNewTransactions = addresses;
            this.coinService.downloadTransactions(addresses).done(function (trans) {
                var exists = _this._db.getTransactionsReceive();
                var diff = jaxx.Utils.transactionsDiff(exists, trans);
                console.log('%c ' + _this.symbol + ' downloaded ' + diff.length + 'new transactions  form total ' + trans.length, 'color:blue');
                if (diff.length === 0) {
                    setTimeout(function () { return _this.downloadNewTransactionsForAddresses(addresses); }, 30000);
                }
                else {
                    //let addressses = this._db.getAddressesAll();
                    //Utils.mapTransactionsDisplay(diff, addressses);
                    console.log(diff);
                    _this.addressesNewTransactions = null;
                    _this.mapDisplayTransactions(diff);
                    _this._db.addTransactions(diff);
                    _this.dispatchTransactions();
                }
            }).fail(function (err) {
                _this.onError(err);
                setTimeout(function () { return _this.downloadNewTransactionsForAddresses(addresses); }, 30000);
            });
        };
        CoinControllerBase.prototype.onBalancesDownloadedDifference = function (delta, balancesOld, balancesNew) {
            //let copyOld = Utils.deepCopy(balancesOld);
            var diff = jaxx.Utils.updateOldBalances(balancesOld, balancesNew);
            console.log(this.config.symbol + ' balances difference ', diff);
            if (this.spentBalances && this.spentBalances.length) {
                console.log('resetting temp balance ', this.spentBalances);
                this.spentBalances = [];
            }
            this.dispatchBalance();
            if (diff.length) {
                this._db.saveBalancesAll();
                var addresses = diff.map(function (item) { return item.id; });
                this.attempt = 0;
                this.downloadNewTransactionsForAddresses(addresses);
            }
            else {
                console.error(' Balance changed but no difference ');
            }
        };
        CoinControllerBase.prototype.downloadBalancesAll = function (onSuccess) {
            var _this = this;
            if (this.isDownloadingBalances)
                return;
            this.isDownloadingBalances = true;
            if (this.isRestoringHistory) {
                if (onSuccess)
                    onSuccess({ warn: 'restoring history' });
                console.warn(this.symbol + ' Restoring Histroy dropping downloadBalancesAll');
                return;
            }
            if (!this.isActive) {
                this.stopBalancesCheck();
                return;
            }
            var balancesOld = this._db.getBalancesAll(true);
            var balanceOld = jaxx.Utils.sumBalances(balancesOld);
            var addresses = balancesOld.map(function (item) { return item.id; });
            console.log(this.symbol + ' download Balances All: ' + addresses.length);
            this.coinService.downloadBalances(addresses).done(function (result) {
                _this.isDownloadingBalances = false;
                if (!result) {
                    console.error(' this.coinService.downloadBalances  ');
                    return;
                }
                // this.onBalancesDownloaded(balancesOld, result);
                var balancesNew = result;
                var balanceNew = jaxx.Utils.sumBalances(balancesNew);
                var spent = _this.spentBalances.reduce(function (s, item) { return s += +item.balance; }, 0);
                var delta = +balanceNew - +balanceOld;
                var precision = Math.round(+balanceNew / 1e5);
                console.log('%c ' + _this.symbol + ' balances old: ' + jaxx.MATH.toDecimal(balanceOld) +
                    ' new: ' + jaxx.MATH.toDecimal(balanceNew) +
                    ' spent: ' + jaxx.MATH.toDecimal(spent + '') +
                    ' delta: ' + jaxx.MATH.toDecimal(delta + '') +
                    ' precision: ' + jaxx.MATH.toDecimal(precision + ' ') +
                    (new Date()).toLocaleTimeString(), 'color:green');
                if (delta && Math.abs(delta) < precision) {
                    if (delta > 0)
                        console.log(' ignoring delta too small' + jaxx.MATH.toDecimal(delta + ''));
                    delta = 0;
                }
                if (delta) {
                    _this.onBalancesDownloadedDifference(delta, balancesOld, balancesNew);
                }
                if (onSuccess) {
                    onSuccess();
                }
            }).fail(function (error) {
                _this.isDownloadingBalances = false;
                _this.onError(error);
            });
        };
        CoinControllerBase.prototype.dispatchAddress = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_ADDRESS_CHANGED, this);
        };
        CoinControllerBase.prototype.getTransactionsDisplay = function () {
            return {
                symbol: this.symbol,
                transactions: jaxx.Utils.deepCopy(this._db.getTransactionsReceive()).reverse(),
                blockexplorer_url: this.config.blockexplorer_url,
                trsConfirmations: this.config.trsConfirmations
            };
        };
        CoinControllerBase.prototype.dispatchTransactions = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_TRANSACTIONS_CHANGED, this);
        };
        CoinControllerBase.prototype.dispatchBalance = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_BALANCE_CHANGED, this);
        };
        CoinControllerBase.prototype.dispatchSpendable = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_SPENDABLE_CHANGED, this);
        };
        CoinControllerBase.prototype.deactivate = function () {
            if (!this.isActive)
                return false;
            this.isActive = false;
            console.log('%c ' + this.symbol + ' deactivating ', 'color:red');
            this.stopBalancesCheck();
            if (this.isRestoringHistory) {
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.KILL_HISTORY, { symbol: this.symbol });
            }
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_COIN_DEACTIVATED, this);
            this.deactivateTransactionMonitoring();
            return true;
        };
        CoinControllerBase.prototype.activate = function () {
            //console.error('activate ');
            var _this = this;
            if (this.isActive)
                return false;
            this.isActive = true;
            var timestamp = this.getHistoryTimestamp();
            //let onStart = this.getStartOption();
            //console.log('%c ' + this.symbol + ' activate  on-start: '+onStart + '    '+timestamp , 'color:red');
            //if(onStart && onStart != 'pair-device'){
            // this.setHistoryTimestamp();
            //this.createStartAddresses();
            // }
            // else{
            if (!timestamp) {
                if (localStorage.getItem('walletType') === 'new-wallet') {
                    this.setHistoryTimestamp();
                    this.createStartAddresses();
                }
                else {
                    this.restoreHistory(function () {
                        // this.isRestoringHistory = true;
                        //this.isActive = false;
                        // this.activate();
                    });
                    console.log('%c ' + this.symbol + ' restoring history  timestamp null', 'color:red');
                }
                // return false;
            }
            else {
                var balance = this.getCurrentBalance();
                if (balance && isNaN(balance.index))
                    this._db.indexBalances();
            }
            //
            //  }
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_COIN_ACTIVATED, this);
            console.log('%c ' + this.name + ' activated ', 'color:red');
            if (!this.isRestoringHistory) {
                this.checkSync(function () {
                    // this.dispatchBalance();
                    // this.dispatchAddress();
                    // this.dispatchTransactions();
                    _this.downloadNewTransactionsForAddresses(_this.addressesNewTransactions);
                    _this.startBalancesCheck();
                });
                if (this.monitoredTransactions.length > 0) {
                    this.activateTransactionMonitoring();
                }
            }
            else {
            }
            return true;
        };
        CoinControllerBase.prototype.startBalancesCheck = function () {
            var _this = this;
            if (this.isCheckingBalance)
                return;
            this.isCheckingBalance = true;
            //   console.error('JN - first call to checkBalanceCurrentReceive');
            this.checkBalanceCurrentReceive();
            this.downloadBalancesAll(null);
            // this.stopBalancesCheck();
            //this.intervalBalancesCheck = setInterval(err=>this.onError(err), this.intervalAllBalancesCheckCurrent);
            this.intervalBalanceCheckCurrent = window.setInterval(function () {
                // console.error('JN - timer call checkBalanceCurrentRdceive');
                _this.checkBalanceCurrentReceive();
            }, this.delayBalancesCheckCurrent);
            this.intervalBalancesCheckAll = window.setInterval(function () {
                _this.downloadBalancesAll(null);
            }, this.delayBalanceCheckAll);
            this.intervalDisplayReceiveAddressRefresh = window.setInterval(function () {
                console.log("Verifying current receive address and QR code on UI");
                _this.verifyDisplayedReceiveAddressAndQRCode();
            }, this.delayDisplayReceiveAddressRefresh);
        };
        //Verify the displayed receive address on UI using address derived directly from mnemonic and current index
        //Ensure receive address displayed on UI belongs to current wallet
        //This is to prevent UI freezing that could potentially displaying old wallet address and insertion of
        //malicious address
        CoinControllerBase.prototype.verifyDisplayedReceiveAddressAndQRCode = function () {
            //Check if current controller is the same as expected
            //This happens sometimes when navigate between coins
            if (jaxx.Registry.getCurrentCryptoController().config.symbol != this.config.symbol) {
                this.stopBalancesCheck();
                console.log("Event CTL001 occurred");
                // Navigation.flashBanner("Error (CTL001) occurred, please restart your application and try again.");
                return;
            }
            var generator = this.getGenerator();
            if (!generator) {
                console.log("Event CTL002 occurred");
                //   Navigation.flashBanner("Error (CTL002) occurred, please restart your application and try again.");
                return;
            }
            //Verify displayed receiving address and refresh if needed
            var expectedCurrentAddress = generator.generateAddressReceive(this.getCurrentBalance().index || 0);
            var expectedCurrentAddress0 = generator.generateAddressReceive(0);
            var displayedCurrentAddress = $('#AddressView-address').text();
            if (expectedCurrentAddress != displayedCurrentAddress) {
                //Only throw user warning if displayed address is not expected or the first address (set when initializing)
                if (expectedCurrentAddress0 != displayedCurrentAddress) {
                    Navigation.flashBanner("Change of wallet detected, if you're not performing this (pairing) operation, please ensure you have your 12-word backup phrase, restart your application and double-check your addresses.");
                }
                $('#AddressView-address').text(expectedCurrentAddress);
            }
            //Verify displayed receiving QR code and refresh if needed
            var expectedQRCode = jaxx.Utils.generateQRCode(expectedCurrentAddress, true);
            var expectedQRCode0 = jaxx.Utils.generateQRCode(expectedCurrentAddress0, true);
            var displayedQRCode = $('.populateQRCode').attr('src');
            if (expectedQRCode != displayedQRCode) {
                //Only throw user warning if QR code is not expected or the first address (set when initializing)
                if (expectedQRCode0 != displayedQRCode) {
                    //   Navigation.flashBanner("Change of wallet detected, if you're not performing this (pairing) operation, please ensure you have your 12-word backup phrase, restart your application and double-check your addresses.");
                }
                $('.populateQRCode').attr('src', expectedQRCode);
            }
        };
        CoinControllerBase.prototype.stopBalancesCheck = function () {
            // console.warn(this.name + '   stopBalancesCheck   ');
            clearInterval(this.intervalBalanceCheckCurrent);
            clearInterval(this.intervalBalancesCheckAll);
            clearInterval(this.intervalDisplayReceiveAddressRefresh);
            this.isCheckingBalance = false;
        };
        CoinControllerBase.prototype.onError = function (err) {
            err = err || {};
            jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, err);
        };
        CoinControllerBase.prototype.createStartAddresses = function () {
            this.setHistoryTimestamp();
            var addressChange = this.coinService.generator.generateAddressChange(0);
            var addressReceive = this.coinService.generator.generateAddressReceive(0);
            this._db.saveBalancesChange([new VOBalance({
                    id: addressChange,
                    balance: '0',
                    index: 0,
                    decimal: 0,
                    type: 1
                })]);
            this._db.saveBalancesReceive([new VOBalance({
                    id: addressReceive,
                    balance: '0',
                    index: 0,
                    decimal: 0,
                    type: 0
                })]);
            this._db.unsetCreateNewWalletd();
        };
        CoinControllerBase.prototype.createNewWallet = function () {
            this._db.setCreateNewWallet();
            //console.error('Vlad please implement for each controller type - coins, ether and token');
        };
        /*
            This function is called when displaying public addresses/private key pairs.
            The "Balance" array parameter is from local storage (caculated from restoreHistory) and contains public addresses,
            balances but not private keys. In this function public address/Private key pairs are derived from key generator locally

         */
        CoinControllerBase.prototype.mapPrivateKeys = function (balances, isChange) {
            //let out:{address: string, balance: string, privateKey: string}[] = [];
            // included check addresses  sequence before generating keys it will fix possible gaps and remove duplicates
            var check = new jaxx.HealthAddressHD(balances, this.generator, isChange);
            if (check.wasProblem)
                console.warn(' it was a problem with addresses ' + this.config.symbol);
            var generator = this.generator;
            return balances.map(function (item) {
                var node = isChange ? generator.generateKeyPairChange(item.index) : generator.generateKeyPairReceive(item.index);
                return {
                    address: item.id,
                    balance: jaxx.MATH.satoshiToBtc(item.balance),
                    privateKey: node.toWIF()
                };
            });
            /*
                        let maximumAddressIndex = 1000; //Maximum address index allowed to iterate
            
                        // Iterate through the Balance array, and derive public addresses/prive key pairs locally using generator
                        // Until it reaches the maximum allowed index
                        for(let i=0, j=0, n=balances.length;(i<n)&&(j<maximumAddressIndex);j++){
            
                            //Derive public address for current index
                            let publicAddress = isChange ? this.coinService.generator.generateAddress(j,"change") : this.coinService.generator.generateAddress(j,"receive");
                            //Derive private key for current index
                            let keyNode:any = isChange ? this.coinService.generator.generateKeyPairChange(j) : this.coinService.generator.generateKeyPairReceive(j);
                            let privateKey = keyNode.toWIF();
            
                            let balance:VOBalance = balances[i];
                            //Check if public address matches private address (in case of gaps)
                            if(publicAddress === balance.id){
            
                                out.push({
                                    address:balance.id,
                                    balance:MATH.satoshiToBtc(balance.balance),
                                    privateKey:privateKey
                                });
                                console.log("Displaying public " + (isChange ? "change" : "receive") + " address " + i + " and private key " + j );
                                i++;
                            } else { //There is gap
                                console.warn("Gap detected");
                            }
                        }
                        return out;
                        */
        };
        CoinControllerBase.prototype.getPrivateKeys = function () {
            var _this = this;
            var deferred = $.Deferred();
            console.log(' getPrivateKeys ');
            if (this._db.isNewWallet()) {
                this.createNewWallet();
                this.setHistoryTimestamp();
            }
            var timestamp = this.getHistoryTimestamp();
            var out = [];
            if (!timestamp) {
                this.restoreHistory(function (error) {
                    if (error) {
                        deferred.reject(error);
                        return;
                    }
                    var balances = _this._db.getBalancesReceive(true);
                    out = out.concat(_this.mapPrivateKeys(balances, false));
                    balances = _this._db.getBalancesChange(true);
                    out = out.concat(_this.mapPrivateKeys(balances, true));
                    deferred.resolve(out);
                });
            }
            else {
                var balances = this._db.getBalancesReceive(true);
                out = out.concat(this.mapPrivateKeys(balances, false));
                balances = this._db.getBalancesChange(true);
                out = out.concat(this.mapPrivateKeys(balances, true));
                deferred.resolve(out);
            }
            return deferred;
        };
        CoinControllerBase.prototype.validateAddress = function (address) {
            if (!address || !address.length)
                return false;
            var index = thirdparty.bitcoin.address.fromBase58Check(address);
            // console.warn(index);
            return this.config.validAddresses.indexOf(index.version) !== -1;
        };
        CoinControllerBase.prototype.validateAddressETH = function (address) {
            if (!address || !address.length)
                return false;
            var addr = address.toLowerCase();
            if (!/^(0x)?[0-9a-f]{40}$/i.test(addr)) {
                // check if it has the basic requirements of an address
                return false;
            }
            else if (/^(0x)?[0-9a-f]{40}$/.test(addr) || /^(0x)?[0-9A-F]{40}$/.test(addr)) {
                return true;
            }
            else {
                // Otherwise check each case
                return this.isChecksumAddressETH(addr);
            }
        };
        CoinControllerBase.prototype.isChecksumAddressETH = function (address) {
            // Check each case
            address = address.replace('0x', '');
            var addressHash;
            try {
                addressHash = thirdparty.web3.sha3(address.toLowerCase());
            }
            catch (e) {
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, e);
                return false;
            }
            for (var i = 0; i < 40; i++) {
                // the nth letter should be uppercase if the nth digit of casemap is 1
                if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                    return false;
                }
            }
            return true;
        };
        CoinControllerBase.prototype.isPaperWalletAllowed = function (checkiOS) {
            if (!this.paperwallet)
                return false;
            checkiOS = (checkiOS == null) ? false : checkiOS;
            if (checkiOS)
                return (this.paperwallet.ios) ? this.paperwallet.ios : false;
            return (this.paperwallet.regular) ? this.paperwallet.regular : false;
        };
        ;
        return CoinControllerBase;
    }());
    jaxx.CoinControllerBase = CoinControllerBase;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=coin-controller-base.js.map