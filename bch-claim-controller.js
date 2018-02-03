/**
 * Created by jnewlands on 2017-SEP-01.
 */
var jaxx;
(function (jaxx) {
    var BCHClaimController = (function () {
        function BCHClaimController(callback) {
            var _this = this;
            this.checkClaimOnNotification = false;
            BCHClaimController.instance = this;
            this.confirmation = '.cssBCHConfirmation';
            this.$view = $('#ClaimBCHConfirmation');
            this.$view.load('js/app/bch-claim/bch-claim.html', "", function () {
                setTimeout(function () {
                    _this.init();
                    if (callback)
                        callback(BCHClaimController.instance);
                }, 1000);
            });
        }
        BCHClaimController.prototype.init = function () {
            var _this = this;
            this.$amountValue1 = $('#claimBCHModalValue1');
            this.$amountValue2 = $('#claimBCHModalValue2');
            this.hasLoaded = true;
            this.$cancel = $('#cancelClaimBCH');
            this.$cancel.on('click', function () {
                _this.hide();
            });
            this.$claim = $('#claimBCH');
            this.$claim.on('click', function () {
                _this.hide();
                if (g_JaxxApp.getUser().hasPin()) {
                    g_JaxxApp.getUI().showEnterPinModal(function (error) {
                        if (error) {
                            console.log("enter pin error :: " + error);
                        }
                        else {
                            _this.claimBitcoinCash();
                        }
                    });
                }
                else {
                    _this.claimBitcoinCash();
                }
            });
            var self = this;
            var performCheckBitcoinCash = function () {
                self.checkBitcoinCash(function (response) {
                    if (response && !jaxx.MATH.isZero(response.totalBCHBalance)) {
                        console.warn('JN - BCH Balance:', response);
                        self.show(response.totalBCHBalance);
                    }
                    else {
                        // console.warn('JN - Want to set claim modal to TRUE.');
                        BCHClaimController.setClaimModalForBCH(true);
                    }
                });
            };
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, obj) {
                if (obj.symbol === 'BCH' && BCHClaimController.getClaimModalForBCH() === 'false') {
                    // console.warn('performCheckBitcoinCash');
                    performCheckBitcoinCash();
                }
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_DONE, function (evt, obj) {
                if (obj.symbol === 'BTC' && _this.checkClaimOnNotification) {
                    _this.checkClaimOnNotification = false;
                    performCheckBitcoinCash();
                }
            });
        };
        BCHClaimController.prototype.checkBitcoinCash = function (callback) {
            var _this = this;
            var ctrBCH = jaxx.Registry.getCryptoControllerBySymbol('BCH');
            if (!ctrBCH)
                return console.error("Unable to retrieve BCH Crypto Controller.");
            var ctrBTC = jaxx.Registry.getCryptoControllerBySymbol('BTC');
            if (!ctrBTC)
                return console.error("Unable to retrieve BTC Crypto Controller.");
            var hasRestoreHistory = ctrBTC.getHistoryTimestamp();
            var response = {
                balances: null,
                totalBCHBalance: "0",
                tx: null
            };
            var performCallback = function (responseValue) {
                jaxx.Application.instance.hideInitializeWallet();
                callback(responseValue);
            };
            var self = this;
            var calculateClaimFromHistory = function () {
                response.balances = ctrBTC.getAddressesAll();
                var addresses = response.balances || [];
                if (addresses.length === 0)
                    callback();
                ctrBCH.coinService.downlaodUTXOs(addresses).done(function (utxos) {
                    var amount = 0;
                    var totalSatoshis = 0;
                    var miningFee = jaxx.MATH.satoshiToBtc(ctrBCH.config.miningFee.toString());
                    utxos.forEach(function (item) {
                        amount += +item.amount;
                        totalSatoshis += +item.satoshis;
                    });
                    // If no amount to claim, no need to build the transaction.
                    if (amount === 0)
                        return performCallback(response);
                    amount = amount - +miningFee;
                    response.totalBCHBalance = String(amount);
                    var tx = BCHClaimController.buildBitcoinTransactionWithInputsAndOutputsTransition(totalSatoshis.toString(), utxos);
                    var BTCCtr = jaxx.Registry.getCryptoControllerBySymbol('BTC');
                    if (!BTCCtr) {
                        console.error('no controller ');
                        return;
                    }
                    response.tx = tx;
                    self.claimSendTransaction = tx;
                    callback(response);
                }).fail(function (error) {
                    console.error('checkBitcoinCash - downloadUTXO error:', error);
                    performCallback(null);
                });
            };
            if (hasRestoreHistory) {
                calculateClaimFromHistory();
            }
            else {
                ctrBTC.restoreHistory(function () {
                    _this.checkClaimOnNotification = true;
                    calculateClaimFromHistory();
                });
            }
        };
        BCHClaimController.prototype.claimBitcoinCash = function () {
            if (!this.claimSendTransaction)
                return Navigation.flashBanner("Missing BCH Send Transaction.", 5, 'error');
            var ctr = jaxx.Registry.getCryptoControllerBySymbol('BCH');
            if (!ctr)
                return console.error("Unable to retrieve BCH Crypto Controller.");
            ctr.sendTransaction(this.claimSendTransaction).done(function (result) {
                if (result.success === 'success') {
                    BCHClaimController.setClaimModalForBCH(true);
                    Navigation.flashBanner('Transaction sent', 2, 'success');
                }
                else {
                    Navigation.flashBanner('Transaction failed', 2);
                    console.error(result);
                }
            }).fail(function (err) {
                Navigation.flashBanner('Transaction failed', 2);
                console.error(err);
            });
        };
        BCHClaimController.getClaimModalForBCH = function () {
            if (getStoredData('bchclaimModal')) {
                return getStoredData('bchclaimModal');
            }
            else {
                BCHClaimController.setClaimModalForBCH(false);
                return getStoredData('bchclaimModal');
            }
        };
        BCHClaimController.prototype.hide = function () {
            Navigation.closeNotificationBanner(this.confirmation);
        };
        BCHClaimController.prototype.isLoaded = function () {
            return this.hasLoaded;
        };
        BCHClaimController.setClaimModalForBCH = function (flag) {
            storeData("bchclaimModal", flag);
        };
        BCHClaimController.prototype.show = function (amount) {
            this.$view.parent().removeClass('cssStartHidden');
            var amountValue = jaxx.Formatters.balanceForDisplay(amount);
            this.$amountValue1.html(amountValue);
            this.$amountValue2.html(amountValue);
            if ($('.tabContent.cssTabContent').hasClass(this.confirmation)) {
                setTimeout(function () {
                    Navigation.openNotificationBanner(this.confirmation);
                }, 800);
            }
            else {
                Navigation.openNotificationBanner(this.confirmation);
            }
        };
        BCHClaimController.buildBitcoinTransactionWithInputsAndOutputsTransition = function (amount, toSpend) {
            // This mimicks the data structure we keep our transactions in so we can
            // simulate instantly fulfilling the transaction
            var tx = new bitcore.Transaction();
            var BCHCtr = jaxx.Registry.getCryptoControllerBySymbol('BCH');
            var miningFee = BCHCtr.config.miningFee;
            var BTCCtr = jaxx.Registry.getCryptoControllerBySymbol('BTC');
            var receiveAddress = BCHCtr.getCurrentAddress();
            tx.to(receiveAddress, (+amount - miningFee));
            for (var i = 0; i < toSpend.length; i++) {
                var utxo = toSpend[i];
                var inputObj = {
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    script: bitcore.Script.buildPublicKeyHashOut(utxo.address),
                    satoshis: +utxo.satoshis
                };
                tx.from(inputObj);
            }
            tx.sort();
            for (var i = 0; i < toSpend.length; i++) {
                var utxo = toSpend[i];
                var getPVKey = BTCCtr.getPrivateKeyWifByAddress(utxo.address); // wallet.getPouchFold(COIN_BITCOIN).getPrivateKey(utxo.addressInternal, utxo.addressIndex);
                var signKey = bitcore.PrivateKey.fromWIF(getPVKey);
                tx.sign(signKey.toString());
            }
            tx.fee(miningFee);
            var serialized = tx.serialize();
            return {
                txid: 'txid',
                requested: amount + '',
                amountInt: amount + '',
                amountDecimal: +jaxx.MATH.satoshiToBtc(amount + ''),
                amountDecimalDisplay: null,
                displayAmount: jaxx.MATH.satoshiToBtc(amount + ''),
                miningFeeInt: miningFee + '',
                miningFeeDecimal: 0.0002,
                miningFeeSymbol: null,
                changeAmount: '0',
                totalSpent: amount + '',
                size: 0,
                hex: serialized,
                targetTransactionFee: miningFee,
                transactionBTC: tx,
                changeAddress: null,
                // amountDecimal: +toSendSatoshi / 1e8,
                outputs: null,
                inputs: null,
                addressTo: receiveAddress,
                symbol: "BTC",
                isMax: true,
                success: {}
            };
        };
        return BCHClaimController;
    }());
    jaxx.BCHClaimController = BCHClaimController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=bch-claim-controller.js.map