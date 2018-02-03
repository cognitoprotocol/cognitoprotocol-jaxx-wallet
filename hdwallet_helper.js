var HDWalletHelper = function() {
   /* self = this;
    this._updateExchangeRateTime = 30*1000;
    this._exchangeRates = [];

    this._defaultEthereumGasPrice = thirdparty.web3.toWei(thirdparty.web3.toBigNumber('21'), 'shannon');
    this._defaultEthereumGasLimit = thirdparty.web3.toBigNumber(21000);
    this._recommendedEthereumCustomGasLimit = this._defaultEthereumGasLimit;
    this._currentEthereumCustomGasLimit = this._recommendedEthereumCustomGasLimit;*/

//    this._coinHDType = [];
//    this._coinHDType[COIN_BITCOIN] = 0;
//    this._coinHDType[COIN_ETHEREUM] = 60;
//    this._coinHDType[COIN_DASH] = 5;
//
//    //@note: unused for now, ethereum has no testnet node in SLIP 0044 as of yet.
//    this._coinHDTypeTestnetOffset = [];
//    this._coinHDTypeTestnetOffset[COIN_BITCOIN] = 1;
//    this._coinHDTypeTestnetOffset[COIN_ETHEREUM] = 131337;

    //this._exchangeRateListenerCallbacks = [];
  //  this._exchangeRatesHasChanged = {};
  //  this.unitsOfEther = new thirdparty.bnjs('1000000000000000000');
   // this.convertWeiToEtherCache = { Wei: 0 , Balance: 0 };
    //this.converEtherToWeiCache = { ether: 0 , Balance: 0 };
}

HDWalletHelper.etcEthSplitContractAddress = "0xaa1a6e3e6ef20068f7f8d8c835d2d22fd5116444";
HDWalletHelper.etcEthSplitOpCode = "0x0f2c9329";

HDWalletHelper.apiKeyEtherScan = "WGWHHAU4F2Y58UW5FQWTUJWSXBNHU7WBSX";

HDWalletHelper.baseInitialCryptoCurrencies = {
    "regular": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": true, "LTC": true, "LSK": false, "ZEC": false, "SBTC": true, "DOGE": false, "ICN": true, "GNT": true, "GNO": true, "SNGLS": false, "DGD": true, "BCAP": true, "CVC": true}//,
//    "ios": {"BTC": true, "ETH": true, "DAO": true, "DASH": false, "ETC": true}
}

HDWalletHelper.cryptoCurrenciesAllowed = {
    "regular": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": true, "LTC": true, "LSK": false, "ZEC": true, "SBTC": true, "DOGE": true, "ICN": true, "GNT": true, "GNO": true, "SNGLS": false, "DGD": true, "BCAP": true, "CVC": true},
    "ios": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": true, "LTC": true, "LSK": false, "ZEC": true, "SBTC": true, "DOGE": true, "ICN": true, "GNT": true, "GNO": true, "SNGLS": false, "DGD": true, "BCAP": true, "CVC": true}
}

HDWalletHelper.shapeShiftCryptoCurrenciesAllowed = {
    "regular": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": true, "LTC": true, "LSK": false, "ZEC": true, "SBTC": false, "DOGE": true, "ICN": true, "GNT": true, "GNO": true, "SNGLS": false, "DGD": false, "BCAP": false, "CVC": true},
}

HDWalletHelper.privateKeyCryptoCurrenciesAllowed = {
    "regular": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": false, "LTC": true, "LSK": false, "ZEC": true, "SBTC": true, "DOGE":true, "ICN": false, "GNT": false, "GNO": false, "SNGLS": false, "DGD": false, "BCAP": false, "CVC": true},
    "ios": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": false, "LTC": true, "LSK": false, "ZEC": true, "SBTC": true, "DOGE":true, "ICN": false, "GNT": false, "GNO": false, "SNGLS": false, "DGD": false, "BCAP": false, "CVC": true}
}

HDWalletHelper.paperWalletsCryptoCurrenciesAllowed = {
    "regular": {"BTC": true, "ETH": true, "DAO": false, "DASH": true, "ETC": true, "REP": false, "LTC": true, "LSK": false, "ZEC": true, "SBTC": false, "DOGE": false, "ICN": false, "GNT": false, "GNO": false, "SNGLS": false, "DGD": false, "BCAP": false, "CVC": true},
    "ios": {"BTC": true, "ETH": true, "DAO": false, "DASH": false, "ETC": true, "REP": false, "LTC": true, "LSK": false, "ZEC": false, "SBTC": false, "DOGE": false, "ICN": false, "GNT": false, "GNO": false, "SNGLS": false, "DGD": false, "BCAP": false, "CVC": true}
}
/*
HDWalletHelper.dictCryptoCurrency = { // @NOTE: This must match with the coinAbbreviatedName for the pouch implementation // @TODO: Refactor this later so 'index' isn't necessary
    "BTC" : {"prefix" : "\u0E3F", "name" : "Bitcoin", "bannerName": "BTC", "index" : 0}
    ,"ETH" : {"prefix" : "\u039E", "name" : "Ethereum", "bannerName": "ETH", "index" : 1}
    ,"DAO" : {"prefix" : "\u0110", "name" : "The DAO", "bannerName": "DAO", "index" : 2}
    ,"DASH" : {"prefix" : "\u2145", "name" : "Dash", "bannerName": "DSH", "index" : 3}
    ,"ETC" : {"prefix" : "\u039E", "name" : "Ethereum Classic", "bannerName": "ETC", "index" : 4}
    ,"REP" : {"prefix" : "\u024C", "name" : "Augur", "bannerName": "REP", "index" : 5}
    ,"LTC" : {"prefix" : "\u0141", "name" : "Litecoin", "bannerName": "LTC", "index" : 6}
    ,"LSK" : {"prefix" : "\u2C60", "name" : "Lisk", "bannerName": "LSK", "index" : 7}
    ,"ZEC" : {"prefix" : "\u24E9", "name" : "ZCash", "bannerName": "ZEC", "index" : 8}
    ,"SBTC" : {"prefix" : "\uc98c", "name" : "RSK Testnet", "bannerName": "RSK", "index" : 9}
    ,"DOGE" : {"prefix" : "\uc98c", "name" : "Doge", "bannerName": "DGE", "index" : 10}
    ,"ICN" : {"prefix" : "\u024C", "name" : "Iconomi", "bannerName": "ICN", "index" : 11}
    ,"GNT" : {"prefix" : "\u024C", "name" : "Golem", "bannerName": "GNT", "index" : 12}
    ,"GNO" : {"prefix" : "\u024C", "name" : "Gnosis", "bannerName": "GNO", "index" : 13}
    ,"SNGLS" : {"prefix" : "\u024C", "name" : "Singulardtv", "bannerName": "SNG", "index" : 14}
    ,"DGD" : {"prefix" : "\u024C", "name" : "DigixDAO", "bannerName": "DGD", "index" : 15}
    ,"BCAP" : {"prefix" : "\u024C", "name" : "BlockchainCapital", "bannerName": "BCP", "index" : 16}
    ,"CVC" : {"prefix" : "\u024C", "name" : "Civic", "bannerName": "CVC", "index" : 17}
};*/

