var jaxx;
(function (jaxx) {
    var ReceiveTransactionTemplate = '<div id="ReceiveModalOverlay" class="modal receive cssModal cssReceive" style="opacity: 0; display: none; transition: opacity 1s;">\
        <div class="cssContent">\
            <div class="cssHeader" closemodal="true">Payment Request\
                <div class="cssClose cssNoSelect">x</div>\
            </div>\
            <div class="cssItem cssCenter"> Requesting <span class="amount">5</span> <span class="amountAbbreviatedName">BTC</span> to\
                <div class="cssPopCenter cssAligCenter"> <span class="populateAddress cssAddress"></span>\
                    <div class="populateAddressCopyLarge imageCopy cssImageCopy cssNoSelect" data-copylarge=""></div>\
                </div>\
                <div class="qrCode cssQRCode"><img class="QRCode" src=""></div>\
            </div>\
        </div>\
    </div>';
    var ReceiveTransactionView = (function () {
        function ReceiveTransactionView(sendController) {
            var _this = this;
            this.isEnabled = false;
            this.sendController = sendController;
            this.onGenerateClickHandler = this.onGenerateButtonClicked.bind(this);
            this.onAmountChangeInputHandler = this.onAmountBoxInputChange.bind(this);
            // due to how the legacy code initializes in parallel
            // it overrides all UI events that init before that legacy part
            // we delay as a quick fix
            setTimeout(function () {
                _this.init();
            }, 300);
        }
        ReceiveTransactionView.prototype.enable = function () {
            if (this.isEnabled) {
                return;
            }
            var generateBtn = this.$GenerateButton.get(0);
            var amountBox = this.$AmountInputBox.get(0);
            generateBtn.addEventListener('click', this.onGenerateClickHandler);
            amountBox.addEventListener('input', this.onAmountChangeInputHandler);
            this.isEnabled = true;
        };
        ReceiveTransactionView.prototype.disable = function () {
            if (!this.isEnabled) {
                return;
            }
            var generateBtn = this.$GenerateButton.get(0);
            var amountBox = this.$AmountInputBox.get(0);
            generateBtn.removeEventListener('click', this.onGenerateClickHandler);
            amountBox.removeEventListener('input', this.onAmountChangeInputHandler);
            this.isEnabled = false;
        };
        ReceiveTransactionView.prototype.init = function () {
            this.$ViewContainer = $('.wallet');
            this.$ReceiveTabButton = $('#ReceiveTabBtn');
            this.$SendTabButton = $('#SendTabBtn');
            this.$GenerateButton = $('#Send_Recieve_Btn');
            this.$AmountInputBox = $('#amountSendInput');
            this.$ReceiveLabel = $('#receiveLabel');
            this.$SendLabel = $('#sendLabel');
            this.render();
            this.$ModalOverlay = $('#ReceiveModalOverlay');
            this.$CloseButton = $('#ReceiveModalOverlay .cssClose');
            this.$QRCodeImage = $('#ReceiveModalOverlay .QRCode');
            this.$Amount = $('#ReceiveModalOverlay .cssContent span.amount');
            this.$CoinSymbol = $('#ReceiveModalOverlay .cssContent .amountAbbreviatedName');
            this.$CopyButton = $('#ReceiveModalOverlay .populateAddressCopyLarge');
            this.$Address = $('#ReceiveModalOverlay .populateAddress');
            //this.$ReceiveTabButton.on('click', this.onReceiveButtonTabClicked.bind(this));
            //this.$SendTabButton.on('click', this.onSendButtonTabClicked.bind(this));
            //this.$GenerateButton.on('click', this.onGenerateButtonClicked.bind(this));
            this.$CloseButton.on('click', this.onCloseButtonClicked.bind(this));
            this.$CopyButton.on('click', this.onCopyButtonClicked.bind(this));
            //this.$AmountInputBox.on('input', this.onAmountBoxInputChange.bind(this))
            // the .bind component above ensures that when the event fires and the handlers are called
            // our "this" context will be the instance of the ReceiveTransactionView class
        };
        ReceiveTransactionView.prototype.render = function () {
            this.$ViewContainer.append(ReceiveTransactionTemplate);
        };
        ReceiveTransactionView.prototype.show = function (coinSymbol, amountRequested, address) {
            var _this = this;
            this.$Amount.text(amountRequested);
            this.$CoinSymbol.text(coinSymbol);
            this.$Address.text(address);
            this.$CopyButton.attr('data-copylarge', address);
            var QRCodeData = jaxx.Utils.generateQRCode(address);
            this.$QRCodeImage.attr('src', QRCodeData);
            this.$ModalOverlay.css('display', 'initial');
            setTimeout(function () {
                _this.$ModalOverlay.css('opacity', '1');
            }, 10);
        };
        ReceiveTransactionView.prototype.hide = function () {
            var _this = this;
            this.$ModalOverlay.css('opacity', '0');
            setTimeout(function () {
                _this.$ModalOverlay.css('display', 'none');
            }, 500);
        };
        ReceiveTransactionView.prototype.onAmountBoxInputChange = function (event) {
            var _this = this;
            var inputData = this.$AmountInputBox.val();
            setTimeout(function () {
                if (inputData.length > 0 && Number(inputData) != 0) {
                    _this.$GenerateButton.addClass('enabled');
                    _this.$GenerateButton.addClass('cssEnabled');
                    _this.$SendLabel.addClass('whiteText');
                    _this.$ReceiveLabel.addClass('whiteText');
                    console.log('%c Enabling generate button.', 'font-weight: bold');
                }
                else {
                    _this.$GenerateButton.removeClass('enabled');
                    _this.$GenerateButton.removeClass('cssEnabled');
                    _this.$SendLabel.removeClass('whiteText');
                    _this.$ReceiveLabel.removeClass('whiteText');
                    console.log('%c Disabling generate button.', 'font-weight: bold');
                }
            }, 50);
            event.stopImmediatePropagation();
        };
        ReceiveTransactionView.prototype.onGenerateButtonClicked = function (event) {
            var amount = this.$AmountInputBox.val();
            if (amount.length > 0 && Number(amount) != 0) {
                var address = void 0;
                address = $('#AddressView-address').text();
                if (address.length > 6) {
                    var coinSymbol = void 0;
                    var currentCryptoMaster = jaxx.Registry.getCurrentCryptoController();
                    if (currentCryptoMaster && currentCryptoMaster.symbol) {
                        coinSymbol = currentCryptoMaster.symbol;
                        if (this.sendController.cryptoToFiatButton.isFiat) {
                            amount = jaxx.FiatPriceController.fiatToCoin(amount, jaxx.FiatPriceController.instance.getActiveFiatCurrency(), coinSymbol);
                            amount = jaxx.Formatters.balanceForDisplay(amount, 8);
                        }
                        this.show(coinSymbol, amount, address);
                    }
                }
            }
        };
        ReceiveTransactionView.prototype.onCloseButtonClicked = function (event) {
            this.hide();
            jaxx.SendTransactionsController.instance.setState('restore');
        };
        ReceiveTransactionView.prototype.onCopyButtonClicked = function (event) {
            var copyValue = this.$CopyButton.attr('data-copylarge');
            if (window.native && window.native.copyToClipboard) {
                window.native.copyToClipboard(copyValue);
            }
            else {
                var temp_textarea = document.getElementById('clipboard'); // we have a global text area ready to use for copying
                temp_textarea.value = copyValue;
                temp_textarea.select();
                if (document.execCommand('copy')) {
                    Navigation.flashBanner('Address copied to clipboard.', 2, 'success');
                }
                else {
                    Navigation.flashBanner("Couldn't copy.", 2, 'error');
                }
                return;
            }
        };
        return ReceiveTransactionView;
    }());
    jaxx.ReceiveTransactionView = ReceiveTransactionView;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=receive-transaction-view.js.map