var jaxx;
(function (jaxx) {
    var CoinsListSetup = (function () {
        function CoinsListSetup(flag) {
            this.flag = flag;
            CoinsListSetup.instance = this;
            this.init();
        }
        /**
         * Initializes the coin list setup screen
         * @method init
         * */
        CoinsListSetup.prototype.init = function () {
            var _this = this;
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            this.$list = $('.coinList tbody');
            this.$list.each(function (item, list) {
                $(list).on('click', 'tr', function (evt) {
                    var row = $(evt.currentTarget);
                    //TO-DO -- Separate into function
                    var symbol = row.data('symbol');
                    if (!symbol)
                        return;
                    row.toggleClass('selected');
                    var selected = row.hasClass('selected');
                    var ctr = jaxx.Registry.getCryptoControllerBySymbol(symbol);
                    if (ctr)
                        ctr.enabled = selected;
                    else
                        console.error('cant get controller for ' + symbol);
                    var element = row.find('.cssSelectedCurrency .cssCircleUnchecked');
                    if (element) {
                        element.toggleClass('cssCurrencyisChecked');
                        jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_COIN_SATUS_CHANGED, [row.data('symbol'), element.hasClass('cssCurrencyisChecked')]);
                        console.log('controllers enabled ' + jaxx.Registry.getWalletsEnabledSorted().length);
                        if (jaxx.Registry.getWalletsEnabledSorted().length) {
                            console.error(_this.walletSetupTypeSelectedOption);
                            // (this.walletSetupTypeSelectedOption === "Express") ? $('.takeMeToWallet').show() : $('.btnCustomCurrencyContinue').show();
                            $('.takeMeToWallet').show();
                            $('.btnCustomCurrencyContinue').show();
                        }
                        else {
                            $('.takeMeToWallet').hide();
                            $('.btnCustomCurrencyContinue').hide();
                        }
                    }
                });
            });
            this.selectCurrency();
        };
        /**
         * Populates the coin list setup screen with appropriate coins and tokens
         * @method selectCurrency
         * @return void
         * */
        CoinsListSetup.prototype.selectCurrency = function () {
            this.walletSetupTypeSelectedOption = getStoredData("setUpTypeSelectedOption");
            this.$list.empty();
            var wallets = jaxx.Registry.getAllCryptoControllers();
            var html = '';
            wallets.forEach(function (wallet) {
                var coinAbbreviatedName = wallet.name;
                var coinFullDisplayName = wallet.displayName;
                var coinDisplaySymbol = wallet.threeLetterCode;
                var column1 = '<td  class="cssSelectedCurrency"><div class="cssCircleUnchecked"></div></td>';
                var imageReference;
                var isExtension = PlatformUtils.extensionCheck();
                var isDesktop = PlatformUtils.desktopCheck();
                if (!isExtension && !isDesktop) {
                    imageReference = encodeURIComponent(wallet.icon);
                }
                else {
                    imageReference = wallet.icon;
                }
                var hueRotation = wallet.hueRotate;
                var column3 = '<td class="coinIcon cssCoinIcon cssImageLogoIcon cssHighlighted" style="background: url(' + imageReference + ') center center no-repeat; filter: hue-rotate(' + hueRotation + 'deg)"><div class="image"></div></td>';
                var column4 = '<td class="coinLabel cssCoinLabel">' + coinDisplaySymbol + ' - ' + coinFullDisplayName + '</td>';
                var tr = '<tr data-symbol="' + wallet.symbol + '" class="cssOpacity cssCoinCurrency scriptAction coinType' + coinAbbreviatedName + " " + '" specialAction="selectCoinOptionExpress" value="' + coinAbbreviatedName + '">' + column1 + column3 + column4 + '</tr>';
                html += tr;
                wallet.enabled = false;
            });
            this.$list.html(html);
        };
        return CoinsListSetup;
    }());
    jaxx.CoinsListSetup = CoinsListSetup;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=pages-wallet-settings.js.map