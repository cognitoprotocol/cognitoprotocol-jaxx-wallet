var JaxxController = function() {
    /*
    this._jaxxUIIntro = new JaxxUIIntro();

    this._wWidth = 0;
    */
}

JaxxController.allWindows = {
    "somevar1": false,
    "somevar2": false
};
/*
JaxxUI.runAfterNextFrame = function(callback, passthroughParams) {
    //@note: this causes the tx list to behave strangely.
    //    var callbackNextFrame = function() {
    callback(passthroughParams);
    //    }
    /
    //    requestAnimationFrame(callbackNextFrame);
}*/

JaxxController.prototype.initialize = function() {
    /*
    console.log("[ Jaxx :: UI Initialize ]");

    this._jaxxUIIntro.initialize();
    JaxxUI._sUI = this;

    this._mainPinPadElementName = '';

    this._pinEntryFocus = 0;
    this._f_onPinSuccess = function() {};
    this._f_onPinFailure = function() {};

    this._temporaryPin = "";

    this._miningFeeModalSetup = {};

    this.refreshSizes();
    this.initializeElements();

    this.mainMenuShowMenu();

    //    console.log("JaxxUI.allWindows :: " + JSON.stringify(JaxxUI.allWindows, null, 4) + " :: " + Object.keys(JaxxUI.allWindows));

    var allKeys = Object.keys(JaxxUI.allWindows);

    for (var i = 0; i < allKeys.length; i++) {
        var curKey = allKeys[i];

        console.log("change key :: " + key + " :: " + JaxxUI.allWindows[key]);
        this._windowsActive[key] = JaxxUI.allWindows[key];
    }
    */
}

JaxxController.prototype.keyUpOnSweepPrivateKey = function (){
    var coinType = g_JaxxApp.getUI().getTransferPaperWalletCoinType();
    var value = $('.settings.sweepPrivateKey input').val();

    function disableButton() {
        var element = $('.sweepNextButton');
        element.addClass('cssStartHidden')
        //element.removeClass('cssEnabled');
        //element.removeClass('cssBlueButton');
        //element.addClass('cssGreyButton');
        element.css('cursor', 'default');
        //element.attr('specialAction', null);
        //element.attr('pushSettings', null);
    }

    function enableButton() {
        var element = $('.sweepNextButton');
        element.removeClass('cssStartHidden');
        //element.addClass('cssBlueButton');
        //element.removeClass('cssGreyButton');
        element.css('cursor', 'pointer');
        //element.attr('specialAction', 'sweepPrivateKey.prepare');
        //element.attr('pushSettings', 'confirmSweepPrivateKey');
    }

    function enableButtonEncrypted() {
        var element = $('.sweepNextButton');
        element.removeClass('cssStartHidden');
        //element.addClass('cssBlueButton');
        //element.removeClass('cssGreyButton');
        element.css('cursor', 'pointer');
        //element.attr('specialAction', 'sweepPrivateKey.showDecrypt');
        //element.attr('pushSettings', 'sweepPrivateKeyPasswordEntry');
    }

    if (value === "") {
        disableButton();
        return;
    }

    //    console.log("value :: " + value);

    var isPlainPrivateKey = false;

    isPlainPrivateKey = HDWalletPouch.isValidPrivateKey(coinType, value);

    if (isPlainPrivateKey === true) {
        //        console.log("regular private key detected");
        enableButton();
    } else {
        //check if is encrypted private key
        var isEncryptedPrivateKey = false;
        if (coinType === COIN_BITCOIN) {
            isEncryptedPrivateKey = isValidBIP38key(value);
        } else if (coinType === COIN_ETHEREUM) {
            isEncryptedPrivateKey = isValidETHAESkey(value);
        } else if (coinType === COIN_DASH) {
            //@note: @here: this should work.
            isEncryptedPrivateKey = isValidBIP38key(value);
        }

        if (isEncryptedPrivateKey ){
            //            console.log("encrypted private key detected")
            enableButtonEncrypted();
        } else{
            //            console.log("invalid private key detected");
            disableButton();
        }
    }
}

JaxxController.prototype.someExampleFunction = function(element){
    console.log("Some Example");
}

JaxxController.prototype.clickBackExpressWalletSetup = function(element){
    Navigation.popSettings();

    $('.pageExpressWalletSetup .coinListExpress tbody').off('click', 'tr');
}

JaxxController.prototype.clickMiningOption = function(element){
    jaxx.MiningFeeView.instance.onSelect(element);
}

/*
 * Handles clicks over mining fee selector popup
*/
JaxxController.prototype.clickMiningOptionPopup = function(element){

    var pouch = wallet.getPouchFold(curCoinType);
    var elementToTrigger = $(element).find("input:radio");
    var coinId = 0;
    if (elementToTrigger[0].id === 'averageMiningFeeMainMenu') coinId = 1;
    if (elementToTrigger[0].id === 'fastMiningFeeMainMenu') coinId = 2;

    // console.log('CLICK MINING FEES | clickMiningOptionPopup :: ', element);

    if(pouch.hasOwnProperty('setMiningFeeLevel')) pouch.setMiningFeeLevel(coinId);

    $(element).find('.cssMiningFeeRadioBtn input').prop('checked', true);
    $(elementToTrigger).trigger('change');
    g_JaxxApp.getUI().pushBTCMiningFeeFromPouchToModal();
}

JaxxController.prototype.keyupCustomMiningOption = function(element){
    var customMiningFee = $(".enterCustomMiningFee").val();
    wallet.getPouchFold(0).setCustomMiningFee(customMiningFee);
    // g_JaxxApp.getUI().setupMiningFeeSelector('MainMenu');
}

