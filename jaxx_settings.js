var JaxxAppSettings = function() {
    this._permanentSettings = {'_someExampleSetting' : null};
    //this._isPermanentSettingEncrypted = {'_someExampleSetting' : false}; // false by default
    this._permanentSettingValueLoadedIfNotStored = {};
    
    this._defaultCoinType = COIN_BITCOIN;

	this._currentShapeshiftTarget = {}; // Should be something like {'BTC' : 'ETH', 'ETH' : 'DSH'...}

	this._currencyAtPosition = []; // this._currencyAtPosition[0] is the top-most currency in the list.
	this.__cryptoCurrencyAtPosition = [];
	this._cryptoCurrencyIsEnabled = {};
	this._bannerFirstCryptoCurrency = ''; // Should be BTC or something.
    
    this._shouldLoadFromBackupIntroPosition = false;
    
    this._ignoreEtcEthSplit = false;
    
    this._pagesWhereBackButtonIsDisabled = ['backupMnemonicCustomIntroOption', 'viewMnemonicCustomIntroOption', 'pageSetupSecurityPinCode', 'changePinCodeCustomIntroOption', 'confirmPinCodeCustomIntroOption', 'pressContinuePairDevices'];
    this._pagesWhereBackButtonExitsApplication = ['pageTermsOfService', 'splash'];
    
    //
}

JaxxAppSettings.prototype.storeAllPermanentSettings = function() {
    var arraySettingsNames = Object.keys(this._permanentSettings);
    for (var i = 0; i < arraySettingsNames.length; i++){
        this.storePermanentSetting(arraySettingsNames[i]);
    }
}

JaxxAppSettings.prototype.loadAllPermanentSettings = function(){
    var arraySettingsNames = Object.keys(this._permanentSettings);
    for (var i = 0; i < arraySettingsNames.length; i++){
        this.loadPermanentSetting(arraySettingsNames[i]);
    }    
}

JaxxAppSettings.prototype.storePermanentSetting = function(strSettingName){
    // TODO: Add encryption functionality
    storeData(strSettingName, JSON.stringify(this._permanentSettings[strSettingName]), false);
    return JSON.stringify(this._permanentSettings[strSettingName]);
}

JaxxAppSettings.prototype.loadPermanentSetting = function(strSettingName){
    var storedValue = getStoredData(strSettingName, false);
    if (typeof(storedValue) !== 'undefined' && storedValue !== null){
        this._permanentSettings[strSettingName] = JSON.parse(storedValue);
    } else {
        if (typeof(this._permanentSettingValueLoadedIfNotStored[strSettingName]) !== 'undefined' && this._permanentSettingValueLoadedIfNotStored[strSettingName] !== null){
            this._permanentSettings[strSettingName] = this._permanentSettingValueLoadedIfNotStored[strSettingName];
        }
    }
}

// This function is used externally.
JaxxAppSettings.prototype.getSetting = function(strSettingName){
    var storedValue = this._permanentSettings[strSettingName];
    if (typeof(storedValue) === 'undefined' || storedValue === null) {
        this.loadPermanentSetting(strSettingName);
        var storedValue = this._permanentSettings[strSettingName];
    }
    return storedValue;
}

// This function is used externally.
JaxxAppSettings.prototype.setSetting = function(strSettingName, objNewValue){
    this._permanentSettings[strSettingName] = objNewValue;
    return this.storePermanentSetting(strSettingName); 
}

JaxxAppSettings.prototype.setting = function(strSettingName, objNewValue){
    // First parameter is the name of the setting.
    // Second parameter optional. Included if you want to change the setting to a new value.
    if (typeof(objNewValue) !== 'undefined' && objNewValue !== null){
        this.setSetting(strSettingName, objNewValue);
    }
    return this.getSetting(strSettingName);
}

JaxxAppSettings.prototype.isBackButtonDisabledOnPage = function(strPageName){
    return this._pagesWhereBackButtonIsDisabled.indexOf(strPageName) > -1;
}

JaxxAppSettings.prototype.isBackButtonExitApplication = function(strPageName){
    return this._pagesWhereBackButtonExitsApplication.indexOf(strPageName) > -1;
}