/*HDWalletHelper.dictFiatCurrency = {
    "AUD" : {"prefix" : "AU$", "name" : "Australian Dollar"}
    ,"BRL" : {"prefix" : "R$", "name" : "Brazilian Real"}
    ,"CAD" : {"prefix" : "CA$", "name" : "Canadian Dollar"}
    ,"CHF" : {"prefix" : "\u20A3", "name" : "Swiss Franc"}
    ,"CLP" : {"prefix" : "CL$", "name" : "Chilean Peso"}
    ,"CNY" : {"prefix" : "\u00A5", "name" : "Chinese Yuan"}
    ,"CZK" : {"prefix" : "\u004b", "name" : "Czech Republic Koruna"}
    ,"DKK" : {"prefix" : "kr", "name" : "Danish Krona"}
    ,"EUR" : {"prefix" : "\u20AC", "name" : "Euro"}
    //@note: @todo: @here: something was an issue here.. dan figures the prefix.
    /!*,"FRA" : {"prefix" : "\u20A3", "name" : "French Franc"}*!/
    ,"GBP" : {"prefix" : "\u00A3", "name" : "British Pound"}
    ,"HKD" : {"prefix" : "HK$", "name" : "Hong Kong Dollar"}
    ,"HUF" : {"prefix" : "\u0046", "name" : "Hungarian Forint"}
    ,"IDR" : {"prefix" : "\u0052", "name" : "Indonesian Rupiah"}
    ,"ILS" : {"prefix" : "\u20AA", "name" : "Israeli New Shekel"}
    ,"INR" : {"prefix" : "\u20B9", "name" : "Indian Rupee"}
    ,"ISK" : {"prefix" : "kr", "name" : "Icelandik Kroner"}
    ,"JPY" : {"prefix" : "\u00A5", "name" : "Japanese Yen"}
    ,"KRW" : {"prefix" : "\u20A9", "name" : "South Korean Won"}
    ,"MXN" : {"prefix" : "MX$", "name" : "Mexican Peso"}
    ,"MYR" : {"prefix" : 'RM', "name" : "Malaysian Myr"}
    ,"NOK" : {"prefix" : "kr", "name" : "Norwegian Kroner"}
    ,"NZD" : {"prefix" : "NZ$", "name" : "New Zealand Dollar"}
    ,"PHP" : {"prefix" : "\u20B1", "name" : "Phillipine Peso"}
    ,"PKR" : {"prefix" : "\u20A8", "name" : "Pakistani Rupee"}
    ,"PLN" : {"prefix" : "z\u0142", "name" : "Polish Zlotty"}
    ,"RUB" : {"prefix" : "\u20BD", "name" : "Russian Ruble"}
    ,"SEK" : {"prefix" : "kr", "name" : "Swedish Krona"}
    ,"SGD" : {"prefix": "SG$", "name" : "Singapore Dollar"}
    ,"THB" : {"prefix" : "\u0e3f", "name" : "Thailand Baht"}
    ,"TRY" : {"prefix" : "t", "name" : "Turkey Lira"}
    ,"TWD" : {"prefix" : "NT$", "name" : "New Taiwan Dollar"}
    ,"USD" : {"prefix" : "US$", "name" : "United States Dollar"}
    ,"ZAR" : {"prefix" : "\u0052", "name" : "South African Rand"}
};*/

/*
HDWalletHelper.getFiatPrefixDictionary = function(){
    prefixDictionary = {}
    for (var key in HDWalletHelper.dictFiatCurrency) {
        if (HDWalletHelper.dictFiatCurrency.hasOwnProperty(key)) { // hasOwnProperty is needed because it's possible to insert keys into the prototype object of dictionary
            prefixDictionary[key] = HDWalletHelper.dictFiatCurrency[key]['prefix'];
        }
    }
    return prefixDictionary;
}

HDWalletHelper.getFiatNameDictionary = function(){
    prefixDictionary = {}
    for (var key in HDWalletHelper.dictFiatCurrency) {
        if (HDWalletHelper.dictFiatCurrency.hasOwnProperty(key)) { // hasOwnProperty is needed because it's possible to insert keys into the prototype object of dictionary
            prefixDictionary[key] = HDWalletHelper.dictFiatCurrency[key]['name'];
        }
    }
    return prefixDictionary;
}
*/
/*
HDWalletHelper.checkMnemonic = function() {
    //@note: @here: @todo: check for 12 word mnemonics.
    if (thirdparty.bip39.validateMnemonic(mnemonic)) {
        return true;
    } else {
        return false;
    }
}*/

HDWalletHelper.getNetworkTypeStringForCoinType = function(coinType, testNet) {
    //@note: @security: this should be using coin names etc. but for backwards compatibility it cannot.
    if (testNet) {
        return "-test";// + coinFullName[coinType];
    } else {
        return "-main";// + coinFullName[coinType];
    }
}

//HDWalletHelper.prototype.getHDCoinType = function(coinType, testNet) {
////    console.log("this._coinHDType :: " + this._coinHDType);
//    if (testNet) {
//        return this._coinHDType[coinType] + this._coinHDTypeTestnetOffset[coinType];
//    } else {
//        return this._coinHDType[coinType];
//    }
//}

/*
HDWalletHelper.getCurrencyUnitPrefix = function(currencyUnit) {
    var cryptoRef = HDWalletHelper.dictCryptoCurrency[currencyUnit]['prefix'];

    if (typeof(cryptoRef) === 'undefined' || crypto === null) {
        //var fiatRef = HDWalletHelper._dictFiatCurrency[currencyUnit];

        if (typeof(cryptoRef) === 'undefined' || crypto === null) {
        } else {
            return HDWalletHelper.getFiatUnitPrefix(currencyUnit);
        }
    } else {
        return HDWalletHelper.getCryptoUnitPrefix(currencyUnit);
    }

    return "XX$"; // Returns this when the currency symbol is not in the dictionary.
}

HDWalletHelper.getCryptoUnitPrefix = function (cryptoUnit) {
    if (cryptoUnit in HDWalletHelper.dictCryptoCurrency){
        return HDWalletHelper.dictCryptoCurrency[cryptoUnit]['prefix'];
    }
}

HDWalletHelper.getFiatUnitPrefix = function (fiatUnit) {
    if (fiatUnit in HDWalletHelper.getFiatPrefixDictionary()){
        return HDWalletHelper.getFiatPrefixDictionary()[fiatUnit];
    }
    return "XX$"; // Returns this when the currency symbol is not in the dictionary.
}

HDWalletHelper.getFiatUnitName = function (fiatUnit) {
    if (fiatUnit in HDWalletHelper.getFiatNameDictionary()){
        return HDWalletHelper.getFiatNameDictionary()[fiatUnit];
    }
    return "Unknown Currency"; // Returns this when the currency symbol is not in the dictionary.
}

HDWalletHelper.getDefaultRegulatedTXFee = function(coinType) {
    //@note: @here: @token: this seems necessary.

    if (coinType === COIN_BITCOIN) {
        return 20000;
    } else if (coinType === COIN_ETHEREUM){
        return HDWalletHelper.getDefaultEthereumGasPrice();
    } else if (coinType === COIN_ETHEREUM_CLASSIC) {
        return HDWalletHelper.getDefaultEthereumGasPrice();
    } else if (coinType === COIN_DASH) {
        return 20000;
    } else if (coinType === COIN_LITECOIN) {
        return 100000;
    } else if (coinType === COIN_LISK) {
        //@note: @here: @bug: @lisk: this is definitely wrong.
        return 100000;
    } else if (coinType === COIN_ZCASH) {
        return 10000;
    } else if (coinType === COIN_TESTNET_ROOTSTOCK) {
        return HDWalletHelper.getDefaultEthereumGasPrice();
    } else if (coinType === COIN_DOGE) {
        return 20000;
    }

    console.log("error :: HDWalletHelper.getDefaultRegulatedTXFee :: no value defined for coin type :: " + coinType);
    return 20000;
}
*/

