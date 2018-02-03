var jaxx;
(function (jaxx) {
    var NavigationToolMenuController = (function () {
        function NavigationToolMenuController() {
            var _this = this;
            this.active_fiat_currency_code = "USD"; // this will have to be replaced by what is selected in the balance view
            this.fiat_price_controller = jaxx.FiatPriceController.instance;
            this.$view = $('#menu');
            this.$view.load('js/app/navigation-tool-menu/navigation-tool-menu.html', "", function () {
                setTimeout(function () {
                    _this.init();
                }, 1000);
            });
        }
        NavigationToolMenuController.prototype.init = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            //Registry.application$.on(Registry.ON_COIN_ACTIVATED, this.onCoinChange.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_FIAT_MAIN_CURRENCY_CHANGE, this.updateFiatValueIfCurrencyActive.bind(this));
            this.$currency_tab = $('#CurrenciesMenuTab');
            this.$coin_exchange_value = $('.mainMenuCurrencies span.exchangeRate');
            this.$coin_symbol = $('.mainMenuCurrencies span.exchangeRateAbbreviatedUnit');
            this.attachClickEvents();
            this.$currency_tab.click(this.updateUITopFiatValueOfCoinToActiveFiatCurrency.bind(this));
        };
        NavigationToolMenuController.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        NavigationToolMenuController.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        // Called by JaxxUI.prototype.openMainMenu() from jaxx_ui.js
        // and by ON_FIAT_MAIN_CURRENCY_CHANGE event
        NavigationToolMenuController.prototype.updateFiatValueIfCurrencyActive = function () {
            if (this.$currency_tab.hasClass('cssSelected')) {
                this.updateUITopFiatValueOfCoinToActiveFiatCurrency();
            }
        };
        /** Updates the Fiat value of 1 coin unit shown in the CURRENCY tools menu */
        NavigationToolMenuController.prototype.updateUITopFiatValueOfCoinToActiveFiatCurrency = function () {
            var coin_fiat_value = "0";
            var coin_symbol = '';
            var active_crypto = jaxx.Registry.getCurrentCryptoController();
            if (active_crypto) {
                coin_symbol = active_crypto.symbol;
            }
            var active_fiat_currency_code = jaxx.Registry.application.fiatPriceController.getActiveFiatCurrency();
            var prefix = jaxx.FiatPriceController.getFiatUnitPrefix(active_fiat_currency_code);
            coin_fiat_value = jaxx.FiatPriceController.coinToFiat("1", coin_symbol, active_fiat_currency_code);
            if (coin_fiat_value == null) {
                coin_fiat_value = "0";
            }
            coin_fiat_value = jaxx.Formatters.balanceForDisplay(coin_fiat_value, 2);
            this.$coin_symbol.text(coin_symbol);
            this.$coin_exchange_value.text(prefix + String(coin_fiat_value));
        };
        /** Writes the config file information to the Hamburger menu DOM (can be seen in Menu > About) */
        NavigationToolMenuController.prototype.updateUIConfigInformation = function (configVer, updateTimeStamp, isUsingLocalConfigFile) {
            var template = "v{{configVersion}} retrieved: {{updateDate}} {{updateTime}}";
            var $configInfoDomElm = $('#ConfigInfo');
            var uiConfigVersion = "N/A";
            var uiUpdateTime = "";
            var uiUpdateDate = "pending";
            if (configVer && configVer['length'] && configVer.length > 0) {
                uiConfigVersion = configVer;
            }
            if (updateTimeStamp && isNaN(updateTimeStamp) === false && updateTimeStamp !== 0) {
                uiUpdateDate = moment(Number(updateTimeStamp)).format('MMM DD YYYY');
                uiUpdateTime = moment(Number(updateTimeStamp)).format('hh:mm A');
            }
            if (isUsingLocalConfigFile) {
                template = template.replace('{{updateDate}} {{updateTime}}', 'using local file');
            }
            var renderedHtml = template.replace('{{configVersion}}', configVer)
                .replace('{{updateDate}}', uiUpdateDate)
                .replace('{{updateTime}}', uiUpdateTime);
            $configInfoDomElm.html(renderedHtml);
        };
        return NavigationToolMenuController;
    }());
    jaxx.NavigationToolMenuController = NavigationToolMenuController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=navigation-tool-menu-controller.js.map