JaxxAppSettings.prototype.initialize = function() {
    this.initializeCryptoCurrencySettingsData();
   /* var storedDefaultCoinType = getStoredData('JaxxApp_Settings_DefaultCoinType',false);
    if(jaxx.Utils2.getSeed()) {
        this.initializeCryptoCurrencySettingsData();
        //    console.log("_defaultCoinType :: " + this._defaultCoinType);

        var storedIgnoreEtcEthSplit = getStoredData('JaxxApp_Settings_IgnoreEtcEthSplit',false);

        if (typeof(storedIgnoreEtcEthSplit) !== 'undefined' && storedIgnoreEtcEthSplit !== null && storedIgnoreEtcEthSplit === 'true') {
            this._ignoreEtcEthSplit = true;
        } else {
            this._ignoreEtcEthSplit = false;
        }

        this.setupDefaultMiningOptions();
    }
*/
}

JaxxAppSettings.prototype.getDefaultCoinType = function() {
    return this._defaultCoinType;
}

JaxxAppSettings.prototype.setDefaultCoinType = function(defaultCoinType) {
    console.error('JaxxAppSettings.prototype.setDefaultCoinType');
    this._defaultCoinType = defaultCoinType;
    //    console.log("setting default coin type :: " + this._defaultCoinType);
    //storeData('JaxxApp_Settings_DefaultCoinType', this._defaultCoinType);
}

/*JaxxAppSettings.prototype.getCurrencyAtPosition = function(index) {
	return this._currencyAtPosition[index];
}*/
/*
JaxxAppSettings.prototype.isCurrencyListPositionValid = function() {
	// Returns true if every currency in the app is contained in the list once and only once.
	return false;
}*/

/*JaxxAppSettings.prototype.getCurrencyPositionList = function(){
	return this._currencyAtPosition;
}*/

JaxxAppSettings.prototype.setCurrencyPositionList = function(arrayCurrencyPositionList){
	this._currencyAtPosition = arrayCurrencyPositionList;
	this.setDefaultCurrencyFromPositionList();
	storeData('currencies_position_order', JSON.stringify(this._currencyAtPosition));
}

//@note: @todo: @here: add default currencies list to this class.

/*
JaxxAppSettings.prototype.getListOfShapeshiftCoins = function(coinType) {
	// Returns the list of shapeshift coins for the menu when the user clicks on the arrow for the shapeshift feature.
	// Parameter: coinType is 'BTC' or 'ETH' etc.
	var returnList = Object.keys(HDWalletHelper.dictCryptoCurrency);
    
    var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.regular;
    }
    
    var shapeShiftCryptoCurrenciesAllowed = HDWalletHelper.shapeShiftCryptoCurrenciesAllowed.regular;

    for (var index in returnList) {
        var key = returnList[index];
        if (typeof(cryptoCurrenciesAllowed[key]) === 'undefined' ||
            cryptoCurrenciesAllowed[key] === null ||
            cryptoCurrenciesAllowed[key] === false ||
            typeof(shapeShiftCryptoCurrenciesAllowed[key]) === 'undefined' ||
            shapeShiftCryptoCurrenciesAllowed[key] === null ||
            shapeShiftCryptoCurrenciesAllowed[key] === false)
        {
            delete returnList[index];
        }
    }
    
	var index = returnList.indexOf(coinType);
	if (index > -1){
		returnList.splice(index, 1);
	}
    
//    var returnListKeys = Object.keys(returnList);
//    var reducedReturnList = {};
//
//    for (var i = 0; i < returnListKeys.length; i++) {
//        reducedReturnList[i] = returnList[returnListKeys[i]];
//    }
    
//    return reducedReturnList;
    return returnList;
}

JaxxAppSettings.prototype.initializeShapeshiftTargets = function(){
	// @TODO: 
	var coinList = HDWalletHelper.dictCryptoCurrency;
	var coins = Object.keys(HDWalletHelper.dictCryptoCurrency);
	for (var i = 0; i < coins.length; i++){
        var targetCoinName = this.getListOfShapeshiftCoins(coins[i])[0];
        if (typeof(targetCoinName) === 'undefined' && targetCoinName === null){
			console.log('Error: Cannot get a suitable coin for the shapeshift functionality.')
			targetCoinName = coins[i];
		}
        this._currentShapeshiftTarget[coins[i]] = targetCoinName;
	}
}
	
JaxxAppSettings.prototype.getShapeshiftCoinTarget = function(coinName) {
    return this._currentShapeshiftTarget[coinName];
}

JaxxAppSettings.prototype.setShapeshiftCoinTarget= function(coinName, targetCoinName) {
    this._currentShapeshiftTarget[coinName] = targetCoinName;
}
*/

JaxxAppSettings.prototype.setCurrencyPosition = function(currencyType, newIndex) {
	// Pushes currency to new position and readjusts the position of the other currencies.	
	oldIndex = this._currencyAtPosition.indexOf(currencyType);
	this._currencyAtPosition.splice(oldIndex, 1); // Deletes the currency entry from the array.
	this._currencyAtPosition.splice(newIndex, 0, currencyType); // Adds the currency entry to the new position.
	// @TODO: Throw error if the currency position is not valid.
	this.setDefaultCurrencyFromPositionList(); // Sets the default currency
	storeData('currencies_position_order', JSON.stringify(this._currencyAtPosition));
}

