var JaxxUIIntro = function(){
    this._hasSetupCustomCoinList = false;
    this._hasSetupCustomCurrencyList = false;
    this._hasSetupExpressCoinList = false;
    this._incorrectPINTimeout = null;
    this._jaxxTermsOfService = null;
    this._pinIsCorrect = false;
    this._introScreenWalletSelected = "";
    this._mnemonicEncrypted = "";
    this._temporaryPin = "";
    this._tempEncryptedMnemonic = ""; // This is the mnemonic that is stored for pairing from devices.
    this._collapsedHeightOfCustomCurrenciesList = 0;
    this._setOptionSelected = ""; //this is a wallet setup option express or custom
    this._setWalletType = ""; // this is wallet type variable create new wallet or pair/restore
    this._jaxxPrivacyPolicy = null;


}

JaxxUIIntro.prototype.getCollapsedHeightOfCustomCurrenciesList = function(){
    return this._collapsedHeightOfCustomCurrenciesList;
}

JaxxUIIntro.prototype.initialize = function(){
    var self = this;
    this.initializeElements();
    this.getTermsOfServiceVerbatim(function(){
        self.populateTermsOfServiceVerbatim();
    });
    this.getPrivacyPolicyVerbatim(function(){
        self.populatePrivacyPolicyVerbatim();
    });
}

JaxxUIIntro.prototype.initializeElements = function(){
    console.log('TODO');
   // if (g_JaxxApp.getSettings().isMnemonicStored()) {
      //  $(".settings.pageAttentionMessage .hideForExistingUsers").hide();
   // } else {
      //  $(".settings.pageAttentionMessage .hideForNewUsers").hide();
      //  $(".settings.pageAttentionMessage .clickableViewKeysBanner").hide();
   // }

}

JaxxUIIntro.prototype.toggleExpandPDOption = function(strSetupOption){
    //this function is used on the pair devices page
    //strSetupOption is the html value, in this case 'PDExpress' or 'PDCustom'
    g_JaxxApp.getUI().toggleTextExpansion('.settings.pressContinuePairDevices .btnOpenClose' + strSetupOption, '.settings.createNewWallet .btnOpenClose' + strSetupOption + ' .triangleArrow','190px', '60px', 500);
}

JaxxUIIntro.prototype.toggleExpandSetupOption = function(strSetupOption){
    // strSetupOption should be 'Express' or 'Custom'.
    // cssExpanded will denote an element that has been expanded.

    // Run something like // strSetupOption should be 'express' or 'custom'.
    var customHeight  = "175";
    if(strSetupOption == "Express"){
        customHeight = "155";
    }
    else if(strSetupOption == "Custom"){
        customHeight = "175";
    }

    customHeight += "px";

    g_JaxxApp.getUI().toggleTextExpansion('.settings.createNewWallet .btnOpenClose' + strSetupOption, '.settings.createNewWallet .btnOpenClose' + strSetupOption + ' .triangleArrow', customHeight, '60px', 500);
}

JaxxUIIntro.prototype.pressContinueSetupOption = function() {
    // Store the setup option that has been selected and push settings based on that selection.
    var setupOptionChosen = $('.settings.createNewWallet .radioBtnExpressCustom:checked').attr('value');
    if (setupOptionChosen === 'Express') {
        jaxx.CoinsListSetup.instance.selectCurrency(0);
        this.optionSelected("Express");
        Navigation.pushSettings('pageExpressWalletSetup');
    } else if (setupOptionChosen === 'Custom') {
        jaxx.CoinsListSetup.instance.selectCurrency(1);
        this.optionSelected("Custom");
        Navigation.pushSettings('pageCustomWalletSetup');
    }
}
JaxxUIIntro.prototype.optionSelected = function(option) {
    //check if express set up is selected
    this._setOptionSelected = option;
}
JaxxUIIntro.prototype.customWalletsSetup = function(){
    if (!this._hasSetupCustomCoinList) {
        // Populate the crypto currency rows.
        $('.pageCustomWalletSetup .coinListCustom tbody').empty(); // - Just in case we want to clear the table.
        for (var i = 0; i < COIN_NUMCOINTYPES; i++){
            $('.pageCustomWalletSetup .coinListCustom tbody').append(this.generateCoinRowCustom(i));
        }
        $(".pageCustomWalletSetup .coinList tbody").sortable({
            /*items: "> tr:not(:first)",*/
            appendTo: "parent",
            axis: 'y',
            helper: "clone",
            handle: ".handle",
            update: function(event, ui) {

            }
        }).disableSelection();
        this.attachScriptActionCoinCustom();
        // Push the currency list to the settings.
        this._hasSetupCustomCoinList = true;
    }
    Navigation.pushSettings('pageCustomWalletSetup');

}

JaxxUIIntro.prototype.selectWalletsSetupOption = function(strSetupOption){
    // strSetupOption should be 'Express' or 'Custom'.

    //  - this command will become useful for the animation.
///////////////////////////////
   // console.error(strSetupOption);
    if(!jaxx.Registry.appState) jaxx.Registry.appState = {};

    jaxx.Registry.appState.createType = strSetupOption;

   /// console.log(jaxx.Registry.appState);

    $('.settings.createNewWallet .radioBtnExpressCustom').prop('checked', false);
    $('.settings.createNewWallet .radioButton' + strSetupOption).prop('checked', true);


    this.makeContinueAppearOnPage('.settings.createNewWallet');
    // Remove grey class from the 'Continue' button.
}

JaxxUIIntro.prototype.pairDevicesWalletsSetupOption = function(strSetupOption){
    // strSetupOption should be the value of the radio buttons
    $('.settings.pressContinuePairDevices .radioBtnPDExpressCustom').prop('checked', false);
    $('.settings.pressContinuePairDevices .radioButton' + strSetupOption).prop('checked', true);
    this.makeContinueAppearOnPage('.settings.pressContinuePairDevices');
}

JaxxUIIntro.prototype.attachScriptActionCoinCustom = function(){
    $('.pageCustomWalletSetup .coinListCustom .scriptAction').click(function (event) { // Add the scriptAction triggers again.
        try {
            scriptAction(event);
        } catch (err) {
            console.error(err);
        }
    });
}

JaxxUIIntro.prototype.attachScriptActionCoinExpress = function(){
    $('.pageExpressWalletSetup .coinListExpress .scriptAction').click(function (event) { // Add the scriptAction triggers again.
        try {
            scriptAction(event);
        } catch (err) {
            console.error(err);
        }
    });
}

JaxxUIIntro.prototype.isCoinEnabledCustom = function(coinType) {
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    return $('.pageCustomWalletSetup .coinList .coinType' + coinAbbreviatedName+' .cssSelectedCurrency .cssCircleUnchecked').hasClass('cssCurrencyisChecked');
}

JaxxUIIntro.prototype.toggleCoinIsEnabledCustom = function(coinType){
    if (this.isCoinEnabledCustom(coinType)){
        this.disableCoinCustom(coinType);
    } else {
        this.enableCoinCustom(coinType);
    }
    if ($('.pageCustomWalletSetup .cssCurrencyisChecked').length > 0) {
        this.makeContinueAppearOnPage('.pageCustomWalletSetup');
    } else {
        this.makeContinueDisappearOnPage('.pageCustomWalletSetup');
    }
}

