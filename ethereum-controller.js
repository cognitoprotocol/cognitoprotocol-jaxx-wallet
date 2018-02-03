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
    var EthereumController = (function (_super) {
        __extends(EthereumController, _super);
        function EthereumController(config) {
            var _this = _super.call(this, config) || this;
            _this.config = config;
            _this.emitter$ = $({});
            _this.spentBalances = [];
            _this.privateKeyCounter = 0;
            _this.out = [];
            _this.init();
            return _this;
        }
        EthereumController.prototype.getUTXOs = function () {
            return [];
        };
        EthereumController.generateQRCode = function () {
            return '';
        };
        EthereumController.prototype.init = function () {
            if (jaxx.Registry.appState && jaxx.Registry.appState.create) {
                console.log(this.name + ' create new wallet');
                this._db.clearStorage();
            }
        };
        /*onBalancesDownloaded(oldBalances: VOBalance[], newBalances: VOBalance[]) {


        }*/
        EthereumController.prototype.onBalancesDownloadedDifference = function (delta, balancesOld, balancesNew) {
            if (delta < 0) {
                console.log(this.symbol + ' Resetting temp on balance difference  TODO calculate amount');
                this.spentBalances = [];
            }
            var was = _.sumBy(balancesOld, function (item) {
                return Number(item.balance);
            });
            var now = _.sumBy(balancesNew, function (item) {
                return Number(item.balance);
            });
            var diff = jaxx.Utils.updateOldBalances2(balancesOld, balancesNew);
            var after = _.sumBy(balancesOld, function (item) {
                return Number(item.balance);
            });
            console.log('was: ', was, ' now: ', now, ' after: ', after);
            if (diff.length) {
                console.log('saving');
                this._db.saveBalancesAll();
                this.logConfirmedTransaction();
                this.dispatchBalance();
            }
            var addresses = diff.map(function (item) {
                return item.id;
            });
            this.attempt = 0;
            this.downloadNewTransactionsForAddresses(addresses);
        };
        EthereumController.prototype.sendTransaction = function (transaction) {
            var _this = this;
            var deferred = $.Deferred();
            console.log(this.name + ' sendTransaction  ', transaction);
            this.coinService.sendTransaction(transaction).done(function (results) {
                console.log('sendTransaction - results -', results);
                var transactions = results.transactionsETH;
                if (results.success === 'success') {
                    var balances = transactions.map(function (item) {
                        //TODO: Special function in the future to analyze transaction status (success/failure).
                        return new VOBalance({
                            id: item.addressFrom,
                            balance: item.spendWei
                        });
                    });
                    _this.spentBalances = _this.spentBalances.concat(balances);
                    var spent = _.sumBy(balances, function (item) {
                        return Number(item.balance);
                    });
                    console.log(' spent  ' + spent / 1e18);
                    _this.logSentTransaction();
                    _this.dispatchBalance();
                }
                else {
                    deferred.reject(transaction);
                }
                deferred.resolve(results);
            }).fail(function (error) {
                deferred.reject(error);
                _this.onError(error);
            });
            return deferred;
        };
        EthereumController.prototype.logSentTransaction = function () {
            this.timestampStartSeconds = String(Date.now() / 1000);
            console.log('%c ' + this.symbol + ' Sent Transaction ' + new Date().toLocaleTimeString(), 'color:pink');
        };
        EthereumController.prototype.logConfirmedTransaction = function () {
            this.timestampEndSeconds = String(Date.now() / 1000);
            console.log('%c ' + this.symbol + ' Confirmed Transaction ' + new Date().toLocaleTimeString(), 'color:pink');
            if (Number(this.timestampEndSeconds) - Number(this.timestampStartSeconds) > 60) {
                console.log('%c Transaction taking too long need to optimize gas price and gas limits', 'color:red');
            }
        };
        EthereumController.prototype.getMiningFee = function () {
            var gasPrice = this.config.gasPrice;
            var gasLimit = this.config.gasLimit;
            console.log(' gasPrice ' + gasPrice + ' gasLimit ' + gasLimit);
            return jaxx.MATH.multiplay([gasPrice, gasLimit]);
        };
        EthereumController.prototype.getNonces = function (addresses) {
            return this.coinService.downlaodNonces(addresses);
        };
        EthereumController.prototype.buildTransaction = function (amountDecimals, addressTo, isMax, customGasLimit, customData) {
            var _this = this;
            var balances = this.getBalancesNotDust();
            var spendable = this.getSpendable();
            ///one mo time check if for some reason requested amount more then spendable considering input was wrong and sending max;
            if (!isMax && +amountDecimals >= +spendable)
                isMax = true;
            var differed = $.Deferred();
            var gasLimit = (customGasLimit == null) ? this.config.gasLimit : customGasLimit;
            console.log(this.name + ' buildTransaction   amount ' + amountDecimals + ' customGasLimit ' + customGasLimit + ' to ' + addressTo);
            var addresses = balances.map(function (item) {
                return item.id;
            });
            var privateKeys = {};
            balances.forEach(function (balance) {
                privateKeys[balance.id] = _this.getKeyPair(balance.id);
            });
            var signatures = {};
            balances.forEach(function (item) {
                var address = item.id;
                signatures[address] = _this.getSignatureForAddress(address);
            });
            var amountInt = jaxx.MATH.etherToWei(amountDecimals);
            this.getNonces(addresses).done(function (nonces) {
                console.log('nonces ', nonces);
                var trs = jaxx.TransactionsUtilsEthereum.buildETH(amountInt, amountDecimals, addressTo, balances, nonces, signatures, // privateKeys,
                _this.config.gasPrice, gasLimit, _this.symbol, isMax, customData);
                differed.resolve(trs);
            });
            return differed.promise();
        };
        ////////////////////////////////////////////////// End Transactions ////////////////////////////////////////
        EthereumController.prototype.restoreHistory = function (callBack) {
            var _this = this;
            this.isRestoringHistory = true;
            this.stopBalancesCheck();
            var obj = { symbol: this.symbol };
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_RESTORE_HISTORY_START, obj);
            this.coinService.restoreHistory(0).done(function (result) {
                if (result.balancesReceive.length === 0) {
                    var address = _this.coinService.generator.generateAddressReceive(0);
                    result.balancesReceive = [new VOBalance({ id: address, balance: '0', decimal: 0, index: 0 })];
                }
                _this._db.saveTransactionsReceive(result.transactions);
                // before saving new Balances check all addresses are organized by index
                var check = new jaxx.HealthAddressHD(result.balancesReceive, _this.generator, false);
                if (check.wasProblem)
                    console.warn(' was problem  restoring history balancesReceive ' + _this.config.symbol);
                _this._db.saveBalancesReceive(result.balancesReceive);
                _this.goToNextAddressReceive();
                _this.setHistoryTimestamp();
                _this.isRestoringHistory = false;
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_RESTORE_HISTORY_DONE, obj);
                _this.startBalancesCheck();
                if (callBack)
                    callBack();
            }).fail(function (error) {
                _this.isRestoringHistory = false;
                _this.onError(error);
            });
        };
        EthereumController.prototype.getBalances = function () {
            return this._db.getBalancesAll();
        };
        //when token transaction sent token controller calling this function to update balance on first address.
        EthereumController.prototype.refreshBalanceOnAddress0 = function () {
            var _this = this;
            var address = this.getAddressReceive(0);
            this.coinService.downloadBalances([address]).done(function (balances) {
                var balance = balances[0];
                var bals = _this._db.getBalancesReceive(true);
                bals[0].balance = balance.balance;
                bals[0].timestamp = balance.timestamp;
                console.log(_this.config.symbol + ' on first address balance  ' + balance.balance);
                _this._db.saveBalancesReceive(bals);
            });
        };
        EthereumController.prototype.getBalanceForAddress0 = function () {
            var balances = this._db.getBalancesReceive(true);
            if (balances.length === 0)
                return '-1';
            return balances[0].balance;
        };
        EthereumController.prototype.getBalancesReceive = function () {
            return this._db.getBalancesReceive(true);
        };
        EthereumController.prototype.getBalanceByAddress = function (address) {
            var balances = this._db.getBalancesReceive(true);
            var returnBalance = '-1';
            for (var i = 0; i < balances.length; i++) {
                if (balances[i].id === address) {
                    return balances[i].balance;
                }
            }
            return returnBalance;
        };
        /* mapTransactions(trs: VOTransaction[]): void {
             let myAddresses: string[] = this.getAddressesAll();
             Utils.mapDisplayTransactionsEthereum(trs, myAddresses, this.symbol);
         }*/
        EthereumController.prototype.getSpendable = function (gasLimit) {
            //TODO need to implement gasLimit in send transaction controller
            if (!gasLimit)
                gasLimit = this.config.gasLimit;
            var gasPrice = this.config.gasPrice;
            var fee = jaxx.MATH.multiplay([gasPrice, gasLimit]);
            var balances = this.getBalancesNotDust();
            var ar = balances.map(function (item) {
                return jaxx.MATH.subtract(item.balance, fee);
            });
            /// if some balances are spent subtract values form total amounts
            if (this.spentBalances && this.spentBalances.length) {
                var spent = this.spentBalances.map(function (item) {
                    return '-' + jaxx.MATH.subtract(item.balance, fee);
                });
                ar = ar.concat(spent);
            }
            var res = jaxx.MATH.sum(ar);
            if (+res < 0)
                return '0';
            return ar.length ? jaxx.MATH.weiToEther(res) : '0';
        };
        EthereumController.prototype.getSpendableBalance = function (callback) {
            callback(this.getSpendable());
        };
        /*
        * Fired when ethereum wallet is activated
        * @method activate
        * */
        EthereumController.prototype.activate = function () {
            if (!_super.prototype.activate.call(this))
                return false;
            this.transactionsUpdater.activate();
            this.loadGasPrice();
            return true;
        };
        //        readyTransactionsLength: number = 0;
        EthereumController.prototype.getBalancesNotDust = function () {
            var fee = Number(this.config.gasPrice) * Number(this.config.gasLimit);
            return this._db.getBalancesReceive(true)
                .filter(function (item) {
                return +item.balance > fee;
            });
        };
        ////////////////////// Addresses////////////////////
        /*getPrivateKeyDB(index: number): any {
            return this.coinService.generator.generateKeyPairReceive(index);
        }*/
        EthereumController.prototype.getKeyPairReceive = function (address) {
            var i = this._db.getAddressesReceive().indexOf(address);
            if (i === -1) {
                console.error(' ho index for address ' + address);
                return '';
            }
            return this.coinService.generator.generateKeyPairReceive(i);
        };
        EthereumController.prototype.getSignatureForIndex = function (index) {
            // console.warn('getSignatureForAddress  ' + index);
            return this.coinService.generator.getSignatureForIndex(index);
        };
        EthereumController.prototype.getSignatureForAddress = function (address) {
            var ind = this._db.getAddressesReceive().indexOf(address);
            if (ind !== -1)
                return this.getSignatureForIndex(ind);
            else
                return this.getSignatureForIndex(0);
            // return null;
        };
        EthereumController.prototype.getKeyPair = function (address) {
            return this.getKeyPairReceive(address);
        };
        // Just a default.... Might be undefined.
        /*getPrivateKeyByAddress(address: string): any {
            // Returns '' if a private key cannot be retrieved.
            let keyPairEC: any = this.getKeyPair(address);
            return keyPairEC.toWIF();
        }*/
        EthereumController.prototype.isMyAddressDB = function (address) {
            return this.isMyAddressReceive(address);
        };
        EthereumController.prototype.isMyAddressReceive = function (address) {
            return this.getAddressIndexReceive(address) !== -1;
        };
        EthereumController.prototype.getAddressIndex = function (address) {
            return this.getAddressIndexReceive(address);
        };
        EthereumController.prototype.getAddressIndexReceive = function (address) {
            return this._db.getAddressesReceive().indexOf(address);
        };
        EthereumController.prototype.getAddressReceive = function (i) {
            return this.coinService.generator.generateAddressReceive(i);
        };
        EthereumController.prototype.getCurrentPublicAddresReceive = function () {
            return this._db.getCurrentAddressReceive();
        };
        // Ethereum based coins don't have change address. To comply with interface we have this function but it always return null
        EthereumController.prototype.getCurrentAddressChange = function () {
            return null;
        };
        EthereumController.prototype.getCurrentIndexReceive = function () {
            return this._db.getCurrentIndexReceive();
        };
        EthereumController.prototype.getAddressesReceive = function () {
            return this._db.getAddressesReceive();
        };
        EthereumController.prototype.getAddressesAll = function () {
            return this._db.getAddressesReceive();
        };
        /*getQRCode(): string {
            //thirdparty.qrImage.imageSync(uri, {type: "png", ec_level: "H", size: 7, margin: 1}).toString('base64');
            return '';
        }*/
        ////////////////////////////////////////// Transactions///////////////////////
        EthereumController.prototype.onTransactionUserConfirmed = function (data) {
            this.rawTransaction = data;
        };
        EthereumController.prototype.mapDisplayTransactions = function (trs) {
            var myAddresses = this.getAddressesAll();
            jaxx.Utils.mapDisplayTransactionsEthereum(trs, myAddresses, this.symbol);
        };
        // Takes a raw VOTransaction and returns one that is ready for UI display
        // UI display has properties such as 'displayAddress' or 'incoming' that are not
        // present on raw transactions and have to be deduced from inputs/outputs
        EthereumController.prototype.processTransactionForDisplay = function (tx) {
            var new_tx_data = jaxx.Utils.deepCopy(tx);
            var tx_array = [new_tx_data];
            jaxx.Utils.mapDisplayTransactionsEthereum(tx_array, this.getAddressesAll(), this.symbol);
            return tx_array[0];
        };
        // Indicates if the controller supports TX history
        // Invoked by the UI when attempting to render 
        EthereumController.prototype.supportsTransactionHistory = function () {
            return true;
        };
        EthereumController.prototype.getTransactionsDisplay = function () {
            var trs = this._db.getTransactionsReceive();
            var notReady = trs.filter(function (item) {
                return !item.displayValue;
            });
            if (notReady.length) {
                this.mapDisplayTransactions(notReady);
                this._db.saveTransactionsReceive();
            }
            return {
                symbol: this.config.symbol,
                transactions: jaxx.Utils.deepCopy(trs).reverse(),
                blockexplorer_url: this.config.blockexplorer_url,
                trsConfirmations: this.config.trsConfirmations
            };
        };
        EthereumController.prototype.getBalance = function () {
            var balances = this._db.getBalancesReceive(true);
            if (balances.length === 0)
                return '0';
            //all balances including in balance result. before included only not dust
            balances = this._db.getBalancesReceiveNot0();
            var ar1 = balances.map(function (item) {
                return item.balance;
            });
            var res = jaxx.MATH.sum(ar1);
            var spent = this.spentBalances;
            spent.forEach(function (item) {
                res = jaxx.MATH.subtract(res, item.balance);
            });
            if (+res <= 0)
                res = '0';
            return res;
        };
        EthereumController.prototype.getBalanceDisplay = function () {
            if (this.isRestoringHistory)
                return '-1';
            var v = this.getBalance();
            if (+v < 0)
                return '0';
            return jaxx.MATH.weiToEther(v);
        };
        // included check balances sequence before generating keys
        EthereumController.prototype.mapPrivateKeys = function (balances, isChange) {
            var check = new jaxx.HealthAddressHD(balances, this.generator, isChange);
            if (check.wasProblem)
                console.warn(' it was a problem with addresses ' + this.config.symbol);
            var generator = this.generator;
            return balances.map(function (item) {
                var node = isChange ? generator.generateKeyPairChange(item.index) : generator.generateKeyPairReceive(item.index);
                return {
                    address: item.id,
                    balance: jaxx.MATH.weiToEther(item.balance),
                    privateKey: node.d.toBuffer(32).toString('hex')
                };
            });
        };
        EthereumController.prototype.generatePrivateKey = function (balances, isChange, cb) {
            var _this = this;
            var balance = balances[this.privateKeyCounter];
            if (balance) {
                var privateKey = void 0;
                if (isChange) {
                    privateKey = this.coinService.generator.generateKeyPairChange(this.privateKeyCounter).d.toBuffer(32).toString('hex');
                }
                else {
                    privateKey = this.coinService.generator.generateKeyPairReceive(this.privateKeyCounter).d.toBuffer(32).toString('hex');
                }
                this.out.push({
                    address: balance.id,
                    balance: jaxx.MATH.weiToEther(balance.balance),
                    privateKey: privateKey
                });
            }
            this.privateKeyCounter++;
            if (this.privateKeyCounter < balances.length) {
                setTimeout(function () {
                    _this.generatePrivateKey(balances, isChange, cb);
                }, 100);
            }
            else {
                cb();
            }
        };
        EthereumController.prototype.getPrivateKeys = function () {
            var _this = this;
            var deferred = $.Deferred();
            if (this._db.isNewWallet()) {
                this.createNewWallet();
                this.setHistoryTimestamp();
            }
            var timestamp = this.getHistoryTimestamp();
            this.out = [];
            this.privateKeyCounter = 0;
            if (!timestamp) {
                this.restoreHistory(function (error) {
                    if (error) {
                        deferred.reject(error);
                        return;
                    }
                    var balances = _this._db.getBalancesReceive(true);
                    _this.generatePrivateKey(balances, false, function () {
                        balances = _this._db.getBalancesChange(true);
                        _this.generatePrivateKey(balances, true, function () {
                            deferred.resolve(_this.out);
                        });
                    });
                });
            }
            else {
                var balances = this._db.getBalancesReceive(true);
                this.generatePrivateKey(balances, false, function () {
                    deferred.resolve(_this.out);
                });
            }
            return deferred;
        };
        EthereumController.prototype.validateAddress = function (address) {
            return this.validateAddressETH(address);
        };
        /*
        * Load Gas Price from api https://api.blockcypher.com/v1/eth/main
        * @method loadGasPrice
        * */
        EthereumController.prototype.loadGasPrice = function () {
            var _this = this;
            var ethereumController = jaxx.Registry.getCurrentCryptoController();
            if (ethereumController.config.useGasPriceApi) {
                var url = JaxxUtils.scrubInput(ethereumController.config.gasPriceUrl);
                $.getJSON(url).done(function (res) {
                    _this.setMiningFeeData(res);
                }).fail(function (err) {
                    console.error(err);
                });
            }
        };
        /*
        * Modify the ethereum config gas price with response from average gas price api
        * @method setMiningFeeData
        * @param {any} res - response from api server
        * */
        EthereumController.prototype.setMiningFeeData = function (res) {
            var ethController = jaxx.Registry.getCurrentCryptoController();
            var gasPrice = JaxxUtils.scrubInput(res[ethController.config.gasPriceOption]);
            if (gasPrice) {
                this.config.gasPrice = gasPrice;
            }
        };
        return EthereumController;
    }(jaxx.CoinControllerBase));
    jaxx.EthereumController = EthereumController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=ethereum-controller.js.map