JaxxAppSettings.prototype.setDefaultCurrencyFromPositionList = function() {
	for (var i = 0; i < this._currencyAtPosition.length; i++) {
		if (Navigation.isCurrencyEnabled(this._currencyAtPosition[i])){
			wallet.getHelper().setFiatUnit(this._currencyAtPosition[i]);
			return;
		}	
	}
	// Really the code should not reach this line (at least one currency should be enabled.)
}

JaxxAppSettings.prototype.getListOfEnabledCurrencies = function() {
	returnArray = [];
	for (var i = 0; i < this._currencyAtPosition.length; i++){
		if (Navigation.isCurrencyEnabled(this._currencyAtPosition[i])) {
			returnArray.push(this._currencyAtPosition[i]);
		}
	}
	return returnArray;
}

JaxxAppSettings.prototype.getNextEnabledCurrency = function(sourceCurrency) {
	var arrayCurrencies = this.getListOfEnabledCurrencies();
	var oldIndex = arrayCurrencies.indexOf(sourceCurrency);
	if (oldIndex === -1) {
		return -1;
	}
	var newIndex = (oldIndex + 1) % arrayCurrencies.length;
	return arrayCurrencies[newIndex];
}

JaxxAppSettings.prototype.getPreviousEnabledCurrency = function(sourceCurrency) {
	var arrayCurrencies = this.getListOfEnabledCurrencies();
	var oldIndex = arrayCurrencies.indexOf(sourceCurrency);
	if (oldIndex === -1) {
		return -1;
	}
	var newIndex = (oldIndex - 1 + arrayCurrencies.length) % arrayCurrencies.length;
	return arrayCurrencies[newIndex];	
}

JaxxAppSettings.prototype.pushCurrencyToEndOfList = function(fiatUnit) {
	// fiatUnit will be something like 'CAD'
	this._currencyAtPosition.push(fiatUnit);
	storeData('currencies_position_order', JSON.stringify(this._currencyAtPosition));
}

JaxxAppSettings.prototype.setCurrencyPositionList = function(newCurrencyPositionArray){
	this._currencyAtPosition = newCurrencyPositionArray;
	storeData('currencies_position_order', JSON.stringify(this._currencyAtPosition));
}

/*JaxxAppSettings.prototype.getCryptoCurrencyPositionList = function(){

	return this.getWallets();
}*/

/*
JaxxAppSettings.prototype.getCryptoCurrencyAtPosition = function(index) {

	return this._getCryptoCurrencyPositionList()[index];
}
*/

JaxxAppSettings.prototype.initializeCryptoCurrencySettingsData = function() {
	try {
//		this.initializeCryptoCurrencyPositionData();
		this.initializeCryptoCurrencyEnabledData();
		this.initializeDefaultCryptoCurrency();
		console.log("The cryptocurrency settings data has loaded properly.");
	} catch(error) {
		console.log("The cryptocurrency initialization functions wouldn't work for some reason.");
	}
}

JaxxAppSettings.prototype.initializeDefaultCryptoCurrency = function() {

	var storedDefaultCoinType = HDWalletHelper.dictCryptoCurrency[this.getListOfEnabledCryptoCurrencies()[0]]['index'];
	if (typeof(storedDefaultCoinType) !== 'undefined' && storedDefaultCoinType !== null) {
        this._defaultCoinType = parseInt(storedDefaultCoinType, 10);
    } else {
        this.setDefaultCoinType(COIN_BITCOIN);
    }
	
}

/*
JaxxAppSettings.prototype.saveWallets = function(ar){
    this.wallets_sorted = ar;

    localStorage.setItem('wallets_sorted', JSON.stringify(this.wallets_sorted));
}*/

