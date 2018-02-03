var jaxx;
(function (jaxx) {
    var ToolBarMenu = (function () {
        function ToolBarMenu() {
        }
        return ToolBarMenu;
    }());
    jaxx.ToolBarMenu = ToolBarMenu;
    var SendConfirmationView = (function () {
        function SendConfirmationView(main) {
            var _this = this;
            this.main = main;
            this.emitter$ = $({});
            this.ON_CANCEL = 'ON_CANCEL';
            SendConfirmationView.instance = this;
            this.$view = $('#SendTransactionConfirmationView');
            // this.$content = $('<div></div>').appendTo(this.$view);
            // this.$content.slideUp();
            /*  this.$view.load('js/app/send-transaction/send-confirmation.html', ()=>{
  
              })*/
            $.get('js/app/send-transaction/send-confirmation.html').done(function (res) {
                _this.template = res;
                setTimeout(function () { return _this.init(); }, 1000);
            });
            $.get('js/app/send-transaction/shape-shift-confirmation.html').done(function (res) {
                _this.shapeshiftTemplate = res;
            });
        }
        SendConfirmationView.prototype.show = function () {
            this.$view.removeClass('hideNotificationFooter');
            // TODO: Find if any notification banner is open
            var bannerHeight;
            var documentHeight = $(document).height();
            var transactionTop = $('#TransactionsHeader').position().top;
            var calculatedHeight = Math.round(documentHeight - transactionTop);
            if (jaxx.Registry.mobile || jaxx.Registry.chromeExtension) {
                bannerHeight = calculatedHeight;
            }
            else {
                bannerHeight = $('.landscapeRight').height();
            }
            var banner = this.$view.find('.cssNotificationFooter.cssSendConfirmation, .cssShapeShiftConfirmation.cssNotificationFooter');
            banner.parent().removeClass("hideNotificationFooter").addClass('visibleNotificationFooter');
            banner.slideDown(400, "swing").animate({ height: bannerHeight });
            if (jaxx.Registry.android) {
                if (window.native && !!window.native.getAndroidSoftNavbarHeight()) {
                    $('.modal-bottom').addClass('softKeys');
                }
            }
            this.addListeners();
        };
        SendConfirmationView.prototype.hide = function () {
            this.$view.children().first().remove();
            this.$view.addClass('hideNotificationFooter');
        };
        SendConfirmationView.prototype.init = function () {
            /* this.showConfirmation({
                miningFee:'45676'
             });
             this.show();*/
        };
        SendConfirmationView.prototype.addListeners = function () {
            var _this = this;
            this.$view.find('[data-click=Confirm]').click(function () {
                _this.onConfirm();
            });
            this.$view.find('[data-click=Cancel]').click(function () {
                _this.emitter$.triggerHandler((_this.ON_CANCEL));
                _this.onCancel();
            });
        };
        SendConfirmationView.prototype.showShapeShiftConfirmation = function (obj, isFiat, coinValue) {
            var html;
            var currentCoin = jaxx.Registry.getCryptoControllerBySymbol(obj.depositType);
            // The symbol used for the FROM coin for display purposes
            var displaySymbolFrom = currentCoin.threeLetterCode;
            var shiftCoin = jaxx.Registry.getCryptoControllerBySymbol(obj.withdrawalType);
            // The symbol used for the TO coin for display purposes
            var displaySymbolTo = shiftCoin.threeLetterCode;
            if (isFiat) {
                // The amount to display in crypto plus the three letter symbol
                var depositAmount = String(obj.amountToDeposit);
                // The amount to display in fiat followed by the currency type wrapped in parentheses
                var alternateAmount = '(' + jaxx.FiatPriceController.displayFiatValue(Number(obj.displayAmountToDeposit)) + ' ' + jaxx.FiatPriceController.instance.getActiveFiatCurrency() + ')';
                html = this.shapeshiftTemplate
                    .replace('{{convertSymbolFrom}}', displaySymbolFrom)
                    .replace('{{convertAmountFrom}}', depositAmount)
                    .replace('{{convertAmountTo}}', obj.displayAmountToWithdraw)
                    .replace('{{convertSymbolTo}}', displaySymbolTo)
                    .replace('{{miningFee}}', obj.miningFee + '')
                    .replace('{{miningFeeSymbol}}', displaySymbolTo)
                    .replace('{{alternateAmount}}', alternateAmount);
            }
            else {
                html = this.shapeshiftTemplate
                    .replace('{{convertSymbolFrom}}', displaySymbolFrom)
                    .replace('{{convertAmountFrom}}', obj.displayAmountToDeposit)
                    .replace('{{convertAmountTo}}', obj.displayAmountToWithdraw)
                    .replace('{{convertSymbolTo}}', displaySymbolTo)
                    .replace('{{miningFee}}', obj.miningFee + '')
                    .replace('{{miningFeeSymbol}}', displaySymbolTo)
                    .replace('{{alternateAmount}}', '');
            }
            this.$view.prepend(html);
            this.show();
        };
        SendConfirmationView.prototype.showConfirmation = function (obj) {
            //
            var symbol;
            if (obj.fiatSymbol) {
                symbol = obj.fiatSymbol;
            }
            else {
                symbol = obj.symbol;
            }
            // let isShapeShift:boolean;
            var html;
            // if(obj.apiPubKey) {
            //     isShapeShift = true;
            // } else {
            //     isShapeShift = false;
            // }
            if (obj.fiatSymbol) {
                html = this.template.replace('{{symbol}}', symbol)
                    .replace('{{amount}}', obj.displayAmount + '')
                    .replace('{{addressTo}}', obj.addressTo)
                    .replace('{{miningFee}}', obj.miningFeeDecimal + '')
                    .replace('{{miningFeeSymbol}}', obj.miningFeeSymbol || obj.symbol)
                    .replace('{{alternate_amount}}', " (" + obj.amountDecimal + ' ' + obj.symbol + ")");
            }
            else {
                var fiatEquivalent = jaxx.FiatPriceController.coinToActiveDisplayFiat(String(obj.amountDecimal), obj.symbol);
                html = this.template.replace('{{symbol}}', symbol)
                    .replace('{{amount}}', obj.amountDecimal + '')
                    .replace('{{addressTo}}', obj.addressTo)
                    .replace('{{miningFee}}', obj.miningFeeDecimal + '')
                    .replace('{{miningFeeSymbol}}', obj.miningFeeSymbol || obj.symbol)
                    .replace('{{alternate_amount}}', ' (' + fiatEquivalent + ')');
            }
            // this.$content.html(html);
            this.$view.prepend(html);
            this.show();
        };
        return SendConfirmationView;
    }());
    jaxx.SendConfirmationView = SendConfirmationView;
    var SpendableView = (function () {
        function SpendableView() {
            this.$view = $('#SpendableView');
            this.init();
        }
        SpendableView.prototype.init = function () {
            this.$amount = $('#SpendableAmount');
            this.$loading = $('#SpendableUndefined');
            this.$spendableFiatSymbol = $('#spendableFiatCurrency');
            this.$spendableCryptoSymbol = $('#spendableCryptoSymbol');
            this.$spendableLoading = $('#SpendableUndefined');
            this.$loading.hide();
        };
        // update(delta:number) {
        //
        //     let ctr = jaxx.Registry.getCurrentCryptoController();
        //
        //     if(ctr){
        //         let spendable  = ctr.getSpendable();
        //
        //         console.log(' spendable   ' + spendable +  ' delta   ' + delta);
        //
        //         spendable+=delta;
        //
        //        // if(isNaN(spendable) || spendable < 0) spendable = 0;
        //         //this.$undefined.hide();
        //         //spendable = Math.floor(spendable * 1e8)/1e8;
        //        // console.log(spendable);
        //
        //         if(Number(spendable) < 0) {
        //             this.spendable = '0';
        //         } else {
        //             this.spendable = spendable;
        //         }
        //         this.$amount.text(Formatters.balanceForDisplay(this.spendable));
        //     } else {
        //         console.error(' no current controller ')
        //     }
        // }
        SpendableView.prototype.getSpendable = function () {
            if (Number(this.spendable) < 0) {
                return '0';
            }
            return this.spendable;
        };
        SpendableView.prototype.show = function () {
            this.$view.show();
        };
        SpendableView.prototype.hide = function () {
            this.$view.hide();
        };
        // Shows loading indicator and hides the amount
        SpendableView.prototype.showLoadingIndicator = function () {
            this.$amount.hide();
            this.$loading.show();
        };
        // Hides loading indicator and shows the amount
        SpendableView.prototype.hideLoadingIndicator = function () {
            this.$amount.show();
            this.$loading.hide();
        };
        // Updates UI with spendable amount and formats it with 2 decimals if "isFiat" is passed as true or with 8 decimals otherwise
        SpendableView.prototype.setSpendableAmount = function (newAmount, isFiat) {
            var formattedAmount;
            if (isFiat) {
                formattedAmount = jaxx.Formatters.balanceForDisplay(newAmount, 2);
            }
            else {
                formattedAmount = jaxx.Formatters.balanceForDisplay(newAmount, 8);
            }
            this.$amount.text(formattedAmount);
        };
        return SpendableView;
    }());
    jaxx.SpendableView = SpendableView;
    var SendButtonComponent = (function () {
        function SendButtonComponent(sendTransactionController) {
            var _this = this;
            this.sendTransactionController = sendTransactionController;
            this.$view = $('#Send_Recieve_Btn');
            this.$sendLabel = $('#sendLabel');
            this.$view.on('click', function (evt) {
                _this.onClick();
            });
        }
        SendButtonComponent.prototype.update = function (status) {
            console.log(' button status ' + status);
            switch (status) {
                case 'active':
                    this.$sendLabel.addClass('whiteText');
                    this.$view.addClass('enabled').addClass('cssEnabled');
                    break;
                default:
                    this.$sendLabel.removeClass('whiteText');
                    this.$view.removeClass('enabled').removeClass('cssEnabled');
                    break;
            }
        };
        return SendButtonComponent;
    }());
    jaxx.SendButtonComponent = SendButtonComponent;
    var AdvanceGasController = (function () {
        function AdvanceGasController() {
            this.init();
        }
        AdvanceGasController.prototype.getCustomData = function () {
            if (!this.isActive() || !this.isOptionsActive())
                return null;
            return (this.customDataValid) ? this.customDataValue : null;
        };
        AdvanceGasController.prototype.getCustomGasLimit = function () {
            // console.warn(' is active '+ this.isOptionsActive());
            if (!this.isActive() || !this.isOptionsActive())
                return null;
            var data = String(this.$customGasLimit.val()).trim();
            return (data.length) ? data : null;
        };
        AdvanceGasController.prototype.init = function () {
            var _this = this;
            this.$button = $('.advancedTabButton').first();
            this.$customData = $('#inputCustomData');
            this.customDataValid = false;
            this.customDataValue = null;
            this.$customGasLimit = $('.inputCustomGasLimit').first();
            this.$view = $('#AdvancedGasEthereumView');
            this.buttonVisible = this.$button.is(":visible");
            this.optionsVisible = this.$view.is(":visible");
            this.optionsActive = this.optionsVisible;
            this.updateCallback = null;
            this.viewActive = false;
            this.$button.on("click", function () {
                _this.toggleView();
                if (_this.updateCallback)
                    _this.updateCallback();
            });
            this.$customData.on('change paste blur', function () {
                _this.validateCustomData();
                if (!_this.customDataValid && String(_this.$customData.val()).trim().length)
                    Navigation.flashBanner('Custom Data must be in Hex', 3, 'error');
                if (_this.updateCallback)
                    _this.updateCallback();
            });
        };
        AdvanceGasController.prototype.hide = function () {
            if (this.viewActive) {
                this.hideButton();
                this.hideOptions();
            }
        };
        AdvanceGasController.prototype.hideButton = function () {
            if (this.buttonVisible) {
                this.buttonVisible = false;
                this.$button.hide();
            }
        };
        AdvanceGasController.prototype.hideOptions = function () {
            if (this.optionsVisible) {
                this.optionsVisible = false;
                this.$view.slideUp();
                $('.advancedBtnImage').removeClass('flipped');
            }
        };
        AdvanceGasController.prototype.isActive = function () {
            return this.viewActive;
        };
        AdvanceGasController.prototype.isCustomDataValid = function () {
            return this.validateCustomData();
        };
        AdvanceGasController.prototype.isOptionsActive = function () {
            return this.optionsActive;
        };
        AdvanceGasController.prototype.setActive = function (isActive, options) {
            this.optionsActive = false;
            //  console.warn(' setActive   ' + isActive);
            this.viewActive = isActive;
            if (this.viewActive) {
                if (options)
                    this.$customGasLimit.val(options.gasLimit);
                this.showButton();
            }
            else {
                this.hideButton();
                this.$customData.val('');
                this.customDataValid = false;
                this.customDataValue = null;
                this.$customGasLimit.val('');
            }
            this.hideOptions();
        };
        AdvanceGasController.prototype.setUpdateCallback = function (callback) {
            this.updateCallback = callback;
        };
        AdvanceGasController.prototype.show = function () {
            if (this.viewActive) {
                this.showButton();
                if (this.optionsActive)
                    this.showOptions();
            }
        };
        AdvanceGasController.prototype.showButton = function () {
            if (!this.buttonVisible) {
                this.buttonVisible = true;
                this.$button.show();
            }
        };
        AdvanceGasController.prototype.showOptions = function () {
            if (!this.optionsVisible) {
                this.optionsVisible = true;
                this.$view.slideDown();
                $('.advancedBtnImage').addClass('flipped');
            }
        };
        AdvanceGasController.prototype.toggleView = function () {
            if (this.optionsVisible) {
                this.hideOptions();
            }
            else {
                this.showOptions();
            }
            this.optionsActive = this.optionsVisible;
        };
        AdvanceGasController.prototype.validateCustomData = function () {
            var dirtyInput = String(this.$customData.val()).trim();
            this.customDataValue = JaxxUtils.scrubInput(dirtyInput);
            if (this.customDataValue) {
                this.customDataValid = true;
            }
            return this.customDataValid;
        };
        return AdvanceGasController;
    }());
    jaxx.AdvanceGasController = AdvanceGasController;
    var SendConfirmationController = (function () {
        function SendConfirmationController() {
            this.init();
        }
        SendConfirmationController.prototype.init = function () {
            var _this = this;
            this.$view = $('.modal.send').first();
            this.$btnClose = this.$view.find('.cssClose').first().click(function () { console.log('on close click'); });
            this.$btnConfirm = $('#sendConfirmationButton').click(function (evt) {
                _this.onConfirmed();
            });
        };
        SendConfirmationController.prototype.show = function () {
            this.$view.show();
        };
        SendConfirmationController.prototype.hide = function () {
            this.$view.hide();
        };
        SendConfirmationController.prototype.setTransaction = function (tr) {
            this.tr = tr;
        };
        SendConfirmationController.prototype.setAmount = function (num) {
        };
        SendConfirmationController.prototype.setMessage = function (str) {
        };
        return SendConfirmationController;
    }());
    jaxx.SendConfirmationController = SendConfirmationController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=send-transaction-components.js.map