//@note: these functions return BigNumber instances.

HDWalletHelper.getDefaultEthereumGasPrice = function() {
    return thirdparty.web3.toWei(thirdparty.web3.toBigNumber('21'), 'shannon');
};

HDWalletHelper.getDefaultEthereumGasLimit = function() {
    return thirdparty.web3.toBigNumber(21000);
}

HDWalletHelper.prototype.getRecommendedEthereumCustomGasLimit = function() {
    return this._recommendedEthereumCustomGasLimit;
}

HDWalletHelper.prototype.setRecommendedEthereumCustomGasLimit = function(recommendedEthereumCustomGasLimit) {
    this._recommendedEthereumCustomGasLimit = thirdparty.web3.toBigNumber(recommendedEthereumCustomGasLimit);
}

HDWalletHelper.prototype.getCustomEthereumGasLimit = function() {
    return this._currentEthereumCustomGasLimit;
}

HDWalletHelper.prototype.setCustomEthereumGasLimit = function(customEthereumGasLimit) {
//    console.log("ethereum :: update custom gas limit :: " + customEthereumGasLimit);
    this._currentEthereumCustomGasLimit = thirdparty.web3.toBigNumber(customEthereumGasLimit);
}

HDWalletHelper.prototype.compareToDustLimit = function(amount, unitType, compareToCustomGasLimit) {
    var compareAmount = amount;

    if (unitType === COIN_UNITLARGE) {
        compareAmount = HDWalletHelper.convertEtherToWei(amount);
    }

    var compareAmountA = thirdparty.web3.toBigNumber(compareAmount);

    var compareAmountB = HDWalletHelper.getDefaultEthereumGasLimit();

    compareAmountB = compareAmountB.mul((compareToCustomGasLimit) ? this.getCustomEthereumGasLimit() : HDWalletHelper.getDefaultEthereumGasLimit());

    if (compareAmountA.greaterThan(compareAmountB)) {
        return 1;
    } else if (compareAmountA.equals(compareAmountB)) {
        return 0;
    } else {
        return -1;
    }
}

HDWalletHelper.prototype.setup = function(updateExchangeRateTime) {
    this._updateExchangeRateTime = updateExchangeRateTime;
}


/*
HDWalletHelper.prototype._loadExchangeRates = function() {
    var exchangeRates = getStoredData("exchangeRates", false);
    exchangeRates = this.cleanStoredExchangeRates(exchangeRates);

    if (typeof(exchangeRates) !== 'undefined' && exchangeRates !== null) {
        this._exchangeRates = JSON.parse(exchangeRates);

        var numExistingExchangeData = this._exchangeRates.length;
        var createCount = COIN_NUMCOINTYPES - numExistingExchangeData;

        if (createCount > 0) {
            for (var i = 0; i < createCount; i++) {
                this._exchangeRates[numExistingExchangeData + i] = {};
            }
        }

        this._saveExchangeRates();

    }
*/
//}

HDWalletHelper.prototype.cleanStoredExchangeRates = function(exchangeRates){
    // This is written to clean old versions of the data. ie. This function exists because of a mistake.
    if (typeof(exchangeRates) !== 'undefined' && exchangeRates !== null){
        jsonExchangeRates = JSON.parse(exchangeRates);
        returnValue = [];

        for (var i = 0; i < jsonExchangeRates.length; i++){
            returnValue.push({});
            for (var key in jsonExchangeRates[i]){
                if (jsonExchangeRates[i].hasOwnProperty(key)) {
                    if (Array.isArray(jsonExchangeRates[i][key])){
                        returnValue[i][key] = jsonExchangeRates[i][key][0];
                    } else {
                        returnValue[i][key] = jsonExchangeRates[i][key];
                    }
                }
            }
        }
        return JSON.stringify(returnValue);
    } else {
        return exchangeRates;
    }

}

HDWalletHelper.prototype._saveExchangeRates = function() {
    storeData("exchangeRates", JSON.stringify(this._exchangeRates), false);
}

HDWalletHelper.prototype._notifyExchangeRateListeners = function(coinType) {
    console.error('Exchange Rate Log :: _notifyExchangeRateListeners called with coinType' + coinType);
    //@note: @todo: @optimization: this has abysmal performance, and only needs to be done if the screen is actually showing.
    for (var i = 0; i < this._exchangeRateListenerCallbacks[coinType].length; i++) {
        this._exchangeRateListenerCallbacks[coinType][i](coinType);
    }
    if (coinType === curCoinType) {
        var arrFiatUnitsUnfiltered = Object.keys(this._exchangeRatesHasChanged[coinType]);
        var arrAllowedFiatCurrencies = Object.keys(HDWalletHelper.dictFiatCurrency);
        var arrFiatUnits = [];
        for (var i = 0; i < arrFiatUnitsUnfiltered.length; i++) {
            if (arrAllowedFiatCurrencies.indexOf(arrFiatUnitsUnfiltered[i]) > -1){
                arrFiatUnits.push(arrFiatUnitsUnfiltered[i]);
            }
        }
        for (var i = 0; i < arrFiatUnits.length; i++) {
            var fiatUnit = arrFiatUnits[i];
            if (this._exchangeRatesHasChanged[coinType][fiatUnit]){
                var symbol = Registry.getCryptoControllerByCoinType(coinType).symbol;
                g_JaxxApp.getUI().populateExchangeRateInMainMenuCurrencyItem(symbol, fiatUnit);
                this._exchangeRatesHasChanged[coinType][fiatUnit] = false;
            }
        }
    }
}

HDWalletHelper.prototype.addExchangeRateListener = function(coinType, callback) {
    this._exchangeRateListenerCallbacks[coinType].push(callback);
}

HDWalletHelper.prototype.removeExchangeRateListener = function(coinType, callback) {
    for (var i = this._exchangeRateListenerCallbacks[coinType].length - 1; i >= 0; i--) {
        if (this._exchangeRateListenerCallbacks[coinType][i] === callback) {
            this._exchangeRateListenerCallbacks[coinType].splice(i, 1);
        }
    }
}


HDWalletHelper.prototype.getFiatUnit = function() {
    var fiatUnit = getStoredData('fiat');
    // if (HDWalletHelper.getFiatUnitPrefix(fiatUnit) === 'XX$') {
    //     fiatUnit = 'USD';
    // }
    return fiatUnit;
}

HDWalletHelper.prototype.setFiatUnit = function(fiatUnit) {
    storeData('fiat', fiatUnit);
}

HDWalletHelper.prototype.getFiatUnitPrefix = function() {
    return HDWalletHelper.getFiatUnitPrefix(this.getFiatUnit());
}