JaxxUIIntro.prototype.enableCoinCustom = function(coinType){
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    $('.pageCustomWalletSetup .coinList .coinType' + coinAbbreviatedName + ' .cssSelectedCurrency .cssCircleUnchecked').addClass('cssCurrencyisChecked');
    $('.pageCustomWalletSetup .coinList .coinType' + coinAbbreviatedName).addClass('cssCurrencyHighlightText');
}

JaxxUIIntro.prototype.disableCoinCustom = function(coinType) {
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    $('.pageCustomWalletSetup .coinList .coinType' + coinAbbreviatedName + ' .cssSelectedCurrency .cssCircleUnchecked').removeClass('cssCurrencyisChecked');
    $('.pageCustomWalletSetup .coinList .coinType' + coinAbbreviatedName).removeClass('cssCurrencyHighlightText');
}

JaxxUIIntro.prototype.pressContinueCustomWallets = function(arrayWalletsPosition, dictWalletsEnabled){
    // Example Parameters ([1, 2, 3, 4], {1: true, 2: true, 3 : false, 4: false})
    // Store wallet data here.
    if ($('.pageCustomWalletSetup .coinList .cssCurrencyisChecked').length > 0) {
        this.pushCustomCoinOrderToSettings();
        //this.pushCustomCoinEnabledValuesToSettings(); // #GMS This function call doesn't seem to be necessary anymore with the new modular structure
        this.customCurrenciesSetup();
        Navigation.pushSettings('pageCustomCurrenciesSetup');
        this._collapsedHeightOfCustomCurrenciesList = parseInt($('.pageCustomCurrenciesSetup .exchangeRateList').css('height'));
        this.disableAllFiatUnitsCustom(); // We need to make the appropriate changes later because this should really be an empty list by the time we get here.
    }
}

JaxxUIIntro.prototype.generateCoinRowCustom = function(coinType){console.warn("USED");
    var extraCss = "";
    var isTestnet = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['isTestnet'];

    (isTestnet === true) ? extraCss = 'cssTestnet' : "";

    var coinWalletSelector3LetterSymbol = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinWalletSelector3LetterSymbol'];
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    var coinFullDisplayName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinFullDisplayName'];
    var column1 = '<td class="cssSelectedCurrency"><div class="cssCircleUnchecked"></div></td>';
    var column2 = '<td class="itemNumberLabel cssItemNumberLabel"></td>';
    var column3 = '<td class="coinIcon cssCoinIcon cssImageLogoIcon'+coinAbbreviatedName+' cssHighlighted"><div class="image"></div></td>';
    var column4 = '<td class="coinLabel cssCoinLabel">' + coinWalletSelector3LetterSymbol + ' - ' + coinFullDisplayName + '</td>';
    var column5 = '<td class="handle cssHandle"><img src="images/dragAndDrop.svg" alt="" height="13" width="13" style="position:absolute; padding-top:12px;"></td>';
    return '<tr class="cssCoinCurrency cssOpacity scriptAction coinType' + coinAbbreviatedName + " " + extraCss + '" specialAction ="toggleCoinIsEnabledCustom" value="' + coinAbbreviatedName + '">' + column1 + column2 + column3 + column4 + column5 + '</tr>';
}

JaxxUIIntro.prototype.pushCustomCoinOrderToSettings = function(){
    // Extract ordering
    var rows = $('.pageCustomWalletSetup .coinList tbody tr');
    var currencyArray = [];
    for (var i = 0; i < rows.length; i++){
        currencyArray.push($($('.pageCustomWalletSetup .coinList tbody tr').get(i)).attr('value'));
    }
    g_JaxxApp.getSettings().setCryptoCurrencyPositionData(currencyArray); // Change settings
}

JaxxUIIntro.prototype.pushCustomCoinEnabledValuesToSettings = function(){

    var rows = $('.pageCustomWalletSetup .coinList tbody tr');
    for (var i = 0; i < rows.length; i++){
        // isCoinEnabledCustom()
        var coinType = HDWalletHelper.dictCryptoCurrency[$($('.pageCustomWalletSetup .coinList tbody tr').get(i)).attr('value')].index;
        var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
        if (this.isCoinEnabledCustom(coinType)) {
            g_JaxxApp.getSettings().enableCryptoCurrency(coinAbbreviatedName);
            g_JaxxApp.getUI().enableCryptoCurrencyInUI(coinAbbreviatedName);
        } else {
            g_JaxxApp.getSettings().disableCryptoCurrency(coinAbbreviatedName);
            g_JaxxApp.getUI().disableCryptoCurrencyInUI(coinAbbreviatedName);
        }
    }
}

JaxxUIIntro.prototype.pressContinueCustomCurrencies = function(){
    // Example Parameters (['USD', 'CAD', ...], {'USD': false, 'CAD' : true, ...} )
    if ($('.pageCustomCurrenciesSetup .exchangeRateList .cssCurrencyisChecked').length > 0) {
        Navigation.disableAllCurrencies();
        var rows = $('.pageCustomCurrenciesSetup .exchangeRateList tbody').children();
        var currencyOrder = [];
        for (var i = 0; i < rows.length; i++){
            var fiatUnit = $(rows[i]).attr('value');
            currencyOrder.push(fiatUnit);
            Navigation.updateCurrencyList();
            /*
            if (this.isFiatUnitEnabledCustom(fiatUnit)) {
                Navigation.updateCurrencyList(fiatUnit);
            } else {
                Navigation.disableCurrencyInData(fiatUnit);
            }
            */
        }
        storeData('currencies_position_order', JSON.stringify(currencyOrder));
        if (this._tempEncryptedMnemonic === ""){
            Navigation.pushSettings('backupMnemonicCustomIntroOption');
        } else {
            Navigation.pushSettings('pageSetupSecurityPinCode');
        }
        if (typeof(wallet) !== undefined && wallet !== null){ // Pair from device setup
            wallet.getHelper().setFiatUnit(g_JaxxApp.getSettings().getDefaultCurrency());
        }
        this.disableAllFiatUnitsCustom();
    }
}

JaxxUIIntro.prototype.toggleFiatUnitCustom = function(fiatUnit){
    //
    if (this.isFiatUnitEnabledCustom(fiatUnit)){
        this.disableFiatUnitCustom(fiatUnit);
    } else {
        this.enableFiatUnitCustom(fiatUnit);
    }
    if ($('.pageCustomCurrenciesSetup .cssCurrencyisChecked').length > 0) {
        this.makeContinueAppearOnPage('.pageCustomCurrenciesSetup');
    } else {
        this.makeContinueDisappearOnPage('.pageCustomCurrenciesSetup');
    }
}

JaxxUIIntro.prototype.disableAllFiatUnitsCustom = function(){
    var rows = $('.pageCustomCurrenciesSetup .exchangeRateList tbody').children();
    var currencyOrder = [];
    for (var i = 0; i < rows.length; i++){
        var fiatUnit = $(rows[i]).attr('value');
        if (this.isFiatUnitEnabledCustom(fiatUnit)) {
            this.disableFiatUnitCustom(fiatUnit);
        }
    }
}

