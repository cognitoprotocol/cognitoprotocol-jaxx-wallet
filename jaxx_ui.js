//@note: @here: super useful for debugging stack traces of objects being hidden/shown
//jQuery(function($) {
//
//    var _oldShow = $.fn.show;
//
//    $.fn.show = function(speed, oldCallback) {
//        return $(this).each(function() {
//            var obj         = $(this),
//                newCallback = function() {
//                    if ($.isFunction(oldCallback)) {
//                        oldCallback.apply(obj);
//                    }
//                    obj.trigger('afterShow');
//                };
//
//            // you can trigger a before show if you want
//            obj.trigger('beforeShow');
//
//            // now use the old function to show the element passing the new callback
//            _oldShow.apply(obj, [speed, newCallback]);
//        });
//    }
//
//    var _oldHide = $.fn.hide;
//
//    $.fn.hide = function(speed, oldCallback) {
//        return $(this).each(function() {
//            var obj         = $(this),
//                newCallback = function() {
//                    if ($.isFunction(oldCallback)) {
//                        oldCallback.apply(obj);
//                    }
//                    obj.trigger('afterHide');
//                };
//
//            // you can trigger a before show if you want
//            obj.trigger('beforeHide');
//
//            // now use the old function to show the element passing the new callback
//            _oldHide.apply(obj, [speed, newCallback]);
//        });
//    }
//});

var JaxxUI = function() {

    this._jaxxUIIntro = new JaxxUIIntro();
    jaxx.Registry.registry['JaxxUIIntro'] = this._jaxxUIIntro;

    // console.warn(this._jaxxUIIntro);

    this._uiTimers = {};

    this._wWidth = 0;
    this._wHeight = 0;

    this._mainMenuIsOpen = false;

    this._numPinEntryFields = 4;
    this._sUI = null;

    this._hasDisplayedJaxxNews = false;

    this._numHistoryElementsDefault = 10;
    this._numHistoryElementsDisplayed = [];

    this._txFullHistory = [];

    this._walletWasChangedInMenu = false;
    this._hasAttachedScriptAction = false;

    this._coinBannerCarousel = null; // Should be not null when the banner carousel has been initialized.
    this._coinBannerCarouselTimeout = null;
    this._coinBannerCarouselAnimationTime = 300;
    this._coinBannerCarouselTimeoutTime = 5000;

    this._coinBannerCarouselDragTimeout = null;

    this.$topCarousel = null;
    this.$topCarouselData = null;

    this._coinDontHover = {} // Example {0: true, 1 : false, ..., NUMCOINTYPES(of whatever its called)}

    //@note: @todo: @here: @next: refactor into JaxxData
    this._jaxxNewsData = null;

    this._criticalVersionUpdatesShown = [];

    this._shouldShowEtcEthSplitIfNoneAvailable = false;

    this._disableETCETHSplitOption = false;

    this._windowsActive = {};

    // Flickity carousel stuff
    this._flickityNotificationFooter = null;

    this._isNotificationFooterOpen = false;

    //pin stuff
    this._correctPINTimeout = false;
    this._incorrectPINTimeout = null;
    this._pinPadResetText = null;
    this._transferPaperWalletCoinType = 0;

    this._mainMenuToggleLocked = false; // Used to surpress events where the menu is locked

    this._defaultPaperWalletMessage = ""; //
    this._isTipsAndTricksShown = false;
    this._debugLockBalanceUpdate = ""; // Used for debugging the balance display.

    this._privateKeysDisplayedInList = [];
    this._strKeyPair = "";

    this._dictWholeNumberFontSize = {1: 41, 2: 41, 3: 41, 4: 38, 5: 38, 6: 38, 7: 30, 8: 30, 9: 30, 10: 30};
    this._dictWholeNumberFontSizeOverride = [{"max-width": 375, "font-dict": {1: 40, 2: 40, 3: 40, 4: 33, 5: 33, 6: 33, 7: 33, 8: 24, 9: 24, 10: 24}}, {"max-width": 360, "font-dict": {1: 37, 2: 37, 3: 37, 4: 33, 5: 33, 6: 31, 7: 29, 8: 25, 9: 24, 10: 22}},{"max-width": 320, "font-dict": {1: 32, 2: 32, 3: 32, 4: 26, 5: 26, 6: 26, 7: 23, 8: 20, 9: 18, 10: 17}}]; // max-width must be in descending order.

    this._release_notes_have_been_shown = false;
    this._jaxxReleaseBulletin = [];
    this._jaxxReleaseBulletinVersions = [];

    this._changeLog = "";
    this._changeLogSummaryInfoFromServer = "";

    this._jaxxCoinBulletin = {};

    this._startJaxxWithTermsOfServicePageWasRun = false;
}



JaxxUI.allWindows = {
    "mainMenuPrimary": false,
    "mainMenuWallets": false,
    "mainMenuCurrencies": false,
};

JaxxUI.runAfterNextFrame = function(callback, passthroughParams) {
    //@note: this causes the tx list to behave strangely.
//    var callbackNextFrame = function() {
    callback(passthroughParams);
//    }
//
//    requestAnimationFrame(callbackNextFrame);
}

JaxxUI.prototype.setWindowActive = function(windowName, status) {
    if (JaxxUI.allWindows.hasOwnProperty(windowName)) {
        this._windowsActive[windowName] = status;
    } else {
        console.log("JaxxUI.setWindowActive :: error :: window :: " + windowName + " doesn't exist in JaxxUI.allWindows");
    }
}

JaxxUI.prototype.getWindowActive = function(windowName) {
    if (JaxxUI.allWindows.hasOwnProperty(windowName)) {
        return this._windowsActive[windowName];
    } else {
        console.log("JaxxUI.setWindowActive :: error :: window :: " + windowName + " doesn't exist in JaxxUI.allWindows");
    }
}

JaxxUI.prototype.reset = function() {
    for (key in JaxxUI.allWindows) {
        this._windowsActive[key] = JaxxUI.allWindows[key];
    }
}

JaxxUI.prototype.initialize = function() {
    console.log("[ Jaxx :: UI Initialize ]");

    if (curProfileMode === PROFILE_LANDSCAPE) {
        this._numHistoryElementsDefault = 20;
    } else {
        this._numHistoryElementsDefault = 10;
    }

    this.attachClickEventsToAllScriptActionElements();

    this._jaxxUIIntro.initialize();

    JaxxUI._sUI = this;

    this._mainPinPadElementName = '';

    this._pinEntryFocus = 0;
    this._f_onPinSuccess = function() {};
    this._f_onPinFailure = function() {};

    this._temporaryPin = '';

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

    this._uiTimers['displayPrivateKey'];
    // this.initializeBTCMiningOptions(wallet);

    this._defaultPaperWalletMessage = $(".settings.confirmSweepPrivateKey .spinner").text();
}

JaxxUI.prototype.UITimer = function(strTimerName, objTimer){
    if (typeof(objTimer) !== 'undefined' && objTimer !== null){
        return this._uiTimers[strTimerName] = objTimer;
    } else {
        return this._uiTimers[strTimerName];
    }
}


JaxxUI.prototype.populateCurrencyList = function(targetCoinType) {
    if(!this.rowsGenerated){
        this.generateSettingsCurrencyRows();
        this.rowsGenerated = true;
    }


    //console.warn('JaxxUI.prototype.populateCurrencyList  ' + targetCoinType);

    if (typeof(targetCoinType) === 'undefined' || targetCoinType === null){
        targetCoinType = curCoinType;
    }

    //if (this.getWindowActive('mainMenuCurrencies')) {
        var activeCurrencies = Registry.getFiatPriceController().getActiveFiatCurrencies();

        var currencylist = $('.exchangeRateList').children().children(); // Gets the table rows.
        for (i = 0; i < currencylist.length; i++){
            var element = currencylist[i];
            // console.log(element);
            var fiatUnit = $(element).attr('value');

            if ($.inArray(fiatUnit, activeCurrencies) > -1) // means it's in the array
            {
                this.toggleCurrencyCheckbox(element);
            }
            //console.log(fiatUnit);
            //var targetElement = $('.cssSetCurrency .cssCurrency').filter('tr[value="' + value + '"]').find('.rate');
            this.populateExchangeRateInMainMenuCurrencyList(targetCoinType, fiatUnit);
            //$(targetElement).text();
        }
   // }
}

JaxxUI.prototype.generateSettingsCurrencyRows = function(){
   // console.warn('generateSettingsCurrencyRows');
    // This function generates the currency position order as well as the html elements for the settings rows.
    // <tr class="currency cssCurrency toggleCurrency scriptAction" value="AUD"><td class="cssSelectedCurrency"><div class="cssCircleUnchecked"></div></td> <td class="cssUnit">AUD</td><td class="name">Australian Dollar</td><td class="rate rateAUD"> </td></tr>
    var self = this;
    var fiatUnitArray = [];
    //var strTableSelector = ''; @TODO: implement this as a refactor.
    // if currency order is stored
    // 		then restore from currency order
    // else
    // 		Get all currency keys as listed from HDWalletHelper.dictFiatCurrency
    var storedCurrencyOrder = getStoredData('currencies_position_order', false);
    if (storedCurrencyOrder) {
        fiatUnitArray = JSON.parse(storedCurrencyOrder);
    } else {
        for (var key in jaxx.FiatPriceController.fiatDictionary){
            //if (jaxx.FiatPriceController.fiatDictionary.hasOwnProperty(key)) { // hasOwnProperty is needed because it's possible to insert keys into the prototype object of dictionary
                fiatUnitArray.push(key);
            //}
        }
    }
    // @TODO: We should push currencies to the array that are not included just as a safeguard (also remove ones that don't exist at all.)
    $('.mainMenuCurrencies .exchangeRateList tbody').empty();
    for (var i = 0; i < fiatUnitArray.length; i++) {
        key = fiatUnitArray[i] // We should expect key to be something like 'CAD'
        if (jaxx.FiatPriceController.fiatDictionary.hasOwnProperty(key)) { // hasOwnProperty is needed because it's possible to insert keys into the prototype object of dictionary
            // 'key' should be something like 'USD'
            // Use HDWalletHelper.dictFiatCurrency['AUD']['name']
            //			console.log(key);
            var column1 = '<td class="cssSelectedCurrency"><div class="cssCircleUnchecked"></div></td>';
            var column2 = '<td class="cssUnitAndCurrency"><div class="cssUnit">'  + key + '</div><div class="name">' +jaxx.FiatPriceController.fiatDictionary[key]['name'] + '</div></td>'
            var column4 = '<td class="rate rate' + key.trim().toUpperCase() + '"></td>';
            var column5 = '<td class="handle cssHandle"><img src="images/dragAndDrop.svg" alt="" height="13" width="13" style="position:absolute; padding-top:12px;"></td>';
            var tableRow = '<tr class="currency cssCurrency scriptAction" value="' + key + '" specialAction="toggleCurrency">' + column1 + column2 + column4 + column5 + '</tr>';
            $('.mainMenuCurrencies .exchangeRateList tbody').append(tableRow);
        } else {
            console.log('Somehow an invalid key was put in.')
        }
    }

    //this.pushCurrencyMainMenuToJaxxSettings();

    // Attach listeners.
    $('.mainMenuCurrencies .exchangeRateList .scriptAction').off();
    $('.mainMenuCurrencies .exchangeRateList .scriptAction').click(function (event) { // Add the scriptAction triggers again.
         scriptAction(event);
    });

    var strSelectorForTable = '.mainMenuCurrencies .exchangeRateList';
    // Make the table sortable.
    $(strSelectorForTable + " tbody").sortable({
        /*items: "> tr:not(:first)",*/
        appendTo: "parent",
        axis: 'y',
        helper: "clone",
        handle: ".handle",
        update: function(event, ui) { // This function runs when we re-order the list.
            // @TODO: Javascript optimization
            self.pushCurrencyMainMenuToJaxxSettings();
            wallet.getHelper().setFiatUnit(g_JaxxApp.getSettings().getDefaultCurrency());
        },
    }).disableSelection();
}

JaxxUI.prototype.refreshSizes = function() {
    var wWidth = window.innerWidth;
    var wHeight = window.innerHeight;

    //console.log("window dimensions inner (width/height) :: " + window.innerWidth + " :: " + window.innerHeight + " :: outer :: " + window.outerWidth + " :: " + window.outerHeight + " :: " + window.width + " :: " + window.height);

    //console.log(JSON.stringify(window));

    //@note: for Android.

    if (wWidth == 0) {
        if (window.native && window.native.getWindowWidth) {
            wWidth = window.native.getWindowWidth();
            wHeight = window.native.getWindowHeight();
            console.log("Android window dimensions (height/width) :: " + wHeight + " :: " + wWidth);
        }
    }

    //    console.log("screen dimensions :: width :: " + wWidth + " :: " + wHeight);

    //    $('.wallet').css('width', '320px');// !important');
    //    $('.wallet').css('height', '568px');// !important');
    //    this._wWidth = 320;
    //    this._wHeight = 568;
    this._wWidth = wWidth;
    this._wHeight = wHeight;
}

JaxxUI.prototype.getWindowWidth = function() {
    //    if (window.native && window.native.getWindowWidth) {
    //        if (curProfileMode == PROFILE_LANDSCAPE) {
    //            return this._wHeight;
    //        } else {
    //            return this._wWidth;
    //        }
    //    } else {
    return this._wWidth;
    //    }
}

JaxxUI.prototype.getWindowHeight = function() {
    //    if (window.native && window.native.getWindowWidth) {
    //        if (curProfileMode == PROFILE_LANDSCAPE) {
    //            return this._wWidth;
    //        } else {
    //            return this._wHeight;
    //        }
    //    } else {
    return this._wHeight;
    //    }
}

JaxxUI.prototype.getLargerScreenDimension = function() {
    if (this._wWidth > this._wHeight) {
        return this._wWidth;
    } else {
        return this._wHeight;
    }
}

JaxxUI.prototype.setupExternalLink = function(element, linkDisplayText, linkAddress) {
    var stringVersion = null;

    if (element) {
        element.data('linkToExplorer',linkAddress);
        console.log("A :: for element :: " + element + " :: trying :: " + linkAddress + " :: " + linkDisplayText)
        // //test browser env, simple href
        // if(!PlatformUtils.mobileCheck() && !PlatformUtils.extensionCheck() && !PlatformUtils.desktopCheck() ){
        //     element.html("<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>");
        // }
        // else if(PlatformUtils.extensionChromeCheck() || PlatformUtils.extensionFirefoxCheck()) { //ChromeExt doesn't support inline js.
        //     //Possible Workaround #1 : use an href with target blank.
        //     //        console.log("B :: for element :: " + element + " :: trying :: " + linkAddress + " :: " + linkDisplayText)
        //     element.html("<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>");
        // } else if(PlatformUtils.mobileiOSCheck()){
        //     element.html("<a href=\"#\" target=\"_blank\">" + linkDisplayText + "</a>");
        //     element.unbind('click');
        //     element.click({param1: linkAddress}, Navigation.tryToOpenExternalLinkMobile);
        // } else if (PlatformUtils.mobileAndroidCheck()) {
            // We should always call tryToOpenExternalLink() to prevent electron to open url in native Window
            if(PlatformUtils.extensionChromeCheck()){
                element.html("<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>");
            } else {
                element.html("<a href='#' onclick=\"Navigation.tryToOpenExternalLink('"+linkAddress+"')\">" + linkDisplayText + "</a>");
            }
         // } else {
        //     element.html("<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>");
        // }
    } else {
        // if(!PlatformUtils.mobileCheck() && !PlatformUtils.extensionCheck() && !PlatformUtils.desktopCheck() ){
        //     stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>";
        // } else if (PlatformUtils.extensionChromeCheck() || PlatformUtils.extensionFirefoxCheck()) { //ChromeExt doesn't support inline js.
        //     stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>";
        // } else if (PlatformUtils.mobileAndroidCheck() || PlatformUtils.mobileiOSCheck()) {
        // We should always call tryToOpenExternalLink() to prevent electron to open url in native Window
        if(PlatformUtils.extensionChromeCheck()){
            stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>";
        } else {
            stringVersion = "<a href='#' onclick=\"Navigation.tryToOpenExternalLink('"+linkAddress+"')\">" + linkDisplayText + "</a>";
        }
         // } else {
        //     stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + linkDisplayText + "</a>";
        // }
    }
    return stringVersion;
}

JaxxUI.prototype.showHamburgerMenu = function() {
    $('.hamburger').show();
}

JaxxUI.prototype.hideHamburgerMenu = function() {
    $('.hamburger').hide();
}

/*
* Initializes Intro screens with appropriate data
* */
JaxxUI.prototype.initializeElements = function() {
    //    console.log("JaxxUI._sUI :: " + JaxxUI._sUI + " :: " + JaxxUI._sUI._numPinEntryFields);
    //	try {
    //this.initializeTopCarousel();


    //@note: @here: @todo: this is incorrectly placed, should be set up later when an actual wallet is loaded.
    ///this.updateCryptoCurrencyBannersInHeader(true);
    ///this.updateCryptoCurrencyBannersInHeaderCarousel();
    //this.generateSettingsCurrencyRows();
    //this.generateSettingsCryptoCurrencyRows();
    //this.initializeCarouselStickyProperty();
    ///this.initializeFlickityCarousels();
    //this.generatePrivateKeyMenuOptions();
    this.generateTextInDisplayPrivateKeysMenu();

    var versionsForNewsUpdates = JSON.parse(getStoredData('criticalVersionUpdatesShown', false));
    if (typeof(versionsForNewsUpdates) !== 'undefined' && versionsForNewsUpdates !== null){
        this._criticalVersionUpdatesShown = versionsForNewsUpdates;
    }

    var versionForReleaseBulletinUpdates = JSON.parse(getStoredData('_jaxxReleaseBulletinVersions', false));
    if (typeof(versionForReleaseBulletinUpdates) !== 'undefined' && versionForReleaseBulletinUpdates !== null){
        this._jaxxReleaseBulletinVersions = versionForReleaseBulletinUpdates;
    }


    var cryptoCurrenciesAllowed = {};
    if (PlatformUtils.mobileiOSCheck()) {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.ios;
    } else {
        cryptoCurrenciesAllowed = HDWalletHelper.cryptoCurrenciesAllowed.regular;
    }

    var allKeys = Object.keys(jaxx.FiatPriceController.fiatDictionary);

    var currenciesEnabled = [];

    for (var i = 0; i < allKeys.length; i++) {
        var cryptoEnabled = cryptoCurrenciesAllowed[allKeys[i]];
        if (typeof(cryptoEnabled) !== 'undefined' && cryptoEnabled !== null && cryptoEnabled === true) {
            currenciesEnabled.push(allKeys[i]);
            var curElement = $('.displayPrivateKeys' + allKeys[i] + 'SettingsButton');

            if (typeof(curElement) !== 'undefined' && curElement !== null) {
                curElement.show();
            }
        } else {
            var curElement = '.displayPrivateKeys' + allKeys[i] + 'SettingsButton';

            try {
                $(curElement).hide();
            } catch(err) {
                console.log("possible error :: " + err);
            }

            //@note: hide the etc/eth split button if ETC is not enabled.
            if (allKeys[i] === "ETC") {
                this._disableETCETHSplitOption = true;
                $('.checkForEtcEthSplitToolsButton').hide();
            }
        }
    }

    //    $('.displayPrivateKeysDashSettingsButton').hide();


    var pvtKeysDisplayText = "";

    for (var i = 0; i < currenciesEnabled.length; i++) {
        pvtKeysDisplayText += currenciesEnabled[i];
        if (i !== currenciesEnabled.length - 1) {
            if (i === currenciesEnabled.length - 2) {
                pvtKeysDisplayText += " and ";
            } else {
                pvtKeysDisplayText += ", ";
            }
        }
    }


    $('.displayPrivateKeysText').text(pvtKeysDisplayText);
    //this.initializeCarousels(); // Must be run after this.updateCryptoCurrencyBannersInHeader(true);
    //this.updateCoinBannerCarousel();
    //		this.animateHamburgerMenu();
    //	} catch(error) {
    //		console.log('Failed to initialize the programmatic elements of the table.');
    //		console.log(error.message);
    //	}
    if (IS_RELEASE_VERSION) {
        $(".testIndicator").hide();
    } else {
        $(".testIndicator").show();
    }
}

JaxxUI.prototype.initializeFlickityCarousels = function(){
    var self = this;
    //$(document).ready(function(){
    self._flickityNotificationFooter = $('.notificationFooter .carousel').flickity({
        // options
        imagesLoaded: true,
        setGallerySize: false,
    });
    //});
}

JaxxUI.prototype.generateProgrammaticElementsInUI = function(){
    this.updateCryptoCurrencyBannersInHeader(true);
   // this.generateSettingsCurrencyRows();
    // this.generateSettingsCryptoCurrencyRows();
}

JaxxUI.prototype.initializePinPad = function(callback) {
    // callback will pass back 1 parameter indicating the key pressed.
    if(!JaxxUI._sUI._mainPinPadElementName) {
        return callback();
    }
    var self = this;
    JaxxUI._sUI.deinitializePinPad();

    console.log("initialize pin pad");
    for (var i = 0; i < JaxxUI._sUI._numPinEntryFields; i++) {
        var element = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + i);

        element.index = i;

        if (i !== 0) {
            element.prevElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + (i - 1));
        }

        if (i < JaxxUI._sUI._numPinEntryFields - 1) {
            element.nextElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + (i + 1));
        }

        element.bind('input', { prevElement: element.prevElement, curElement: element, newFocusTarget: element.nextElement }, JaxxUI._sUI.enterPinData);

        element.bind('keyup', { prevElement: element.prevElement, curElement: element, newFocusTarget: element.nextElement }, JaxxUI._sUI.removePinData);

        element.bind('focus', { index: i }, function(e) {
            $(e.target).val("");
            JaxxUI._sUI._pinEntryFocus = e.data.index;
        });

        if (PlatformUtils.mobileCheck()) {
            element.attr('disabled', 'true');
        }

        //        console.log("setup :: " + JSON.stringify(element) + " :: nextElement :: " + element.nextElement);
    }

    for (var i = 0; i < 10; i++) {
        var element = $(JaxxUI._sUI._mainPinPadElementName + ' .numPadButton' + i);
        var curVal = i;
        element.bind('click', { curNum: i }, function(event){
            if (typeof(callback) !== 'undefined' && callback !== null){
                callback(i);
            }
            JaxxUI._sUI.clickNumPad(event);
        });
    }

    $(JaxxUI._sUI._mainPinPadElementName + ' .numPadDelete').bind('click', null, function() {
        if (typeof(callback) !== 'undefined' && callback !== null){
            callback('DEL');
        }
        if (JaxxUI._sUI._pinEntryFocus > 0) {

            var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
            var intDecrementFlag = true;
            if (self.getEnteredPINCode().length === JaxxUI._sUI._numPinEntryFields){
                intDecrementFlag = false;
            }
            //pinEntry must be decremented before event is created
            if (JaxxUI._sUI._pinEntryFocus > 0) {
                if (intDecrementFlag){
                    JaxxUI._sUI._pinEntryFocus--;
                }
            }

            var event = {};
            event.keyCode = 8;
            event.data = {};
            event.data.curElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

            if (JaxxUI._sUI._pinEntryFocus > 0) {
                event.data.prevElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + (JaxxUI._sUI._pinEntryFocus - 1));
            }

            JaxxUI._sUI.removePinData(event);

            if (JaxxUI._sUI._pinEntryFocus === 0) {
                JaxxUI._sUI.setPinCirclesToOrangeBorder(JaxxUI._sUI._mainPinPadElementName);
                if (JaxxUI._sUI._pinPadResetText) {
                    $(JaxxUI._sUI._mainPinPadElementName + ' .settingsEnterPinPadText').text(JaxxUI._sUI._pinPadResetText);
                } else {
                    $(JaxxUI._sUI._mainPinPadElementName + ' .settingsEnterPinPadText').text('Confirm PIN');
                }
            }

        } else {

            var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

            if (PlatformUtils.mobileCheck()) {
                inputElement.val('');
            } else {
                inputElement.focus();
            }
        }

    });

    $(JaxxUI._sUI._mainPinPadElementName + ' .numPadClear').bind('click', null, function() {
        if (typeof(callback) !== 'undefined' && callback !== null){
            callback('CLR');
        }
        JaxxUI._sUI.clearAllNumPadData();
        if (JaxxUI._sUI._pinPadResetText) {
            $(JaxxUI._sUI._mainPinPadElementName + ' .settingsEnterPinPadText').text(JaxxUI._sUI._pinPadResetText);
        } else {
            $(JaxxUI._sUI._mainPinPadElementName + ' .settingsEnterPinPadText').text('Confirm PIN');
        }
        JaxxUI._sUI.setPinCirclesToOrangeBorder(JaxxUI._sUI._mainPinPadElementName);
    });
}

JaxxUI.prototype.clickDELDefaultCallback = function(){
    if (JaxxUI._sUI._pinEntryFocus > 0) {
        var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

        if (PlatformUtils.mobileCheck()) {
            var event = {};
            event.keyCode = 8;
            event.data = {};
            event.data.curElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

            event.data.curElement.val('');

            if (JaxxUI._sUI._pinEntryFocus > 0) {
                event.data.prevElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + (JaxxUI._sUI._pinEntryFocus - 1));
            }

            JaxxUI._sUI.removePinData(event);

            if (JaxxUI._sUI._pinEntryFocus > 0) {
                JaxxUI._sUI._pinEntryFocus--;
            }
        } else {
            inputElement.trigger(jQuery.Event('keyup', {keyCode: 8}));
        }
    } else {
        var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

        if (PlatformUtils.mobileCheck()) {
            inputElement.val('');
        } else {
            inputElement.focus();
        }
    }
}

JaxxUI.prototype.deinitializePinPad = function() {
    for (var i = 0; i < JaxxUI._sUI._numPinEntryFields; i++) {
        var element = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + i);

        element.unbind('input');
        element.unbind('keyup');
        element.unbind('focus');
    }

    for (var i = 0; i < 10; i++) {
        var element = $(JaxxUI._sUI._mainPinPadElementName + ' .numPadButton' + i);

        element.unbind('click');
    }

    $(JaxxUI._sUI._mainPinPadElementName + ' .numPadDelete').unbind();
    $(JaxxUI._sUI._mainPinPadElementName + ' .numPadClear').unbind();
}

JaxxUI.prototype.removePinData = function(e) {
    //    console.log(e.keyCode);

    var prevElement = e.data.prevElement;
    var curElement = e.data.curElement;

    if (e.keyCode == 8) {
        curElement.val("");
        //curElement.css('background-color','#F27221')

        if (typeof(prevElement) !== 'undefined') {
            prevElement.focus();
        }
    }

    JaxxUI._sUI.setupUIWithEnteredPin(JaxxUI._sUI.getEnteredPINCode());
}

JaxxUI.prototype.enterPinData = function(e) {

    var prevElement = e.data.prevElement;
    var curElement = e.data.curElement;
    var newFocusTarget = e.data.newFocusTarget;

    var curVal = curElement.val();

    //        console.log("entered input:: " + JSON.stringify(curElement) + " :: " + curVal + " :: " + newFocusTarget);

    if (isDecimal(curVal)) {
        curElement.val(curVal.substring(curVal.length - 1));

        if (typeof(newFocusTarget) !== 'undefined') {
            newFocusTarget.focus();
        }
    } else {
        curElement.val("");
    }

    JaxxUI._sUI.setupUIWithEnteredPin(JaxxUI._sUI.getEnteredPINCode());
}


JaxxUI.prototype.clickNumPad = function(e) {
    //    console.log(e.data + " :: " + JaxxUI._sUI._pinEntryFocus);

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

    if (JaxxUI._sUI._pinEntryFocus < JaxxUI._sUI._numPinEntryFields - 1) {
        JaxxUI._sUI._pinEntryFocus++;

        var nextElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

        nextElement.focus();
    } else {
        //        console.log("focus binding");
        inputElement.unbind('focus');

        inputElement.focus();

        inputElement.bind('focus', { index: JaxxUI._sUI._pinEntryFocus }, function(e) {
            $(e.target).val("");
            JaxxUI._sUI._pinEntryFocus = e.data.index;
        });
    }

    inputElement.val(e.data.curNum);
    inputElement.trigger('keyup');
}

JaxxUI.prototype.clearAllNumPadData = function() {
    JaxxUI._sUI._pinEntryFocus = 0;

    for (var i = 0; i < JaxxUI._sUI._numPinEntryFields; i++) {
        var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + i);
        inputElement.val('');
    }

    $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus).focus().select();
}


JaxxUI.prototype.getEnteredPINCode = function() {
    var pinCode = "";

    for (var i = 0; i < JaxxUI._sUI._numPinEntryFields; i++) {
        var element = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + i);
        pinCode += element.val();
    }

    return pinCode;
}

JaxxUI.prototype.setupUIWithEnteredPin = function(pinCode) {
    if (g_JaxxApp.getUser().hasPin()) {
        var validPin = g_JaxxApp.getUser().checkForValidPin(pinCode);

        if (validPin) {
            JaxxUI._sUI._f_onPinSuccess();
        } else {
            JaxxUI._sUI._f_onPinFailure();
        }
    } else {
        JaxxUI._sUI._f_onPinFailure();
    }
}

JaxxUI.prototype.setOnPinSuccess = function(callback) {
    JaxxUI._sUI._f_onPinSuccess = callback;
}

JaxxUI.prototype.setOnPinFailure = function(callback) {
    JaxxUI._sUI._f_onPinFailure = callback;
}

JaxxUI.prototype.showEnterPinModal = function(successCallback) {
    //this handles the pin pad modal after the send confirmation modal

    $('.enterPin .settingsEnterPinPadText').text('Confirm PIN');

    JaxxUI._sUI.setOnPinSuccess(function() {
        JaxxUI._sUI.deinitializePinPad();
        Navigation.closeModal();
        successCallback(null);
    });

    JaxxUI._sUI.setOnPinFailure(function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();
        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            //this code is run if user has finished entering a pin, but it's incorrect
            JaxxUI._sUI.incorrectPinIsEntered('.enterPin .modalSendEnterPinPad', 'Confirm PIN');
        }
    });

    JaxxUI._sUI.setupPinPad('.modalSendEnterPinPad');

    Navigation.openModal('enterPin');

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');

    inputElement.focus();
}

/*
JaxxUI.prototype.turnHoverEffectOff = function(){
    for (var i = 0; i < COIN_NUMCOINTYPES; i++){
        if (i !== curCoinType){
            this._coinDontHover[i] = true;
        }
    }
}
*/

/*
JaxxUI.prototype.turnHoverEffectOn = function(){
    for (var i = 0; i < COIN_NUMCOINTYPES; i++){
        if (i !== curCoinType){
            this._coinDontHover[i] = false;
        }
    }
}
*/

JaxxUI.prototype.resetCoinButton = function(coinType) {
    var self = this;
    var coinButtonName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonName'];
    var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];
    $(coinButtonName).css({background: 'url(images/' + coinButtonSVGName + '-gray.svg) no-repeat center center', color: '#888888'});
    $(coinButtonName).removeClass('cssSelected');
    $(coinButtonName).off('mouseover');
    $(coinButtonName).off('mouseleave');
    $(coinButtonName).on({
        mouseover: function(){
            if (!self._coinDontHover[coinType]) {
                var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];
                $(this).css({background: 'url(images/' + coinButtonSVGName + '.svg) no-repeat center center', color: '#FFFFFF'});
            }
        },
        mouseleave: function(){
            if (!self._coinDontHover[coinType]) {
                var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];
                $(this).css({background: 'url(images/' + coinButtonSVGName + '-gray.svg) no-repeat center center', color: '#888888'});
                $(this).removeClass('cssSelected');
            }
        },
        //click: function(){
        //$(this).off('mouseleave');
        //}
    });
}

JaxxUI.prototype.setupMiningFeeSelector = function(miningFeeRadioButtonSetOverride, noOverrideUIOnSetup) {
    return;
    //    console.log("$('.modal.send.averageMiningFee') :: " + $('.modal.send.averageMiningFee'));
    var self= this;
    if (typeof(this._miningFeeModalSetup[miningFeeRadioButtonSetOverride]) ===
        'undefined' || this._miningFeeModalSetup[miningFeeRadioButtonSetOverride] === null) {
        this._miningFeeModalSetup[miningFeeRadioButtonSetOverride] = true;

        $('input[type=radio][name=miningFee' + miningFeeRadioButtonSetOverride + 'Button]').on('change', function(event) {
            //            console.log("clicky :: " + JSON.stringify($(this).val()));
            //            if (this.value === 'customMiningFee') {
            //                $('.modal.send .slider').slideDown();
            //
            //                var curMiningFeeDict = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeDict();
            //
            //                var lowerLimit = 20;
            //                var upperLimit = parseFloat(curMiningFeeDict.fastestFee);
            //
            //                var overrideFee = parseFloat(wallet.getPouchFold(COIN_BITCOIN).getCurrentMiningFee()) / 1000.0;
            //
            //                console.log("overrideFee :: " + overrideFee + " :: lowerLimit :: " + lowerLimit + " :: upperLimit :: " + upperLimit);
            //
            //                if (upperLimit !== 0) {
            //                    for (var i = 0; i < 1000; i++) {
            //                        if (lowerLimit > upperLimit) {
            //                            lowerLimit /= 2;
            //                        }
            //                    }
            //                }
            //
            //                var curPercent = (overrideFee - lowerLimit) / (upperLimit - lowerLimit);
            //
            //                //                console.log("curPercent :: " + curPercent);
            //                $('.modal.send .slider').slider('value', parseInt(curPercent * 100));
            //            } else {
            //                $('.modal.send .slider').slideUp();
            var curMiningFeeDict = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeDict();

            var overrideFee = 0;

            var lowerLimit = 40;
            var slowerLimit = parseFloat(curMiningFeeDict.hourFee);
            var fasterLimit = parseFloat(curMiningFeeDict.halfHourFee);
            var customLimit = parseFloat(curMiningFeeDict.customFee);

            if (slowerLimit !== 0) {
                for (var i = 0; i < 1000; i++) {
                    if (lowerLimit > slowerLimit) {
                        lowerLimit /= 2;
                    }
                }
            }

            if (this.value === 'slowMiningFee' + miningFeeRadioButtonSetOverride ) {
                overrideFee = (lowerLimit * 1000);
                g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelSlow);
                wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelSlow);
                $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelSlow]);
            } else if (this.value === 'averageMiningFee' + miningFeeRadioButtonSetOverride) {
                overrideFee = (slowerLimit * 1000);
                g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelAverage);
                wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelAverage);
                $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelAverage]);
            } else if (this.value === 'fastMiningFee' + miningFeeRadioButtonSetOverride) {
                overrideFee = (fasterLimit * 1000);
                g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelFast);
                wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelFast);
                $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelFast]);
            } else if (this.value === 'customMiningFee' + miningFeeRadioButtonSetOverride) {// Fourth Option Custom
                overrideFee = (customLimit * 1000);
                g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelCustom);
                wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelCustom);
                $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelCustom]);
            }
            self.overrideMiningFeeRadioButton(miningFeeRadioButtonSetOverride);

            //            var newMiningFeeLevel = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeLevel();
            //            console.log("miningFeeRadioButtonSetOverride :: " + miningFeeRadioButtonSetOverride + " :: radiobutton value :: " + this.value + " :: overrideFee :: " + overrideFee + " :: newMiningFeeLevel :: " + newMiningFeeLevel);

            updateFromInputFieldEntry();
            specialAction('walletSendReceive');

            //        }
        });

        //        var sliderChanged = function(event, ui) {
        //            if (event.originalEvent) {
        //                //manual change
        //                console.log(ui.value);
        //                //@note: @todo: move the following function to this class.
        //
        //                var curMiningFeeDict = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeDict();
        //
        //                var lowerLimit = 20;
        //                var upperLimit = parseFloat(curMiningFeeDict.fastestFee);
        //
        //                var overrideFee = 0;
        //
        //                if (upperLimit !== 0) {
        //                    for (var i = 0; i < 1000; i++) {
        //                        if (lowerLimit > upperLimit) {
        //                            lowerLimit /= 2;
        //                        }
        //                    }
        //
        //                    var modifier = parseFloat(ui.value) / 100.0;
        //
        ////                    console.log("modifier :: " + modifier);
        //
        //                    overrideFee = lowerLimit + (upperLimit - lowerLimit) * modifier;
        //                    overrideFee = parseInt(overrideFee * 1000);
        //                }
        //
        ////                console.log("overrideFee :: " + overrideFee);
        //
        //                wallet.getPouchFold(COIN_BITCOIN).setMiningFeeOverride(overrideFee);
        //
        //                updateFromInputFieldEntry();
        //                specialAction('walletSendReceive');
        //            }
        //            else {
        //                //programmatic change
        //            }
        //        }
        //
        //        $('.modal.send .slider').slider({
        //            range: "max",
        //            min: 0,
        //            max: 100,
        //            value: 50,
        //            slide: sliderChanged,
        //            change: sliderChanged
        //        });
        //
        //        $('.modal.send .slider').slideUp();

        //updateFromInputFieldEntry();
        //specialAction('walletSendReceive');
    }
    //if (!noOverrideUIOnSetup) {
    // this.overrideMiningFeeRadioButton(miningFeeRadioButtonSetOverride);
    //}
}

JaxxUI.prototype.pushBTCMiningFeeFromUIOptionsToPouch = function(){
    var miningFeeRadioButtonSetOverride = "MainMenu";
    var strMiningFeeOptionChecked = $('input[name=miningFeeMainMenuButton]:checked').attr('value');
    var curMiningFeeDict = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeDict();

    var overrideFee = 0;

    var lowerLimit = 40;
    var slowerLimit = parseFloat(curMiningFeeDict.hourFee);
    var fasterLimit = parseFloat(curMiningFeeDict.halfHourFee);
    var customLimit = parseFloat(curMiningFeeDict.customFee);

    if (slowerLimit !== 0) {
        for (var i = 0; i < 1000; i++) {
            if (lowerLimit > slowerLimit) {
                lowerLimit /= 2;
            }
        }
    }

    if (strMiningFeeOptionChecked === 'slowMiningFee' + miningFeeRadioButtonSetOverride ) {
        overrideFee = (lowerLimit * 1000);
        g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelSlow);
        wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelSlow);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelSlow]);
    } else if (strMiningFeeOptionChecked === 'averageMiningFee' + miningFeeRadioButtonSetOverride) {
        overrideFee = (slowerLimit * 1000);
        g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelAverage);
        wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelAverage);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelAverage]);
    } else if (strMiningFeeOptionChecked === 'fastMiningFee' + miningFeeRadioButtonSetOverride) {
        overrideFee = (fasterLimit * 1000);
        g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelFast);
        wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelFast);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelFast]);
    } else if (strMiningFeeOptionChecked === 'customMiningFee' + miningFeeRadioButtonSetOverride) {// Fourth Option Custom
        overrideFee = (customLimit * 1000);
        g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelCustom);
        wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelCustom);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelCustom]);
    }
    this.overrideMiningFeeRadioButton(miningFeeRadioButtonSetOverride);
}