HDWalletHelper.prototype.hasFiatExchangeRates = function(coinType, fiatUnit) {
//        console.log("< checking for fiat exchange rates >");
    if (this._exchangeRates[coinType][fiatUnit]) {
//            console.log("< has fiat exchange rates >");
        return true;
    }
    //    console.log("< no fiat exchange rates >");

    return false;
}



/*HDWalletHelper.convertBitcoinsToSatoshis = function (bitcoins) {
    if (typeof(bitcoins) === 'string') {
        bitcoins = bitcoins.replace(/,/g, '');
    }

    var value = (new thirdparty.Decimal("100000000")).times(new thirdparty.Decimal(bitcoins));
    if (!value.isInteger()) {
        throw new Error("Wrong decimal number");
    }

    // @TODO: Make sure this fits in 53 bits

    return value.toNumber()
}*/

/**
 *  Convert satoshis to a string representing bitcoins.
 */
/*
HDWalletHelper.convertSatoshisToBitcoins = function(satoshis) {

    // Handle negative numbers
    var negative = '';
    if (satoshis < 0) {
        satoshis *= -1;
        negative = '-';
    }

    // prefix cents with place holder zeros
    var cents = '00000000' + (satoshis % 100000000)
    cents = cents.substring(cents.length - 8);

    // strip off excess zeros (keeping at least one)
    while (cents.charAt(cents.length - 1) === '0' && cents.length > 1) {
        cents = cents.substring(0, cents.length - 1);
    }

    // Round toward zero
    var whole = parseInt((satoshis / 100000000).toFixed(8));

    return negative + whole + '.' + cents;
}
*/

/**
 *  Wei->Ether
 */
var count = 0;
/*HDWalletHelper.convertWeiToEther = function(wei) {
    
    //if(wei && wei !== 0 && self.convertWeiToEtherCache.Wei == wei) {
    //    return self.convertWeiToEtherCache.Balance;
    //}

    //if(wei && self.convertWeiToEtherCache.Wei > 0) {
    if(wei > 0) {
        self.convertWeiToEtherCache.Wei = wei.toString();
        var balance = new thirdparty.bnjs(self.convertWeiToEtherCache.Wei);
        balance = balance.div(self.unitsOfEther); 
        //var balance = wei / 1000000000000000000;

        balance = self.isBigNumber(wei) ? balance : balance.toString(10);
        self.convertWeiToEtherCache.Balance = balance;
        return self.convertWeiToEtherCache.Balance;
        //return balance;
    } else { return 0; }
}

HDWalletHelper.prototype.isBigNumber = function (object) {
    return (object && object.constructor && object.constructor.name === 'BigNumber');
};*/
/**
 *  Ether->Wei
 */


/*
HDWalletHelper.convertEtherToWei = function(ether) {
    if(self.converEtherToWeiCache.ether === ether) {
        return self.converEtherToWeiCache.Balance;
    }
    self.converEtherToWeiCache.ether = ether;
    var balance =  new thirdparty.bnjs(self.converEtherToWeiCache.ether); 
    balance = balance.mul(self.unitsOfEther); //thirdparty.web3.toWei(ether, 'ether');

    balance = balance.toString(10);
    if (balance.indexOf('.') == -1) {
        balance += '.0';
    }
    self.converEtherToWeiCache.Balance = balance;
    return self.converEtherToWeiCache.Balance;
}
*/


HDWalletHelper.prototype.getBaseFiatDict = function(fiatUnit) {
    var baseFiatDict = {};

    if (typeof(fiatUnit) === 'undefined' || fiatUnit === null) {
        baseFiatDict.fiatUnit = this.getFiatUnit();
    } else {
        baseFiatDict.fiatUnit = fiatUnit;
    }

    baseFiatDict.prefix = HDWalletHelper.getFiatUnitPrefix(baseFiatDict.fiatUnit);

    return baseFiatDict;
}

HDWalletHelper.prototype.convertFiatValueToInternational = function(value, baseFiatDict) {
    var convertedValue = value;

    if (baseFiatDict.noPrefix) {
        //        value = value.toFixed(2);
        //        console.log("returning :: " + value)
        return convertedValue;
    }

    if (window.Intl) {
        var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: baseFiatDict.fiatUnit});
        // Cut front end until first digit and then append prefix.

        convertedValue = formatter.format(convertedValue);
        convertedValue = convertedValue.substring(convertedValue.indexOf(convertedValue.match(/\d/)), value.length); // This will cut the prefix off of 'value'.

        convertedValue = this.cleanCurrencyDisplayString(convertedValue, baseFiatDict.fiatUnit);

        // Do proper crop
        convertedValue = baseFiatDict.prefix + convertedValue; // This appends the prefix to the currency value.
        return convertedValue;
    }

    // Assertion: The user is running the program with an Apple device.
    if (['ISK', 'JPY', 'KRW'].indexOf(baseFiatDict.fiatUnit) >= 0) {
        convertedValue = convertedValue.toFixed(0); // No sub-currency so show currency as whole number.
    } else {
        convertedValue = convertedValue.toFixed(2); // No sub-currency so show currency as whole number.
    }

    var commified = convertedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    //    console.log("commified :: " + commified + " :: noPrefix :: " + noPrefix);
    return (baseFiatDict.noPrefix ? '': baseFiatDict.prefix) + commified;
}

/**
 *  Fiat conversion
 *
 *  Fiat will always be assumed to be a string, so math operations should not
 *  be attempted on them.
 */

HDWalletHelper.prototype.cleanCurrencyDisplayString = function(value, fiatUnit){
    var decimalPlacesInCurrency = 2;
    value.indexOf('.') > -1 ? value = value : value = value + '.';
    var decimalIndex = value.indexOf('.');

    if (['ISK', 'JPY', 'KRW'].indexOf(fiatUnit) >= 0) {
        decimalPlacesInCurrency = -1;
        //value = parseFloat(value).toFixed(0); // No sub-currency so show currency as whole number.
    } else {
        //value = parseFloat(value).toFixed(2); // No sub-currency so show currency as whole number.
    }

    if (value.length - 1 > decimalIndex + decimalPlacesInCurrency) {
        // When last position is beyond decimal places allowed in currency then remove digits.
        value = value.slice(0, decimalIndex + decimalPlacesInCurrency + 1);
    }
    while (value.length - 1 < decimalIndex + decimalPlacesInCurrency){
        // Pad with zeros.
        value = value + "0";
    }
    return value;
}

/*HDWalletHelper.prototype.convertFiatToSatoshis = function(fiatAmount, fiatUnit) {
    var rate = 0;

    if (typeof(fiatUnit) === 'undefined' || fiatUnit === null) {
        fiatUnit = this.getFiatUnit();
    }

    if (this._exchangeRates[COIN_BITCOIN][fiatUnit]) {
        rate = this._exchangeRates[COIN_BITCOIN][fiatUnit].last;
    }

    if (rate === 0) { return null; }

    // Amount is approximate anyways (since it is fiat exchange rate)
    return parseInt(100000000 * (fiatAmount / rate));
}*/