JaxxUIIntro.prototype.showCreateWalletNotifications = function(){
    if(this._setWalletType === "newWallet") {
        setTimeout(function() {
            Navigation.flashBanner("Interface Successfully Created", 3, 'success');
        }, 1500);
    } else {
        setTimeout(function() {
            Navigation.flashBanner("Successfully Initialized Wallet!", 3, 'success');
        }, 1500);
    }

}
JaxxUIIntro.prototype.createWalletWithCallbackCustom = function(){
    var self = this;
    g_JaxxApp._settings.resetJaxxCache();
    /*
    *  I do not know if the code below is important code it seems that it doesn't fire anything.
    *  TODO: remove this function and see if it breaks anything.
    *  */
    var additionalCallback = function(){
       var defaultCoinType = 0;// HDWalletHelper.dictCryptoCurrency[g_JaxxApp.getSettings().getListOfEnabledCryptoCurrencies()[0]].index;
        setupDefaultCoinType(defaultCoinType);
        Navigation.setupCoinUI(defaultCoinType);
    };

    HDWalletMain.createWallet(this._mnemonicEncrypted, function(err, wallet){
        if (err) {
            console.log("createWallet :: error :: " + err);
            console.log('Failed To Create HD Wallet');
        } else {
            //storeData('mnemonic', wallet.getMnemonic(),true);
            jaxx.seed.getEncryptedSeed();
            self.showCreateWalletNotifications();

            Navigation.startBlit();

            setTimeout(function() {
                if (PlatformUtils.extensionChromeCheck()) {

                } else if (PlatformUtils.extensionFirefoxCheck()) {
                    Navigation.openModal('firefoxWarningPopupFirstFrame');
                }
            }, 500);

            removeStoredData('fiat');
            additionalCallback();
        }
    });
}

JaxxUIIntro.prototype.createWalletWithCallbackCustomUsingPIN = function(){
    var self = this;
    g_JaxxApp._settings.resetJaxxCache();
    var additionalCallback = function(){
        localStorage.setItem('wallet_setup', false);
        var defaultCoinType =  jaxx.Registry.getDefaultWalletType();// HDWalletHelper.dictCryptoCurrency[g_JaxxApp.getSettings().getListOfEnabledCryptoCurrencies()[0]].index;
        g_JaxxApp.getUser().setupWithWallet();
        g_JaxxApp.getUser().setPin(self._temporaryPin);
        setupDefaultCoinType(defaultCoinType);
        Navigation.setupCoinUI(defaultCoinType);
    };
    HDWalletMain.createWallet(this._mnemonicEncrypted, function(err, wallet){
        if (err) {
            console.log("createWallet :: error :: " + err);
            console.log('Failed To Create HD Wallet');
        } else {
            //storeData('mnemonic', wallet.getMnemonic(), true);
            jaxx.seed.getEncryptedSeed();
            self.showCreateWalletNotifications();

            Navigation.startBlit();

            setTimeout(function() {
                if (PlatformUtils.extensionChromeCheck()) {

                } else if (PlatformUtils.extensionFirefoxCheck()) {
                    Navigation.openModal('firefoxWarningPopupFirstFrame');
                }
            }, 500);

            removeStoredData('fiat');
            additionalCallback();
        }
    });
}

JaxxUIIntro.prototype.enableFiatUnitCustom = function(fiatUnit){
    $('.pageCustomCurrenciesSetup .exchangeRateList .fiatUnit' + fiatUnit + ' .cssSelectedCurrency .cssCircleUnchecked').addClass('cssCurrencyisChecked');
    $('.pageCustomCurrenciesSetup .exchangeRateList .fiatUnit' + fiatUnit).addClass('cssCurrencyHighlightText');
}

JaxxUIIntro.prototype.disableFiatUnitCustom = function(fiatUnit){
    $('.pageCustomCurrenciesSetup .exchangeRateList .fiatUnit' + fiatUnit + ' .cssSelectedCurrency .cssCircleUnchecked').removeClass('cssCurrencyisChecked');
    $('.pageCustomCurrenciesSetup .exchangeRateList .fiatUnit' + fiatUnit).removeClass('cssCurrencyHighlightText');

}

JaxxUIIntro.prototype.isFiatUnitEnabledCustom = function(fiatUnit) {
    return $('.pageCustomCurrenciesSetup .exchangeRateList .fiatUnit' + fiatUnit + ' .cssSelectedCurrency .cssCircleUnchecked').hasClass('cssCurrencyisChecked');
}



JaxxUIIntro.prototype.generateCurrencyRowCustom = function(fiatUnit) {
    var column1 = '<td class="cssSelectedCurrency"><div class="cssCircleUnchecked"></div></td>';
    var column2 = '<td class="cssUnitAndCurrency"><div class="cssUnit">' + fiatUnit + '</div><div class="name">' + jaxx.FiatPriceController.fiatDictionary[fiatUnit].name + '</div></td>'
    var column4 = '<td class="rate rate' + fiatUnit.trim().toUpperCase() + '"></td>';
    var column5 = '<td class="handle cssHandle"><img src="images/dragAndDrop.svg" alt="" height="13" width="13" style="position:absolute; padding-top:12px;"></td>';
    var tableRow = '<tr class="currency cssCurrency scriptAction fiatUnit' + fiatUnit +'" value="' + fiatUnit + '" specialAction="toggleFiatUnitCustom">' + column1 + column2 + column4 + column5 + '</tr>';
    return tableRow;
}


JaxxUIIntro.prototype.customCurrenciesSetup = function(){
    console.log(' JaxxUIIntro.prototype.customCurrenciesSetup   ');
    if (!this._hasSetupCustomCurrencyList) {
        $('.pageCustomCurrenciesSetup .exchangeRateList tbody').empty();
        for (var key in jaxx.FiatPriceController.fiatDictionary){
                $('.pageCustomCurrenciesSetup .exchangeRateList tbody').append(this.generateCurrencyRowCustom(key));

        }

        $('.pageCustomCurrenciesSetup .exchangeRateList tbody').sortable({
            appendTo: "parent",
            axis: 'y',
            helper: "clone",
            handle: ".handle",
            update: function(event, ui) {

            },
        }).disableSelection();
        $('.pageCustomCurrenciesSetup .exchangeRateList .scriptAction').click(function (event) { // Add the scriptAction triggers again.
            try {
                scriptAction(event);
            } catch (err) {
                console.error(err);
            }
        });

        this._hasSetupCustomCurrencyList = true;
    }
}

JaxxUIIntro.prototype.expressWalletsSetup = function(){
    console.error('JaxxUIIntro.prototype.expressWalletsSetup    ');
    // Populate the currency rows.
    if (!this._hasSetupExpressCoinList) {
        // Populate the crypto currency rows.
        g_JaxxApp.getSettings().getListOfCryptoCurrenciesAllowed();
        $('.pageExpressWalletSetup .coinListExpress tbody').empty() // - Just in case we want to clear the table.

        for (var i = 0; i < COIN_NUMCOINTYPES; i++){
            //if (cryptoCurrenciesAllowed.indexOf(HDWalletPouch.getStaticCoinPouchImplementation(i).pouchParameters['coinAbbreviatedName']) > -1) {
                $('.pageExpressWalletSetup .coinListExpress tbody').append(this.generateCoinRowExpress(i));
           // }
        }

        this.attachScriptActionCoinExpress();
        // Push the currency list to the settings.
        this._hasSetupExpressCoinList = true;
    }
    Navigation.pushSettings('pageExpressWalletSetup');
};