JaxxUI.prototype.pushBTCMiningFeeFromPouchToModal = function(){
    console.log('COIN_BITCOIN ' +COIN_BITCOIN);
    //TODO Bitcoin Mining fee
    return;
    var miningFeeOptionChosen = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeLevel();
    var curMiningFeeDict = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeDict();

    var slowerLimit = parseFloat(curMiningFeeDict.hourFee);
    var fasterLimit = parseFloat(curMiningFeeDict.halfHourFee);
    var customLimit = parseFloat(curMiningFeeDict.customFee);
    if (miningFeeOptionChosen === HDWalletPouch.MiningFeeLevelSlow) {
        //overrideFee = (lowerLimit * 1000);
        //g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelSlow);
        //wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelSlow);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelSlow]);
    } else if (miningFeeOptionChosen === HDWalletPouch.MiningFeeLevelAverage) {
        //overrideFee = (slowerLimit * 1000);
        //g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelAverage);
        //wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelAverage);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelAverage]);
    } else if (miningFeeOptionChosen === HDWalletPouch.MiningFeeLevelFast) {
        //overrideFee = (fasterLimit * 1000);
        //g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelFast);
        //wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelFast);

        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelFast]);
    } else if (miningFeeOptionChosen === HDWalletPouch.MiningFeeLevelCustom) {// Fourth Option Custom
        //overrideFee = (customLimit * 1000);
        //g_JaxxApp.getSettings().setMiningFeeOptionForCoin(0, HDWalletPouch.MiningFeeLevelCustom);
        //wallet.getPouchFold(COIN_BITCOIN).setMiningFeeLevel(HDWalletPouch.MiningFeeLevelCustom);
        $(".miningFeeDescription").html(HDWalletPouch.dictMiningOptionText[HDWalletPouch.MiningFeeLevelCustom]);
    } else { // Default mining fee option chosen
        $(".miningFeeDescription").html("Default mining fee is selected. BTC mining fee can be adjusted in the setting menu");
    }
}

JaxxUI.prototype.overrideMiningFeeRadioButton = function(miningFeeRadioButtonSetOverride) {
    // This takes the mining fee option from the pouch and sets the transaction fee.
    // This also checks the button according to the mining fee.
    var curMiningFeeDict = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeDict();

    var overrideFee = wallet.getPouchFold(COIN_BITCOIN).getDefaultTransactionFee();

    var lowerLimit = 40;
    var slowerLimit = parseFloat(curMiningFeeDict.hourFee);
    var fasterLimit = parseFloat(curMiningFeeDict.halfHourFee);

    if (slowerLimit !== 0) {
        for (var i = 0; i < 1000; i++) {
            if (lowerLimit > slowerLimit) {
                lowerLimit /= 2;
            }
        }
    }

    var curMiningFeeOverride = lowerLimit;
    var curMiningFeeLevel = wallet.getPouchFold(COIN_BITCOIN).getMiningFeeLevel(); // Slow, Average or Fast

    if (curMiningFeeLevel === HDWalletPouch.MiningFeeLevelSlow) {
        $('input:radio[type=radio][name=miningFee' + miningFeeRadioButtonSetOverride + 'Button][id=slowMiningFee' + miningFeeRadioButtonSetOverride + ']').prop('checked', true);
        curMiningFeeOverride = lowerLimit;
    } else if (curMiningFeeLevel === HDWalletPouch.MiningFeeLevelAverage) {
        $('input:radio[type=radio][name=miningFee' + miningFeeRadioButtonSetOverride + 'Button][id=averageMiningFee' + miningFeeRadioButtonSetOverride + ']').prop('checked', true);
        curMiningFeeOverride = slowerLimit;
    } else if (curMiningFeeLevel === HDWalletPouch.MiningFeeLevelFast) {
        $('input:radio[type=radio][name=miningFee' + miningFeeRadioButtonSetOverride + 'Button][id=fastMiningFee' + miningFeeRadioButtonSetOverride + ']').prop('checked', true);
        curMiningFeeOverride = fasterLimit;
    } else if (curMiningFeeLevel === HDWalletPouch.MiningFeeLevelCustom) {
        $('input:radio[type=radio][name=miningFee' + miningFeeRadioButtonSetOverride + 'Button][id=customMiningFee' + miningFeeRadioButtonSetOverride + ']').prop('checked', true);
    }
    overrideFee = (curMiningFeeOverride * 1000);
    //    console.log("overrideMiningFeeRadioButton :: " + miningFeeRadioButtonSetOverride + " :: curMiningFeeLevel :: " + curMiningFeeLevel + " :: overrideFee :: " + overrideFee);
    wallet.getPouchFold(COIN_BITCOIN).setMiningFeeOverride(overrideFee);
}

JaxxUI.prototype.setBTCMiningFee = function(){

}

JaxxUI.prototype.setMainMenuToggleLocked = function(boolLockedFlag) {
    this._mainMenuToggleLocked = boolLockedFlag;
}
JaxxUI.prototype.openShapeShiftSendModal = function() {
    $('.notificationOverlay .cssShapeShiftConfirmation').parent().removeClass('cssStartHidden');
    if( $('.tabContent.cssTabContent').hasClass('cssSelected') ) {
        $('.tabSend.tab').trigger('click');
        setTimeout(function () {
            Navigation.openNotificationBanner('.cssShapeShiftConfirmation');
        }, 800);
    }
    else {
        Navigation.openNotificationBanner('.cssShapeShiftConfirmation');
    }

}
JaxxUI.prototype.closeShapeShiftSendModal = function() {
    Navigation.closeNotificationBanner('.cssShapeShiftConfirmation');
}
JaxxUI.prototype.openSendConfirmationModal = function() {
    $('.notificationOverlay .cssSendConfirmation').parent().removeClass('cssStartHidden');
    if ($('.tabContent.cssTabContent').hasClass('cssSelected')) {
        $('.tabSend.tab').trigger('click');
        setTimeout(function () {
            Navigation.openNotificationBanner('.cssSendConfirmation');
        }, 800);
    }
    else {
        Navigation.openNotificationBanner('.cssSendConfirmation');
    }
}
JaxxUI.prototype.closeSendConfirmationModal = function() {
    Navigation.closeNotificationBanner('.cssSendConfirmation');
}
JaxxUI.prototype.showSendModal = function() {
    if (!$('.modal-bottom .cssSendConfirmation').hasClass('visibleNotificationFooter')) {
        /* Navigation.openModal('send'); */
        this.openSendConfirmationModal();
    }

    if (curCoinType === COIN_BITCOIN) {
        this.setupMiningFeeSelector('Generic');

        /* $('.modal.send .miningFeeSelector').show(); */
        $('.modal-bottom .cssSendConfirmation .miningFeeSelector').show();
        $('.modal-bottom .cssSendConfirmation .modal-body-bottom-description').show();

        if($('.modal-bottom .cssSendConfirmation .mining-fee-title').hasClass('modal-body-bottom-title-description-visible')) {
            return;
        }
        else {
            $('.modal-bottom .cssSendConfirmation .mining-fee-title').addClass('modal-body-bottom-title-description-visible');
            $('.modal-bottom .cssSendConfirmation .mining-fee-title').removeClass('modal-body-bottom-title');
        }
    } else {
        /* $('.modal.send .miningFeeSelector').hide(); */
        $('.modal-bottom .cssSendConfirmation .miningFeeSelector').hide();
        $('.modal-bottom .cssSendConfirmation .modal-body-bottom-description').hide();

        if($('.modal-bottom .cssSendConfirmation .mining-fee-title').hasClass('modal-body-bottom-title')) {
            return;
        }
        else {
            $('.modal-bottom .cssSendConfirmation .mining-fee-title').removeClass('modal-body-bottom-title-description-visible');
            $('.modal-bottom .cssSendConfirmation .mining-fee-title').addClass('modal-body-bottom-title');
        }
    }
    /*
    if (!$('.modal.send').hasClass('visible')) {
        Navigation.openModal('send');
    }
    */

}

JaxxUI.prototype.showShiftModal = function() {
    if (!$('.modal-bottom .cssShapeShiftConfirmation').hasClass('visible')) {
        this.openShapeShiftSendModal();
    }

    if (curCoinType === COIN_BITCOIN) {
        this.setupMiningFeeSelector('ShapeShift');

        /* $('.modal.shift .miningFeeSelector').show(); */
        $('.modal-bottom .cssShapeShiftConfirmation .miningFeeSelector').show();
        $('.modal-bottom .cssShapeShiftConfirmation .modal-body-bottom-description').show();

        if($('.modal-bottom .cssShapeShiftConfirmation .mining-fee-title').hasClass('modal-body-bottom-title-description-visible')) {
            return;
        }
        else {
            $('.modal-bottom .cssShapeShiftConfirmation .mining-fee-title').addClass('modal-body-bottom-title-description-visible');
            $('.modal-bottom .cssShapeShiftConfirmation .mining-fee-title').removeClass('modal-body-bottom-title');
        }
    } else {
        /* $('.modal.shift .miningFeeSelector').hide(); */
        $('.modal-bottom .cssShapeShiftConfirmation .miningFeeSelector').hide();
        $('.modal-bottom .cssShapeShiftConfirmation .modal-body-bottom-description').hide();

        if($('.modal-bottom .cssShapeShiftConfirmation .mining-fee-title').hasClass('modal-body-bottom-title')) {
            return;
        }
        else {
            $('.modal-bottom .cssShapeShiftConfirmation .mining-fee-title').removeClass('modal-body-bottom-title-description-visible');
            $('.modal-bottom .cssShapeShiftConfirmation .mining-fee-title').addClass('modal-body-bottom-title');
        }
    }
    /*
    if (!$('.modal.shift').hasClass('visible')) {
        Navigation.openModal('shift');
    }
    */
}

JaxxUI.prototype.setupPinPad = function(elementName, callback) {
    JaxxUI._sUI._mainPinPadElementName = elementName;
    JaxxUI._sUI._pinPadResetText = null;
    $(elementName + ' .settingsEnterPinPadText').css('color','#fff');

    JaxxUI._sUI.initializePinPad(callback);
    JaxxUI._sUI.setPinCirclesToOrangeBorder(elementName);

    console.log($(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry0'));
}

JaxxUI.prototype.showEnterPinSettings = function() {
    if (g_JaxxApp.getUser().hasPin()) {
        JaxxUI._sUI.showConfirmExistingPinSettings(function() {
            JaxxUI._sUI.showEnterNewPinSettings("Your PIN has been changed.");
        });
    } else {
        JaxxUI._sUI.showEnterNewPinSettings("Your PIN has been set.");
    }
}

JaxxUI.prototype.setPinCirclesToRedBorder = function(pinPadInstance){
    //pinPadInstance is a string representing the class of the pin pad used
    $(pinPadInstance + ' input').addClass('cssRedBorder');
    $(pinPadInstance + ' input').removeClass('cssOrangeBorder');
    $(pinPadInstance + ' input').removeClass('cssBlueBorder');
    $(pinPadInstance + ' input').css('color', '#FF0000 !important');
}

JaxxUI.prototype.setPinCirclesToBlueBorder = function(pinPadInstance){
    //pinPadInstance is a string representing the class of the pin pad used
    $(pinPadInstance + ' input').removeClass('cssRedBorder');
    $(pinPadInstance + ' input').removeClass('cssOrangeBorder');
    $(pinPadInstance + ' input').addClass('cssBlueBorder');
    $(pinPadInstance + ' input').css('color', '#07630B !important');
}

JaxxUI.prototype.setPinCirclesToOrangeBorder = function(pinPadInstance){
    //pinPadInstance is a string representing the class of the pin pad used
    $(pinPadInstance + ' input').removeClass('cssRedBorder');
    $(pinPadInstance + ' input').addClass('cssOrangeBorder');
    $(pinPadInstance + ' input').removeClass('cssBlueBorder');
    $(pinPadInstance + ' input').css('color', '#E76F22 !important');
}

JaxxUI.prototype.showRemovePinSettings = function() {
    JaxxUI._sUI.showConfirmExistingPinSettings(function() {
        JaxxUI._sUI.correctPinIsEntered('.removePinCode .settingsEnterPinPad', 'Your PIN has been removed');
        JaxxUI._sUI.clearUserPin();
        Navigation.clearSettings();
        Registry.jaxxUI.closeMainMenu();
    });
}

JaxxUI.prototype.showConfirmExistingPinSettings = function(successCallback) {
    //this handles the pin confirmations on change pin and remove pin inside the settings menu

    JaxxUI._sUI.setupPinPad('.settings.changePinCode .settingsEnterPinPad');

    $('.settingsEnterPinPadText').text('Enter Current PIN');
    $('.settingsEnterNewPinConfirmButton').hide();

    JaxxUI._sUI.setOnPinSuccess(function() {
        successCallback();
    });

    JaxxUI._sUI.setOnPinFailure(function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();
        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            JaxxUI._sUI.incorrectPinIsEntered('.changePinCode .settingsEnterPinPad', 'Confirm PIN');
        }
    });

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');
    inputElement.focus();
}

JaxxUI.prototype.showEnterNewPinSettings = function(successMessage) {
    //used when setting up a new pin within settings menu, and changing one

    JaxxUI._sUI.setupPinPad('.settings.changePinCode .settingsEnterPinPad');

    $('.settingsEnterPinPadText').text('Select New PIN');
    $('.settingsEnterNewPinConfirmButton').hide();

    var checkForValid = function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();

        //        console.log("entered pin :: " + enteredPin);

        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            JaxxUI._sUI.setupTemporaryPin(JaxxUI._sUI.getEnteredPINCode());
            JaxxUI._sUI.showConfirmNewPinSettings(successMessage);
        }
    }

    JaxxUI._sUI.setOnPinSuccess(checkForValid);
    JaxxUI._sUI.setOnPinFailure(checkForValid);

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');
    inputElement.focus();
}

JaxxUI.prototype.showConfirmNewPinSettings = function() {
    //used when setting up a new pin within settings menu

    this._pinPadResetText = 'Confirm New PIN'

    $('.settingsEnterPinPadText').text('Confirm New PIN');
    $('.settingsEnterNewPinConfirmButton').hide();

    var checkForMatchingPin = function() {
        //this function gets called on first enter of proposed pin, and also on confirmation
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();

        if (enteredPin === JaxxUI._sUI._temporaryPin) {
            //if user has correctly retyped pin, set pin and give ui feedback
            Navigation.clearSettings();
            Registry.jaxxUI.closeMainMenu();
            g_JaxxApp.getUser().setPin(enteredPin);
            clearTimeout(JaxxUI._sUI._incorrectPINTimeout);
            JaxxUI._sUI.correctPinIsEntered('.changePinCode .settingsEnterPinPad', 'Your PIN has been set');
        } else if (enteredPin.length === 4) {
            //this code is run if user has finished entering a pin, but it's incorrect
            JaxxUI._sUI.incorrectPinIsEntered('.changePinCode .settingsEnterPinPad', 'Confirm New PIN');
        }
    }

    JaxxUI._sUI.setOnPinSuccess(checkForMatchingPin);
    JaxxUI._sUI.setOnPinFailure(checkForMatchingPin);

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);
    inputElement.trigger('keyup');

    inputElement.focus();
}

JaxxUI.prototype.correctPinIsEntered = function(pinPadInstance, confirmationMessage){
    JaxxUI._sUI.setPinCirclesToBlueBorder(pinPadInstance);
    $(pinPadInstance + 'Text').text('Success!');
    //Below snippet ensures that if user keeps clicking number keys after pin is set the confirmation banner
    //is still only flashed once
    if ($(pinPadInstance + 'Text').attr("temp_disable") == "disabled") {
        //nothing to do, temporarily disabled...
    }
    else {
        Navigation.flashBanner(confirmationMessage, 5);
        $(pinPadInstance + 'Text').attr("temp_disable", "disabled");
        window.setTimeout(function() { $(pinPadInstance + 'Text').attr("temp_disable", ""); }, 10000);
    }

}

JaxxUI.prototype.incorrectPinIsEntered = function(pinPadInstance, resetMessage){
    //used inside the settings menu for change pin and remove pin
    //ui feedback for send confirmation modal and view private keys/mnemonic happens in callbacks
    JaxxUI._sUI.setPinCirclesToRedBorder(pinPadInstance);
    $(pinPadInstance + 'Text').text('Incorrect PIN');
    clearTimeout(this._incorrectPINTimeout);
    this._incorrectPINTimeout = setTimeout(function(){
        //timeout resets ui after a few seconds if use doesn't press clr or del
        $(pinPadInstance + 'Text').text(resetMessage);
        JaxxUI._sUI.setPinCirclesToOrangeBorder(pinPadInstance);
        JaxxUI._sUI.clearAllNumPadData();
    }, 1000);
}

JaxxUI.prototype.setupTemporaryPin = function(temporaryPin) {
    JaxxUI._sUI._temporaryPin = temporaryPin;
}

JaxxUI.prototype.clearUserPin = function() {
    g_JaxxApp.getUser().clearPin();
}

JaxxUI.prototype.showSettingsMnemonicConfirmPin = function(settingsPinPadElementName, successCallback) {
    //this pinpad handles the backup mnemonic, from within the tools menu

    JaxxUI._sUI.setupPinPad(settingsPinPadElementName);
    $('.viewMnemonicConfirmPin .settingsEnterPinPadText').text('Confirm PIN');

    JaxxUI._sUI.setOnPinSuccess(function() {
        JaxxUI._sUI.deinitializePinPad();
        var mnemonic = getStoredData('mnemonic', true);
        var uri = "jaxx:" + thirdparty.bip39.mnemonicToEntropy(mnemonic);
        var qrCodeImage = thirdparty.qrImage.imageSync(uri, {
            type: "png",
            ec_level: "H"
        }).toString('base64');
        $(".settings.viewJaxxBackupPhrase .jaxxToken img").attr("src", "data:image/png;base64," + qrCodeImage);
        $('.populateMnemonic').text(mnemonic);
        successCallback();
    });

    JaxxUI._sUI.setOnPinFailure(function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();
        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            //this code is run if user has finished entering a pin, but it's incorrect
            JaxxUI._sUI.incorrectPinIsEntered('.viewMnemonicConfirmPin .settingsViewMnemonicConfirmPinPad', 'Confirm PIN');
        }
    });

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

    inputElement.trigger('keyup');
    setTimeout(function() {
        inputElement.focus();
    }, 100);
}

JaxxUI.prototype.showPrivateKeysConfirmPin = function(settingsPinPadElementName, successCallback) {
    //this pinpad handles display private keys pages, from within the tools menu

    JaxxUI._sUI.setupPinPad(settingsPinPadElementName);
    $('.backupPrivateKeysConfirmPin .settingsEnterPinPadText').text('Confirm PIN');

    JaxxUI._sUI.setOnPinSuccess(function() {
        JaxxUI._sUI.deinitializePinPad();
        successCallback();
    });

    JaxxUI._sUI.setOnPinFailure(function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();
        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            //this code is run if user has finished entering a pin, but it's incorrect
            JaxxUI._sUI.incorrectPinIsEntered('.backupPrivateKeysConfirmPin .settingsBackupPrivateKeysConfirmPinPad', 'Confirm PIN');
        }
    });

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

    inputElement.trigger('keyup');
    setTimeout(function() {
        inputElement.focus();
    }, 100);
}

JaxxUI.prototype.showPairDeviceConfirmPin = function(settingsPinPadElementName, successCallback) {
    //this pinpad handles the pair devices pin, from within the tools menu

    JaxxUI._sUI.setupPinPad(settingsPinPadElementName);
    $('.pairToDeviceConfirmPin .settingsEnterPinPadText').text('Confirm PIN');

    JaxxUI._sUI.setOnPinSuccess(function() {
        JaxxUI._sUI.deinitializePinPad();
        successCallback();
    });

    JaxxUI._sUI.setOnPinFailure(function() {
        var enteredPin = JaxxUI._sUI.getEnteredPINCode();
        if (enteredPin.length === JaxxUI._sUI._numPinEntryFields) {
            //this code is run if user has finished entering a pin, but it's incorrect
            JaxxUI._sUI.incorrectPinIsEntered('.pairToDeviceConfirmPin .settingsPairToDeviceConfirmPinPad', 'Confirm PIN');
        }
    });

    JaxxUI._sUI.clearAllNumPadData();

    var inputElement = $(JaxxUI._sUI._mainPinPadElementName + ' .pinEntry' + JaxxUI._sUI._pinEntryFocus);

    inputElement.trigger('keyup');
    setTimeout(function() {
        inputElement.focus();
    }, 100);
}

JaxxUI.prototype.setupTransactionList = function(coinType, numItemsToCreate) {
    //this.removeLoadMoreButtonTransactionList(coinType);
    this._numHistoryElementsDisplayed[coinType] = this._numHistoryElementsDefault;

    for (var i = 0; i < numItemsToCreate; i++) {
        //                console.log("creating new transaction list row :: " + i);
        this.createNewTransactionRow(coinType);
    }

    var self = this;

    var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];

    var transactionTable = $('.table.transactions' + transactionsListElement);

    var scrollStopFunction = function() {
        self.checkForTXScroll(coinType);
        //
        //        var coinType = parseInt($(this).attr('coinType'));
        //
        //        clearTimeout($.data(this, 'scrollTimer'));
        //        $.data(this, 'scrollTimer', setTimeout(function() {
        //
        //            self.checkForTXScroll(coinType);
        //        }, 50));
    }

    //@note: attribute the coinType to the table for later 'scrollStop' functionality reference.
    transactionTable.attr('coinType', coinType);

    //@note: basic 'scrollStop' functionality.
    transactionTable.off('scroll', scrollStopFunction);
    transactionTable.on('scroll', scrollStopFunction);

    //    console.log("table :: " + transactionTable + " :: number of children :: " + transactionTable.children('.tableRow').length + " :: " + transactionTable.coinType);

    //this.addLoadMoreButtonTransactionList(coinType);
}

JaxxUI.prototype.checkForTXScroll = function(coinType) {
    coinType = parseInt(coinType);

    var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];

    var transactionTable = $('.table.transactions' + transactionsListElement);

    var numChildren = transactionTable.children('.tableRow').length;

    if (numChildren > 1) {
        //@note: this works because only one can be expanded at a time.
        var minHeight = 0;

        minHeight = $(transactionTable.children('.tableRow')[0]).height();
        var otherMinHeight = $(transactionTable.children('.tableRow')[1]).height();
        if (otherMinHeight < minHeight) {
            minHeight = otherMinHeight;
        }

        if (minHeight !== 0) {
            var numRowsScrolled = transactionTable.scrollTop() / minHeight;
            var numRowsVisible = transactionTable.height() / minHeight;

            //            console.log("table :: " + coinType +
            //            " :: scroll :: numRowsScrolled :: " + numRowsScrolled + " :: numRowsVisible :: " + numRowsVisible + " :: history length :: " + g_JaxxApp.getUI().getTXHistoryLength(coinType) + " :: " + (numRowsScrolled + numRowsVisible));

            if (numRowsScrolled + numRowsVisible >= g_JaxxApp.getUI().getTXHistoryLength(coinType)) {
                //                console.log("table :: increase visible table cells");
                g_JaxxApp.getUI().increaseTXHistoryLength(coinType);
            }
        }

        //        console.log("table scroll :: " + transactionTable + " :: coinType :: " + transactionTable.attr('coinType') + " :: numChildren :: " + numChildren + " :: scrollTop :: " + transactionTable.scrollTop() + " :: row min height :: " + minHeight + " :: table height :: " + transactionTable.height() + " :: table row height :: " + (minHeight * numChildren));
    }
}

JaxxUI.prototype.getTXHistoryLength = function(coinType) {
    return this._numHistoryElementsDisplayed[coinType];
}

JaxxUI.prototype.increaseTXHistoryLength = function(coinType) {
    var transactionHistoryList = wallet.getPouchFold(coinType).getHistory();
    var lengthOfTransactionList = transactionHistoryList.length;
    //    console.log("table :: " + coinType + " :: displayed length :: " +  this._numHistoryElementsDisplayed[coinType] + " :: full tx history length :: " + this._txFullHistory[coinType].length);
    if (this._numHistoryElementsDisplayed[coinType] < lengthOfTransactionList) {
        this._numHistoryElementsDisplayed[coinType] += this._numHistoryElementsDefault;
        var newTransactionHistoryList = transactionHistoryList.slice(0, this._numHistoryElementsDisplayed[coinType]);
        //        console.log("table :: " + coinType + " :: new tx history length :: " + this._numHistoryElementsDisplayed[coinType]);
        this.updateTransactionList(coinType, newTransactionHistoryList);
    }
}

JaxxUI.prototype.resetTXHistory = function(coinType) {
    console.log('TODO  JaxxUI.prototype.resetTXHistory');
    return;
    this._numHistoryElementsDisplayed[coinType] = this._numHistoryElementsDefault;

    var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];

    var transactionTable = $('.table.transactions' + transactionsListElement);

    //    $('html, body').animate({
    //        scrollTop: transactionTable.offset().top
    //    }, 500);
    transactionTable.scrollTop(0);

    //    console.log("transactionTable.scrollTop :: " + transactionTable.scrollTop());
}

JaxxUI.prototype.resetTransactionList = function(coin) {
    console.error()

    //for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
    //var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];

    // var transactionTableElementNoTransactions = $('.table.transactions' + transactionsListElement + ' .noTransactions');

    // transactionTableElementNoTransactions.show();

    // var transactionTableElementTableRows = $('.table.transactions' + transactionsListElement + ' .tableRow');

    //transactionTableElementNoTransactions.remove();
    //}
}

JaxxUI.prototype.isTransactionListEqualToHistory = function(coinType, history) {

    console.warn('TODO transactions history')

    //var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];



    //var transactionTable = $('.table.transactions' + transactionsListElement);

    //  var tableChildren = transactionTable.children('.tableRow');
    //  var numExistingRows = tableChildren.length;

    //@note: check for differences between existing tx list and history.
    // var itemCountDiff = history.length - numExistingRows;

    //    console.log("[pre] table :: " + transactionTable + " :: number of children :: " + numExistingRows + " :: history.length :: " + history.length + " :: itemCountDiff :: " + itemCountDiff);


    // if (itemCountDiff === 0) {
    //     return true;
    // } else {
//    //}
}

JaxxUI.prototype.createNewTransactionRow = function(coin) {
    console.error(coin);

    var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];

    var transactionTemplateElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionTemplateElementName'];

    var transactionTable = $('.table.transactions' + transactionsListElement);
    var templateTransaction = $('.transactionRowTemplate' + transactionTemplateElement + ' > div');

    var row = templateTransaction.clone(true);
    row.addClass('tableRow');

    //    console.log("with table :: " + JSON.stringify($(transactionTable)) + " :: cloning :: " + JSON.stringify(templateTransaction) + " :: " + JSON.stringify(row));

    $('.receiveConfirmations', row).hide();
    $('.sendToAddress', row).show();
    // $(row, '.transactionDirectionHeader').text("Received From");
    $('.transactionDirectionHeader', row).text("Sent To");

    row.attr('rowtxid', -1);

    (function (row) {

        $('.glance', row).click(function() {

            var thisElement = $(this).parent()[0];

            console.log("glance :: " + row);



            $('.glance', row).toggleClass("cssTransactionRowSelected");


            //@note: hide the send/receive tabs, hide all other table elements.
            Navigation.returnToDefaultView();
            Navigation.hideTransactionHistoryDetails(thisElement);

            $('.verbose', row).slideToggle();


        });

        $('.verbose', row).click(function() {

            $('.glance', row).toggleClass("cssTransactionRowSelected");

        });
        $('.verbose', row).click(function() {
            $('.glance', row).toggleClass("cssTransactionRowSelected");
        });
        $('.verbose', row).css({display: 'none'}).click(function() {
//            console.log("verbose :: " + row);
            $('.verbose', row).slideToggle();
        });
    })(row);

    transactionTable.append(row);
}

JaxxUI.prototype.updateTransactionList = function(coinType, history) {
    console.log('TODO transactions list');

    return;
    //return;

    //    console.log("updateTransactionList :: " + coinType + " :: " + history.length + " :: this._numHistoryElementsDisplayed[coinType] :: " + this._numHistoryElementsDisplayed[coinType]);
    this.removeLoadMoreButtonTransactionList(coinType);

    this._txFullHistory[coinType] = history;

    history = history.slice(0, this._numHistoryElementsDisplayed[coinType]);

    var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];

    var transactionTable = $('.table.transactions' + transactionsListElement);

    var tableChildren = transactionTable.children('.tableRow');
    var numExistingRows = tableChildren.length;

    //    console.log("[pre] table :: " + transactionTable + " :: number of children :: " + numExistingRows + " :: history.length :: " + history.length);

    //@note: check for differences between existing tx list and history. push or pop as necessary.
    var itemCountDiff = history.length - numExistingRows;
    if (itemCountDiff < 0) {
        for (var i = 0; i < -itemCountDiff; i++) {
            transactionTable.children('.tableRow').last().remove();
        }

        tableChildren = transactionTable.children('.tableRow');
        numExistingRows = tableChildren.length;
    } else if (itemCountDiff > 0) {
        for (var i = 0; i < itemCountDiff; i++) {
            this.createNewTransactionRow(coinType);
        }

        tableChildren = transactionTable.children('.tableRow');
        numExistingRows = tableChildren.length;
    }

    //    console.log("[post] table :: " + transactionTable + " :: number of children :: " + numExistingRows + " :: history.length :: " + history.length);


    if (history.length === 0) {
        $('.noTransactions', transactionTable).show();
    } else {
        $('.noTransactions', transactionTable).hide();
    }

    ////__________________________________________________________
    /// console.log(history);

    for (var i = 0; i < history.length; i++) {
        var item = history[i];


        var row = $(tableChildren[i]);

        //@note: caches the rows via txid.
        var rowtxid = row.attr('rowtxid');
        if (history[i].txid === rowtxid) {
            // continue;
        } else {
            row.attr('rowtxid', history[i].txid);
        }

        if (item.deltaBalance < 0) {
            $('.receiveConfirmations', row).hide();
            $('.sendToAddress', row).show();
            $('.transactionDirectionHeader', row).text("Sent To");
        } else {
            $('.receiveConfirmations', row).show();
            $('.sendToAddress', row).hide();
            $('.transactionDirectionHeader', row).text("Received From");
        }

        //            console.log("bitcoin history item :: " + i + " :: " + item.deltaBalance);

        var itemAmount = item.deltaBalance;
        var amountFieldText = "";
        var blockExplorerEntrypoint = "";
        var itemTime = 0;

        if (coinType === COIN_BITCOIN) {
            if (itemAmount < 0) {
                itemAmount -= item.miningFee;

            }


            amountFieldText = ((itemAmount > 0) ? '+' : '') + HDWalletHelper.convertSatoshisToBitcoins(itemAmount) + ' BTC';

            itemTime = item.timestamp;

            //            blockExplorerEntrypoint = HDWallet.TESTNET ? 'https://tbtc.blockr.io/tx/info/' : 'https://blockr.io/tx/info/';
            blockExplorerEntrypoint = 'https://live.blockcypher.com/btc/tx/';
            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);

            $('.miningFee', row).text(HDWalletHelper.convertSatoshisToBitcoins(item.miningFee));

        } else if (coinType === COIN_ETHEREUM) {

            var indexOfDecimalPlace = itemAmount.indexOf('.');

            if (itemAmount.length - indexOfDecimalPlace - 1 > 8) { // If the string is too long.
                // Then we cut it off and add ....
                itemAmount = itemAmount.substring(0, indexOfDecimalPlace + 1 + 8) + '...';
            }

            amountFieldText = ((parseFloat(itemAmount) > 0) ? '+' : '') + itemAmount + ' ETH';
            //            }

            itemTime = item.timestamp * 1000;

            blockExplorerEntrypoint = 'https://www.etherscan.io/tx/';


            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);


            $('.gasCost', row).text(item.gasCost + " Ether");
        } else if (coinType === COIN_ETHEREUM_CLASSIC) {

            var indexOfDecimalPlace = itemAmount.indexOf('.');

            if (itemAmount.length - indexOfDecimalPlace - 1 > 8) { // If the string is too long.
                // Then we cut it off and add ....
                itemAmount = itemAmount.substring(0, indexOfDecimalPlace + 1 + 8) + '...';
            }


            //var decimalDifference = parseFloat(item.deltaBalance) - parseFloat(parseFloat(item.deltaBalance).toFixed(8));

            //if (decimalDifference !== 0.0) {
            //    itemAmount = parseFloat(item.deltaBalance).toFixed(8) + "...";
            //}

            // This is where logic is inserted that allows us to create transaction display data.

            //			console.log("(" + item.toAddress + "," + wallet.theDAOAddress + ")");
            //            if (item.toAddressFull === HDWalletHelper.theDAOAddress) {
            //                // This 'if' branch is entered when a DAO transaction takes place.
            //                amountFieldText = ((parseFloat(itemAmount) > 0) ? '+': '') + itemAmount + ' ETH';
            //                $( "div[rowtxid=" + item.txid + "]").find(".cssDisplayForDAOImageInTransaction").css("display", "block"); // Displays the 'td' element that has the attached image.
            //
            //            } else {
            // This 'if' branch is entered when an ETH transaction takes place.
            amountFieldText = ((parseFloat(itemAmount) > 0) ? '+' : '') + itemAmount + ' ETC';
            //            }

            itemTime = item.timestamp * 1000;

            blockExplorerEntrypoint = 'https://gastracker.io/tx/';

            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);

            $('.gasCost', row).text(item.gasCost + " Ether");
        } else if (coinType === COIN_THEDAO_ETHEREUM) {
            //@note: @todo: @next:
            //            var decimalDifference = parseFloat(item.deltaBalance) - parseFloat(parseFloat(item.deltaBalance).toFixed(8));
            //
            //            if (decimalDifference !== 0.0) {
            //                itemAmount = parseFloat(item.deltaBalance).toFixed(8) + "...";
            //            }
            //
            //            amountFieldText = ((item.deltaBalance > 0) ? '+': '') + itemAmount + ' ETH';
            //
            //            itemTime = item.timestamp * 1000;
            //
            //            blockExplorerEntrypoint = 'https://www.etherchain.org/tx/';
            //
            //            $('.blockNumber', row).text(item.blockNumber);
            //
            //            $('.gasCost', row).text(item.gasCost + " Ether");
        } else if (coinType === COIN_DASH) {
            if (itemAmount < 0) {
                itemAmount -= item.miningFee;
            }

            amountFieldText = ((itemAmount > 0) ? '+' : '') + HDWalletHelper.convertSatoshisToBitcoins(itemAmount) + ' DASH';

            itemTime = item.timestamp; // Changed for display purposes

            //            blockExplorerEntrypoint = HDWallet.TESTNET ? 'https://tbtc.blockr.io/tx/info/' : 'https://blockr.io/tx/info/';

            //@note: @here: @todo: @next:
            blockExplorerEntrypoint = 'https://chainz.cryptoid.info/dash/tx.dws?';

            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);

            $('.miningFee', row).text(HDWalletHelper.convertSatoshisToBitcoins(item.miningFee));
        } else if (coinType === COIN_LITECOIN) {

            if (itemAmount < 0) {
                itemAmount -= item.miningFee;
            }


            amountFieldText = ((itemAmount > 0) ? '+' : '') + HDWalletHelper.convertSatoshisToBitcoins(itemAmount) + ' LTC';

            itemTime = item.timestamp;

            //            blockExplorerEntrypoint = HDWallet.TESTNET ? 'https://tbtc.blockr.io/tx/info/' : 'https://blockr.io/tx/info/';
            blockExplorerEntrypoint = 'https://live.blockcypher.com/ltc/tx/';

            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);


            $('.miningFee', row).text(HDWalletHelper.convertSatoshisToBitcoins(item.miningFee));
        } else if (coinType === COIN_LISK) {
            //@note: @todo: @here: @lisk:
//            if (itemAmount < 0) {
//                itemAmount -= item.miningFee;
//            }
//
//
//            amountFieldText = ((itemAmount > 0) ? '+': '') + HDWalletHelper.convertSatoshisToBitcoins(itemAmount) + ' LSK';
//
//            itemTime = item.timestamp;
//
//            //            blockExplorerEntrypoint = HDWallet.TESTNET ? 'https://tbtc.blockr.io/tx/info/' : 'https://blockr.io/tx/info/';
//            blockExplorerEntrypoint = 'https://live.blockcypher.com/ltc/tx/';
//
//            $('.blockHeight', row).text(item.blockHeight);
//
//            $('.miningFee', row).text(HDWalletHelper.convertSatoshisToBitcoins(item.miningFee));
        } else if (coinType === COIN_ZCASH) {

            if (itemAmount < 0) {
                itemAmount -= item.miningFee;
            }


            amountFieldText = ((itemAmount > 0) ? '+' : '') + HDWalletHelper.convertSatoshisToBitcoins(itemAmount) + ' ZEC';

            itemTime = item.timestamp;

            //@note: @here: @todo: @zcash: reevaluate this block explorer.
            blockExplorerEntrypoint = 'https://explorer.zcha.in/transactions/';

            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);


            $('.miningFee', row).text(HDWalletHelper.convertSatoshisToBitcoins(item.miningFee));
        } else if (coinType === COIN_TESTNET_ROOTSTOCK) {
            var indexOfDecimalPlace = itemAmount.indexOf('.');

            if (itemAmount.length - indexOfDecimalPlace - 1 > 8) { // If the string is too long.
                // Then we cut it off and add ....
                itemAmount = itemAmount.substring(0, indexOfDecimalPlace + 1 + 8) + '...';
            }


            //var decimalDifference = parseFloat(item.deltaBalance) - parseFloat(parseFloat(item.deltaBalance).toFixed(8));

            //if (decimalDifference !== 0.0) {
            //    itemAmount = parseFloat(item.deltaBalance).toFixed(8) + "...";
            //}

            // This is where logic is inserted that allows us to create transaction display data.

            //			console.log("(" + item.toAddress + "," + wallet.theDAOAddress + ")");
            //            if (item.toAddressFull === HDWalletHelper.theDAOAddress) {
            //                // This 'if' branch is entered when a DAO transaction takes place.
            //                amountFieldText = ((parseFloat(itemAmount) > 0) ? '+': '') + itemAmount + ' ETH';
            //                $( "div[rowtxid=" + item.txid + "]").find(".cssDisplayForDAOImageInTransaction").css("display", "block"); // Displays the 'td' element that has the attached image.
            //
            //            } else {
            // This 'if' branch is entered when an ETH transaction takes place.
            amountFieldText = ((parseFloat(itemAmount) > 0) ? '+' : '') + itemAmount + ' RSK';
            //            }
            itemTime = item.timestamp * 1000;

            blockExplorerEntrypoint = null;

            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);


            $('.gasCost', row).text(item.gasCost + " Ether");
        } else if (coinType === COIN_DOGE) {

            if (itemAmount < 0) {
                itemAmount -= item.miningFee;
            }


            amountFieldText = ((itemAmount > 0) ? '+' : '') + HDWalletHelper.convertSatoshisToBitcoins(itemAmount) + ' DOGE';

            itemTime = item.timestamp;

            //            blockExplorerEntrypoint = HDWallet.TESTNET ? 'https://tbtc.blockr.io/tx/info/' : 'https://blockr.io/tx/info/';
            blockExplorerEntrypoint = 'https://live.blockcypher.com/doge/tx/';

            var blockHeight = item.blockHeight;
            if(blockHeight < 1 ) blockHeight = '--';

            $('.blockHeight', row).text(blockHeight);


            $('.miningFee', row).text(HDWalletHelper.convertSatoshisToBitcoins(item.miningFee));
        }

        $('.amount', row).text(amountFieldText);

        $('.date', row).text(moment(itemTime).format("MMM D YYYY"));
        $('.time', row).text(moment(itemTime).format("h:mma"));

        $('.txid', row).text(item.txid);

        var linkDisplayText = truncate(item.txid, 5, 5);

        //@note:@here:@todo:

        if (blockExplorerEntrypoint === null) {
            $('.txidShort').text((item.txid + "").substr(0, 5) + "..." + (item.txid + "").substr((item.txid + "").length - 5));
        } else {
            var linkToExplorer = blockExplorerEntrypoint + item.txid;

            g_JaxxApp.getUI().setupExternalLink($('.txidShort', row), linkDisplayText, linkToExplorer);
        }

        if (item.toAddress === null) {
            item.toAddress = "Self";
            $('.toAddresscopy', row).hide();
        }


        $('.toAddress', row).text(item.toAddress);
        $('.toAddressShort', row).text(truncate(item.toAddress, 4, 4));
        $('.toAddresscopy', row).attr('copy', item.toAddress);

        var confirmationString = wallet.getPouchFold(coinType).getConfirmationDisplayString(item.confirmations);
        // item.confirmations

        $('.glance .confirmations', row).text(confirmationString);
        if (item.confirmations) {
            $('.verbose .confirmations', row).text(wallet.getPouchFold(coinType).getConfirmationDisplayStringForNumberOfConfirmations(item.confirmations));
            $('.verbose .heading', row).text("Confirmations");
        } else {
            $('.verbose .confirmations', row).text("");
            $('.verbose .heading', row).text("");
        }
    }

    // this.resizeTransactionTable(coinType);
    // Set the height of the transaction wrapper:
    // ie. $(".transactionsBitcoin").parent().height($(".transactionsBitcoin").height() - 20);
    //this.addLoadMoreButtonTransactionList(coinType);
}