/*
HDWalletHelper.prototype.convertBitcoinLikeSmallUnitToFiat = function(coinType, satoshis, fiatUnit, noPrefix) {
    // wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_BITCOIN, 100000000, 'USD', false) // 
    var baseFiatDict = this.getBaseFiatDict(fiatUnit);
    baseFiatDict.noPrefix = noPrefix;

    var rate = 0;
    if (this._exchangeRates[coinType][baseFiatDict.fiatUnit]) {
        rate = this._exchangeRates[coinType][baseFiatDict.fiatUnit].last;
    }

    //    console.log("rate :: " + this._exchangeRates[COIN_BITCOIN][fiatUnit].last);

    var value = parseFloat(HDWalletHelper.convertSatoshisToBitcoins(satoshis)) * rate;

    var returnValue = this.convertFiatValueToInternational(value, baseFiatDict);

    //    console.log("fiatUnit :: " + fiatUnit + " :: prefix :: " + prefix + " :: satoshis :: " + satoshis + " :: value :: " + value);

    return returnValue;
}
*/

/*HDWalletHelper.prototype.convertFiatToBitcoinLikeSmallUnit = function(coinType, fiatAmount, fiatUnit) {
    //@note: @todo: @next: @merge:
//    return HDWalletHelper.convertCoinToUnitType(coinType, wallet.getHelper().convertFiatToBitcoinLikeSmallUnit(coinType, fiatAmount, fiatUnit), COIN_UNITLARGE);

    var rate = 0;

    if (typeof(fiatUnit) === 'undefined' || fiatUnit === null) {
        fiatUnit = this.getFiatUnit();
    }

    if (this._exchangeRates[coinType][fiatUnit]) {
        rate = this._exchangeRates[coinType][fiatUnit].last;
    }

    if (rate === 0) { return null; }

    // Amount is approximate anyways (since it is fiat exchange rate)
    return parseInt(100000000 * (fiatAmount / rate));
}*/
/*
HDWalletHelper.prototype.convertEthereumLikeSmallUnitToFiat = function(coinType, wei, fiatUnit, noPrefix) {
    var baseFiatDict = this.getBaseFiatDict(fiatUnit);
    baseFiatDict.noPrefix = noPrefix;

    var rate = 0;
    if (this._exchangeRates[coinType][baseFiatDict.fiatUnit]) {
        rate = this._exchangeRates[coinType][baseFiatDict.fiatUnit].last;
    }

    var value = parseFloat(HDWalletHelper.convertWeiToEther(wei)) * rate;
//    console.log("HDWalletHelper :: convertEthereumLikeSmallUnitToFiat :: fiatUnit :: " + fiatUnit + " :: noPrefix :: " + noPrefix + " :: wei :: " + wei + " :: value :: " + value);

    var returnValue = this.convertFiatValueToInternational(value, baseFiatDict);

     


    return returnValue;
}*/

//HDWalletHelper.prototype.convertDAOToFiat = function(dao, fiatUnit, noPrefix) {
//    if (typeof(fiatUnit) === 'undefined' || fiatUnit === null) {
//        fiatUnit = this.getFiatUnit();
//    }
//
//    var prefix = HDWalletHelper.getFiatUnitPrefix(fiatUnit);
//
//    var rate = 0;
//    if (this._exchangeRates[COIN_THEDAO_ETHEREUM][fiatUnit]) {
//        rate = this._exchangeRates[COIN_THEDAO_ETHEREUM][fiatUnit].last;
//    }
//
//    var value = parseFloat(dao) * rate; // parseFloat(HDWalletHelper.convertWeiToEther(wei)) * rate;
//
//    if (noPrefix) {
//        return value;
//    }
//
//    if (window.Intl) {
//        var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: fiatUnit});
//        // Cut front end until first digit and then append prefix.
//        value = formatter.format(value);
//        value = value.substring(value.indexOf(value.match(/\d/)), value.length); // This will cut the prefix off of 'value'.
//        value = this.cleanCurrencyDisplayString(value, fiatUnit);
//
//        value = prefix + value; // This appends the prefix to the currency value.
//        return value;
//    }
//
//    // Assertion: The user is running the program with an Apple device.
//    if (['ISK', 'JPY', 'KRW'].indexOf(fiatUnit) >= 0) {
//        value = value.toFixed(0); // No sub-currency so show currency as whole number.
//    } else {
//        value = value.toFixed(2); // Show currency to 2 decimal places.
//    }
//
//    var commified = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//
//    return (noPrefix ? '': prefix) + commified;
//}

/*
HDWalletHelper.prototype.convertFiatToWei = function(fiatAmount, fiatUnit) {
    var rate = 0;

    if (typeof(fiatUnit) === 'undefined' || fiatUnit === null) {
        fiatUnit = this.getFiatUnit();
    }

    if (this._exchangeRates[COIN_ETHEREUM][fiatUnit]) {
        rate = this._exchangeRates[COIN_ETHEREUM][fiatUnit].last;
    }

    if (rate === 0) { return null; }

    // Amount is approximate anyways (since it is fiat exchange rate)

    var wei = HDWalletHelper.convertEtherToWei(fiatAmount / rate);

    return wei;
}

HDWalletHelper.prototype.convertFiatToWeiClassic = function(fiatAmount, fiatUnit){
    var rate = 0;

    if (typeof(fiatUnit) === 'undefined' || fiatUnit === null) {
        fiatUnit = this.getFiatUnit();
    }

    if (this._exchangeRates[COIN_ETHEREUM_CLASSIC][fiatUnit]) {
        rate = this._exchangeRates[COIN_ETHEREUM_CLASSIC][fiatUnit].last;
    }

    if (rate === 0) { return null; }

    // Amount is approximate anyways (since it is fiat exchange rate)

    var wei = HDWalletHelper.convertEtherToWei(fiatAmount / rate);

    return wei;
}
*/

