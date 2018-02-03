/**
 * Created by Vlad on 10/11/2016.
 **/
var jaxx;
(function (jaxx) {
    var Application = (function () {
        function Application() {
            this.appVersion = '1.3.11';
            this.configVersion = '';
            this.configUsingLocalFile = false;
            this.configLastUpdateTimestamp = 0;
            Application.instance = this;
            jaxx.Registry.application = this;
            this.init();
        }
        Application.prototype.setConfig = function (config) {
            this.config = config;
            this.configVersion = config.ver;
            var usingLocal = localStorage.getItem('useAppConfig');
            if (usingLocal && usingLocal['toLowerCase'] && usingLocal.toLowerCase() === 'true') {
                this.configUsingLocalFile = true;
            }
            else {
                this.configUsingLocalFile = false;
            }
            this.configLastUpdateTimestamp = Number(localStorage.getItem('lastJaxxConfigUpdate'));
            this.bitCoinMiningFeeController = new jaxx.MiningFeeView();
            this.fiatPriceController.init(config);
            this.setWakeApTimer();
            this.navigationToolMenuController.updateUIConfigInformation(this.configVersion, this.configLastUpdateTimestamp, this.configUsingLocalFile);
        };
        Application.prototype.init = function () {
            var _this = this;
            jaxx.Registry.application$.on(jaxx.Registry.MODULE_REDY, function (evt, obj) {
                console.log(jaxx.Registry.MODULE_REDY + ' ' + obj.constructor.name);
            });
            this.bchClaimController = new jaxx.BCHClaimController();
            this.fiatPriceController = new jaxx.FiatPriceController();
            this.coinsMenu = new jaxx.CoinsMenu();
            this.spinner = new jaxx.Spinner();
            this.balanceController = new jaxx.BalanceView();
            this.addressView = new jaxx.AddressView();
            //TODO  rename transactionsView into TransactionsHistory
            this.transactionsView = new jaxx.TransactionsView();
            jaxx.Registry.platformCheck();
            this.sendTransactionsViewController = new jaxx.SendTransactionsController();
            this.paperWalletTransactionController = new jaxx.PaperWalletTransactionController();
            this.transferPaperWalletMenu = new jaxx.TransferPaperWalletMenu();
            this.transferPaperWalletWarning = new jaxx.TransferPaperWalletWarning();
            this.transferPaperWallet = new jaxx.TransferPaperWallet();
            this.sweepPrivateKey = new jaxx.SweepPrivateKey();
            this.navigationToolMenuController = new jaxx.NavigationToolMenuController();
            this.privateKeyList = new jaxx.PrivateKeyList();
            this.intro = new jaxx.IntroPagesMain(jaxx.Registry.registry['JaxxUIIntro']);
            this.displayPairingCodeController = new jaxx.DisplayPairingCodeController();
            this.privateKeysViewController = new jaxx.PrivateKeysViewController();
            this.viewBackupPhraseController = new jaxx.ViewBackupPhraseController();
            this.pairRestoreWalletController = new jaxx.PairRestoreWalletController();
            this.exportPrivateKeysViewController = new jaxx.ExportPrivateKeysViewController();
            this.modalViewController = new jaxx.ModalViewController();
            jaxx.Registry.setFiatPriceController(this.fiatPriceController);
            jaxx.Registry.application$.on(jaxx.Registry.KILL_HISTORY, function () {
                _this.hideInitializeWallet();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, obj) {
                _this.activeCoin = obj.symbol;
            });
            jaxx.Registry.application$.on(jaxx.Registry.SHOW_INIT_WALLET, function () {
                _this.isWalletInitializing = true;
            });
            jaxx.Registry.application$.on(jaxx.Registry.HIDE_INIT_WALLET, function () {
                _this.isWalletInitializing = false;
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_START, function (evt, obj) {
                var ctr = jaxx.Registry.getCurrentCryptoController();
                if (!ctr || ctr.symbol !== obj.symbol) {
                    return;
                }
                _this.showInitializeWallet();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_DONE, function (evt, obj) {
                var ctr = jaxx.Registry.getCurrentCryptoController();
                if (!ctr || ctr.symbol !== obj.symbol) {
                    return;
                }
                _this.hideInitializeWallet();
                Navigation.flashBanner('Wallet Initialized!', 2, 'success', { close: false });
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_CONFIG_UPDATED, function () {
                if (!localStorage.getItem('useAppConfig')) {
                    location.reload();
                }
            });
            /*
                This is a UI only event triggered by the coin carousel. The Spinner activates transition-out and in
                animations on all wallet elements, while it also shows a spinning washed out coin in the middle.
            */
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_COIN_ACTIVATE_START, function (ev, coinToBeActivated) {
                //Deactivates itself with a timer until an app-wide event will be established
                _this.spinner.showSpinnerBySymbol(coinToBeActivated);
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE, function (ev, coinToBeActivated) {
                _this.spinner.showShapeShiftSpinnerBySymbol(coinToBeActivated);
            });
        };
        Application.prototype.setWakeApTimer = function () {
            var _this = this;
            var timeout = this.config.defaults.goSleep || 160000;
            $(document).on('mousedown', function () {
                console.log('Sleep Timer: ' + timeout / 1000 + ' s');
                clearTimeout(_this.wakeUpTimer);
                _this.wakeUpTimer = setTimeout(function () {
                    jaxx.Registry.application$.triggerHandler(jaxx.Registry.GO_SLEEP);
                }, timeout);
            });
            jaxx.Registry.application$.on(jaxx.Registry.GO_SLEEP, function () {
                console.log("-- SLEEP MODE --");
                $('.cssSuspendOverlay').remove();
                var overlay = $('<div>').addClass('cssSuspendOverlay').appendTo('body').click(function () {
                    overlay.remove();
                    jaxx.Registry.application$.triggerHandler(jaxx.Registry.WAKE_UP);
                });
                if (_this.isSleeping) {
                    return;
                }
                _this.isSleeping = true;
                jaxx.Registry.getAllCryptoControllers().forEach(function (ctr) {
                    ctr.goSleep();
                });
            });
            jaxx.Registry.application$.on(jaxx.Registry.WAKE_UP, function () {
                if (!_this.isSleeping) {
                    return;
                }
                _this.isSleeping = false;
                jaxx.Registry.getAllCryptoControllers().forEach(function (ctr) {
                    ctr.wakeUp();
                });
            });
        };
        Application.prototype.showInitializeWallet = function (ignoreAddressView) {
            $('#refresh-loading').hide();
            $('.initializingLoading').show().removeClass('cssStartHidden');
            $('#WalletFiatBalance').css("opacity", "0");
            $('.decimalPoint.cssDecimalPoint').hide();
            $('.decimalPortion cssDecimalPortion').hide();
            if (!ignoreAddressView) {
                $('#AddressView-address').text("-----");
                $('#CopyToClipboardBtn').css("opacity", "0");
            }
            $('#overlay').css({
                "height": "100%",
                "position": "absolute",
                "width": "100%",
                "z-index": "999999999999999"
            }).show();
            // Used to determine whether a coin is being loaded for the first time or simply switching to coins already initialized
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.WALLET_FIRST_INIT);
        };
        Application.prototype.hideInitializeWallet = function () {
            $('#refresh-loading').show();
            $('.initializingLoading').hide().addClass('cssStartHidden');
            $('#WalletFiatBalance').css("opacity", "1");
            $('#CopyToClipboardBtn').css("opacity", "1");
            $('.decimalPoint.cssDecimalPoint').show();
            $('.decimalPortion cssDecimalPortion').show();
            $('#overlay').css({
                "height": "initial",
                "position": "initial",
                "width": "initial",
                "z-index": "initial"
            }).hide();
        };
        Application.prototype.applicationReady = function () {
            if (this.isStart) {
                return;
            }
            this.isStart = true;
            $("#ApplicationStartScreen").fadeOut('fast', function () {
                $("#ApplicationStartScreen").remove();
            });
        };
        Application.prototype.showWallets = function () {
            jaxx.Registry.jaxxUI.generateSettingsCryptoCurrencyRows();
        };
        Application.prototype.switchToCoin = function (symbol) {
            jaxx.Registry.setCurrentControllerBySymbol(symbol);
        };
        Application.prototype.setSendButtonState = function (state) {
            switch (state) {
                case 'active':
                    $('.tabContent .amount .button').addClass('cssEnabled').addClass('enabled');
                    break;
                case 'disabled':
                    $('.tabContent .amount .button').removeClass('cssEnabled').removeClass('enabled');
                    break;
            }
        };
        return Application;
    }());
    jaxx.Application = Application;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=Application.js.map