JaxxUIIntro.prototype.getTempEncryptedMnemonic = function() {
    return this._tempEncryptedMnemonic;
};

JaxxUIIntro.prototype.takeMeToMyWallet = function() {
    if (g_JaxxApp['_isPairingNewWallet'] && g_JaxxApp['_isPairingNewWallet'] == true) {
        g_JaxxApp._settings.resetJaxxCache();
        window.location.reload(true);
    }

    g_JaxxApp['__newWalletFromScratch'] = true;
    // preapre the CSS of the CREATING INTERFACE OVERALY
    var creatingWalletOverlay = $('.creatingWallet');
    creatingWalletOverlay.css('opacity', '0');
    creatingWalletOverlay.css('display', 'initial');
    creatingWalletOverlay.css('transition', 'opacity 0.5s');
    // Fade In element after the CSS changes have made the DOM
    creatingWalletOverlay.css('opacity', '1');
    // goint with native transitions as jQuery.fadeIn, fadeOut was not very smooth during testing
    jaxx.Registry.setWalletLasttState('ready');
    Navigation.startBlit();
    Navigation.clearSettings();
    this._setWalletType = "newWallet";
    this._setWalletType = "newWallet";

    initializeJaxx(function() {
        Navigation.closeMainMenu()
        //sets a flag that will notify the app that is out of setup mode.
        localStorage.setItem('wallet_setup', false);
    });
};

JaxxUIIntro.prototype.pushExpressCoinOrderToSettings = function(){
    // Extract ordering
    var rows = $('.pageExpressWalletSetup .coinList tbody tr');
    var currencyArray = [];

    for (var i = 0; i < rows.length; i++){
        currencyArray.push($($('.pageExpressWalletSetup .coinList tbody tr').get(i)).attr('value'));
    }

    g_JaxxApp.getSettings().setCryptoCurrencyPositionData(currencyArray);
};

JaxxUIIntro.prototype.selectCoinOptionExpress = function(coinType){
    if (this.isCoinEnabledExpress(coinType)){
        this.disableCoinExpress(coinType);
    } else {
        this.enableCoinExpress(coinType);
    }

    if ($('.pageExpressWalletSetup .cssCurrencyisChecked').length > 0) {
        $('.pageExpressWalletSetup .btnContinue').removeClass('cssStartHidden');
    } else {
        $('.pageExpressWalletSetup .btnContinue').addClass('cssStartHidden');
    }
};

JaxxUIIntro.prototype.isCoinEnabledExpress = function(coinType){
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    return $('.pageExpressWalletSetup .coinList .coinType' + coinAbbreviatedName+' .cssSelectedCurrency .cssCircleUnchecked').hasClass('cssCurrencyisChecked');
};

JaxxUIIntro.prototype.enableCoinExpress = function(coinType){
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    $('.pageExpressWalletSetup .coinList .coinType' + coinAbbreviatedName + ' .cssSelectedCurrency .cssCircleUnchecked').addClass('cssCurrencyisChecked');
    $('.pageExpressWalletSetup .coinList .coinType' + coinAbbreviatedName).addClass('cssCurrencyHighlightText');
};

JaxxUIIntro.prototype.disableCoinExpress = function(coinType) {
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    $('.pageExpressWalletSetup .coinList .coinType' + coinAbbreviatedName + ' .cssSelectedCurrency .cssCircleUnchecked').removeClass('cssCurrencyisChecked');
    $('.pageExpressWalletSetup .coinList .coinType' + coinAbbreviatedName).removeClass('cssCurrencyHighlightText');
};

JaxxUIIntro.prototype.makeContinueAppearOnPage = function(strPageSelector){
    // $(strPageSelector + ' .btnContinue').text('CONTINUE');
    $(strPageSelector + ' .btnContinue').fadeIn();
}

JaxxUIIntro.prototype.makeContinueDisappearOnPage = function(strPageSelector) {
    // $(strPageSelector + ' .btnContinue').text('');
    $(strPageSelector + ' .btnContinue').fadeOut();
}

JaxxUIIntro.prototype.pressNextButtonAtVerifyMnemonic = function(){
    Navigation.clearSettings();
}

JaxxUIIntro.prototype.showEnterNewPinSettingsCustom = function(successMessage) {
    var self = this;

    JaxxUI._sUI.setupPinPad('.changePinCodeCustomIntroOption .settingsEnterPinPad', function(keyPressed){
        self.callbackForPIN(keyPressed);
    });

    $('.changePinCodeCustomIntroOption .settingsEnterPinPadText').text('Create a new PIN');
    $('.changePinCodeCustomIntroOption .settingsEnterNewPinConfirmButton').hide();

    var checkForValid = function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();

        //        console.log("entered pin :: " + enteredPin);

        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            JaxxUI._sUI.setupTemporaryPin(JaxxUI._sUI.getEnteredPINCode());

            self.enableContinueSetupPIN();
        }
    }

    JaxxUI._sUI.setOnPinSuccess(checkForValid);
    JaxxUI._sUI.setOnPinFailure(checkForValid);

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');
    inputElement.focus();
}

JaxxUIIntro.prototype.setupTempEncryptedMnemonic = function(tempEncryptedMnemonic) {
    this._tempEncryptedMnemonic = tempEncryptedMnemonic;
}

JaxxUIIntro.prototype.showConfirmNewPinSettingsCustom = function(successMessage) {
    var self = this;

    this.setConfirmPinCirclesToOrangeBorder();

    JaxxUI._sUI.setupPinPad('.confirmPinCodeCustomIntroOption .settingsEnterPinPad', function(keyPressed){
        self.callbackForPIN(keyPressed);
    });

    this.resetConfirmPINTextForIntroScreen();
    $('.confirmPinCodeCustomIntroOption .settingsEnterNewPinConfirmButton').hide();

    var checkForMatchingPin = function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();

        if (enteredPin === JaxxUI._sUI._temporaryPin) {
            self._temporaryPin = enteredPin;
            self.setConfirmPinCirclesToBlueBorder();
            clearTimeout(self._incorrectPINTimeout);
            $('.confirmPinCodeCustomIntroOption .settingsEnterPinPadText').text('PIN Verified')
            //Navigation.flashBanner(successMessage, 5);
            self.enableContinueConfirmPIN();
        } else if (enteredPin.length === 4) {
            self.incorrectPinIsEntered();
        }
    }

    JaxxUI._sUI.setOnPinSuccess(checkForMatchingPin);
    JaxxUI._sUI.setOnPinFailure(checkForMatchingPin);

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');

    inputElement.focus();
}

JaxxUIIntro.prototype.incorrectPinIsEntered = function(){
    var self = this;
    this.setConfirmPinCirclesToRedBorder();

    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPadText').text('Incorrect PIN');
    clearTimeout(this._incorrectPINTimeout);
    this._incorrectPINTimeout = setTimeout(function(){
        self.resetConfirmPINTextForIntroScreen();
    }, 5000);
}


JaxxUIIntro.prototype.clickCheckboxTermsOfService = function(blnCheckboxValue){
    /*
    if (blnCheckboxValue){
        $('.pageTermsOfService .btnContinue').text('CONTINUE');
    } else {
        $('.pageTermsOfService .btnContinue').text('');
    }
    */
}

