var global_fiat_view; // used for testing in the dev console
var jaxx;
(function (jaxx) {
    /*
        This module depends on Registry.getCurrentCryptoController() and FiatPriceController
    */
    /**
     * This class controls the fiat amount in the main wallet view AND the quick fiat selector menu triggered by the round arrow next to the fiat balance.
     *
     * All the action happens at constructor(), init() and inside the event handlers that start with "on", look at those if you wnat ot understand what's going on
     */
    var FiatBalanceView = (function () {
        function FiatBalanceView() {
            var _this = this;
            this.outsideClickHandler = this.onOutsideClick.bind(this); //
            this.menu_item_tpl = '<tr class="cssCurrencyAdditionalElement quickFiatCurrencySelector cssCurrencyFirstElement {{highlighted}}" data-currency-code-value="{{fiat_code}}"> \
                <td class="fiatUnit cssFiatUnit">{{fiat_code}}</td>\
                <td class="covertedBalance cssConvertedBalance"> {{fiat_amount}}</td>\
             </tr>';
            this.menu_button_and_container_tpl = '<div id="FiatSelectorDropdown" class="displayCurrenciesSelectedArrow cssDisplayCurrenciesArrow">\
               <img id="FiatSelectorDropdownButton" class="cssStartHidden cssFlipped" src="images/arrowCircle.png" alt=""> \
               <div id="FiatSelectorDropDownMenu" class="wrapTableCurrencySelectionMenu cssWrapTableCurrencySelectionMenu cssList cssStartHidden"> \
                   <table class="cssTableFiatCurrencySelectionMenu" cellspacing="0" cellpadding="0"> \
                       <tbody id="FiatSelectorMenuBody" class="fiatCurrencySelectionMenu cssList cssFiatCurrencySelectionMenu"> \
                       \
                       </tbody>\
                   </table>\
               </div>\
              </div>';
            global_fiat_view = this;
            this.fiat_price_controller = jaxx.FiatPriceController.instance;
            this.$view = $('#FiatSelector');
            this.$amount = $('#WalletFiatAmount');
            this.$amountHolder = $('#WalletFiatBalance');
            this.$view.html(this.menu_button_and_container_tpl);
            // the code executed in the handler below depends on the DOM items being flushed
            // that's why we delay execution a bit
            setTimeout(function () {
                _this.$selector = $('#FiatSelectorDropdown');
                _this.$dropdown_button = $('#FiatSelectorDropdownButton');
                _this.$dropdown_menu = $('#FiatSelectorDropDownMenu');
                _this.$dropdown_menu_body = $('#FiatSelectorMenuBody');
                _this.init();
            }, 0);
        }
        FiatBalanceView.prototype.onNewCoinActivationStart = function (event, newCoinSymbol) {
            this.temporaryNewCoinSymbol = newCoinSymbol;
        };
        FiatBalanceView.prototype.onAboutToShowNewCoin = function (event) {
            if (this.temporaryNewCoinSymbol) {
                this.updatefiatWalletBalance(this.temporaryNewCoinSymbol);
            }
        };
        FiatBalanceView.prototype.init = function () {
            jaxx.Registry.application$.on(jaxx.Registry.ON_BALANCE_CHANGED, this.onCoinBalanceChange.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_BALANCE_RENDER, this.onCoinBalanceChange.bind(this));
            jaxx.Registry.walletValue$.on(jaxx.Registry.ON_WALLET_VALUE_CHANGE, this.onCoinBalanceChange.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_FIAT_MAIN_CURRENCY_CHANGE, this.onUserSelectedMainCurrencyChanges.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_ACTIVE_CURRENCIES_CHANGED, this.onUserSelectedCurrenciesChanges.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_INTERWALLET_ANIMATION_END, this.onAboutToShowNewCoin.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END, this.onAboutToShowNewCoin.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_COIN_ACTIVATE_START, this.onNewCoinActivationStart.bind(this));
            this.$amount.on('click', this.onFiatAmountClicked.bind(this));
            this.$dropdown_button.on('click', this.onQuickSelectorMenuArrowClick.bind(this));
            // manually trigger first ON_FIAT_MAIN_CURRENCY_CHANGE for initial display
            this.onUserSelectedMainCurrencyChanges();
            // manually trigger ON_ACTIVE_CURRENCIES_CHANGED
            this.onUserSelectedCurrenciesChanges();
            // manually polled until the event is implemented
            setInterval(this.onFiatPriceChange.bind(this), 35000);
            if (jaxx.Registry.iPhone) {
                // On iPhone devices the fiat selector drop-down needs special styling to align properly
                this.$selector.css("margin-right", "-26px");
            }
        };
        /** Only call after rendering menu items. */
        FiatBalanceView.prototype.setupMenuItemsEvents = function () {
            this.$dropdown_menu_body.children('tr').on('click', this.onQuickSelectorCurrencyClick.bind(this));
        };
        FiatBalanceView.prototype.fiatConvertAndPrepareForDisplay = function (fiatPriceController, coinBalance, coinSymbol, fiat_code) {
            var displayString = '--.--';
            var fiatAmount = "0";
            if (coinBalance === null || coinBalance === undefined) {
                return displayString;
            }
            fiatAmount = jaxx.FiatPriceController.coinToFiat(coinBalance, coinSymbol, fiat_code);
            // looks like the conversion gone wrong (maybe a provider issue)
            if (fiatAmount == "0" && Number(coinBalance) != 0) {
                return displayString;
            }
            if (fiatAmount != null) {
                var prefix = jaxx.FiatPriceController.getFiatUnitPrefix(fiat_code);
                fiatAmount = jaxx.Formatters.balanceForDisplay(fiatAmount, 2);
                displayString = prefix + jaxx.Formatters.formatFinancialNumber(fiatAmount);
                //displayString = prefix + String(Math.round(fiat_amount * 100) / 100);
            }
            return displayString;
        };
        FiatBalanceView.prototype.prepareConvertedFiatsForMenuItems = function (fiatPriceController) {
            var _this = this;
            var return_array = [];
            var current_crypto_ctrl = jaxx.Registry.getCurrentCryptoController();
            var active_coin_symbol = 'BTC'; // these are some safe defaults
            var raw_balance = "0"; //
            var coin_balance = null; // the null here will cause the dispalyed value to be '--.--'
            var user_activated_currencies = jaxx.FiatPriceController.instance.getActiveFiatCurrencies();
            var active_fiat_currency = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
            console.log(active_fiat_currency);
            if (current_crypto_ctrl) {
                active_coin_symbol = current_crypto_ctrl.symbol;
                raw_balance = current_crypto_ctrl.getBalance();
                coin_balance = current_crypto_ctrl.getBalanceDisplay(raw_balance);
            }
            console.log(user_activated_currencies);
            user_activated_currencies.forEach(function (currency_code) {
                console.log(currency_code);
                var is_active = currency_code.toLowerCase() == active_fiat_currency.toLowerCase() ? true : false;
                var display_fiat_amount = _this.fiatConvertAndPrepareForDisplay(_this.fiat_price_controller, coin_balance, active_coin_symbol, currency_code);
                return_array.push({
                    fiatCode: currency_code,
                    fiatValue: display_fiat_amount,
                    isHighlighted: is_active
                });
            });
            return return_array;
        };
        /** Empties the selector menu, then renders the items inside */
        FiatBalanceView.prototype.renderMenuItemsAndSetupEvents = function (items) {
            var _this = this;
            var items_html = '';
            this.$dropdown_menu_body.empty();
            if (items.length == 1) {
                this.$dropdown_button.hide();
                var w = $(window).width;
                var h = $(window).height;
                if (w > h) {
                    this.$amountHolder.css('padding-left', '26px');
                }
            }
            else {
                this.$dropdown_button.show();
                this.$amountHolder.css('padding-left', '0px');
            }
            items.forEach(function (item) {
                if (items_html.indexOf(item.fiatCode) < 0) {
                    //If duplicate item, don't render
                    items_html += renderItem(_this.menu_item_tpl, item.fiatCode, item.fiatValue, item.isHighlighted);
                }
                else {
                    //console.warn("DUPLICATE: " + item.fiatCode);
                }
            });
            this.$dropdown_menu_body.html(items_html);
            this.setupMenuItemsEvents();
            function renderItem(template, fiat_code, fiat_balance, isHighlighted) {
                var highlighted = isHighlighted ? FiatBalanceView.highlightClass : '';
                return template.replace('{{fiat_code}}', fiat_code) // until we find a more elegant solution
                    .replace('{{fiat_code}}', fiat_code) // we'll use two replace()-es for the 2 placeholders
                    .replace('{{fiat_amount}}', fiat_balance)
                    .replace('{{highlighted}}', highlighted);
            }
            if (items[0])
                this.fiat_price_controller.setActiveFiatCurrency(items[0].fiatCode);
        };
        /** Updates the main fiat balance (gray text under the coin balance in big orange text) and the fiat selector menu items */
        FiatBalanceView.prototype.updateMenuItemAmounts = function (coinBalance, coinSymbol) {
            var $menu_items = this.$dropdown_menu_body.children('tr');
            var self = this;
            $menu_items.each(function (index, item) {
                var fiat_code = item.getAttribute('data-currency-code-value');
                var $fiat_amount_holder = $(item).children('.covertedBalance');
                var converted_fiat_ammount = self.fiatConvertAndPrepareForDisplay(self.fiat_price_controller, coinBalance, coinSymbol, fiat_code);
                $fiat_amount_holder.text(converted_fiat_ammount);
            });
        };
        FiatBalanceView.prototype.updateSelectedMenuItem = function (fiatCode) {
            this.$dropdown_menu_body.children('.' + FiatBalanceView.highlightClass).removeClass(FiatBalanceView.highlightClass);
            this.$dropdown_menu_body.children('tr[data-currency-code-value="' + fiatCode + '"]').addClass(FiatBalanceView.highlightClass);
        };
        FiatBalanceView.prototype.updatefiatWalletBalance = function (updateCoinSymbol) {
            var current_crypto_controller;
            if (updateCoinSymbol) {
                current_crypto_controller = jaxx.Registry.getCryptoControllerBySymbol(updateCoinSymbol);
            }
            else {
                current_crypto_controller = jaxx.Registry.getCurrentCryptoController();
            }
            if (!current_crypto_controller)
                return;
            // set intermediate amount until the coin controller restored history
            if (current_crypto_controller.getHistoryTimestamp() === null) {
                this.$amount.text('0.00');
                return;
            }
            var raw_balance = current_crypto_controller.getBalance();
            var coin_balance = current_crypto_controller.getBalanceDisplay(raw_balance);
            var coin_symbol = current_crypto_controller.symbol;
            var newly_activated_currency = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
            var new_fiat_amount = this.fiatConvertAndPrepareForDisplay(this.fiat_price_controller, coin_balance, coin_symbol, newly_activated_currency);
            this.$amount.text(new_fiat_amount);
            this.updateMenuItemAmounts(coin_balance, coin_symbol);
        };
        FiatBalanceView.prototype.onQuickSelectorMenuArrowClick = function (e) {
            if (this.$dropdown_menu.css('display') == 'none') {
                this.$dropdown_button.removeClass('cssFlipped');
                this.$dropdown_menu.fadeIn(150);
                window.addEventListener('click', this.outsideClickHandler);
            }
            else {
                this.$dropdown_menu.fadeOut(150);
                this.$dropdown_button.addClass('cssFlipped');
                window.removeEventListener('click', this.outsideClickHandler);
            }
            e.stopImmediatePropagation();
        };
        /** When the fiat amount is clicked we cycle through user's active tokens */
        FiatBalanceView.prototype.onFiatAmountClicked = function (e) {
            var active_currencies = this.fiat_price_controller.getActiveFiatCurrencies();
            var current_active_currency = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
            var current_position = active_currencies.indexOf(current_active_currency);
            var new_position = current_position + 1;
            if (new_position >= active_currencies.length) {
                new_position = 0;
            }
            var new_currency_code = active_currencies[new_position];
            this.fiat_price_controller.setActiveFiatCurrency(new_currency_code);
        };
        FiatBalanceView.prototype.onOutsideClick = function (e) {
            this.$dropdown_menu.fadeOut(150);
            this.$dropdown_button.addClass('cssFlipped');
            window.removeEventListener('click', this.outsideClickHandler);
        };
        FiatBalanceView.prototype.onQuickSelectorCurrencyClick = function (e) {
            var new_currency_code = e.currentTarget.getAttribute('data-currency-code-value');
            if (new_currency_code && new_currency_code.length > 0) {
                this.fiat_price_controller.setActiveFiatCurrency(new_currency_code); // this will store the preference and trigger ON_FIAT_MAIN_CURRENCY_CHANGE which will cause the updates in the event handlers below
            }
        };
        /** The user selection of currencies changed */
        FiatBalanceView.prototype.onUserSelectedCurrenciesChanges = function () {
            var menu_items = this.prepareConvertedFiatsForMenuItems(this.fiat_price_controller);
            this.renderMenuItemsAndSetupEvents(menu_items);
            this.updatefiatWalletBalance();
        };
        /** Called when the main display currency was changed. That happens when the user clicks a item in the quick currency selector menu or when the user activates a new
         * currency. The event itself is triggered by FiatPriceController
         *
         * The main display currency - is the amount shown in a smaller gray text under the big orange coin balance in the wallet.
         */
        FiatBalanceView.prototype.onUserSelectedMainCurrencyChanges = function () {
            var newly_activated_currency = jaxx.FiatPriceController.instance.getActiveFiatCurrency();
            this.updatefiatWalletBalance();
            this.updateSelectedMenuItem(newly_activated_currency);
        };
        FiatBalanceView.prototype.onCoinBalanceChange = function () {
            this.updatefiatWalletBalance();
        };
        /** Called by a polling timer right now, in the future an event will be implemented */
        FiatBalanceView.prototype.onFiatPriceChange = function () {
            this.updatefiatWalletBalance();
        };
        return FiatBalanceView;
    }());
    FiatBalanceView.highlightClass = 'cssBlueHighlight'; // class used to mark the active item as highlighted
    jaxx.FiatBalanceView = FiatBalanceView;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=fiat-balance.js.map