// Given an address or URI; identify coin type, address and optional amount.
/*HDWalletHelper.parseURI = function(uri) {
    if (!uri) { return null; }

    var result = {};

    var uriRemaining = uri;

    var comps = uriRemaining.split(':');
//    console.log("[a] parseURI :: comps :: " + comps + " :: uriRemaining :: " + uriRemaining);
    switch (comps.length) {
        // scheme:[//]address[?query]
        default:
            result.coin = comps[0];
            uriRemaining = comps[1];
            if (uriRemaining.substring(0, 2) === '//') {
                urlRemaining = urlRemaining.substring(2);
            }
            break;

        // address[?query]
        case 1:
            if (uriRemaining.match(/^((0x)?[0-9a-fA-F]{40}|XE)/)) {
                result.coin = 'ether';
            } else if (uriRemaining.match(/^[X][0-9a-zA-Z]{33}/)) {
                result.coin = 'dash';
            } else if (uriRemaining.match(/^[L][0-9a-zA-Z]{33}/)) {
                result.coin = 'litecoin';
            } else if (uriRemaining.match(/^[D][0-9a-zA-Z]{33}/)) {
                result.coin = 'doge';
            } else if (uriRemaining.match(/^[t1][0-9a-zA-Z]{34}/)) {
                result.coin = 'zcash';
            } else if (uriRemaining.match(/^[13]/)) {
                result.coin = 'bitcoin';
            }
            uriRemaining = comps[0];
            break;

        case 0:
            return null;
    }

    // address[?query]
    comps = uriRemaining.split('?');
    result.address = comps[0];

    switch (comps.length) {
        case 2:
            uriRemaining = comps[1];
            break;
        case 1:
            uriRemaining = '';
            break;
        case 0:
            return null;
        default:
            comps = comps.slice(0, 2);
    }

    console.log("[b] parseURI :: comps :: " + comps + " :: uriRemaining :: " + uriRemaining + " :: result :: " + JSON.stringify(result));


    //@note: @bug: this isn't coded correctly to detect duplicates of any type, and 'amount' could be the 2nd and 3rd parameters for example.

    // Parse out the amount (add other tags in the future); duplicate values is a FATAL error
    comps = uriRemaining.split('&');
    for (var i = 0; i < comps.length; i++) {
        var kv = comps[i].split('=');
        if (kv.length === 2 && kv[0] === 'amount') {
            if (result.amount) {
                console.log("error :: > 1 amount field detected"); //@note: adding this for debugging.
                return null;
            } else {
                result.amount = kv[1];
            }
        }
    }

    // IBAN is the format for ethereum
    if (result.coin === 'iban' || result.coin === 'ethereum') { result.coin = 'ether'; }
//    console.log(JSON.stringify(result));
    switch (result.coin) {
        case 'bitcoin':
            try {
                if (!thirdparty.bitcoin.address.fromBase58Check(result.address)) {
                    return null;
                }
            } catch (error) {
                return null;
            }
            break;
        case 'ether':
            if (result.address.match(/^0x[0-9a-fA-F]{40}$/)) {
                // Address is already prefxed hex

            } else if (result.address.match(/^[0-9a-fA-F]{40}$/)) {
                // Prefix the hex
                result.address = '0x' + result.address;

            } else if (result.address.substring(0, 2) === 'XE') {
                // ICAP address

                // Check the checksum
                var validICAP = false;
                thirdparty.iban.countries.XE = thirdparty.iban.countries.XE31;
                if (thirdparty.iban.isValid(result.address)) {
                    validICAP = true;
                } else {
                    thirdparty.iban.countries.XE = thirdparty.iban.countries.XE30;
                    if (thirdparty.iban.isValid(result.address)) {
                        validICAP = true;
                    }
                }

                if (!validICAP) { return null; }

                // Indirect encoded... Not supported yet (no namereg)
                if (result.address.substring(0, 7) === 'ETHXREG') {
                    return null;

                    // Direct or Basic encoded (should be true because it is valid iban)
                } else if (result.address.match(/^[A-Za-z0-9]+$/)) {

                    // Decode the base36 encoded address (removing the XE and checksum)
                    var hexAddress = (new thirdparty.bigi(result.address.substring(4), 36)).toString(16);

                    // Something terrible happened...
                    if (hexAddress.length > 40) { return null; }

                    // zero-pad
                    while (hexAddress.length < 40) { hexAddress = '0' + hexAddress; }

                    // Prefix the address
                    result.address = '0x' + hexAddress;

                } else {
                    return null;
                }

            } else {
                return null;
            }
            break;
        case 'dash':
            try {
                if (!thirdparty.bitcoin.address.fromBase58Check(result.address)) {
                    return null;
                }
            } catch (error) {
                return null;
            }
            break;
        case 'litecoin':
            try {
                if (!thirdparty.bitcoin.address.fromBase58Check(result.address)) {
                    return null;
                }
            } catch (error) {
                return null;
            }
            break;
        case 'zcash':
            try {
                if (!thirdparty.bitcoin.address.fromBase58Check(result.address)) {
                    return null;
                }
            } catch (error) {
                return null;
            }
            break;
        case 'dogecoin':
            try {
                if (!thirdparty.bitcoin.address.fromBase58Check(result.address)) {
                    return null;
                }
            } catch (error) {
                return null;
            }
            break;
        default:
            return null;
    }

    return result;
}

/*

 // Run some simple tsts to make sure parsing the URI works.
 var tests = [
 '1RicMooMWxqKczuRCa5D2dnJaUEn9ZJyn',
 'bitcoin:1RicMooMWxqKczuRCa5D2dnJaUEn9ZJyn',
 'bitcoin:1RicMooMWxqKczuRCa5D2dnJaUEn9ZJyn?amount=4.5',
 '1RicMooMWxqKczuRCa5D2dnJaUEn9ZJyn?amount=3.2',
 'XE235A6EOUWJWGG1NBXXJW2SXEB36T8J4W0',
 'iban:XE235A6EOUWJWGG1NBXXJW2SXEB36T8J4W0',
 'iban:XE235A6EOUWJWGG1NBXXJW2SXEB36T8J4W0?amount=7.8',
 'XE235A6EOUWJWGG1NBXXJW2SXEB36T8J4W0?amount=6.5',
 'iban:0x2d3976b32c17bd893f3c183e5dee872074475b80',
 '0x2d3976b32c17bd893f3c183e5dee872074475b80',

 '1RicMooMWxqKczuRCa5D2dnJaUEn9ZJy',
 'XE235A6EOUWJWGG1NBXXJW2SXEB36T8J4W',
 '0x2d3976b32c17bd893f3c183e5dee872074475b8',
 '1RicMooMWxqKczuRCa5D2dnJaUEn9ZJyn1',
 'XE235A6EOUWJWGG1NBXXJW2SXEB36T8J4W01',
 '0x2d3976b32c17bd893f3c183e5dee872074475b801',
 ];

 setTimeout(function() {
 for (var i = 0; i < tests.length; i++) {
 try {
 console.log('BAR', tests[i], JSON.stringify(HDWalletHelper.parseURI(tests[i])));
 } catch(error) {
 console.log(error.message);
 }
 }
 }, 1000);
 */


HDWalletHelper.hexify = function (value) {
    if (typeof(value) === 'number' || typeof(value) === 'string') {
        value = thirdparty.web3.toBigNumber(value);
    }

    var hex = value.toString(16);
    if (hex.length % 2) {
        hex = '0' + hex;
    }

    return new thirdparty.Buffer.Buffer(hex, 'hex');
}

HDWalletHelper.zeroPadLeft = function(text, length) {
    while(text.length < length) {
        text = '0' + text;
    }
    return text;
}

//    //@note:@here:@todo: wondering if it's actually necessary to execute after load.
HDWalletHelper.reformatICAPAddresses = function() {
    // Convert ICAP addresses (IBAN/BBAN)
    // https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol
//    console.log("thirdparty.iban :: " + thirdparty.iban + " :: thirdparty.iban.countries.XE30 :: " + thirdparty.iban.countries.XE30.countryCode);
    // @TODO: File a PR to expose addSpecification; for now, hijack
    thirdparty.iban.countries.XE30 = thirdparty.iban.countries.UA;
//    console.log("thirdparty.iban :: " + thirdparty.iban + " :: thirdparty.iban.countries.UA :: " + thirdparty.iban.countries.UA);

    delete thirdparty.iban.countries.UA;
    thirdparty.iban.countries.XE30.countryCode = 'XE';
    thirdparty.iban.countries.XE30.length = 34;
    thirdparty.iban.countries.XE30.structure = 'B30';

    thirdparty.iban.countries.XE31 = thirdparty.iban.countries.BE;
    delete thirdparty.iban.countries.BE;
    thirdparty.iban.countries.XE31.countryCode = 'XE';
    thirdparty.iban.countries.XE31.length = 35;
    thirdparty.iban.countries.XE31.structure = 'B31';
}


