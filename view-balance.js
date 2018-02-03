/**
 * Created by jnewlands on 2017-AUG-16.
 */
var jaxx;
(function (jaxx) {
    var BalanceView = (function () {
        function BalanceView() {
            // CSS should be ready while rendering HTML so put it first
            $('head').append('<link rel="stylesheet" href="js/app/view-balance/fiat-currency.css" type="text/css" />');
            this.$balanceView = $('#BalanceView');
            this.$balanceCoinUnit = $('#BalanceCoinUnit');
            this.$wholePortion = $('#wholePortion');
            this.$wholePortionValue = $('#wholePortionValue');
            this.$decimapPoint = $('#decimapPoint');
            this.$decimalPortionValue = $('#decimalPortionValue');
            this.$WalletFiatBalance = $('#WalletFiatBalance');
            this.fiatBalanceView = new jaxx.FiatBalanceView();
            this.init();
        }
        BalanceView.prototype.setUnknown = function () {
            this.$wholePortionValue.text('---');
            this.$decimalPortionValue.text('');
            this.$decimapPoint.text('');
            this.$wholePortionValue.css("margin-left", "0px");
            this.currentBalance = null;
        };
        BalanceView.prototype.onBalanceChanged = function () {
            var current = jaxx.Registry.getCurrentCryptoController();
            if (!current)
                return;
            var balance = current.getBalanceDisplay();
            if (balance === this.currentBalance)
                return;
            if (this.currentBalance && this.currentBalance !== '-1') {
                var precision = 0.00005;
                var delta = +balance - +this.currentBalance;
                if (delta > precision) {
                    //checks to see if wallet is in setup mode.
                    var wallet_setup = localStorage.getItem('wallet_setup');
                    if (wallet_setup && wallet_setup !== 'false') {
                        return;
                    }
                    Navigation.flashBanner('Payment Received!', 5, 'success');
                }
                else {
                    console.log('%c  delta ' + delta + ' less then precision ' + precision, 'color:orange');
                }
            }
            this.currentBalance = balance; // update the current balance
            this.renderBalance();
        };
        BalanceView.prototype.renderBalance = function () {
            if (this.currentBalance === undefined || this.currentBalance === null) {
                // get currentBalance, it is not available
                var current = jaxx.Registry.getCurrentCryptoController();
                this.currentBalance = current.getBalanceDisplay();
            }
            var balance = this.currentBalance;
            if (balance === '-1') {
                this.setUnknown();
                return;
            }
            balance = String(+balance);
            if (+balance < 0.00000001) {
                balance = '0.0';
            }
            var ar = balance.split('.');
            var wholePortion = ar[0];
            var cut = wholePortion.length > 3 ? 2 : 8;
            var decimalPortion = !!ar[1] ? ar[1].substr(0, cut) : '0';
            this.$wholePortionValue.text(wholePortion);
            this.$decimapPoint.text('.');
            this.$decimalPortionValue.text(decimalPortion);
            this.$WalletFiatBalance.css("opacity", 1);
            var w = $(window).width();
            if (wholePortion == "0" && decimalPortion == "0") {
                var wholePortionFontSize = this.$wholePortionValue.css("font-size");
                this.$wholePortionValue.css("margin-left", "0");
                this.$decimalPortionValue.css("font-size", wholePortionFontSize);
                if (w > 360) {
                    this.$wholePortion.css("padding-left", "0px");
                }
            }
            else {
                if (w <= 375) {
                    if ((decimalPortion.length > 5) && (wholePortion.length > 2)) {
                        this.$wholePortionValue.css("margin-left", "-0.27em");
                        this.$wholePortionValue.css("font-size", '19pt');
                        this.$decimalPortionValue.css("font-size", '16pt');
                        this.$wholePortionValue.css("margin-top", "0px");
                    }
                    else {
                        this.$wholePortionValue.css("margin-left", "0");
                        this.$wholePortionValue.css("font-size", '25pt');
                        this.$decimalPortionValue.css("font-size", '20pt');
                        this.$wholePortionValue.css("margin-top", "0px");
                    }
                    this.$wholePortion.css("padding-left", "0px");
                }
                else {
                    this.$wholePortionValue.css("font-size", this.originalWholePortion);
                    this.$decimalPortionValue.css("font-size", this.originalDecimalPortion);
                    this.$wholePortionValue.css("margin-left", "0");
                }
            }
            jaxx.Registry.application$.trigger(jaxx.Registry.ON_BALANCE_RENDER);
        };
        BalanceView.prototype.reset = function () {
            this.setUnknown();
        };
        BalanceView.prototype.setCoinUnit = function (coinSymbol) {
            this.$balanceCoinUnit.text(coinSymbol);
        };
        BalanceView.prototype.init = function () {
            var _this = this;
            var ctr = jaxx.Registry.getCurrentCryptoController();
            if (!ctr) {
                setTimeout(function () { return _this.init(); }, 500);
                return;
            }
            this.setCoinUnit(ctr.symbol);
            var temporaryNewCoinController;
            this.originalWholePortion = $('#wholePortionValue').css("font-size");
            this.originalDecimalPortion = $('#decimalPortionValue').css("font-size");
            this.$refreshBtn = $('.scriptAction.refresh').first();
            if (this.$refreshBtn.length == 0) {
                setTimeout(function () {
                    _this.$refreshBtn = $('.scriptAction.refresh').first();
                }, 1500);
                return;
            }
            this.renderBalance();
            jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_START, function () {
                _this.currentBalance = null;
                _this.setUnknown();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_DONE, function () {
                _this.currentBalance = null;
                _this.renderBalance();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, ctr) {
                _this.currentBalance = ctr.getBalanceDisplay(); // Changed from ctr.getBalance()
                _this.setCoinUnit(ctr.symbol);
                _this.renderBalance();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_BALANCE_CHANGED, function (evt, obj) {
                var ctr = jaxx.Registry.getCurrentCryptoController();
                if (!ctr || ctr.symbol !== obj.symbol)
                    return;
                _this.onBalanceChanged();
            });
            jaxx.Registry.application$.on(jaxx.Registry.WALLET_FIRST_INIT, function () {
                // To determine whether or not it is appropriate to show "Payment Received"
                // this.isWalletFirstInitialziation = true;
            });
        };
        return BalanceView;
    }());
    jaxx.BalanceView = BalanceView;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=view-balance.js.map