JaxxUIIntro.prototype.getTermsOfService = function(){
    return this._jaxxTermsOfService;
}

/*
* Obtain Terms of Service from local storage
* @method getTermsOfServiceVerbatim
* @param {Function} callback - function to fire after obtaining terms of service.
* */
JaxxUIIntro.prototype.getTermsOfServiceVerbatim = function(callback){
    var self = this;
    var url;
    if(Registry.application.config.utils) {
        url = Registry.application.config.utils.termsOfService;
        var filePath = Registry.application.config.utils.localTermsOfService;
        //need to assign key direcly as it seems that Registy has not initialized yet and this is a quicker fix for the
        // time being.
        var key = 'jaxxReleaseNotes';
        jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
            if(err) {
                console.error(err);
            } else {
            var data = jaxx.FileManager.getLocalStorage(key);
            self._jaxxTermsOfService = data[0];
            callback(data);
            }
        });
    } else {
      url = "https://jaxx.io/jaxx-data/jaxx-terms-of-service.php"

      $.getJSON( url, function( data ) {
        if (data && data[0]) {
          self._jaxxTermsOfService = data[0];
          callback(data);
        }
      });
    }

}

JaxxUIIntro.prototype.populateTermsOfServiceVerbatim = function(data){
//    console.log("terms of service data :: " + unescape(this._jaxxTermsOfService.description));

    var scrubbedTitleString = JaxxUtils.scrubInput(this._jaxxTermsOfService.title);
    $('.termsOfServiceModal .title').text(scrubbedTitleString);

    var scrubbedBodyString = JaxxUtils.scrubInput(unescape(this._jaxxTermsOfService.description));
    $('.termsOfServiceModal .termsOfServiceVerbatim').html(scrubbedBodyString);

    // $('.pageTermsOfService .btnContinue').show(); // Enable continue button.
}

JaxxUIIntro.prototype.showTermsOfService = function(){
    $('.termsOfServiceModal').fadeIn(500);
}

JaxxUIIntro.prototype.hideTermsOfService = function(){
    $('.termsOfServiceModal').fadeOut(500);
}

JaxxUIIntro.prototype.getPrivacyPolicy = function(){
    return this._jaxxPrivacyPolicy;
}

JaxxUIIntro.prototype.getPrivacyPolicyVerbatim = function(callback){
    var self = this;
    var url;
  if(Registry.application.config.utils) {
    url = Registry.application.config.utils.jaxxPrivacyPolicy;
    var filePath = Registry.application.config.utils.localChangeLog;
    var key = UTILS_PRIVACY_POLICY;
    jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
      if(err) {
        console.error(err);
      } else {
        var data = jaxx.FileManager.getLocalStorage(key);
        if(data && data[0]) {
          self._jaxxPrivacyPolicy = data[0];
          callback(data);
        }
      }
    });
  } else {
    url = "https://jaxx.io/jaxx-data/jaxx-privacy-policy.php"
    $.getJSON( url, function( data ) {
        if (data && data[0]) {
            self._jaxxPrivacyPolicy = data[0];
            callback(data);
        }
    });
  }

}

JaxxUIIntro.prototype.populatePrivacyPolicyVerbatim = function(data){
//    console.log("terms of service data :: " + unescape(this._jaxxTermsOfService.description));

    var scrubbedTitleString = JaxxUtils.scrubInput(this._jaxxPrivacyPolicy.title);
    $('.privacyPolicyModal .title').text(scrubbedTitleString);

    var scrubbedBodyString = JaxxUtils.scrubInput(unescape(this._jaxxPrivacyPolicy.description));
    $('.privacyPolicyModal .privacyPolicyVerbatim').html(scrubbedBodyString);

    // $('.pageTermsOfService .btnContinue').show(); // Enable continue button.
}

JaxxUIIntro.prototype.showPrivacyPolicy = function(){
    $('.privacyPolicyModal').fadeIn(500);
}

JaxxUIIntro.prototype.hidePrivacyPolicy = function(){
    $('.privacyPolicyModal').fadeOut(500);
}

JaxxUIIntro.prototype.btnContinueTermsOfService = function(){
    //if ($('.pageTermsOfService .checkboxAgreeToTerms:checked').length > 0) {
    //Navigation.clearSettings();

    // Navigation.openModal('loading');
    storeData('hasShownTermsOfService', true, false);
    setTimeout(function() {
        initializeJaxx(function() {
            // $('.pageTermsOfService').hide();
        });
    }, 500);
    //}
}

JaxxUIIntro.prototype.clickCancelTermsOfService = function(){
    this.hideTermsOfService();
    Navigation.pushSettings('pageAttentionMessage');
}

JaxxUIIntro.prototype.toggleCheckboxTermsOfService = function() {
    /*
    if ($('.pageTermsOfService .checkboxAgreeToTerms:checked').length > 0){
        $('.pageTermsOfService .checkboxAgreeToTerms').prop('checked', false);
        this.clickCheckboxTermsOfService($('.pageTermsOfService .checkboxAgreeToTerms').prop('checked'));
    } else {
        $('.pageTermsOfService .checkboxAgreeToTerms').prop('checked', true);
        this.clickCheckboxTermsOfService($('.pageTermsOfService .checkboxAgreeToTerms').prop('checked'));
    }*/
}

JaxxUIIntro.prototype.enableContinueSetupPIN = function(){

    $('.changePinCodeCustomIntroOption .btnContinue').text('CONTINUE');
}

JaxxUIIntro.prototype.disableContinueSetupPIN = function(){
    $('.changePinCodeCustomIntroOption .btnContinue').text('');
}

JaxxUIIntro.prototype.isContinueEnabledSetupPIN = function(){
    return ($('.changePinCodeCustomIntroOption .btnContinue').text() === 'CONTINUE');
}

JaxxUIIntro.prototype.enableContinueConfirmPIN = function(){
    this._pinIsCorrect = true;
    $('.confirmPinCodeCustomIntroOption .btnContinue').text('CONTINUE');
}

JaxxUIIntro.prototype.disableContinueConfirmPIN = function(){
    this._pinIsCorrect = false;
    $('.confirmPinCodeCustomIntroOption .btnContinue').text('');
}

JaxxUIIntro.prototype.isContinueEnabledConfirmPIN = function(){
    return ($('.confirmPinCodeCustomIntroOption .btnContinue').text() === 'CONTINUE');
}

/*
* This is the action fired when user hits continue on custom pair restore wallet after picking currencies & wallets
* */
JaxxUIIntro.prototype.clickContinueSetupPIN = function(){
    if (this.isContinueEnabledSetupPIN()){
        this.showConfirmNewPinSettingsCustom();
        Navigation.pushSettings('confirmPinCodeCustomIntroOption');
        JaxxUI._sUI.clearAllNumPadData();
    }
}

/*
* After entering the pin for the first time in the pin wizard the continue button fires this function.
* */
JaxxUIIntro.prototype.clickContinueConfirmPIN = function(){
    if (this.isContinueEnabledConfirmPIN()){
        Navigation.clearSettings();
        g_JaxxApp.getUser().setPin(this._temporaryPin);
        if (this._tempEncryptedMnemonic === ""){
            this.createWalletWithCallbackCustomUsingPIN();
        } else {
            // this.loadFromTemporarilyStoredMnemonic();
            this.takeMeToMyWallet();
        }
    }
}