JaxxUI.prototype.pushCurrencyMainMenuToJaxxSettings = function(){
    var arrCurrencyRowsInList = $('.mainMenuCurrencies .exchangeRateList tbody').children();
    var arrFiatUnits = [];
    var arrActiveFiatUnits = [];
    for (var i = 0; i < arrCurrencyRowsInList.length; i++){
        if ($(arrCurrencyRowsInList[i]).children('.cssSelectedCurrency').children('.cssCircleUnchecked').hasClass('cssCurrencyisChecked'))
        {
            arrActiveFiatUnits.push($(arrCurrencyRowsInList[i]).attr('value'))
        }    

        arrFiatUnits.push($(arrCurrencyRowsInList[i]).attr('value'));    
    }
    g_JaxxApp.getSettings().setCurrencyPositionList(arrFiatUnits);

    var fiatController = Registry.getFiatPriceController();
    fiatController.setActiveFiatCurrencies(arrActiveFiatUnits);
}

JaxxUI.prototype.createNewAccountRow = function(coinType) {
    var accountsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountsListElementName'];
    var accountTemplateElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountTemplateElementName']
    var accountTable = $(accountsListElement);
    var templateAccount = $('.accountDataRowTemplate' + accountTemplateElement + ' > div');
    var row = templateAccount.clone(true);
    row.addClass('tableRow');
    //    console.log("with table :: " + JSON.stringify($(transactionTable)) + " :: cloning :: " + JSON.stringify(templateTransaction) + " :: " + JSON.stringify(row));
    //    row.attr('rowtxid', -1);
    accountTable.append(row);
}

JaxxUI.prototype.getAccountRow = function(coinType, strPrivateKey, strAddress, strBalance){
    var accountTemplateElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountTemplateElementName'];
    var templateAccount = $('.accountDataRowTemplate' + accountTemplateElement + ' > div');
    var row = templateAccount.clone(true);
    row.addClass('tableRow');
    //    console.log("with table :: " + JSON.stringify($(transactionTable)) + " :: cloning :: " + JSON.stringify(templateTransaction) + " :: " + JSON.stringify(row));
    //    row.attr('rowtxid', -1);
    $('.accountPublicAddress', row).text(strAddress);
    $('.accountPrivateKey', row).text(strPrivateKey);
    //rohit changes
    //$('.populateNonHDPrivateKey').attr('copy', strPrivateKey);
    //rohit
    $('.accountBalance', row).text(strBalance);
    return row;
}

JaxxUI.prototype.appendAccountRowToAccountList = function(coinType, row){
    var accountsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountsListElementName'];
    var accountTable = $(accountsListElement);
    accountTable.append(row);
}

JaxxUI.prototype.updateAndLoadPrivateKeyList = function(symbol) {

    // this._strKeyPair = "address,privatekey, ";

    // $('.cssWrapperPrivateKeys').each(function(index, element) {
    //     $(element).hide();
    // });

    var ctr = jaxx.Registry.getCryptoControllerBySymbol(symbol);
    ctr.getPrivateKeys().done(function(result) {
        jaxx.PrivateKeyList.instance.displayPrivateKeys(result, symbol);
    });

}

