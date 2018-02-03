///<reference path="../com/models.ts"/>
// To investigate
// https://utils.jaxx.io/api/exchange/legacy/
//
// map function
// deferred
// put it into app
var jaxx;
(function (jaxx) {
    /**
     * Sets to local storage:
     * "FiatPriceController_fiat_currencies"
     * and
     * "FiatPriceController_coin_prices"
     *
     */
    var FiatPriceController = (function () {
        function FiatPriceController() {
            var _this = this;
            this.emitter$ = $({});
            FiatPriceController.instance = this;
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, ctr) {
                var symbol = ctr.config.symbol;
                //  console.warn(symbol);
                jaxx.Registry.jaxxUI.populateCurrencyList(symbol);
            });
            jaxx.Registry.application$.on(jaxx.Registry.GO_SLEEP, function (evt, ctr) {
                _this.stopInterval();
            });
            jaxx.Registry.application$.on(jaxx.Registry.WAKE_UP, function (evt, ctr) {
                _this.startInterval();
            });
            //this.last_update_from_server = Number(localStorage.getItem('FiatPriceController_last_update'));
        }
        /// stop autoupdate fiat price
        FiatPriceController.prototype.stopInterval = function () {
            clearInterval(this.timer);
        };
        //starts autoupdate fiat
        FiatPriceController.prototype.startInterval = function () {
            var _this = this;
            this.checkData();
            clearInterval(this.timer);
            var interval = this.config.fiatUpdateIntervalSec;
            // if update interval not set  setting minimum 30 sec
            if (!interval || interval < 30)
                interval = 30;
            this.timer = setInterval(function () { return _this.loadData(); }, interval * 1000);
        };
        FiatPriceController.prototype.init = function (config) {
            var _this = this;
            this.config = config['fiat'];
            //this.coin_cfg = config;
            setTimeout(function () { return _this.startInterval(); }, 5000);
        };
        FiatPriceController.prototype.setActiveFiatCurrencies = function (currencies) {
            this.activeCurrencies = currencies;
            localStorage.setItem('currencies_selected', JSON.stringify(currencies));
            jaxx.Registry.application$.trigger(jaxx.Registry.ON_ACTIVE_CURRENCIES_CHANGED, { currencies: currencies });
        };
        FiatPriceController.prototype.getActiveFiatCurrencies = function () {
            if (!this.activeCurrencies)
                this.activeCurrencies = JSON.parse(localStorage.getItem('currencies_selected') || '["USD"]');
            return this.activeCurrencies;
        };
        FiatPriceController.prototype.getActiveFiatCurrency = function () {
            if (!this.currentFiat)
                this.currentFiat = localStorage.getItem('fiat') || 'USD';
            return this.currentFiat;
        };
        /**
         * @param {string} newCurrencyCode - The currency code to be stored, for example "USD", "CAD", "EUR"
         */
        FiatPriceController.prototype.setActiveFiatCurrency = function (newCurrencyCode) {
            if (this.currentFiat === newCurrencyCode)
                return;
            this.currentFiat = newCurrencyCode;
            this.emitter$.triggerHandler(jaxx.Registry.ON_FIAT_MAIN_CURRENCY_CHANGE, newCurrencyCode);
            jaxx.Registry.application$.trigger(jaxx.Registry.ON_FIAT_MAIN_CURRENCY_CHANGE, newCurrencyCode);
        };
        /**
         * Converts the passed coin amount to the user active currency (the currency the user selects as main)
         * in a string ready for display.
         * Example input: ("1", "BTC") => "US$4,105"
         *
         * @param coinAmount - The amount of coin to be converted.
         * @param coinSymbol - The 3 letter symbol of the coin
         */
        FiatPriceController.coinToActiveDisplayFiat = function (coinAmount, coinSymbol) {
            var errorFiatValue = '--.--';
            var retVal = '';
            var activeFiatCurrencyCode = FiatPriceController.instance.getActiveFiatCurrency();
            var convertedAmount = FiatPriceController.coinToFiat(coinAmount, coinSymbol, activeFiatCurrencyCode);
            if (convertedAmount !== null) {
                convertedAmount = jaxx.Formatters.balanceForDisplay(convertedAmount, 2);
                convertedAmount = jaxx.Formatters.formatFinancialNumber(convertedAmount);
                retVal = FiatPriceController.prependFiatSymbolToString(activeFiatCurrencyCode, convertedAmount);
            }
            else {
                retVal = errorFiatValue;
            }
            return retVal;
        };
        FiatPriceController.fiatToCoin = function (fiat_value, fiat_code, symbol) {
            //   console.log(arguments);
            var data = FiatPriceController.instance.getData();
            var fiatValue = +fiat_value;
            if (isNaN(fiatValue)) {
                console.error('fiat_value NaN' + fiat_value);
                return '0';
            }
            var fiatPrice = data.fiat[fiat_code];
            if (!fiatPrice) {
                console.error(fiat_code + ' not available');
                console.log(Object.keys(data.fiat));
                return '0';
            }
            var coinPrice = data.coins[symbol];
            if (!coinPrice) {
                console.error(symbol + ' no price ');
                console.log(Object.keys(data.coins));
                return '0';
            }
            var out = fiatValue / coinPrice;
            return out.toFixed(8);
        };
        /**
         * Converts the given coins into the fiat currency specified
         *
         * @param {string} src_coin_value - The number value of the source coin to be converted
         * @param {string} src_coin_symbol - The type of coin given in src_coin_value. For example: 'BTC', 'LTC', 'ETH
         * @param {string} dst_fiat_code - The destination fiat code such as 'USD', 'EUR', 'CAD'
         *
         * @return {number} - Returns the converted value or 0 if the fiat currency is not supported
         *
         * TODO: src_coin_value should be a string
         */
        FiatPriceController.coinToFiat = function (coin_value, symbol, fiatCode) {
            var data = FiatPriceController.instance.getData();
            var coinValue = +coin_value;
            if (isNaN(coinValue))
                throw new Error(coin_value);
            var fiatPrice = data.fiat[fiatCode];
            if (!fiatPrice) {
                console.error(fiatCode + ' not available');
                console.log(Object.keys(data.fiat));
                return '0';
            }
            var coinPrice = data.coins[symbol];
            if (!coinPrice) {
                console.error(symbol + ' no price ');
                return '0';
            }
            var out = coinValue * fiatPrice * coinPrice;
            // console.log(out);
            return out.toFixed(2);
        };
        FiatPriceController.makeDisplayFiat = function (fiat_amount, fiat_code) {
            if (typeof fiat_amount === 'number') {
                fiat_amount = String(fiat_amount);
            }
            var displayString = '--.--';
            var currentCryptoController = jaxx.Registry.getCurrentCryptoController();
            var balance = currentCryptoController.getBalance();
            var currentCoinDisplayBalance = currentCryptoController.getBalanceDisplay();
            // jaxx.Registry.getCurrentCryptoController().getBalanceDisplay()
            // looks like the conversion gone wrong (maybe a provider issue)
            if (fiat_amount == "0" && currentCoinDisplayBalance != '0') {
                return '--.--';
            }
            if (fiat_amount != null) {
                var prefix = FiatPriceController.getFiatUnitPrefix(fiat_code);
                displayString = prefix + jaxx.Formatters.balanceForDisplay(fiat_amount, 2);
                //displayString = prefix + String(Math.round(fiat_amount * 100) / 100);
            }
            return displayString;
        };
        FiatPriceController.prependFiatSymbolToString = function (fiat_code, numberStr) {
            return FiatPriceController.fiatDictionary[fiat_code].prefix + numberStr;
        };
        FiatPriceController.prependCoinSymbolLetterToString = function (coinThreeLetterCode, amount) {
            var coinEntry = FiatPriceController.coinSymbolDirectory[coinThreeLetterCode.toUpperCase()];
            var prefix = "";
            if (coinEntry === undefined) {
                prefix = coinThreeLetterCode;
            }
            else {
                prefix = coinEntry.symbol;
            }
            var retVal = prefix + amount;
            return retVal;
        };
        FiatPriceController.displayFiatValue = function (fiat_amount) {
            var displayString = '--.--';
            var currentCryptoController = jaxx.Registry.getCurrentCryptoController();
            var balance = currentCryptoController.getBalance();
            var currentCoinDisplayBalance = currentCryptoController.getBalanceDisplay(balance);
            // jaxx.Registry.getCurrentCryptoController().getBalanceDisplay()
            // looks like the conversion gone wrong (maybe a provider issue)
            if (fiat_amount == 0 && Number(currentCoinDisplayBalance) != 0) {
                return '--.--';
            }
            if (fiat_amount != null && !isNaN(fiat_amount)) {
                // let prefix: string = FiatPriceController.getFiatUnitPrefix(fiat_code);
                displayString = jaxx.Formatters.balanceForDisplay(String(fiat_amount), 2);
                //displayString = prefix + String(Math.round(fiat_amount * 100) / 100);
            }
            return displayString;
        };
        FiatPriceController.listAllAvailableCurrencies = function () {
            return JSON.parse(localStorage.getItem('FiatPriceController_fiat_currencies'));
        };
        FiatPriceController.listAllAvailableCoins = function () {
            return JSON.parse(localStorage.getItem('FiatPriceController_coin_prices'));
        };
        // function  converts values received from string to numbers
        FiatPriceController.prototype.mapData = function (data) {
            var setNumbers = function (item) { for (var str in item)
                item[str] = +item[str]; };
            setNumbers(data.coins);
            setNumbers(data.fiat);
            data.timestamp = moment(data.createdAt).valueOf();
        };
        FiatPriceController.prototype.getFiatByCode = function (code) {
            return this.getFiat()[code];
        };
        FiatPriceController.prototype.getFiat = function () {
            return this.getData().fiat;
        };
        FiatPriceController.prototype.getCoins = function () {
            return this.getData().coins;
        };
        // if fiat data older then 5 min download new data
        FiatPriceController.prototype.checkData = function () {
            var data = this.getData();
            if (isNaN(data.timestamp) || !data.timestamp || (Date.now() - data.timestamp) > this.config.fiatUpdateIntervalSec * 1000) {
                this.loadData();
            }
            else {
                console.log(' diff ' + (Date.now() - data.timestamp) + ' need ' + this.config.fiatUpdateIntervalSec * 1000);
            }
        };
        FiatPriceController.prototype.getData = function () {
            if (!this.rawData) {
                var str = localStorage.getItem('currency-fiat-data');
                if (str) {
                    this.rawData = JSON.parse(str);
                }
                else
                    this.rawData = { coins: {}, fiat: {}, timestamp: 0, ver: '0' };
            }
            return this.rawData;
        };
        // loads fiat data from server
        FiatPriceController.prototype.loadData = function () {
            var _this = this;
            var url = this.config.aggregatedDataUrl;
            if (!url || url.length < 10) {
                console.error(' fiat configuration  "aggregatedDataUrl"  url not provided ');
                return;
            }
            $.getJSON(url).done(function (res) {
                if (res.fiat) {
                    _this.mapData(res);
                    console.log(' new data fiat ' + res.createdAt);
                    _this.rawData = res;
                    localStorage.setItem('currency-fiat-data', JSON.stringify(res));
                    _this.emitter$.triggerHandler(FiatPriceController.ON_UPDATED, res);
                    // console.log(res);
                }
            }).fail(function (err) {
                console.error(err);
            });
        };
        // used by UI to get prefix displayed in front of fiat value taken form fiatDictionary
        FiatPriceController.getFiatUnitPrefix = function (fiatUnit) {
            if (!fiatUnit)
                fiatUnit = FiatPriceController.instance.getActiveFiatCurrency();
            var fiatCurrency = FiatPriceController.fiatDictionary[fiatUnit];
            if (fiatCurrency === undefined) {
                return "XX$"; // Returns this when the currency symbol is not in the dictionary.
            }
            else {
                return fiatCurrency.prefix;
            }
        };
        return FiatPriceController;
    }());
    FiatPriceController.ON_UPDATED = 'ON_UPDATED';
    FiatPriceController.fiatDictionary = {
        "ARS": { "prefix": "AR$", "name": "Argentina Pesos" },
        "AUD": { "prefix": "AU$", "name": "Australian Dollar" },
        "BRL": { "prefix": "R$", "name": "Brazilian Real" },
        "CAD": { "prefix": "CA$", "name": "Canadian Dollar" },
        "CHF": { "prefix": "\u20A3", "name": "Swiss Franc" },
        "CLP": { "prefix": "CL$", "name": "Chilean Peso" },
        "CNY": { "prefix": "\u00A5", "name": "Chinese Yuan" },
        "CZK": { "prefix": "\u004b", "name": "Czech Republic Koruna" },
        "DKK": { "prefix": "kr", "name": "Danish Krona" },
        "EUR": { "prefix": "\u20AC", "name": "Euro" }
        //@note: @todo: @here: something was an issue here.. dan figures the prefix.
        /*,"FRA" : {"prefix" : "\u20A3", "name" : "French Franc"}*/
        ,
        "GBP": { "prefix": "\u00A3", "name": "British Pound" },
        "HKD": { "prefix": "HK$", "name": "Hong Kong Dollar" },
        "HUF": { "prefix": "\u0046", "name": "Hungarian Forint" },
        "IDR": { "prefix": "Rp", "name": "Indonesian Rupiah" },
        "ILS": { "prefix": "\u20AA", "name": "Israeli New Shekel" },
        "INR": { "prefix": "\u20B9", "name": "Indian Rupee" },
        "ISK": { "prefix": "kr", "name": "Icelandik Kroner" },
        "JPY": { "prefix": "\u00A5", "name": "Japanese Yen" },
        "KRW": { "prefix": "\u20A9", "name": "South Korean Won" },
        "MXN": { "prefix": "MX$", "name": "Mexican Peso" },
        "MYR": { "prefix": 'RM', "name": "Malaysian Myr" },
        "NOK": { "prefix": "kr", "name": "Norwegian Kroner" },
        "NZD": { "prefix": "NZ$", "name": "New Zealand Dollar" },
        "PHP": { "prefix": "\u20B1", "name": "Phillipine Peso" },
        "PKR": { "prefix": "\u20A8", "name": "Pakistani Rupee" },
        "PLN": { "prefix": "z\u0142", "name": "Polish Zlotty" },
        "RON": { "prefix": "RON", "name": "Romanian Leu" },
        "RUB": { "prefix": "\u20BD", "name": "Russian Ruble" },
        "SEK": { "prefix": "kr", "name": "Swedish Krona" },
        "SGD": { "prefix": "SG$", "name": "Singapore Dollar" },
        "THB": { "prefix": "\u0e3f", "name": "Thailand Baht" },
        "TRY": { "prefix": "t", "name": "Turkey Lira" },
        "TWD": { "prefix": "NT$", "name": "New Taiwan Dollar" },
        "USD": { "prefix": "US$", "name": "United States Dollar" },
        "ZAR": { "prefix": "\u0052", "name": "South African Rand" }
    };
    FiatPriceController.coinSymbolDirectory = {
        "BTC": { symbol: '\u0E3F' },
        "ETC": { symbol: '\u039E' },
        "ETH": { symbol: '\u039E' },
        "DASH": { symbol: '\u2145' },
        "DGE": { symbol: '\u00d0' },
        "DOGE": { symbol: '\u00d0' },
        "LSK": { symbol: '\u2C60' },
        "LTC": { symbol: '\u0141' },
        "RSK": { symbol: '\uc98c' },
        "ZEC": { symbol: '\u24E9' },
        "REP": { symbol: '\u024C' },
        "BCAP": { symbol: '\u024C' },
        "CVC": { symbol: '\u024C' },
        "DGX": { symbol: '\u024C' },
        "GNO": { symbol: '\u024C' },
        "GNT": { symbol: '\u024C' },
        "ICN": { symbol: '\u024C' },
        "SNGLS": { symbol: '\u024C' }
        //"DEFAULT": {symbol: '\u0966'}
        //"DEFAULT": {symbol: '\u1CC3'}
    };
    jaxx.FiatPriceController = FiatPriceController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=fiat-price-controller.js.map