JaxxController.prototype.clickContinueButtonForTransferPaperWallet = function(){
    // This is the 'Transfer to Jaxx' Button
    specialAction("sweepPrivateKey.execute");
    g_JaxxApp.getUI().setStandardMessageForTransferPaperWallet();
}

JaxxController.prototype.clickContinueButtonForInputPrivateKey = function(){
    // This is run when the 'Next' button is clicked on sweepPrivateKey page
    $('.confirmSweepPrivateKey .continueButton').hide();
    specialAction('sweepPrivateKey.prepare');
}

JaxxController.prototype.clickDisplayPrivateKeysMenuOption = function(element){
    // if (coinType === COIN_ETHEREUM){
    //     $(".backupPrivateKeyListETHLegacyWarning").hide();
    //     $(".accountDataEthereumLegacyKeypair").hide(); // This
    //     $(".nonHDMessage").hide(); // This
    //     $(".wrapperDisplayMessageForPrivateKeys").hide();
    // }
    var coinType = parseInt($(element).attr("value"));
    var symbol = $(element).data("symbol");
    var displayName = $(element).data('displayname');
    var pageDisplayPrivateKeysName =  'backupPrivateKeys' + displayName; //HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents.pageDisplayPrivateKeysName;
    // wallet.getPouchFold(coinType).getDataStorageController().activate();
    $('.' + pageDisplayPrivateKeysName + ' .textDisplayMessageForPrivateKeys').show();
    Navigation.pushSettings(pageDisplayPrivateKeysName, function(){
        setupBackupPrivateKeys(coinType, symbol)
    });
}

JaxxController.prototype.clickAddMoreTransactionsToTransactionList = function(element) {
    var coinAbbreviatedName = $(element).attr('value');
    var coinType = HDWalletHelper.dictCryptoCurrency[coinAbbreviatedName].index;
    wallet.getPouchFold(coinType).increaseNumberOfTransactionsInHistory();
    g_JaxxApp.getUI().updateTransactionListWithCoin(coinType);
}
/*
* Function fired when user hits continue after entering mnemonic on the pair restore wallet screen
* @method clickContinuePairFromDevice
* @param {DOM Element} element
* */
JaxxController.prototype.clickContinuePairFromDevice = function(element){
    g_JaxxApp.getUI().hideHamburgerMenu();
    g_JaxxApp['_isPairingNewWallet'] = true;
    var mnemonic = $(element.attr('targetInput')).val();
    $(element.attr('targetInput')).val('') ; //Clear HTML field or it stays there


    //Handle the case where navigation malfunction and did not proceed to the next screen
    $(element).removeClass('cssEnabled').removeClass('enabled');
    //Ensure when mnemonic is blank, no proceeding to the next step and give user warning.
    if(mnemonic == ''){
        Navigation.flashBanner("UI Error (UI001) occurred, please restart the application and try again.");
        return;
    }

    jaxx.Registry.pairDeviceMnemonic(mnemonic);
    Navigation.pushSettings('pressContinuePairDevices');
    //sets a flag that will notify the app that is in wallet setup mode.
    localStorage.setItem('wallet_setup', true);
};

JaxxController.prototype.resetPairFromDeviceInput = function(element){
    $(".loadJaxxToken .validateMnemonic").val("");
    $(".loadJaxxToken .validateMnemonic").trigger('keyup');
};

JaxxController.prototype.generatePrivateKeysBasedOnCheckedCoinsInMenu = function(){
    jaxx.PrivateKeysViewController.instance.displayPrivateKeys();
};

JaxxController.prototype.clickReleaseNotesContinueButton = function(){
    Navigation.pushSettings('pageTermsOfService');
};

JaxxController.prototype.resetTimerForTimeLastActive = function() {
    jaxx.Registry.timeLastActive = new Date();
    jaxx.Registry.application$.triggerHandler(jaxx.Registry.WAKE_UP);
};

JaxxController.prototype.showCoinBulletin = function(element){
    var coinAbbreviatedName = $(element).attr('value');
    jaxx.Application.instance.modalViewController.showCoinBulletinFromMenu(coinAbbreviatedName);
};

JaxxController.prototype.clickCoinBulletinCheckmark = function(element){
    if ($(".coinBulletinCheckmark").hasClass("enabled")){
        $(".coinBulletinCheckmark").removeClass("cssEnabled");
        $(".coinBulletinCheckmark").removeClass("enabled");
        $(".coinBulletinCheckmark .cssCircleUnchecked").removeClass("cssCurrencyisChecked");

    } else {
        $(".coinBulletinCheckmark").addClass("cssEnabled");
        $(".coinBulletinCheckmark").addClass("enabled");
        $(".coinBulletinCheckmark .cssCircleUnchecked").addClass("cssCurrencyisChecked");
    }
};

JaxxController.prototype.clickCoinBulletinCloseButton = function(element){
    var coinAbbreviatedName = $(element).attr("value");
    var bulletinData = g_JaxxApp.getUI().getCoinBulletinData()[coinAbbreviatedName];
    var version = bulletinData["version"];

    // If check-mark is checked then hide for switch coin forever

    if ($(".coinBulletinCheckmark").hasClass("enabled")){
        g_JaxxApp.getSettings().addVersionToCoinBulletinListHideOnSelect(coinAbbreviatedName, version);

        if($("#bulletinCloseButton").attr("value") === "ALL") {
            // If "Don't Show This Bulletin Again" option is clicked, on close, for a generic bulletin: trigger this
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.HIDE_ALL_BULLETIN);
        }
    }

    Navigation.closeModal();
};