JaxxUIIntro.prototype.clickBackConfirmPinScreen = function(){
    Navigation.popSettings();
    this.disableContinueButtonsOnPINScreens();
    g_JaxxApp.getUI().setupTemporaryPin("");
    this.showEnterNewPinSettingsCustom();
    JaxxUI._sUI.clearAllNumPadData();
}

JaxxUIIntro.prototype.callbackForPIN = function(keyPressed){
    // Parameter is string or integer.
    if (keyPressed === 'DEL'){
        this.clickDELOnPIN();
    } else if (keyPressed === 'CLR') {
        this.clickCLROnPIN();
    } else {
        // Number pressed
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();
        // console.log("JaxxUIIntro :: callbackForPIN :: A number was entered into the PIN.");
        if (enteredPin.length === 4 && !(this._pinIsCorrect)){
            this.clickCLROnPIN();
            g_JaxxApp.getUI().clearAllNumPadData();
        }
    }
}

JaxxUIIntro.prototype.clickDELOnPIN = function(){
    var enteredPin = JaxxUI._sUI.getEnteredPINCode();
    if (enteredPin.length === 1){
        this.setConfirmPinCirclesToOrangeBorder();
    }
    if (enteredPin.length === 4 && this.isConfirmPinCircleBorderBlue()){
        this.resetConfirmPINTextForIntroScreen();
        this.setConfirmPinCirclesToOrangeBorder();
    }
    this.disableContinueButtonsOnPINScreens();
}

JaxxUIIntro.prototype.clickCLROnPIN = function(){
    this.resetConfirmPINTextForIntroScreen();
    this.setConfirmPinCirclesToOrangeBorder();
    this.disableContinueButtonsOnPINScreens();
}

JaxxUIIntro.prototype.resetConfirmPINTextForIntroScreen = function(){
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPadText').text('Please verify your PIN');
}

JaxxUIIntro.prototype.disableContinueButtonsOnPINScreens = function(){
    this.disableContinueConfirmPIN();
    this.disableContinueSetupPIN();
}

/*
* This function activates displays the pin screen in the intro screen custom user flow
* */
JaxxUIIntro.prototype.enterPinCodeCustomIntroOption = function(){
    Navigation.pushSettings('changePinCodeCustomIntroOption');
    this.showEnterNewPinSettingsCustom();
    JaxxUI._sUI.initializePinPad();
    JaxxUI._sUI.clearAllNumPadData();
    this.disableContinueButtonsOnPINScreens();

}

JaxxUIIntro.prototype.isConfirmPinCircleBorderBlue = function(){
    return ($('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input.cssBlueBorder').length > 0);
}

JaxxUIIntro.prototype.setConfirmPinCirclesToRedBorder = function(){
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').addClass('cssRedBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').removeClass('cssOrangeBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').removeClass('cssBlueBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').css('color', '#F45B82 !important');
}

JaxxUIIntro.prototype.setConfirmPinCirclesToBlueBorder = function(){
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').removeClass('cssRedBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').removeClass('cssOrangeBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').addClass('cssBlueBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').css('color', '#2681FF !important');
}

JaxxUIIntro.prototype.setConfirmPinCirclesToOrangeBorder = function(){
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').removeClass('cssRedBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').addClass('cssOrangeBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').removeClass('cssBlueBorder');
    $('.confirmPinCodeCustomIntroOption .settingsEnterPinPad input').css('color', '#E76F22 !important');
}

JaxxUIIntro.prototype.startJaxxFromTermsOfServicePage = function(){

    var mnemonic = getStoredData('mnemonic', true);

    if (typeof(mnemonic) !== 'undefined' && mnemonic !== null){
        $('.pageViewKeysTermsOfService .populateMnemonic').text(mnemonic);
    }
    Navigation.pushSettings('pageTermsOfService');
}

JaxxUIIntro.prototype.mnemonicEnteredIsNotValidCustomIntroOption = function(){
    $('.verifyMnemonicCustomIntroOption .btnNext').hide();
}

JaxxUIIntro.prototype.mnemonicEnteredIsValidCustomIntroOption = function(){
    $('.verifyMnemonicCustomIntroOption .btnNext').show();
}

/* Will include later if requirements change.
JaxxUIIntro.prototype.clickNextOnVerifyMnemonicCustomIntroOption = function(){
    wallet.confirmBackup();
    updateWalletUI();
}
*/

JaxxUIIntro.prototype.toggleExpandSetupSecurityPinDescription = function(){
    g_JaxxApp.getUI().toggleTextExpansion('.settings.pageSetupSecurityPinCode .expandableText', '.settings.pageSetupSecurityPinCode .triangleArrow','240px', '60px', 500);
}

JaxxUIIntro.prototype.toggleExpandBackupMnemonicDescription = function(){
    g_JaxxApp.getUI().toggleClosestAncestorExpandableText('.settings.backupMnemonicCustomIntroOption .triangleArrow');
}

JaxxUIIntro.prototype.clickCustomCurrencies = function(){
    g_JaxxApp.getUI().toggleClosestAncestorExpandableText('.pageCustomCurrenciesSetup .triangleArrow');
    if ($('.pageCustomCurrenciesSetup .expandableText').hasClass('cssExpanded')){
        $('.pageCustomCurrenciesSetup .exchangeRateList').css('height', (this._collapsedHeightOfCustomCurrenciesList + 90).toString() + 'px');
    } else {
        $('.pageCustomCurrenciesSetup .exchangeRateList').css('height', (this._collapsedHeightOfCustomCurrenciesList).toString() + 'px');
    }
    // height: calc(100% - 172px) !important;
}

JaxxUIIntro.prototype.populateAllUserKeys = function() {

    $('.allUserKeys').text("gathering all private and public keypairs.. please wait.");

    if (!wallet) {
        setTimeout(function() {
            var mnemonicEncrypted = getStoredData('mnemonic', false);
            if (mnemonicEncrypted) {
                var newWallet = new HDWalletMain();
                newWallet.initialize();
                jaxx.Registry.tempWallet = newWallet;
                newWallet.setupWithEncryptedMnemonic(mnemonicEncrypted, function(err) {
                    if (err) {
                        console.log("JaxxUIIntro.populateAllUserKeys :: loadFromEncryptedMnemonic :: error :: " + err);
                    } else {
                        newWallet.exportAllKeypairs(function(allUserKeypairs) {

                            var allUserKeysCSV = "coinName, publicAddress, privateKey, \n" + allUserKeypairs;

                            console.log("allUserKeysCSV :: \n" + allUserKeysCSV);
                            $('.allUserKeys').text(allUserKeysCSV);
                            $('.allUserKeysCopy').attr('copy', allUserKeysCSV);
                        });
                    }
                });
            }
        }, 100);
//        $('.allUserKeys').text("there is no previous wallet.");
    } else {
        wallet.exportAllKeypairs(function(allUserKeypairs) {
            var allUserKeysCSV = "coinName, publicAddress, privateKey, \n" + allUserKeypairs;

            console.log("allUserKeysCSV :: \n" + allUserKeysCSV);

            $('.allUserKeys').text(allUserKeysCSV);
            $('.allUserKeysCopy').attr('copy', allUserKeysCSV);
        });
    }
}