/*JaxxAppSettings.prototype.getWallets = function(){
    var out = jaxx.Registry.getDatacontrollersAll().map(function (item) {
        return {symbol: item.symbol, sort: item.sort, name: item.name, icon: item.icon, enabled: item.enabled, testnet:item.testnet};
    })

    return _.sortBy(out, 'sort');*/

  //  var self = this;

   /* var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.regular;
    }
*/


   //if(!this.wallets_sorted) {
     //  var str = localStorage.getItem('wallets_sorted');
       //if (!str) {
          // var i = 0;

         //  localStorage.setItem('wallets_sorted', JSON.stringify(this.wallets_sorted));
      //} else this.wallets_sorted = JSON.parse(str);
  // }
  //  return this.wallets_sorted;

  /*  //var cryptoCurrencyPositionData = null;

    if (typeof(loadedCryptoPositionData) !== 'undefined' && loadedCryptoPositionData !== null) {    
        cryptoCurrencyPositionData = JSON.parse(loadedCryptoPositionData);
    }

    if (cryptoCurrencyPositionData === null) {
        console.log('Writing new cryptocurrency position data.');
        var cryptoArray = [];


        for (var key in HDWalletHelper.dictCryptoCurrency){
            console.log("key :: " + key + " :: allowed :: " + HDWalletHelper.cryptoCurrenciesAllowed[key]);
            if (HDWalletHelper.dictCryptoCurrency.hasOwnProperty(key) && 
                cryptoCurrenciesAllowed[key] === true) { // hasOwnProperty is needed because it's possible to insert keys into the prototype object of dictionary

                cryptoArray.push(key);
            }
        }
        self._cryptoCurrencyAtPosition = cryptoArray;
        storeData('crypto_currency_position_data', JSON.stringify(cryptoArray), false)// This is an optimization.
    } else {
        // cryptoCurrencyPositionData;
        // Add all missing coins to the end of the list.
        
        //@note: guards against currencies being completely removed from the app, or disabled on certain platforms.
        for (var i = cryptoCurrencyPositionData.length - 1; i >= -1; i--) {
            var key = cryptoCurrencyPositionData[i];
            if (!(cryptoCurrencyPositionData[i] in HDWalletHelper.dictCryptoCurrency) ||
                cryptoCurrenciesAllowed[key] !== true){
                cryptoCurrencyPositionData.splice(i, 1);
            }
        }
        self._cryptoCurrencyAtPosition = cryptoCurrencyPositionData;

        //@note: add other currencies to the list that might have been recently introduced.
        var allCoins = Object.keys(HDWalletHelper.dictCryptoCurrency);
        for (var i = 0; i < allCoins.length; i++){
            var key = allCoins[i];
            if (self._cryptoCurrencyAtPosition.indexOf(allCoins[i]) === -1 &&
                cryptoCurrenciesAllowed[key] === true){
                self._cryptoCurrencyAtPosition.push(allCoins[i]);
                // disable cryptocurrency.
            }
        }

        console.log("cryptoCurrenciesAtPosition :: " + JSON.stringify(self._cryptoCurrencyAtPosition, null, 4));
    }
    console.log('Cryptocurrency position data loaded without errors.');
    */
//}

JaxxAppSettings.prototype.initializeCryptoCurrencyEnabledData = function(){
    var baseInitialCryptoCurrencies = {};
    
//    if (PlatformUtils.mobileiOSCheck()) {
//        baseInitialCryptoCurrencies = HDWalletHelper.baseInitialCryptoCurrencies.ios;
//    } else {
        baseInitialCryptoCurrencies = HDWalletHelper.baseInitialCryptoCurrencies.regular;
//    }
    
  var cryptoCurrencyEnabledData = {}; // ie. {'BTC' : true, 'USD' : }
	try {
		cryptoCurrencyEnabledData = JSON.parse(getStoredData('crypto_currency_enabled_data', false));
	} catch(error) {
		cryptoCurrencyEnabledData = null;
		console.log('Error while parsing cryptocurrency enabled data.')
	}
	try {
		if (typeof(cryptoCurrencyEnabledData) === 'undefined' || cryptoCurrencyEnabledData === null) {			
			console.log('Writing new cryptocurrency enabled data.');
          var allKeys = Object.keys(baseInitialCryptoCurrencies);
          for (var i = 0; i < allKeys.length; i++){
              if (baseInitialCryptoCurrencies[allKeys[i]] === true) {
                  this.enableCryptoCurrency(allKeys[i]);
                  g_JaxxApp.getUI().enableCryptoCurrencyInUI(allKeys[i]);
              }
          }
			//this.pushCryptoCurrencyIsEnabledToStorage();
		} else {
			this._cryptoCurrencyIsEnabled = cryptoCurrencyEnabledData;
		}
		console.log('Cryptocurrency enabled data loaded without errors.');
	} catch (error) {
		console.log("Error while initializing cryptocurrency enabled data.");
		console.log(error.message);
	}

}

JaxxAppSettings.prototype.isCryptoCurrencyEnabled = function(cryptoCurrency) {
	//try {
		if (this._cryptoCurrencyIsEnabled[cryptoCurrency]){
			return true;	
		} else {
			return false;
		}
	//} catch (error) {
	//	console.log(error.message);
	//	return false;
//	}
}