HDWalletHelper.getICAPAddress = function(data, forceBasic) {
//    if (thirdparty.iban.countries.UA) {
//        HDWalletHelper.reformatICAPAddresses();
//    }

    thirdparty.iban.countries.XE = thirdparty.iban.countries.XE30;
    if (thirdparty.iban.isValid(data)) {
        return data;
    }

    thirdparty.iban.countries.XE = thirdparty.iban.countries.XE31;
    if (thirdparty.iban.isValid(data)) {
        return data;
    }

    //        console.log("data :: " + data);
    // Get the raw hex
    if (data.substring(0, 2) === '0x' && data.length === 42) {
        data = data.substring(2);
    }

    // Make sure it is a valid address
    if (!data.match(/^[0-9a-fA-F]{40}$/)) { return null; }

    // 0 prefixed can fit in 30 bytes (otherwise, we require 31)
    var length = 31;
    if (data.substring(0, 2) === '00' && !forceBasic) {
        data = data.substring(2);
        length = 30
        thirdparty.iban.countries.XE = thirdparty.iban.countries.XE30;
    } else {
        thirdparty.iban.countries.XE = thirdparty.iban.countries.XE31;
    }

    // Encode as base36 and add the checksum
    var encoded = (new thirdparty.bigi(data, 16)).toString(36).toUpperCase();
    encoded = HDWalletHelper.zeroPadLeft(encoded, length);

    return thirdparty.iban.fromBBAN('XE', encoded);
}

HDWalletHelper.parseEthereumAddress = function(data) {

    // Standard address, we're done
    if (data.match(/^0x[0-9a-fA-F]{40}$/)) {
        //            console.log("found matching address :: " + data);
        return data;
    } else if (data.match(/^(0x[0-9a-fA-F]{40})$/)) {
        //            console.log("found matching address :: " + data);
        return data;
    } else if (data.match(/^ether:(0x[0-9a-fA-F]{40})$/)) {
        //            console.log("found matching address :: " + data);
        return data.substring(6);
    } else if (data.match(/^augur:(0x[0-9a-fA-F]{40})$/)) {
        
        //@note: from shapeshift reports.
        
        //            console.log("found matching address :: " + data);
        return data.substring("ether:");
    }

    // ICAP...
    if (data.substring(0, 2) === 'XE') {

        // Check the checksum
        var validICAP = false;
        thirdparty.iban.countries.XE = thirdparty.iban.countries.XE31;
        if (thirdparty.iban.isValid(data)) {
            validICAP = true;
        } else {
            thirdparty.iban.countries.XE = thirdparty.iban.countries.XE30;
            if (thirdparty.iban.isValid(data)) {
                validICAP = true;
            }
        }

        if (validICAP) {
            var encoded = data.substring(4);

            // Direct or Basic encoded
            if (encoded.match(/^[A-Za-z0-9]+$/)) {

                // Decode the base36 encoded address
                var hexAddress = (new thirdparty.bigi(encoded, 36)).toString(16);

                // Something terrible happened...
                if (hexAddress.length > 40) { throw new Error("Badness; this shouldn't happen"); }

                // zero-pad
                hexAddress = HDWalletHelper.zeroPadLeft(hexAddress, 40);

                // prepend the prefix
                return '0x' + hexAddress;

                // Indirect encoded... Not supported yet (no namereg)
            } else if (encoded.substring(0, 7) === 'ETHXREG') {
                return null;
            }
        }
    }

    return null;
}

HDWalletHelper.getEthereumAddressFromKey = function(privateKey) {
    //Lets re-use the already imported library ethutil-tx to avoid adding burden
    //Create a fake tx
    var mockupTxRaw = {
        nonce: HDWalletHelper.hexify(1),
        gasPrice: HDWalletHelper.hexify(thirdparty.web3.toBigNumber(thirdparty.web3.toWei(21, 'shannon')).toDigits(1)),
        gasLimit: HDWalletHelper.hexify(HDWalletHelper.getDefaultEthereumGasLimit()),
        to: "0xbac369f138d479abd45340e7735f80617a008ee7",
        value: HDWalletHelper.hexify(1),
    };

    var mockupTxR = new thirdparty.ethereum.tx(mockupTxRaw);
    //Sign with the private key

    mockupTxR.sign(privateKey);

    var addr = mockupTxR.getSenderAddress().toString('hex');
    if(addr){
        return '0x'+addr;
    } else {
        return null;
    }
}

//@note: ethereum checksum addresses. using web3 experimental branch logic.
HDWalletHelper.toEthereumChecksumAddress = function (address) {
    if (typeof address === 'undefined') return '';

    address = address.toLowerCase().replace('0x','');
    var addressHash = web3.sha3(address);
    var checksumAddress = '0x';

    for (var i = 0; i < address.length; i++ ) {
        // If ith character is 9 to f then make it uppercase
        if (parseInt(addressHash[i], 16) > 7) {
            checksumAddress += address[i].toUpperCase();
        } else {
            checksumAddress += address[i];
        }
    }
    return checksumAddress;
}

HDWalletHelper.isEthereumChecksumAddress = function(address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = web3.sha3(address.toLowerCase());

    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};

/*
HDWalletHelper.convertCoinToUnitType = function(coinType, coinAmount, coinUnitType) {
    var coinOtherUnitAmount = 0;

    //@note: @here: @token: this seems necessary.
    if (coinType === COIN_BITCOIN) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertSatoshisToBitcoins(coinAmount) : HDWalletHelper.convertBitcoinsToSatoshis(coinAmount);
    } else if (coinType === COIN_ETHEREUM) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertWeiToEther(coinAmount) : HDWalletHelper.convertEtherToWei(coinAmount);
    } else if (coinType === COIN_ETHEREUM_CLASSIC) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertWeiToEther(coinAmount) : HDWalletHelper.convertEtherToWei(coinAmount);
    } else if (coinType === COIN_THEDAO_ETHEREUM) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertWeiToEther(coinAmount) : HDWalletHelper.convertEtherToWei(coinAmount);
//        console.log("convert :: " + coinAmount + " :: " + coinOtherUnitAmount)
    } else if (coinType === COIN_DASH) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertSatoshisToBitcoins(coinAmount) : HDWalletHelper.convertBitcoinsToSatoshis(coinAmount);
    } else if (coinType === COIN_AUGUR_ETHEREUM || coinType === COIN_GOLEM_ETHEREUM || coinType === COIN_GNOSIS_ETHEREUM || coinType === COIN_ICONOMI_ETHEREUM || coinType === COIN_SINGULARDTV_ETHEREUM || coinType === COIN_BLOCKCHAINCAPITAL_ETHEREUM || COIN_CIVIC_ETHEREUM) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertWeiToEther(coinAmount) : HDWalletHelper.convertEtherToWei(coinAmount);
    } else if (coinType === COIN_DIGIX_ETHEREUM) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertWeiToEther(coinAmount) : HDWalletHelper.convertEtherToWei(coinAmount);
    } else if (coinType === COIN_LITECOIN) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertSatoshisToBitcoins(coinAmount) : HDWalletHelper.convertBitcoinsToSatoshis(coinAmount);
    } else if (coinType === COIN_LISK) {
        //@note: @here: @todo: @lisk:
//        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertSatoshisToBitcoins(coinAmount) : HDWalletHelper.convertBitcoinsToSatoshis(coinAmount);
    } else if (coinType === COIN_ZCASH) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertSatoshisToBitcoins(coinAmount) : HDWalletHelper.convertBitcoinsToSatoshis(coinAmount);
    } else if (coinType === COIN_TESTNET_ROOTSTOCK) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertWeiToEther(coinAmount) : HDWalletHelper.convertEtherToWei(coinAmount);
    } else if (coinType === COIN_DOGE) {
        coinOtherUnitAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertSatoshisToBitcoins(coinAmount) : HDWalletHelper.convertBitcoinsToSatoshis(coinAmount);
    }

    return coinOtherUnitAmount;
}

*/




