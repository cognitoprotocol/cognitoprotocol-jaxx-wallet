var jaxx;
(function (jaxx) {
    /**
     * Enum for types of shape shift drop down menus
     * @readonly
     * @enum {number}
     * */
    var ShapeShiftDropDownMenuType;
    (function (ShapeShiftDropDownMenuType) {
        ShapeShiftDropDownMenuType[ShapeShiftDropDownMenuType["From"] = 0] = "From";
        ShapeShiftDropDownMenuType[ShapeShiftDropDownMenuType["To"] = 1] = "To";
    })(ShapeShiftDropDownMenuType || (ShapeShiftDropDownMenuType = {}));
    var ShapeshiftRequest = (function () {
        function ShapeshiftRequest() {
            this.apiKey = '';
        }
        ShapeshiftRequest.prototype.getShift = function (data) {
            var url = "https://shapeshift.io/shift/";
            return $.post(url, data).then(function (result) {
                return result;
            });
        };
        ShapeshiftRequest.prototype.getPair = function (pair) {
            var url = "https://shapeshift.io/marketinfo/" + pair;
            return $.getJSON(url).then(function (result) {
                return result;
            });
        };
        return ShapeshiftRequest;
    }());
    var ShapeShiftController = (function () {
        function ShapeShiftController(sendTransactionsController) {
            var _this = this;
            this.sendTransactionsController = sendTransactionsController;
            this.ON_EXCHANGE_CHANGED = 'ON_EXCHANGE_CHANGED';
            this.ON_SHIFT_CHANGED = 'ON_SHIFT_CHANGED';
            this.emitter$ = $({});
            this.onExchangeDataDownloaded = null;
            this.outsideClickHandler = this.onOutsideClick.bind(this);
            ShapeShiftController.instance = this;
            this.$sendLabel = $('#sendLabel');
            this.$view = $('#ShapeShiftView');
            this.$view.load('js/app/shape-shift/shape-shift-view.html', function (res) {
                setTimeout(function () { return _this.init(); }, 60);
            });
            this.confirmScreen = new jaxx.SendConfirmationView();
            this.shapeShiftNotAvailable = new jaxx.ShapeShiftNotAvailable();
            this.confirmScreen.onCancel = function () {
                _this.confirmScreen.hide();
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CANCEL_TRANSACTION, 'shapeShift');
            };
            this.confirmScreen.onConfirm = function () {
                _this.confirmScreen.hide();
                // A wrapper function that wrap the complete send transaction logic
                var completedSendTransaction = function () {
                    jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION);
                    var ctr = jaxx.Registry.getCurrentCryptoController();
                    // Perform send transaction
                    ctr.sendTransaction(_this.sendTransactionsController.transaction).done(function (result) {
                        if (result.success === 'success') {
                            Navigation.flashBanner('ShapeShift Successful', 2, 'success');
                        }
                        else {
                            Navigation.flashBanner('ShapeShift Failed', 2);
                        }
                    }).fail(function (err) {
                        Navigation.flashBanner('ShapeShift Failed', 2);
                    });
                };
                //If user has pin setup then show the pin input screen
                if (g_JaxxApp.getUser().hasPin()) {
                    g_JaxxApp.getUI().showEnterPinModal(function (error) {
                        //If input pin error, return without proceed to transaction
                        if (error) {
                            console.log("enter pin error :: " + error);
                            return;
                        }
                        //Pin enter succeed, proceed to complete transaction
                        completedSendTransaction();
                    });
                }
                else {
                    // If no pin setup then proceed to complete transaction
                    completedSendTransaction();
                }
            };
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END, function () {
                _this.onShapeShiftWalletAnimationEnded();
            });
        }
        /**
         * Function to fire after the animation of switching the from coin / token in the ShapeShift drop down menu
         * @method onShapeShiftWalletAnimationEnded
         * */
        ShapeShiftController.prototype.onShapeShiftWalletAnimationEnded = function () {
            jaxx.Registry.application.balanceController.fiatBalanceView.updatefiatWalletBalance(jaxx.Registry.getCurrentCryptoController().symbol);
            setTimeout(function () {
                jaxx.Registry.application.spinner.hideSpinner(function () {
                    jaxx.Registry.application.spinner.animateInAllWalletElements();
                });
            }, 1000);
        };
        ShapeShiftController.prototype.isReady = function (amountDecimal, callBack) {
            var amount = amountDecimal;
            this.amountToSend = String(amountDecimal);
            if (!this.exchange) {
                callBack({ warn: { message: 'no exchange yet' } });
                return;
            }
            console.log('SS  ' + amount + ' depositMin ' + this.exchange.minimum + ' depositMax ' + this.exchange.minimum);
            amount = amount - this.exchange.minerFee;
            if (this.exchange.minimum < amount && this.exchange.maxLimit > amount) {
                callBack({ success: this.exchange });
            }
            else {
                var resp = {
                    warn: {
                        message: 'no exchange yet'
                    }
                };
                callBack(resp);
            }
        };
        ShapeShiftController.prototype.onOutsideClick = function () {
            if (!this.clickedOutside) {
                this.hideList();
            }
            else {
                this.clickedOutside = false;
            }
        };
        /**
         * When the dropdown menu button is click it will show the list
         * @method showList
         * @param {ShapeShiftDropDownMenuType} shapeshiftMenuType
         * */
        ShapeShiftController.prototype.showList = function (shapeshiftMenuType) {
            if (shapeshiftMenuType === ShapeShiftDropDownMenuType.To) {
                this.$listViewTo.fadeIn(150);
                this.$buttonShowListImageTo.removeClass('cssFlipped');
            }
            else if (!this.isFromListEmpty) {
                this.$listViewFrom.fadeIn(150);
                this.$buttonShowListImageFrom.removeClass('cssFlipped');
            }
            window.addEventListener('click', this.outsideClickHandler);
            this.isLastOpen = true;
        };
        /**
         * Hides the dropdown list
         * @method hideList
         * */
        ShapeShiftController.prototype.hideList = function () {
            this.isLastOpen = false;
            this.$listViewTo.fadeOut(150);
            this.$listViewFrom.fadeOut(150);
            this.$buttonShowListImageTo.addClass('cssFlipped');
            this.$buttonShowListImageFrom.addClass('cssFlipped');
            window.removeEventListener('click', this.outsideClickHandler);
        };
        ShapeShiftController.prototype.init = function () {
            var _this = this;
            this.$help = $('#ShapeShiftHelp').hide();
            this.visible = false;
            this.request = new ShapeshiftRequest();
            this.$listTo = $('#ShapeshiftCoinSelectionList');
            this.$listFrom = $('#ShapeshiftCoinSelectionListFrom');
            this.$listViewTo = $('#ShapeShiftListView');
            this.$listViewFrom = $('#ShapeShiftListViewFrom');
            this.$symbolFrom1 = $('.shapeShiftAbbreviatedUnitSend');
            this.$symbolTo1 = $('#ShapeShift-symbolTo1');
            this.$symbolTo2 = $('#ShapeShift-symbolTo2');
            this.$rate = $('#ShapeShift-rate');
            this.$depositMin = $('#ShapeShiftDepositMin');
            this.$depositMax = $('#ShapeShiftDepositMax');
            this.$depositMinCaution = $('#depositMinCaution');
            this.$depositMaxCaution = $('#depositMaxCaution');
            this.$From = $('#ShapeShift-From');
            this.$To = $('#ShapeShift-To');
            this.$shapeShiftHelp = $('#ShapeShiftHelp');
            this.$shapeShiftInfoButton = $('#shapeShiftInfoButton');
            this.$shapeShiftClose = $('#ShapeShiftClose');
            this.$buttonDropDownTo = $('#ShapeShift-buttonShowList');
            this.$buttonShowListImageTo = $('#ShapeShift-buttonShowList-Image');
            this.$buttonShowListFrom = $('#ShapeShift-buttonShowList-From');
            this.$buttonShowListImageFrom = $('#ShapeShift-buttonShowList-Image-From');
            this.$maxButton = $('#shapeShiftMaxButton');
            this.isFromListEmpty = false;
            this.$buttonDropDownTo.on('click', function () {
                _this.clickedOutside = true;
                if (_this.isLastOpen) {
                    _this.hideList();
                }
                else {
                    _this.showList(ShapeShiftDropDownMenuType.To);
                }
            });
            //click listener for the shapeshift from drop down button
            this.$buttonShowListFrom.on('click', function () {
                _this.clickedOutside = true;
                if (_this.isLastOpen) {
                    _this.hideList();
                }
                else {
                    _this.showList(ShapeShiftDropDownMenuType.From);
                }
            });
            //click listener for the shapeshift to drop down button
            this.$listTo.on('click', 'tr', function (el) {
                var element = $(el.currentTarget);
                var symbol = element.data('symbol');
                _this.changeCoinShiftToType(symbol);
            });
            //clicking on list items in the shapeshift from menu
            this.$listFrom.on('click', 'tr', function (el) {
                var element = $(el.currentTarget);
                var symbol = element.data('symbol');
                _this.transitionState(symbol);
                jaxx.Registry.application$.trigger(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE, symbol);
            });
            //listens for shape shift coin animation change
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END, function () {
                jaxx.Registry.application$.trigger(jaxx.Registry.ON_COIN_SATUS_CHANGED);
                _this.renderShapeShiftView();
                _this.renderLists();
            });
            this.$shapeShiftHelp.show();
            this.$shapeShiftInfoButton.on('click', function () {
                _this.clickShapeShiftInfoToggle();
            });
            this.$shapeShiftClose.on('click', function () {
                _this.clickShapeShiftClose();
            });
            //click event listener for shape shift max button click
            this.$maxButton.on('click', function () {
                _this.sendTransactionsController.updateFieldWithBalance(_this.sendTransactionsController.$amount, _this.sendTransactionsController.spendableView.getSpendable());
                _this.sendTransactionsController.amountDidChangeListener();
                // When max is input into the amount field, remove the placeholder text
                _this.sendTransactionsController.$amount.attr("placeholder", "");
            });
        };
        ShapeShiftController.prototype.setLastToSelected = function () {
            var symbol = this.lastSymbol;
            this.changeCoinShiftToType(symbol);
        };
        /**
         * function that is fired when user click on shape shift to list item
         * @method changeCoinShiftToType
         * @param {String} symbol
         * */
        ShapeShiftController.prototype.changeCoinShiftToType = function (symbol) {
            if (!symbol || symbol == "XXX") {
                throw new Error("ShapeShift Error: Cannot find symbol or temporarily unavailable.");
            }
            var el = this.$listTo.find("[data-symbol=" + symbol + "]");
            this.ctrTo = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            this.$selected = el;
            this.lastSymbol = symbol;
            this.hideList();
            this.downloadExchange(null);
        };
        ShapeShiftController.getAPIKey = function () {
            var apiKey = DCConfig.apiKeys.SHAPESHIFT;
            if (apiKey) {
                return apiKey;
            }
            else {
                return '180aaede8f5451a52847824f4965cc25f43a5d2bb49f483c1f1ecc8afad661b65e22a01046bfd67257e31189b48f5a1ec35207653bd017f8203f4241c763074a';
            }
        };
        ShapeShiftController.prototype.shift = function (amount, callBack) {
            var _this = this;
            if (!this.ctrFrom || !this.ctrTo) {
                callBack({ error: 'from and to has to be set  ' });
                console.error('from and to has to be set ', this.ctrTo, this.ctrFrom);
                return;
            }
            var addressFrom = this.ctrFrom.getCurrentAddress();
            var addressTo = this.ctrTo.getCurrentAddress();
            var data = {
                pair: this.exchange.pair,
                returnAddress: addressFrom,
                withdrawal: addressTo,
                apiKey: ShapeShiftController.getAPIKey()
            };
            var amountToDeposit;
            console.warn('get  tDepositAddress   ');
            this.request.getShift(data).done(function (res) {
                _this.currentShift = res;
                res.miningFee = _this.exchange.minerFee;
                console.log(_this.sendTransactionsController.$amount.val());
                console.log(jaxx.FiatPriceController.instance.getActiveFiatCurrency());
                console.log(jaxx.Registry.getCurrentCryptoController().symbol);
                console.log(jaxx.FiatPriceController.fiatToCoin(_this.sendTransactionsController.$amount.val(), jaxx.FiatPriceController.instance.getActiveFiatCurrency(), jaxx.Registry.getCurrentCryptoController().symbol));
                if (_this.sendTransactionsController.cryptoToFiatButton.isFiat) {
                    amountToDeposit = Number(jaxx.FiatPriceController.fiatToCoin(_this.sendTransactionsController.$amount.val(), jaxx.FiatPriceController.instance.getActiveFiatCurrency(), jaxx.Registry.getCurrentCryptoController().symbol));
                    res.displayAmountToDeposit = String(_this.sendTransactionsController.$amount.val());
                }
                else {
                    amountToDeposit = Number(_this.sendTransactionsController.$amount.val());
                    res.displayAmountToDeposit = jaxx.Formatters.balanceForDisplay(String(amountToDeposit), 8);
                }
                console.warn('Amount to Desposit: ', amountToDeposit);
                var exchangeRate = Number($('#ShapeShift-rate').text());
                res.displayAmountToWithdraw = jaxx.Formatters.balanceForDisplay(String(amountToDeposit * exchangeRate), 8);
                res.amountToDeposit = amountToDeposit;
                console.warn('Amount to Withdraw: ', res.displayAmountToWithdraw);
                callBack(res);
                _this.emitter$.triggerHandler(_this.ON_SHIFT_CHANGED, _this.currentShift);
            }).fail(function (error) {
                callBack({ error: error });
            });
        };
        ShapeShiftController.prototype.toggle = function () {
            if (this._isActive) {
                this.deactivate();
                this.hide();
            }
            else {
                this.activate();
                this.show();
            }
        };
        ShapeShiftController.prototype.deactivate = function () {
            console.log('SS deactivating ' + this._isActive);
            if (!this._isActive) {
                return;
            }
            this._isActive = false;
            this.minerFee = undefined; // this informs that the miner fee hasn't been update yet
        };
        ShapeShiftController.prototype.activate = function () {
            if (this._isActive) {
                return;
            }
            this._isActive = true;
            console.log(' SS ACTIVATE ' + this._isActive);
            this.updateShapeShiftView();
        };
        /**
         * Updates the shapeshift view
         * @method updateShapeShiftView
         * */
        ShapeShiftController.prototype.updateShapeShiftView = function () {
            var _this = this;
            this.ctrFrom = jaxx.Registry.getCurrentCryptoController();
            if (!this.ctrFrom) {
                console.error(' no current crypto controller');
                return;
            }
            if (this.ctrFrom.symbol === 'BTC') {
                this.ctrTo = jaxx.Registry.getCryptoControllerBySymbol('ETH');
            }
            else {
                this.ctrTo = jaxx.Registry.getCryptoControllerBySymbol('BTC');
            }
            this.downloadExchange(function (exchange) {
                _this.minerFee = exchange.minerFee;
                if (_this.onExchangeDataDownloaded != null) {
                    _this.onExchangeDataDownloaded();
                }
            });
        };
        /*        updateSpendable() {
                    this.loadingSpendable();
        
                    setTimeout(() => {
                        let spendable: string;
                        let coinSymbol: string = Registry.getCurrentCryptoController().symbol;
                        let fiatCode: string = FiatPriceController.instance.getActiveFiatCurrency();
        
                        if (this.sendTransactionsController.cryptoToFiatButton.isFiat) {
                            spendable = String(FiatPriceController.coinToFiat(Formatters.balanceForDisplay(String(Number(Registry.getCurrentCryptoController().getSpendable()))), coinSymbol, fiatCode));
                        } else {
                            spendable = Formatters.balanceForDisplay(String(Number(Registry.getCurrentCryptoController().getSpendable())));
                        }
        
                        if (MATH.displayGreaterAthenB(spendable, '0')) {
                            this.sendTransactionsController.spendableView.spendable = spendable;
                        } else {
                            this.sendTransactionsController.spendableView.spendable = '0';
                        }
        
                        if (this.sendTransactionsController.cryptoToFiatButton.isFiat) {
                            this.sendTransactionsController.spendableView.$amount.text(Formatters.balanceForDisplay(this.sendTransactionsController.spendableView.spendable, 2));
                        } else {
                            this.sendTransactionsController.spendableView.$amount.text(Formatters.balanceForDisplay(this.sendTransactionsController.spendableView.spendable, 8));
                        }
        
                        this.finishLoadingSpendable();
                    }, 1000);
                }*/
        // Updates the spendable amount as soon as the exchange data is downloaded 
        // or right away if the data is readly available
        // calls onDone when the update has been made
        ShapeShiftController.prototype.setSpendableAmount = function (amount, onDone) {
            var _this = this;
            var spendableData = {
                amount: amount,
                amountSymbol: undefined,
                isFiat: this.sendTransactionsController.cryptoToFiatButton.isFiat,
                minerFee: this.minerFee,
                onDoneCallback: onDone,
                sentTxController: this.sendTransactionsController
            };
            // find out what our current coin type is
            var currentCrypto = jaxx.Registry.getCurrentCryptoController();
            if (currentCrypto) {
                spendableData.amountSymbol = currentCrypto.symbol;
            }
            else {
                onDone();
                throw new Error("Couldn't get the currently activated controller from Registry.getCurrentCryptController().");
            }
            // this means the minerFee wasn't yet downloaded from the exchange data
            if (this.minerFee === undefined) {
                // wait until the download is completed
                this.onExchangeDataDownloaded = function () {
                    spendableData.minerFee = _this.minerFee;
                    updateUI(spendableData);
                };
            }
            else {
                updateUI(spendableData);
            }
            function updateUI(data) {
                var minerFeeToBeDeducted;
                var feeDeductedAmount;
                var amountToBeShownInUI;
                if (data.isFiat) {
                    minerFeeToBeDeducted = new BigNumber(jaxx.FiatPriceController.coinToFiat(String(data.minerFee), data.amountSymbol, jaxx.FiatPriceController.instance.getActiveFiatCurrency()));
                }
                else {
                    minerFeeToBeDeducted = new BigNumber(data.minerFee);
                }
                feeDeductedAmount = new BigNumber(data.amount).subtract(minerFeeToBeDeducted).toString();
                if (jaxx.MATH.displayGreaterAthenB(amount, '0')) {
                    amountToBeShownInUI = feeDeductedAmount.toString();
                }
                else {
                    amountToBeShownInUI = '0';
                }
                data.sentTxController.spendableView.setSpendableAmount(amountToBeShownInUI, data.isFiat);
                if (data.onDoneCallback) {
                    data.onDoneCallback();
                }
            }
        };
        ShapeShiftController.prototype.loadingSpendable = function () {
            this.sendTransactionsController.spendableView.$spendableLoading.show();
            this.sendTransactionsController.spendableView.$amount.hide();
        };
        ShapeShiftController.prototype.finishLoadingSpendable = function () {
            this.sendTransactionsController.spendableView.$spendableLoading.hide();
            this.sendTransactionsController.spendableView.$amount.show();
        };
        ShapeShiftController.prototype.render = function () {
            this.$symbolFrom1.text(this.ctrFrom.threeLetterCode);
            this.$symbolTo1.text(this.ctrTo.threeLetterCode);
            this.$symbolTo2.text(this.ctrTo.threeLetterCode);
            this.$From.children('.cssCoinText').text(this.ctrFrom.displayName);
            this.$From.css({ "background-image": "url(" + this.ctrFrom.icon + ")" });
            this.$From.css({ "filter": "hue-rotate(" + this.ctrFrom.hueRotate + "deg)" });
            this.$To.children('.cssCoinText').text(this.ctrTo.displayName);
            this.$To.css({ "background-image": "url(" + this.ctrTo.icon + ")" });
            this.$To.css({ "filter": "hue-rotate(" + this.ctrTo.hueRotate + "deg)" });
            this.$depositMinCaution.removeClass('caution');
            this.$depositMin.removeClass('warningText');
            this.$depositMaxCaution.removeClass('caution');
            this.$depositMax.removeClass('warningText');
        };
        ShapeShiftController.prototype.renderData = function () {
            this.$rate.text(jaxx.Formatters.noExponentsStringFormat(this.exchange.rate)); // make sure its user readable
            this.$depositMin.text(this.exchange.minimum);
            this.$depositMax.text(this.exchange.maxLimit);
        };
        ShapeShiftController.prototype.downloadExchange = function (callBack) {
            var _this = this;
            this.render();
            if (!this.ctrFrom || !this.ctrTo) {
                console.error(' to and from has to be set');
                return;
            }
            console.log('downloadExchange  ' + this.ctrFrom.symbol + '   ' + this.ctrTo.symbol);
            var pair = this.ctrFrom.symbol.toLowerCase() + '_' + this.ctrTo.symbol.toLowerCase();
            console.log(pair);
            this.request.getPair(pair)
                .then(function (res) {
                return res;
            }).done(function (result) {
                _this.exchange = result;
                _this.pair = _this.exchange.pair;
                _this.renderData();
                _this.emitter$.triggerHandler(_this.ON_EXCHANGE_CHANGED, _this.exchange);
                if (callBack) {
                    callBack(result);
                }
            });
        };
        ShapeShiftController.prototype.isVisible = function () {
            return this.visible;
        };
        ShapeShiftController.prototype.greaterThanShapeShiftMin = function (userInput) {
            var shapeShiftMin = this.$depositMin.text();
            if (Number(userInput) > Number(shapeShiftMin)) {
                console.log('user input is greater than shapeShift min');
                return true;
            }
            else {
                console.log('user input is less than shapeShift min');
                return false;
            }
        };
        ShapeShiftController.prototype.lessThanShapeShiftMax = function (userInput) {
            var shapeShiftMax = this.$depositMax.text();
            if (Number(userInput) <= Number(shapeShiftMax)) {
                console.log('user input  is less than shapeShift max');
                return true;
            }
            else {
                console.log('user input is greater than shapeShift max');
                return false;
            }
        };
        /**
         * Renders the warning styles when below deposit min or above deposit max
         * @param userInput
         */
        ShapeShiftController.prototype.updateMinMaxWarnings = function (userInput) {
            // Reset all warning text/caution classes from the min/max divs
            this.$depositMinCaution.removeClass('caution');
            this.$depositMin.removeClass('warningText');
            this.$depositMaxCaution.removeClass('caution');
            this.$depositMax.removeClass('warningText');
            // If the input is too small show the warnings on the min divs
            if (!this.greaterThanShapeShiftMin(userInput)) {
                this.$depositMinCaution.addClass('caution');
                this.$depositMin.addClass('warningText');
            }
            // If the input is too large show the warnings on the max divs
            if (!this.lessThanShapeShiftMax(userInput)) {
                this.$depositMaxCaution.addClass('caution');
                this.$depositMax.addClass('warningText');
            }
        };
        ShapeShiftController.prototype.meetsShapeShiftMinMax = function (userInput) {
            // If user's input is greater than min and less than max: return true, otherwise return false
            return (this.greaterThanShapeShiftMin(userInput) && this.lessThanShapeShiftMax(userInput));
        };
        /**
         * Renders the shape shift list
         * @method renderLists
         * */
        ShapeShiftController.prototype.renderLists = function () {
            var symbolFrom = this.ctrFrom.symbol;
            var symbolTo = jaxx.Registry.getCurrentCryptoController().symbol;
            var coins = jaxx.Registry.getAllCryptoControllers();
            var enabledCoins = jaxx.Registry.getWalletsEnabledSorted();
            var htmlTo = '';
            var htmlFrom = '';
            var requiredCoinsList = [];
            var coinListFrom = [];
            coins = coins.filter(function (item) {
                if (item.shapeshift) {
                    requiredCoinsList.push(item.symbol);
                }
                return item.shapeshift;
            });
            enabledCoins = enabledCoins.filter(function (item) {
                if (item.shapeshift) {
                    coinListFrom.push(item.symbol);
                }
                return item.shapeshift;
            });
            this.renderList(requiredCoinsList, coins, symbolFrom, htmlTo, this.$listTo);
            this.renderList(coinListFrom, enabledCoins, symbolTo, htmlFrom, this.$listFrom);
        };
        /**
         * Populates the ShapeShift to list of available coins and token that you can shift to.
         * @method renderList
         * @param {Array} requiredCoinsList
         * @param {ICoinController[]} coins
         * @param {String} symbolFrom
         * @param {String} html
         * @param {JQuery} $list
         * */
        ShapeShiftController.prototype.renderList = function (requiredCoinsList, coins, symbolFrom, html, $list) {
            var _this = this;
            DCShapeShift.availableCoins({ isAvailable: true, requiredCoins: requiredCoinsList, symbolsOnly: true }, function (coinList) {
                html = _this.generateShapeShiftList(coins, symbolFrom, coinList, html);
                $list.html(html);
                if ($list.html().length <= 0) {
                    _this.$buttonShowListImageFrom.css('opacity', '0.5');
                    _this.isFromListEmpty = true;
                }
                else {
                    _this.$buttonShowListImageFrom.css('opacity', '1');
                    _this.isFromListEmpty = false;
                }
            }, function (err) {
                console.error(err);
            });
        };
        /**
         * Generates ShapeShift list
         * @method generateShapeShiftList
         * @param {ICoinController[]} coins
         * @param {String} symbol
         * @param {} coinList
         * @param {String} html
         * @return {String} A DOM element in string format
         * */
        ShapeShiftController.prototype.generateShapeShiftList = function (coins, symbol, coinList, html) {
            coins.forEach(function (coin) {
                var hueRotation = coin.hueRotate;
                if (coin.symbol !== symbol) {
                    //added a check to see if crypto is available on shapeshift and if it is currenlty available
                    var shapeshiftCoin = coinList.getCoinWithSymbol(coin.symbol);
                    var isAvailable = false;
                    if (shapeshiftCoin) {
                        if (shapeshiftCoin.isAvailable()) {
                            isAvailable = true;
                        }
                    }
                    if (isAvailable) {
                        html += '<tr data-symbol="'
                            + coin.symbol
                            + '" data-available="'
                            + '" class="shapeShiftCoinItem cssShapeShiftCoinListItem coinType'
                            + coin.coinType
                            + '" value="'
                            + coin.coinType
                            + '"><td class="icon cssHighlighted'
                            + '" style="background-image: url('
                            + coin.icon
                            + '); filter: hue-rotate(' + hueRotation + 'deg)"></td><td class="label">'
                            + coin.threeLetterCode
                            + ' - '
                            + coin.displayName
                            + '</td></tr>';
                        //checks to see if the crypto is available on shapeshift but is not currently available
                    }
                    else if (!isAvailable && shapeshiftCoin) {
                        html += '<tr data-symbol="XXX"'
                            + '" data-available="'
                            + '" class="cssShapeShiftCoinListItem coinType'
                            + coin.coinType
                            + '" value="'
                            + coin.coinType
                            + '"><td class="icon cssHighlighted'
                            + '" style="background-image: url('
                            + coin.icon
                            + '); filter: hue-rotate(' + hueRotation + 'deg); opacity:0.4"></td><td class="label" style="color:#959595">'
                            + coin.threeLetterCode
                            + ' - '
                            + 'Unavailable'
                            + '</td></tr>';
                    }
                }
            });
            return html;
        };
        ShapeShiftController.prototype.hide = function () {
            if (this.visible) {
                this.$view.slideUp();
            }
            this.visible = false;
            this.showAvailable();
        };
        ShapeShiftController.prototype.showAvailable = function () {
            this.sendTransactionsController.$view.find('.available').show();
            this.sendTransactionsController.$view.find('.notAvailable').hide();
        };
        ShapeShiftController.prototype.hideSendTransaction = function () {
            this.sendTransactionsController.$view.find('.available').hide();
        };
        ShapeShiftController.prototype.shapeShiftIsAvailable = function (cb) {
            var _this = this;
            this.hideSendTransaction();
            DCShapeShift.availableCoins({
                isAvailable: true,
                requiredCoins: [jaxx.Registry.getCurrentCryptoController().symbol],
                symbolsOnly: true
            }, function (coinList) {
                var coin = coinList.getCoinWithSymbol(jaxx.Registry.getCurrentCryptoController().symbol);
                if (coin) {
                    if (coin._status === "unavailable") {
                        return _this.notAvailable();
                    }
                    _this.showAvailable();
                    cb();
                }
                else {
                    _this.notAvailable();
                }
            }, function (err) {
                console.error(err);
            });
        };
        /*
        * Displays a modal stating that shapeshift is not available.
        * @method notAvailable*/
        ShapeShiftController.prototype.notAvailable = function () {
            var _this = this;
            this.sendTransactionsController.resetAll();
            return this.shapeShiftNotAvailable.show(function () {
                _this.showAvailable();
            });
        };
        ShapeShiftController.prototype.show = function () {
            if (!this.visible) {
                var coinFrom = jaxx.Registry.getCurrentCryptoController();
                var coins = jaxx.Registry.getShapeShiftEnabled();
                var coinTo = (coins[0].symbol !== coinFrom.symbol) ? coins[0] : coins[1];
                jaxx.Registry.shapeShiftTo = coinTo;
                this.$view.slideDown();
                if (!this.isListRendered) {
                    this.renderLists();
                }
            }
            this.visible = true;
            return this;
        };
        /**
         * Renders shapeShift view
         * @method renderShapeShiftView
         * */
        ShapeShiftController.prototype.renderShapeShiftView = function () {
            this.updateShapeShiftView();
            var coinFrom = jaxx.Registry.getCurrentCryptoController();
            var coins = jaxx.Registry.getShapeShiftEnabled();
            var coinTo = (coins[0].symbol !== coinFrom.symbol) ? coins[0] : coins[1];
            jaxx.Registry.shapeShiftTo = coinTo;
        };
        ShapeShiftController.prototype.isActive = function () {
            return this._isActive;
        };
        /**
         * Updates the shapeshift view to a loading state
         * @method transitionState
         * @param {String} symbol
         * */
        ShapeShiftController.prototype.transitionState = function (symbol) {
            if (!symbol || symbol == "XXX") {
                throw new Error("ShapeShift Error: Cannot find symbol or temporarily unavailable.");
            }
            jaxx.Registry.setCurrentControllerBySymbol(symbol);
            this.exchange.minimum = null;
            this.exchange.maxLimit = null;
            this.exchange.rate = null;
            this.exchange = null;
            this.pair = null;
            this.$depositMin.text('- - -');
            this.$depositMax.text('- - -');
            this.$rate.text('- - -');
        };
        return ShapeShiftController;
    }());
    jaxx.ShapeShiftController = ShapeShiftController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=shape-shift-controller.js.map