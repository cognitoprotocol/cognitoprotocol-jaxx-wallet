// global instance handle for in-console testing
var global_send_controller;
var jaxx;
(function (jaxx) {
    var SendTransactionsController = (function () {
        function SendTransactionsController() {
            var _this = this;
            global_send_controller = this;
            SendTransactionsController.instance = this;
            this.receiveTransactionsView = new jaxx.ReceiveTransactionView(this);
            this.$view = $('#SendTransactionView');
            this.$view.load('js/app/send-transaction/send-transaction.html', null, function (res) {
                setTimeout(function () { return _this.init(); }, 1000);
            });
            this.confirmScreen = new jaxx.SendConfirmationView(this);
            this.confirmScreen.emitter$.on(this.confirmScreen.ON_CANCEL, function (evt) {
            });
            this.fiatController = jaxx.FiatPriceController.instance;
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END, function () {
                _this.setUseFiat(_this.cryptoToFiatButton.isFiat);
                _this.spendableView.update(0);
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE, function () {
                // When a new "From" coin is selected in the ShapeShift menu, we need to temporarily set all the
                // values in the menu window to placeholders while the new wallet is initializing to communicate
                // to the user that a switch is happening and to hide old wallet values
                _this.spendableView.spendable = '0';
                _this.spendableView.$amount.text('- - -');
                _this.spendableView.$spendableCryptoSymbol.text(jaxx.Registry.getCurrentCryptoController().symbol);
            });
        }
        SendTransactionsController.prototype.init = function () {
            var _this = this;
            setTimeout(function () { return _this.resetAll(); }, 100);
            this.$sendAddressView = $('#SendAddressView');
            this.$receiveTabBtn = $('#ReceiveTabBtn');
            this.$sendTabBtn = $('#SendTabBtn');
            this.$shapeShiftFoxBtn = $('#ShapeSiftFoxBtn');
            this.$inputCustomGasLimit = $('.inputCustomGasLimit');
            this.$inputCustomData = $('#inputCustomData');
            this.$keyBoardSectionHideMe = $('#keyBoardSectionHideMe');
            this.$advanceSendArrow = $('#advanceSendArrow');
            this.$advancedTabButton = $('#advancedTabButton');
            this.$receiveTabLabel = $('#receiveTabLabel');
            this.$exchangeTabLabel = $('#exchangeTabLabel');
            this.$sendTabLabel = $('#sendTabLabel');
            this.$receiveTabImage = $('#receiveTabImage');
            this.$exchangeTabImage = $('#exchangeTabImage');
            this.$sendTabImage = $('#sendTabImage');
            this.$qrCodeButton = this.$sendAddressView.children('.imageQR');
            this.$receiveTabBtn.on('click', function () {
                _this.setState('receive');
            });
            this.$sendTabBtn.on('click', function () {
                _this.setState('send');
            });
            this.$gasForSpendableWarning = $('#GasForSpendableWarning');
            this.$receiverAddress = $('#receiver_address');
            // save initial CSS width of the receiving address
            // it will be used to restore the receiving address box to its designed state when QR code should be visible
            var currentCssWidth = this.$receiverAddress.css('width');
            this.$receiverAddress.data('jaxx-css-initial-width', currentCssWidth);
            this.$sendLabel = $('#sendLabel');
            this.shapeShift = new jaxx.ShapeShiftController(this);
            this.spendableView = new jaxx.SpendableView();
            this.$maxBtn = $('#MaxButton');
            this.$mainInputField = $('#amountInput');
            this.$amount = $('#amountSendInput');
            this.$fiatAmount = $('#fiatSendValue');
            this.$sendToAddress = $('#receiver_address');
            this.$helpSpendable = $('#SpendableHelp');
            this.sendButton = new jaxx.SendButtonComponent(this);
            this.$sendButtonLabel = this.sendButton.$view.find('#sendLabel');
            this.$receiveButtonLabel = this.sendButton.$view.find('#receiveLabel');
            this.$sendButtonAnimation = this.sendButton.$view.find('.shiftingProgress.cssShiftingProgress');
            this.validToSend = false;
            this.advanceGas = new jaxx.AdvanceGasController();
            this.advanceGas.setUpdateCallback(function () {
                setTimeout(function () {
                    _this.evaluateSendButton();
                }, 100);
            });
            this.confirmScreen.onCancel = function () {
                if (_this.shapeShift.currentShift) {
                    _this.shapeShift.currentShift = null;
                }
                _this.confirmScreen.hide();
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CANCEL_TRANSACTION);
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION_CLOSED);
                _this.setState('send');
                _this.$amount.val(_this.previousValuesSend);
                _this.$receiverAddress.val(_this.previousAddress);
                _this.addressToSend = String(_this.$sendToAddress.val());
                var ctr = jaxx.Registry.getCurrentCryptoController();
                _this.addressIsValid = ctr.validateAddress(_this.addressToSend);
                _this.amountDidChangeListener();
            };
            jaxx.Registry.application$.on(jaxx.Registry.UI_CANCEL_TRANSACTION, function (evt, type) {
                if (type === 'shapeShift') {
                    _this.setState('restore');
                    _this.activateShapeshift(function () {
                        _this.activateSend();
                        _this.$shapeShiftFoxBtn.addClass("tabHighlighted");
                        _this.$exchangeTabLabel.addClass('whiteText');
                        _this.$exchangeTabImage.addClass('whiteSVG');
                        _this.$sendLabel.text('EXCHANGE');
                        _this.$view.addClass("tabHighlighted");
                        _this.show();
                        _this.$sendAddressView.hide();
                        _this.$maxBtn.hide();
                        _this.$advancedTabButton.hide();
                        _this.$amount.val(_this.previousValuesSend);
                        _this.shapeShift.setLastToSelected();
                        _this.amountDidChangeListener();
                    });
                }
            });
            this.shapeShift.clickShapeShiftInfoToggle = function () {
                Navigation.openModal('shapeShiftInfo');
            };
            this.shapeShift.clickShapeShiftClose = function () {
                Navigation.closeModal();
            };
            /*this.spendableView.update = (delta: number) => {
                let ctr = jaxx.Registry.getCurrentCryptoController();

                if (ctr) {
                    if (!this.cryptoToFiatButton.isFiat) {
                        let spendable: string = ctr.getSpendable();

                        if (isNaN(+spendable)) {
                            console.log('Should be a number!');
                            spendable = '0';
                        }

                        console.log(' spendable   ' + spendable + ' delta   ' + delta);
                        MATH.subtract(spendable, String(delta));

                        if (Number(spendable) < 0) {
                            this.spendableView.spendable = '0';
                        } else {
                            this.spendableView.spendable = spendable;
                        }
                    }

                    if (this.cryptoToFiatButton.isFiat) {
                        if (this.shapeShift.isVisible()) {
                            this.shapeShift.updateSpendable();
                        } else {
                            let spendable = Registry.getCurrentCryptoController().getSpendable();
                            let coinSymbol = Registry.getCurrentCryptoController().symbol;
                            let fiatCode = FiatPriceController.instance.getActiveFiatCurrency();
                            this.spendableView.spendable = FiatPriceController.coinToFiat(spendable, coinSymbol, fiatCode);
                            this.spendableView.$amount.text(Formatters.balanceForDisplay(this.spendableView.spendable, 2));
                        }
                    } else {
                        if (this.shapeShift.isVisible()) {
                            this.shapeShift.updateSpendable();
                        } else {
                            this.spendableView.spendable = Registry.getCurrentCryptoController().getSpendable();
                            this.spendableView.$amount.text(Formatters.balanceForDisplay(this.spendableView.spendable, 8));
                        }
                    }

                } else {
                    console.error(' no current controller ')
                }

                // if our data layer hasn't cached UTXOs already
                // let's keep refreshing every 1 sec
                //if (localStorage.getItem(ctr.name + '-UTXOs') == null)
                //{
                //    setTimeout(this.spendableView.update, 1000, 0);
                //}
            };*/
            // bind these two to avoid any misreference caused by a context issue
            var boundSpendableView = this.spendableView;
            var boundSendTXCtrl = this;
            this.spendableView.update = function () {
                var currentCoinController = jaxx.Registry.getCurrentCryptoController();
                var showLoadingUICanceled = false;
                // Set a 150 nsec timer on showing the UI loading component.
                // Instead of showing it directly, arange this timer and then if the results in getSpendableBalance method below come up faster than
                // these 150 msecs we cancel it there, thus avoiding a DOM update if no loading indicator is necessary
                var timerUntilLoadingIsShown = null;
                timerUntilLoadingIsShown = setTimeout(function () {
                    if (timerUntilLoadingIsShown === null)
                        boundSpendableView.showLoadingIndicator();
                }, 150);
                currentCoinController.getSpendableBalance(function (amount) {
                    if (amount !== null) {
                        var finalAmountToBeDisplayedInUI = void 0;
                        if (boundSendTXCtrl.cryptoToFiatButton.isFiat) {
                            finalAmountToBeDisplayedInUI = jaxx.FiatPriceController.coinToFiat(amount, currentCoinController.symbol, jaxx.FiatPriceController.instance.getActiveFiatCurrency());
                        }
                        else {
                            finalAmountToBeDisplayedInUI = amount;
                        }
                        if (boundSendTXCtrl.shapeShift.isVisible()) {
                            boundSendTXCtrl.shapeShift.setSpendableAmount(finalAmountToBeDisplayedInUI, function () { updateDone(); });
                        }
                        else {
                            boundSendTXCtrl.spendableView.setSpendableAmount(finalAmountToBeDisplayedInUI, boundSendTXCtrl.cryptoToFiatButton.isFiat);
                            updateDone();
                        }
                    }
                    else {
                        updateDone();
                    }
                    function updateDone() {
                        clearTimeout(timerUntilLoadingIsShown);
                        timerUntilLoadingIsShown = null;
                        boundSpendableView.hideLoadingIndicator();
                    }
                });
            };
            this.cryptoToFiatButton = new jaxx.CryptoToFiatButtonComponent();
            this.cryptoToFiatButton.onClick = function () {
                _this.toggleCryptoToFiatButton();
            };
            this.confirmScreen.onConfirm = function () {
                _this.confirmScreen.hide();
                // A wrapper function that wrap the complete send transaction logic
                var completedSendTransaction = function () {
                    jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION);
                    var ctr = jaxx.Registry.getCurrentCryptoController();
                    // Perform send transaction
                    ctr.sendTransaction(_this.transaction).done(function (result) {
                        if (result.success === 'success') {
                            Navigation.flashBanner('Transaction sent', 2, 'success');
                            jaxx.Registry.application$.trigger(jaxx.Registry.ON_SEND_TRANSACTION, _this.transaction); // notify UI that a transaction was successfully sent
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
                } // If no pin setup then proceed to complete transaction
                else {
                    completedSendTransaction();
                }
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION_CLOSED);
            };
            this.sendButton.onClick = function () {
                _this.evaluateSendButton();
                if (!_this.validToSend)
                    return;
                if (_this.shapeShift.isActive()) {
                    // Enable the Send button and remove any loading icon
                    _this.exhaustSendButton();
                    _this.shapeShift.shift(_this.amountToSend, function (response) {
                        if (response.error) {
                            console.error('Shapefshift Response', response);
                            _this.readySendButton();
                            Navigation.flashBanner('Unable to Shift. Please try again later.', 4, 'error');
                            return;
                        }
                        var addressDeposit = response.deposit;
                        if (!jaxx.Registry.getCurrentCryptoController().validateAddress(addressDeposit) && !isNaN(Number(_this.amountToSend))) {
                            console.error('Not valid data', response);
                            jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CANCEL_TRANSACTION);
                            Navigation.flashBanner('ShapeShift Failed', 2);
                            return;
                        }
                        jaxx.Registry.getCurrentCryptoController().buildTransaction(String(response.amountToDeposit), addressDeposit, _this.isMax()).done(function (transaction) {
                            console.log(transaction);
                            _this.transaction = transaction;
                            // Show confirmation screen
                            jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION);
                            // Show loading icon and disable the button
                            _this.readySendButton();
                            var currentCrypto = jaxx.Registry.getCurrentCryptoController();
                            var coinBalanceToDisplay = '';
                            if (currentCrypto) {
                                coinBalanceToDisplay = currentCrypto.getBalanceDisplay(transaction.amountInt);
                            }
                            _this.hide();
                            _this.setState('restore', function () {
                                // Callback delay is needed to avoid UI glitches when measuring element sizes
                                _this.shapeShift.confirmScreen.showShapeShiftConfirmation(response, _this.cryptoToFiatButton.isFiat, coinBalanceToDisplay);
                            });
                        }).fail(function (error) {
                            jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CANCEL_TRANSACTION);
                            Navigation.flashBanner('ShapeShift Failed', 2);
                            _this.readySendButton();
                        });
                    });
                }
                else if (_this.currentState === 'receive') {
                    _this.generateReceiveToken();
                }
                else {
                    _this.readySendButton();
                    var customData = _this.advanceGas.getCustomData();
                    var customGasLimit = _this.advanceGas.getCustomGasLimit();
                    _this.sendTransaction(_this.amountToSend, _this.addressToSend, _this.isMax(), customGasLimit, customData);
                }
            };
            this.$sendToAddress.on('change paste keyup', function () {
                _this.addressToSend = String(_this.$sendToAddress.val());
                _this.previousAddress = _this.addressToSend;
                var ctr = jaxx.Registry.getCurrentCryptoController();
                _this.addressIsValid = ctr.validateAddress(_this.addressToSend);
                _this.evaluateSendButton();
            });
            this.$sendToAddress.on('blur', function () {
                if (!_this.addressIsValid && String(_this.$sendToAddress.val()).trim().length)
                    Navigation.flashBanner('Receiving Address is Invalid', 3, 'error');
            });
            this.$amount.on('input', function () {
                _this.amountDidChangeListener();
            });
            this.$amount.on('focus', function () {
                // When amount field is in focus, remove the placeholder text
                _this.$amount.attr("placeholder", "");
            });
            this.$amount.on('blur', function () {
                // When amount field is not in focus, add the placeholder text
                _this.$amount.attr("placeholder", "Enter Amount");
            });
            this.$receiverAddress.on('focus', function () {
                // When receive field is in focus, remove the placeholder text
                _this.$receiverAddress.attr("placeholder", "");
            });
            this.$receiverAddress.on('blur', function () {
                // When receive field is not in focus, add the placeholder text
                _this.$receiverAddress.attr("placeholder", "Enter Receiving Address");
            });
            this.$maxBtn.on('click', function () {
                _this.updateFieldWithBalance(_this.$amount, _this.spendableView.getSpendable());
                _this.amountDidChangeListener();
                // When max is input into the amount field, remove the placeholder text
                _this.$amount.attr("placeholder", "");
            });
            jaxx.Registry.application$.on(jaxx.Registry.UI_SHOW_TAB, function (evt, tabname) {
                if (tabname === 'send') {
                    _this.start();
                }
            });
            /**
             * When the user changes their main currency from the quick fiat currency selector (the round arrow next to the main fiat balance)
             * Look if the user also inserted some value in the send coin input and update the calculation there too.
             */
            jaxx.Registry.application$.on(jaxx.Registry.ON_FIAT_MAIN_CURRENCY_CHANGE, function () {
                var text_in_send_amount = String(_this.$amount.val());
                if (text_in_send_amount.length > 0 && _this.cryptoToFiatButton.isFiat === false) {
                    var currentCrypto = jaxx.Registry.getCurrentCryptoController();
                    if (currentCrypto && currentCrypto['symbol']) {
                        var convertedFiatAmount_1 = '';
                        var coinSymbol = currentCrypto.symbol;
                        convertedFiatAmount_1 = _this.coinToActiveFiatDisplay(text_in_send_amount, coinSymbol);
                        // The code below calculates the text width's of the main amount and the fiat amount
                        // it then makes sure that the two do not overlap.
                        // We're using a setTimeout so we don't block the UI thread when the user types their amount
                        setTimeout(function () {
                            var widthFittingFiatAmount = _this.resizeFiatAmountTextToMakeItFit(convertedFiatAmount_1);
                            _this.$fiatAmount.text(widthFittingFiatAmount);
                        }, 50);
                    }
                }
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function () {
                if (jaxx.Registry.getCurrentCryptoController().shapeshift) {
                    _this.showShapeShift();
                }
                else {
                    _this.hideShapeShift();
                }
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_FIAT_MAIN_CURRENCY_CHANGE, function () {
                if (_this.cryptoToFiatButton.isFiat) {
                    var code = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
                    var symbol = jaxx.FiatPriceController.prependFiatSymbolToString(code, '');
                    $('#fiatToCrypto > .symbol').text(symbol);
                    _this.updateOnTheFlyCoinAmountInsideAmountBox();
                }
            });
            jaxx.Registry.walletValue$.on(jaxx.Registry.ON_WALLET_VALUE_CHANGE, function () {
                if (_this.cryptoToFiatButton.isFiat) {
                    _this.showFiatSpendable();
                }
                else {
                    _this.showCryptoSpendable();
                }
                _this.spendableView.update(0);
            });
            this.$inputCustomGasLimit.on("focus", function () {
                if (jaxx.Registry.iPhone || jaxx.Registry.android) {
                    _this.$keyBoardSectionHideMe.hide();
                    _this.$advanceSendArrow.css("opacity", 1);
                }
            });
            this.$inputCustomGasLimit.on("blur", function () {
                if (jaxx.Registry.iPhone || jaxx.Registry.android) {
                    _this.$keyBoardSectionHideMe.show();
                    _this.$advanceSendArrow.css("opacity", 0);
                }
            });
            this.$inputCustomData.on("focus", function () {
                if (jaxx.Registry.iPhone || jaxx.Registry.android) {
                    _this.$keyBoardSectionHideMe.hide();
                    _this.$advanceSendArrow.css("opacity", 1);
                }
            });
            this.$inputCustomData.on("blur", function () {
                if (jaxx.Registry.iPhone || jaxx.Registry.android) {
                    _this.$keyBoardSectionHideMe.show();
                    _this.$advanceSendArrow.css("opacity", 0);
                }
            });
            this.attachClickEvents();
            this.$shapeShiftFoxBtn.on('click', function () {
                _this.setState('ShapeShift');
            });
        };
        SendTransactionsController.prototype.isMax = function () {
            /// check if value in fields  match  spendable
            var spendable = String($('#SpendableAmount').text());
            var input = String($('#amountSendInput').val());
            var ar = input.split('.');
            if (ar.length === 2)
                ar[1] = ar[1].substr(0, 8);
            input = ar.join('.');
            return spendable === input;
            /*
                        if (this.amountToSend === spendable) {
                            isMaxValue = true;
                        }
            
                        return isMaxValue;
                        */
        };
        SendTransactionsController.prototype.readySendButton = function () {
            this.sendButton.$view.find('#sendLabel').show();
            this.sendButton.$view.find('.shiftingProgress').hide();
        };
        SendTransactionsController.prototype.exhaustSendButton = function () {
            this.sendButton.$view.find('#sendLabel').hide();
            this.sendButton.$view.find('.shiftingProgress').show();
        };
        SendTransactionsController.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        SendTransactionsController.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        SendTransactionsController.prototype.showShapeShift = function () {
            this.$shapeShiftFoxBtn.show();
            this.$sendTabBtn.width('29.5%');
            this.$receiveTabBtn.width('29.5%');
        };
        SendTransactionsController.prototype.hideShapeShift = function () {
            this.$shapeShiftFoxBtn.hide();
            this.$sendTabBtn.width('49.5%');
            this.$receiveTabBtn.width('49.5%');
        };
        SendTransactionsController.prototype.toggleCryptoToFiatButton = function () {
            if (this.cryptoToFiatButton.isFiat) {
                this.showCryptoButton();
            }
            else {
                this.showFiatButton();
            }
            this.$fiatAmount.text('');
            console.log('is this fiat? ' + this.cryptoToFiatButton.isFiat);
        };
        SendTransactionsController.prototype.showFiatButton = function () {
            this.showFiatSpendable();
            this.cryptoToFiatButton.isFiat = true;
            this.setUseFiat(this.cryptoToFiatButton.isFiat);
            this.spendableView.update(0);
        };
        SendTransactionsController.prototype.showFiatSpendable = function () {
            var currentCryptoController = jaxx.Registry.getCurrentCryptoController();
            var coinValue = currentCryptoController.getSpendable();
            if (Number(coinValue) < 0) {
                console.error(jaxx.Registry.getCurrentCryptoController().symbol + " getSpendable is returning a negative value when it should be zero");
                coinValue = '0';
            }
            if (isNaN(+coinValue)) {
                console.log("It should be a number!");
                coinValue = '0';
            }
            var coinSymbol = currentCryptoController.symbol;
            var fiatCode = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
            var fiatAmount = jaxx.FiatPriceController.coinToFiat(coinValue, coinSymbol, fiatCode);
            this.spendableView.spendable = fiatAmount;
            this.spendableView.$spendableFiatSymbol.text(jaxx.FiatPriceController.getFiatUnitPrefix(fiatCode));
            this.spendableView.$spendableCryptoSymbol.text('');
            console.log(jaxx.FiatPriceController.makeDisplayFiat(fiatAmount, fiatCode));
        };
        SendTransactionsController.prototype.showCryptoButton = function () {
            this.showCryptoSpendable();
            this.cryptoToFiatButton.isFiat = false;
            this.setUseFiat(this.cryptoToFiatButton.isFiat);
            this.spendableView.update(0);
        };
        SendTransactionsController.prototype.showCryptoSpendable = function () {
            var currentCryptoController = jaxx.Registry.getCurrentCryptoController();
            var spendable = currentCryptoController.getSpendable();
            if (Number(spendable) < 0) {
                console.error(jaxx.Registry.getCurrentCryptoController().symbol + " getSpendable is returning a negative value when it should be zero");
                spendable = '0';
            }
            if (isNaN(+spendable)) {
                console.log("It should be number!");
                spendable = '0';
            }
            this.spendableView.spendable = spendable;
            this.spendableView.$spendableCryptoSymbol.text(currentCryptoController.threeLetterCode);
            this.spendableView.$spendableFiatSymbol.text('');
        };
        SendTransactionsController.prototype.setUseFiat = function (isFiat) {
            this.$amount.val('');
            if (isFiat) {
                this.cryptoToFiatButton.$view.data('fiat', isFiat);
            }
            if (isFiat) {
                this.cryptoToFiatButton.$symbol.text(jaxx.FiatPriceController.getFiatUnitPrefix());
            }
            else {
                // Set the symbol
                var coinSymbol = jaxx.Registry.getCurrentCryptoController().threeLetterCode; // HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).uiComponents['coinSymbol'];
                this.cryptoToFiatButton.$symbol.text(coinSymbol);
            }
        };
        ;
        SendTransactionsController.prototype.generateReceiveToken = function () {
            console.log('MINING FEES | specialAction :: ');
            this.walletSendReceive();
        };
        SendTransactionsController.prototype.walletSendReceive = function () {
            var coinAbbreviatedNameCur = jaxx.Registry.getCurrentCryptoController().symbol;
            var qrCodeImage;
            qrCodeImage = jaxx.Utils.generateQRCode(this.amountToSend, true);
            if (qrCodeImage != null) {
                if (Navigation.isUseFiat()) {
                    $('.modal.receive .amountAbbreviatedName').text(wallet.getHelper().getFiatUnit());
                }
                else {
                    $('.modal.receive .amountAbbreviatedName').text(coinAbbreviatedNameCur);
                }
                $('.modal.receive .amount').text(jaxx.Formatters.balanceForDisplay(this.amountToSend));
                $(".modal.receive .qrCode img").attr("src", qrCodeImage);
                Navigation.openModal('receive');
            }
            else {
                console.log("!! error :: could not create qr code for :: " + coinAbbreviatedNameCur + " !!");
            }
        };
        SendTransactionsController.prototype.enableAdvanceGasIfRequired = function () {
            if (this.isAdvancedOptionsAvaialble()) {
                var ctr = jaxx.Registry.getCurrentCryptoController();
                this.advanceGas.setActive(true, ctr.advancedMiningOption.options);
            }
            else {
                this.advanceGas.setActive(false);
            }
        };
        SendTransactionsController.prototype.evaluateSendButton = function () {
            this.validToSend = false;
            if (this.addressIsValid && this.amountIsValid) {
                var customDataValid = false;
                if (this.isAdvancedOptionsAvaialble() && this.advanceGas.isOptionsActive()) {
                    if (this.advanceGas.isCustomDataValid()) {
                        customDataValid = true;
                    }
                }
                else {
                    customDataValid = true;
                }
                if (customDataValid) {
                    this.validToSend = true;
                    this.sendButton.update('active');
                }
            }
            if (!this.validToSend && this.sendButton) {
                this.sendButton.update('disabled');
            }
        };
        SendTransactionsController.prototype.isAdvancedOptionsAvaialble = function () {
            var ctr = jaxx.Registry.getCurrentCryptoController();
            if (ctr.advancedMiningOption && (ctr.advancedMiningOption.type === "AdvanceGasController")) {
                return true;
            }
            return false;
        };
        SendTransactionsController.prototype.sendTransaction = function (amountToSend, addressTo, isMax, customGasLimit, customData) {
            var _this = this;
            if (this.cryptoToFiatButton.isFiat) {
                amountToSend = String(jaxx.FiatPriceController.fiatToCoin(amountToSend, jaxx.FiatPriceController.instance.getActiveFiatCurrency(), jaxx.Registry.getCurrentCryptoController().symbol));
            }
            var ctr = jaxx.Registry.getCurrentCryptoController();
            if (!ctr) {
                console.error(' no current controller ');
            }
            console.log(amountToSend);
            ctr.buildTransaction(amountToSend, addressTo, isMax, customGasLimit, customData)
                .done(function (transaction) {
                //ask user to confirm
                if (transaction) {
                    _this.transaction = transaction;
                    if (_this.cryptoToFiatButton.isFiat) {
                        console.log("Amount " + _this.$amount.val());
                        transaction.displayAmount = jaxx.Formatters.balanceForDisplay(String(_this.$amount.val()), 2);
                        console.log(transaction);
                        transaction.fiatSymbol = jaxx.FiatPriceController.getFiatUnitPrefix(jaxx.FiatPriceController.instance.getActiveFiatCurrency());
                    }
                    _this.setState('restore');
                    setTimeout(function () {
                        // This delay was added to avoid any rendering glitches when a keyboard is up on mobile
                        _this.confirmScreen.showConfirmation(transaction);
                    }, 500);
                }
            })
                .fail(function (response) {
                _this.readySendButton();
                Navigation.flashBanner("Failed to build transaction.", 3, 'error');
                console.error(response);
            });
            this.isInit = true;
        };
        /** Converts the given coin to ready for display fiat currency according to the user's current active fiat code. */
        SendTransactionsController.prototype.coinToActiveFiatDisplay = function (coinAmount, coinSymbol) {
            var retVal = '';
            if (coinAmount != "") {
                var dotPosition = coinAmount.lastIndexOf('.');
                if (dotPosition > 21 || (dotPosition == -1 && coinAmount.length > 20)) {
                    coinAmount = coinAmount.substr(0, 20);
                }
                // currently the fiat convertor is using numbers to do math
                // until we conver it to using strings for big numbers support we will aproximate down to 6 decimals
                var activeFiatCurrencyCode = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
                var onTheFlyFiatConvertedAmount = jaxx.FiatPriceController.coinToFiat(coinAmount, coinSymbol, activeFiatCurrencyCode);
                // we can get a null here if the user started Jaxx first time and they don't have a local cache and the fiat pricing hasn't loaded yet
                if (onTheFlyFiatConvertedAmount != null) {
                    var formattedNumber = jaxx.Formatters.balanceForDisplay(onTheFlyFiatConvertedAmount, 2); // this one makes sure we have anly two decimals 
                    formattedNumber = jaxx.Formatters.formatFinancialNumber(formattedNumber); // this one puts the commas every 3 digits
                    var displayFiat = jaxx.FiatPriceController.prependFiatSymbolToString(activeFiatCurrencyCode, formattedNumber); // this one adds the currency prefix for ex US$
                    retVal = displayFiat;
                }
            }
            return retVal;
        };
        /** Measures the text in the send amount box to find out how much space is left for the fiat to display
         * so they don't overlap. Then it shortens the fiat amount text to fit in and leaves a spacing in between the two
         * amounts as set in fiatTextSpacingInPixels.
         *
         * @param fiatAmountString {string} - The raw converted fiat amount
         * @return {string} - The fiat amount string guaranteed to fit in the UI
         */
        SendTransactionsController.prototype.resizeFiatAmountTextToMakeItFit = function (fiatAmountString) {
            var fiatTextSpacingInPixels = 25; // this is the space left between the coin amount and fiat amount in the send transaction amount box
            var amountLeftPaddingInPixels = Number(this.$amount.css('padding-left').replace('px', ''));
            var fiatAmountRightPaddingInPixels = Number(this.$fiatAmount.css('right').replace('px', ''));
            var resultingFiatString = fiatAmountString;
            var fontFamily = this.$amount.css('font-family');
            var fontSize = this.$amount.css('font-size');
            var amountTextContent = String(this.$amount.val());
            var amountTextWidth = this.measureTextWidth(amountTextContent, fontFamily, fontSize);
            var amountInputElementWidth = this.$amount.outerWidth(true);
            var fiatAmountWidthAvailableInPixels = (amountInputElementWidth - (fiatTextSpacingInPixels + amountTextWidth + amountLeftPaddingInPixels)) - fiatAmountRightPaddingInPixels;
            var fiatAmountText = fiatAmountString;
            if (fiatAmountText.length != 0) {
                var fiatAmountFontFamily = this.$fiatAmount.css('font-family');
                var fiatAmountFontSize = this.$fiatAmount.css('font-size');
                var fiatAmountTextWidthInPixels = this.measureTextWidth(fiatAmountText, fiatAmountFontFamily, fiatAmountFontSize);
                if (fiatAmountTextWidthInPixels > fiatAmountWidthAvailableInPixels) {
                    var fiatCharacterWidth = fiatAmountTextWidthInPixels / fiatAmountText.length;
                    var fiatAmountFittingCharacters = fiatAmountWidthAvailableInPixels / fiatCharacterWidth;
                    if (fiatAmountFittingCharacters < 4) {
                        resultingFiatString = '';
                    }
                    else {
                        resultingFiatString = fiatAmountString.substr(0, fiatAmountFittingCharacters);
                        if (fiatAmountFittingCharacters != fiatAmountString.length) {
                            resultingFiatString += '..';
                        }
                    }
                }
            }
            return resultingFiatString;
        };
        /**
         * Make sure there are maximum 10 digits before the decimal dot (.) and 10 digits after.
         *
         * To allow more digits, just change the first to const's.
         */
        SendTransactionsController.prototype.amountImposeDigitLimit = function () {
            var integer_part_limit = 10;
            var decimal_part_limit = 10;
            var amount_input = String(this.$amount.val());
            var decimal_position = amount_input.indexOf('.');
            if (decimal_position == -1) {
                decimal_position = amount_input.length;
            }
            var integer_part = amount_input.substr(0, decimal_position);
            var decimal_part = amount_input.substr(decimal_position + 1);
            if (integer_part.length > integer_part_limit) {
                integer_part = integer_part.substr(0, integer_part_limit);
            }
            if (decimal_part.length > decimal_part_limit) {
                decimal_part = decimal_part.substr(0, decimal_part_limit);
            }
            var computed_amount = integer_part;
            if (decimal_part.length > 0) {
                computed_amount = computed_amount + '.' + decimal_part;
            }
            this.$amount.val(computed_amount);
        };
        SendTransactionsController.prototype.updateFiatAmountInsideCoinAmountBox = function () {
            var _this = this;
            // The code below calculates the text width's of the main amount and the fiat amount
            // it then makes sure that the two do not overlap
            // We're using a setTimeout so we don't block the UI thread when the user types their amount
            setTimeout(function () {
                var onTheFlyFiatAmountReadyForDisplay = '';
                var currentCrypto = jaxx.Registry.getCurrentCryptoController();
                if (currentCrypto['symbol']) {
                    var coinSymbol = currentCrypto.symbol;
                    onTheFlyFiatAmountReadyForDisplay = _this.coinToActiveFiatDisplay(_this.amountToSend, coinSymbol);
                }
                var widthFittingFiatAmount = _this.resizeFiatAmountTextToMakeItFit(onTheFlyFiatAmountReadyForDisplay);
                _this.$fiatAmount.text(widthFittingFiatAmount);
            }, 50);
        };
        SendTransactionsController.prototype.updateOnTheFlyCoinAmountInsideAmountBox = function () {
            var _this = this;
            setTimeout(function () {
                var onTheFlyCoinAmount = '';
                var currentCrypto = jaxx.Registry.getCurrentCryptoController();
                if (currentCrypto['symbol']) {
                    var coinSymbol = currentCrypto.symbol;
                    var activeFiatCode = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
                    onTheFlyCoinAmount = jaxx.FiatPriceController.fiatToCoin(_this.amountToSend, activeFiatCode, coinSymbol);
                    onTheFlyCoinAmount = jaxx.Formatters.balanceForDisplay(onTheFlyCoinAmount, 10);
                    onTheFlyCoinAmount = jaxx.FiatPriceController.prependCoinSymbolLetterToString(coinSymbol, onTheFlyCoinAmount);
                }
                var widthFittingCoinAmount = _this.resizeFiatAmountTextToMakeItFit(onTheFlyCoinAmount);
                _this.$fiatAmount.text(widthFittingCoinAmount);
            }, 50);
        };
        /*
        * Format the user input to the correct format our app needs to build transactions correctly
        * @method formatAmountInput
        * */
        SendTransactionsController.prototype.formatAmountInput = function () {
            var decimals = 18;
            var val = String(this.$amount.val());
            if (isNaN(+val))
                return null;
            var ar = val.split('.');
            if (ar.length > 2)
                return null;
            if (ar.length === 2) {
                var dec = ar[1];
                if (dec.length > decimals) {
                    ar[1] = ar[1].substr(0, decimals);
                    //this.$amount.val(ar.join('.'));
                }
            }
            /* let requestType: string = Registry.getCurrentCryptoController().config.cluster;
             console.log(' requestType ' +requestType);
             if(requestType === 'ETH') {
                 userInput = parseFloat(String(this.$amount.val())).toFixed(18);
             } else {
                 userInput = parseFloat(String(this.$amount.val())).toFixed(8);
             }*/
            return ar.join('.');
        };
        SendTransactionsController.prototype.amountDidChangeListener = function () {
            var _this = this;
            this.amountIsValid = false;
            this.amountToSend = null;
            var userInput = this.formatAmountInput();
            if (userInput.length === 0 || userInput === "0") {
                this.$fiatAmount.text('');
                return this.evaluateSendButton();
            }
            else if (!userInput) {
                return;
            }
            this.amountToSend = userInput;
            this.previousValuesSend = this.amountToSend;
            var spendable = this.spendableView.getSpendable();
            // Check if user input is above max or below min and show respective warning styles
            this.shapeShift.updateMinMaxWarnings(userInput);
            if (!jaxx.MATH.isZero(spendable) && !jaxx.MATH.isZero(this.amountToSend) && Number(this.amountToSend) <= Number(spendable)) {
                this.amountIsValid = true;
            }
            /** Start on the fly fiat conversion and display ---------------*/
            // if the toggle unit button is set to cryto coin
            if (!this.cryptoToFiatButton.isFiat) {
                this.updateFiatAmountInsideCoinAmountBox();
            }
            else {
                this.updateOnTheFlyCoinAmountInsideAmountBox();
            }
            /** End on the fly fiat conversion -----------------------------*/
            if (this.amountIsValid) {
                if (this.shapeShift.isActive()) {
                    this.shapeShift.isReady(Number(this.amountToSend), function (response) {
                        console.log(' Shapeshift is valid ' + response);
                        if (response.error) {
                            if (!_this.amountIsValid) {
                                return Navigation.flashBanner("Amount is not valid for current fees/spendable limit.", 3, 'error');
                            }
                            if (!_this.addressIsValid) {
                                return Navigation.flashBanner("Receiving Address is not valid.", 3, 'error');
                            }
                        }
                        else {
                            if (_this.cryptoToFiatButton.isFiat) {
                                userInput = jaxx.FiatPriceController.fiatToCoin(userInput, jaxx.FiatPriceController.instance.getActiveFiatCurrency(), jaxx.Registry.getCurrentCryptoController().symbol);
                            }
                            if (_this.shapeShift.meetsShapeShiftMinMax(userInput)) {
                                _this.addressIsValid = true;
                                _this.amountIsValid = true;
                            }
                            else {
                                _this.addressIsValid = false;
                                _this.amountIsValid = false;
                            }
                            _this.evaluateSendButton();
                        }
                    });
                }
                else if (this.currentState === 'receive') {
                    if (Number(this.amountToSend) > 0) {
                        this.addressIsValid = true;
                        this.amountIsValid = true;
                        this.evaluateSendButton();
                    }
                }
                else {
                    this.evaluateSendButton();
                }
            }
            else {
                this.evaluateSendButton();
            }
            console.log('JN - amountToSend blur amount - User Entered: ' + userInput + ', Jaxx using: ' + this.amountToSend + ' amountIsValid: ' + this.amountIsValid);
        };
        SendTransactionsController.prototype.start = function () {
            console.error('SendTransactionsController START');
            this.spendableView.update(0);
        };
        SendTransactionsController.prototype.resetAll = function (callback) {
            var _this = this;
            console.log('Resetting...');
            if (!this.currentState) {
                return;
            }
            this.$gasForSpendableWarning.hide();
            this.amountToSend = '';
            this.$receiverAddress.val('');
            this.$fiatAmount.text('');
            this.$sendLabel.text('SEND');
            this.currentState = 'reset';
            this.validToSend = false;
            this.deactivate();
            this.advanceGas.setActive(false);
            this.evaluateSendButton();
            this.$sendTabBtn.removeClass("tabHighlighted");
            this.$receiveTabBtn.removeClass("tabHighlighted");
            this.$shapeShiftFoxBtn.removeClass("tabHighlighted");
            this.$view.removeClass("tabHighlighted");
            this.$receiveTabLabel.removeClass('whiteText');
            this.$receiveTabImage.removeClass('whiteSVG');
            this.$exchangeTabLabel.removeClass('whiteText');
            this.$exchangeTabImage.removeClass('whiteSVG');
            this.$sendTabLabel.removeClass('whiteText');
            this.$sendTabImage.removeClass('whiteSVG');
            this.shapeShift.hideList();
            this.receiveTransactionsView.disable();
            if (callback) {
                // If a callback is required, call hide with the callback
                this.hide(function () {
                    callback();
                    _this.shapeShift.deactivate();
                    _this.deactivateShapeShift();
                    _this.shapeShift.hide();
                });
            }
            else {
                // Otherwise, just call hide normally
                this.hide(function () {
                    _this.shapeShift.deactivate();
                    _this.deactivateShapeShift();
                    _this.shapeShift.hide();
                });
            }
        };
        SendTransactionsController.prototype.renderAmountInput = function () {
            // Adjusting the height of the amount field to match the adjacent buttons
            var amountHeight = $('#fiatToCrypto').height();
            var iDeviceAdjust = 0.88;
            if (PlatformUtils.mobileIpadCheck || PlatformUtils.mobileiOSCheck) {
                // You must evoke a scroll to fix mobile Safari glitch
                $(window).scrollTop(-1);
                // Also reduced to 90% due to false height calculation
                this.$amount.css("height", iDeviceAdjust * amountHeight);
            }
            else {
                this.$amount.css("height", amountHeight);
            }
        };
        SendTransactionsController.prototype.deactivate = function () {
            this.isActive = false;
            this.isVisible = false;
            this.addressIsValid = false;
            this.amountIsValid = false;
        };
        SendTransactionsController.prototype.activateShapeshift = function (callback) {
            var _this = this;
            this.shapeShift.shapeShiftIsAvailable(function () {
                _this.shapeShift.isReady(+_this.amountToSend, function (result) {
                    console.log(result);
                });
                if (_this.isShapeShiftActive) {
                    return;
                }
                _this.isShapeShiftActive = true;
                _this.$receiverAddress.val("ShapeShift");
                _this.shapeShift.activate();
                _this.shapeShift.show();
                _this.$sendButtonLabel.text('EXCHANGE');
                _this.spendableView.update(0);
                _this.$mainInputField.addClass('mainAmountInputShift');
                _this.renderAmountInput();
                // while the ShapeShift module is active we hide the QR scanner because we have to send the funds
                // to the specific address ShapeShift API provide.
                // the QR scanner on ShapeShift address UI element isn't any useful
                if (PlatformUtils.mobileCheck) {
                    _this.hideQRCode();
                }
                if (callback) {
                    callback();
                }
            });
        };
        SendTransactionsController.prototype.deactivateShapeShift = function () {
            if (!this.isShapeShiftActive) {
                return;
            }
            if (PlatformUtils.mobileCheck) {
                this.showQRCode();
            }
            this.isShapeShiftActive = false;
            this.$sendAddressView.css('display', 'block');
            this.$sendButtonLabel.text('SEND');
            this.shapeShift.deactivate();
            this.shapeShift.hide();
            this.$mainInputField.removeClass('mainAmountInputShift');
            // ShapeShift UI module goes away, we show the QR code if we're on mobile
        };
        // Show QR Code and resize receiver address input box to properly align with the new elements
        SendTransactionsController.prototype.hideQRCode = function () {
            this.$receiverAddress.css('width', 'calc(100% - 10px)');
            this.$sendAddressView.children('.imageQR').hide();
        };
        // Show QR Code and resize receiver address input box to properly align with the shown QR code
        SendTransactionsController.prototype.showQRCode = function () {
            this.$qrCodeButton.show();
            this.$receiverAddress.css('width', 'calc(100% - 50px)');
        };
        SendTransactionsController.prototype.setState = function (newState, callback) {
            var _this = this;
            var prevSatate = this.currentState;
            this.currentState = newState;
            this.addressIsValid = false;
            this.amountIsValid = false;
            this.evaluateSendButton();
            switch (prevSatate) {
                case 'reset':
                    switch (newState) {
                        case 'send':
                            this.deactivateShapeShift();
                            this.activateSend();
                            this.renderAmountInput();
                            this.show();
                            this.$sendTabBtn.addClass("tabHighlighted");
                            this.$sendTabLabel.addClass('whiteText');
                            this.$sendTabImage.addClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.$maxBtn.show();
                            switch (this.isAdvancedOptionsAvaialble()) {
                                case true:
                                    this.$advancedTabButton.show();
                                    break;
                            }
                            break;
                        case 'ShapeShift':
                            this.activateShapeshift(function () {
                                _this.activateSend();
                                _this.$shapeShiftFoxBtn.addClass("tabHighlighted");
                                _this.$exchangeTabLabel.addClass('whiteText');
                                _this.$exchangeTabImage.addClass('whiteSVG');
                                _this.$sendLabel.text('EXCHANGE');
                                _this.$view.addClass("tabHighlighted");
                                _this.show();
                                _this.$sendAddressView.hide();
                                _this.$maxBtn.hide();
                                _this.$advancedTabButton.hide();
                            });
                            break;
                        case 'receive':
                            this.resetAll();
                            this.currentState = newState;
                            this.deactivateShapeShift();
                            this.activateReceive();
                            this.$sendAddressView.hide();
                            this.$maxBtn.hide();
                            this.spendableView.hide();
                            this.$sendButtonLabel.text('GENERATE');
                            this.$receiveTabBtn.addClass("tabHighlighted");
                            this.$receiveTabLabel.addClass('whiteText');
                            this.$receiveTabImage.addClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.receiveTransactionsView.enable();
                            this.renderAmountInput();
                            this.show();
                            break;
                        case 'restore':
                            this.resetAll();
                            this.currentState = 'reset';
                            break;
                    }
                    break;
                case 'send':
                    switch (newState) {
                        case 'send':
                            this.resetAll(function () {
                                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION_CLOSED);
                            });
                            break;
                        case 'ShapeShift':
                            this.activateShapeshift(function () {
                                _this.$shapeShiftFoxBtn.addClass("tabHighlighted");
                                _this.$exchangeTabLabel.addClass('whiteText');
                                _this.$exchangeTabImage.addClass('whiteSVG');
                                _this.$sendLabel.text('EXCHANGE');
                                _this.$sendTabBtn.removeClass("tabHighlighted");
                                _this.$sendTabLabel.removeClass('whiteText');
                                _this.$sendTabImage.removeClass('whiteSVG');
                                _this.amountToSend = '';
                                _this.$amount.val('');
                                _this.amountDidChangeListener();
                                _this.$advancedTabButton.hide();
                                _this.$sendAddressView.hide();
                                _this.$maxBtn.hide();
                            });
                            break;
                        case 'receive':
                            this.resetAll();
                            this.currentState = newState;
                            this.deactivateShapeShift();
                            this.$sendAddressView.hide();
                            this.$maxBtn.hide();
                            this.spendableView.hide();
                            this.$sendButtonLabel.text('GENERATE');
                            this.$receiveTabBtn.addClass("tabHighlighted");
                            this.$receiveTabLabel.addClass('whiteText');
                            this.$receiveTabImage.addClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.receiveTransactionsView.enable();
                            this.renderAmountInput();
                            this.show();
                            break;
                        case 'restore':
                            this.resetAll(callback);
                            this.currentState = 'reset';
                            break;
                    }
                    break;
                case 'ShapeShift':
                    switch (newState) {
                        case 'ShapeShift':
                            this.resetAll(function () {
                                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION_CLOSED);
                            });
                            this.currentState = '';
                            break;
                        case 'send':
                            this.deactivateShapeShift();
                            this.spendableView.update(0);
                            this.amountToSend = '';
                            this.$amount.val('');
                            this.$receiverAddress.val('');
                            this.amountDidChangeListener();
                            this.$shapeShiftFoxBtn.removeClass("tabHighlighted");
                            this.$exchangeTabLabel.removeClass('whiteText');
                            this.$exchangeTabImage.removeClass('whiteSVG');
                            this.$sendLabel.text('SEND');
                            this.$sendTabBtn.addClass("tabHighlighted");
                            this.$sendTabLabel.addClass('whiteText');
                            this.$sendTabImage.addClass('whiteSVG');
                            this.$maxBtn.show();
                            switch (this.isAdvancedOptionsAvaialble()) {
                                case true:
                                    this.$advancedTabButton.show();
                                    break;
                            }
                            break;
                        case 'receive':
                            this.deactivateShapeShift();
                            this.resetAll();
                            this.currentState = newState;
                            this.activateReceive();
                            this.$sendAddressView.hide();
                            this.$maxBtn.hide();
                            this.spendableView.hide();
                            this.$sendButtonLabel.text('GENERATE');
                            this.$receiveTabBtn.addClass("tabHighlighted");
                            this.$receiveTabLabel.addClass('whiteText');
                            this.$receiveTabImage.addClass('whiteSVG');
                            this.$sendTabBtn.removeClass("tabHighlighted");
                            this.$sendTabLabel.removeClass('whiteText');
                            this.$sendTabImage.removeClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.renderAmountInput();
                            this.show();
                            this.receiveTransactionsView.enable();
                            break;
                        case 'restore':
                            this.resetAll(callback);
                            this.currentState = 'reset';
                            break;
                    }
                    break;
                case 'receive':
                    switch (newState) {
                        case 'receive':
                            this.resetAll(function () {
                                jaxx.Registry.application$.triggerHandler(jaxx.Registry.UI_CONFIRM_TRANSACTION_CLOSED);
                            });
                            break;
                        case 'send':
                            this.deactivateShapeShift();
                            this.$sendAddressView.show();
                            this.spendableView.show();
                            this.$sendLabel.text('SEND');
                            this.$receiveTabBtn.removeClass("tabHighlighted");
                            this.$receiveTabLabel.removeClass('whiteText');
                            this.$receiveTabImage.removeClass('whiteSVG');
                            this.$sendTabBtn.addClass("tabHighlighted");
                            this.$sendTabLabel.addClass('whiteText');
                            this.$sendTabImage.addClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.receiveTransactionsView.disable();
                            this.$maxBtn.show();
                            switch (this.isAdvancedOptionsAvaialble()) {
                                case true:
                                    this.$advancedTabButton.show();
                                    break;
                            }
                            break;
                        case 'ShapeShift':
                            this.$receiveTabBtn.removeClass("tabHighlighted");
                            this.$receiveTabLabel.removeClass('whiteText');
                            this.$receiveTabImage.removeClass('whiteSVG');
                            this.$shapeShiftFoxBtn.addClass("tabHighlighted");
                            this.$exchangeTabLabel.addClass('whiteText');
                            this.$exchangeTabImage.addClass('whiteSVG');
                            this.$sendLabel.text('EXCHANGE');
                            this.$view.addClass("tabHighlighted");
                            this.$sendAddressView.hide();
                            this.spendableView.show();
                            this.receiveTransactionsView.disable();
                            this.$advancedTabButton.hide();
                            this.activateShapeshift(function () {
                                _this.shapeShift.isReady(+_this.amountToSend, function (result) {
                                    console.log(result);
                                });
                                if (_this.isShapeShiftActive) {
                                    return;
                                }
                                _this.isShapeShiftActive = true;
                                _this.$receiverAddress.css({ backgroundImage: 'url(' + g_JaxxApp.getShapeShiftHelper()._avatarImage + ')' })
                                    .addClass('validShapeshift')
                                    .addClass('cssValidShapeshift ');
                                _this.$receiverAddress.val("ShapeShift");
                                _this.shapeShift.activate();
                                _this.shapeShift.show();
                                _this.$sendButtonLabel.text('EXCHANGE');
                                _this.spendableView.update(0);
                                _this.$sendAddressView.hide();
                                _this.$maxBtn.hide();
                            });
                            break;
                        case 'restore':
                            this.resetAll();
                            this.currentState = 'reset';
                            break;
                    }
                    break;
                default:
                    switch (newState) {
                        case 'receive':
                            this.resetAll();
                            this.currentState = newState;
                            this.activateReceive();
                            this.$sendAddressView.hide();
                            this.$maxBtn.hide();
                            this.spendableView.hide();
                            this.$sendButtonLabel.text('GENERATE');
                            this.$receiveTabBtn.addClass("tabHighlighted");
                            this.$receiveTabLabel.addClass('whiteText');
                            this.$receiveTabImage.addClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.receiveTransactionsView.enable();
                            this.renderAmountInput();
                            this.show();
                            break;
                        case 'send':
                            this.activateSend();
                            this.renderAmountInput();
                            this.show();
                            this.$sendTabBtn.addClass("tabHighlighted");
                            this.$sendTabLabel.addClass('whiteText');
                            this.$sendTabImage.addClass('whiteSVG');
                            this.$view.addClass("tabHighlighted");
                            this.$maxBtn.show();
                            switch (this.isAdvancedOptionsAvaialble()) {
                                case true:
                                    this.$advancedTabButton.show();
                                    break;
                            }
                            break;
                        case 'ShapeShift':
                            this.activateShapeshift(function () {
                                _this.activateSend();
                                _this.$sendAddressView.show();
                                _this.spendableView.show();
                                _this.$receiveTabBtn.removeClass("tabHighlighted");
                                _this.$receiveTabLabel.removeClass('whiteText');
                                _this.$receiveTabImage.removeClass('whiteSVG');
                                _this.$shapeShiftFoxBtn.addClass("tabHighlighted");
                                _this.$exchangeTabLabel.addClass('whiteText');
                                _this.$exchangeTabImage.addClass('whiteSVG');
                                _this.$sendLabel.text('EXCHANGE');
                                _this.$view.addClass("tabHighlighted");
                                _this.$advancedTabButton.hide();
                                _this.show();
                                _this.$sendAddressView.hide();
                                _this.$maxBtn.hide();
                            });
                            break;
                    }
            }
        };
        SendTransactionsController.prototype.hide = function (callback) {
            this.isVisible = false;
            this.$view.slideUp("slow", function () {
                // Callback functionality added to hide to prevent UI timing glitches
                if (callback) {
                    callback();
                }
            });
            this.advanceGas.hide();
        };
        SendTransactionsController.prototype.show = function () {
            this.isActive = true;
            if (this.cryptoToFiatButton.isFiat) {
                this.showFiatSpendable();
            }
            else {
                this.showCryptoSpendable();
            }
            this.setUseFiat(this.cryptoToFiatButton.isFiat);
            this.advanceGas.show();
            this.$view.slideDown();
            this.spendableView.update(0);
        };
        /// this function activate send state not receive state
        SendTransactionsController.prototype.activateSend = function () {
            this.isActive = false;
            this.enableAdvanceGasIfRequired();
            this.$sendAddressView.show();
            this.spendableView.update(0);
            this.spendableView.show();
            this.$sendButtonLabel.text('SEND');
            this.evaluateSendButton();
            this.checkIsTokenNeedEthereum();
        };
        //this function activate receive state only
        SendTransactionsController.prototype.activateReceive = function () {
            this.isActive = true;
        };
        SendTransactionsController.prototype.checkIsTokenNeedEthereum = function () {
            var ctr = jaxx.Registry.getCurrentCryptoController();
            if (ctr && ctr.isToken && !ctr.isEnoughGas()) {
                this.$gasForSpendableWarning.show();
            }
        };
        SendTransactionsController.prototype.updateFieldWithBalance = function (fieldElement, balance) {
            //TODO: need fiat check for formatting.
            //TODO: Determine if val or text.
            var formattedValue = jaxx.Formatters.balanceForDisplay(balance);
            if (this.cryptoToFiatButton.isFiat) {
                fieldElement.val(jaxx.Formatters.balanceForDisplay(formattedValue, 2));
            }
            else {
                fieldElement.val(formattedValue);
            }
            return formattedValue;
        };
        /**
         * Measures the actual width of a text string using the given size and font face.
         *
         * @param textContent {string} - The desired string to be measured.
         * @param fontFamily {string} - The font family name. Examples: "Comic Sans", "Webdings"
         * @param fontSize {string} - The font size and unit as used in CSS values. Examples: "12px", "10pt", "1em"
         */
        SendTransactionsController.prototype.measureTextWidth = function (textContent, fontFamily, fontSize) {
            var ret_val = 0;
            var $in_mem_canvas_element = $('<canvas></canvas>');
            var text_metrics;
            var in_mem_canvas_2d_context = $in_mem_canvas_element.get(0).getContext('2d');
            in_mem_canvas_2d_context.font = fontSize + ' ' + fontFamily;
            text_metrics = in_mem_canvas_2d_context.measureText(textContent);
            ret_val = text_metrics.width;
            return ret_val;
        };
        return SendTransactionsController;
    }());
    jaxx.SendTransactionsController = SendTransactionsController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=send-transaction-controller.js.map