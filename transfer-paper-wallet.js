var jaxx;
(function (jaxx) {
    var TransferPaperWallet = (function () {
        /*
        * Dynamically adds the html to index.html with appropriate content and attaches click events (scriptAction) to
        * appropriate dom elements.
        * */
        function TransferPaperWallet() {
            var _this = this;
            this.$view = $('#transferPaperWallet');
            this.$view.load('js/app/transfer-paper-wallet/transfer-paper-wallet.html', null, function () {
                setTimeout(function () {
                    _this.attachClickEvents();
                    _this.$inputPrivateKey = _this.$view.find('#privateKeySweep');
                    _this.$inputPrivateKey.on('change paste keyup', function () {
                        _this.sweepPrivateKey();
                    });
                    _this.$nextButton = _this.$view.find('.sweepNextButton');
                    _this.$nextButton.on('click', function () {
                        _this.enableSweeping();
                        if (_this.symbol === 'ETH' || _this.symbol === 'ETC') {
                            _this.sweepEthereum(function () {
                                _this.disableSweeping();
                            });
                        }
                        else {
                            _this.sweepCoin(function () {
                                _this.disableSweeping();
                            });
                        }
                    });
                }, 1000);
            });
        }
        /*
        * Sweeps the coin(ex. BTC) private key that was provided.  If there is data in the callback and it is not "zero" then it will
        * load the next screen (Confirm to sweep the private key), clear the input field.  Otherwise it will show a
        * banner telling the user that they have insufficient funds or invalid private key.
        * @method sweepCoin
        * */
        TransferPaperWallet.prototype.sweepCoin = function (cb) {
            var _this = this;
            jaxx.Registry.application.paperWalletTransactionController.prepareSweepTransactionCoin(this.$inputPrivateKey.val().toString(), this.symbol, function (err, data) {
                if (err) {
                    Navigation.flashBanner(err, 2);
                    return cb();
                }
                if (data) {
                    if (data === 'zero') {
                        return Navigation.flashBanner('Insufficient funds or no funds in this private key.', 2);
                    }
                    jaxx.Registry.application.sweepPrivateKey.symbol = _this.symbol;
                    jaxx.Registry.application.sweepPrivateKey.signedTransaction = data.signedTransaction;
                    jaxx.Registry.application.sweepPrivateKey.amount = data.totalValue;
                    jaxx.Registry.application.sweepPrivateKey.setAmount();
                    Navigation.pushSettings('confirmSweepPrivateKey');
                    _this.$inputPrivateKey.val('').trigger('keyup');
                    cb();
                }
                else {
                    cb();
                    Navigation.flashBanner('Invalid Private Key', 2);
                }
            });
        };
        /*
        * Sweeps ethereum private key that was provided.  If there is data in the callback and it is not "zero" then it will
        * load the next screen (Confirm to sweep the private key), clear the input field.  Otherwise it will show a
        * banner telling the user that they have insufficient funds or invalid private key.
        * @method sweepEthereum
        * */
        TransferPaperWallet.prototype.sweepEthereum = function (cb) {
            var _this = this;
            jaxx.Registry.application.paperWalletTransactionController.prepareSweepTransactionEthereum(this.symbol, this.$inputPrivateKey.val().toString(), function (err, data) {
                if (err) {
                    Navigation.flashBanner(err, 2);
                    return cb();
                }
                if (data) {
                    if (data === 'zero') {
                        return Navigation.flashBanner('Insufficient funds or no funds in this private key.', 2);
                    }
                    jaxx.Registry.application.sweepPrivateKey.symbol = _this.symbol;
                    jaxx.Registry.application.sweepPrivateKey.signedTransaction = data.signedTransaction;
                    jaxx.Registry.application.sweepPrivateKey.amount = data.totalValue;
                    jaxx.Registry.application.sweepPrivateKey.setAmount();
                    Navigation.pushSettings('confirmSweepPrivateKey');
                    _this.$inputPrivateKey.val('').trigger('keyup');
                    cb();
                }
                else {
                    cb();
                    Navigation.flashBanner('Invalid Private Key', 2);
                }
            });
        };
        /*
        * Disable the next button in the bottom right corner
        * @method disableButton
        * */
        TransferPaperWallet.prototype.disableButton = function () {
            this.$nextButton.addClass('cssStartHidden').css('cursor', 'default');
        };
        /*
        * Enable the next button in the bottom right corner
        * @method enableButton
        * */
        TransferPaperWallet.prototype.enableButton = function () {
            this.$nextButton.removeClass('cssStartHidden').css('cursor', 'pointer');
        };
        /*
        * Sweeps the private key that the user inputs and enables/disables the button depending on if the user inputs a
        * somewhat valid private key.  We will analyze if it is a truly valid private key when we try to send the
        * transaction.
        * @method sweepPrivateKey
        * */
        TransferPaperWallet.prototype.sweepPrivateKey = function () {
            var value = this.$inputPrivateKey.val();
            if (value === "") {
                this.disableButton();
                return;
            }
            var isPlainPrivateKey = TransferPaperWallet.validPrivateKey(this.symbol, value);
            if (isPlainPrivateKey) {
                this.enableButton();
            }
            else {
                this.disableButton();
            }
        };
        /*
        * When user clicks next button we want to disable the button and change the text to sweeping...
        * @method enableSweeping
        * */
        TransferPaperWallet.prototype.enableSweeping = function () {
            this.$nextButton.prop("disabled", true);
            this.$nextButton.text('Sweeping...');
        };
        /*
        * Revert the text and functionality of the button back of the next button
        * @method disableSweeping
        * */
        TransferPaperWallet.prototype.disableSweeping = function () {
            this.$nextButton.text('Next');
            this.$nextButton.prop("disabled", false);
        };
        /*
        * Attaches click event to scriptAction events for the dynamically added content.
        * @method attachClickEvents
        * */
        TransferPaperWallet.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        /*
        * Attaches click events for any dom elements with the script action tag that we added dynamically.
        * @method attachClickEventForScriptAction
        * */
        TransferPaperWallet.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        /*
        * Validates the private key based on the symbol and returns a true or false value based on the validity.
        * @method validPrivateKey
        * @param {String} symbol
        * @param {String} privateKey
        * @return {Boolean} */
        TransferPaperWallet.validPrivateKey = function (symbol, privateKey) {
            var coinController = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            if (coinController.config.request === "RequestBitcoin" && coinController.config.network) {
                return TransferPaperWallet.isValidBTCPrivateKey(privateKey, coinController.config.network);
            }
            else if (coinController.config.request === "EthereumService") {
                if (TransferPaperWallet.addressFromEthereumPrivateKey(privateKey)) {
                    return true;
                }
            }
            return false;
        };
        /*
        * Validates coin private key and returns true or false based on the validity.
        * @method isValidBTCPrivateKey
        * @param {String} privateKey
        * @param {Object} networkDef
        * @return {Boolean}
        * */
        TransferPaperWallet.isValidBTCPrivateKey = function (privateKey, networkDef) {
            var valid = false;
            try {
                var keyPair = thirdparty.bitcoin.ECPair.fromWIF(privateKey, networkDef);
                if (keyPair) {
                    valid = true;
                }
            }
            catch (err) {
                valid = false;
            }
            return valid;
        };
        /*
        * Validates etheruem private key and returns an address string.
        * @method addressFromEthereumPrivateKey
        * @param {String} privateKey
        * @return {String} ethereum public address
        * */
        TransferPaperWallet.addressFromEthereumPrivateKey = function (privateKey) {
            //Create a fake tx
            var controller = jaxx.Registry.getCryptoControllerBySymbol('ETH');
            var mockUpTxRaw = {
                nonce: thirdparty.web3.toHex(1),
                gasPrice: thirdparty.web3.toHex(thirdparty.web3.toBigNumber(thirdparty.web3.toWei(21, 'shannon')).toDigits(1)),
                gasLimit: thirdparty.web3.toHex(controller.config.gasLimit),
                to: "0xbac369f138d479abd45340e7735f80617a008ee7",
                value: thirdparty.web3.toHex(1)
            };
            var mockUpTxR = new thirdparty.ethereum.tx(mockUpTxRaw);
            //Sign with the private key
            var privateKeyHex = new thirdparty.Buffer.Buffer(privateKey, 'hex');
            mockUpTxR.sign(privateKeyHex);
            var address = mockUpTxR.getSenderAddress().toString('hex');
            if (address) {
                return '0x' + address;
            }
            return null;
        };
        return TransferPaperWallet;
    }());
    jaxx.TransferPaperWallet = TransferPaperWallet;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=transfer-paper-wallet.js.map