JaxxAppSettings.prototype.setCryptoCurrencyPositionData = function(newPositionArray){
	//try {
		this._cryptoCurrencyAtPosition = newPositionArray;
    localStorage.setItem('crypto_currency_position_data', newPositionArray);
		g_JaxxApp.getUI().updateCryptoCurrencyBannersInHeader(); // Change ordering in top menu
	//} catch(error) {
	//	console.log("Error while initializing cryptocurrency enabled data.");
	//	console.log(error.message);
	//}
}

JaxxAppSettings.prototype.setCryptoCurrencyEnabledData = function(newEnabledDictionary) {
	try {
		this._cryptoCurrencyEnabledData = newEnabledDictionary;
		this.pushCryptoCurrencyIsEnabledToStorage();
	} catch (error) {
		console.log("Error while initializing cryptocurrency enabled data.");
		console.log(error.message);		
	}
}

JaxxAppSettings.prototype.toggleCryptoCurrencyIsEnabled = function(cryptoCurrency) {
	// Example cryptoCurrency parameters: 'BTC', 'ETH', ...
    try {
		if (this.isCryptoCurrencyEnabled(cryptoCurrency)) {            
        if (this.isDisablingCryptoCurrencyAllowed()) {
				    this.disableCryptoCurrency(cryptoCurrency);
				    g_JaxxApp.getUI().disableCryptoCurrencyInUI(cryptoCurrency);
				    if (HDWalletHelper.dictCryptoCurrency[cryptoCurrency]['index'] === curCoinType){
					      // Get the enabled cryptocurrency from the top of the list.
					      g_JaxxApp.getUI().switchToCoin(this.getListOfEnabledCryptoCurrencies()[0]);
				    }
			  }
		} else {            
			  this.enableCryptoCurrency(cryptoCurrency);
        g_JaxxApp.getUI().enableCryptoCurrencyInUI(cryptoCurrency);
		}
	} catch (error) {
		console.log("Failed to toggle cryptocurrency in settings.");
		console.log(error.message);
	}
}

JaxxAppSettings.prototype.disableCryptoCurrency = function(cryptoCurrency){
	// @TODO: JS Optimization	
	this._cryptoCurrencyIsEnabled[cryptoCurrency] = false;
	this.pushCryptoCurrencyIsEnabledToStorage();
    
    //@note: @todo: @here: settings shouldn't be calling ui functions.

}

JaxxAppSettings.prototype.enableCryptoCurrency = function(cryptoCurrency) {
	this._cryptoCurrencyIsEnabled[cryptoCurrency] = true;
	this.pushCryptoCurrencyIsEnabledToStorage();
  //@note: @todo: @here: settings shouldn't be calling ui functions.
}

JaxxAppSettings.prototype.disableAllCryptoCurrencies = function(){
    var listOfCoinAbbreviatedNames = this.getListOfEnabledCryptoCurrencies();
    for (var i = 0; i < listOfCoinAbbreviatedNames.length; i++){
        this._cryptoCurrencyIsEnabled[listOfCoinAbbreviatedNames[i]] = false;
    }
    this.pushCryptoCurrencyIsEnabledToStorage();
}

JaxxAppSettings.prototype.pushCryptoCurrencyIsEnabledToStorage = function(){
	try {
		storeData('crypto_currency_enabled_data', JSON.stringify(this._cryptoCurrencyIsEnabled), false);
	} catch(error) {
		console.log("JaxxAppSettings :: pushCryptoCurrencyIsEnabledToStorage :: Error when pushing cryptocurrency enabled data to storage.");
		console.log(error.message);
	}
}

//JaxxAppSettings.prototype.pushCryptoCurrencyPositionDataToStorage = function(){
//	try {
	//	storeData('crypto_currency_position_data', JSON.stringify(this._cryptoCurrencyAtPosition), false);
	//} catch(error) {
	//	console.log("JaxxAppSettings :: pushCryptoCurrencyPositionDataToStorage :: Error when pushing cryptocurrency position data to storage.");
	//	console.log(error.message);
	//}
//}
/*
JaxxAppSettings.prototype.getCryptoCurrencyEnabledCount = function() {
    var arr = this.getCryptoCurrencyPositionList();
	//try {
		var count = 0;
		for (var i = 0; i < arr.length; i++){
			if (this.isCryptoCurrencyEnabled(arr[i])){
				count = count + 1;
			}
		}
		return count;
	//} catch(error) {
		//console.log("JaxxAppSettings :: getCryptoCurrencyEnabledCount :: Error when counting the number of cryptocurrencies.");
	//	console.log(error.message);
	//}
}*/