JaxxUIIntro.prototype.showContinueOnSplashScreen = function(){
    $('.settings.splash .btnContinue').fadeIn();
}

JaxxUIIntro.prototype.splashOptionClicked = function(strSplashOption){
    this.showContinueOnSplashScreen();
}

JaxxUIIntro.prototype.selectSplashSetupOption = function(strSplashOption){
    $('.settings.createNewWallet .radioBtnSplashOption').prop('checked', false);
    $('.settings.splash .optionBox .option' + strSplashOption + ' .optionHeading input').prop('checked', true);
    this.showContinueOnSplashScreen();
}

JaxxUIIntro.prototype.pressContinueSplashOption = function(){

    if( !jaxx.Registry.appState) jaxx.Registry.appState = {};
    var splashOptionChosen = $('.settings.splash .radioBtnSplashOption:checked').attr('value');

    if (splashOptionChosen === 'CreateNewWallet'){

        jaxx.Registry.appState.create = {};
        jaxx.Registry.appState.pair = null;
        jaxx.Registry.generateMnemonic();

        localStorage.setItem('walletType','new-wallet');

        $(".btnOpenCloseExpress").trigger('click');
        Navigation.pushSettings('createNewWallet');

        this._setWalletType = "newWallet";
        //storeData('walletType', this._setWalletType);

    } else if (splashOptionChosen === 'PairFromDeviceStart'){

        jaxx.Registry.appState.pair = {};
        jaxx.Registry.appState.create = null;
        localStorage.setItem('walletType','pair-device');
        Navigation.pushSettings('introLoadJaxxToken');
        this._setWalletType = "pairedWallet";
        //Navigation.pushSettings('pairFromDeviceStart');
        //Navigation.pushSettings('pairFromDeviceCustomOrExpress');
    }
    jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_NEW_WALLET_START);

   // console.log(jaxx.Registry.appState);
}

/*JaxxUIIntro.prototype.setTempMnemonic = function(tempEncryptedMnemonic) {
    console.error(tempEncryptedMnemonic);

    this._tempEncryptedMnemonic = tempEncryptedMnemonic;
}*/

JaxxUIIntro.prototype.pressContinuePairDevices = function(element){
    var mnemonic  = $(element.attr('targetInput')).val();
    $(element.attr('targetInput')).val('');
    jaxx.Registry.pairDeviceMnemonic(mnemonic);
    this._tempEncryptedMnemonic = g_Vault.encryptSimple(mnemonic);

    if (wallet === null){
        Navigation.pushSettings('pressContinuePairDevices');
    }
    else {
        Navigation.pushSettings('pressContinuePairDevices');
    }
};

JaxxUIIntro.prototype.pressContinueCustomOrExpress = function(){
    //after pair devices is chosen, option to create wallet custom or express
    var splashOptionChosen = $('.settings.pressContinuePairDevices .radioBtnSplashOption:checked').attr('value');
    if (splashOptionChosen === 'pairWalletExpress'){
        //this.prepareMnemonicForWalletCreation();
        console.log("express chosen")
        Navigation.pushSettings('createNewWallet');
    } else if (splashOptionChosen === 'pairWalletCustom'){
        Navigation.pushSettings('pairFromDeviceStart');
        console.log('custom chosen')
        //Navigation.pushSettings('pairFromDeviceCustomOrExpress');
    }
}

JaxxUIIntro.prototype.toggleExpandSplashOption = function(strSplashOption){
    var strSelectorForTextBox = '.settings.splash .optionBox .option' + strSplashOption;
    var strSelectorForTriangleArrow = '.settings.splash .optionBox .option' + strSplashOption + ' .triangleArrow';
    if ($(strSelectorForTextBox).hasClass('cssExpanded')){
        g_JaxxApp.getUI().closeTextExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, '60px', 500);
    } else {
        if (strSplashOption === 'CreateNewWallet'){
            g_JaxxApp.getUI().closeTextExpansion('.settings.splash .optionBox .optionPairFromDeviceStart', '.settings.splash .optionBox .optionPairFromDeviceStart .triangleArrow', '60px', 500);
            g_JaxxApp.getUI().openTextExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, '160px', 500);
        } else if (strSplashOption === 'PairFromDeviceStart'){
            g_JaxxApp.getUI().closeTextExpansion('.settings.splash .optionBox .optionCreateNewWallet', '.settings.splash .optionBox .optionCreateNewWallet .triangleArrow', '60px', 500);
            g_JaxxApp.getUI().openTextExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, '160px', 500);
        }
    }
}

JaxxUIIntro.prototype.showConfirmNewPinSettingsFromViewKeys = function(){
    var self = this;
    var successCallback = function(){
        self.correctPinIsEnteredInViewKeysConfirm();
    };
    g_JaxxApp.getUI().showConfirmExistingPinSettings(successCallback);

    /*
    // this.setConfirmPinCirclesToOrangeBorder();

    JaxxUI._sUI.setupPinPad('.viewMnemonicConfirmPinViewKeys .settingsEnterPinPad', function(keyPressed){
        self.callbackForPIN(keyPressed);
    });

    //$('.settings.viewMnemonicConfirmPinViewKeys .settingsEnterPinPadText').text('Verify Current PIN');
    //$('.viewMnemonicConfirmPinViewKeys .settingsEnterNewPinConfirmButton').hide();

    var checkForMatchingPin = function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();

        if (enteredPin === JaxxUI._sUI._temporaryPin) {
            //self.setConfirmPinCirclesToBlueBorder();
            //clearTimeout(self._incorrectPINTimeout);
            //$('.confirmPinCodeCustomIntroOption .settingsEnterPinPadText').text('PIN Verified')
            //Navigation.flashBanner(successMessage, 5);
            self.correctPinIsEnteredInViewKeysConfirm();
        } else if (enteredPin.length === 4) {
            self.incorrectPinIsEnteredInViewKeysConfirm();
        }
    }

    JaxxUI._sUI.setOnPinSuccess(checkForMatchingPin);
    JaxxUI._sUI.setOnPinFailure(checkForMatchingPin);

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');

    inputElement.focus();

    //
    */
    /*
    JaxxUI._sUI.setupPinPad('.viewMnemonicConfirmPinViewKeys .settingsEnterPinPad');

    $('.settingsEnterPinPadText').text('Confirm PIN')

    JaxxUI._sUI.setOnPinSuccess(function() {
        JaxxUI._sUI.deinitializePinPad();
        successCallback();
    });

    JaxxUI._sUI.setOnPinFailure(function() {

    });

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');
    inputElement.focus();
    */

}

JaxxUIIntro.prototype.incorrectPinIsEnteredInViewKeysConfirm = function(){

}

JaxxUIIntro.prototype.correctPinIsEnteredInViewKeysConfirm = function(){
    this.prepareAllUserKeysPage();
}

JaxxUIIntro.prototype.prepareAllUserKeysPage = function(){
    //this.populateAllUserKeys();
    Navigation.pushSettings("pageViewKeysTermsOfService");
}



JaxxUIIntro.prototype.clickViewKeysButton = function(){
    if (g_JaxxApp.getUser().hasPin()){
        this.showConfirmNewPinSettingsFromViewKeys();
        Navigation.pushSettings("viewMnemonicConfirmPinViewKeys");
    } else {
        this.prepareAllUserKeysPage();
    }
}

