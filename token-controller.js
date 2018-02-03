///<reference path="../com/models.ts"/>
///<reference path="../app/Registry.ts"/>
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
    var TokenController = (function (_super) {
        __extends(TokenController, _super);
        function TokenController(config) {
            var _this = _super.call(this, config) || this;
            _this.config = config;
            _this.gasPrice = 21 * 1e9;
            _this.gasLimit = 150000;
            _this.isToken = true;
            _this.BALANCE_CHANGED = 'BALANCE_CHANGED';
            _this.NOT_ENOUGH_ETHER = 'NOT_ENOUGH_ETHER';
            _this.ENOUGH_ETHER = 'ENOUGH_ETHER';
            _this.spentBalances = [];
            return _this;
        }
        TokenController.prototype.isEnoughGas = function () {
            var bal = +jaxx.Registry.Ethereum.getBalanceForAddress0();
            var gasRequred = +this.config.gasPrice * +this.config.gasLimit;
            return bal > gasRequred;
        };
        // returns reference to current address generator
        TokenController.prototype.getGenerator = function () {
            return jaxx.Registry.Ethereum.coinService.generator;
        };
        TokenController.prototype.initService = function () {
            this.coinService = new jaxx.TokenService(this.config);
        };
        // Takes a raw VOTransaction and returns one that is ready for UI display
        // UI display has properties such as 'displayAddress' or 'incoming' that are not
        // present on raw transactions and have to be deduced from inputs/outputs
        TokenController.prototype.processTransactionForDisplay = function (tx) {
            var new_tx_data = jaxx.Utils.deepCopy(tx);
            var tx_array = [new_tx_data];
            jaxx.Utils.mapDisplayTransactionsEthereum(tx_array, this.getAddressesAll(), this.symbol);
            return tx_array[0];
        };
        // Indicates if the controller supports TX history
        // Invoked by the UI when attempting to render 
        TokenController.prototype.supportsTransactionHistory = function () {
            return false;
        };
        TokenController.prototype.downloadBalancesAll = function (callBack) {
        };
        TokenController.prototype.getUTXOs = function () {
            return [];
        };
        TokenController.prototype.restoreHistory = function (callBack) {
            var _this = this;
            var address = this.getCurrentAddress();
            this.coinService.downloadBalances([address]).done(function (res) {
                if (res && res.length) {
                    var balance = _this.getCurrentBalance();
                    balance.balance = res[0].balance;
                    _this._db.saveBalancesReceive();
                }
                if (callBack)
                    callBack();
            });
        };
        TokenController.prototype.getCurrentBalance = function () {
            var balances = this._db.getBalancesReceive(true);
            if (balances.length === 0) {
                var balance = new VOBalance({
                    id: this.generateAddress(0, 'receive'),
                    balance: 0
                });
                this._db.saveBalancesReceive([balance]);
                return balance;
            }
            else
                return balances[0];
        };
        TokenController.prototype.checkBalanceCurrentReceive = function () {
            var _this = this;
            var address = this.getCurrentAddress();
            this.coinService.downloadBalances([address]).done(function (balances) {
                if (!balances)
                    return;
                var curBal = _this.getCurrentBalance();
                var curAmount = curBal.balance;
                var newAmount = balances[0].balance;
                var delta = Number(newAmount) - Number(curAmount);
                var precision = +newAmount / 1e6;
                if (Math.abs(delta) < precision)
                    delta = 0;
                console.log('%c ' + _this.symbol +
                    ' balance old: ' + jaxx.MATH.weiToEther(curAmount) +
                    ' new: ' + jaxx.MATH.weiToEther(newAmount) +
                    ' delta: ' + jaxx.MATH.weiToEther(delta + '') +
                    ' precision: ' + jaxx.MATH.weiToEther(precision + '') + ' ' +
                    (new Date()).toLocaleTimeString(), 'color:coral');
                if (delta < 0) {
                    console.warn(' erasing temp balance ');
                    _this.logConfirmedTransaction();
                    //When transaction processed update balance ETH to check is enough balance for next transaction
                    jaxx.Registry.Ethereum.refreshBalanceOnAddress0();
                    _this.spentBalances = [];
                }
                _this._db.saveBalancesReceive(balances);
                if (delta) {
                    console.log('%c ' + _this.symbol + ' delta  ' + delta, 'color:blue');
                    _this.dispatchBalance();
                }
            }).fail(function (err) { _this.onError(err); });
        };
        TokenController.prototype.logSentTransaction = function () {
            this.timestampStartSeconds = String(Date.now() / 1000);
            console.log('%c ' + this.symbol + ' Sent Transaction ' + new Date().toLocaleTimeString(), 'color:pink');
        };
        TokenController.prototype.logConfirmedTransaction = function () {
            this.timestampEndSeconds = String(Date.now() / 1000);
            console.log('%c ' + this.symbol + ' Confirmed Transaction ' + new Date().toLocaleTimeString(), 'color:pink');
            if (Number(this.timestampEndSeconds) - Number(this.timestampStartSeconds) > 60) {
                console.error('Transaction taking too long need to optimize gas price and gas limits');
            }
        };
        TokenController.prototype.getCurrentAddress = function () {
            return this.getCurrentBalance().id;
        };
        // Ethereum based coins and all tokens don't have change address. To comply with interface we have this function but it always return null
        TokenController.prototype.getCurrentAddressChange = function () {
            return null;
        };
        TokenController.prototype.getAddressesAll = function () {
            return [this.getCurrentAddress()];
        };
        TokenController.prototype.getSpendable = function () {
            var bals = this._db.getBalancesReceive(true);
            if (bals.length) {
                var balance = bals[0].balance;
                return jaxx.MATH.weiToEther(balance);
            }
            //TODO: Need to create balance
            console.log('TODO: Need to create balance');
            return 'NO balance';
        };
        TokenController.prototype.getSpendableBalance = function (callback) {
            var bals = this._db.getBalancesReceive(true);
            if (bals.length) {
                var balance = bals[0].balance;
                callback(jaxx.MATH.weiToEther(balance));
            }
            //TODO: Need to create balance
            //console.log('TODO: Need to create balance');
            callback(null);
        };
        TokenController.prototype.buildTransaction = function (amount, addressTo, isMax, customGasLimit, customData) {
            var _this = this;
            var spendable = this.getSpendable();
            ///one mo time check if for some reason requested amount more then spendable considering input was wrong and sending max;
            if (!isMax && +amount >= +spendable)
                isMax = true;
            var requested = amount;
            var addressFrom = this.getCurrentAddress();
            var contractAddress = this.config.contractAddress;
            var differed = $.Deferred();
            var gasLimit = (customGasLimit == null) ? this.config.gasLimit : customGasLimit;
            var gasPrice = this.config.gasPrice;
            var symbol = this.config.symbol;
            var signature = jaxx.Registry.Ethereum.getSignatureForAddress(addressFrom);
            gasLimit = this.config.gasLimit;
            console.log(this.name + ' buildTransaction - user amount ' + amount + ' to ' + addressTo);
            var amountWei = jaxx.MATH.etherToWei(amount);
            if (isMax) {
                amountWei = this.getBalance();
            }
            var shift = this.config.shiftCount;
            if (shift) {
                // TODO if has shift do not convert to wei
                amountWei = jaxx.MATH.removeTrailingZeros(amountWei, this.config);
            }
            jaxx.Registry.Ethereum.getNonces([addressFrom]).done(function (nonces) {
                var nonce = nonces[addressFrom];
                var transaction = jaxx.TransactionsUtilsToken.buildToken(requested, amountWei, addressTo, nonce, contractAddress, gasLimit, gasPrice, signature, symbol, isMax, customData, _this.config);
                transaction.miningFeeSymbol = 'ETH';
                console.log(transaction);
                differed.resolve(transaction);
            });
            return differed.promise();
        };
        TokenController.prototype.mapDisplayTransactions = function (trs) {
        };
        /*getAddresseAll():string[]{
            return [this.getCurrentReceiveAddress()]
        }*/
        TokenController.prototype.onCurrentAddressGotBalance = function (balance) {
            var currentBalances = this._db.getBalancesAll(true);
            if (currentBalances.length === 0)
                return console.error('JN - onCurrentAddressGotBalance - No Balance');
            var currentBalance = currentBalances[0];
            if (currentBalance.balance !== balance.balance) {
                this._db.saveBalancesReceive([balance]);
                this.dispatchBalance();
                // TODO: Display update to UI NOT WORKING.
            }
            else {
                console.log(this.name + ' same balance ');
            }
        };
        TokenController.prototype.addListener = function (updateWalletUI) {
            this._updateWalletUI = updateWalletUI;
        };
        TokenController.getHistory = function () {
            return [];
        };
        TokenController.generateQRCode = function () {
            return jaxx.EthereumController.generateQRCode();
        };
        /* getCurrentReceiveAddress() {
             return this.getCurrentAddress();
         }*/
        /*  getSpendableBalance() {
              return this.getBalance();
          }*/
        //        private _transactionsData;
        /*setTransactionData(data) {
            this._transactionsData = data;
        }*/
        /*getTransactionDataTemp() {
            return 0;
        }*/
        /*setMaxSpendableCachedAmount(amount) {
            console.log(amount);
        }*/
        TokenController.prototype.adjustBalances = function (amount) {
            var shift = this.config.shiftCount;
            //console.warn('Has shift? ', shift);
            if (shift) {
                //TODO need to check if has shift and shift it back to the right
                amount = jaxx.MATH.addTrailingZeros(amount, this.config);
            }
            if (this.spentBalances.length) {
                this.spentBalances[0].balance = jaxx.MATH.sum([amount, this.spentBalances[0].balance]);
            }
            else
                this.spentBalances = [new VOBalance({
                        id: this.getCurrentAddress(),
                        balance: amount
                    })];
        };
        /*setIsSendingFullMaxSpendable(bool) {
            this._isSendingAll = bool;
        }*/
        TokenController.prototype.getIsSendingFullMaxSpendable = function () {
            return this._isSendingAll;
        };
        //        sendTranasactionController: TokenTransactions;
        TokenController.prototype.sendTransaction = function (transaction) {
            var _this = this;
            var deferred = $.Deferred();
            console.log(this.name = '  sendTransaction   ', transaction);
            this.coinService.sendTransaction(transaction).then(function (result) {
                console.log(result);
                if (result.success === 'success') {
                    var spent = transaction.amountInt;
                    _this.adjustBalances(spent);
                    _this.dispatchBalance();
                    _this.logSentTransaction();
                    deferred.resolve(result);
                }
                else {
                    deferred.reject(result);
                }
            }).fail(function (error) {
                deferred.reject({ error: error });
            });
            return deferred;
        };
        TokenController.prototype.getBalance = function () {
            var balances = this._db.getBalancesReceive(true);
            if (balances.length === 0)
                return '-1';
            var res = balances[0].balance;
            var spent = this.spentBalances;
            spent.forEach(function (item) {
                res = jaxx.MATH.subtract(res, item.balance);
            });
            return res;
        };
        TokenController.prototype.getBalanceDisplay = function () {
            return jaxx.MATH.weiToEther(this.getBalance());
        };
        /* deactivate(): boolean {
             console.warn('  deactivate ');
             this.isActive = false;
             //this.balanceController.stop();
             return true;
         }*/
        TokenController.prototype.activate = function () {
            var _this = this;
            if (this.isActive)
                return;
            this.isActive = true;
            this.loadGasPrice();
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_COIN_ACTIVATED, this);
            var timestamp = this.getHistoryTimestamp();
            if (!timestamp) {
                this.restoreHistory(function () {
                    _this.setHistoryTimestamp();
                    jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_RESTORE_HISTORY_DONE, _this);
                    setTimeout(function () { return _this.startBalancesCheck(); }, 10000);
                });
            }
            else {
                this.startBalancesCheck();
            }
            var onStart = this.getStartOption();
            if (onStart && onStart != 'pair-device') {
                console.warn(' pair device ');
                this.setHistoryTimestamp();
                this.createStartAddresses();
            }
            console.log('%c ' + this.symbol + ' activate  on-start: ' + onStart + '    ' + timestamp, 'color:red');
            return true;
        };
        TokenController.prototype.createNewWallet = function () {
        };
        /*setEnabled(enabled: boolean): void {
            this.isEnabled = enabled;
        }*/
        TokenController.prototype.generateAddress = function (index, type) {
            return jaxx.Registry.Ethereum.getAddressReceive(0);
        };
        /* getCurrentAddress(): string {
             let balances:VOBalance[] = this._db.getBalancesAll(true);
             if (!balances.length) {
                 let address:string =
 
                 this._db._saveBalancesReceive([new VOBalance({ id:address, balance:"0", decimal:0})]);
                 return address;
             }
             return balances[0].id;
         }*/
        TokenController.prototype.validateAddress = function (address) {
            return this.validateAddressETH(address);
        };
        /*
        * Load Gas Price from api https://api.blockcypher.com/v1/eth/main
        * @method loadGasPrice
        * */
        TokenController.prototype.loadGasPrice = function () {
            var _this = this;
            var ethereumController = jaxx.Registry.getCryptoControllerBySymbol('ETH');
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
        TokenController.prototype.setMiningFeeData = function (res) {
            var ethController = jaxx.Registry.getCryptoControllerBySymbol("ETH");
            this.config.gasPrice = JaxxUtils.scrubInput(res[ethController.config.gasPriceOption]);
        };
        return TokenController;
    }(jaxx.CoinControllerBase));
    jaxx.TokenController = TokenController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=token-controller.js.map