JaxxAppSettings.prototype.isDisablingCryptoCurrencyAllowed = function() {
	// This method returns true if the user is allow to disable a cryptocurrency.
	if (this.getCryptoCurrencyEnabledCount() < 2) {
		return false;
	}
	return true;
}

/*
JaxxAppSettings.prototype.getListOfEnabledCryptoCurrencies = function(){
	// Returns an array

    var arr = this.getCryptoCurrencyPositionList();
	//try {
		var arrayOfEnabledCurrencies = [];
		for (var i = 0; i < arr.length; i++){
			var key = arr[i];
			if (this.isCryptoCurrencyEnabled(key)) {
				arrayOfEnabledCurrencies.push(key);
			}
		}
		return arrayOfEnabledCurrencies;
	//} catch (error) {
		//console.log("Could not retrieve sublist of cryptocurrencies");
		//console.log(error.message);
	//}
}
*/

JaxxAppSettings.prototype.initializeFirstCryptoCurrencyInBanner = function() {
	var firstCryptoCurrencyInBanner = ''; // ie. {'BTC' : true, 'USD' : }
	try {
		firstCryptoCurrencyInBanner = JSON.parse(getStoredData('first_crypto_currency_in_banner', false));
	} catch(error) {
		firstCryptoCurrencyInBanner = null;
		console.log('Error while parsing cryptocurrency first in banner data.')
	}
	try {
		if (typeof(firstCryptoCurrencyInBanner) === 'undefined' || firstCryptoCurrencyInBanner === null) {			
			console.log('Writing new cryptocurrency first in banner data.');
			firstCryptoCurrencyInBanner = this.getListOfEnabledCryptoCurrencies()[0];
			this.setFirstCryptoCurrencyInBanner(firstCryptoCurrencyInBanner);
			//this.pushCryptoCurrencyIsEnabledToStorage();
		} else {
			
		}
		console.log('Cryptocurrency enabled data loaded without errors.');
	} catch (error) {
		console.log("Error while initializing cryptocurrency enabled data.");
		console.log(error.message);
	}
}

JaxxAppSettings.prototype.setFirstCryptoCurrencyInBanner = function(cryptoCurrency){
	// Variable, settings and app UI.
	// cryptoCurrency should be BTC or ETH or something.
	this._bannerFirstCryptoCurrency = cryptoCurrency;	
	try {
		storeData('first_crypto_currency_in_banner', JSON.stringify(cryptoCurrency), false); // Sends the data to storage.
	} catch (error) {
		console.log('Error while trying to store first banner data.');
		console.log(error.message);
	}
	try {
		
	} catch(error) {
		console.log('Error while trying to cryptocurrency in banner.');
		console.log(error.message);		
	}
}

JaxxAppSettings.prototype.getNextEnabledCryptoCurrency = function(sourceCurrency) {
	//	var arrayCurrencies = this.getListOfEnabledCryptoCurrencies();
	//	var oldIndex = arrayCurrencies.indexOf(sourceCurrency);
	//	if (oldIndex === -1) {
	//		return -1;
	//	}
	//	var newIndex = (oldIndex + 1) % arrayCurrencies.length;
	//	return arrayCurrencies[newIndex];
	return this.getIncrementCryptoCurrencyNSteps(sourceCurrency, 1);
}

JaxxAppSettings.prototype.getPreviousEnabledCryptoCurrency = function(sourceCurrency) {
	//	var arrayCurrencies = this.getListOfEnabledCryptoCurrencies();
	//	var oldIndex = arrayCurrencies.indexOf(sourceCurrency);
	//	if (oldIndex === -1) {
	//		return -1;
	//	}
	//	var newIndex = (oldIndex - 1 + arrayCurrencies.length) % arrayCurrencies.length;
	//	return arrayCurrencies[newIndex];
	return this.getIncrementCryptoCurrencyNSteps(sourceCurrency, -1);
}

JaxxAppSettings.prototype.getIncrementCryptoCurrencyNSteps = function(sourceCurrencyName, steps) {
	try {
        //@note: @todo: @here: naming.
        if (typeof(sourceCurrencyName) === 'undefined' || sourceCurrencyName === null){
            sourceCurrencyName = this.getActiveCoinAbbreviatedName();
		}
		if (typeof(steps) === 'undefined' || steps === null) {
			steps = 0;
		}
		var arrayCurrencies = this.getListOfEnabledCryptoCurrencies();
        var oldIndex = arrayCurrencies.indexOf(sourceCurrencyName);
		if (oldIndex === -1) {
			return -1;
		}
		var newIndex = (oldIndex + steps) % arrayCurrencies.length;
		while (newIndex < 0) {
			newIndex = newIndex + arrayCurrencies.length;
		}
		return arrayCurrencies[newIndex];
	} catch (error) {
		console.log('Error while trying to get cryptocurrency incremented n steps.');
		console.log(error.message);
	}
} 