JaxxUI.prototype.updatePrivateKeyList = function(coinType) {
    var pageDisplayPrivateKeysName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['pageDisplayPrivateKeysName'];
    var accountsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountsListElementName'];
    var accounts = g_JaxxApp.getDataStoreController().getCryptoControllerByCoinType(coinType).getBalances();
    var accountTable = $(accountsListElement);
    var tableChildren = accountTable.children('.tableRow'); // accountTable.children().remove(); // accountTable.children('.tableRow');
    // var numExistingRows = tableChildren.length;
    //    console.log("[pre] table :: " + accountTable + " :: number of children :: " + numExistingRows + " :: accounts.length :: " + accounts.length);
    //@note: check for differences between existing tx list and history. push or pop as necessary.
    // var itemCountDiff = accounts.length - numExistingRows;
    // if (itemCountDiff < 0) {
    //     for (var i = 0; i < -itemCountDiff; i++) {
    //         accountTable.children('.tableRow').last().remove();
    //     }
    //
    //     tableChildren = accountTable.children('.tableRow');
    //     numExistingRows = tableChildren.length;
    // } else if (itemCountDiff > 0) {
    //     for (var i = 0; i < itemCountDiff; i++) {
    //         this.createNewAccountRow(coinType);
    //     }
    //
    //     tableChildren = accountTable.children('.tableRow');
    //     numExistingRows = tableChildren.length;
    // }
    //    console.log("[post] table :: " + accountTable + " :: number of children :: " + numExistingRows + " :: accounts.length :: " + accounts.length);

    accountTable.children('.cssKeySpacer').remove();
    tableChildren.remove();
    //@note: @here: @token: this seems necessary.
    //$('.' + pageDisplayPrivateKeysName + ' .textDisplayMessageForPrivateKeys').hide();
    for (var i = 0; i < accounts.length; i++) {
        var account = accounts[i];
        // We retrieve balance information from DCL Layer Data.
        var address = account.id;
        var balanceFromDCL = wallet.getPouchFold(coinType).getDataStorageController().getBalanceByAddress(address);
        var displayBalanceFromDCL = HDWalletHelper.convertCoinToUnitType(coinType, balanceFromDCL, COIN_UNITLARGE);
        var displayBalanceForPrivateKeys = wallet.getPouchFold(coinType).getPrivateKeyDisplayBalance(displayBalanceFromDCL);

        var row = g_JaxxApp.getUI().getAccountRow(coinType, "<error getting private key>", address, displayBalanceForPrivateKeys); //
        var largeBalance = displayBalanceForPrivateKeys;
        //        console.log("account :: " + i + " :: balance :: " + account.balance + " :: largeBalance :: " + largeBalance + " :: " + JSON.stringify(account));
        //$('.accountPublicAddress', row).text(address);
        //$('.accountPrivateKey', row).text(privateKeyFromDCL);
        //if (coinType === COIN_BITCOIN) {
        //    $('.accountBalance', row).text(displayBalanceForPrivateKeys);
        this.appendAccountRowToAccountList(coinType, row);
        for (var j = 0; j < COIN_NUMCOINTYPES; j++) {
            var coinLargePngName = HDWalletPouch.getStaticCoinPouchImplementation(j).uiComponents['coinLargePngName'];
            $(coinLargePngName, row).hide();
        }
        if (coinType === COIN_ETHEREUM) {

            largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            if (parseFloat(largeBalance) >= 0.000001) {
                $(row).find(".HDAccounts .etherDisplay").show();
            } else {
                largeBalance = 0;
                $(row).find(".HDAccounts .etherDisplay").show();
                //$(row, ".backupPrivateKeysEthereum .HDAccounts .etherDisplay").show();
            }

            var accountDAOBalance = HDWalletHelper.convertCoinToUnitType(COIN_THEDAO_ETHEREUM, wallet.getPouchFold(COIN_THEDAO_ETHEREUM).getAccountBalance(address), COIN_UNITLARGE) * 100;
            accountDAOBalance = parseFloat(parseFloat(accountDAOBalance).toFixed(8));
            if (parseFloat(accountDAOBalance) >= 0.000001) {
                $(row).find(".DAODisplay").show();
            } else {
                accountDAOBalance = 0;
                $(row).find(".DAODisplay").hide();
            }

            var accountREPRawBalance = wallet.getPouchFold(COIN_AUGUR_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountREPBalance = HDWalletHelper.convertCoinToUnitType(COIN_AUGUR_ETHEREUM, accountREPRawBalance, COIN_UNITLARGE);
            accountREPBalance = parseFloat(parseFloat(accountREPBalance).toFixed(8));
            if (parseFloat(accountREPBalance) >= 0.000001) { // Show token display?
                $(row).find('.REPDisplay').show();
            } else {
                accountREPBalance = 0;
                $(row).find('.REPDisplay').hide();
            }

            var accountICNRawBalance = wallet.getPouchFold(COIN_ICONOMI_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountICNBalance = HDWalletHelper.convertCoinToUnitType(COIN_ICONOMI_ETHEREUM, accountICNRawBalance, COIN_UNITLARGE);
            accountICNBalance = parseFloat(parseFloat(accountICNBalance).toFixed(8));
            if (parseFloat(accountICNBalance) >= 0.000001) { // Show token display?
                $(row).find('.ICNDisplay').show();
            } else {
                accountICNBalance = 0;
                $(row).find('.ICNDisplay').hide();
            }

            var accountGNTRawBalance = wallet.getPouchFold(COIN_GOLEM_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountGNTBalance = HDWalletHelper.convertCoinToUnitType(COIN_GOLEM_ETHEREUM, accountGNTRawBalance, COIN_UNITLARGE);
            accountGNTBalance = parseFloat(parseFloat(accountGNTBalance).toFixed(8));
            if (parseFloat(accountGNTBalance) >= 0.000001) { // Show token display?
                $(row).find('.GNTDisplay').show();
            } else {
                accountGNTBalance = 0;
                $(row).find('.GNTDisplay').hide();
            }

            var accountGNORawBalance = wallet.getPouchFold(COIN_GNOSIS_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountGNOBalance = HDWalletHelper.convertCoinToUnitType(COIN_GNOSIS_ETHEREUM, accountGNORawBalance, COIN_UNITLARGE);
            accountGNOBalance = parseFloat(parseFloat(accountGNOBalance).toFixed(8));
            if (parseFloat(accountGNOBalance) >= 0.000001) { // Show token display?
                $(row).find('.GNODisplay').show();
            } else {
                accountGNOBalance = 0;
                $(row).find('.GNODisplay').hide();
            }

            var accountSNGLSRawBalance = wallet.getPouchFold(COIN_SINGULARDTV_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountSNGLSBalance = HDWalletHelper.convertCoinToUnitType(COIN_SINGULARDTV_ETHEREUM, accountSNGLSRawBalance, COIN_UNITLARGE);
            accountSNGLSBalance = parseFloat(parseFloat(accountSNGLSBalance).toFixed(8));
            if (parseFloat(accountSNGLSBalance) >= 0.000001) { // Show token display?
                $(row).find('.SNGLSDisplay').show();
            } else {
                accountSNGLSBalance = 0;
                $(row).find('.SNGLSDisplay').hide();
            }

            var accountDGDRawBalance = wallet.getPouchFold(COIN_DIGIX_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountDGDBalance = HDWalletHelper.convertCoinToUnitType(COIN_DIGIX_ETHEREUM, accountDGDRawBalance, COIN_UNITLARGE);
            accountDGDBalance = parseFloat(parseFloat(accountDGDBalance).toFixed(8));
            if (parseFloat(accountDGDBalance) >= 0.000001) { // Show token display?
                $(row).find('.DGDDisplay').show();
            } else {
                accountDGDBalance = 0;
                $(row).find('.DGDDisplay').hide();
            }

            var accountBCAPRawBalance = wallet.getPouchFold(COIN_BLOCKCHAINCAPITAL_ETHEREUM).getDataStorageController().getBalanceByAddress(address);
            var accountBCAPBalance = HDWalletHelper.convertCoinToUnitType(COIN_BLOCKCHAINCAPITAL_ETHEREUM, accountBCAPRawBalance, COIN_UNITLARGE);
            accountBCAPBalance = parseFloat(parseFloat(accountBCAPBalance).toFixed(8));
            if (parseFloat(accountBCAPBalance) >= 0.000001) { // Show token display?
                $(row).find('.BCAPDisplay').show();
            } else {
                accountBCAPBalance = 0;
                $(row).find('.BCAPDisplay').hide();
            }

            var accountCVCBalance = HDWalletHelper.convertCoinToUnitType(COIN_CIVIC_ETHEREUM, accountCVCRawBalance, COIN_UNITLARGE);
            accountCVCBalance = parseFloat(parseFloat(accountCVCBalance).toFixed(8));
            if (parseFloat(accountCVCBalance) >= 0.000001) { // Show token display?
                $(row).find('.CVCDisplay').show();
            } else {
                accountCVCBalance = 0;
                $(row).find('.CVCDisplay').hide();
            }

            var coinAbbreviatedNameEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameTheDAOEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_THEDAO_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameAugurEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_AUGUR_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameIconomiEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ICONOMI_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameGolemEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_GOLEM_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameGnosisEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_GNOSIS_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameSingulardtvEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_SINGULARDTV_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameDigixEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_DIGIX_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameBlockchainCapitalEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_BLOCKCHAINCAPITAL_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameCivic = HDWalletPouch.getStaticCoinPouchImplementation(COIN_CIVIC_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            $(row).find('.accountBalanceEther').text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedNameEthereum + '\xa0');

            $(row).find('.accountBalanceDAO').text(("" + accountDAOBalance).substring(0, 8) + " " + coinAbbreviatedNameTheDAOEthereum);

            $(row).find('.accountBalanceREP').text(("" + accountREPBalance).substring(0, 8) + " " + coinAbbreviatedNameAugurEthereum);

            $(row).find('.accountBalanceICN').text(("" + accountICNBalance).substring(0, 8) + " " + coinAbbreviatedNameIconomiEthereum);

            $(row).find('.accountBalanceGNT').text(("" + accountGNTBalance).substring(0, 8) + " " + coinAbbreviatedNameGolemEthereum);

            $(row).find('.accountBalanceGNO').text(("" + accountGNOBalance).substring(0, 8) + " " + coinAbbreviatedNameGnosisEthereum);

            $(row).find('.accountBalanceSNGLS').text(("" + accountSNGLSBalance).substring(0, 8) + " " + coinAbbreviatedNameSingulardtvEthereum);

            $(row).find('.accountBalanceDGD').text(("" + accountDGDBalance).substring(0, 8) + " " + coinAbbreviatedNameDigixEthereum);

            $(row).find('.accountBalanceBCAP').text(("" + accountBCAPBalance).substring(0, 8) + " " + coinAbbreviatedNameBlockchainCapitalEthereum);

            $(row).find('.accountBalanceCVC').text(("" + accountCVCBalance).substring(0, 8) + " " + coinAbbreviatedNameCivic);

            //            if (accountDAOBalance > 0) {
            $('.imgDAO', row).show();
            $('.imgDAO', row).css('display', 'inline-block');
            $('.imgREP', row).show();
            $('.imgREP', row).css('display', 'inline-block');
            $('.imgICN', row).show();
            $('.imgICN', row).css('display', 'inline-block');
            $('.imgGNT', row).show();
            $('.imgGNT', row).css('display', 'inline-block');
            $('.imgGNO', row).show();
            $('.imgGNO', row).css('display', 'inline-block');
            $('.imgSNGLS', row).show();
            $('.imgSNGLS', row).css('display', 'inline-block');
            $('.imgDGD', row).show();
            $('.imgDGD', row).css('display', 'inline-block');
            $('.imgBCAP', row).show();
            $('.imgBCAP', row).css('display', 'inline-block');
            $('.imgCVC', row).show();
            $('.imgCVC', row).css('display', 'inline-block');

            //            } else {
            //                $('.imgDAO', row).hide();
            //            }

            //            if (accountREPBalance > 0) {

            //            } else {
            //                $('.imgREP', row).hide();
            //            }
        } else if (coinType === COIN_ETHEREUM_CLASSIC) {
            largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            if (parseFloat(largeBalance) >= 0.000001) {

            } else {
                largeBalance = 0;
            }

            var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ETHEREUM_CLASSIC).pouchParameters['coinAbbreviatedName'];

            $('.accountBalanceEther', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
        } else if (coinType === COIN_THEDAO_ETHEREUM) {
            var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoin).pouchParameters['coinAbbreviatedName'];

            $('.accountBalance', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName);
            //@note: @here: @todo: @augur:
        } else if (coinType === COIN_TESTNET_ROOTSTOCK) {
            largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            if (parseFloat(largeBalance) >= 0.000001) {
            } else {
                largeBalance = 0;
            }

            var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_TESTNET_ROOTSTOCK).pouchParameters['coinAbbreviatedName'];

            $('.accountBalanceEther', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
            /*
             } else if (coinType === COIN_ZCASH) {
             largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

             if (parseFloat(largeBalance) >= 0.000001) {
             } else {
             largeBalance = 0;
             }

             var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ZCASH).pouchParameters['coinAbbreviatedName'];

             $('.accountBalance', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
             */
            //} else if (coinType === COIN_DOGE) {
            //largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            //if (parseFloat(largeBalance) >= 0.000001) {
            //} else {
            //    largeBalance = 0;
            //}

            // var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_DOGE).pouchParameters['coinAbbreviatedName'];

            // $('.accountBalance', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
            //$('.accountBalance', row).text(displayBalanceForPrivateKeys);
        } else {
            // Option For the default private key balance display

            $('.accountBalance', row).text(displayBalanceForPrivateKeys);
        }
        // Show only the active image.
        for (var j = 0; j < COIN_NUMCOINTYPES; j++) {
            var coinLargePngName = HDWalletPouch.getStaticCoinPouchImplementation(j).uiComponents['coinLargePngName'];
            if (j === coinType) {
                $(coinLargePngName, row).show();
                $(coinLargePngName, row).css('display', 'inline-block');
            }
        }

        $(".accountPrivateKey", row).text(wallet.getPouchFold(coinType).getPrivateKeyFromAddress(address));
        this.formatExportPrivateKeys(address, wallet.getPouchFold(coinType).getPrivateKeyFromAddress(address));

        $('.imgShapeShift', row).hide();


        //        $('.imgDAO', row).bind('beforeShow', function() {
        //            console.log("yo");
        //        });
        //
        //        $('.imgDAO', row).bind('beforeHide', function() {
        //            console.log("sup");
        //        });
        /*
        if (item.isShapeShiftAssociated === true) {
            $('.imgShapeShift', row).show();
        } else {
            $('.imgShapeShift', row).hide();
        }*/
    }
    $('.' + pageDisplayPrivateKeysName + ' .textDisplayMessageForPrivateKeys').hide();
    if (coinType === COIN_ETHEREUM){
        $(".backupPrivateKeyListETHLegacyWarning").show();
        $(".accountDataEthereumLegacyKeypair").show();
        $(".nonHDAccounts").show();
        $(".nonHDMessage").show();
        $(".wrapperDisplayMessageForPrivateKeys").show();
    }
    var accountsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountsListElementName'];
    var accountTable = $(accountsListElement);
    accountTable.append("<div class='cssKeySpacer'></div>");
}

JaxxUI.prototype.formatExportPrivateKeys = function(address, keys) {
    this._strKeyPair += address + "," + keys + ",\n";
}

JaxxUI.prototype.updateAccountList = function(coinType, accounts) {
    var accountsListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['accountsListElementName'];

    var accountTable = $(accountsListElement);

    var tableChildren = accountTable.children('.tableRow');
    var numExistingRows = tableChildren.length;

    //    console.log("[pre] table :: " + accountTable + " :: number of children :: " + numExistingRows + " :: accounts.length :: " + accounts.length);

    //@note: check for differences between existing tx list and history. push or pop as necessary.
    var itemCountDiff = accounts.length - numExistingRows;
    if (itemCountDiff < 0) {
        for (var i = 0; i < -itemCountDiff; i++) {
            accountTable.children('.tableRow').last().remove();
        }

        tableChildren = accountTable.children('.tableRow');
        numExistingRows = tableChildren.length;
    } else if (itemCountDiff > 0) {
        for (var i = 0; i < itemCountDiff; i++) {
            this.createNewAccountRow(coinType);
        }

        tableChildren = accountTable.children('.tableRow');
        numExistingRows = tableChildren.length;
    }

    //    console.log("[post] table :: " + accountTable + " :: number of children :: " + numExistingRows + " :: accounts.length :: " + accounts.length);


    //@note: @here: @token: this seems necessary.
    for (var i = 0; i < accounts.length; i++) {
        var item = accounts[i];
        // We retrieve balance information from DCL Layer Data.
        var balanceFromDCL = wallet.getPouchFold(coinType).getDataStorageController().getBalanceByAddress(item.pubAddr);
        var displayBalanceFromDCL = HDWalletHelper.convertCoinToUnitType(coinType, balanceFromDCL, COIN_UNITLARGE);
        var displayBalanceForPrivateKeys = wallet.getPouchFold(coinType).getPrivateKeyDisplayBalance(displayBalanceFromDCL);

        var row = $(tableChildren[i]);

        var largeBalance = displayBalanceForPrivateKeys;

        //        console.log("account :: " + i + " :: balance :: " + item.balance + " :: largeBalance :: " + largeBalance + " :: " + JSON.stringify(item));

        $('.accountPublicAddress', row).text(item.pubAddr);
        $('.accountPrivateKey', row).text(item.pvtKey);

        for (var j = 0; j < COIN_NUMCOINTYPES; j++) {
            var coinLargePngName = HDWalletPouch.getStaticCoinPouchImplementation(j).uiComponents['coinLargePngName'];

            if (j === coinType) {
                $(coinLargePngName, row).show();
            } else {
                $(coinLargePngName, row).hide();
            }
        }

        //if (coinType === COIN_BITCOIN) {
        //    $('.accountBalance', row).text(displayBalanceForPrivateKeys);
        if (coinType === COIN_ETHEREUM) {
            largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            if (parseFloat(largeBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .etherDisplay").show();
            } else {
                largeBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .etherDisplay").hide();
            }

            var accountDAOBalance = HDWalletHelper.convertCoinToUnitType(COIN_THEDAO_ETHEREUM, wallet.getPouchFold(COIN_THEDAO_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE) * 100;

            accountDAOBalance = parseFloat(parseFloat(accountDAOBalance).toFixed(8));
            if (parseFloat(accountDAOBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .DAODisplay").show();
            } else {
                accountDAOBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .DAODisplay").hide();
            }

            var accountREPBalance = HDWalletHelper.convertCoinToUnitType(COIN_AUGUR_ETHEREUM, wallet.getPouchFold(COIN_AUGUR_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountREPBalance = parseFloat(parseFloat(accountREPBalance).toFixed(8));
            if (parseFloat(accountREPBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .REPDisplay").hide();
            } else {
                accountREPBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .REPDisplay").hide();
            }

            var accountICNBalance = HDWalletHelper.convertCoinToUnitType(COIN_ICONOMI_ETHEREUM, wallet.getPouchFold(COIN_ICONOMI_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountICNBalance = parseFloat(parseFloat(accountICNBalance).toFixed(8));
            if (parseFloat(accountICNBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .ICNDisplay").hide();
            } else {
                accountICNBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .ICNDisplay").hide();
            }

            var accountGNOBalance = HDWalletHelper.convertCoinToUnitType(COIN_GNOSIS_ETHEREUM, wallet.getPouchFold(COIN_GNOSIS_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountGNOBalance = parseFloat(parseFloat(accountGNOBalance).toFixed(8));
            if (parseFloat(accountGNOBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .GNODisplay").hide();
            } else {
                accountGNOBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .GNODisplay").hide();
            }

            var accountSNGLSBalance = HDWalletHelper.convertCoinToUnitType(COIN_SINGULARDTV_ETHEREUM, wallet.getPouchFold(COIN_SINGULARDTV_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountSNGLSBalance = parseFloat(parseFloat(accountSNGLSBalance).toFixed(8));
            if (parseFloat(accountSNGLSBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .SNGLSDisplay").hide();
            } else {
                accountSNGLSBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .SNGLSDisplay").hide();
            }

            var accountGNTBalance = HDWalletHelper.convertCoinToUnitType(COIN_GOLEM_ETHEREUM, wallet.getPouchFold(COIN_GOLEM_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountGNTBalance = parseFloat(parseFloat(accountGNTBalance).toFixed(8));
            if (parseFloat(accountGNTBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .GNTDisplay").hide();
            } else {
                accountGNTBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .GNTDisplay").hide();
            }

            var accountDGDBalance = HDWalletHelper.convertCoinToUnitType(COIN_DIGIX_ETHEREUM, wallet.getPouchFold(COIN_DIGIX_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountDGDBalance = parseFloat(parseFloat(accountDGDBalance).toFixed(8));
            if (parseFloat(accountDGDBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .DGDDisplay").hide();
            } else {
                accountDGDBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .DGDDisplay").hide();
            }

            var accountBCAPBalance = HDWalletHelper.convertCoinToUnitType(COIN_BLOCKCHAINCAPITAL_ETHEREUM, wallet.getPouchFold(COIN_BLOCKCHAINCAPITAL_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountBCAPBalance = parseFloat(parseFloat(accountBCAPBalance).toFixed(8));
            if (parseFloat(accountBCAPBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .BCAPDisplay").hide();
            } else {
                accountBCAPBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .BCAPDisplay").hide();
            }

            var accountCVCBalance = HDWalletHelper.convertCoinToUnitType(COIN_CIVIC_ETHEREUM, wallet.getPouchFold(COIN_CIVIC_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE);

            accountCVCBalance = parseFloat(parseFloat(accountCVCBalance).toFixed(8));
            if (parseFloat(accountCVCBalance) >= 0.000001) {
                $(".backupPrivateKeysEthereum .HDAccounts .CVCDisplay").hide();
            } else {
                accountCVCBalance = 0;
                $(".backupPrivateKeysEthereum .HDAccounts .CVCDisplay").hide();
            }

            var coinAbbreviatedNameEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameTheDAOEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_THEDAO_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameAugurEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_AUGUR_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameIconomiEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ICONOMI_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameGnosisEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_GNOSIS_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameGolemEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_GOLEM_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameSingulardtvEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_SINGULARDTV_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameDigixEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_DIGIX_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameBlockchainCapitalEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_BLOCKCHAINCAPITAL_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            var coinAbbreviatedNameCivic = HDWalletPouch.getStaticCoinPouchImplementation(COIN_CIVIC_ETHEREUM).pouchParameters['coinAbbreviatedName'];

            $('.accountBalanceEther', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedNameEthereum + '\xa0');

            $('.accountBalanceDAO', row).text(("" + accountDAOBalance).substring(0, 8) + " " + coinAbbreviatedNameTheDAOEthereum);

            $('.accountBalanceREP', row).text(("" + accountREPBalance).substring(0, 8) + " " + coinAbbreviatedNameAugurEthereum);

            $('.accountBalanceGNT', row).text(("" + accountGNTBalance).substring(0, 8) + " " + coinAbbreviatedNameIconomiEthereum);
            $('.accountBalanceSNGLS', row).text(("" + accountSNGLSBalance).substring(0, 8) + " " + coinAbbreviatedNameGnosisEthereum);
            $('.accountBalanceICN', row).text(("" + accountICNBalance).substring(0, 8) + " " + coinAbbreviatedNameGolemEthereum);
            $('.accountBalanceGNO', row).text(("" + accountGNOBalance).substring(0, 8) + " " + coinAbbreviatedNameSingulardtvEthereum);
            $('.accountBalanceDGD', row).text(("" + accountDGDBalance).substring(0, 8) + " " + coinAbbreviatedNameDigixEthereum);
            $('.accountBalanceBCAP', row).text(("" + accountBCAPBalance).substring(0, 8) + " " + coinAbbreviatedNameBlockchainCapitalEthereum);
            $('.accountBalanceCVC', row).text(("" + accountCVCBalance).substring(0, 8) + " " + coinAbbreviatedNameCivic);


//            if (accountDAOBalance > 0) {
            $('.imgDAO', row).show();
//            } else {
//                $('.imgDAO', row).hide();
//            }

//            if (accountREPBalance > 0) {
            $('.imgREP', row).show();
            $('.imgICN', row).show();
            $('.imgGNT', row).show();
            $('.imgGNO', row).show();
            $('.imgSNGLS', row).show();
            $('.imgDGD', row).show();
            $('.imgBCAP', row).show();
            $('.imgCVC', row).show();

//            } else {
//                $('.imgREP', row).hide();
//            }
        } else if (coinType === COIN_ETHEREUM_CLASSIC) {
            largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            if (parseFloat(largeBalance) >= 0.000001) {
            } else {
                largeBalance = 0;
            }

            var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ETHEREUM_CLASSIC).pouchParameters['coinAbbreviatedName'];

            $('.accountBalanceEther', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
        } else if (coinType === COIN_THEDAO_ETHEREUM) {
            var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoin).pouchParameters['coinAbbreviatedName'];

            $('.accountBalance', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName);
            //@note: @here: @todo: @augur:
        } else if (coinType === COIN_TESTNET_ROOTSTOCK) {
            largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            if (parseFloat(largeBalance) >= 0.000001) {
            } else {
                largeBalance = 0;
            }

            var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_TESTNET_ROOTSTOCK).pouchParameters['coinAbbreviatedName'];

            $('.accountBalanceEther', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
            /*
            } else if (coinType === COIN_ZCASH) {
                largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

                if (parseFloat(largeBalance) >= 0.000001) {
                } else {
                    largeBalance = 0;
                }

                var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ZCASH).pouchParameters['coinAbbreviatedName'];

                $('.accountBalance', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
            */
            //} else if (coinType === COIN_DOGE) {
            //largeBalance = parseFloat(parseFloat(largeBalance).toFixed(8));

            //if (parseFloat(largeBalance) >= 0.000001) {
            //} else {
            //    largeBalance = 0;
            //}

            // var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(COIN_DOGE).pouchParameters['coinAbbreviatedName'];

            // $('.accountBalance', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedName + '\xa0');
            //$('.accountBalance', row).text(displayBalanceForPrivateKeys);
        } else {
            // Option For the default private key balance display
            $('.accountBalance', row).text(displayBalanceForPrivateKeys);
        }

//        $('.imgDAO', row).bind('beforeShow', function() {
//            console.log("yo");
//        });
//
//        $('.imgDAO', row).bind('beforeHide', function() {
//            console.log("sup");
//        });

        if (item.isShapeShiftAssociated === true) {
            $('.imgShapeShift', row).show();
        } else {
            $('.imgShapeShift', row).hide();
        }
    }




}
/*
JaxxUI.prototype.setupEthereumLegacyKeypairDisplay = function(item) {
    var largeBalance = HDWalletHelper.convertCoinToUnitType(COIN_ETHEREUM, item.balance, COIN_UNITLARGE);

    //    console.log("ethereum legacy account :: balance :: " + item.balance + " :: largeBalance :: " + largeBalance + " :: " + JSON.stringify(item));

    var row = $('.accountDataEthereumLegacyKeypair');

    var accountDAOBalance = HDWalletHelper.convertCoinToUnitType(COIN_THEDAO_ETHEREUM, wallet.getPouchFold(COIN_THEDAO_ETHEREUM).getAccountBalance(item.pubAddr), COIN_UNITLARGE) * 100;

    var coinAbbreviatedNameEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_ETHEREUM).pouchParameters['coinAbbreviatedName'];

    var coinAbbreviatedNameTheDAOEthereum = HDWalletPouch.getStaticCoinPouchImplementation(COIN_THEDAO_ETHEREUM).pouchParameters['coinAbbreviatedName'];

    $('.accountPublicAddress', row).text(item.pubAddr);
    $('.accountPrivateKey', row).text(item.pvtKey);
    //change was made to pass copytoclipboard for ETH private keys
    $('.populateNonHDPublicKey').attr('copy', item.pubAddr);
    $('.populateNonHDPrivateKey').attr('copy', item.pvtKey);
    //changes-end
    $('.accountBalanceEther', row).text(("" + largeBalance).substring(0, 8) + " " + coinAbbreviatedNameEthereum + '\xa0');
    $('.accountBalanceDAO', row).text(("" + accountDAOBalance).substring(0, 8) + " " + coinAbbreviatedNameTheDAOEthereum); // This line will display something like XX.XXX DAO in the legacy key pairs.

    for (var j = 0; j < COIN_NUMCOINTYPES; j++) {
        var coinLargePngName = HDWalletPouch.getStaticCoinPouchImplementation(j).uiComponents['coinLargePngName'];

        if (j === COIN_ETHEREUM || j === COIN_THEDAO_ETHEREUM) {
            $(coinLargePngName, row).show();
        } else {
            $(coinLargePngName, row).hide();
        }
    }

    if (parseFloat(largeBalance) >= 0.000001) {
        $(".backupPrivateKeysEthereum .nonHDAccounts .etherDisplay").show();
    } else {
        largeBalance = 0;
        $(".backupPrivateKeysEthereum .nonHDAccounts .etherDisplay").hide();
    }

    if (parseFloat(accountDAOBalance) >= 0.000001) {
        $(".backupPrivateKeysEthereum .nonHDAccounts .DAODisplay").show();
    } else {
        accountDAOBalance = 0;
        $(".backupPrivateKeysEthereum .nonHDAccounts .DAODisplay").hide();
    }

    if (item.isShapeShiftAssociated === true) {
        $('.imgShapeShift', row).show();
    } else {
        $('.imgShapeShift', row).hide();
    }
}*/

JaxxUI.prototype.resetShapeShift = function() {
    console.log('resetShapeShift');

    //@note: @todo: @here: @optimization: this might want to be checked for validity re: opacity or such.

    g_JaxxApp.getUI().hideShapeshiftSpinner();

    // console.error(' JaxxUI.prototype.resetShapeShift     ')

    return

    if (g_JaxxApp.getShapeShiftHelper().getIsTriggered()) {
        if (this.isShapeshiftCoinListOpen()) {
            this.closeShapeshiftCoinList();
        }

        $('.shapeShiftToggleItem :checkbox').prop('checked', false);

        // $('.spendableShapeshift').slideUp();

        //Reset normal UI values (remove shapeshift)
        $('.tabContent .address input').css({backgroundImage: 'none'}).removeClass('validShapeshift').removeClass('cssValidShapeshift ');
        $('.tabContent .amount input').attr("placeholder", "Amount"); //Change text of amount placeholder
        $('#sendLabel').text("Send");
        $('.tabContent .amount input').removeClass('validShapeshiftAmount').removeClass('cssValidShapeshiftAmount ');

        /*if (curCoinType === COIN_ETHEREUM) {
            $('.tabContent .advancedTabButton').show().slideDown();
        }*/

        //  var coinDisplayColor = HDWalletPouch.getStaticCoinPouchImplementation(receiveCoinType).uiComponents['coinDisplayColor'];

        //$('.shapeShiftToggleButtonLabel').css({'background': coinDisplayColor});
    }

    // g_JaxxApp.getShapeShiftHelper().setReceivePairForCoinType(curCoinType, receiveCoinType);

    g_JaxxApp.getShapeShiftHelper().reset();
}

JaxxUI.prototype.beginShapeShiftMultiShift = function() {
    g_JaxxApp.getUI().showShapeshiftSpinner();
}

JaxxUI.prototype.endShapeShiftMultiShift = function() {
    g_JaxxApp.getUI().hideShapeshiftSpinner();
}


JaxxUI.prototype.populateShapeShiftReceiveData = function(ssMarketData) {

    // console.warn(ssMarketData);
    //@note: @todo: in the Grand Cleaning.

    var curMarketData = g_JaxxApp.getShapeShiftHelper().getMarketForCoinTypeSend(curCoinType);

    if (curMarketData.multiShift !== null) {
        var foundIssue = false;

        for (var i = 0; i < curMarketData.multiShift.length; i++) {
            if (typeof(curMarketData.multiShift[i]) !== 'undefined' && curMarketData.multiShift[i] !== null && curMarketData.multiShift[i].depositAddress !== null) {
                //                console.log("shapeShift :: multiShifting :: " + i + " :: with deposit :: " + curMarketData.multiShift[i].depositAddress);
                //                depositAddresses[i] = curMarketData.multiShift[i].depositAddress;
            } else {
                console.log("shapeShift :: issue with deposit :: " + i);
                foundIssue = true;
            }
        }

        if (foundIssue !== true) {
            console.log("shapeShift :: done multishifting :: " + curMarketData.multiShift.length);
        }
    } else {
        console.log("shapeShift :: issue with multishifting :: " + JSON.stringify(curMarketData, null, 4));
    }

    $('.tabContent .amount input').trigger('keyup');
    updateSpendable();
}

JaxxUI.prototype.triggerShapeShift = function(curCoinType, numShiftsRequired) {

    var self = this;

    g_JaxxApp.getShapeShiftHelper().requestMultiShift(curCoinType, numShiftsRequired, function(shiftParams) {
        //
        var depositAddress = wallet.getPouchFold(curCoinType).setShapeShiftDepositAddress( shiftParams.shiftMarketData.depositAddress);
        var coinTypeDict = g_JaxxApp.getShapeShiftHelper().getPairCoinTypeDict(shiftParams.shiftMarketData.pair);

        if (coinTypeDict.send === curCoinType) {
            g_JaxxApp.getUI().populateShapeShiftReceiveData(g_JaxxApp.getShapeShiftHelper()._marketData[coinTypeDict.send][coinTypeDict.receive]);
        }
    });
};

// JAXX COIN BULLETIN STUFF BEGINS

JaxxUI.prototype.fetchAndStoreCoinBulletinData = function(){
    var self = this;

    var callback = function(data){
        self.storeCoinBulletinData(data);
        self.populateCoinBulletinMenu();
    };

    this.getJaxxCoinBulletin(callback);
};
/*
* Obtain jaxx news data located in local storage
* @method getJaxxCoinBulletin
* @param {Function} callback - function to fire after obtaining jaxxNews
* */
JaxxUI.prototype.getJaxxCoinBulletin = function(callback) {
    // **** Reminder:  When testing use different endpoint - not the live one ****
    var url;
    if(Registry.application.config.utils) {
      url = Registry.application.config.utils.coinBulletin;
      var filePath = Registry.application.config.utils.localCoinBulletin;
      var key = UTILS_COIN_BULLETIN;
      jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
        if(err) {
          console.error(err);
        } else {
          var data = jaxx.FileManager.getLocalStorage(key);
          callback(data || []);
        }
      });
    } else {
      url = "https://jaxx.io/jaxx-data/jaxx-coin-bulletin.php";
      $.getJSON( url, function( data ) {
        callback(data || []);
      });
    }

};

JaxxUI.prototype.storeCoinBulletinData = function(data){
    // coinTypes = Object.keys(data);
    var newData = {};
    var coinType;
   // console.warn(data);
    for (var i = 0; i < data.length; i++) {
        coinType = Object.keys(data[i]);
        if(!coinType[0]) continue;
        newData[coinType[0]] = {};
        newData[coinType[0]]["criticality"] = JaxxUtils.scrubInput(data[i][coinType[0]]["criticality"]);
        newData[coinType[0]]["version"] = JaxxUtils.scrubInput(data[i][coinType[0]]["version"]);
        newData[coinType[0]]["menu_title"] = JaxxUtils.scrubInput(data[i][coinType[0]]["menu_title"]);
        newData[coinType[0]]["title"] = JaxxUtils.scrubInput(data[i][coinType[0]]["title"]);
        newData[coinType[0]]["description"] = JaxxUtils.scrubInput(data[i][coinType[0]]["description"]);
        newData[coinType[0]]["date"] = JaxxUtils.scrubInput(data[i][coinType[0]]["date"]);
        }
    g_JaxxApp.getUI().setCoinBulletinData(newData);
};

JaxxUI.prototype.setCoinBulletinData = function(newData){
    this._jaxxCoinBulletin = newData;
};

JaxxUI.prototype.getCoinBulletinData = function(){
    return this._jaxxCoinBulletin;
};

JaxxUI.prototype.populateCoinBulletinMenu = function(){
    var coinAbbreviatedNames = Object.keys(this._jaxxCoinBulletin);
    var bulletinMenu = $(".bulletinPage .scrollableMenuList");
    var jNews = $('.jaxxNews .cssBtnIntroRight');
    bulletinMenu.empty();

    // For each bulletin JSON object, grab data from the file and generate the bulletin menu
    for (var i = 0; i < coinAbbreviatedNames.length; i++){
        if(coinAbbreviatedNames[i] !== "ALL")
        {
            var coinType = jaxx.Registry.getCryptoControllerBySymbol(coinAbbreviatedNames[i]).config.symbol;
            if(!coinType)
            {
                return;
            }
            // Call getCoinBulletinMenuRow to generate the menu item based on the coin type
            bulletinMenu.append(g_JaxxApp.getUI().getCoinBulletinMenuRow(coinType));
            jNews.attr('value', coinAbbreviatedNames[i]);
        }
        else
        {
            // Special case for "ALL" bulletin that doesn't work with getCoinBulletinMenuRow since it's not a coin
            // Generates the menu item for the special case for a bulletin that is not coin specific
            var menuTitle = this.getCoinBulletinData()["ALL"]["menu_title"];
            var date = this.getCoinBulletinData()["ALL"]["date"];
            var htmlRow = '<div class="settingsResetCache expandableText cssExpandableText scriptAction cssOpacity expandableDetailsAncestor cssInitialHeight bulletinPadding" specialaction="jaxx_controller.showCoinBulletin" value="ALL">';
            htmlRow += '<div class="coinIcon cssCoinIcon cssImageLogoIconAll cssHighlighted"><div class="image"></div></div>';
            htmlRow += '<div class="expandableDetailsHeader cssExpandableDetailsHeader">';
            htmlRow += '<div class="optionTrigger cssOptionTrigger">';
            htmlRow += '<div class="optionHeading cssOptionHeading bulletinTitle">';
            htmlRow += '<label class="menuCoinBulletinTitle cssMenuCoinBulletinTitle">'+menuTitle+'</label>';
            htmlRow += '</div>';
            htmlRow += '<div class="postedDateWrapper cssOptionHeading italicText bulletinDate"><div class="postedLabel cssPostedLabel">Posted:</div>';
            htmlRow += '<div class="postedDate cssPostedDate">'+ date+'</div></div>';
            htmlRow += '</div>';
            htmlRow += '</div>';
            htmlRow += '</div>';

            bulletinMenu.append(htmlRow);
            jNews.attr('value', coinAbbreviatedNames[i]);
        }

    }
    this.attachClickEventForScriptAction($(".bulletinPage .scrollableMenuList .scriptAction"));
};

JaxxUI.prototype.getCoinBulletinMenuRow = function(coinType){
    var coinAbbreviatedName = jaxx.Registry.getCryptoControllerBySymbol(coinType).config.symbol;
    var menuTitle = this.getCoinBulletinData()[coinAbbreviatedName]["menu_title"];
    var date = this.getCoinBulletinData()[coinAbbreviatedName]["date"];
    var icon = jaxx.Registry.getCryptoControllerBySymbol(coinType).config.icon;

    // Appending to an HTML object that this function returns to create a bulletin menu item based a coin type and the data from the JSON
    var htmlRow = '<div class="settingsResetCache expandableText cssExpandableText scriptAction cssOpacity expandableDetailsAncestor cssInitialHeight bulletinPadding" specialaction="jaxx_controller.showCoinBulletin" value='+coinAbbreviatedName+'>';
        htmlRow += '<div class="coinIcon cssCoinIcon cssHighlighted"><div class="image"><img src="' + icon + '" class="cssImageLogoIcon"></div></div>';
        htmlRow += '<div class="expandableDetailsHeader cssExpandableDetailsHeader">';
        htmlRow += '<div class="optionTrigger cssOptionTrigger">';
        htmlRow += '<div class="optionHeading cssOptionHeading bulletinTitle">';
        htmlRow += '<label class="menuCoinBulletinTitle cssMenuCoinBulletinTitle">'+menuTitle+'</label>';
        htmlRow += '</div>';
        htmlRow += '<div class="postedDateWrapper cssOptionHeading italicText bulletinDate"><div class="postedLabel cssPostedLabel">Posted:</div>';
        htmlRow += '<div class="postedDate cssPostedDate">'+ date+'</div></div>';
        htmlRow += '</div>';
        htmlRow += '</div>';
        htmlRow += '</div>';

    return htmlRow;
};

// JAXX COIN BULLETIN STUFF ENDS

// JAXX NEWS STUFF BEGINS
/*
* Obtain jaxx news data located in local storage
* @method getJaxxNews
* @param {Function} callback - function to fire after obtaining jaxxNews
* */
JaxxUI.prototype.getJaxxNews = function(callback) {
    var self = this;
    // **** Reminder:  When testing use different endpoint - not the live one ****
    var url;
    if(Registry.application.config.utils) {
        url = Registry.application.config.utils.jaxxNews;
      var filePath = Registry.application.config.utils.localJaxxNews;
      var key = UTILS_NEWS;
      jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
        if(err) {
          console.error(err);
        } else {
          var data = jaxx.FileManager.getLocalStorage(key);
          if(data && data[0]) {
            self._jaxxNewsData = data[0];
            callback();
          }
        }
      });
    } else {
      url = "https://jaxx.io/jaxx-data/jaxx-news.php"
      $.getJSON( url, function( data ) {
        if (data && data[0]) {
          self._jaxxNewsData = data[0];
          callback();
        }
      });
    }

};

JaxxUI.prototype.displayJaxxNews = function() {
    console.log("news data :: " + JSON.stringify(this._jaxxNewsData));
    var scrubbedTitleString = JaxxUtils.scrubInput(this._jaxxNewsData.title);
    $('.getTitleForJaxxNews').text(scrubbedTitleString);
    var scrubbedBodyString = JaxxUtils.scrubInput(this._jaxxNewsData.description);
    //            console.log("data[0].description :: " + this._jaxxNewsData.description + " :: scrubbed :: " + scrubbedBodyString);
    var version = null;
    if (typeof(this._jaxxNewsData.version) !== 'undefined' && this._jaxxNewsData.version !== null){
        version = this._jaxxNewsData.version;
    }
    if (typeof(version) !== 'undefined' && version !== null){
        this.addJaxxNewsShownVersions(JaxxUtils.scrubInput(version));
    }
    $('.getDescriptionForJaxxNews').html(scrubbedBodyString);
    Navigation.openModal('jaxxNews');
};

JaxxUI.prototype.addJaxxNewsShownVersions = function(strVersion){
    if (typeof(this._criticalVersionUpdatesShown) !== 'undefined' && this._criticalVersionUpdatesShown !== null && typeof(strVersion) !== 'undefined' && strVersion !== null){
        if (!(this._criticalVersionUpdatesShown.indexOf(strVersion) > -1)){
            this._criticalVersionUpdatesShown.push(strVersion);
            storeData('criticalVersionUpdatesShown', JSON.stringify(this._criticalVersionUpdatesShown), false);
        }
    }
};

JaxxUI.prototype.displayJaxxNewsIfUnseen = function() {
    if (this._hasDisplayedJaxxNews === false) {
        this._hasDisplayedJaxxNews = true;
        var version = JaxxUtils.scrubInput(this._jaxxNewsData.version);
        if (typeof(version) !== 'undefined' && version !== null){
            if (!(this._criticalVersionUpdatesShown.indexOf(version) > -1)){
                this.displayJaxxNews();
            }
        }
    }
}

JaxxUI.prototype.displayJaxxNewsIfCritical = function() {
    if (this._jaxxNewsData !== null && this._jaxxNewsData.criticality === "critical") {
        this.displayJaxxNewsIfUnseen();
        //            console.log("news data :: " + data[0].criticality)
    }
    else {
        //            console.log("view bulleting menu for relative news")
    }
}
// JAXX NEWS STUFF ENDS

// RELEASE NOTES BULLETIN STUFF BEGINS

// Run release bulletin if it hasn't been run already.
/*
* Obtain Release Bulletin data from local storage and show release notes if not shown
* @method getReleaseBulletin
* @param {Function} callback - function to fire after this has been executed.
* */
JaxxUI.prototype.getReleaseBulletin = function(callback) {
    var self = this;
    // **** Reminder:  When testing use different endpoint - not the live one ****
    var url;
    if(Registry.application.config.utils) {
      url = Registry.application.config.utils.jaxxReleaseNotes; // "https://jaxx.io/jaxx-data/jaxx-release-notes.php";
      var filePath = Registry.application.config.utils.localJaxxReleaseNotes;
      var key = UTILS_RELEASE_NOTES;
      jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
        if(err) {
          console.error(err);
          g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();
        } else {
          var data = jaxx.FileManager.getLocalStorage(key);
          if(data && data[0]) {
            self._jaxxReleaseBulletin = self.getReleaseNotesByPlatform(data[0]);
            callback();
          } else {
            g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();
          }
        }
      });
    } else {
        url = "https://jaxx.io/jaxx-data/jaxx-release-notes.php";
        $.getJSON( url, function( data ) {
          if (data && data[0]) {
            self._jaxxReleaseBulletin = self.getReleaseNotesByPlatform(data[0]);
            callback();
          } else {
            g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();
          }
        }).fail(function(err) {
          g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();
        })
    }

}

JaxxUI.prototype.scrubReleaseBulletinDescription = function(description){
    // g_JaxxApp.getUI().scrubReleaseBulletinDescription({   "inputImprovements": {"title": "Improvements", "details": "<ul><li>new stuff</li></ul>"},"inputBugFixes":{"title": "Bug Fixes","details":"<ul><li>new stuff</li></ul>"},"inputNewFeatures":{"title": "Improvements","details": "<ul><li>new stuff</li></ul>"}}) // try this
    for (var i = 0; i < description.length; i++){
        description[i]["element"] = JaxxUtils.scrubInput(description[i]["element"]);
        description[i]["title"] = JaxxUtils.scrubInput(description[i]["title"]);
        description[i]["details"] = JaxxUtils.scrubInput(description[i]["details"]);
    }
    return description;
}

JaxxUI.prototype.scrubReleaseBulletinTitle = function(title){
    return JaxxUtils.scrubInput(title);
}

JaxxUI.prototype.scrubReleaseBulletinHeading = function(heading){
    return JaxxUtils.scrubInput(heading);
}

JaxxUI.prototype.processScrubbedBodyString = function(scrubbedBodyString){
    for (var i = 0; i < scrubbedBodyString.length; i++){
        var key = scrubbedBodyString[i]["element"];
        titleSelector = $(".pageReleaseNotesBulletin .dataFromServer" + "." + key + ".title");
        detailsSelector = $(".pageReleaseNotesBulletin .dataFromServer" + "." + key + ".details");
        titleSelector.html(scrubbedBodyString[i]["title"]);
        detailsSelector.html(scrubbedBodyString[i]["details"]);
    }
    // $('.descriptionForJaxxReleaseBulletin').html(scrubbedBodyString);
}

JaxxUI.prototype.processScrubbedTitleString = function(scrubbedTitleString){
    $(".titleForJaxxReleaseBulletin").text(scrubbedTitleString);
}

JaxxUI.prototype.processScrubbedHeadingString = function(scrubbedHeadingString){
    $(".headingForJaxxReleaseBulletin").text(scrubbedHeadingString);
}

JaxxUI.prototype.displayJaxxReleaseBulletin = function() {
    //console.warn ("news data :: " + JSON.stringify(this._jaxxReleaseBulletin));
    var scrubbedTitleString = JaxxUtils.scrubInput(this._jaxxReleaseBulletin.title);
    $('.titleForJaxxReleaseBulletin').text(scrubbedTitleString);
    var scrubbedBodyString = this.scrubReleaseBulletinDescription(this._jaxxReleaseBulletin.description);
    var scrubbedTitleString = this.scrubReleaseBulletinTitle(this._jaxxReleaseBulletin.title);
    var scrubbedHeadingString = this.scrubReleaseBulletinHeading(this._jaxxReleaseBulletin.heading);
    //            console.log("data[0].description :: " + this._jaxxNewsData.description + " :: scrubbed :: " + scrubbedBodyString);
    var version = null;
    if (typeof(this._jaxxReleaseBulletin.version) !== 'undefined' && this._jaxxReleaseBulletin.version !== null){
        version = this._jaxxReleaseBulletin.version;
    }
    if (typeof(version) !== 'undefined' && version !== null){
        this.addReleaseBulletinShownVersions(JaxxUtils.scrubInput(version));
    }
    this.processScrubbedBodyString(scrubbedBodyString);
    this.processScrubbedTitleString(scrubbedTitleString);
    this.processScrubbedHeadingString(scrubbedHeadingString);
    $('.descriptionForJaxxReleaseBulletinWrapper').css('height', (window.innerHeight - 215).toString() + "px");

    if (!this._startJaxxWithTermsOfServicePageWasRun) { // In case the terms of service page was already shown (because release notes page)
        Navigation.pushSettings('pageReleaseNotesBulletin');
    }
    this.hideSplashScreen();
    this._release_notes_have_been_shown = true; // Last just in case something fails.
}

JaxxUI.prototype.addReleaseBulletinShownVersions = function(strVersion){
    if (typeof(this._jaxxReleaseBulletinVersions) !== 'undefined' && this._jaxxReleaseBulletinVersions !== null && typeof(strVersion) !== 'undefined' && strVersion !== null){
        if (!(this._jaxxReleaseBulletinVersions.indexOf(strVersion) > -1)){
            this._jaxxReleaseBulletinVersions.push(strVersion);
            storeData('_jaxxReleaseBulletinVersions', JSON.stringify(this._jaxxReleaseBulletinVersions), false);
        }
    }
}

JaxxUI.prototype.displayJaxxReleaseBulletinIfUnseen = function() {
    var version = JaxxUtils.scrubInput(this._jaxxReleaseBulletin.version);
    if (typeof(version) !== 'undefined' && version !== null) {
        if (!(this._jaxxReleaseBulletinVersions.indexOf(version) > -1)) {
            this._release_notes_have_been_shown = true; // Last just in case something fails.
            this.displayJaxxReleaseBulletin();
        } else {
            g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();
        }
    }
}



JaxxUI.prototype.hideSplashScreen = function(){
    if (window.native && window.native.hideSplashScreen) window.native.hideSplashScreen();
    setTimeout(function () {
        $(".applicationStart").fadeOut();
    },200)

}

JaxxUI.prototype.startJaxxIfNoReleaseNotesAreShown = function(){
    if (!this._release_notes_have_been_shown){

        g_JaxxApp.getInitializer().startJaxxWithTermsOfServicePage();


    } else {
        if (!this._release_notes_have_been_shown){
            this.displayJaxxReleaseBulletin();
        }
    }

    this.hideSplashScreen();
}

JaxxUI.prototype.getReleaseNotesByPlatform = function(data){
    var key = this.getReleaseNotesKeyBasedOnPlatform();
    // @TODO: USE default if data[key] is non-existant
    return data[key];
}

JaxxUI.prototype.getReleaseNotesKeyBasedOnPlatform = function() {
    if (PlatformUtils.mobileiOSCheck()){
        return "ios";
    } else if (PlatformUtils.mobileAndroidCheck) {
        return "android";
    } else if (PlatformUtils.desktopCheck()) {
        return "desktop";
    } else if (PlatformUtils.extensionSafariCheck()){
        return "safari";
    } else if (PlatformUtils.extensionChromeCheck()) {
        return "chrome";
    } else if (PlatformUtils.extensionFirefoxCheck()) {
        return "firefox";
    } else {
        return "default";
    }
}

// BEGIN: CHANGE LOG INFORMATION

JaxxUI.prototype.getChangeLogByPlatform = function(data) {
    var key = this.getChangeLogKeyBasedOnPlatform();
    if (typeof(data[key]) === 'undefined' || data[key] === null) {
        return data["default"];
    } else {
        return data[key];
    }
}

JaxxUI.prototype.getChangeLogKeyBasedOnPlatform = function() {
    if (PlatformUtils.mobileiOSCheck()){
        return "ios";
    } else if (PlatformUtils.mobileAndroidCheck) {
        return "android";
    } else if (PlatformUtils.desktopCheck()) {
        return "desktop";
    } else if (PlatformUtils.extensionSafariCheck()){
        return "safari";
    } else if (PlatformUtils.extensionChromeCheck()) {
        return "chrome";
    } else if (PlatformUtils.extensionFirefoxCheck()) {
        return "firefox";
    } else {
        return "default";
    }
}
/*
* Obtain change log data from local storage
* @method getChangeLog
* @param {Function} callback - function to execute after this is completed.
* */
JaxxUI.prototype.getChangeLog = function(callback) {
    var self = this;
    // **** Reminder:  When testing use different endpoint - not the live one ****;
    var url;
    if(Registry.application.config.utils) {
      url = Registry.application.config.utils.changeLog;
      var filePath = Registry.application.config.utils.localChangeLog;
      var key = UTILS_CHANGE_LOG;
      jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
        if(err) {
          console.error(err);
          g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();
        } else {
          var data = jaxx.FileManager.getLocalStorage(key);
          if(data && data[0]) {
            self._changeLog = JaxxUtils.scrubInput(self.getChangeLogByPlatform(data[0]));
            callback();
          }
        }
      });
    } else {
      url = "https://jaxx.io/jaxx-data/change-log.php";
      $.getJSON( url, function( data ) {
        if (data && data[0]) {
          self._changeLog = JaxxUtils.scrubInput(self.getChangeLogByPlatform(data[0]));
          callback();
        }
      });
    }
}

JaxxUI.prototype.updateChangeLogFromServer = function() {
    var self = this;
    callback = function() {
        $(".changeLogCenter").html(unescape(self._changeLog));
    }
    this.getChangeLog(callback);
}

// END: CHANGE LOG INFORMATION

// BEGIN: CHANGE LOG SUMMARY INFORMATION

JaxxUI.prototype.getChangeLogSummaryByPlatform = function(data) {
    var key = this.getChangeLogSummaryKeyBasedOnPlatform();
    if (typeof(data[key]) === 'undefined' || data[key] === null) {
        return data["default"];
    } else {
        return data[key];
    }
}

JaxxUI.prototype.getChangeLogSummaryKeyBasedOnPlatform = function() {
    if (PlatformUtils.mobileiOSCheck()){
        return "ios";
    } else if (PlatformUtils.mobileAndroidCheck) {
        return "android";
    } else if (PlatformUtils.desktopCheck()) {
        return "desktop";
    } else if (PlatformUtils.extensionSafariCheck()){
        return "safari";
    } else if (PlatformUtils.extensionChromeCheck()) {
        return "chrome";
    } else if (PlatformUtils.extensionFirefoxCheck()) {
        return "firefox";
    } else {
        return "default";
    }
}

/*
* Obtain Change log summary from local storage
* @method getChangeLogSummary
* @param {Function} callback - function to fire after obtaining change log.
* */
JaxxUI.prototype.getChangeLogSummary = function(callback) {
    var self = this;
    // **** Reminder:  When testing use different endpoint - not the live one ****
    var url;
    if(Registry.application.config.utils) {
      url = Registry.application.config.utils.changeLogSummary; //"https://jaxx.io/jaxx-data/change-log-summary.php";
      var filePath = Registry.application.config.utils.changeLogSummary;
      var key = UTILS_CHANGE_LOG_SUMMARY;
      jaxx.FileManager.updateLocalStorage(url, filePath, key, function(err) {
        if(err) {
          console.error(err);
        } else {
          var data = jaxx.FileManager.getLocalStorage(key);
          if(data && data[0]) {
            self._changeLogSummary = JaxxUtils.scrubInput(self.getChangeLogSummaryByPlatform(data[0]));
            callback();
          }
        }
      });
    } else {
      url = "https://jaxx.io/jaxx-data/change-log-summary.php";
      $.getJSON( url, function( data ) {
        if (data && data[0]) {
          self._changeLogSummary = JaxxUtils.scrubInput(self.getChangeLogSummaryByPlatform(data[0]));
          callback();
        }
      });
    }

}

JaxxUI.prototype.updateChangeLogSummaryFromServer = function() {
    var self = this;
    callback = function() {
        if (typeof(self._changeLogSummary["version"]) !== "undefined" && self._changeLogSummary["version"] !== null) {
            $(".changeLogSummaryVersion").html(unescape(self._changeLogSummary["version"]));
        }
        if (typeof(self._changeLogSummary["website"]) !== "undefined" && self._changeLogSummary["website"] !== null) {
            $(".changeLogSummaryWebsite").html(unescape(self._changeLogSummary["website"]));
        }
        if (typeof(self._changeLogSummary["websiteContact"]) !== "undefined" && self._changeLogSummary["websiteContact"] !== null) {
            $(".changeLogSummaryWebsiteContact").html(unescape(self._changeLogSummary["websiteContact"]));
        }
        if (typeof(self._changeLogSummary["termsOfService"]) !== "undefined" && self._changeLogSummary["termsOfService"] !== null) {
            $(".changeLogSummaryTermsOfService").html(unescape(self._changeLogSummary["termsOfService"]));
        }
        if (typeof(self._changeLogSummary["privacyPolicy"]) !== "undefined" && self._changeLogSummary["privacyPolicy"] !== null) {
            $(".changeLogSummaryPrivacyPolicy").html(unescape(self._changeLogSummary["privacyPolicy"]));
        }
        if (typeof(self._changeLogSummary["copyright"]) !== "undefined" && self._changeLogSummary["copyright"] !== null) {
            $(".changeLogSummaryCopyright").html(unescape(self._changeLogSummary["copyright"]));
        }
    }
    this.getChangeLogSummary(callback);
}


// END: CHANGE LOG SUMMARY INFORMATION

// RELEASE NOTES BULLETIN STUFF ENDS

JaxxUI.prototype.updateCoinToFiatExchangeRates = function() {
    if (this._mainMenuIsOpen) {
        //this.populateCurrencyList(curCoinType);
    }
}



JaxxUI.prototype.toggleCurrencyCheckbox = function(currency_parent_row) 
{
    $(currency_parent_row).children('td.cssSelectedCurrency').children('div.cssCircleUnchecked').addClass('cssCurrencyisChecked');
    $(currency_parent_row).addClass('cssCurrencyHighlightText');
}

JaxxUI.prototype.populateExchangeRateInMainMenuCurrencyList = function(coinType, fiatUnit){ // parameter coinType is ignored
    /*if (!wallet) {
        return;
    }

    var multiplier = 1.0;

    var displayValue = wallet.getHelper().convertCoinToFiatWithFiatType(coinType, multiplier, COIN_UNITLARGE, fiatUnit, false);

    if (Number.isNaN(displayValue)) {
        displayValue = g_JaxxApp.getUI().getDisplayForBalanceNotAvailable();
    }

    */
    var displayValueWhenConversionUnAvailable = '---';
    var displayValue;
    var Formatters = jaxx.Formatters;
    var fiatPriceController = jaxx.FiatPriceController;    
    var currentCrypto = Registry.getCurrentCryptoController();
    var coinTypeSymbol = "BTC"; // setting a sane default because legacy code might have other opinions on what to initialize first
    if (currentCrypto != null)
    {
        coinTypeSymbol = currentCrypto.symbol;
    }
    
    displayValue = fiatPriceController.coinToFiat("1", coinTypeSymbol, fiatUnit);
    
    if (displayValue != null)
    {
        displayValue = Formatters.balanceForDisplay(displayValue, 2); // limits the decimal count to 2
        displayValue = Formatters.formatFinancialNumber(displayValue);
        displayValue = fiatPriceController.prependFiatSymbolToString(fiatUnit, displayValue);
    } else {
        displayValue = displayValueWhenConversionUnAvailable;
    }
    
    $('.rate' + fiatUnit).text(displayValue);
}

JaxxUI.prototype.closeQuickFiatCurrencySelector = function() {
    if (this.isQuickFiatCurrencySelectorOpen()) {
        $('.wrapTableCurrencySelectionMenu').fadeOut(function() {
            $(".fiatCurrencySelectionMenu").empty();
            $('.displayCurrenciesSelectedArrow img').addClass('cssFlipped');
        });
        //        $('.cssBalanceBox .dismiss').removeClass('cssDismissCurrencySelectionMenu');
        $('.cssDismissCurrencySelectionMenu').css('display', 'none');
    }
}

JaxxUI.prototype.openQuickFiatCurrencySelector = function() {
    // This is called when the user clicks on the arrow on the home screen of Jaxx to show the currencies.
    $(".fiatCurrencySelectionMenu").empty();
    // var currencies = Navigation.getEnabledCurrencies(); // Code from when there was no preference order for currencies.
    var currencies = g_JaxxApp.getSettings().getListOfEnabledCurrencies();
    console.warn("Currency List: ", currencies);
    for (var i = 0; i < currencies.length; i++){
        //element = '<div class="cssCurrency scriptAction setDefaultCurrency" currency=' + currencies[i] + ' > ' + currencies[i] + ' </div>';
        // This 'if' part is for Styling.
        element = '<tr class="quickFiatCurrencySelector ';
        if (i === 0){
            element += 'cssCurrencyFirstElement';
        } else {
            element += 'cssCurrencyAdditionalElement';
        }
        element += ' scriptAction" specialAction="setDefaultCurrencyFromMenu" value="' + currencies[i] + '"> <td class="fiatUnit cssFiatUnit">' + currencies[i] + '</td><td class="covertedBalance cssConvertedBalance"> ' +  wallet.getHelper().convertCoinToFiatWithFiatType(curCoinType, wallet.getPouchFold(curCoinType).getPouchFoldBalance(), COIN_UNITSMALL, currencies[i], false) + '</td></tr>';
        $(".fiatCurrencySelectionMenu").append(element);

        // HDWalletHelper.getFiatUnitPrefix(currencies[i]) +  wallet.getHelper().convertCoinToFiat(curCoinType, currencies[i], HDWalletHelper.convertWeiToEther(wallet.getPouchFold(curCoinType).getPouchFoldBalance())).toFixed(2)
    }

    $('.wrapTableCurrencySelectionMenu').fadeIn();

    $('.cssDismissCurrencySelectionMenu').css('display', 'block');
    // Highlight element matching currency to blue.
    $('.quickFiatCurrencySelector').removeClass('cssBlueHighlight');
    $('.displayCurrenciesSelectedArrow').find('img').removeClass('cssFlipped');
    $('.quickFiatCurrencySelector').filter('tr[value="' + wallet.getHelper().getFiatUnit() + '"]').addClass('cssBlueHighlight');

    scrollIntoView($('.quickFiatCurrencySelector').filter('tr[value="'+wallet.getHelper().getFiatUnit()+'"]'), $('.fiatCurrencySelectionMenu'), $('.wrapTableCurrencySelectionMenu'));

    // @TODO: find a way to refactor this code resuse.
    $('.quickFiatCurrencySelector').off('click'); // This should do nothing, but we add it just in case.
    $('.quickFiatCurrencySelector').click(function (event) {
        try {
            //                console.log("event :: " + JSON.stringify(event);
            scriptAction(event);
        } catch (err) {
            console.error(err);
        }
    });

    Navigation.collapseTabs();
    Navigation.hideTransactionHistoryDetails();
}

JaxxUI.prototype.toggleQuickFiatCurrencySelector = function() {
    console.log("Toggling the quickFiatCurrencySelector menu.");
    if (this.isQuickFiatCurrencySelectorOpen()){
        // Close the currency selection menu.
        this.closeShapeshiftCoinList();
        this.closeQuickFiatCurrencySelector();
    } else {
        // Open the currency selection menu.
        this.openQuickFiatCurrencySelector();
        //$('.wallet .menu,.wallet .dismiss').fadeOut();
        this.closeMainMenu();
    }
}

JaxxUI.prototype.isQuickFiatCurrencySelectorOpen = function(){
    return (!($(".wrapTableCurrencySelectionMenu").css('display') === 'none'));
}

JaxxUI.prototype.setDefaultCurrencyFromMenu = function(element){
    // This code is run when the user selects a currency to use from the list of enabled currencies.
    //    console.log("element :: " + element + " :: element.attr('value') :: " + element.attr('value'));
    var currency = element.attr('value');

    $('.quickFiatCurrencySelector').filter('tr[value="' + wallet.getHelper().getFiatUnit() +'"]').removeClass('cssBlueHighlight');

    wallet.getHelper().setFiatUnit(currency);
    $('.quickFiatCurrencySelector').filter('tr[value="' + currency + '"]').addClass('cssBlueHighlight');

    updateWalletUI();

    var self = this;
    setTimeout(function() {
        self.closeShapeshiftCoinList();
        self.closeQuickFiatCurrencySelector();
    }, 100)
}

JaxxUI.prototype.quickFiatCurrencySwitch = function() {
    var nextCurrency = g_JaxxApp.getSettings().getNextEnabledCurrency(wallet.getHelper().getFiatUnit());
    if (Navigation.isUseFiat()){
        this.convertFiatAmountInSendValueToNewFiatAmount(nextCurrency);
    } else {
        this.convertFiatAmountInSendDetailsToNewFiatAmount(nextCurrency);
    }

    wallet.getHelper().setFiatUnit(nextCurrency);

    if (Navigation.isUseFiat()){
        $('.unitToggle .symbol').text(wallet.getHelper().getFiatUnitPrefix());
    } else {
        // Unit toggle is set to coin so we don't have to do anything.
    }

    updateWalletUI();
    this.closeShapeshiftCoinList();
    JaxxUI.prototype.closeQuickFiatCurrencySelector();
    /*
	  var currencies = Navigation.getEnabledCurrencies();

    var nextCurrency = 0;

    for (var i = 0; i < currencies.length; i++){
        var curCurrency = currencies[i];

        console.log("check currency :: " + curCurrency + " :: current currency :: " + wallet.getHelper().getFiatUnit());

        if (curCurrency === wallet.getHelper().getFiatUnit()) {
            if (i === currencies.length - 1) {
                nextCurrencyIdx = 0;
            } else {
                nextCurrencyIdx = i + 1;
            }

            nextCurrency = currencies[nextCurrencyIdx];
            break;
        }
    }

    $('.quickFiatCurrencySelector').filter('tr[value="' + wallet.getHelper().getFiatUnit() +'"]').removeClass('cssBlueHighlight');

    wallet.getHelper().setFiatUnit(nextCurrency);
    $('.quickFiatCurrencySelector').filter('tr[value="' + nextCurrency + '"]').addClass('cssBlueHighlight');

    updateWalletUI();

    JaxxUI.prototype.closeQuickFiatCurrencySelector();
	*/
}

JaxxUI.prototype.convertFiatAmountInSendValueToNewFiatAmount = function(targetFiatUnit){
    // console.log(' targetFiatUnit   ', targetFiatUnit);


    this.convertFiatToFiatInUIElement('.tabContent .amount input', targetFiatUnit, wallet.getHelper().getFiatUnit(), true);
}

JaxxUI.prototype.convertFiatAmountInSendDetailsToNewFiatAmount = function(targetFiatUnit){
    /// console.log(' targetFiatUnit   ', targetFiatUnit);

    this.convertFiatToFiatInUIElement('.tabContent .amount .amountDetails', targetFiatUnit, wallet.getHelper().getFiatUnit(), false);
}

JaxxUI.prototype.convertFiatToFiatInUIElement = function(strSelector, targetFiatUnit, sourceFiatUnit, noPrefix){
    // parseFloat($('.tabContent .amount input').val());
    var valueToConvert = Number.isNaN(parseFloat($(strSelector).val())) ? 0 : parseFloat($(strSelector).val());


    $(strSelector).val(wallet.convertFiatToFiat(valueToConvert, targetFiatUnit, sourceFiatUnit, noPrefix));
}

JaxxUI.prototype.setFiatPrefixForUnitToggleInSend = function(fiatUnit){

}

JaxxUI.prototype.showDAORefund = function() {
    var showNoBalances = false;

    $('.theDaoRefundConfirmButton').removeClass("cssTheDaoRefundButtonWait");
    $('.theDaoRefundConfirmButton').text("Refund");

    var theDAODefaultGasLimit = HDWalletPouch.getStaticCoinPouchImplementation(COIN_THEDAO_ETHEREUM).getDefaultGasLimit();

    var gasRequiredList = wallet.getPouchFold(COIN_THEDAO_ETHEREUM).hasInsufficientGasForSpendable(theDAODefaultGasLimit * 2);

    //            console.log("gasRequiredList :: " + gasRequiredList);

    if (gasRequiredList.length > 0) {
        $('.theDaoInsufficientGasForRefundWarningText').show();

        //            gasRequiredList.push("0x051Da87c3679Be285DC22E2fbA5E833052375ced");
        //            gasRequiredList.push("0x051Da87c3679Be285DC22E2fbA5E833052375ced");
        //            gasRequiredList.push("0x051Da87c3679Be285DC22E2fbA5E833052375ced");

        $('.theDaoInsufficientGasForRefundWarningText').html("<p>The following DAO-holding addresses require more ETH to be able to perform the refund. We recommend depositing at least 0.01 ETH into this address in your Ethereum wallet:<br></p>" + gasRequiredList.join('<br>'));
    } else {
        $('.theDaoInsufficientGasForRefundWarningText').hide();
    }

    var daoAddressData = wallet.getPouchFold(COIN_THEDAO_ETHEREUM).getSpendableAddresses(0, theDAODefaultGasLimit * 2);

    //    daoAddressData = [];

    if (daoAddressData.length > 0) {
        var refundAddressesString = "";
        for (var i = 0; i < daoAddressData.length; i++) {
            var curAddress = daoAddressData[i].address;
            var curBalance = HDWalletHelper.getCoinDisplayScalar(COIN_THEDAO_ETHEREUM, HDWalletHelper.convertCoinToUnitType(COIN_THEDAO_ETHEREUM, daoAddressData[i].balance, COIN_UNITLARGE), false);

            if (curBalance.toString().length > 8) {
                curBalance = curBalance.toFixed(8);
            }

            refundAddressesString += "<p><span class='cssDaoRefundDisplayAddress'>" + curAddress + ":</span> <span class='cssDaoRefundDisplayAmount cssAmount'>" + curBalance + " DAO</span></p>";
            //            console.log("showDAORefund :: " + i + " :: daoAddressData :: " + JSON.stringify(daoAddressData[i]) + " :: refundAddressesString :: " + refundAddressesString);
        }

        //        console.log("showDAORefund :: daoAddressData :: " + daoAddressData + " :: refundAddressesString :: " + refundAddressesString);

        $('.theDaoRefundAddressesList').html(refundAddressesString);
        $('.theDaoRefundAddressesText').show();
        $('.theDaoRefundCost').show();
        $('.theDaoRefundConfirmButton').addClass('cssEnabled').addClass('enabled');
        $('.theDaoRefundConfirmButton').text("Refund");
        $('.theDaoRefundConfirmButton').attr("specialAction", "confirmDAORefund");
        $('.theDaoRefundConfirmButton').attr("closeModal", null);

        var approveTXDict = this.processDAOApprove(daoAddressData);
        var refundTXDict = this.processDAORefund(daoAddressData);

        $('.daoRefund').data('daoAddressData', daoAddressData);

        var totalTXCost = approveTXDict.totalTXCost + refundTXDict.totalTXCost;
        $('.theDaoRefundCost').text(HDWalletHelper.convertCoinToUnitType(COIN_THEDAO_ETHEREUM, totalTXCost, COIN_UNITLARGE) + " ETH");
    } else {
        $('.theDaoRefundAddressesText').hide();
        $('.theDaoRefundCost').hide();

        $('.theDaoRefundConfirmButton').text("Close");
        $('.theDaoRefundConfirmButton').attr("specialAction", null);
        $('.theDaoRefundConfirmButton').attr("closeModal", "true");

        if (gasRequiredList.length === 0) {
            showNoBalances = true;
        }
    }

    if (showNoBalances === true) {
        $('.theDaoRefundNoBalances').show();
        $('.theDaoRefundConfirmButton').text("Close");
        $('.theDaoRefundConfirmButton').attr("specialAction", null);
        $('.theDaoRefundConfirmButton').attr("closeModal", "true");
    } else {
        $('.theDaoRefundNoBalances').hide();
    }

    Navigation.openModal('daoRefund');
}

JaxxUI.prototype.confirmDAORefund = function() {
    //    console.log("confirmDAORefund");
    //    $('.theDaoRefundConfirmButton').addClass("cssTheDaoRefundButtonWait");
    //    $('.theDaoRefundConfirmButton').text("Please Wait");
    //
    //    return;

    //    $('.theDaoRefundConfirmButton').addClass("cssTheDaoRefundButtonWait");
    //    $('.theDaoRefundConfirmButton').attr("specialAction", null);
    //    $('.theDaoRefundConfirmButton').text("Please Wait");

    var daoAddressData = $('.daoRefund').data('daoAddressData');

    var self = this;

    var approveTXDict = this.processDAOApprove(daoAddressData);

    g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_ETHEREUM, approveTXDict, function(result) {
        if (result === 'success') {
            console.log("confirmDAORefund :: approve :: success");
            var refundData = $('.daoRefund').data('refundTXDict');

            $('.theDaoRefundConfirmButton').addClass("cssTheDaoRefundButtonWait");
            $('.theDaoRefundConfirmButton').text("Please Wait");

            setTimeout(function() {
                var refundTXDict = self.processDAORefund(daoAddressData);

                g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_ETHEREUM, refundTXDict, function(result) {
                    if (result === 'success') {
                        console.log("confirmDAORefund :: refund :: success");
                        playSound("snd/balance.wav", null, null);
                        Navigation.flashBanner('DAO refund successful', 5);
                    } else {
                        console.log("confirmDAORefund :: refund :: error :: " + result);
                        Navigation.flashBanner('DAO refund error', 5);
                    }

                    $('.daoRefund').data('approveTXDict', null);
                    $('.daoRefund').data('refundTXDict', null);
                    Navigation.closeModal();
                });
            }, 3000);
        } else {
            console.log("confirmDAORefund :: approve :: error :: " + result);

            $('.daoRefund').data('approveTXDict', null);
            $('.daoRefund').data('refundTXDict', null);

            Navigation.closeModal();
        }
    });
}

//@note: @here: @todo: these two classes don't deal with any UI stuff, they should be moved somewhere more appropriate.

JaxxUI.prototype.processDAOApprove = function(daoAddressData) {
    var theDAODefaultGasLimit = HDWalletPouch.getStaticCoinPouchImplementation(COIN_THEDAO_ETHEREUM).getDefaultGasLimit();

    var gasPrice = HDWalletHelper.getDefaultEthereumGasPrice();
    var gasLimit = theDAODefaultGasLimit;

    var tokenContractAddress = CoinToken.getStaticTokenImplementation(CoinToken.TheDAO).pouchParameters['tokenContractAddress'];

    var theDAOTokenWithdrawalAddress = CoinToken.getStaticTokenImplementation(CoinToken.TheDAO).pouchParameters['tokenWithdrawalAddress'];

    var approveOpCode = wallet.getPouchFold(COIN_THEDAO_ETHEREUM).getApproveOpCode();

    var ABIAddressTarget = HDWalletHelper.zeroPadLeft(HDWalletHelper.toEthereumNakedAddress(theDAOTokenWithdrawalAddress), 64);

    var txArray = [];
    var totalTXCost = 0;

    var baseGasCost = gasPrice.mul(gasLimit);

    for (var i = 0; i < daoAddressData.length; i++) {
        var ABIBalanceParameter = HDWalletHelper.zeroPadLeft(daoAddressData[i].balance.toString(16), 64);
        //        var ABIBalanceParameter = HDWalletHelper.zeroPadLeft("1".toString(16), 64);

        var approveTXData = approveOpCode + ABIAddressTarget + ABIBalanceParameter;

        var newTX = wallet.getPouchFold(COIN_ETHEREUM).getPouchFoldImplementation()._buildEthereumTransaction(false, daoAddressData[i].ethereumNodeIndex, tokenContractAddress, 0, gasPrice, gasLimit, approveTXData, null);

        if (newTX) {
            txArray.push(newTX);
        } else {
            console.log("error :: ethereum transaction :: account failed to build :: " + daoAddressData[i].ethereumNodeIndex);
            return null;
        }

        totalTXCost += parseInt(baseGasCost);
    }

    console.log("processDAOApprove :: txArray.length :: " + txArray.length + " :: txArray :: " + JSON.stringify(txArray) + " :: baseGasCost :: " + baseGasCost);

    return {txArray: txArray, totalTXCost: totalTXCost};
}

JaxxUI.prototype.processDAORefund = function(daoAddressData) {
    var theDAODefaultGasLimit = HDWalletPouch.getStaticCoinPouchImplementation(COIN_THEDAO_ETHEREUM).getDefaultGasLimit();

    var gasPrice = HDWalletHelper.getDefaultEthereumGasPrice();
    var gasLimit = theDAODefaultGasLimit;

    var theDAOTokenWithdrawalAddress = CoinToken.getStaticTokenImplementation(CoinToken.TheDAO).pouchParameters['tokenWithdrawalAddress'];

    var refundOpCode = wallet.getPouchFold(COIN_THEDAO_ETHEREUM).getRefundOpCode();

    var txArray = [];
    var totalTXCost = 0;

    var baseGasCost = gasPrice.mul(gasLimit);

    for (var i = 0; i < daoAddressData.length; i++) {
        var newTX = wallet.getPouchFold(COIN_ETHEREUM).getPouchFoldImplementation()._buildEthereumTransaction(false, daoAddressData[i].ethereumNodeIndex, theDAOTokenWithdrawalAddress, 0, gasPrice, gasLimit, refundOpCode, null);

        if (newTX) {
            txArray.push(newTX);
        } else {
            console.log("error :: ethereum transaction :: account failed to build :: " + daoAddressData[i].ethereumNodeIndex);
            return null;
        }

        totalTXCost += parseInt(baseGasCost);
    }

    console.log("processDAORefund :: txArray.length :: " + txArray.length + " :: txArray :: " + JSON.stringify(txArray));

    return {txArray: txArray, totalTXCost: totalTXCost};
}

JaxxUI.prototype.switchToSolidCoinButton = function(coinType) {
    console.log(' TODO  JaxxUI.prototype.switchToSolidCoinButton');
    return

    var coinButtonName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonName'];

    var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];

    $(coinButtonName).css({background: 'url(images/' + coinButtonSVGName + '.svg) no-repeat center center'});
    $(coinButtonName).addClass('cssSelected');
    $(coinButtonName).off('mouseleave');
}

JaxxUI.prototype.initializeToCoinType = function(targetCoinType) {
    console.log(' TODO  JaxxUI.prototype.initializeToCoinType' , targetCoinType);
    return;

    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        var coinSpinnerElementName = HDWalletPouch.getStaticCoinPouchImplementation(i).uiComponents['coinSpinnerElementName'];

        var transactionsListElement = HDWalletPouch.getStaticCoinPouchImplementation(i).uiComponents['transactionsListElementName'];

        $(coinSpinnerElementName).fadeTo(0, 0);
        $(coinSpinnerElementName).hide();

        if (i !== targetCoinType) {
            //            $(coinHelpMenuNames[i]).hide();
            //            $(coinMenuHeaderNames[i]).hide();
            this.resetCoinButton(i);

            $(transactionsListElement).hide();
        } else {

            //            $(coinHelpMenuNames[i]).show();
            //            $(coinMenuHeaderNames[i]).show();
            this.switchToSolidCoinButton(i);

            $(transactionsListElement).show();
        }
    }

    //@note: @todo: @here: get dash paper wallets functional.
    if (targetCoinType === COIN_DASH ||
        targetCoinType === COIN_ETHEREUM_CLASSIC ||
        targetCoinType === COIN_THEDAO_ETHEREUM ||
        targetCoinType === COIN_AUGUR_ETHEREUM ||
        targetCoinType === COIN_ICONOMI_ETHEREUM ||
        targetCoinType === COIN_GOLEM_ETHEREUM ||
        targetCoinType === COIN_GNOSIS_ETHEREUM ||
        targetCoinType === COIN_SINGULARDTV_ETHEREUM ||
        targetCoinType === COIN_DIGIX_ETHEREUM ||
        targetCoinType === COIN_LISK ||
        targetCoinType === COIN_ZCASH ||
        targetCoinType === COIN_TESTNET_ROOTSTOCK) {
        $('.menusPaperWallet').hide();
    } else {
        $('.menusPaperWallet').show();
    }
}

JaxxUI.prototype.beginSwitchToCoinType = function(currentCoinType, targetCoinType) {
    this.hideErrorLoadingTransactions();
    this.hideErrorLoadingBalances();
    $(".shapeshiftTab").fadeOut();
}

JaxxUI.prototype.completeSwitchToCoinType = function(coin, targetCoinType) {

    console.log(coin);

    var targetCoinShortName = "";
    /* var allKeys = Object.keys(HDWalletHelper.dictCryptoCurrency);

     for (var i = 0; i < allKeys.length; i++) {
         var curKey = allKeys[i];

         var curCoinIndex = HDWalletHelper.dictCryptoCurrency[curKey].index;

         if (targetCoinType === curCoinIndex) {
             targetCoinShortName = curKey;
             break;
         }
     }*/

    // var shapeShiftCryptoCurrenciesAllowed = HDWalletHelper.shapeShiftCryptoCurrenciesAllowed.regular;

    /* if (targetCoinType === COIN_THEDAO_ETHEREUM) {
         $('.mainTransactionHistoryHeader').text('DAO Refund');
         //$('.btnActionShapeShift').hide();
     } else {
         $('.mainTransactionHistoryHeader').html('Transaction History');
         //$('.btnActionShapeShift').show();
         //$('.btnActionShapeShift').css('display', 'inline-block');
     }*/

    /* if (typeof(shapeShiftCryptoCurrenciesAllowed[targetCoinShortName]) !== 'undefined' &&
         shapeShiftCryptoCurrenciesAllowed[targetCoinShortName] !== null &&
         shapeShiftCryptoCurrenciesAllowed[targetCoinShortName] === true) {
         //$('.btnActionShapeShift').show();
         //$('.btnActionShapeShift').css('display', 'inline-block');
     } else {
         //$('.btnActionShapeShift').hide();
     }*/

    /* if (targetCoinType === COIN_DASH ||
         targetCoinType === COIN_ETHEREUM_CLASSIC ||
         targetCoinType === COIN_THEDAO_ETHEREUM ||
         targetCoinType === COIN_AUGUR_ETHEREUM ||
         targetCoinType === COIN_ICONOMI_ETHEREUM ||
         targetCoinType === COIN_GOLEM_ETHEREUM ||
         targetCoinType === COIN_GNOSIS_ETHEREUM ||
         targetCoinType === COIN_SINGULARDTV_ETHEREUM ||
         targetCoinType === COIN_DIGIX_ETHEREUM ||
         targetCoinType === COIN_LISK ||
         targetCoinType === COIN_ZCASH ||
         targetCoinType === COIN_TESTNET_ROOTSTOCK) {
      //   $('.menusPaperWallet').hide();
     } else {*/

    if (coin.isPaperWalletAllowed(PlatformUtils.mobileiOSCheck())) $('.menusPaperWallet').show();
    else  $('.menusPaperWallet').hide();
    //}
    // if (HDWalletHelper.isShapeshiftCryptoCurrencyAllowed(targetCoinType)) {
    // if
    $(".shapeshiftTab").fadeIn();
    //console.warn("fadein");
    // }
    jaxx.Registry.application$.triggerHandler(jaxx.Registry.COMPLETE_SWITCH_TO_COIN_TYPE, coin);
    this.showModalForCoinBulletinIfNotHidden(coin);
//    $('.initializingLoading').show();
    //setTimeout(function() {
    //    console.warn("initializing wallet start");
    //    $('.initializingLoading img').removeClass('cssStartHidden');
    //},1500);
}

JaxxUI.prototype.showModalForCoinBulletinIfNotHidden = function(coin){
    // var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters["coinAbbreviatedName"];
    var bulletinData = g_JaxxApp.getUI().getCoinBulletinData()[coin.symbol];
    if (typeof(bulletinData) !== "undefined" && bulletinData !== null) {
        var version = bulletinData["version"];
        if (!g_JaxxApp.getSettings().isCoinBulletinHideOnSelect(coin.index, version)) {
            this.showCoinBulletinUsingAbbreviatedName(coin.symbol);
        }
    }
}

JaxxUI.prototype.resizeChromeExtension = function() {
    $('.cssDaoRefund').css('max-height', '250px');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JaxxUI.prototype.showShapeShift = function() {

    var input = $('.tabContent .address input');
    // console.log('JaxxUI.prototype.showShapeShift');

    //jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_SHAPE_SHIFT_ACTIVATE);
    this.showSpendableLoading();

    g_JaxxApp.getShapeShiftHelper().setIsTriggered(true);

    input.val("ShapeShift"); //Correct capitalization
    input.addClass('validShapeshift').addClass('cssValidShapeshift'); //Change color
    input.css({ backgroundImage: 'url(' + g_JaxxApp.getShapeShiftHelper()._avatarImage + ')'}); //Show fox icon
    //            $('.spendable').slideUp(); // Hide Spendable line
    // $('.spendableShapeshift').slideDown(); // Show ShapeShift logo and Info icon

    //    var placeholderAmountText = "Amount (Send BTC get ETH)";
    //    if(curCoinType===COIN_ETHEREUM){
    //        placeholderAmountText = "Amount (Send ETH get BTC)";
    //    }

    //    $('.tabContent .amount input').attr("placeholder", placeholderAmountText); //Change text of amount placeholder
    $('#sendLabel').text("Shift"); //Send button becomes shift

    if (curCoinType === COIN_ETHEREUM) {
        Navigation.hideEthereumAdvancedMode();
        $('.tabContent .advancedTabButton').slideUp().hide();
        //        $('.tabContent .advancedTabButton').slideUp().hide();
    }

    // var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];



    var coinFrom = jaxx.Registry.getCurrentCryptoController();


    var coins = jaxx.Registry.getShapeShiftEnabled();



    console.log(coins);

    var coinTo = (coins[0].symbol !== coinFrom.symbol)?coins[0]:coins[1];

    console.log(coinFrom.symbol +'_' + coinTo.symbol);


    this.requestShapeshiftTransaction(coinFrom, coinTo);
    //  g_JaxxApp.getSettings().setShapeshiftCoinTarget(from, to);

    // var receiveCoinType = HDWalletHelper.dictCryptoCurrency[receiveCoinAbbreviatedName].index;
    //  var self = this;



    //  g_JaxxApp.getShapeShiftHelper().clearUpdateIntervalIfNecessary();

    // $('.shapeshiftToggleLabelPrimary').text(from+ " to " + to);
    //this.setupShapeShiftCoinUI(from, to);
    input.trigger("keyup");
}

JaxxUI.prototype.requestShapeshiftTransaction = function(coinFrom, coinTo){

    var html = '<div data-symbol="'+coinFrom.symbol+'" class="scriptAction imageLogoCurrencyToCurrency shapeShiftSwitchFrom cssShapeshiftSwitchFrom cssCoinSelector cssHighlighted cssSourceCoin" value="'
        + coinFrom.symbol + '"><span class="cssCoinText">' + coinFrom.threeLetterCode + '</span></div>';
    html+='<img class="cssArrowcoinToCoin" src="images/coinToCoin.svg" alt="" height="12" width="28" style="margin: 3px 3px 0px 0px">';
    html+= '<div class="scriptAction  imageLogoCurrencyToCurrency shapeShiftSwitchTo cssShapeshiftSwitchTo cssCoinSelector cssHighlighted" specialAction="changeShapeshiftCoinToNextCoinType"><span class="cssCoinText">' + coinTo.threeLetterCode + '</span></div>';

    $('#ShapeshiftCurrent').html(html);

    var self = this;

    var url = 'https://shapeshift.io/marketinfo/' + coinFrom.symbol + '_' + coinTo.symbol;
    $.get(url).done(function(result){
        if(result.error){
            console.error(result);
            self.updateShapeShiftDisplay(null);
            return;
        }

        console.log(result);
        // data.returnAddress =  jaxx.Registry.getCryptoControllerBySymbol(symbolSend).getCurrentPublicAddresReceive();
        //data.receiveAddress = jaxx.Registry.getCryptoControllerBySymbol(symbolReceive).getCurrentPublicAddresReceive();

        var curMarketData = {
            depositMax:result.limit,
            depositMin:result.minimum,
            exchangeRate:result.rate,
            lastupdated:Date.now(),
            pair:result.pair,
            minerFee:result.minerFee
        }

        self.updateShapeShiftDisplay(curMarketData);

        /*self.requestShapeshiftTransaction2(coinFrom, coinTo, function (error, result) {

            console.warn(result);

        })*/

    });

}

JaxxUI.prototype.requestShapeshiftTransaction2 = function (coinFrom, coinTo, callback) {
    var pair = coinFrom.symbol+'_' + coinTo.symbol;

    var addressReturn = jaxx.Registry.getCryptoControllerBySymbol(coinFrom.symbol).getCurrentPublicAddresReceive();

    var addressDeposit = jaxx.Registry.getCryptoControllerBySymbol(coinTo.symbol).getCurrentPublicAddresReceive();

    var shiftOptions = {
        withdrawal: addressDeposit,
        pair: pair,
        returnAddress: addressReturn,
        apiKey:  "180aaede8f5451a52847824f4965cc25f43a5d2bb49f483c1f1ecc8afad661b65e22a01046bfd67257e31189b48f5a1ec35207653bd017f8203f4241c763074a"
    };
    var url ="https://shapeshift.io/shift/";

    $.post(url, shiftOptions)
        .then(function (data, textStatus, jqXHR) {
            return data
        })
        .done(function (value, args) {
            callback(null, value)
        })
        .fail(function (value, args) {
            callback(value)
        })


}

JaxxUI.prototype.updateShapeShiftDisplay = function(displayDict) {
    console.log(displayDict);
    if(displayDict){

        var pair = displayDict.pair.split('_');

        var from = pair[0];
        var to = pair[1];
        var exchangeRate = parseFloat(displayDict.exchangeRate).toFixed(8),
            depositMinAmount = parseFloat(displayDict.depositMin).toFixed(8),
            depositMaxAmount = parseFloat(displayDict.depositMax).toFixed(8);


    }else {

        var exchangeRate ='',
            depositMinAmount = '',
            depositMaxAmount = '',
            from ='',
            to = ''

    }

    $('.shapeShiftExchangeRate').text(exchangeRate);
    $('.shapeShiftDepositMin').text(depositMinAmount);
    $('.shapeShiftDepositMax').text(depositMaxAmount);
    $('.before .shapeShiftAbbreviatedUnitSend').text('1 ' + from);
    $('.shapeShiftAbbreviatedUnitSend').not('.before .shapeShiftAbbreviatedUnitSend').text(from);
    $('.shapeShiftAbbreviatedUnitReceive').text(to);


    // Example parameters : ({send: 0, receive: 1}, {pair: "btc_eth", depositMax: 1.70901548, depositMin: 0.00039924, exch.....)

    //if ( g_JaxxApp.getShapeShiftHelper().getIsTriggered()) {


    // var coinAbbreviatedNameSend = HDWalletPouch.getStaticCoinPouchImplementation(coinTypeDict.send).pouchParameters['coinAbbreviatedName'];

    // var coinAbbreviatedNameReceive = HDWalletPouch.getStaticCoinPouchImplementation(coinTypeDict.receive).pouchParameters['coinAbbreviatedName'];

    //  if (typeof(displayDict.exchangeRate) !== 'undefined' && displayDict.exchangeRate !== null) {
    //$('.shapeShiftExchangeRate').text(displayDict.exchangeRate.toString().substring(0, 8));
    //$('.shapeShiftDepositMin').text(displayDict.depositMin.toString().substring(0, 8));
    //$('.shapeShiftDepositMax').text(displayDict.depositMax.toString().substring(0, 8));
    console.log("Deposit Max", parseFloat(displayDict.exchangeRate).toFixed(8));
    console.log("Deposit Max", displayDict.depositMin);
    console.log("Deposit Max", displayDict.depositMax);


    // }
    // }
}

JaxxUI.prototype.openShapeshiftCoinList = function() {

    var currentCoin = jaxx.Registry.getCurrentCryptoController();
    // var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];


    // $('.wrapTableShapeshiftCoinMenu').css('display', 'block');
    $('#TableShapeshiftCoinSelectionMenu').fadeIn();

    $('.cssShapeShiftAndToggle .displayCoinsArrow img').removeClass('cssFlipped');
    //$('.wrapTableShapeshiftCoinMenu tbody').empty();
    var coins = jaxx.Registry.getShapeShiftEnabled();

    var html='';
    var additionalClass ='';
    coins.forEach(function (coin) {
        if(coin.symbol!= currentCoin.symbol)      html+='<tr data-symbol="'+coin.symbol+'" class="shapeShiftCoinItem'+ additionalClass +' cssShapeShiftCoinListItem scriptAction coinType' + coin._coinType + '" specialAction="selectShapeshiftCoin" value="' +coin.coinType + '"><td class="icon cssHighlighted cssImageLogoIcon'+ coin.coinType + '" style="background-image: url('+coin.icon+')"></td><td class="label">' + coin.threeLetterCode + ' - ' + coin.displayName + '</td></tr>';
    });

    var self = this;

    var list=  $("#ShapeshiftCoinSelectionList");
    list.off('click');
    list.html(html);
    list.on('click','tr',function(evt){
        var symbol = $(evt.currentTarget).data('symbol');
        console.log(symbol);
        if(symbol){

            var coinFrom = jaxx.Registry.getCurrentCryptoController();
            var coinTo = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            $('#TableShapeshiftCoinSelectionMenu').fadeOut();
            self.requestShapeshiftTransaction(coinFrom, coinTo);

        }
    })

    /* for (var i = 0; i < coinTypeKeys.length; i++){
         var coinType = dictOfCoinTypes[coinTypeKeys[i]];

         if (i === 0) {
             $(".wrapTableShapeshiftCoinMenu tbody").append(this.getShapeshiftCoinListRow(coinType));
         } else {
             $(".wrapTableShapeshiftCoinMenu tbody").append(this.getShapeshiftCoinListRow(coinType, ' cssAdditionalElement'));
         }
     }*/

    /*  $('.wrapTableShapeshiftCoinMenu tbody .scriptAction').off('click'); // This action should be off, but just in case.
      $('.wrapTableShapeshiftCoinMenu tbody .scriptAction').click(function (event) {


          try {

              scriptAction(event);
          } catch (err) {
              console.error(err);
          }
      }); // Reattach script action events.*/

    //var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];

    //$('.wrapTableShapeshiftCoinMenu').removeClass('cssBlueHighlight');
    //$('.wrapTableShapeshiftCoinMenu .coinType' + g_JaxxApp.getSettings().getShapeshiftCoinTarget(coinAbbreviatedName)).addClass('cssBlueHighlight');
}

JaxxUI.prototype.closeShapeshiftCoinList = function() {
    // $('.wrapTableShapeshiftCoinMenu').css('display', 'none');
    $('.wrapTableShapeshiftCoinMenu').fadeOut(function() {
        $(".wrapTableShapeshiftCoinMenu tbody").empty();
        $('.cssShapeShiftAndToggle .displayCoinsArrow img').addClass('cssFlipped');
    });
}

JaxxUI.prototype.toggleShapeshiftCoinList = function() {
    if (this.isShapeshiftCoinListOpen()){
        this.closeShapeshiftCoinList();
    } else {
        this.openShapeshiftCoinList();
    }
}

JaxxUI.prototype.isShapeshiftCoinListOpen = function() {
    return (!($(".wrapTableShapeshiftCoinMenu").css('display') === 'none'));
}

JaxxUI.prototype.getShapeshiftCoinListRow = function(coinType, additionalClass) {
    // @TODO: Add first element functionality
    // coinType should be 'ETH' or 'BTC' or something.
    if (typeof(additionalClass) === 'undefined') {
        additionalClass = " ";
    }

    var coinName = HDWalletHelper.dictCryptoCurrency[coinType]['name'];

    return '<tr class="shapeShiftCoinItem'+ additionalClass +' cssShapeShiftCoinListItem scriptAction coinType' + coinType + '" specialAction="selectShapeshiftCoin" value="' + coinType + '"><td class="icon cssHighlighted cssImageLogoIcon'+ coinType + '"><div class="image"></div></td><td class="label">' + coinType + ' - ' + coinName + '</td></tr>';
}

JaxxUI.prototype.populateCurrenciesInSettings = function() {

}

JaxxUI.prototype.isMainMenuOpen = function() {
    return this._mainMenuIsOpen;
}

JaxxUI.prototype.toggleMainMenu = function() {
    if (this._mainMenuIsOpen === true) {
        this.closeMainMenu();
    } else {
        this.openMainMenu();
    }
}

JaxxUI.prototype.openMainMenu = function() {
    // @TODO: Consider wrapping this function with a check for ._mainMenuIsOpen === false as an oiptimization.
    var self = this;
    //if (!this._mainMenuToggleLocked){
    this._mainMenuToggleLocked = true;
    this._mainMenuIsOpen = true;
    this.moveCarouselToNearestPosition();
    if (window.native && window.native.setMainMenuOpenStatus) {
        window.native.setMainMenuOpenStatus(true);
    }

    //        console.log("toggle menu on");
    Navigation.collapseTabs();
    // Navigation.hideTransactionHistoryDetails();
    g_JaxxApp.getUI().closeShapeshiftCoinList();
    g_JaxxApp.getUI().closeQuickFiatCurrencySelector();
    //jQuery('.nonScrollSize').css('min-height', jQuery(window).height());
    //jQuery('.menu').css('opacity', 1);

    //set the width of primary content container -> content should not scale while animating
    /*
    var contentWidth = jQuery('.nonScrollSize').width();

    //set the content with the width that it has originally
    jQuery('.nonScrollSize').css('width', contentWidth);

    //display a layer to disable clicking and scrolling on the content while menu is shown
    jQuery('.nonScrollSize').css('display', 'block');

    //disable all scrolling on mobile devices while menu is shown
    jQuery('.nonScrollSize').bind('touchmove', function (e) {
        e.preventDefault()
    });*/

    //set margin for the whole container with a jquery UI animation
    var intDurationOfAnimation = 700;
    setTimeout(function(){self.setMainMenuToggleLocked(false);}, intDurationOfAnimation);
    $(".menu").animate({"marginLeft": ["-=300px", 'easeOutExpo']}, {
        duration: intDurationOfAnimation,
        complete: function(){
            self.setMainMenuToggleLocked(false);
        }
    });

    $('.menu').removeClass('cssHideUsingSettingsFramework');

    $('.menu').addClass('cssMenuCalc');

    $(".mainMenuCloser").css('display', 'block');
    //	$('.wallet').addClass('cssBlurBg');

    $(".wallet").css({
        /*"opacity": "0.1",*/

        "-webkit-transform": "all 0.5s linear",
        "-moz-transform": "all0.5s linear",
        "-ms-transform": "all 0.5s linear",
        "-o-transform": "all 0.5s linear",
        "transform": "all 0.5s linear",
    });
    // fade background out
    $('.material-design-hamburger__layer').addClass('material-design-hamburger__icon--to-arrow');
    $('.material-design-hamburger__layer').removeClass('material-design-hamburger__icon--from-arrow');
    // }

    if (jaxx.Registry.application.navigationToolMenuController)
    {
        jaxx.Registry.application.navigationToolMenuController.updateFiatValueIfCurrencyActive();
    }

}

JaxxUI.prototype.setCoinNavBarToDefaultPosition = function() {
    var self=this;
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];

    if (typeof(this._coinBannerCarousel) !== 'undefined' && this._coinBannerCarousel !== null){
        var defaultCoinPosition = $($('.coinBannerContainer .coinType' + coinAbbreviatedName)[0]).prevAll().length; // The number of siblings before the coin banner in the nav bar.
        //this.moveBannerToPosition(defaultCoinPosition); // Move carousel to index of default coin.
        this.getCoinBannerCarousel().move(defaultCoinPosition);
        setTimeout(function(){self.moveBannerToPosition(defaultCoinPosition);},self._coinBannerCarouselAnimationTime);
    }
}

JaxxUI.prototype.closeMainMenu = function() {
    var self = this;
    if (!this._mainMenuToggleLocked) {
        this._mainMenuToggleLocked = true;
        if (this._mainMenuIsOpen === true) {
            // @TODO: Consider updating the banners here instead of when banners are rearranged.
            if (this._walletWasChangedInMenu === true) {
                // #GMS Three lines below removed to fix close function in wallets-submenu, however they may be neccessary

                //this.switchToCoin(g_JaxxApp.getSettings().getListOfEnabledCryptoCurrencies()[0]); // Switch coin type to default coin.
                //this.updateHighlightingInCoinBannerContainer();
                //this.setCoinNavBarToDefaultPosition(); // Arrange Navigation bar according to the correct layout.
                this._walletWasChangedInMenu = false;
            }
        } else {
            return;
        }

        this._mainMenuIsOpen = false;
        if (window.native && window.native.setMainMenuOpenStatus) {
            window.native.setMainMenuOpenStatus(false);
        }
        //enable all scrolling on mobile devices when menu is closed
        //jQuery('#.non').unbind('touchmove');


        //set margin for the whole container back to original state with a jquery UI animation
        jQuery(".menu").animate({"marginLeft": ["100%", 'easeOutExpo']}, {
            duration: 700,
            complete: function () {
                //jQuery('.nonScrollSize').css('width', 'auto');
                //jQuery('.nonScrollSize').css('display', 'none');
                //jQuery('.menu').css('opacity', 0);
                //jQuery('.nonScrollSize').css('min-height', 'auto');
                self.setMainMenuToggleLocked(false);

            }
        });
        $('.menu').removeClass('cssMenuCalc');
        jQuery(".mainMenuCloser").css('display', 'none');
        $('.nonScrollSize').fadeTo(0, 500);
        $('.wallet').removeClass('cssBlurBg');

        $(".wallet").css({
            "opacity": "1",

            "-webkit-transition": "0.5s linear",
            "-moz-transition": "0.5s linear",
            "-ms-transition": "0.5s linear",
            "-o-transition": "0.5s linear",
            "transition": "0.25s linear",
        })
        // Fade background in.
        $('.material-design-hamburger__layer').addClass('material-design-hamburger__icon--from-arrow');
        $('.material-design-hamburger__layer').removeClass('material-design-hamburger__icon--to-arrow');


        //@note: this resets all the active data members
        this.setWindowActive('mainMenuPrimary', false);
        this.setWindowActive('mainMenuWallets', false);
        this.setWindowActive('mainMenuCurrencies', false);

        //this.clearNavigationBarPositionTimeout();

        self._mainMenuToggleLocked = false;
        //this.getCoinBannerCarousel().data("flickity").reposition();

        //updateWalletUI();
        //TODO check where used
    }
}

JaxxUI.prototype.swipeToCloseMenu = function() {
    var swipeMenu = document.getElementById('body');
    var self = this;

    Hammer(swipeMenu).on("swiperight", function() {
        g_JaxxApp.getUI().closeMainMenu();


        var swipeManager = new Hammer.Manager(swipeMenu);
        //    // create a recognizer
        //    var swipe = new Hammer.Swipe();
        //    // add the recognizer
        //    swipeManager.add(swipe);
        //    // subscribe to events
        //    swipeManager.on('swipeleft', function(e) {
        //        e.preventDefault;
        //        g_JaxxApp.getUI().openMainMenu();
    });

    var swipeMenu = document.getElementById('body');

    Hammer(swipeMenu).on("swiperight", function(e) {
        if (g_JaxxApp.getUI().isMainMenuOpen()) {
            g_JaxxApp.getUI().closeMainMenu();
        }
    });

    Hammer(swipeMenu).on("swipeleft", function(e) {
        if (!g_JaxxApp.getUI().isMainMenuOpen() && !self.isNotificationFooterOpen()) {
            //g_JaxxApp.getUI().openMainMenu(); // commented out to reflect a requirement change.
        }
    });

}

// The next three functions pertain to showing and hiding menu windows which are:
// mainMenuMenu
// mainMenuWallets
// mainMenuCurrencies

JaxxUI.prototype.mainMenuShowMenu = function() { // Shows the MENU tab of the main menu.
    this.setWindowActive('mainMenuPrimary', true);
    this.setWindowActive('mainMenuWallets', false);
    this.setWindowActive('mainMenuCurrencies', false);

    $('.cssActiveWindow .mainMenuMenu').addClass('cssSelected');
    $('.cssMenu .menuWindowOptionMenu').addClass('cssSelected');
    $('.cssActiveWindow .mainMenuWallets').removeClass('cssSelected');
    $('.cssMenu .menuWindowOptionWallets').removeClass('cssSelected');
    $('.cssActiveWindow .mainMenuCurrencies').removeClass('cssSelected');
    $('.cssMenu .menuWindowOptionCurrencies').removeClass('cssSelected');
    this.swipeToCloseMenu();
}

JaxxUI.prototype.mainMenuShowWallets = function() { // Shows the WALLETS tab of the main menu.
    this.setWindowActive('mainMenuPrimary', false);
    this.setWindowActive('mainMenuWallets', true);
    this.setWindowActive('mainMenuCurrencies', false);

    $('.cssActiveWindow .mainMenuMenu').removeClass('cssSelected');
    $('.cssMenu .menuWindowOptionMenu').removeClass('cssSelected');
    $('.cssActiveWindow .mainMenuWallets').addClass('cssSelected');
    $('.cssMenu .menuWindowOptionWallets').addClass('cssSelected');
    $('.cssActiveWindow .mainMenuCurrencies').removeClass('cssSelected');
    $('.cssMenu .menuWindowOptionCurrencies').removeClass('cssSelected');
}

JaxxUI.prototype.mainMenuShowCurrencies = function() { // Shows the CURRENCIES tab of the main menu.
    console.log(' JaxxUI.prototype.mainMenuShowCurrencies ');
    this.setWindowActive('mainMenuPrimary', false);
    this.setWindowActive('mainMenuWallets', false);
    this.setWindowActive('mainMenuCurrencies', true);

    $('.cssActiveWindow .mainMenuMenu').removeClass('cssSelected');
    $('.cssMenu .menuWindowOptionMenu').removeClass('cssSelected');
    $('.cssActiveWindow .mainMenuWallets').removeClass('cssSelected');
    $('.cssMenu .menuWindowOptionWallets').removeClass('cssSelected');
    $('.cssActiveWindow .mainMenuCurrencies').addClass('cssSelected');
    $('.cssMenu .menuWindowOptionCurrencies').addClass('cssSelected');

    this.populateCurrencyList(Registry.getCurrentCryptoController().symbol);
}

JaxxUI.prototype.generateSettingsCryptoCurrencyRows = function() {
  //  console.error('JaxxUI.prototype.generateSettingsCryptoCurrencyRowsWalletSetup');
    var self = this;
    var strSelectorForTable = '.mainMenuWallets .coinList';
    // Assertion: Settings has correctly stored the position order of the cryptocurrencies.
    $(strSelectorForTable + " tbody").empty();

    var cryptoCurrencies = jaxx.Registry.getWalletsSorted();

   // console.log('JaxxUI.prototype.generateSettingsCryptoCurrencyRows     ', cryptoCurrencies);


    for (var i = 0; i < cryptoCurrencies.length; i++) {
        var ctr = cryptoCurrencies[i];
        var name = ctr.name;
        var displayName = ctr.displayName;
        var threeLetterCode = ctr.threeLetterCode;
        var symbol = ctr.symbol;
        var extraCss = "";
        // var isTestnet = jaxx.Registry.getConfigByName(name).testnet;;//HDWalletPouch.getStaticCoinPouchImplementation(HDWalletHelper.dictCryptoCurrency[cryptoCurrencyName].index).pouchParameters['isTestnet'];

        if(ctr.testnet) extraCss = 'cssTestnet';

        //  var staticPouchImplementation = HDWalletPouch.getStaticCoinPouchImplementation(HDWalletHelper.dictCryptoCurrency[cryptoCurrencies[i]].index);
        //  var coinWalletSelector3LetterSymbol = staticPouchImplementation.uiComponents['coinWalletSelector3LetterSymbol'];

        var symbol =  ctr.symbol;
        var column1 = '<td class="cssSelectedCurrency"><div data-symbol="'+ symbol +'" data-id ="'+name+'" class="cssCircleUnchecked  '+(ctr.enabled?'cssCurrencyisChecked':'')+'"></div></td>';
        var column2 = '<td class="itemNumberLabel cssItemNumberLabel"></td>';
        var column3 = '<td class="coinIcon cssCoinIcon"></td>';
        // var column4 = '<td class="coinLabel cssCoinLabel">' + coinWalletSelector3LetterSymbol + ' - ' + HDWalletHelper.dictCryptoCurrency[cryptoCurrencies[i]]['name'] + '</td>';
        var column4 = '<td class="coinLabel cssCoinLabel cssWalletsMenuLabel">' + threeLetterCode + ' - ' + displayName + '</td>';
        var column5 = '<td class="handle cssHandle"><img src="images/dragAndDrop.svg" alt="" height="13" width="13" style="position:absolute; padding-top:12px;"></td>';
        var tableRow = '<tr class="cssCoinCurrency scriptAction coinType' + symbol + " " + extraCss + '" specialAction ="toggleCryptoCurrency" data-id="' + symbol + '" value="' + symbol + '">' + column1 + column2 + column3 + column4 + column5 + '</tr>';
        $(strSelectorForTable + " tbody").append(tableRow);

        if(ctr.enabled){
            // if the currency is enabled, highlight the parent div
            $('.cssCoinCurrency.coinType' + symbol).addClass('cssCurrencyHighlightText');
        }

        /*
        if (cryptoCurrencies[i].enabled) {
            g_JaxxApp.getSettings().enableCryptoCurrency(cryptoCurrencies[i].symbol);
            this.enableCryptoCurrencyInUI(cryptoCurrencies[i].symbol, true);
        } else {
            g_JaxxApp.getSettings().disableCryptoCurrency(cryptoCurrencies[i].symbol);
            this.disableCryptoCurrencyInUI(cryptoCurrencies[i].symbol, true);
        }*/
    }

   // this.updateCryptoCurrencyBannersInHeaderCarousel();
    //this.updateCryptoCurrencyBannersInHeader();


    // Attach listeners.
    $(strSelectorForTable +' .scriptAction').off();
    $(strSelectorForTable +' .scriptAction').click(function (event) { // Add the scriptAction triggers again.


        var el = $(event.currentTarget);
        var mainParentElement = el.closest('.cssCoinCurrency', '.coinType');
        var toggleMenuItem;

        if(el.hasClass('cssCircleUnchecked'))
        {
            toggleMenuItem = el;
        }
        else{
            toggleMenuItem = mainParentElement.find('.cssCircleUnchecked');
        }

        if(toggleMenuItem.hasClass('cssCircleUnchecked')){
        
            var name  = toggleMenuItem.attr('data-id');
            var symbol = toggleMenuItem.attr('data-symbol');
            var enbl = toggleMenuItem.hasClass('cssCurrencyisChecked');
            //var symbol = el.data('symbol');
            //var parentElement = el.closest('.cssCoinCurrency', '.coinType');

            if (toggleMenuItem.hasClass('cssCurrencyisChecked'))
            {
                if (jaxx.Registry.getWalletsEnabledSorted().length > 1)
                {
                    toggleMenuItem.removeClass('cssCurrencyisChecked');
                    enbl = false;
                } else {
                    return;
                }
            } else {
                toggleMenuItem.addClass('cssCurrencyisChecked');
                enbl = true;
            }
            

            if(enbl){
                // if the currency is enabled, highlight the parent div
                mainParentElement.addClass('cssCurrencyHighlightText');
            }
            else{
                 // if the currency is not enabled, remove the highlight from the parent div
                    mainParentElement.removeClass('cssCurrencyHighlightText');
                     

            }

            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_COIN_SATUS_CHANGED, [name,enbl,symbol])

        }

        /// console.warn(el);


        // $(event.target)
        // try {
        /// scriptAction(event);
        // } catch (err) {
        //     console.error(err);
        // }
    });

    // Make the table sortable.
    var tablelist = $(strSelectorForTable + " tbody").sortable({
        /*items: "> tr:not(:first)",*/
        appendTo: "parent",
        axis: 'y',
        helper: "clone",
        handle: ".handle",
        update: function(event, ui) {

            console.warn(event, ui);

            var out = {};


            tablelist.children('tr').each(function (item, el) {
                // console.log(item, el);
                out[$(el).data('id')] = item ;
            });

            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_COIN_SEQUENCE_CHANGED, out);


            // @TODO: Javascript optimization
           // g_JaxxApp.getUI().pushCryptoCurrencyPositionOrderToSettings();

            self._walletWasChangedInMenu = true;
            // Sortable change number of element
            //            var $lis = $(this).children('tr');
            //            $lis.each(function() {
            //                var $li = $(this);
            //                var newVal = $(this).index() + 1;
            //                $(this).children('.itemNumberLabel').html(newVal);
            //                $(this).children('#item_display_order').val(newVal);
            //            });
        },
    }).disableSelection();

    // Toggle the rows that need the toggling.
}

// Script to Select wallets in EXPRESS flow
JaxxUI.prototype.StartFlowSettingsCryptoCurrencyRows123 = function() {
    console.warn('TODO check is need it');
    // Assertion: Settings has correctly stored the position order of the cryptocurrencies.
    var cryptoCurrencies = g_JaxxApp.getSettings().getCryptoCurrencyPositionList();
    for (var i = 0; i < cryptoCurrencies.length; i++) {
        var cryptoCurrencyName = cryptoCurrencies[i];
        var extraCss = "";
        //  var isTestnet = HDWalletPouch.getStaticCoinPouchImplementation(HDWalletHelper.dictCryptoCurrency[cryptoCurrencyName].index).pouchParameters['isTestnet'];

        (isTestnet === true) ? extraCss = 'cssTestnet' : "";

        var column1 = '<td class="cssSelectedCurrency"><div class="cssCircleUnchecked"></div></td>';
        var column2 = '<td class="itemNumberLabel cssItemNumberLabel"></td>';
        var column3 = '<td class="coinIcon cssCoinIcon"></td>';
        var column4 = '<td class="coinLabel cssCoinLabel">' + cryptoCurrencies[i] + ' - ' + HDWalletHelper.dictCryptoCurrency[cryptoCurrencies[i]]['displayName'] + '</td>';
        var column5 = '<td class="handle cssHandle"><img src="images/dragAndDrop.svg" alt="" height="13" width="13" style="position:absolute; padding-top:12px;"></td>';
        var tableRow = '<tr class="cssCoinCurrency scriptAction coinType' + cryptoCurrencies[i] + " " + extraCss + '" specialAction ="toggleCryptoCurrency" value="' + cryptoCurrencies[i] + '">' + column1 + column2 + column3 + column4 + column5 + '</tr>';
        $('.coinListExpress tbody').append(tableRow);
        if (g_JaxxApp.getSettings().isCryptoCurrencyEnabled(cryptoCurrencies[i])) {
            g_JaxxApp.getSettings().enableCryptoCurrency(cryptoCurrencies[i]);
            g_JaxxApp.getUI().enableCryptoCurrencyInUI(cryptoCurrencies[i], true);
        } else {
            g_JaxxApp.getSettings().disableCryptoCurrency(cryptoCurrencies[i]);
            g_JaxxApp.getUI().disableCryptoCurrencyInUI(cryptoCurrencies[i], true);
        }
    }
    this.updateCryptoCurrencyBannersInHeader();
    // Make the table sortable.
    $(".coinListExpress tbody").sortable({
        /*items: "> tr:not(:first)",*/
        appendTo: "parent",
        axis: 'y',
        helper: "clone",
        handle: ".handle",
        update: function(event, ui) {
            // @TODO: Javascript optimization
            g_JaxxApp.getUI().pushCryptoCurrencyPositionOrderToSettings();

            // Sortable change number of element
            //            var $lis = $(this).children('tr');
            //            $lis.each(function() {
            //                var $li = $(this);
            //                var newVal = $(this).index() + 1;
            //                $(this).children('.itemNumberLabel').html(newVal);
            //                $(this).children('#item_display_order').val(newVal);
            //            });
        },
    }).disableSelection();

    // Toggle the rows that need the toggling.
}
// Script to Select wallets in EXPRESS flow Ends

JaxxUI.prototype.toggleCryptoCurrencyIsEnabled = function(cryptoCurrency) {
    //console.log(cryptoCurrency);

    //@note: @todo: @here: telling the settings that the currency is enabled is fine, but this function should handle all of the ui tasks.
    g_JaxxApp.getSettings().toggleCryptoCurrencyIsEnabled(cryptoCurrency); // Change settings
    // Add class .cssCurrency is checked to the correct item.
}

JaxxUI.prototype.enableCryptoCurrencyInUI = function(cryptoCurrency, dontUpdateBanners) {
    this._walletWasChangedInMenu = true;
    $('.mainMenuWallets .coinList .coinType' + cryptoCurrency + ' .cssSelectedCurrency .cssCircleUnchecked').addClass('cssCurrencyisChecked');// Make UI Change.
    $(".mainMenuWallets .coinList").find('[value='+cryptoCurrency+']').find('.cssSelectedCurrency').find('.cssCircleUnchecked').css('border', 'none');
    $('.mainMenuWallets .coinType' + cryptoCurrency).addClass('cssCurrencyHighlightText');
    if (typeof(dontUpdateBanners) === 'undefined' || !dontUpdateBanners){
        this.updateCryptoCurrencyBannersInHeader();
        //this.addCryptoCurrencyBannersInHeaderCarousel(cryptoCurrency);
    }

}

JaxxUI.prototype.disableCryptoCurrencyInUI = function(cryptoCurrency, dontUpdateBanners) {
    this._walletWasChangedInMenu = true;
    $('.mainMenuWallets .coinList .coinType' + cryptoCurrency + ' .cssSelectedCurrency .cssCircleUnchecked').removeClass('cssCurrencyisChecked');// Make UI Change.
    $(".mainMenuWallets .coinList").find('[value='+cryptoCurrency+']').find('.cssSelectedCurrency').find('.cssCircleUnchecked').css('border', '1px solid white');
    $('.mainMenuWallets .coinType' + cryptoCurrency).removeClass('cssCurrencyHighlightText');
    if (typeof(dontUpdateBanners) === 'undefined' || !dontUpdateBanners) {
        this.updateCryptoCurrencyBannersInHeader();
        //this.removeCryptoCurrencyBannersInHeaderCarousel(cryptoCurrency);
    }
}

JaxxUI.prototype.pushCryptoCurrencyPositionOrderToSettings = function() {
    // Extract ordering
    var rows = $('.mainMenuWallets .coinList tbody tr');
    var currencyArray = [];
    for (var i = 0; i < rows.length; i++){
        currencyArray.push($($('.mainMenuWallets .coinList tbody tr').get(i)).attr('value'));
    }
    g_JaxxApp.getSettings().setCryptoCurrencyPositionData(currencyArray); // Change settings
}

JaxxUI.prototype.updateCryptoCurrencyBannersInHeaderCarousel = function () {

    return;
    var coins = jaxx.Registry.getWalletsEnabledSorted()


    /* coins.forEach(function(item){
         var element = '.scriptAction.carousel-cell.item.cssItem.imageLogoBanner' + currencyName + '.cssCoinSelector.coinType' + currencyName;
         this.$topCarousel.flickity('append', $(insertElement));
     })*/


    var currenciesToInclude =  coins.map(function (item) {
        return item.symbol
    })// g_JaxxApp.getSettings().getListOfEnabledCryptoCurrencies();
    for (var i = 0; i < currenciesToInclude.length; i++){
        var currencyName = currenciesToInclude[i];
        this.addCryptoCurrencyBannersInHeaderCarousel(currencyName);
    }
    this.$topCarousel.flickity('resize');
}

JaxxUI.prototype.addCryptoCurrencyBannersInHeaderCarousel123 = function (currencyName) {
    return
    // currencyName = "BTC"
    var element = '.scriptAction.carousel-cell.item.cssItem.imageLogoBanner' + currencyName + '.cssCoinSelector.coinType' + currencyName;
    if($('.topBannerCarousal ' + element).length)
        return;

    console.log("Insert Element", element);
    var insertElement = this.getBannerDivForCryptoCurrency(currencyName);
    this.$topCarousel.flickity('append', $(insertElement));
    if(this.$topCarouselData && this.$topCarouselData.cells.length > 3) {
        this.initializeTopCarousel({wrapAround: true, prevNextButtons: true});
    }
    this.$topCarousel.flickity('resize');
    this.attachClickEventForScriptAction($(insertElement));
    this.updateHandlersInCoinBannerContainer();
}

JaxxUI.prototype.removeCryptoCurrencyBannersInHeaderCarousel = function (currencyName) {
    //var element = this.getBannerDivForCryptoCurrency(currency);
    var self = this;
    var element = '.scriptAction.carousel-cell.item.cssItem.imageLogoBanner' + currencyName + '.cssCoinSelector.coinType' + currencyName;
    this.$topCarousel.flickity('remove', $(element)[0]);
    if(this.$topCarouselData && this.$topCarouselData.cells.length <= 3) {
        this.initializeTopCarousel({wrapAround: false, prevNextButtons: false});
    }
    this.$topCarousel.flickity('resize');
}

JaxxUI.prototype.updateCryptoCurrencyBannersInHeader = function() {

    console.log("TRIGGERED updateCryptoCurrencyBannersInHeader");

    jaxx.CoinsMenu.instance.selectDefaultCoin();

    //$('.scrollHeaderContainer .leftArrow').show();
    //$('.scrollHeaderContainer .rightArrow').show();

    //if (typeof(window) !== 'undefined' && typeof($(window).width()) !== 'undefined' && $(window).width() <= 320){
    //    $('.scrollHeaderContainer').css('width', '195px');
    //} else {
    //    $('.scrollHeaderContainer').css('width', '231px');
    //}

    if (this._coinBannerCarousel === null || typeof(this._coinBannerCarousel) === 'undefined'){
        //this.initializeCarousels();
    } else {
        this.updateCoinBannerCarousel();
    }


    console.log("TO DO: REMOVE DUPLICATE FUNCTION");
    return;

    console.error("TO DO: REMOVE DUPLICATE FUNCTION");
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Parameter: excludeScriptAction is set to true when we want to skip the step where we add listeners.
    //	try {


    var coins = jaxx.Registry.getWalletsEnabledSorted();
    var currenciesLength = coins.length;//g_JaxxApp.getSettings().getCryptoCurrencyEnabledCount();
    var minimumBannerAmountForScrolling = 4;
    var generateWithCarousel = !(currenciesLength < minimumBannerAmountForScrolling);

    // The following code changes elemental things in the coin banner.
    var currenciesToInclude = coins.map(function (item) {
        return item.symbol;
    });

    var html ='';

    for (var i = 0; i < coins.length; i++){
        var coin = coins[i];
        var extraCss = '';
        var hueRotated;
        var doesNeedHue;

        if(this.style.filter) {
            hueRotated = (this.style.filter.split('hue-rotate('))[1].split(')')[0];
            doesNeedHue = !(typeof hueRotated === 'undefined')
        }

        if(doesNeedHue){
            extraCss = 'cssCoinSelectGenericFilter';
        }
        else {
            extraCss = 'cssCoinSelecterGreyFilter';
        }

        html+=  '<li data-name="'+coin.name+'" data-symbol="'+coin.symbol+'" class="scriptAction item cssItem imageLogoBanner' +
            coin.name + ' cssCoinSelector ' + extraCss + '" switchToCoin="' + coin.name + '" value="' + coin.name + '"' +
            ' style="background-image: url(' + coin.icon + ')">' +
            ' <span class="cssCoinButtonText"> ' + coins[i].threeLetterCode + '</span></li>';
    }

    $('#CarouselList').html(html)


    // This executes conditional instructions based on the number of elements in the banner
    // Note: We need the coin banner width for this part (which means coinBanners should be generated at this time).
    //var intCoinBannerWidth = parseInt($('.scrollHeaderContainer .coinBannerContainer .item').css('width'));
    var intCoinBannerMarginRight = 15;
    var intCoinBannerMarginLeft = 15;
    if (!generateWithCarousel) {
        // Hide scroll arrows.
        $('.scrollHeaderContainer .leftArrow').hide();
        $('.scrollHeaderContainer .rightArrow').hide();
        if (currenciesLength === 1) {
            if (typeof(window) !== 'undefined' && typeof($(window).width()) !== 'undefined' && $(window).width() <= 320){
                $('.scrollHeaderContainer').css('width', '46px');
            } else {
                $('.scrollHeaderContainer').css('width', '60px');
            }
            $($('.coinBannerContainer').children()[0]).addClass('cssSelected');
        } else if (currenciesLength === 2) {
            if (typeof(window) !== 'undefined' && typeof($(window).width()) !== 'undefined' && $(window).width() <= 320){
                $('.scrollHeaderContainer').css('width', '126px');
                $('.cssCoinSelector').css({"margin-left":"15px", "margin-right": "15px"});
            } else {
                $('.scrollHeaderContainer').css('width', '120px');
                $('.cssCoinSelector').css({"margin-left":"5px", "margin-right": "5px"});
            }
            //$('.scrollHeaderContainer').css('width', (intCoinBannerWidth * 2 + 13).toString() + 'px');
        } else if (currenciesLength === 3) {
            if (typeof(window) !== 'undefined' && typeof($(window).width) !== 'undefined' && $(window).width() <= 320){
                $('.scrollHeaderContainer').css('width', '150px');
            } else {
                $('.scrollHeaderContainer').css('width', '180px');
                $('.cssCoinSelector').css({"margin-left":"4px", "margin-right": "4px"});
                //rohit- change was made to accomidate the carousal alignment, above element was commented out
                $('.cssCoinSelector').css({"margin-left":"0px", "margin-right": "10px"});
            }

            //$('.cssCoinSelector').css({"margin-left":"10px", "margin-right": "10px"});
        }
    } else {
        // Show scroll arrows.
        $('.scrollHeaderContainer .leftArrow').show();
        $('.scrollHeaderContainer .rightArrow').show();
        if (typeof(window) !== 'undefined' && typeof($(window).width()) !== 'undefined' && $(window).width() <= 320){
            $('.scrollHeaderContainer').css('width', '195px');
        } else {
            $('.scrollHeaderContainer').css('width', '231px');
        }
        // Set the width of the wrapper container to a fixed size.

        // Same deal, but we center the active currency.
        //var currenciesToInclude = [];
        //var middleCurrency = coinAbbreviatedName[curCoinType];
        //if (typeof(middleCurrency) === 'undefined' || middleCurrency === null) {
        //    middleCurrency = coinAbbreviatedName[g_JaxxApp.getSettings().getDefaultCoinType()];
        //}	currenciesToInclude.push(g_JaxxApp.getSettings().getPreviousEnabledCryptoCurrency(middleCurrency));
        //currenciesToInclude.push(middleCurrency);
        //currenciesToInclude.push(g_JaxxApp.getSettings().getNextEnabledCryptoCurrency(middleCurrency));
        //$('.scrollHeaderContainer').empty();
        //$('.scrollHeaderContainer').append('<div class="scriptAction leftArrow cssLeftArrow" specialAction="slideBannerLeft"><img src="images/arrowLeft.svg" alt="" height="12" width="12" style="position:absolute; padding-top:5px;"></div>');
        //$('.scrollHeaderContainer').append('<div class="cssCoinBannerWrapper viewport"><ul class="coinBannerContainer overview cssCoinBannerContainer"></ul</div>');
        //$('.scrollHeaderContainer').append('<div class="scriptAction rightArrow cssRightArrow" specialAction="slideBannerRight"><img src="images/arrowRight.svg" alt="" height="12" width="12" style="position:absolute; padding-top:5px;"></div>');
        //$('.scrollHeaderContainer').css('width', '227px');
    }


    if (generateWithCarousel) {
        if (this._coinBannerCarousel === null || typeof(this._coinBannerCarousel) === 'undefined'){
            //this.initializeTopCarousel();
            this.initializeCarousels();
        } else {
            this.updateCoinBannerCarousel(); // Remember that this checks for undefined and null types.
        }
    }

    // Style stuff
    // this.updateHandlersInCoinBannerContainer();
    //this.updateHighlightingInCoinBannerContainer();
    // this.resetCoinButton();
    //updateWalletUI();
}

JaxxUI.prototype.updateHighlightingInCoinBannerContainer2 = function(){
    // Grey/white highlighting.
    var coinTypesInBanner = []; // ie. [0, 1]
    // for (var i = 0; i < $('.coinBannerContainer').children().length; i++){

    // coinTypesInBanner.push(HDWalletHelper.dictCryptoCurrency[$($('.coinBannerContainer').children()[i]).attr('value')]['index']);
    //}
    for (var i = 0; i < coinTypesInBanner.length; i++){
        this.resetCoinButton(coinTypesInBanner[i]);
    }
    this.selectActiveBanner();
    this.removeMouseHoverHandlersFromCoinBanner(curCoinType);
}

JaxxUI.prototype.removeMouseHoverHandlersFromCoinBanner2 = function(coinType){
    // This function is usually used for the active coin to remove the grey and coloured highlighting on mouse events.
    var coinButtonName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonName'];
    var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];
    $(coinButtonName).off('mouseover');
    $(coinButtonName).off('mouseleave');
}

JaxxUI.prototype.updateHandlersInCoinBannerContainer = function() {
    // This is necessary for highlighting to be set properly.
    $('.coinBannerContainer').children().off(); // Might be unnecessary
    this.attachClickEventForScriptAction($('.coinBannerContainer').children());


    //var bannerElements = $('.topBannerCarousal .flickity-slider .scriptAction');
    //this.attachClickEventForScriptAction(bannerElements);
    //$('.coinBannerContainer').children().off(); // Might be unnecessary
    /*
    $('.coinBannerContainer').children().off('click');
    $('.coinBannerContainer').children().click(function (event) { // Add the scriptAction triggers again.
        try {
            scriptAction(event);
        } catch (err) {
            console.error(err);
        }
    });*/
}

JaxxUI.prototype.selectActiveBanner = function() {
    this.selectBannerInNavigationBar(curCoinType);
}

JaxxUI.prototype.selectBannerInNavigationBar = function(coinType){
    console.log('TODO selectBannerInNavigationBar');

    return
    if (typeof(coinType) === 'undefined' || coinType === null) {
        console.log("error :: JaxxUI :: need to update selectBannerInNavigationBar to not fire on initialization");
        return;
    }

    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    // @TODO: Add a wrapper in that function that handles the case where coinType is not specified correctly.

    $('.coinBannerContainer').children().removeClass('cssSelected');
    $('.coinBannerContainer .coinType' + coinAbbreviatedName).addClass('cssSelected');

    var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];

    $('.coinBannerContainer .cssSelected').css({background: 'url(images/' + coinButtonSVGName + '.svg) no-repeat center center', color: '#FFFFFF'});

    //$('.topBannerContainer .flickity-slider').children().removeClass('cssSelected');
    //$('.topBannerContainer .flickity-slider .coinType' + coinAbbreviatedName).addClass('cssSelected');

    //var coinButtonSVGName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['coinButtonSVGName'];
    //$('.topBannerContainer .cssSelected').css({color: '#FFFFFF'});
}

JaxxUI.prototype.highlightActiveCoinBanner = function() {
    // @Note: Legacy
    // Highlight all coin banners grey.
    $('.coinBannerContainer .cssSelected').css('color', '#fff'); // Highlight selected coin banner white.
}

JaxxUI.prototype.selectMiddleCoinBanner = function() { // We call this when the ui makes a change to the coin banner.
    // @Note: Legacy
    $('.coinBannerContainer').children().removeClass('cssSelected');
    $($('.coinBannerContainer').children()[1]).addClass('cssSelected');

    //this.highlightActiveCoinBanner();
}

/*
JaxxUI.prototype.switchToCoinByName = function(name){

    var ctr = jaxx.Registry.getCryptoControllerByName(name);

    switchToCoinType(ctr, false, function() {
        console.log('switch complete to by name ' + name)

    });

}

JaxxUI.prototype.switchToCoinByStmbol = function(symbol){

    this.clearNavigationBarPositionTimeout();

    var ctr = jaxx.Registry.getCryptoControllerBySymbol(symbol);


    switchToCoinType(ctr, false, function() {
        console.log('switch complete to by symbol ' + symbol)

    });
*/

/*
    if (curCoinType != HDWalletHelper.dictCryptoCurrency[targetCoinAbbreviatedName]['index']){
        if (targetCoinAbbreviatedName === 'ETH'){
            switchToCoinType(HDWalletHelper.dictCryptoCurrency[targetCoinAbbreviatedName]['index'], true, function() {});
        } else {
            switchToCoinType(HDWalletHelper.dictCryptoCurrency[targetCoinAbbreviatedName]['index'], null, function() {});
        }
    } else {

    }*/

/*
JaxxUI.prototype.getBannerDisplayCoinAbbreviation = function(cryptoCurrencyName) {

    return HDWalletHelper.dictCryptoCurrency[cryptoCurrencyName].bannerName;
}
*/

JaxxUI.prototype.getBannerDivForCryptoCurrency2 = function(cryptoCurrencyName) {

    // var isTestnet =  // HDWalletPouch.getStaticCoinPouchImplementation(HDWalletHelper.dictCryptoCurrency[cryptoCurrencyName].index).pouchParameters['isTestnet'];

    var extraCss = "";

    //if (isTestnet === true) {
    // extraCss = 'cssTestnet';
    // }

    //var logoCellBanner = '<div class="scriptAction carousel-cell item cssItem imageLogoBanner' + cryptoCurrencyName + ' cssCoinSelector coinType' + cryptoCurrencyName +  ' ' + extraCss + '" switchToCoin="' + cryptoCurrencyName + '" value="' + cryptoCurrencyName + '">' + '<span class="cssCoinButtonText">' + this.getBannerDisplayCoinAbbreviation(cryptoCurrencyName) + '</span></div>';

    //return logoCellBanner;
    return '<li class="scriptAction item cssItem imageLogoBanner' + cryptoCurrencyName + ' cssCoinSelector coinType' + cryptoCurrencyName +  ' ' + extraCss + '" switchToCoin="' + cryptoCurrencyName + '" value="' + cryptoCurrencyName + '">' + '<span class="cssCoinButtonText">' + this.getBannerDisplayCoinAbbreviation(cryptoCurrencyName) + '</span></li>';
    //TestNet
    /*
        var isTestnet = HDWalletPouch.getStaticCoinPouchImplementation(HDWalletHelper.dictCryptoCurrency[cryptoCurrencyName].index).pouchParameters['isTestnet'];
    if(isTestnet === true) {
        var $elCoin = 'li.item.imageLogoBanner' + cryptoCurrencyName;
        $($elCoin).addClass('cssTestnet');
    }
    return listitem;
    */
}

JaxxUI.prototype.getBannerForShapeshiftCoin = function(cryptoCurrencyName){
    return '<div class="scriptAction imageLogoBanner' + cryptoCurrencyName + ' cssCoinSelector coinType' + cryptoCurrencyName + '" value="' + cryptoCurrencyName + '">' + '<span class="cssCoinButtonText">' + this.getBannerDisplayCoinAbbreviation(cryptoCurrencyName) + '</span></div>';
}

JaxxUI.prototype.slideBannerRight = function() {
    var self = this;
    // Assertion: Current coin type is centered in the banner bar.
    //var self = this;
    //var newElement = this.getBannerDivForCryptoCurrency(g_JaxxApp.getSettings().getIncrementCryptoCurrencyNSteps(g_JaxxApp.getSettings().getActiveCoinType(), 2));
    //this.switchToCoin($($('.coinBannerContainer').children()[2]).attr('value'));
    //var elementToRemove = $('.coinBannerContainer').children().first();
    //var insertionIndex = elementOnLeft.indexOf("class") + 7;
    //$('.coinBannerContainer').append(newElement);
    //$(elementToRemove).remove();

    //    $(newElement).hide();
    //	$(newElement).show( function() {console.log('Show Callback');});

    //	elementToRemove.hide( function(){
    //		$(elementToRemove).remove();
    //		self.updateNewAttributesInCoin3Banners();
    //	});
    //this.updateNewAttributesInCoin3Banners();
    // Attach switchToCoin to the arrow.
    setTimeout( function(){
        self.moveCarouselToNearestPosition();
        self.resetCoinBannerCarouselTimeout();
        //self.updateHighlightingInCoinBannerContainer();
    }, this._coinBannerCarouselAnimationTime)
    this.updateHandlersInCoinBannerContainer();
}

JaxxUI.prototype.clearNavigationBarPositionTimeout = function() {
    if (typeof(this._coinBannerCarouselTimeout) !== 'undefined' && this._coinBannerCarouselTimeout !== null) {
        clearTimeout(this._coinBannerCarouselTimeout);
    }
}

JaxxUI.prototype.slideBannerLeft = function() {
    var self = this;
    // Assertion: Current coin type is centered in the banner bar.
    //alert("Sliding left");
    //var self = this;
    //var newElement = this.getBannerDivForCryptoCurrency(g_JaxxApp.getSettings().getIncrementCryptoCurrencyNSteps(g_JaxxApp.getSettings().getActiveCoinType(), -2));
    //this.switchToCoin($($('.coinBannerContainer').children()[0]).attr('value'));
    //var elementToRemove = $('.coinBannerContainer').children().last();
    //var insertionIndex = elementOnLeft.indexOf("class") + 7;
    //var newElement; //elementOnLeft.slice(0, insertionIndex) + 'cssSlidingFromLeft ' + elementOnLeft.slice(insertionIndex);
    //$('.coinBannerContainer').prepend(newElement);
    //$(elementToRemove).remove();
    //	$(newElement).hide();
    //	//$(newElementOnLeft).removeClass('cssSlidingFromLeft');
    //	$(newElement).show( function() {console.log('Show Callback');});
    //	elementToRemove.hide( function(){
    //		$(elementToRemove).remove();
    //		self.updateNewAttributesInCoin3Banners();
    //	});
    //this.switchToCoin(g_JaxxApp.getSettings().getPreviousEnabledCryptoCurrency());
    //this.updateNewAttributesInCoin3Banners();
    // Attach switchToCoin to the arrow.
    setTimeout( function(){
        self.moveCarouselToNearestPosition();
        self.resetCoinBannerCarouselTimeout();
        // self.updateHighlightingInCoinBannerContainer();
    }, this._coinBannerCarouselAnimationTime);
    this.updateHandlersInCoinBannerContainer();
}

JaxxUI.prototype.resetCoinBannerCarouselTimeout = function() {
    return;
    var self = this;
    this.clearNavigationBarPositionTimeout();
    if (!this.isCurrentCoinTypeVisibleInCarousel()) {
        this._coinBannerCarouselTimeout = setTimeout(function(){self.setCoinNavBarToDefaultPosition();}, this._coinBannerCarouselTimeoutTime);
    } else {
        this.clearNavigationBarPositionTimeout()
    }
}

JaxxUI.prototype.isCurrentCoinTypeVisibleInCarousel1 = function(){
    return this.isCoinTypeVisibleInCarousel(curCoinType);
}

JaxxUI.prototype.isCoinTypeVisibleInCarousel2 = function(coinType){
    // Checks current index, index + 1 and index + 2
    // var currentIndex = this.getCurrentBannerIndexInCarousel();
    // return (coinType === this.getCoinAtIndexInCarousel(currentIndex) || coinType === this.getCoinAtIndexInCarousel(currentIndex + 1) || coinType === this.getCoinAtIndexInCarousel(currentIndex + 2));
}

JaxxUI.prototype.getCurrentBannerIndexInCarousel = function(){
    return parseInt(this.convertOffsetToBannerPosition($('.coinBannerContainer').offset().left)); //+ this.getCoinBannerCarousel().slideCurrent;
}

/*JaxxUI.prototype.getCoinAtIndexInCarousel = function(index){
    // Returns an integer.
    var coinBanners = $('.coinBannerContainer').children();
    return HDWalletHelper.dictCryptoCurrency[$(coinBanners[index % coinBanners.length]).attr('value')]['index'];
    // g_JaxxApp.getUI().getCoinBannerCarousel().slideCurrent
}*/
/*
JaxxUI.prototype.rightCoinBannerClicked = function(coinType) {
	this.slideBannerRight();
	this.updateNewAttributesInCoin3Banners();
	console.log('The Banner on the left was clicked');
}

JaxxUI.prototype.centerCoinBannerClicked = function(coinType) {
	this.switchToCoin(coinType);
	this.updateNewAttributesInCoin3Banners();
	console.log('The Banner in the center was clicked');
}

JaxxUI.prototype.leftCoinBannerClicked = function(coinType) {
	this.slideBannerLeft();
	this.updateNewAttributesInCoin3Banners();
	console.log('The Banner on the right was clicked');
}

*/
/*
JaxxUI.prototype.rightBannerArrowClicked = function() {
	this.rightCoinBannerClicked($('.coinBannerContainer').children().first().attr('value'));
}

JaxxUI.prototype.leftBannerArrowClicked = function() {
	this.leftCoinBannerClicked($('.coinBannerContainer').children().last().attr('value'));
}
*/
/*
JaxxUI.prototype.setHasAttachedScriptAction = function(value) {
	this._hasAttachedScriptAction = value;
	/* this.updateNewAttributesInCoin3Banners();
}*/

JaxxUI.prototype.assignCoinButtonHandlers = function() {

}

JaxxUI.prototype.getHasAttachedScriptAction = function() {
    return this._hasAttachedScriptAction;
}
// Command that disables horrizontal movmnet for dradgging and dropping
//$( ".exchangeRateList tbody" ).sortable({ axis: 'y' });
//$( ".mainMenuWallets .coinList tbody" ).sortable({ axis: 'y' });
//$( ".exchangeRateList tbody" ).sortable({
//    revert: true
//});
//$( ".mainMenuWallets .coinList tbody" ).sortable({
//    revert: true
//});

JaxxUI.prototype.generateShapeshiftBanner = function(sourceCoin, targetCoin) {
    // We usually call this function without setting the second parameter.
    // parameters are of the form 'BTC', 'ETH' etc.

    // Consider setting the settings to the target.

    if (typeof(targetCoin) === 'undefined'){
        targetCoin = g_JaxxApp.getSettings().getShapeshiftCoinTarget(sourceCoin);
    }

    $('.currencyToggleFirst').empty();
    $('.currencyToggleFirst').append(this.getShapeshiftSourceHtml(sourceCoin));
    $('.currencyToggleFirst').append(this.getConversionArrowHtml());
    $('.currencyToggleFirst').append(this.getShapeshiftTargetHtml(targetCoin));

    $('.currencyToggleFirst .scriptAction').click(function (event) { scriptAction(event);});
}
/*
JaxxUI.prototype.updateShapeshiftTarget = function(cryptoUnit) {


    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];

  /!*  // Assumes elements have been generated.
    g_JaxxApp.getSettings().setShapeshiftCoinTarget(coinAbbreviatedName, cryptoUnit);

    $('.currencyToggleFirst').children().last().remove()
    $('.currencyToggleFirst').append(this.getShapeshiftTargetHtml(cryptoUnit));

    $('.currencyToggleFirst .scriptAction').last().click(function (event) { scriptAction(event); });*!/
}*/

JaxxUI.prototype.getShapeshiftSourceHtml = function(coinType) {
    return '<div class="scriptAction  cssImageLogoBanner'+ coinType +' imageLogoBanner' + coinType + ' imageLogoCurrencyToCurrency shapeShiftSwitchFrom cssShapeshiftSwitchFrom cssCoinSelector cssHighlighted cssSourceCoin" value="' + coinType + '"><span class="cssCoinText">' + coinType + '</span></div>';
}

JaxxUI.prototype.getShapeshiftTargetHtml = function(coinType) {
    return '<div class="scriptAction cssImageLogoBanner' + coinType + ' imageLogoBanner' + coinType + ' imageLogoCurrencyToCurrency shapeShiftSwitchTo cssShapeshiftSwitchTo cssCoinSelector cssHighlighted" specialAction="changeShapeshiftCoinToNextCoinType"><span class="cssCoinText">' + coinType + '</span></div>';
}

JaxxUI.prototype.getConversionArrowHtml = function() {
    return '<img class="cssArrowcoinToCoin" src="images/coinToCoin.svg" alt="" height="12" width="28" style="margin: 3px 3px 0px 0px">';
}

JaxxUI.prototype.changeShapeshiftCoinToNextCoinType = function() {
    // cryptoUnit should be left blank.
    var sendCoinAbbreviatedName = $('.shapeShiftSwitchFrom').attr('value');
    var receiveCoinAbbreviatedName = g_JaxxApp.getSettings().getNextCryptoForShapeshiftSelection(sendCoinAbbreviatedName);
    // coinType should be set to something like 'ETH' or 'BTC' (the current coin type in the app)
    this.showSpendableLoading();
    g_JaxxApp.getSettings().setShapeshiftCoinTarget(sendCoinAbbreviatedName, receiveCoinAbbreviatedName);
    this.updateShapeshiftTarget(receiveCoinAbbreviatedName);

    var receiveCoinType = HDWalletHelper.dictCryptoCurrency[receiveCoinAbbreviatedName].index;

    g_JaxxApp.getShapeShiftHelper().setReceivePairForCoinType(curCoinType, receiveCoinType);
    g_JaxxApp.getShapeShiftHelper().clearUpdateIntervalIfNecessary();

    $('.tabContent .address input').trigger('keyup');

    this.closeShapeshiftCoinList(); // Close the menu
}

JaxxUI.prototype.selectShapeshiftCoin = function(receiveCoinAbbreviatedName){
    this.showSpendableLoading();

    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];

    // coinType is something like 'BTC', 'ETH' etc.
    g_JaxxApp.getSettings().setShapeshiftCoinTarget(coinAbbreviatedName, receiveCoinAbbreviatedName); // Set shapeshift currency in settings for this one.

    $('.shapeshiftCoinSelectionMenu tr').removeClass('cssBlueHighlight');
    $('.shapeshiftCoinSelectionMenu .coinType' + receiveCoinAbbreviatedName).addClass('cssBlueHighlight');

    this.updateShapeshiftTarget(receiveCoinAbbreviatedName); // Change the target coin banner.

    var receiveCoinType = HDWalletHelper.dictCryptoCurrency[receiveCoinAbbreviatedName].index;

    g_JaxxApp.getShapeShiftHelper().setReceivePairForCoinType(curCoinType, receiveCoinType);
    g_JaxxApp.getShapeShiftHelper().clearUpdateIntervalIfNecessary();

    $('.tabContent .address input').trigger('keyup');

    var self = this;

    setTimeout(function() {

        self.closeShapeshiftCoinList(); // Close the menu
    }, 500);
}

JaxxUI.prototype.showSpendableLoading = function(){
    $('.spendable .processSpendable').show();
    $('.populateSpendable').text("");
}
JaxxUI.prototype.addOptionsTopCarousel = function(options) { // For flickity
    var wrapAroundValue = false, prevNextButtonsValue = false;
    if(options) {
        wrapAroundValue = options.wrapAround;
        prevNextButtonsValue = options.prevNextButtons;
    }
    options = {
        cellSelector: '.carousel-cell',
        adaptiveHeight: true,
        contain: true,
        pageDots: false,
        wrapAround: wrapAroundValue,
        prevNextButtons: prevNextButtonsValue,
        arrowShape: {
            x0: 35,
            x1: 85, y1: 50,
            x2: 95, y2: 40,
            x3: 55
        },
    };
    this.$topCarousel = $('.carousel.topBannerCarousal').flickity(options);
    this.$topCarouselData = this.$topCarousel.data('flickity');
    //var $cellElem = $('<div class="carousel-cell">Eth</div>');
    //this.$topCarousel.flickity('append', $cellElem);
}
JaxxUI.prototype.initializeTopCarousel = function(options) { // For flickity
    var options;
    if(this.$topCarousel) {
        this.$topCarouselData = this.$topCarousel.data('flickity');
        if(this.$topCarouselData && this.$topCarouselData.cells.length > 3)
            options = {wrapAround: true, prevNextButtons: true};
        this.$topCarousel.flickity('destroy');
    }
    this.addOptionsTopCarousel(options);
}

JaxxUI.prototype.initializeCarousels = function() { // For tinycarousel.js
    //$('#scrollHeaderContainer').tinycarousel({display: 2});
    //$(document).ready(function(){
    $('#scrollHeaderContainer .leftArrow.scriptAction').click(function (event) { scriptAction(event);});
    $('#scrollHeaderContainer .rightArrow.scriptAction').click(function (event) { scriptAction(event);});
    //$('#scrollHeaderContainer').tinycarousel({infinite: true, animationTime: this._coinBannerCarouselAnimationTime});
    //this._coinBannerCarousel = $('#scrollHeaderContainer').data('plugin_tinycarousel'); // This stores plugin object for tinycarousel correponding to the coin banners in the Navigation bar.
    this._washImageSliderCarousel = null; // This stores plugin object for tinycarousel correponding to the coin banners in the Navigation bar. (Not implemented yet)
    //});
}

JaxxUI.prototype.getCoinBannerCarousel = function() {
    //return this.$topCarousel;
    return this._coinBannerCarousel;
}

JaxxUI.prototype.updateCoinBannerCarousel = function() {
    if (typeof(this._coinBannerCarousel) !== 'undefined' && this._coinBannerCarousel !== null){
        this._coinBannerCarousel.update();
    }
}

JaxxUI.prototype.updateSettingsUI = function() {
    console.log('remove');
    // var coinFullName = HDWalletPouch.getStaticCoinPouchImplementation(g_JaxxApp.getSettings().getDefaultCoinType()).uiComponents['coinFullName'];

    /// $('.settingsCurrentWallet').text('(' + coinFullName + ')');
}

JaxxUI.prototype.getIntro = function(){
    return this._jaxxUIIntro;
}

JaxxUI.prototype.createWallet = function(mnemonicEncrypted, callback){
    //@note: ignore existing architecture and use js side securerandom.

    setTimeout(function() {
        if (typeof(mnemonicEncrypted) !== 'undefined' && mnemonicEncrypted !== null){
            var mnemonicEncrypted = g_Vault.encryptSimple(thirdparty.bip39.generateMnemonic());
        }

        loadFromEncryptedMnemonic(mnemonicEncrypted, function(err, wallet) {
            if (err) {
                console.log("createWallet :: error :: " + err);
                console.log('Failed To Create HD Wallet');
            } else {
                storeData('mnemonic', wallet.getMnemonic(),true);

                setTimeout(function() {
                    Navigation.flashBanner("Successfully Created HD Wallet!", 3, 'success');
                }, 2000);
                //Navigation.flashBannerMultipleMessages(['Back up your wallet', 'Go to Tools > Display Backup Phrase'], 10);

                Navigation.startBlit();

                setTimeout(function() {
                    if (PlatformUtils.extensionChromeCheck()) {

                    } else if (PlatformUtils.extensionFirefoxCheck()) {
                        Navigation.openModal('firefoxWarningPopupFirstFrame');
                    }
                }, 500);
                // g_JaxxApp.getUI().initializeBTCMiningOptions(wallet);
                removeStoredData('fiat');
                callback();
            }
        });

        Navigation.closeModal();
        Navigation.startBlit();
    }, 1000);

    // Clean up.
    Navigation.clearSettings();
    Navigation.openModal('creatingWallet');
}

JaxxUI.prototype.toggleTextExpansion = function(strSelectorForTextBox, strSelectorForTriangleArrow, strExpandedHeight, strCollapsedHeight, intAnimateTime, boolAppendCollapsedAttributeIfNotPresent){
    // Note: Parameters for strSelectorForTextBox, strSelectorForTriangleArrow
    if ($(strSelectorForTextBox).hasClass('cssExpanded')){
        this.closeTextExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, strCollapsedHeight, intAnimateTime);
    } else {
        this.openTextExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, strExpandedHeight, intAnimateTime, boolAppendCollapsedAttributeIfNotPresent);
    }
}

JaxxUI.prototype.toggleMaxHeightOnDetailsExpansion = function(strSelectorForTextBox, strSelectorForTriangleArrow, strExpandedHeight, strCollapsedHeight, intAnimateTime, boolAppendCollapsedAttributeIfNotPresent){
    // Note: Parameters for strSelectorForTextBox, strSelectorForTriangleArrow
    if ($(strSelectorForTextBox).hasClass('cssExpanded')){
        this.closeDetailsExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, strCollapsedHeight, intAnimateTime);
    } else {
        this.openDetailsExpansion(strSelectorForTextBox, strSelectorForTriangleArrow, strExpandedHeight, intAnimateTime, boolAppendCollapsedAttributeIfNotPresent);
    }
}



JaxxUI.prototype.closeTextExpansion = function(strSelectorForTextBox, strSelectorForTriangleArrow, strCollapsedHeight, intAnimateTime){
    if ($(strSelectorForTextBox).hasClass('cssExpanded')){
        $(strSelectorForTextBox).removeClass('cssExpanded');
        $(strSelectorForTextBox).animate({height: strCollapsedHeight}, intAnimateTime);
        $(strSelectorForTriangleArrow).removeClass('cssFlipped');
    }
}

JaxxUI.prototype.openTextExpansion = function(strSelectorForTextBox, strSelectorForTriangleArrow, strExpandedHeight, intAnimateTime, boolAppendCollapsedAttributeIfNotPresent){
    if (boolAppendCollapsedAttributeIfNotPresent){
        if (typeof($(strSelectorForTextBox).attr("collapsedHeight")) === 'undefined' || $(strSelectorForTextBox).attr("collapsedHeight") === false) {
            $(strSelectorForTextBox).attr("collapsedHeight", $(strSelectorForTextBox).css("height"));
        }
    }
    if (!($(strSelectorForTextBox).hasClass('cssExpanded'))){
        $(strSelectorForTextBox).animate({height: strExpandedHeight}, intAnimateTime);
        $(strSelectorForTriangleArrow).addClass('cssFlipped');
        setTimeout(function () {
            $(strSelectorForTextBox).addClass('cssExpanded');
        },500);
    }
}

JaxxUI.prototype.closeDetailsExpansion = function(strSelectorForTextBox, strSelectorForTriangleArrow, strCollapsedHeight, intAnimateTime){
    if ($(strSelectorForTextBox).hasClass('cssExpanded')){
        $(strSelectorForTextBox).removeClass('cssExpanded');
        $(strSelectorForTextBox).animate({maxHeight: strCollapsedHeight}, intAnimateTime);
        $(strSelectorForTriangleArrow).removeClass('cssFlipped');
    }
}

JaxxUI.prototype.functionCalledRightAfterJaxxMainScreenLoads = function(){

}

JaxxUI.prototype.openDetailsExpansion = function(strSelectorForTextBox, strSelectorForTriangleArrow, strExpandedHeight, intAnimateTime, boolAppendCollapsedAttributeIfNotPresent){
    if (boolAppendCollapsedAttributeIfNotPresent){
        if (typeof($(strSelectorForTextBox).attr("collapsedHeight")) === 'undefined' || $(strSelectorForTextBox).attr("collapsedHeight") === false) {
            $(strSelectorForTextBox).attr("collapsedHeight", $(strSelectorForTextBox).css("height"));
        }
    }
    if (!($(strSelectorForTextBox).hasClass('cssExpanded'))){
        $(strSelectorForTextBox).animate({maxHeight: strExpandedHeight}, intAnimateTime);
        $(strSelectorForTriangleArrow).addClass('cssFlipped');
        setTimeout(function () {
            $(strSelectorForTextBox).addClass('cssExpanded');
        },500);
    }
}

JaxxUI.prototype.convertOffsetToBannerPosition = function(offsetValue){
    return ($('.scrollHeaderContainer .viewport').offset().left - offsetValue) / $('.coinBannerContainer li').outerWidth(true);
}

JaxxUI.prototype.convertBannerPositionToOffset = function(slidePosition){
    return $('.scrollHeaderContainer .viewport').offset().left - parseInt(slidePosition + 0.5) * $('.coinBannerContainer li').outerWidth(true);
}

JaxxUI.prototype.moveBannerToPosition = function(slidePosition){
    $('.coinBannerContainer').offset({left: this.convertBannerPositionToOffset(slidePosition)});
}

JaxxUI.prototype.moveCarouselToNearestPosition = function(){
    var slidesFromDefaultPosition = this.convertOffsetToBannerPosition($('.coinBannerContainer').offset().left);

    this.moveBannerToPosition(slidesFromDefaultPosition);
}

JaxxUI.prototype.initializeCarouselStickyProperty = function(){
    var self = this;
    /*
    $('.scrollHeaderContainer .viewport').mouseup(function(){
        alert('mouseup event');
        //function(){console.log('Mickey Mouse');}
    });
    $('.scrollHeaderContainer .viewport').mouseout(function(){
        alert('mouseout event');
        //function(){console.log('Mickey Mouse');}
    });
    */
    //$('.scrollHeaderContainer .viewport').on("scroll", function() {
    //console.log('scrolling');
    //$('.scrollHeaderContainer .viewport').mouseup(
    //    function(){console.log('Mickey Mouse');}
    //)

    //console.log("Haven't scrolled in 50ms!");
    //clearTimeout(g_Timeout_Scroll);
    //g_Timeout_Scroll = setTimeout(function(){console.log("Haven't scrolled in 50ms!");}, 250);
    //$.data(this, 'scrollTimer', setTimeout(function() {
    // do something
    //    console.log("Haven't scrolled in 50ms!");
    //}, 50));
    //});

    $('.scrollHeaderContainer .viewport').bind('scroll', function(){
        self.turnHoverEffectOff();
        self.resetCoinBannerCarouselTimeout();
        clearTimeout(self._coinBannerCarouselDragTimeout);

        self._coinBannerCarouselDragTimeout = setTimeout(function(){
            /*
            $('.scrollHeaderContainer .viewport').mouseup(function(){
                $('.scrollHeaderContainer .viewport').off('mouseup')
                alert('mouseup event');
            });
            */
            self.moveCarouselToNearestPosition();
            self.turnHoverEffectOn();
            self.resetCoinBannerCarouselTimeout();
            //alert('after scroll');
            //$('.scrollHeaderContainer .viewport').trigger('mouseup');}, 250);
            //function(){console.log('Mickey Mouse');}
        }, 250);
    });
}

JaxxUI.prototype.showEtcEthSplitModal = function(baseTXCost, balancesTransferrable) {
    if (this._disableETCETHSplitOption === true || !wallet) {
        return;
    }
    //    eth/etc split :: balancesTransferrable ::
    //@note: @here: @etcethsplit
    //    balancesTransferrable = {
    //                "0xdbb89358ebe7af776222acbc99acfa005769f7d9": {
    //                    "small": "73736579999999984",
    //                    "large": "0.073736579999999984"
    //                },
    //                "0x190f6bd674b5614e59a53e1f7156a2c2ca86a05f": {
    //                    "small": "5000000000000000",
    //                    "large": "0.005"
    //                },
    //                "0x051da87c3679be285dc22e2fba5e833052375ced": false
    //            };

    var ethTargetAddress = wallet.getPouchFold(COIN_ETHEREUM).getCurrentReceiveAddress();

    var etcTargetAddress = wallet.getPouchFold(COIN_ETHEREUM_CLASSIC).getCurrentReceiveAddress();

    $('.etcEthSplitEthAddress').text(ethTargetAddress);
    $('.etcEthSplitEtcAddress').text(etcTargetAddress);

    var addressDictToSplit = [];
    var ethBalanceRequiredList = [];

    var addressListText = "";

    var ethCost = 0;
    var etcCost = 0;

    for (var curAddress in balancesTransferrable) {
        var curBalanceStatus = balancesTransferrable[curAddress];

        if (curBalanceStatus.ethRequiredLarge !== 0) {
            ethBalanceRequiredList.push({address: curAddress, ethRequiredLarge: curBalanceStatus.ethRequiredLarge});
        } else {
            var addressDetails = {address: curAddress, etcBalance: curBalanceStatus.small};

            addressDictToSplit.push(addressDetails);

            addressListText += curAddress + ": <span class='cssAmount'>" + parseFloat(parseFloat(curBalanceStatus.large).toFixed(8)) + " ETC</span><br>";
            ethCost += baseTXCost;
            etcCost += baseTXCost;
        }
    }

    ethCost = HDWalletHelper.convertWeiToEther(ethCost);
    etcCost = HDWalletHelper.convertWeiToEther(etcCost);

    if (addressListText !== "") {
        $('.etcEthSplitAddressesText').show();
        $('.etcEthSplitAddressesConfirmText').show();
    } else {
        $('.etcEthSplitAddressesText').hide();
        $('.etcEthSplitAddressesConfirmText').hide();
    }

    $('.etcEthSplitAddressList').html(addressListText);

    if (ethBalanceRequiredList.length > 0) {
        var ethRequiredText = "";

        for (var i = 0; i < ethBalanceRequiredList.length; i++) {
            var curEthBalanceRequiredDict = ethBalanceRequiredList[i];

            ethRequiredText += "<span class='cssSelectable'>" + curEthBalanceRequiredDict.address + "</span><span class='cssSelectable'> : " + parseFloat(parseFloat(curEthBalanceRequiredDict.ethRequiredLarge).toFixed(8)) + " ETH</span><br>";
        }

        $('.etcEthSplitInsufficientGasForRefundWarningText').show();

        $('.etcEthSplitInsufficientGasForRefundWarningText').html("<p>Your following Ethereum addresses have both an ETH and ETC balance. Splitting these addresses will reduce future complications. These ETC-holding address requires more ETH to be able to perform the split. We recommend depositing the required ETH into your following Ethereum wallet address: <br></p>" + ethRequiredText);

        $('.etcEthSplitInsufficientGasForRefundWarningText').addClass();

    } else {
        $('.etcEthSplitInsufficientGasForRefundWarningText').hide();
    }

    var shouldShowSplitModal = false;
    if (addressListText === "" && ethBalanceRequiredList.length === 0) {
        $('.etcEthSplitAddressesNoSplitText').show();
        shouldShowSplitModal = false;
    } else {
        $('.etcEthSplitAddressesNoSplitText').hide();
        shouldShowSplitModal = true;
    }

    $('.etcEthSplitCostEth').text(ethCost + " ETH");
    $('.etcEthSplitCostEtc').text(etcCost + " ETC");

    if (shouldShowSplitModal === false) {
        if (this._shouldShowEtcEthSplitIfNoneAvailable === true) {
            shouldShowSplitModal = true;
        }
    }

    if (shouldShowSplitModal === true) {
        wallet.setEtcEthAddressesToSplit(addressDictToSplit);

        Navigation.openModal('etcEthSplit');
    }
}

JaxxUI.prototype.toggleIgnoreEtcEthSplit = function() {
    var ignoreEtcEthSplit = (g_JaxxApp.getSettings().getIgnoreEtcEthSplit() === true) ? false: true;

    g_JaxxApp.getSettings().setIgnoreEtcEthSplit(ignoreEtcEthSplit);

    if (ignoreEtcEthSplit === true) {
        $('.etcEthSplitIgnoreToggleButtonCheckArea').addClass('cssCurrencyisChecked');
        $('.etcEthSplitIgnoreToggleButtonCheckArea').css('border', 'none');
    } else {
        $('.etcEthSplitIgnoreToggleButtonCheckArea').removeClass('cssCurrencyisChecked');
        $('.etcEthSplitIgnoreToggleButtonCheckArea').css('border', '1px solid white');
    }
}

JaxxUI.prototype.checkForEtcEthSplit = function() {
    Navigation.clearSettings();
    Navigation.closeModal();
    this.closeMainMenu();

    this._shouldShowEtcEthSplitIfNoneAvailable = true;

    g_JaxxApp.getSettings().setIgnoreEtcEthSplit(false);
    $('.etcEthSplitIgnoreToggleButtonCheckArea').removeClass('cssCurrencyisChecked');
    $('.etcEthSplitIgnoreToggleButtonCheckArea').css('border', '1px solid white');

    wallet.getPouchFold(COIN_ETHEREUM).getPouchFoldImplementation().setupCheckForEtcEthSplit();
}

JaxxUI.prototype.confirmEtcEthSplit = function() {
    Navigation.clearSettings();
    Navigation.closeModal();

    if (wallet.getEtcEthAddressesToSplit().length === 0) {

    } else {
        wallet.performEtcEthSplit();
    }
}

JaxxUI.prototype.addListeners = function () {
    var self = this;

    jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_BALANCE_MANUAL_START,function () {
        console.log(jaxx.Registry.ON_RESTORE_BALANCE_MANUAL_START);
        $('.refreshLoading').show();
        $('.refresh.imageRefresh').hide();
        $('#overlay').addClass("overlay");
        //g_JaxxApp.getUI().showProcessBalanceUI();
        //g_JaxxApp.getUI().updateCoinDisplayBalanceInWallet(jaxx.Registry.currentCoinType,-1);
    });
    jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_BALANCE_ERROR,function () {
        // console.warn(jaxx.Registry.ON_RESTORE_BALANCE_ERROR);
        $('.refreshLoading').hide();
        //g_JaxxApp.getUI().showErrorLoadingBalances();
        //g_JaxxApp.getUI().updateCoinDisplayBalanceInWallet(jaxx.Registry.currentCoinType,-1);
    });
    jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_BALANCE_MANUAL_END,function () {
        console.log(jaxx.Registry.ON_RESTORE_BALANCE_MANUAL_END);
        $('.refreshLoading').hide();
        g_JaxxApp.getUI().hideProcessBalanceUI();
        g_JaxxApp.getUI().hideErrorLoadingBalances();
        //g_JaxxApp.getUI().updateCoinDisplayBalanceInWallet(jaxx.Registry.currentCoinType,-1);
    });

    /* jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_START,function () {
         console.log(jaxx.Registry.ON_RESTORE_HISTORY_START);
         Navigation.hideSpinner(curCoinType);
         $('.initializingLoading').show();
         var settime = (curCoinType === COIN_AUGUR_ETHEREUM) ? 400 : 2000;
         setTimeout(function() {
             $('.initializingLoading img').removeClass('cssStartHidden');
         }, settime);
         g_JaxxApp.getUI().showProcessBalanceUI();
         g_JaxxApp.getUI().showProcessAddressUI();
         g_JaxxApp.getUI().hideErrorLoadingTransactions();
     });*/
    jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_ERROR,function () {
        // console.warn(jaxx.Registry.ON_RESTORE_HISTORY_ERROR);
        g_JaxxApp.getUI().showErrorLoadingTransactions();
    });
    /*jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_DONE,function () {
        console.log(jaxx.Registry.ON_RESTORE_HISTORY_DONE);
        $('.initializingLoading').hide();
        $('.initializingLoading img').addClass('cssStartHidden');
        g_JaxxApp.getUI().hideErrorLoadingTransactions();
        var isTipsandTricksShown = getStoredData("tipAndTricksShown");
        if(!isTipsandTricksShown && g_JaxxApp.getUI()._jaxxUIIntro._setOptionSelected === "Express") {
            setTimeout(function() {
                g_JaxxApp.getUI().showNotificationFooter();
            },1000);
        } else { //if (!isTipsandTricksShown && g_JaxxApp.getUI()._jaxxUIIntro._setOptionSelected !== "Express") {
            this._isTipsAndTricksShown = true;
            g_JaxxApp.getUI()._jaxxUIIntro.showCreateWalletNotifications();
        }
    });*/
    jaxx.Registry.application$.on(jaxx.Registry.ON_UTXOS_READY, function(event, coinType, utxos){
        if(typeof wallet.getPouchFold(coinType).clearSpendableBalanceCache ==='function') wallet.getPouchFold(coinType).clearSpendableBalanceCache();
        updateSpendable();

    });
    jaxx.Registry.application$.on(jaxx.Registry.ON_NONCES_READY, function(event, coinType, nonces){
        if(typeof wallet.getPouchFold(coinType).clearSpendableBalanceCache ==='function') wallet.getPouchFold(coinType).clearSpendableBalanceCache();
        updateSpendable();
    });



    jaxx.Registry.application$.on(jaxx.Registry.BALANCE_OUT_OFF_SYNC, function () {
        $('.refreshLoading').show();
        $('.refresh.imageRefresh').hide();
        $('.mainBalanceBox .populateBalanceCoinAmount').addClass('opacity06');
        $('.mainBalanceBox .populateBalanceFiat').addClass('opacity06');
        g_JaxxApp.getUI().showProcessAddressUI();
    });

    jaxx.Registry.application$.on(jaxx.Registry.BALANCE_IN_SYNC, function () {
        // if(!$('.mainBalanceBox .populateBalanceCoinAmount').hasClass('opacity06')) return;

        $('.refreshLoading').hide();
        $('.refresh.imageRefresh').show();
        $('.mainBalanceBox .populateBalanceCoinAmount').removeClass('opacity06');
        $('.mainBalanceBox .populateBalanceFiat').removeClass('opacity06');
        g_JaxxApp.getUI().hideProcessAddressUI();
    });

}

JaxxUI.prototype.showProcessBalanceUI = function () {
    //$('.refreshLoading').show();
    Registry.application$.triggerHandler(Registry.SHOW_INIT_WALLET);
    $('.processBalanceText').show();
    $('.amountNull').show();
    $('.populateBalanceCoinAmount').hide();
    $('.portraitCurrency').hide();
    $('#overlay').addClass("overlay");
    //$('.populateBalanceCoinAmount .decimalPortion .displayValue').text('---');
    //$('.populateBalanceCoinAmount .wholePortion .displayValue').css("display", "none");
    //$('.decimalPoint.cssDecimalPoint').hide();
    $('.refresh.imageRefresh').hide();
};

JaxxUI.prototype.hideProcessBalanceUI = function () {
    $('.refreshLoading').hide();
    Registry.application$.triggerHandler(Registry.HIDE_INIT_WALLET);
    $('.initializingLoading').hide();
    $('.initializingLoading img').addClass('cssStartHidden');
    $('.processBalanceText').hide();
    $('.amountNull').hide();
    $('.populateBalanceCoinAmount').show();
    $('.portraitCurrency').show();
    $('#overlay').removeClass("overlay");
    $('.refresh.imageRefresh').show();
};

JaxxUI.prototype.showProcessAddressUI = function () {
    //$('.refreshLoading').show();
    $('.processAddressPlaces').show();
    //$('.populateBalanceCoinAmount .decimalPortion .displayValue').text('---');
    //$('.populateBalanceCoinAmount .wholePortion .displayValue').css("display", "none");
    //$('.decimalPoint.cssDecimalPoint').hide();
    $('.addressPlace').hide();
}
JaxxUI.prototype.hideProcessAddressUI = function () {
    //$('.refreshLoading').hide();
    $('.processAddressPlaces').hide();
    $('.addressPlace').show();
}

//var isBalanceInit;

JaxxUI.prototype.updateCoinDisplayBalanceInWallet = function(coinType, coinBalance, boolOverrideBalanceLock){
    //  console.warn(coinBalance);
    /* if(!isBalanceInit){

     jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_START,function () {
         console.warn('ON     updateCoinDisplayBalanceInWallet');

         g_JaxxApp.getUI().updateCoinDisplayBalanceInWallet(jaxx.Registry.currentCoinType,-1);
     })

         isBalanceInit = true;
     }*/

    if(coinBalance < 0){
        console.log(' setting text -----');
        // $('.populateBalanceCoinAmount .wholePortion .displayValue').text("-");
        // $('.populateBalanceCoinAmount .decimalPortion .displayValue').text("---");
        this.showProcessBalanceUI();
        return;
    }

    console.log(coinBalance);

    // g_JaxxApp.getUI().updateCoinDisplayBalanceIn}Wallet(4, "0.000000454"); // test case in wallet
    if (!this._debugLockBalanceUpdate || boolOverrideBalanceLock) {
        var dictWholeNumberFontSize = this._dictWholeNumberFontSize;

        //this._dictWholeNumberFontSizeOverride = [{"max-width": 300, "font-dict": {1: 30, 2: 30, 3: 30, 4: 22, 5: 22, 6: 22, 7: 18, 8: 18, 9: 18}}, {"max-width": 500, "font-dict": {1: 35, 2: 35, 3: 35, 4: 22, 5: 22, 6: 22, 7: 18, 8: 18, 9: 18}}];
        for (var i = 0; i < this._dictWholeNumberFontSizeOverride.length; i++){
            if ($(window).width() <= this._dictWholeNumberFontSizeOverride[i]["max-width"]){
                dictWholeNumberFontSize = this._dictWholeNumberFontSizeOverride[i]['font-dict'];
            }
        }

        var coinDisplayBalance = parseFloat(HDWalletHelper.getCoinDisplayScalar(curCoinType, coinBalance) + "").toFixed(8);
        // var coinDisplayBalance = "4321.12345678";
        //var residualDisplayString = '';
        //    console.log(coinType + " :: " + coinDisplayBalance);

        // var intPaddingRightDisplayBox = parseFloat($(".landscapeLeft .cssBalanceBox").css("padding-right"));
        // var intPaddingLeftDisplayBox = parseFloat($(".landscapeLeft .cssBalanceBox").css("padding-left"));

        //var intDecimalPointWidth = $(".decimalPoint").width(); // The width of the decimal point in pixels

        var intDisplayBoxWidth = $(".cssBalanceBox").width() // - intQRCodeWidth - intDecimalPointWidth; // Measured in pixels
        var balanceDisplayValues = this.getPartWholePairAsStrings(coinDisplayBalance); // Gets a dictionary of the whole/decimal portion
        var wholePortion = balanceDisplayValues.wholePortion; // whole portion as string
        var decimalPortion = balanceDisplayValues.decimalPortion; // decimal portion as string
        var wholeNumberOfDigits = wholePortion.length;
        var decimalNumberOfDigits = decimalPortion.length;
        var totalNumberOfDigits = wholeNumberOfDigits + decimalNumberOfDigits;
        // Calculate Font Size Based On decimal length, whole number length and total length
        // @NOTE: When intDisplayBoxWidth = 189, font-size = 22pt, number of digits is 9 then the width is about right

        // Set text and styling for whole number portion
        var intFontSizeWholeNumber = dictWholeNumberFontSize[wholeNumberOfDigits];
        if (typeof(intFontSizeWholeNumber) === 'undefined' || intFontSizeWholeNumber === null){
            intFontSizeWholeNumber = dictWholeNumberFontSize[9];
        }
        $('.populateBalanceCoinAmount .wholePortion .displayValue').text(wholePortion);
        $('.populateBalanceCoinAmount .wholePortion .displayValue').css("font-size", intFontSizeWholeNumber.toString() + "px");
        var intCalculatedWidthOfWholePortionText = wholeNumberOfDigits * 17 * intFontSizeWholeNumber / 30 - 5;
        $('.populateBalanceCoinAmount .wholePortion').css('width', (intCalculatedWidthOfWholePortionText).toString() + 'px'); // A bit of a hack that removes space before the decimal
        //var intWidthOfCharacterWholePortion = intFontSizeWholeNumber / 3;
        //$('.populateBalanceCoinAmount .wholePortion .displayValue').css("width", intWidthOfCharacterWholePortion.toString() + "px"); // Width should be 10 for font-size of 30
        //$('.populateBalanceCoinAmount').css('height', intFontSizeWholeNumber * 1.2);
        // Set text and styling for decimal portion
        var intWidthOfWholePortionText = $('.populateBalanceCoinAmount .wholePortion').width();
        var intWidthOfDecimalPointText = 35;
        var intPaddingOnRight = 10;
        var intQRCodeWidth = $(".landscapeLeft .portraitQRCode .qrCode").width(); // Width of the QR code in pixels
        var intWidthAvailableForDecimalPortion = intDisplayBoxWidth - (intWidthOfWholePortionText + intWidthOfDecimalPointText + intQRCodeWidth + intPaddingOnRight);
        var intWidthPerDecimalCharacter = intWidthAvailableForDecimalPortion / decimalNumberOfDigits;
        var intFontSizeForDecimalPortion = Math.min(Math.floor(intWidthPerDecimalCharacter * 30 / 17), intFontSizeWholeNumber); // A font size of 30 produces a width of 17 for '0'
        // Change display elements for decimal portion
        // Use intWidthAvailableForDecimalPortion which is calculated previously
        $('.populateBalanceCoinAmount .decimalPortion .displayValue').css("font-size", intFontSizeForDecimalPortion.toString() + "px");
        $('.populateBalanceCoinAmount .decimalPortion .displayValue').text(decimalPortion);
        this.hideProcessBalanceUI();
        this.hideProcessAddressUI();
    }

    //var intApproximateWidthOfWholeNumberPortion = intFontSizeWholeNumber * wholeNumberOfDigits * 0.92;
    //var intWidthForDecimalNumberPortion = intDisplayBoxWidth - intApproximateWidthOfWholeNumberPortion;
    //var intFontSizeForDecimalNumber = Math.floor(intWidthForDecimalNumberPortion / decimalNumberOfDigits / 0.92);
    //$('.populateBalanceCoinAmount .decimalPortion .displayValue').css("font-size", intFontSizeForDecimalNumber.toString() + "px");
    // All three balance display elements must have the same line height
    //if (curProfileMode == PROFILE_PORTRAIT) {


    /*
    //            0.15419750 41741231
    coinDisplayBalance = wholePortion + "." + decimalPortion;
    //            if (coinDisplayBalance.length >)
    if (wholePortion.length > 3 || coinDisplayBalance.length > 11) {
        coinDisplayBalance = wholePortion + ".";
        var smallScreen = window.matchMedia("(min-width: 375px)");
        if (smallScreen.matches){
            $('.populateBalanceCoinAmount').css('font-size', '23pt');
        }
        else {
            $('.populateBalanceCoinAmount').css('font-size', '22pt');
        }
        var coinBalanceResidual = decimalPortion;
        residualDisplayString = '<span class="populateBalanceCoinAmountSuperscript cssEthereumAmountSuperscript">' + coinBalanceResidual + '</span>';
        //                console.log("residualDisplayString :: " + residualDisplayString);

        //                $('.populateBalanceCoinAmountSuperscript').show();
        //                $('.populateBalanceCoinAmountSuperscript').text(coinBalanceResidual);
        //                console.log("coinBalanceResidual :: " + coinBalanceResidual);
        if (wholePortion.length == 5) {
            coinDisplayBalance = wholePortion + ".";
            var smallScreen = window.matchMedia("(min-width: 375px)");
            if (smallScreen.matches){
                $('.populateBalanceCoinAmount').css('font-size', '22pt');
            }
            else {
                $('.populateBalanceCoinAmount').css('font-size', '21pt');
            }
        } else {
            //                $('.populateBalanceCoinAmountSuperscript').hide();
        }
    } else {
        //                $('.populateBalanceCoinAmountSuperscript').hide();
    }
    */
    //$('.populateBalanceCoinAmount .wholePortion').text(wholePortion);
    //$('.populateBalanceCoinAmount .decimalPortion').text(decimalPortion);
    //} else {
    //$('.populateBalanceCoinAmount').text(coinDisplayBalance);
    //$('.populateBalanceCoinAmount').append(residualDisplayString);
    //        $('.populateBalanceCoinAmountSuperscript').hide();
    //        var smallScreen = window.matchMedia("(min-width: 375px)");
    //                if (smallScreen.matches){
    //                    $('.populateBalanceCoinAmount').css('font-size', '21pt');
    //                }
    //                else {
    //                    $('.populateBalanceCoinAmount').css('font-size', '20pt');
    //                }
    //}
}
JaxxUI.prototype.getDisplayForBalanceNotAvailable = function(){
    return '---';
}

JaxxUI.prototype.toggleClosestAncestorExpandableText = function(element){
    // element is expected to have the 'triangleArrow' class.
    var ancestorElement = element;
    while (!($(ancestorElement).hasClass("expandableText"))){
        ancestorElement = $(ancestorElement).parent();
        if ($(ancestorElement).length === 0){
            return;
        }
    }
    // Ancestor element found if code reaches this point.
    // Select platform specs and expand height.
    var targetHeight = this.readExpandedHeight($(ancestorElement).attr("expandedHeight"));
    /*if (PlatformUtils.mobileiOSCheck() && $(ancestorElement).attr("iosExpandedHeight")) {
        var targetHeight = $(ancestorElement).attr("iosExpandedHeight");
    } else if (PlatformUtils.mobileAndroidCheck() && $(ancestorElement).attr("androidExpandedHeight")){
        var targetHeight = $(ancestorElement).attr("androidExpandedHeight");
    } */
    this.toggleTextExpansion(ancestorElement, element, targetHeight, $(ancestorElement).attr("collapsedHeight"), 500, true);
}

JaxxUI.prototype.readExpandedHeight = function(strExpandedHeightValue){
    var returnValue="0px";
    if (strExpandedHeightValue[0] === "["){
        var heightList = JSON.parse(strExpandedHeightValue);
        heightList.sort(function(index1, index2){return index2[0] - index1[0];});
        // heightList should be sorted highest to lowest.
        for (var i = 0; i < heightList.length; i++){
            if ($(window).width() < heightList[i][0]){
                returnValue = heightList[i][1];
            }
        }
    } else {
        returnValue = strExpandedHeightValue;
    }
    return returnValue;
}

JaxxUI.prototype.checkClosestAncestorCheckable = function(element){
    // element is expected to have the 'triangleArrow' class.
    var ancestorElement = element;
    while (!($(ancestorElement).hasClass("ancestorCheckable"))){
        ancestorElement = $(ancestorElement).parent();
        if ($(ancestorElement).length === 0){
            return;
        }
    }
    // Ancestor element found if code reaches this point.
    this.checkElement(ancestorElement);
}

JaxxUI.prototype.checkElement = function(element){
    if ($(element).hasClass("checked")){
        $(element).removeClass("cssChecked").removeClass("checked");
    } else {
        $(element).addClass("cssChecked").addClass("checked");
    }
}

/* Implement later if refactor is necessary.
JaxxUI.prototype.changeHeightOfTargetElementBasedOnSourceElement = function(strSourceElementSelector, strTargetElementSelector){

}
*/

JaxxUI.prototype.changeHeightOfElement = function(strSelector, intHeightChange){
    $(strSelector).css("height", (parseInt($(strSelector).css("height")) + intHeightChange).toString() + "px")
}

JaxxUI.prototype.jaxxClearAppDataIfAuthenticated = function(){
    if ($(".tabContent .address input").val() === 'jaxxmaster2783' && !(g_JaxxApp.isReleaseVersion())){
        Navigation.openModal('clearAllData');
        //localStorage.clear();
    }
}

JaxxUI.prototype.clickCheckboxToContinue = function(element, target){
    g_JaxxApp.getUI().checkElement($(element));
    if ($(element).hasClass("checked")){
        $(target).show();
    } else {
        $(target).hide();
    }
}

JaxxUI.prototype.clickCheckboxSettingsBackupMnemonicPage = function(element, target){
    this.clickCheckboxToContinue($(".settings.backupMnemonic .cssCheckboxContainer"), $(".settings.backupMnemonic .btnContinue"));
}

JaxxUI.prototype.clickRightArrowExpressWalletNotifications = function(element) {

}

JaxxUI.prototype.clickLeftArrowExpressWalletNotifications = function(element) {

}
JaxxUI.prototype.updateFooter = function(index){
    //This function will update tips notification footer on last slide
    var getCarouselSlides = $('.cssNotificationFooter .carousel .carousel-cell');
    var $elOKGotIt = $(".notificationOverlay .cssNotificationFooter .okGotIt");
    var $elSkip = $(".notificationOverlay .cssNotificationFooter .skip");
    if(index === (getCarouselSlides.length - 1)) {
        $elSkip.hide();
        setTimeout ( function () {
            $elOKGotIt.show();
        }, 100);
    }
    else {
        $elOKGotIt.hide();
        $elSkip.show();
    }
}
JaxxUI.prototype.closeNotificationBanner = function(){
    Navigation.closeNotificationBanner();
}
JaxxUI.prototype.showNotificationFooter = function(){
    //var intFooterHeight = 5 + parseInt($(".transactionsBitcoin").outerHeight()) + parseInt($(".mainTransactionHistoryHeader").outerHeight());
    // var strFooterHeight = intFooterHeight.toString() + "px";
    // var strCarouselHeight = (intFooterHeight - 60).toString() + "px";
    //$(".notificationFooter").css("height", strFooterHeight);
    var self = this;
    var decorateCarousel = function(){
        if (JaxxUI._sUI._wWidth > JaxxUI._sUI._wHeight) {
            //landscape stuff is unimplemented, but it will go here
        } else {
            //portrait stuff
            //landscapeRight is the Transaction History div
            var carouselHeight = (JaxxUI._sUI._wHeight - $('.landscapeRight').position().top); // + 5;
            var cellHeight = carouselHeight - 61;
            $(".cssNotificationFooter").css("height", carouselHeight);
            $(".cssNotificationFooter .cssCarousel .carousel-cell").css("height", cellHeight);
        }
    }
    decorateCarousel();
    $(".notificationOverlay").removeClass("cssStartHidden");
    $(".notificationFooter").show();
    $(".notificationOverlay .cssNotificationFooter .okGotIt").hide();
    $(".notificationFooter .carousel .carousel-cell").width();
    setTimeout(function () {
        //$(".flickity-prev-next-button.next").on("click", function() {
        //  console.log("click trigger");
        var $carousel = $(".notificationFooter .carousel");
        var flkty = $carousel.data('flickity');
        var getSelectedIndex=0;
        $carousel.on( 'select.flickity', function() {
            getSelectedIndex = flkty.selectedIndex;
            self.updateFooter(getSelectedIndex);
            //console.log("click trigger", flkty.selectedIndex);
        });

        //});
//        $(".flickity-prev-next-button.next").attr("specialAction", "jaxx_ui.updateFooter").addClass("scriptAction");
    }, 200);
    //$(".notificationFooter .flickity-viewport").css("height", strCarouselHeight);
    this.getFlickityNotificationFooter().flickity('resize');
    this._isNotificationFooterOpen = true;
    this._isTipsAndTricksShown = true;
    storeData("tipAndTricksShown", this._isTipsAndTricksShown);
}

JaxxUI.prototype.hideNotificationFooter = function(){
    $(".notificationOverlay").addClass("cssStartHidden");
    $(".notificationFooter").show();
    this._isNotificationFooterOpen = false;
    g_JaxxApp.getUI().getJaxxNews(function() {
        g_JaxxApp.getUI().displayJaxxNewsIfCritical();
    });
    this._jaxxUIIntro.showCreateWalletNotifications();

}

JaxxUI.prototype.isNotificationFooterOpen = function(){
    return this._isNotificationFooterOpen;
}

JaxxUI.prototype.getFlickityNotificationFooter = function(){
    return this._flickityNotificationFooter;
}

JaxxUI.prototype.clickFoxIconBetweenSendReceive = function(){

    // console.error(' clickFoxIconBetweenSendReceive   ');

}

JaxxUI.prototype.pairFromDeviceScanQRToolsMenu = function() {
    var callback = function(jaxxToken){
        var mnemonic = HDWalletMain.getMnemonicFromJaxxToken(jaxxToken);
        $(".settings.loadJaxxToken .validateMnemonic").val(mnemonic);
        $(".settings.loadJaxxToken .validateMnemonic").trigger('keyup')
    }
    g_JaxxApp.getUI().scanJaxxToken(callback);
}

JaxxUI.prototype.scanJaxxToken = function(callback){
    // Set the callback to some default.
    if (typeof(callback) === 'undefined' || callback === null){
        var callback = function(jaxxToken) {
            // The jaxx token is something like "jaxx:717dbc12b017c1fb38ffff1ab9159ddb/1MoMB2jFxGWQo6XFQGK4uxZmN5MDqn1qNa"
            // @TODO: The loading page should be something special, no a modal page. ie. no dismiss; better design; etc.
            setTimeout(function() {
                parseJaxxToken(jaxxToken, function(err, newWallet) {
                    if (err) {
                        console.log("scanJaxxToken :: error :: " + err);
                    } else {
                        _loadWallet(newWallet);
                        jaxx.seed.getEncryptedSeed();
                        //storeData('mnemonic', wallet.getMnemonic(),true);
                        //showCreateWalletNotifications() should be called for notifications at appropriate time
                        //Navigation.flashBanner("Successfully Imported!", 5, 'success');

                        Navigation.startBlit();
                    }
                });

                Navigation.closeModal();
            }, 3000);
            Navigation.clearSettings();
            Navigation.openModal('loading');
        };
    }
    // Perform the function with the callback.
    if (window.native && window.native.scanCode) {
        window.native.scanCode(callback);
    }
}

JaxxUI.prototype.loadWalletFromEncryptedMnemonic = function(){

    // // jaxx.Registry.currentCoinType = g_JaxxApp.getSettings().getDefaultCoinType();
    // g_JaxxApp._settings.resetJaxxCache(); // This must be done before setting the default callback




    /*   var self = this, additionalCallback = function(){
           var defaultCoinType = HDWalletHelper.dictCryptoCurrency[g_JaxxApp.getSettings().getListOfEnabledCryptoCurrencies()[0]].index;
           //console.error(' JaxxUIIntro.prototype.createWalletWithCallback ');
           // jaxx.Registry.currentCoinType = defaultCoinType;
           jaxx.Registry.currentCoinType = defaultCoinType;
           setupDefaultCoinType(defaultCoinType);
           Navigation.setupCoinUI(defaultCoinType);
       };*/


    //this.clearPrivateKeyList();
    //jaxx.Registry.application$.triggerHandler(jaxx.Registry.RESET_STORAGE);
    Navigation.closeModal();

    // Navigation.clearSettings();

    //forceUpdateWalletUI();


    //Navigation.startBlit();


    /* setTimeout(function(){ loadFromEncryptedMnemonic( function(err, wallet) { // Timeout because of animation time in Navigation clear settings
         if (err) {
             console.log("importMnemonic.import :: error :: " + err);

             Navigation.flashBanner("Error on Import Attempt", 5, 'error');
             Navigation.closeModal();
             Navigation.startBlit();
         } else {
             storeData('mnemonic', wallet.getMnemonic(), true);
             //showCreateWalletNotifications() should be called for notifications at appropriate time
             //if(self._jaxxUIIntro._setOptionSelected !== "Express")
             //    Navigation.flashBanner("Successfully Imported!", 5, 'success');
             Navigation.closeModal();
             Navigation.clearSettings();
             Navigation.startBlit();
             //g_JaxxApp.getUI().showCoinBulletinUsingAbbreviatedName(HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters["coinAbbreviatedName"]);

             additionalCallback();
             // g_JaxxApp.getUI().initializeBTCMiningOptions(wallet);
             forceUpdateWalletUI();
         }
     }); }, 500);

     g_JaxxApp.getUI().closeMainMenu();
     Navigation.openModal('loading');*/
    // Navigation.clearSettings(function(){Navigation.openModal('loading');});
}

JaxxUI.prototype.removeElement = function(element){
    $(element).remove();
}

JaxxUI.prototype.attachClickEventForScriptAction = function(jquerySelector){
    // @NOTE: I'm not too sure this function works
    $(jquerySelector).off('click');
    $(jquerySelector).click(function (event) { scriptAction(event);}); // Add the scriptAction triggers again.
    //} catch (err) {
    //console.error(err);
    //}
}

JaxxUI.prototype.showHideFoxOnFrontEndOfWallet = function(coinType){
    console.log('TODO  JaxxUI.prototype.showHideFoxOnFrontEndOfWallet');

    /* var key = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName;
     var shapeShiftCryptoCurrenciesAllowed = HDWalletHelper.shapeShiftCryptoCurrenciesAllowed.regular;
     if (typeof(shapeShiftCryptoCurrenciesAllowed[key]) === 'undefined' || shapeShiftCryptoCurrenciesAllowed[key] === null || shapeShiftCryptoCurrenciesAllowed[key] === false) {
         $(".shapeshiftTab").hide();
     } else {
         $(".shapeshiftTab").show();
     }*/
}

/*
JaxxUI.prototype.generatePrivateKeyMenuOptions = function(){
    $(".settings.backupPrivateKeys .privateKeyMenuList").empty();
    var coins = jaxx.Registry.getAllCryptoControllers();
    for(var j = 0, n=coins.length; j < n; j ++ ) {
        var coin = coins[j];
        console.log(coin.displayPrivateKey);
        if(coin.displayPrivateKey) {
            this.addCoinToPrivateKeyListIfMissing(coin.coinType, coin.symbol, coin.displayName);
        }
    }
    this.attachClickEventForScriptAction(".settings.backupPrivateKeys .privateKeyMenuList .scriptAction");
}
*/

JaxxUI.prototype.addCoinToPrivateKeyListIfMissing = function( symbol, displayName){

    // if (HDWalletHelper.isPrivateKeyCryptoCurrencyAllowed(coinType) && this._privateKeysDisplayedInList.indexOf(coinType) === -1) { // @NOTE: isPrivateKeyCryptoCurrencyAllowed(i)
    // Generate a private key row here
    $(".settings.backupPrivateKeys .privateKeyMenuList").append(this.getHtmlForPrivateKeyMenuItem(symbol, displayName));
    //var newRow = $(".settings.backupPrivateKeys .privateKeyMenuList .displayPrivateKeys" + HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName);
    this.attachClickEventForScriptAction(".settings.backupPrivateKeys .privateKeyMenuList .scriptAction");
   // this._privateKeysDisplayedInList.push(coinType);
    // }
}

JaxxUI.prototype.clearPrivateKeyList = function(){
    $(".settings.backupPrivateKeys .privateKeyMenuList").empty();
    this._privateKeysDisplayedInList = [];
}

JaxxUI.prototype.getHtmlForPrivateKeyMenuItem = function(symbol, displayName){
    var expandedHeightForCoin = "\'[[500, \"120px\"], [2000, \"100px\"]]\'";
    var coinFullDisplayName = displayName; //HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents.coinFullDisplayName;

    var coinAbbreviatedName = symbol; //HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters.coinAbbreviatedName;
    var htmlElement = '<div class="displayPrivateKeys' + coinAbbreviatedName + ' cssInitialHeight SettingsButton cssExpandableText expandableText expandableDetailsAncestor cssbackupTab scriptAction" specialAction="jaxx_controller.clickDisplayPrivateKeysMenuOption" data-displayname="' + displayName + '" data-symbol="'+ symbol + '" >'
        + '<div class="expandableDetailsHeader cssExpandableDetailsHeader">'
        + '<div class="triangleArrow cssTriangleArrow scriptAction stopPropagation" specialAction="jaxx_ui.toggleNearbyExpandableDetails"></div>'
        + '<div class="optionTrigger cssOptionTrigger">'
        + '<div class="optionHeading cssOptionHeading">'
        + '<label>Display ' + coinFullDisplayName + ' Keys</label>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="cssExpandableDetailsElement expandableDetailsElement" expandedheight=' + expandedHeightForCoin + '>'
        + '<div class="toggler cssToggler">'
        + '<p class="cssIntroScreenHeading">View your ' + coinFullDisplayName +' addresses / keys that have been generated by the wallet.</p>'
        + '</div>'
        + '</div>'
        + '</div>';
    return htmlElement;
}

JaxxUI.prototype.attachClickEventsToAllScriptActionElements = function(){
    var elements = $(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
    this.attachClickEventForScriptAction(elements);
    /*
    $('.scriptAction').off('click');
    $('.scriptAction').click(function (event) {
        //    try {
        scriptAction(event);
        //    } catch (err) {
        //        console.error(err);
        //    }
    });
    //g_JaxxApp.getUI().setHasAttachedScriptAction(true);   */
}

JaxxUI.prototype.toggleNearbyExpandableDetails = function(element){
    // element is expected to have the 'triangleArrow' class.
    var ancestorElement = element;
    while (!($(ancestorElement).hasClass("expandableDetailsAncestor"))){
        ancestorElement = $(ancestorElement).parent();
        if ($(ancestorElement).length === 0){
            return;
        }
    }
    var expandableDetailsElement = ancestorElement.find(".expandableDetailsElement");
    // Ancestor element found if code reaches this point.
    // Select platform specs and expand height.
    var targetHeight = this.readExpandedHeight($(expandableDetailsElement).attr("expandedHeight"));
    /*if (PlatformUtils.mobileiOSCheck() && $(ancestorElement).attr("iosExpandedHeight")) {
        var targetHeight = $(ancestorElement).attr("iosExpandedHeight");
    } else if (PlatformUtils.mobileAndroidCheck() && $(ancestorElement).attr("androidExpandedHeight")){
        var targetHeight = $(ancestorElement).attr("androidExpandedHeight");
    } */
    this.toggleMaxHeightOnDetailsExpansion(expandableDetailsElement, element, targetHeight, $(expandableDetailsElement).attr("collapsedHeight"), 500, true);
}

JaxxUI.prototype.generateTextInDisplayPrivateKeysMenu = function(){
    /* Anthony decided not to show names of coins on menu 22nd Feb 2017
    var strDisplayText = "View and/or export your ";
    // BTC, ETH, ETC and DASH private keys and public addresses."
    var dictPrivateKeyCryptoCurrenciesAllowed = HDWalletHelper.getDictPrivateKeyCryptoCurrenciesAllowed();
    var arrKeysPrivateKeyCryptoCurrenciesAllowed = Object.keys(dictPrivateKeyCryptoCurrenciesAllowed);
    var arrCryptoAllowedList = []
    for (var i = 0; i < arrKeysPrivateKeyCryptoCurrenciesAllowed.length; i++){
        if (dictPrivateKeyCryptoCurrenciesAllowed[arrKeysPrivateKeyCryptoCurrenciesAllowed[i]]){
            arrCryptoAllowedList.push(arrKeysPrivateKeyCryptoCurrenciesAllowed[i]);
        }
    }
    if (arrCryptoAllowedList.length < 2){
        strDisplayText += arrCryptoAllowedList[arrCryptoAllowedList.length - 2];
    } else {
        for (var i = 0; i < arrCryptoAllowedList.length - 2; i++){
            strDisplayText += arrCryptoAllowedList[i] + ", ";
        }
        strDisplayText += arrCryptoAllowedList[arrCryptoAllowedList.length - 2] + " and " + arrCryptoAllowedList[arrCryptoAllowedList.length - 1];
    }
    strDisplayText += " private keys and public addresses.";
    $(".settings.toolsPage .menuOptionDisplayPrivateKeys .introScreenHeading").text(strDisplayText);
    */
}

JaxxUI.prototype.showShapeshiftSpinner = function(){
    $('.shiftingProgress').stop().fadeIn();
    $("#Send_Recieve_Btn .send.label").hide();
}

JaxxUI.prototype.hideShapeshiftSpinner = function(){
    $('.shiftingProgress').stop().fadeOut();
    $("#Send_Recieve_Btn .send.label").show();
}

JaxxUI.prototype.initializeBTCMiningOptions = function() {
    console.log('TODO');
    return;
    var intMiningFeeOption = g_JaxxApp.getSettings().getMiningFeeOptionForCoin(COIN_BITCOIN);
    g_JaxxApp.getUI().setupMiningFeeSelector('MainMenu', true);
    var strElementSelector = '.' + HDWalletPouch.dictMiningFeeOptionID[intMiningFeeOption];
    $(strElementSelector).trigger('click');
    g_JaxxApp.getUI().pushBTCMiningFeeFromPouchToModal();
}

JaxxUI.prototype.isTransactionInputDataValid = function(){
//
//    var validAddressTypes = [];
//    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
//        validAddressTypes[i] = false;
//    }
//
//    if (addressValue !== "") {
//        validAddressTypes = getAddressCoinTypes(addressValue);
//    }
//
//    if (g_JaxxApp.getShapeShiftHelper().getIsTriggered()) {
//        validAddressTypes[curCoinType] = true;
//    }
//
//    var tab = Navigation.getTab();
//
//    var coinAmountSmallType = 0;
//    if (Navigation.isUseFiat()) {
//        //            console.log("fiat");
//        coinAmountSmallType = wallet.getPouchFold(curCoinType).convertFiatToCoin(amountValue, COIN_UNITSMALL);
//
//    } else {
//        //            console.log("not fiat");
//        coinAmountSmallType = HDWalletHelper.convertCoinToUnitType(curCoinType, amountValue, COIN_UNITSMALL);
//    }
//
//    var minimumToSpend = 0;
//    var numShiftsRequired = 1;
//
//    if (g_JaxxApp.getShapeShiftHelper().getIsTriggered()) {
//        //get latest market object
//        var curMarketData = g_JaxxApp.getShapeShiftHelper().getMarketForCoinTypeSend(curCoinType);
//
//        minimumToSpend = curMarketData.depositMin;
//
//        if (minimumToSpend) {
//            if (curCoinType === COIN_THEDAO_ETHEREUM) {
//                minimumToSpend /= 100;
//            }
//
//            //            console.log("minimumToSpend (large units) :: " + minimumToSpend);
//
//            minimumToSpend = parseInt(HDWalletHelper.convertCoinToUnitType(curCoinType, minimumToSpend, COIN_UNITSMALL));
//
//            var numShiftsRequired = wallet.getPouchFold(curCoinType).getShiftsNecessary(minimumToSpend);
//
//            if (g_JaxxApp.getShapeShiftHelper().isMultiShiftValid(curCoinType, numShiftsRequired)) {
////                    console.log("updateFromInputFieldEntry :: multiShift is valid");
//
//                var shiftResults = g_JaxxApp.getShapeShiftHelper().getMultiShiftResults(curCoinType, numShiftsRequired);
//                /*
//                if (shiftResults !== null) {
//
//                } else {
//                    return;
//                } */
//            } else {
//                console.log("updateFromInputFieldEntry :: multiShift is invalid.. requesting");
//
//                g_JaxxApp.getShapeShiftHelper().requestMultiShift(curCoinType, numShiftsRequired, function(shiftParams) {
//                    console.log("updateFromInputFieldEntry :: finished multishift :: shiftParams :: " + JSON.stringify(shiftParams, null, 4));
//
//                    var coinTypeDict = g_JaxxApp.getShapeShiftHelper().getPairCoinTypeDict(shiftParams.shiftMarketData.pair);
//
//                    if (coinTypeDict.send === curCoinType) {
//                        g_JaxxApp.getUI().populateShapeShiftReceiveData(g_JaxxApp.getShapeShiftHelper()._marketData[coinTypeDict.send][coinTypeDict.receive]);
//                    }
//                });
//
//                //$('.tabContent .amount .button').removeClass('cssEnabled').removeClass('enabled');
//
//                return;
//            }
////                g_JaxxApp.getShapeShiftHelper().setupMultiShift(curCoinType, numShiftsRequired);
//        } else {
//            console.log("minimumToSpend unavailable :: curMarketData :: " + JSON.stringify(curMarketData, null, 4));
//
//            //$('.tabContent .amount .button').removeClass('cssEnabled').removeClass('enabled');
//
//            return;
//        }
//    }
//    // Insert here
//
//    var withinLimits = true;
//
//    if (coinAmountSmallType > wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend)) {
//        withinLimits = false;
//    }
//
//    if (coinAmountSmallType <= 0) {
//        withinLimits = false;
//    }
//
//    if (curCoinType === COIN_BITCOIN) {
//        //            console.log("bitcoin :: trying to spend :: " + coinAmountSmallType + " :: total spendable balance :: " + wallet.getPouchFold(curCoinType).getSpendableBalance());
//    } else if (curCoinType === COIN_ETHEREUM) {
//        //            console.log("ethereum :: trying to spend :: " + coinAmountSmallType + " :: total spendable balance :: " + wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend));
//
//        //@note: for a zero wei transfer, this is valid for a contract address w/ data.
//
//        if (            wallet.getPouchFold(curCoinType).getPouchFoldImplementation().hasCachedAddressAsContract(HDWalletHelper.parseEthereumAddress(addressValue))) {
//            if (coinAmountSmallType >= 0) {
//                if (coinAmountSmallType > wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend)) {
//                    withinLimits = false;
//                } else {
//                    withinLimits = true;
//                }
//            }
//        }
//    } else if (curCoinType === COIN_ETHEREUM_CLASSIC) {
//        //            console.log("ethereum :: trying to spend :: " + coinAmountSmallType + " :: total spendable balance :: " + wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend));
//
//        //@note: for a zero wei transfer, this is valid for a contract address w/ data.
//
//        if (            wallet.getPouchFold(curCoinType).getPouchFoldImplementation().hasCachedAddressAsContract(HDWalletHelper.parseEthereumAddress(addressValue))) {
//            if (coinAmountSmallType >= 0) {
//                if (coinAmountSmallType > wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend)) {
//                    withinLimits = false;
//                } else {
//                    withinLimits = true;
//                }
//            }
//        }
//    } else if (curCoinType === COIN_TESTNET_ROOTSTOCK) {
//        //            console.log("roostock :: trying to spend :: " + coinAmountSmallType + " :: total spendable balance :: " + wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend));
//
//        //@note: for a zero wei transfer, this is valid for a contract address w/ data.
//
//        if (            wallet.getPouchFold(curCoinType).getPouchFoldImplementation().hasCachedAddressAsContract(HDWalletHelper.parseEthereumAddress(addressValue))) {
//            if (coinAmountSmallType >= 0) {
//                if (coinAmountSmallType > wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend)) {
//                    withinLimits = false;
//                } else {
//                    withinLimits = true;
//                }
//            }
//        }
//    } else if (curCoinType === COIN_THEDAO_ETHEREUM) {
//        //            console.log("TheDAO Ethereum :: trying to spend :: " + coinAmountSmallType + " :: total spendable balance :: " + wallet.getPouchFold(curCoinType).getSpendableBalance(minimumToSpend));
//    } else if (curCoinType === COIN_DASH) {
//        console.log("dash :: trying to spend :: " + coinAmountSmallType + " :: total spendable balance :: " + wallet.getPouchFold(curCoinType).getSpendableBalance());
//    }
//
//    var hasValidAddress = false;
//
//    if (validAddressTypes[curCoinType] === true) {
//        hasValidAddress = true;
//    } else {
//        if (wallet.getPouchFold(curCoinType).isTokenType()) {
//            var coinHolderType = CoinToken.getMainTypeToTokenCoinHolderTypeMap(curCoinType);
//
//            if (validAddressTypes[coinHolderType] === true) {
//                hasValidAddress = true;
//            }
//        }
//    }
//
//    if (tab === 'send' && hasValidAddress === true && withinLimits === true){
//        return true;
//    } else {
//        return false;
//    }
}

JaxxUI.prototype.updateHighlightingInSendTransactionButton = function(){
    if (this.isTransactionInputDataValid()){
        $("#Send_Recieve_Btn").addClass("cssBlueHighlight");
    } else {
        $("#Send_Recieve_Btn").removeClass("cssBlueHighlight");
    }
}

JaxxUI.prototype.setStandardMessageForTransferPaperWallet = function(){
    $(".settings.confirmSweepPrivateKey .spinner").text(this._defaultPaperWalletMessage);
}


JaxxUI.prototype.preparePaperWarning = function(element) {
    var coinAbbreviatedName = $(element).attr('value');
    $(".paperWarning .header").text("Transfer "+coinAbbreviatedName+" Paper Wallet");
    $(".paperWarning .understandButton").attr("value", coinAbbreviatedName);
}

/*
* After the user clicks I understand it goes into the paper wallet.
* @method preparePrivateKeySweep
* @param element
* */
JaxxUI.prototype.preparePrivateKeySweep = function(element) {
    var coinAbbreviatedName = $(element).attr('value');
    this._transferPaperWalletCoinType = coinAbbreviatedName;
    this.setTransferPaperWalletHeader(coinAbbreviatedName);
    $(".settings.sweepPrivateKey .heading").text("Transfer "+coinAbbreviatedName+" Paper Wallet");
    Registry.application.transferPaperWallet.symbol = coinAbbreviatedName;
}

JaxxUI.prototype.setTransferPaperWalletHeader = function(coinType){
    console.log('TODO setTransferPaperWalletHeader');
    return;
    var coinNetInfo = 'BIP38';
    if(coinType === COIN_ETHEREUM || coinType === COIN_ETHEREUM_CLASSIC || coinType === COIN_AUGUR_ETHEREUM || coinType === COIN_ICONOMI_ETHEREUM || coinType === COIN_GOLEM_ETHEREUM ||  coinType === COIN_GNOSIS_ETHEREUM || coinType === COIN_SINGULARDTV_ETHEREUM || coinType === COIN_DIGIX_ETHEREUM) {
        coinNetInfo = "AES";
    }
    $(".settings.sweepPrivateKey .optionHeading label").text("Scan your private key (QR Code), or type in your private key, in order to transfer your " + HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents.coinFullDisplayName + " Jaxx also accepts encrypted keys (" + coinNetInfo + " for " + HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents.coinFullDisplayName + ").");
}

JaxxUI.prototype.getTransferPaperWalletCoinType = function() {
    return this._transferPaperWalletCoinType;
}

JaxxUI.prototype.sweepPrivateKeyExecuteCallback = function(status, tx) {
    console.log("status :: " + JSON.stringify(status));
    if (status === 'success') {
        Navigation.flashBanner('Successfully Transferred', 3);
        Navigation.clearSettings();
        Navigation.closeModal();
        g_JaxxApp.getUI().closeMainMenu();
        var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(g_JaxxApp.getUI().getTransferPaperWalletCoinType()).pouchParameters["coinAbbreviatedName"];
        g_JaxxApp.getUI().switchToCoin(coinAbbreviatedName);
    } else {
        Navigation.flashBanner('Error with transfer', 3);
        Navigation.clearSettings();
        Navigation.closeModal();
        g_JaxxApp.getUI().closeMainMenu();
    }
}

JaxxUI.prototype.updateCoinDisplayBalance = function(balance){

}

JaxxUI.prototype.getPartWholePairAsStrings = function(coinDisplayBalance){
    // returns
    if (typeof(coinDisplayBalance) !== 'string'){
        coinDisplayBalance = coinDisplayBalance.toString();
    }
    var wholePortion = "";
    var decimalPortion = "";
    // We assume
    if (coinDisplayBalance.indexOf('.') != -1) { // Just an error guard
        wholePortion = coinDisplayBalance.split(".")[0];
        decimalPortion = coinDisplayBalance.split(".")[1].substring(0, 8);
    } else {
        wholePortion = coinDisplayBalance;
        decimalPortion = "00000000";
    }
    return {"wholePortion": wholePortion, "decimalPortion": decimalPortion};
    /*
    if (wholePortion.length > 3 || coinDisplayBalance.length > 11) {
        coinDisplayBalance = wholePortion + ".";
        var smallScreen = window.matchMedia("(min-width: 375px)");
        if (smallScreen.matches){
            $('.populateBalanceCoinAmount').css('font-size', '23pt');
        }
        else {
            $('.populateBalanceCoinAmount').css('font-size', '22pt');
        }
        var coinBalanceResidual = decimalPortion;
        residualDisplayString = '<span class="populateBalanceCoinAmountSuperscript cssEthereumAmountSuperscript">' + coinBalanceResidual + '</span>';
        //                console.log("residualDisplayString :: " + residualDisplayString);

        //                $('.populateBalanceCoinAmountSuperscript').show();
        //                $('.populateBalanceCoinAmountSuperscript').text(coinBalanceResidual);
        //                console.log("coinBalanceResidual :: " + coinBalanceResidual);
        if (wholePortion.length == 5) {
            coinDisplayBalance = wholePortion + ".";
            var smallScreen = window.matchMedia("(min-width: 375px)");
            if (smallScreen.matches){
                $('.populateBalanceCoinAmount').css('font-size', '22pt');
            }
            else {
                $('.populateBalanceCoinAmount').css('font-size', '21pt');
            }
        } else {
            //                $('.populateBalanceCoinAmountSuperscript').hide();
        }
    } else {
        //                $('.populateBalanceCoinAmountSuperscript').hide();
    }*/
}

JaxxUI.prototype.lockBalanceUpdate = function(){
    this._debugLockBalanceUpdate = true;
}

JaxxUI.prototype.updateTransactionListWithCurrentCoin = function(){
    this.updateTransactionListWithCoin(curCoinType);
}

JaxxUI.prototype.updateTransactionListWithCoin = function(coinType){
    if (typeof(coinType) === 'undefined' || coinType === null) {
        coinType = curCoinType;
    }
    // Lowest index in history has most recent timestamp
    var history = wallet.getPouchFold(coinType).getHistory();
    history = history.slice(0, this._numHistoryElementsDisplayed[coinType]);
    this.updateTransactionList(coinType, history);
}
///////
JaxxUI.prototype.resizeTransactionTable = function(coinType){
    console.log('TODO transactions table ')
    return;
    if (typeof(coinType) === 'undefined' || coinType === null) {
        var coinType = curCoinType;
    }
    var transactionTable = $(HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName']);
    var tableHeight = 0;
    for (var i = 0; i < $(transactionTable).children().length; i++) {
        tableHeight += $($(transactionTable).children()[i]).height();
    }
    //$(transactionTable).css('height', tableHeight.toString()+'px');
    //$(transactionTable).parent().css('height',$(transactionTable).height() - 50);
}

JaxxUI.prototype.getLoadMoreButtonTransactionList = function(coinType){
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    return '<div class="loadMore cssLoadMore cssTableFooter wow animated fadeInUp scriptAction" specialaction="jaxx_controller.clickAddMoreTransactionsToTransactionList" value="'+coinAbbreviatedName+'" data-wow-duration="0.5s">'
        + '<span> Load More </span>'
        + '</div>';
}

JaxxUI.prototype.addLoadMoreButtonTransactionList = function(coinType){

    var transactionListElement = $(HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName']);
    // var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    var loadMoreElement = this.getLoadMoreButtonTransactionList(coinType);
    $(transactionListElement).append(loadMoreElement);
    var loadMoreButtonAdded = $(transactionListElement).find('.loadMore');
    this.attachClickEventForScriptAction(loadMoreButtonAdded); // Attach event listeners.
}

JaxxUI.prototype.removeLoadMoreButtonTransactionList = function(coinType){
    console.log(' TODO transactions list');
    return
    var transactionListElement = HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents['transactionsListElementName'];
    var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
    $(transactionListElement + ' .loadMore').remove(); // Remove the loadMore button.
}

JaxxUI.prototype.showErrorLoadingTransactions = function(){
    if (!IS_RELEASE_VERSION) {
        $(".errorLoadingTransactions").show();
    }
}

JaxxUI.prototype.hideErrorLoadingTransactions = function(){
    $(".errorLoadingTransactions").hide();
}

JaxxUI.prototype.showErrorLoadingBalances = function(){
    $(".errorLoadingBalances").show();
}

JaxxUI.prototype.hideErrorLoadingBalances = function(){
    $(".errorLoadingBalances").hide();
}

JaxxUI.prototype.clearPrivateKeyInput = function(){
    $('#privateKeySweep').val("");
    $('#privateKeySweep').trigger('keyup');
}

JaxxUI.prototype.loadExtraStylesheets = function(){
    if (PlatformUtils.extensionFirefoxCheck()){
        $('head').append('<link rel="stylesheet" type="text/css" href="css/style-firefox-only.css">');
    }
}

JaxxUI.prototype.showApplicationLoadingScreen = function(){
    $(".applicationStart").show();
}

// JaxxUI.prototype.showCoinBulletinUsingAbbreviatedName = function(coinAbbreviatedName){
//     var coinBulletinData = g_JaxxApp.getUI().getCoinBulletinData();
//     var coinsInBulletin = Object.keys(coinBulletinData);
//     if (coinsInBulletin.indexOf(coinAbbreviatedName) > -1) {
//         var bulletinData = coinBulletinData[coinAbbreviatedName];
//         $(".coinBulletinTitle").text(bulletinData.title);
//         $(".coinBulletinDescription").html(unescape(bulletinData.description));
//         $(".coinBulletinCloseButton").attr("value", coinAbbreviatedName);
//         Navigation.openModal("jaxxNews");
//     }
// };

JaxxUI.prototype.functionToCallWhenJaxxIsFinishedLoading = function(){
    this.showModalForCoinBulletinIfNotHidden(curCoinType);
};

JaxxUI.prototype.updateFullDisplayBalanceInWallet = function(coinType){
    var balance = [];

    var ctr = jaxx.Registry.getCurrentCryptoController();

    // var balance = ctr.getSpendableBalanceDB();

    /* for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
         var p = wallet.getPouchFold(i);
         if(p)balance[i] = p.getPouchFoldBalance();
     }*/

    /* if (!hasUpdatedBalance[coinType]) {
         //                console.log("updating for :: " + coinFullDisplayName + " :: " + balance[coinType]);
         hasUpdatedBalance[coinType] = true;
     } else {
         //                console.log("balance for :: " + coinFullDisplayName + " :: " + balance[coinType]);
         if (balance[coinType] > prevBalance[coinType]) {
             //            console.log("beep for :: " + coinFullDisplayName);
             playSound("snd/balance.wav", null, null);
         }
     }*/

    //prevBalance[coinType] = balance[coinType];

    //var coinBalance = -1;
    // if (balance[curCoinType] >= 0) {
    // coinBalance = HDWalletHelper.convertCoinToUnitType(curCoinType, balance[curCoinType], COIN_UNITLARGE);
    // }


    //TODO Fiat display

    ///  var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];
    // if(curCoinType === COIN_ICONOMI_ETHEREUM) {
    //  var coinAbbreviatedICNName = "ICN";

    $('.populateBalanceCoinUnit').text(ctr.symbol);
    /// } else {
    // $('.populateBalanceCoinUnit').text(coinAbbreviatedName);
    // }

    $('.populateBalanceCoinAmount .wholePortion .displayValue').empty(); // Consider Removing
    $('.populateBalanceCoinAmount .decimalPortion .displayValue').empty(); // Consider Removing

    //  g_JaxxApp.getUI().updateCoinDisplayBalanceInWallet(curCoinType, coinBalance);




    // var fiatAmount = wallet.getHelper().convertCoinToFiatWithFiatType((ctr.units === 'wei'?1:0), balance, COIN_UNITSMALL, null, false);

    //if (Number.isNaN(fiatAmount)){
    // fiatAmount = g_JaxxApp.getUI().getDisplayForBalanceNotAvailable();
    // }
    //   $('.populateBalanceFiat').text(fiatAmount); // We specify 'false' so that the correct prefix is used for the currency.

    // $('.populateCurrencyName').text(wallet.getHelper().getFiatUnit());
}

JaxxUI.prototype.updateTransactionHistoryOnUIUpdate = function() {
    console.log(' TODO  history')
    return;
    var shouldRefreshTransaction = false;
    //    var curTime = new Date().getTime();

    //    if (!forceTransactionRefresh && curTime - lastTransactionRefreshTime > historyRefreshTime) {
    //        lastTransactionRefreshTime = curTime;
    //        shouldRefreshTransaction = true;
    //    } else if (!forceTransactionRefresh) {
    var history = []// = wallet.getPouchFold(curCoinType).getHistory();
    //console.log(history);

    if (history) {
        if (!g_JaxxApp.getUI().isTransactionListEqualToHistory(curCoinType, history)) {
            shouldRefreshTransaction = true;
        }

    } else {
        console.error(' history not provided  for ' + curCoinType);
    }
    if (!history || history.length <= 0) {
        g_JaxxApp.getUI().resetTransactionList(curCoinType);
    }
    //        if (refreshHistoryTimer === null) {
    //            refreshHistoryTimer = setTimeout(function() {
    ////                console.log("do refresh tx history");
    //                updateWalletUI();
    //            }, historyRefreshTime - (curTime - lastTransactionRefreshTime) + 100);
    //
    //            lastTransactionRefreshTime = curTime;
    //        }
    //    }

    //    console.log("shouldRefreshTransaction :: " + shouldRefreshTransaction + " :: forceTransactionRefresh :: " + forceTransactionRefresh + " :: timer :: " + (curTime - lastTransactionRefreshTime));

    if (forceTransactionRefresh || shouldRefreshTransaction) {
        //        console.log("refreshing tx history :: timer :: " + (curTime - lastTransactionRefreshTime));
        refreshHistoryTimer = null;
        forceTransactionRefresh = false;
        //        lastTransactionRefreshTime = curTime;

        // g_JaxxApp.getUI().updateTransactionListWithCurrentCoin();
        // g_JaxxApp.getUI().updateTransactionList(curCoinType, wallet.getPouchFold(curCoinType).getHistory());
    }
}

JaxxUI.prototype.updateMainMenuConversionAmount = function(){
    //@note: for thedao tokens, because they're scaled at 100:1, and the same conversion functions work on these,
    //we pre-scale the amount. this may be incorrect.
    // var coinAbbreviatedName =              HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];
    // var conversionCoinAmount = 1;

    var ctr = jaxx.Registry.getCurrentCryptoController();
    var type = ctr.units ==='wei'?1:0;
    var conversionAmount = wallet.getHelper().convertCoinToFiatWithFiatType(type, 1, COIN_UNITLARGE, null, false);

    $('.settings.setCurrency .exchangeRateAbbreviatedUnit').text(ctr.symbol);
    $('.mainMenuCurrencies .exchangeRateAbbreviatedUnit').text(ctr.symbol);
    // if (Number.isNaN(conversionAmount)){
    //  conversionAmount = g_JaxxApp.getUI().getDisplayForBalanceNotAvailable();
    // }

    $('.mainMenuCurrencies .exchangeRate').text(conversionAmount);
}

JaxxUI.prototype.updateWalletUISetCurrency = function(){
    // Update currency settings

    //coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];
    currency = wallet.getHelper().getFiatUnit();
    // Currently an issue... If the user is browsing currencies and an update comes in, we jump on them.
    //var selectedTop = 0;
    $('.settings.setCurrency .currency').each(function (i, e) {
        e = $(e);
        if (e.attr('value') === currency) {
            //            e.addClass('selected').addClass('cssSelected');
            //selectedTop = e.position().top;
        } else {
            e.removeClass('selected').removeClass('cssSelected');
        }
    });
}

JaxxUI.prototype.applyTriggersForAmountSendInputUpdateWalletUI = function(){
    console.log('applyTriggersForAmountSendInputUpdateWalletUI')
    //console.warn(' applyTriggersForAmountSendInputUpdateWalletUI   ');

    if (wallet.getHelper().hasFiatExchangeRates(COIN_BITCOIN, 'USD')) {

        if (Navigation.getTab() == 'send') {
            //            console.log("< is send tab >");
            if (!$('.tabContent .amount input').is(":focus")) {
                //                console.log("< input tab not focused >");
                // $('.tabContent .amount input').trigger('keyup');

            }
        }
    } else {
        //        console.log("< no fiat exchange rates found >");
    }
}

/*
JaxxUI.prototype.applyChangesInTheUIForTestnetUpdateWalletUI = function(){
    var isTestnet = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['isTestnet'];

    if (isTestnet === true) {
        $('.populateAddressType').parent('.mainAddressBox').addClass('cssTestnet');
    } else {
        $('.populateAddressType').parent('.mainAddressBox').removeClass('cssTestnet');
    }
}*/

// JaxxUI.prototype.updateQRCodeInUI = function(){
//     var qrCode = 0;
//     var address = jaxx.Registry.getCurrentCryptoController().getCurrentAddress();
//     qrCode = jaxx.Utils.generateQRCode(address, false);
//     // qrCode = wallet.getPouchFold(curCoinType).generateQRCode();
//     $('.populateQRCode').attr("src", qrCode); // Update the QR code
// }

JaxxUI.prototype.updateAddressElementsInUI = function(){
    // Update the address
    var address = 0;

    var prefixForAddress = "Current ";
    var ctr = jaxx.Registry.getCurrentCryptoController();

    // address = ctr.getCurrentPublicAddresReceive();  //wallet.getPouchFold(curCoinType).getCurrentReceiveAddress();
    address = ctr.getCurrentAddress();
    // console.error(curCoinType,address);

    var coinFullDisplayName = ctr.displayName;// HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).uiComponents['coinFullDisplayName'];

    if( ctr.name === 'DigixEthereum' ) {
        $('.populateAddressType').text("Your DigixDAO Address:");
        // } else if(HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters && HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters.tokenIsERC20) {
        //  $('.populateAddressType').text("Your " + coinFullDisplayName + " Address:");
    } else {
        if(coinFullDisplayName === "Ethereum") {
            $('.populateAddressType').text("Your " + coinFullDisplayName + " Address:");
        } else {
            $('.populateAddressType').text("Your " + prefixForAddress + coinFullDisplayName + " Address:");
        }

    }
    $('.populateAddress').text(address);
    $('.populateAddressCopy').attr('copy', address);
    $('.populateAddressCopyLarge').attr('copyLarge', address);

    if (ctr.testnet) {
        $('.populateAddressType').parent('.mainAddressBox').addClass('cssTestnet');
    } else {
        $('.populateAddressType').parent('.mainAddressBox').removeClass('cssTestnet');
    }
    // $('.populateMnemonic').text(wallet.getMnemonic());
}

JaxxUI.prototype.setStartJaxxWithTermsOfServicePageWasRun = function(value){
    this._startJaxxWithTermsOfServicePageWasRun = value;
}

function remoteToggleNearbyExpandableDetails(el) {
    jaxx.Registry.jaxxUI .toggleNearbyExpandableDetails(el);
}

function remoteToggleMainMenu(){
    //JaxxUI.prototype.toggleMainMenu();
    if (jaxx.Registry.jaxxUI._mainMenuIsOpen === true) {
        jaxx.Registry.jaxxUI.closeMainMenu();
    }
    else {
        jaxx.Registry.jaxxUI.openMainMenu();
    }
}