HDWalletHelper.getCoinDisplayScalar = function(coinType, coinAmount, isFiat) {
    var scaledAmount = coinAmount;

    if (typeof(isFiat) === 'undefined' || isFiat === null || isFiat !== true) {
        if (coinType === COIN_THEDAO_ETHEREUM) {
            var scalar = thirdparty.web3.toBigNumber(100);
            scaledAmount = thirdparty.web3.toBigNumber(coinAmount).mul(scalar).toNumber();
        }
    }

    //    console.log("scaledAmount :: " + scaledAmount);

    return scaledAmount;
}

HDWalletHelper.toEthereumNakedAddress = function(address) {
    return address.toLowerCase().replace('0x', '');
}

HDWalletHelper.prototype.convertCoinToFiatWithFiatType = function(coinType, coinAmount, coinUnitType, fiatUnit, noPrefix) {

    if(!coinController){return}

    // wallet.getHelper().convertCoinToFiatWithFiatType(COIN_BITCOIN, 0.05, COIN_UNITSMALL, 'USD', true) // returns: 
    var fiatAmount = 0;
    var coinController = Registry.getCryptoControllerBySymbol(coinType);

    fiatAmount = jaxx.FiatPriceController.coinToFiat(coinAmount, coinController.symbol, fiatUnit);
    fiatAmount = Math.round(fiatAmount * 100) / 100;

    if (noPrefix == false)
    {
        var prefix_dict = HDWalletHelper.getFiatPrefixDictionary();
        var prefix = prefix_dict[fiatUnit];

        fiatAmount = prefix + String(fiatAmount);
    }
    
    return fiatAmount;

    /*if (coinType === COIN_BITCOIN) {
        var bitcoinAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertBitcoinsToSatoshis(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_BITCOIN, bitcoinAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ?  HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_ETHEREUM_CLASSIC) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ?  HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_ETHEREUM_CLASSIC, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_THEDAO_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_DASH) {
        var dashAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertBitcoinsToSatoshis(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_DASH, dashAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_AUGUR_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_AUGUR_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_ICONOMI_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_ICONOMI_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_GOLEM_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_GOLEM_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_GNOSIS_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_GNOSIS_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_SINGULARDTV_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_SINGULARDTV_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_DIGIX_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_DIGIX_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_BLOCKCHAINCAPITAL_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_BLOCKCHAINCAPITAL_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_CIVIC_ETHEREUM) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_CIVIC_ETHEREUM, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_LITECOIN) {
        var litecoinAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertBitcoinsToSatoshis(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_LITECOIN, litecoinAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_LISK) {
        //@note: @here: @todo: @lisk:
//        var litecoinAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertBitcoinsToSatoshis(coinAmount) : coinAmount;
//
//        fiatAmount = wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_LITECOIN, litecoinAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_ZCASH) {
        var zcashAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertBitcoinsToSatoshis(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_ZCASH, zcashAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_TESTNET_ROOTSTOCK) {
        var weiAmount = (coinUnitType === COIN_UNITLARGE) ?  HDWalletHelper.convertEtherToWei(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertEthereumLikeSmallUnitToFiat(COIN_TESTNET_ROOTSTOCK, weiAmount, fiatUnit, noPrefix);
    } else if (coinType === COIN_DOGE) {
        var dogeAmount = (coinUnitType === COIN_UNITLARGE) ? HDWalletHelper.convertBitcoinsToSatoshis(coinAmount) : coinAmount;

        fiatAmount = wallet.getHelper().convertBitcoinLikeSmallUnitToFiat(COIN_DOGE, dogeAmount, fiatUnit, noPrefix);
    } 
    //    console.log("convertCoinToFiat :: coinAmount :: " + coinAmount + " :: fiatAmount :: " + fiatAmount + " :: " + noPrefix);
    */

    //return fiatAmount;
}

HDWalletHelper.getDictCryptoCurrenciesAllowed = function(){
    var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.regular;
    }
    return cryptoCurrenciesAllowed;
}

HDWalletHelper.isCryptoCurrencyAllowed = function(coinType){
    // if (typeof(HDWalletPouch.getStaticCoinPouchImplementation(coinType)) !== 'undefined'){
    //     return this.getDictCryptoCurrenciesAllowed()[HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName];
    // } else {
        return false;
    // }
}
// privateKeyCryptoCurrenciesAllowed
HDWalletHelper.getDictPrivateKeyCryptoCurrenciesAllowed = function(){
    var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.privateKeyCryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.privateKeyCryptoCurrenciesAllowed.regular;
    }
    return cryptoCurrenciesAllowed;
}

// HDWalletHelper.isPrivateKeyCryptoCurrencyAllowed = function(coinType) {
    // if (typeof(HDWalletPouch.getStaticCoinPouchImplementation(coinType)) !== 'undefined'){
    //     return this.getDictPrivateKeyCryptoCurrenciesAllowed()[HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName];
    // } else {
    //     return false;
    // }
// }

HDWalletHelper.getDictPaperWalletsCryptoCurrenciesAllowed = function() {
    // 
    var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.paperWalletsCryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.paperWalletsCryptoCurrenciesAllowed.regular;
    }
    return cryptoCurrenciesAllowed;
}

HDWalletHelper.isPaperWalletCryptoCurrencyAllowed = function(coinType) {
   // if (typeof(HDWalletPouch.getStaticCoinPouchImplementation(coinType)) !== 'undefined'){
    //    return this.getDictPaperWalletsCryptoCurrenciesAllowed()[HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName];
   // } else {
        return false;
   // }
}

HDWalletHelper.getArrayPaperWalletCryptoCurrencyAllowed = function(){
    var allowedCryptoCurrencies = [];
    var keys = Object.keys(HDWalletHelper.getDictPaperWalletsCryptoCurrenciesAllowed());
    for (var i = 0; i < keys.length; i++){
        if (HDWalletHelper.isPaperWalletCryptoCurrencyAllowed(HDWalletHelper.dictCryptoCurrency[keys[i]].index)) {
            allowedCryptoCurrencies.push(keys[i]);
        }
    }
    return allowedCryptoCurrencies;
}

HDWalletHelper.isShapeshiftCryptoCurrencyAllowed = function(coinType){
    var dictShapeshiftCryptoCurrenciesAllowed = HDWalletHelper.shapeShiftCryptoCurrenciesAllowed.regular;
    return dictShapeshiftCryptoCurrenciesAllowed[HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName];
}