JaxxAppSettings.prototype.getActiveCoinAbbreviatedName = function() {
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];

    if (coinAbbreviatedName in HDWalletHelper.dictCryptoCurrency) {
        return coinAbbreviatedName;
    } else {
        console.log("Getting default coin type instead.")
        
        var coinAbbreviatedNameDefault = HDWalletPouch.getStaticCoinPouchImplementation(this.getDefaultCoinType()).pouchParameters['coinAbbreviatedName'];
        
        return coinAbbreviatedNameDefault;
    }
}

JaxxAppSettings.prototype.getDefaultShapeshiftCoinAbbreviatedName = function(coinType){
	return this.getListOfShapeshiftCoins(coinType)[0];
}

JaxxAppSettings.prototype.getNextCryptoForShapeshiftSelection = function(cryptoUnit) {
	var shapeshiftCoinList = this.getListOfShapeshiftCoins(cryptoUnit);
	var index = shapeshiftCoinList.indexOf(this.getShapeshiftCoinTarget(cryptoUnit));
	if (index < 0){
		console.log('Index was not retrieved properly.')
		return 0;
	}
    
    var found = false;
    
    while (!found) {
        index = index + 1;
        index = index % shapeshiftCoinList.length;
        
        if (typeof(shapeshiftCoinList[index]) !== 'undefined' &&
           shapeshiftCoinList[index] !== null) {
            found = true;
        }
    }
    
	return shapeshiftCoinList[index];
}

JaxxAppSettings.prototype.setShouldLoadFromBackupIntroPosition = function(blnNewSetting){
    this._shouldLoadFromBackupIntroPosition = blnNewSetting;
    storeData('shouldLoadFromBackupIntroPosition', JSON.stringify(this._shouldLoadFromBackupIntroPosition), false)// This is an optimization.
}

JaxxAppSettings.prototype.getShouldLoadFromBackupIntroPosition = function(){
    this._shouldLoadFromBackupIntroPosition = getStoredData('shouldLoadFromBackupIntroPosition', false);
    if (this._shouldLoadFromBackupIntroPosition){
        this._shouldLoadFromBackupIntroPosition = true;
    } else {
        this._shouldLoadFromBackupIntroPosition = false;
    }
    return this._shouldLoadFromBackupIntroPosition;
}

/*JaxxAppSettings.prototype.isMnemonicStored = function(){
    var mnemonic = getStoredData('mnemonic', false);
    if (typeof(mnemonic) === 'undefined' || mnemonic === null){
        return false;
    } else {
        return true;
    }
}*/


JaxxAppSettings.prototype.setIgnoreEtcEthSplit = function(ignoreEtcEthSplit) {
    this._ignoreEtcEthSplit = ignoreEtcEthSplit;
    
    storeData('JaxxApp_Settings_IgnoreEtcEthSplit', this._ignoreEtcEthSplit.toString(), false);
}

JaxxAppSettings.prototype.getIgnoreEtcEthSplit = function() {
    return this._ignoreEtcEthSplit;
}

JaxxAppSettings.prototype.getDictionaryOfCryptoCurrenciesAllowed = function(){
    var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.regular;
    }
    return cryptoCurrenciesAllowed;
}

JaxxAppSettings.prototype.getListOfCryptoCurrenciesAllowed = function(){
    var returnValue = [];
    var dictCryptoCurrenciesAllowed = this.getDictionaryOfCryptoCurrenciesAllowed();
    var keys = Object.keys(dictCryptoCurrenciesAllowed);
    for (var i = 0; i < keys.length; i++){
        if (dictCryptoCurrenciesAllowed[keys[i]]){
            returnValue.push(keys[i]);
        }
    }
    return returnValue;
}

JaxxAppSettings.prototype.getMiningFeeOptionForCoin = function(coinType){
    // If the mining fee is not available then we simply retrieve the average.
    var miningFee = this.getSetting(JSON.stringify({"MiningFeeOptionForCoin":coinType})); // test with g_JaxxApp.getSettings().getSetting(JSON.stringify({"MiningFeeForCoin":0}))
    // This code sets the mining fee to average if the mining fee is undefined.
    if (typeof(miningFee) === 'undefined' || miningFee === null) {
        miningFee = HDWalletPouch.MiningFeeLevelAverage;
    }
    return miningFee;
}