JaxxUIIntro.prototype.toggleHeightForCurrenciesListCustomIntroOption = function(){
    // @Note: Special action runs before script action which causes expansion.
    strSourceElementSelector = ".pageCustomCurrenciesSetup .expandableText";
    intHeightDifference = parseInt($(strSourceElementSelector).attr("expandedHeight")) - parseInt($(strSourceElementSelector).attr("collapsedHeight"));
    strTargetElementSelector = ".pageCustomCurrenciesSetup .cssList";
    if ($(strSourceElementSelector).hasClass("cssExpanded")){
        g_JaxxApp.getUI().changeHeightOfElement(strTargetElementSelector, -intHeightDifference);
    } else {
        g_JaxxApp.getUI().changeHeightOfElement(strTargetElementSelector, intHeightDifference);
    }
}

JaxxUIIntro.prototype.clickProceedToBackupToShowMnemonic = function(){
    var mnemonic = getStoredData('mnemonic', true);
    $('.viewMnemonicCustomIntroOption .populateMnemonic').text(mnemonic);
    Navigation.pushSettings('viewMnemonicCustomIntroOption');
};

JaxxUIIntro.prototype.clickSkipMnemonicPromptPinSetup = function(){
    Navigation.pushSettings('pageSetupSecurityPinCode');
}

JaxxUIIntro.prototype.getMnemonicEncrypted = function(){
    return this._mnemonicEncrypted;
}

JaxxUIIntro.prototype.clickCheckboxSecurityPinSetup = function(){
    g_JaxxApp.getUI().clickCheckboxToContinue($(".pageSetupSecurityPinCode .cssCheckboxContainer"), $(".pageSetupSecurityPinCode .btnContinue"));
}

JaxxUIIntro.prototype.clickCheckboxDisplayBackupPhraseInIntro = function(){
    g_JaxxApp.getUI().clickCheckboxToContinue($(".backupMnemonicCustomIntroOption .cssCheckboxContainer"), $(".backupMnemonicCustomIntroOption .btnContinue"));
}

JaxxUIIntro.prototype.toggleCoinIsEnabledExpress = function(element){
    // This function listens for a checkbox click.
    var coinType = HDWalletHelper.dictCryptoCurrency[$(element).attr('value')].index;
    this.selectCoinOptionExpress(coinType)
}

JaxxUIIntro.prototype.loadFromTemporarilyStoredMnemonic = function(){

    // console.log('TODO');
    // g_JaxxApp.getUI().loadWalletFromEncryptedMnemonic(this._tempEncryptedMnemonic);
    /*
    Navigation.clearSettings(); // This is where we add the loading wallet screen.
    loadFromEncryptedMnemonic(, function(err, wallet) {
        if (err) {
            console.log("importMnemonic.import :: error :: " + err);

            Navigation.flashBanner("Error on Import Attempt", 5);
            Navigation.closeModal();
            Navigation.startBlit();
        } else {
            storeData('mnemonic', wallet.getMnemonic(),true);

            Navigation.flashBanner("Successfully Imported!", 5);

            Navigation.closeModal();
            Navigation.startBlit();

            forceUpdateWalletUI();
        }
    });*/
}

JaxxUIIntro.prototype.pressContinueCustomOrExpressPairDevices = function(element) {
    // Store the setup option that has been selected and push settings based on that selection.
    var setupOptionChosen = $('.settings.pressContinuePairDevices .radioBtnPDExpressCustom:checked').attr('value');
    if (setupOptionChosen === 'PDExpress') {
        jaxx.CoinsListSetup.instance.selectCurrency(0);
        this.optionSelected("Express");
        Navigation.pushSettings('pageExpressWalletSetup');
    } else if (setupOptionChosen === 'PDCustom') {
        jaxx.CoinsListSetup.instance.selectCurrency(1);
        this.optionSelected("Custom");
        Navigation.pushSettings('pageCustomWalletSetup');
    }
    $('.takeMeToWallet').hide(); // hacky way to ensure the button is hidden
}

JaxxUIIntro.prototype.clickSkipOnIntroScreens = function(){
    if (this._tempEncryptedMnemonic === ""){
        // this.createWalletWithCallbackCustom();
        Navigation.pushSettings('pageSetupSecurityPinCode'); // Requirement change
    } else {
        this.takeMeToMyWallet();
        // Navigation.closeModal();
        // this.loadFromTemporarilyStoredMnemonic();
    }
}

JaxxUIIntro.prototype.pairFromDeviceScanQR = function() {
    var callback = function(jaxxToken){
        var mnemonic = HDWalletMain.getMnemonicFromJaxxToken(jaxxToken);
        $(".settings.introLoadJaxxToken .validateMnemonic").val(mnemonic);
        $(".settings.introLoadJaxxToken .validateMnemonic").trigger('keyup')
    }
    g_JaxxApp.getUI().scanJaxxToken(callback);
}

JaxxUIIntro.prototype.skipToCreateWalletWithoutPinCustomSetup = function(){
    if (this._tempEncryptedMnemonic === ""){
        this.createWalletWithCallbackCustom();
        // Navigation.pushSettings('pageSetupSecurityPinCode'); // Requirement change
    } else {
        this.takeMeToMyWallet();
        // this.loadFromTemporarilyStoredMnemonic();
    }
}

JaxxUIIntro.prototype.setSizeOfScrollableListForCustomCoins = function(){
    setTimeout(function (totalHeight) {
        // jaxx_ui.toggleNearbyExpandableDetails
        var expandableTextHeight = $(".pageCustomWalletSetup .expandableText").height();
        var footerHeight = $(".pageCustomWalletSetup .cssBackContinue").height();
        var headerHeight = $(".pageCustomWalletSetup .cssHeader").height();
        var heightToSubtract = expandableTextHeight + footerHeight + headerHeight;
        var totalHeight = window.innerHeight - heightToSubtract;
        $('.pageCustomWalletSetup .cssCustomWalletsCoinListOverlay').css('height', totalHeight.toString() + 'px');
    }, 500);
}

JaxxUIIntro.prototype.showWarningPageBeforeViewKeys = function(element){
    var element = $('.settings.pageWarningBeforeViewKeys .pairDeviceShowMnemonicButton');
    //element.removeClass('cssBlueButtonWide');
    //element.addClass('cssGreyButtonWide');
    //element.css('cursor', 'default');
    //element.attr('pushSettings', null);
    element.hide();

    countdownButtonUpdate(element, 'I Understand: ', 6, null, function() {
      element.show();
      //element.removeClass('cssGreyButtonWide');
      //element.addClass('cssBlueButtonWide');
      //element.text('I Understand');
      //element.css('cursor', 'pointer');
      //element.attr('pushSettings', 'viewJaxxToken');
    });

    var elementTwo = $('.settings.pageWarningBeforeViewKeys .pairDeviceShowMnemonicCount');
    elementTwo.fadeIn();

    countdownButtonUpdate(elementTwo, '', 5, function(timeRemaining) {
      elementTwo.text(timeRemaining);
    }, function() {
      elementTwo.fadeOut();
    });
    Navigation.pushSettings('pageWarningBeforeViewKeys');
}