JaxxAppSettings.prototype.setMiningFeeOptionForCoin = function(coinType, miningFeeOption){
    this.setSetting(JSON.stringify({"MiningFeeOptionForCoin":coinType}), miningFeeOption);
}

JaxxAppSettings.prototype.setupDefaultMiningOptions = function(){
    //var miningOption = this.
}

JaxxAppSettings.prototype.getMiningFeeDefaultForCoin = function(coinType){
  // If the mining fee is not available then we simply retrieve the average.
  var miningFee = this.getSetting(JSON.stringify({"MiningFeeDefaultForCoin":coinType})); // test with g_JaxxApp.getSettings().getSetting(JSON.stringify({"MiningFeeForCoin":0}))
  // This code sets the mining fee to average if the mining fee is undefined.
  if (typeof(miningFee) === 'undefined' || miningFee === null) {
      miningFee = null;
  }
  return miningFee;
}

JaxxAppSettings.prototype.setMiningFeeDefaultForCoin = function(coinType, miningFeeDefault){
    this.setSetting(JSON.stringify({"MiningFeeDefaultForCoin":coinType}), miningFeeDefault);
}

JaxxAppSettings.prototype.getDefaultCurrency = function(){
    return this.getListOfEnabledCurrencies()[0];
}

/*
* Resets Jaxx's cache
* @method resetJaxxCache
* */
JaxxAppSettings.prototype.resetJaxxCache = function(){
    var controllers = jaxx.Registry.getAllCryptoControllers();
    controllers.forEach(function(controller) {
        controller.resetStorage(true);
    });

    jaxx.CoinsMenu.instance.selectDefaultCoin();
  	localStorage.setItem('wallet_setup', false);
}

JaxxAppSettings.prototype.addVersionToCoinBulletinListHideOnSelect = function(coinType, version){
	//var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters["coinAbbreviatedName"];
    var ctr = jaxx.Registry.getCurrentCryptoController();
    var coinAbbreviatedName = ctr.symbol;
    var hideOnSelectSetting = this.setting(coinAbbreviatedName + "_CoinBulletinHideOnSelectSetting");
	if (typeof(hideOnSelectSetting) === "undefined" || hideOnSelectSetting === null){
		hideOnSelectSetting = [];
	}
	if (hideOnSelectSetting.indexOf(version) === -1){
		hideOnSelectSetting.push(version);
        this.setting(coinAbbreviatedName + "_CoinBulletinHideOnSelectSetting", hideOnSelectSetting);
	}
}

JaxxAppSettings.prototype.addVersionToCoinBulletinListIsHidden = function(coinType, version){
    //var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters["coinAbbreviatedName"];
    var ctr = jaxx.Registry.getCurrentCryptoController();
    var coinAbbreviatedName = ctr.symbol;
    var coinBulletinIsHidden = this.setting(coinAbbreviatedName + "_CoinBulletinIsHidden");
    if (typeof(coinBulletinIsHidden) === "undefined" || coinBulletinIsHidden === null){
        coinBulletinIsHidden = [];
    }
    if (coinBulletinIsHidden.indexOf(version) === -1){
        coinBulletinIsHidden.push(version);
		this.setting(coinAbbreviatedName + "_CoinBulletinIsHidden", coinBulletinIsHidden);
    }
}

JaxxAppSettings.prototype.isCoinBulletinHideOnSelect = function(version){
    var ctr = jaxx.Registry.getCurrentCryptoController();
    var coinAbbreviatedName = ctr.symbol;
    var hideOnSelectSetting = this.setting(coinAbbreviatedName + "_CoinBulletinHideOnSelectSetting");

    if (typeof(hideOnSelectSetting) === "undefined" || hideOnSelectSetting === null){
        return false;
    }

    if (hideOnSelectSetting.indexOf(version) === -1) {
		return false;
	} else {
    	return true;
	}
};

JaxxAppSettings.prototype.isCoinBulletinVersionHidden = function(coinType, version){
    //var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters["coinAbbreviatedName"];
    var ctr = jaxx.Registry.getCurrentCryptoController();
    var coinAbbreviatedName = ctr.symbol;
    var coinBulletinIsHidden = this.setting(coinAbbreviatedName + "_CoinBulletinIsHidden");
    if (typeof(coinBulletinIsHidden) === "undefined" || coinBulletinIsHidden === null){
        return false;
    }
    if (coinBulletinIsHidden.indexOf(version) === -1) {
        return false;
    } else {
        return true;
    }
}