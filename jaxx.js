var g_JaxxApp = new JaxxApp();
var g_ready;

$(document).ready(function () {
    console.log('ready');

    var app = new jaxx.Application({});
    var jaxxconfig = null;

    if (g_ready) return;

    jaxx.Registry.jaxxApp = g_JaxxApp;

    getJaxxConfig(function (error, config) {
        if (error) {
            console.error(error);
            updateCurrentConfig(config);
        } else {
            app.setConfig(config);
            initializeJaxxAppWithConfig(config);
            updateCurrentConfig(config);
        }
    });
});

function updateCurrentConfig(config) {

    var version = config.ver;

    var latestJaxxVersion = JSON.parse(localStorage.getItem('jaxxconfig')).jaxxClient;
    if (latestJaxxVersion) {
        if (latestJaxxVersion !== Number(Registry.getJaxxVersion())) {
            jaxx.Registry.setJaxxVersion(latestJaxxVersion);
        }
    }

      var jaxxVersion = jaxx.Registry.getJaxxVersion();
      var env = 'prod';
      var url = 'https://utils.jaxx.io/api/' + env + '/jaxx-config/'+version+'/'+jaxxVersion;

    //only make a call to retrieve latest jaxx config when it is available for download
    if (jaxxVersion) {
        $.getJSON(url).done(function (result) {
            if (typeof result === 'object') {
                try {
                    var config = result;
                    if (config.ver) {
                        if (config.ver > JSON.parse(localStorage.getItem('jaxxconfig')).ver) {
                            localStorage.setItem('jaxxconfig', JSON.stringify(config));
                            localStorage.setItem('lastJaxxConfigUpdate', String(Date.now()));
                            jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_CONFIG_UPDATED, config);
                            console.warn(jaxx.Registry.ON_CONFIG_UPDATED);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }).fail(function (err) {
            console.error(err);
        });
    }
}

function getJaxxConfig(callBack) {
    var currentConfig;
    var localStorageJaxxConfig = localStorage.getItem('jaxxconfig');
    var useAppConfig = localStorage.getItem('useAppConfig');

    if (useAppConfig && (useAppConfig.toLowerCase() === 'true')) {
        console.warn('Using App Configuration.');
        new jaxx.JaxxDeveloper();
        $.getJSON('js/app/jaxx-config.json').done(function (result) {
            callBack(null, result);
        }).fail(function (jqXHR) {
            jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('jaxx.updateCurrentConfig', url, result))
            console.error(e);
            console.error('error load config loading from applicaton ', jqXHR);
            callBack('no config file in local ', {ver: 1.0});
        });
    } else {
        if (!localStorageJaxxConfig) {
            $.getJSON('js/app/jaxx-config.json').done(function (result) {
                localStorage.setItem('jaxxconfig', JSON.stringify(result));
                callBack(null, result);
            }).fail(function (jqXHR) {
                console.error('error load config loading from server ', jqXHR);
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('jaxx.updateCurrentConfig', url, result))
                console.error(e);
                callBack('no config file in local ', {ver: 1.0});
            });
        } else {
            currentConfig = JSON.parse(localStorageJaxxConfig);
            callBack(null, currentConfig);
        }
    }
}

function initializeJaxxAppWithConfig(config) {
    console.log('initializeJaxxAppWithConfig');
    console.log('loaded in ' + (Date.now() - starttime) + ' ms');
    g_initialized = true;
    g_JaxxApp.initialize(config);
    PlatformUtils.outputAllChecks();
    startJaxx();
}

//@note: @todo: move into JaxxApp object
var refreshHistoryTimer = null;
var historyRefreshTime = 5000;

// Move to tools?
function isDecimal(value) {
    return (value + '').match(/^([0-9]+|[0-9]+\.[0-9]*|[0-9]*\.[0-9]+)$/);
}


var Vault = function () {
    //Encrypt using google crypto-js AES-base cypher
    this._key = "6Le0DgMTAAAAANokdfEial"; //length=22
    this._iv = "mHGFxENnZLbienLyALoi.e"; //length=22
    this._keyB;
    this._ivB;
}

Vault.prototype.encryptSimple = function (clearTxt) {
    this._keyB = thirdparty.CryptoJS.enc.Base64.parse(this._key);
    this._ivB = thirdparty.CryptoJS.enc.Base64.parse(this._iv);
    var encrypted = thirdparty.CryptoJS.AES.encrypt(clearTxt, this._keyB, {iv: this._ivB});
    var encryptedString = encrypted.toString();
    return encryptedString;
}

Vault.prototype.decryptSimple = function (encryptedTxt) {
    this._keyB = thirdparty.CryptoJS.enc.Base64.parse(this._key);
    this._ivB = thirdparty.CryptoJS.enc.Base64.parse(this._iv);
    var decrypted = thirdparty.CryptoJS.AES.decrypt(encryptedTxt, this._keyB, {iv: this._ivB});
    var decryptedText = decrypted.toString(thirdparty.CryptoJS.enc.Utf8);
    return decryptedText;
}

Vault.prototype.decrypt = function (encVal, callback) {
    var error = null;

    var decryptedVal = this.decryptSimple(encVal, true);

    callback(error, decryptedVal);
}


function truncate(text, frontCount, backCount, delimiter) {

    if (!text) {
        text = 'null';
    }

    if (!delimiter) {
        delimiter = '...';
    }

    var l = frontCount + backCount + delimiter.length;

    if (text.length < l) {
        return text;
    }

    return text.substring(0, frontCount) + delimiter + text.substring(text.length - backCount);
}

const transitionElementNames = ['.tab.send',
    '.tab.receive',
    '.mainBalanceBox',
    '.refresh',
    '.mainAddressBox',
    '.qrCode',
    '.cameraTab',
    '.balanceBoxSeperator',
    '.mainTransactionHistoryHeader',
    '.transactionHistorySeperator',
    '.noTransactions',
    '.landscapeQRSeperator',
    '.landscapeRight'];

const portraitTransitionsIn = [];
const portraitTransitionsOut = [];

const landscapeTransitionsIn = [];
const landscapeTransitionsOut = [];

portraitTransitionsIn['.tab.send'] = 'slideInRight';
portraitTransitionsIn['.tab.receive'] = 'slideInLeft';
portraitTransitionsIn['.mainBalanceBox'] = 'fadeInLeft';
portraitTransitionsIn['.refresh'] = 'fadeIn';
portraitTransitionsIn['.mainAddressBox'] = 'zoomIn';
portraitTransitionsIn['.qrCode'] = ''; //fadeIn
portraitTransitionsIn['.cameraTab'] = 'fadeIn';
portraitTransitionsIn['.balanceBoxSeperator'] = 'fadeIn';
portraitTransitionsIn['.mainTransactionHistoryHeader'] = 'fadeInUp';
portraitTransitionsIn['.transactionHistorySeperator'] = 'fadeInUp';
portraitTransitionsIn['.noTransactions'] = 'fadeInUp';
portraitTransitionsOut['.landscapeQRSeperator'] = 'fadeIn';
portraitTransitionsOut['.landscapeRight'] = 'fadeIn';

portraitTransitionsOut['.tab.send'] = 'slideOutRight';
portraitTransitionsOut['.tab.receive'] = 'slideOutLeft';
portraitTransitionsOut['.mainBalanceBox'] = 'fadeOutLeft';
portraitTransitionsOut['.refresh'] = 'fadeOut';
portraitTransitionsOut['.mainAddressBox'] = 'zoomOut';
portraitTransitionsOut['.qrCode'] = 'fadeOutRight';
portraitTransitionsOut['.cameraTab'] = 'fadeOut';
portraitTransitionsOut['.balanceBoxSeperator'] = 'fadeOut';
portraitTransitionsOut['.mainTransactionHistoryHeader'] = 'fadeOutDown';
portraitTransitionsOut['.transactionHistorySeperator'] = 'fadeOutDown';
portraitTransitionsOut['.noTransactions'] = 'fadeOutDown';
portraitTransitionsOut['.landscapeQRSeperator'] = 'fadeOut';
portraitTransitionsOut['.landscapeRight'] = 'fadeOut';

landscapeTransitionsIn['.tab.send'] = 'fadeInUp';
landscapeTransitionsIn['.tab.receive'] = 'fadeInUp';
landscapeTransitionsIn['.mainBalanceBox'] = 'zoomIn';
landscapeTransitionsIn['.refresh'] = 'zoomIn';
landscapeTransitionsIn['.mainAddressBox'] = 'zoomIn';
landscapeTransitionsIn['.qrCode'] = 'zoomIn';
landscapeTransitionsIn['.cameraTab'] = 'fadeInUp';
landscapeTransitionsIn['.balanceBoxSeperator'] = 'fadeIn';
landscapeTransitionsIn['.mainTransactionHistoryHeader'] = 'fadeInUp';
landscapeTransitionsIn['.transactionHistorySeperator'] = 'fadeInUp';
landscapeTransitionsIn['.noTransactions'] = 'fadeInUp';
landscapeTransitionsIn['.landscapeQRSeperator'] = 'fadeIn';
landscapeTransitionsIn['.landscapeRight'] = 'fadeIn';

landscapeTransitionsOut['.tab.send'] = 'fadeOutDown';
landscapeTransitionsOut['.tab.receive'] = 'fadeOutDown';
landscapeTransitionsOut['.mainBalanceBox'] = 'zoomOut';
landscapeTransitionsOut['.refresh'] = 'zoomOut';
landscapeTransitionsOut['.mainAddressBox'] = 'zoomOut';
landscapeTransitionsOut['.qrCode'] = 'zoomOut';
landscapeTransitionsOut['.cameraTab'] = 'fadeOutDown';
landscapeTransitionsOut['.balanceBoxSeperator'] = 'fadeOut';
landscapeTransitionsOut['.mainTransactionHistoryHeader'] = 'fadeOutDown';
landscapeTransitionsOut['.transactionHistorySeperator'] = 'fadeOutDown';
landscapeTransitionsOut['.noTransactions'] = 'fadeOutDown';
landscapeTransitionsOut['.landscapeQRSeperator'] = 'fadeOut';
landscapeTransitionsOut['.landscapeRight'] = 'fadeOut';

if (PlatformUtils.extensionCheck() || PlatformUtils.desktopCheck()) {
} else if (PlatformUtils.mobileCheck()) {
    $('.wallet').fadeTo(0, 1);
} else {
    //@note: desktop
}

var lastSentTimestampSeconds = 0; //timestamp or last sent tx
var prevBalance = [];
var hasUpdatedBalance = [];
var pageScanAddresses = [];

for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
    prevBalance[i] = 0;
    hasUpdatedBalance[i] = false;
    pageScanAddresses[i] = [];
}

const PROFILE_PORTRAIT = 0;
const PROFILE_LANDSCAPE = 1;
var scanImportWallet = null;
var forceTransactionRefresh = true;
var lastTransactionRefreshTime = new Date().getTime();
var curCoinType = COIN_BITCOIN;
var ethereumSecretProgress = 0;
var ethereumUnlocked = true;//getStoredData('ethereum_unlocked');
var curProfileMode = -1;
var canUpdateWalletUI = true;
var hasBlit = false;

function switchToProfileMode(profileMode) {
    if (profileMode === curProfileMode) {
        return;
    }

    if (curProfileMode == PROFILE_PORTRAIT) {
        $('.landscapeQRCode').fadeTo(0, 1);
        $('.landscapeQRCode').show();
        $('.landscapeQRCode').removeClass('cssNoSizeOverride');
        $('.copied').css('left', '');
    } else if (curProfileMode == PROFILE_LANDSCAPE) {
        $('.landscapeLeft').removeClass('cssTabletLeft');
        $('.cameraTab').css('right', '');
        $('.shapeshiftTab').css('right', '');
        $('.mainBalanceBox').removeClass('cssFloatNoneOverride');
        $('.landscapeBalanceCenteringA').removeClass('cssCenter');
        $('.landscapeBalanceCenteringB').removeClass('cssTabletBalance');
        $('.portraitCurrency').addClass('cssCurrencyFloat');
        $('.landscapeQRSeperator').removeClass('cssSeparator');
        $('.wrapTableCurrencySelectionMenu').removeClass('cssZeroMarginLeftOverride');
        $('.landscapeRight').removeClass('cssTabletRight');
        $('.portraitQRCode').fadeTo(0, 1);
        $('.portraitQRCode').removeClass('cssPortraitQRCodeLandscapeOverride');
        $('.populateQRCode').removeClass('cssLandscapeQRSizing')
    }

    curProfileMode = profileMode;

    if (profileMode == PROFILE_PORTRAIT) {
        $('.landscapeQRCode').fadeTo(0, 0);
        $('.landscapeQRCode').hide();
        $('.landscapeQRCode').addClass('cssNoSizeOverride');
        $('.copied').css('left', '26%');
    } else if (profileMode == PROFILE_LANDSCAPE) {
        $('.landscapeLeft').addClass('cssTabletLeft');
        var wWidth = g_JaxxApp.getUI().getLargerScreenDimension() / 2;
        var leftWindowWidth = wWidth;
        $('.cameraTab').css('right', leftWindowWidth + 'px');
        $('.shapeshiftTab').css('right', leftWindowWidth + 'px');
        $('.mainBalanceBox').addClass('cssFloatNoneOverride');
        $('.landscapeBalanceCenteringA').addClass('cssCenter');
        $('.landscapeBalanceCenteringB').addClass('cssTabletBalance');
        $('.portraitCurrency').removeClass('cssCurrencyFloat');
        $('.populateBalanceFiat').addClass('cssLandscapePopulateBalanceFiatFix');
        $('.landscapeQRSeperator').addClass('cssSeparator');
        $('.wrapTableCurrencySelectionMenu').addClass('cssZeroMarginLeftOverride');
        $('.landscapeRight').addClass('cssTabletRight');
        $('.portraitQRCode').fadeTo(0, 0);
        $('.portraitQRCode').addClass('cssPortraitQRCodeLandscapeOverride');
        $('.populateQRCode').addClass('cssLandscapeQRSizing')
    }
}

function setDefaultProfileMode(profileMode) {
    if (profileMode == PROFILE_LANDSCAPE) {
        var transitionBasePortraitIn = portraitTransitionsIn;
        var transitionBaseLandscapeIn = landscapeTransitionsIn;

        for (var eID in transitionElementNames) {
            var curElement = transitionElementNames[eID];

            $(curElement).removeClass(transitionBasePortraitIn[curElement]);
            $(curElement).addClass(transitionBaseLandscapeIn[curElement]);
        }
    }
}

var wallet = null;
var openUrl = null;

function checkOpenUrl(url) {
    console.log("< wallet :: " + wallet + " :: url :: " + url + " >");
    if (wallet) {
        var result = HDWalletHelper.parseURI(url);
        var output = '';

        for (var property in result) {
            output += property + ': ' + result[property] + '; ';
        }

        Navigation.showTab('send');
        $('.tabContent .address input').val(result.address).trigger('keyup');

        if (result.amount) {
            $('.tabContent .amount input').val(result.amount).trigger('keyup');
        }
    }
    else {
        openUrl = url;
    }
}

function switchToCoinType(oldController, newController, firstUnlock, callback) {

    var targetCoinType = newController._coinType;
    $('.initializingLoading').hide();
    g_JaxxApp.getUI().resetShapeShift();
    g_JaxxApp.getUI().resetTXHistory(curCoinType);
    g_JaxxApp.getUI().beginSwitchToCoinType(curCoinType, targetCoinType);
    g_JaxxApp.getUI().showHideFoxOnFrontEndOfWallet(targetCoinType);
    wallet.switchToCoinType(targetCoinType);
    g_JaxxApp.getUI().switchToSolidCoinButton(targetCoinType);

    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        if (i !== targetCoinType) {
            g_JaxxApp.getUI().resetCoinButton(i);
        }
    }

    canUpdateWalletUI = false;
    var tCoinType = targetCoinType;

    Navigation.hideUI(curProfileMode, curProfileMode, function () {

        completeSwitchToCoin(targetCoinType, callback);

    }, firstUnlock, curCoinType);

    curCoinType = targetCoinType;
    wallet.getPouchFold(curCoinType).activateCoinPouchIfInactive();
    g_JaxxApp.getUI().updateTransactionListWithCurrentCoin();
    callback();
    g_JaxxApp.getUI().setTransferPaperWalletHeader(curCoinType);
}

function completeSwitchToCoin(targetCoinType, callback) {

    Navigation.setUseFiat(Navigation.isUseFiat());
    Navigation.setupCoinUI(targetCoinType);
    wallet.completeSwitchToCoinType(targetCoinType);
    g_JaxxApp.getUI().completeSwitchToCoinType(curCoinType, targetCoinType);
    canUpdateWalletUI = true;
    forceUpdateWalletUI();
    g_JaxxApp.getUI().populateCurrencyList(targetCoinType);
    wallet.getPouchFold(targetCoinType).getSpendableBalance(); // This populates the spendable balance cache.
    Navigation.showUI(curProfileMode, curProfileMode, function () {
        callback();
        showPageScanAddresses(targetCoinType);
    });
}

function updateWalletUI(coinType) {
    //@note: for landscape/portrait rotation
    if (!wallet) {
        return;
    }
    if (!canUpdateWalletUI) {
        return;
    }
    if (coinType == null || typeof(coinType) === "undefined") {
        coinType = COIN_BITCOIN;
    }
    g_JaxxApp.getUI().updateAddressElementsInUI();
    g_JaxxApp.getUI().applyTriggersForAmountSendInputUpdateWalletUI();
    g_JaxxApp.getUI().updateFullDisplayBalanceInWallet(coinType);
    g_JaxxApp.getUI().updateWalletUISetCurrency();
    g_JaxxApp.getUI().updateMainMenuConversionAmount();
    g_JaxxApp.getUI().updateTransactionHistoryOnUIUpdate();
    g_JaxxApp.getUI().updateCoinToFiatExchangeRates(); // Here we update the exchange rates in the table.
}

function checkForAllAddresses(docBody) {
    var allResults = [];

    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        allResults[i] = checkForAddresses(docBody, i);
    }

    return allResults;
}

function checkForAddresses(docBody, targetCoinType) {
    var results = {};

    if (targetCoinType == COIN_BITCOIN) {
        var bitcoinAddresses = docBody.match(/(^|[^A-Za-z0-9])[13mn][1-9A-HJ-NP-Za-km-z]{26,33}($|[^A-Z-z0-9])/g);

        if (!bitcoinAddresses) {
            bitcoinAddresses = [];
        }

        for (var i = 0; i < bitcoinAddresses.length; i++) {
            var bitcoinAddress = bitcoinAddresses[i].match(/[13mn][1-9A-HJ-NP-Za-km-z]{26,33}/);
            if (bitcoinAddress) {
                results[bitcoinAddress] = 0;
            }
        }

        //@note: @details: https://regex101.com/
        var uris = docBody.match(/bitcoin:(\/\/)?[13mn][1-9A-HJ-NP-Za-km-z]{26,33}(\?[A-Za-z0-9._&=-]*&amount=|\?amount=)[0-9\.]+/g);

        if (!uris) {
            uris = [];
        }

        for (var i = 0; i < uris.length; i++) {
            var uri = uris[i];
            var comps = uri.split('?');
            var address = comps[0].match(/[13mn][1-9A-HJ-NP-Za-km-z]{26,33}/);
            var amount = null;
            var amountError = false;
            var pairs = comps[1].split('&');

            for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
                var pair = pairs[pairIndex];
                if (amount !== null) {
                    amountError = true;
                }
                else if (pair.substring(0, 7) === 'amount=') {
                    amount = pair.substring(7);
                }
            }

            if (amountError) {
                amount = null;
            }
            results[address] = (amount !== null) ? amount : "";
        }
    }
    else if (targetCoinType == COIN_ETHEREUM) {
        var ethereumAddresses = docBody.match(/(0x[0-9a-fA-F]{40})/g);
        console.log("check :: " + ethereumAddresses);

        if (!ethereumAddresses) {
            ethereumAddresses = [];
        }

        for (var i = 0; i < ethereumAddresses.length; i++) {
            var isValidEthereumLikeAddress = false;
            var validAddressTypes = getAddressCoinTypes(ethereumAddresses[i]);

            if (validAddressTypes[COIN_ETHEREUM] === true ||
                validAddressTypes[COIN_ETHEREUM_CLASSIC] === true ||
                validAddressTypes[COIN_TESTNET_ROOTSTOCK] === true) {
                isValidEthereumLikeAddress = true;
            }

            console.log("found :: " + ethereumAddresses[i] + " :: " + JSON.stringify(validAddressTypes));

            var ethereumAddress = ethereumAddresses[i];

            if (isValidEthereumLikeAddress) {
                results[ethereumAddress] = 0;
            }
        }
        //@note: @todo: ethereum uri support.
    }

    for (resultAddress in results) {
        var validAddressTypes = getAddressCoinTypes(resultAddress);

        if (validAddressTypes[targetCoinType] !== true) {
            delete results[resultAddress];
        }
    }

    return results;
}

function populateScanAddresses(coinScanAddresses) {
    $('.populatePageAddresses').empty();
    var template = $('.pageAddressTemplate > .pageAddress');
    var foundValidAddresses = 0;
    var foundAddressCoinType = -1;

    for (var address in coinScanAddresses) {
        console.log("found address :: " + address);
        var link = template.clone(true);
        var amount = coinScanAddresses[address];
        $('.address', link).text(address);
        $('.amount', link).text(amount);

        link.click((function (address, amount) {
            return function () {
                Navigation.showTab('send');
                if (amount) {
                    $('.tabContent .amount input').val(amount)
                }
                $('.tabContent .address input').val(address).trigger('keyup');
            };
        })(address, amount));

        console.log("populating to :: " + $('.populatePageAddresses') + " :: " + link);
        $('.populatePageAddresses').append(link);
    }

    if (Object.keys(coinScanAddresses).length < 3) {
        $('.pageAddressScrollContainer').css('overflow-y', 'hidden');
        $('.pageAddressScrollContainer').css('display', 'hidden');
    } else {
        $('.pageAddressScrollContainer').css('overflow-y', 'scroll');
    }

    $('.pageAddresses').data('addresses', Object.keys(coinScanAddresses).length);
}

function showPageScanAddresses(targetCoinType) {
    populateScanAddresses(pageScanAddresses[targetCoinType]);

    if (Object.keys(pageScanAddresses[targetCoinType]).length > 0) {
        $('.pageAddressesHeader').show();
        $('.pageAddresses').show();
        Navigation.showTab('send');
    }
}

function countdownButtonUpdate(element, prefixText, timeRemaining, onUpdateCallback, onFinishCallback) {
    if (onUpdateCallback) {
        onUpdateCallback(timeRemaining - 1);
    }

    var strTimerName = $(element).selector;
    clearTimeout(g_JaxxApp.getUI().UITimer(strTimerName));
    var objTimer = setTimeout(function () {
        if (timeRemaining > 1) {
            countdownButtonUpdate(element, prefixText, timeRemaining - 1, onUpdateCallback, onFinishCallback);
        } else {
            onFinishCallback();
        }
    }, 1000);

    g_JaxxApp.getUI().UITimer(strTimerName, objTimer);
}

//this is only called when wallet is restored or created
function _loadWallet(loadedWallet) {
    console.log('_loadWallet');
    jaxx.Registry.loadMnemonic();

    if (wallet) {
        if ($(window).unload) {
            $(window).trigger('unload');
        }
    }

    wallet = loadedWallet;
    g_JaxxApp.getUI().generateProgrammaticElementsInUI();
    Navigation.setUseFiat(false);
    // if we are loading a new wallet
    if (g_JaxxApp['__newWalletFromScratch'] === true) {

        jaxx.Registry.application$.on(jaxx.Registry.ON_UI_INTERWALLET_ANIMATION_END, function () { // once the wallet UI should be ready to get in place
            var creatingWalletOverlay = $('.creatingWallet');
            $('.settings').hide(); // this hides the wallet configuraiton screen
            g_JaxxApp['__newWalletFromScratch'] = false;
            setTimeout(function () // we place the fade out behind a 2 sec timer to as the wallet UI sometimes takes longer to settle
            {
                creatingWalletOverlay.css('transition', 'opacity 1.5s');
                creatingWalletOverlay.css('opacity', '0');

                setTimeout(function () { // once the transition has ended
                    creatingWalletOverlay.css('display', 'none');
                }, 2000);

            }, 2000);
        });
    } else { // here we are not startin a wallet from scratch
        $('.settings').hide();
    }
    $('.wallet').show();

    if (openUrl) {
        checkOpenUrl(openUrl);
        openUrl = null;
    }

    resize();

    // Jaxx bulletin should trigger after tips notification footer is closed on express mode. See hideNotificationFooter function
    if (g_JaxxApp.getUI()._jaxxUIIntro._setOptionSelected !== "Express") {
        g_JaxxApp.getUI().getJaxxNews(function () {
            g_JaxxApp.getUI().displayJaxxNewsIfCritical();
        });
    }

    if (typeof(currencyListArray) === 'undefined' || currencyListArray === null) {
        currencyListArray = [];
    }

    if (currencyListArray.length === 0) {
        currencyListArray.push('USD');
    }

    console.log('currencies_selected resource data is ', currencyListArray);

    // @Note: Set wallet unit
    var default_currency = g_JaxxApp.getSettings().getListOfEnabledCurrencies()[0];
    wallet.getHelper().setFiatUnit(default_currency);
    g_JaxxApp.getUI().showHamburgerMenu();
    var getUIIntro = g_JaxxApp.getUI()._jaxxUIIntro;
    // if(getUIIntro._setWalletType === "newWallet" && getUIIntro._setOptionSelected === "Express")
    //g_JaxxApp.getUI().setTransferPaperWalletHeader(curCoinType); // Just sets the text for transfer paper wallet to give more specific instructions.

    return wallet;
}

/**
 *  User Interface - Tabs
 *
 */

var Navigation = (function () {
    this.ignoreUpdateFromInputFieldEntry = false;
    var _currenciesEnabled = []; // This keeps a record of all currencies the user has enabled

    var closeModal = function (callback) {
        var visible = $('.modal.visible');
        visible.removeClass('visible').animate({opacity: 0}, 300, function () {
            visible.hide();
            if (callback) callback();
        });
        if (window.native && window.native.setIsModalOpenStatus) {
            window.native.setIsModalOpenStatus(false);
        }
    }

    var openModal = function (modalName) {
        $('.modal.visible').hide(); // replaces closeModal();
        var modal = $('.modal.' + modalName);
        modal.find('.imageCopy').on('click', function () {
        });
        modal.css({opacity: 0}).show().animate({opacity: 1}).addClass('visible');
        modal.click(function (e) {
            if ($(e.target).hasClass('modal')) {
                closeModal();
            }
        });

        if (window.native && window.native.setIsModalOpenStatus) {
            window.native.setIsModalOpenStatus(true);
        }
    };

    var openNotificationBanner = function (bannerName) {
        var bannerHeight = (JaxxUI._sUI._wHeight - $('.landscapeRight').position().top) + 5;
        var banner = $('.cssNotificationFooter' + bannerName);
        banner.parent().removeClass("hideNotificationFooter").addClass('visibleNotificationFooter');
        banner.slideDown(400, "swing").animate({height: bannerHeight});
        if (window.native && !!window.native.getAndroidSoftNavbarHeight()) {
            $('.modal-bottom').addClass('softKeys');
        }
    };

    var closeNotificationBanner = function (bannerName) {
        var banner = $('.cssNotificationFooter' + bannerName);
        setTimeout(function () {
            banner.slideUp(400, 'swing', function () {
                banner.parent().removeClass('visibleNotificationFooter');
                banner.parent().addClass('hideNotificationFooter');
            }).animate({height: 0});
        }, 500);
    };

    var futureResize = function () {
        setTimeout(resize, 10);
    };

    // Show a tab
    // @TODO: add an "amiated" parameter
    var showTab = function (tabName) {
        console.error('showTab ' + tabName);
        $('.tab').removeClass('cssSelected').removeClass('selected');
        $('.tab.' + tabName).addClass('cssSelected').addClass('selected');

        if ((tabName === 'send') || (tabName === 'shapeShift')) {
            g_JaxxApp.getUI().updateHighlightingInSendTransactionButton();

            if ($('.tabContent').hasClass('selected')) {
                $('.tabContent .address').slideDown();
                $('.tabContent .spendable').slideDown();

                if ($('.tabContent .pageAddresses').data('addresses')) {
                    $('.tabContent .pageAddressesHeader').slideDown();
                    $('.tabContent .pageAddresses').slideDown();
                }

                if (curCoinType === COIN_ETHEREUM) {
                    if (!(g_JaxxApp.getShapeShiftHelper().getIsTriggered())) {
                        $('.tabContent .advancedTabButton').slideDown();
                    }
                }
            }
            else {
                $('.tabContent .address').show();
                $('.tabContent .spendable').show();

                if ($('.tabContent .pageAddresses').data('addresses')) {
                    $('.tabContent .pageAddressesHeader').show();
                    $('.tabContent .pageAddresses').show();
                }

                if (curCoinType === COIN_ETHEREUM) {
                    if (!(g_JaxxApp.getShapeShiftHelper().getIsTriggered())) {
                        $('.tabContent .advancedTabButton').show();
                    }
                }

                updateSpendable();
            }

            $('.tabContent .amount .button span.send').css({opacity: 1});
            $('.tabContent .amount .button span.receive').css({opacity: 0});
            $('.tabs .tab.send .icon').fadeTo(0, 1);
            $('.tabs .tab.receive .icon').fadeTo(0, 0.5);
        }
        else {
            if ($('.tabContent').hasClass('selected')) {
                $('.tabContent .address').slideUp();
                $('.tabContent .pageAddressesHeader').slideUp();
                $('.tabContent .pageAddresses').slideUp();
                $('.tabContent .spendable').slideUp();

                if (curCoinType === COIN_ETHEREUM) {
                    $('.tabContent .advancedTabButton').slideUp();
                    Navigation.hideEthereumAdvancedMode();
                }
            }
            else {
                $('.tabContent .address').hide();
                $('.tabContent .pageAddressesHeader').hide();
                $('.tabContent .pageAddresses').hide();
                $('.tabContent .spendable').hide();

                if (curCoinType === COIN_ETHEREUM) {
                    $('.tabContent .advancedTabButton').hide();
                    $('.tabContent .advancedTabContentEthereum').hide();
                }
            }

            $('.tabContent .amount .button span.receive').css({opacity: 1});
            $('.tabContent .amount .button span.send').css({opacity: 0});
            $('.tabs .tab.send .icon').fadeTo(0, 0.5);
            $('.tabs .tab.receive .icon').fadeTo(0, 1);
            ethereumAdvancedModeHidden = true;
        }

        if ($('.tabContent').hasClass('selected')) {
            $('.tabContent .amount').slideDown();
        }
        else {
            $('.tabContent .amount').show();
        }

        $('.tabContent').slideDown(futureResize).addClass('cssSelected').addClass('selected');

        if (window.native && window.native.setTabName) {
            window.native.setTabName(Navigation.getTab()); // Push data to Android app.
        }
    };

    //TODO remove all instances
    var getTab = function () {
    };

    var collapseTabs = function () {
        jaxx.SendTransactionsController.instance.resetAll();
    };

    //TODO remove all instances
    var toggleTab = function (tabName) {
    };


    var isUseFiat = function () {
        return ($('.unitToggle').data('fiat') === true);
    };

    var setUseFiat = function (useFiat) {
        $('.tabContent .amount input').val('');
        $('.unitToggle').data('fiat', (useFiat === true));
        $('.tabContent .amount input').trigger('keyup');

        if (useFiat) {
            $('.unitToggle .symbol').text(wallet.getHelper().getFiatUnitPrefix());
        }
        else {
            var ctr = Registry.getCurrentCryptoController();

            if (ctr) {
                var coinSymbol = jaxx.Registry.getCurrentCryptoController().symbol;// HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).uiComponents['coinSymbol'];
                $('.unitToggle .symbol').text(coinSymbol);
            }
        }
    };

    var toggleUseFiat = function () {
        setUseFiat(!isUseFiat());
    };

    var settingsStack = [];

    var getSettingsStack = function () {
        return settingsStack;

        if (window.native && window.native.setSettingsStackStatusSize) {
            window.native.setSettingsStackStatusSize(settingsStack.length);
        }

        if (window.native && window.native.createLogMessage) {
            window.native.createLogMessage("The settings stack size is " + settingsStack.length);
        }
    };

    var clearSettings = function (callback) {
        settingsStack = [];
        $('#privateKeySweep').val('').trigger('keyup');
        $('.settings').removeClass('cssHideUsingSettingsFramework'); // Related to optimizations framework.
        $('.wallet').removeClass('cssHideUsingSettingsFramework'); // Related to optimizations framework.
        $('.menu').removeClass('cssHideUsingSettingsFramework'); // Related to optimizations framework.

        if (window.native && window.native.setSettingsStackStatusSize) {
            window.native.setSettingsStackStatusSize(settingsStack.length);
        }

        // Log message to Android Studio:
        if (window.native && window.native.createLogMessage) {
            window.native.createLogMessage("The settings stack size is " + settingsStack.length);
        }

        $('.settings').hide();
        setTimeout(function () {
            if (callback) callback();
        }, 500)
    };

    var isMenuAnimating = false;

    var pushSettings = function (settingsName, callback) {

        if (settingsName === 'backupMnemonic') {
            var lastBackUpTimeStamp = parseInt(getStoredData('lastBackupTimestamp'));

            if (lastBackUpTimeStamp) {
                var dateTime = new Date(lastBackUpTimeStamp);
                var hours = dateTime.getHours();
                var minutes = dateTime.getMinutes();
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var ampm = (dateTime.getHours() >= 12) ? "PM" : "AM";
                var $el = $('.cssBackup .cssOptionHeading label');
                var backUpNote = "Note: Backing up your wallet entails writing down your Backup Phrase. You will not be creating a \"backup\" copy of your wallet on this device.";
                $el.text('Would you like to backup your wallet again?');
                dateTime = dateTime.format('DD/MM/YY');
                $('.cssBackup .cssLastBackUpDate').text('Previous Backup: ' + dateTime + ' ' + hours + ':' + minutes + ' ' + ampm);
                $('.cssBackup .cssBackUpNote').text(backUpNote);
            }

            var element = $('.settings.backupMnemonic .proceedToBackupMnemonicButton');
            element.hide();

            countdownButtonUpdate(element, 'Proceed to Backup', 1000, null, function () {
                element.show();
            });

            var elementTwo = $('.settings.backupMnemonic .proceedToBackupMnemonicCount');
            elementTwo.fadeIn();

            countdownButtonUpdate(elementTwo, '', 1000, function (timeRemaining) {
                elementTwo.text(timeRemaining);
            }, function () {
                elementTwo.fadeOut();
            });

            $(".checkboxSettingsBackupMnemonicPage").removeClass("cssChecked");
            $(".checkboxSettingsBackupMnemonicPage").removeClass("checked");
        }

        if (settingsName === 'pairToDevice') {
            var element = $('.settings.pairToDevice .pairDeviceShowMnemonicButton');
            element.hide();

            countdownButtonUpdate(element, 'I Understand: ', 6, null, function () {
                element.show();
            });

            var elementTwo = $('.settings.pairToDevice .pairDeviceShowMnemonicCount');
            elementTwo.fadeIn();

            countdownButtonUpdate(elementTwo, '', 5, function (timeRemaining) {
                elementTwo.text(timeRemaining);
            }, function () {
                elementTwo.fadeOut();
            });
        }

        if (settingsName === 'pairFromDevice') {
            var element = $('.settings.pairFromDevice .cssBtnIntroRight');
            element.hide();

            countdownButtonUpdate(element, 'I Understand: ', 6, null, function () {
                element.show();
            });

            var elementTwo = $('.settings.pairFromDevice .pairDeviceShowMnemonicCount');
            elementTwo.fadeIn();

            countdownButtonUpdate(elementTwo, '', 5, function (timeRemaining) {
                elementTwo.text(timeRemaining);
            }, function () {
                elementTwo.fadeOut();
            });
        }

        //Handles call to SetBitcoinMiningFee view (Settings view)
        if (settingsName === 'pageSetBitcoinMiningFee') {
            jaxx.MiningFeeView.instance.onOpen(this);
        }

        if (settingsName === 'viewBackupPhrase') {
            var element = $('.settings.viewBackupPhrase .pairDeviceShowMnemonicButton');
            element.hide();

            countdownButtonUpdate(element, 'I Understand: ', 6, null, function () {
                element.show();
            });

            var elementTwo = $('.settings.viewBackupPhrase .pairDeviceShowMnemonicCount');
            elementTwo.fadeIn();

            countdownButtonUpdate(elementTwo, '', 5, function (timeRemaining) {
                elementTwo.text(timeRemaining);
            }, function () {
                elementTwo.fadeOut();
            });
        }

        if (settingsName === 'displayPrivateKeysWarning') {
            var element = $('.settings.cssDisplayPrivateKeysWarning .pairDeviceShowMnemonicButton');
            element.hide();

            countdownButtonUpdate(element, 'I Understand: ', 6, null, function () {
                element.show();
            });

            var elementTwo = $('.settings.cssDisplayPrivateKeysWarning .pairDeviceShowMnemonicCount');
            elementTwo.fadeIn();

            countdownButtonUpdate(elementTwo, '', 5, function (timeRemaining) {
                elementTwo.text(timeRemaining);
            }, function () {
                elementTwo.fadeOut();
            });
        }

        if (settingsName === 'exportPrivateKeysBitcoin') {
            setupExportPrivateKeys(COIN_BITCOIN);
        }

        if (settingsName === 'exportPrivateKeysEthereum') {
            setupExportPrivateKeys(COIN_ETHEREUM);
        }

        if (settingsName === 'exportPrivateKeysEthereumClassic') {
            setupExportPrivateKeys(COIN_ETHEREUM_CLASSIC);
        }

        if (settingsName === 'exportPrivateKeysDash') {
            setupExportPrivateKeys(COIN_DASH);
        }

        if (settingsName === 'exportPrivateKeysLitecoin') {
            setupExportPrivateKeys(COIN_LITECOIN);
        }

        if (settingsName === 'exportPrivateKeysLisk') {
            setupExportPrivateKeys(COIN_LISK);
        }

        if (settingsName === 'exportPrivateKeysZCash') {
            setupExportPrivateKeys(COIN_ZCASH);
        }

        if (settingsName === 'exportPrivateKeysTestnetRootstock') {
            setupExportPrivateKeys(COIN_TESTNET_ROOTSTOCK);
        }

        if (settingsName === 'exportPrivateKeysDoge') {
            setupExportPrivateKeys(COIN_DOGE);
        }

        if (settingsName === 'viewMnemonic') {
            if (g_JaxxApp.getUser().hasPin()) {
                settingsName = 'viewMnemonicConfirmPin';
                JaxxUI._sUI.showSettingsMnemonicConfirmPin('.settingsViewMnemonicConfirmPinPad', function () {
                    Navigation.pushSettings('viewMnemonicConfirmed');
                });
            }
            else {
                var mnemonic = getStoredData('mnemonic', true);
                $('.populateMnemonic').text(mnemonic);
            }
        }
        else if (settingsName === 'viewMnemonicConfirmed') {
            settingsName = 'viewMnemonic';
        }

        if (settingsName === 'viewJaxxToken') {
            if (g_JaxxApp.getUser().hasPin()) {
                settingsName = 'pairToDeviceConfirmPin';
            }
        }
        else if (settingsName === 'pairToDeviceConfirmed') {
            settingsName = 'viewJaxxToken';
        }

        if (settingsName === 'viewJaxxBackupPhrase') {
            if (g_JaxxApp.getUser().hasPin()) {
                settingsName = 'pairToDeviceConfirmPin';
            }
        }
        else if (settingsName === 'pairToDeviceConfirmed') {
            settingsName = 'viewJaxxBackupPhrase';
        }

        if (settingsName === 'setupPINCode') {

            if (!(g_JaxxApp.getUser().hasPin())) {
                settingsName = 'changePinCode';
            } else if (!(g_JaxxApp.getUser().checkPINHashIntegrity())) {
                g_JaxxApp.getUser().clearPin();
                settingsName = 'changePinCode';
            }
        }

        if (settingsName === 'backupPrivateKeys') {
            if (g_JaxxApp.getUser().hasPin()) {
                settingsName = 'backupPrivateKeysConfirmPin';
            }
        }
        else if (settingsName === 'backupPrivateKeysConfirmed') {
            settingsName = 'backupPrivateKeys';
        }

        //todo: android back button support for submenus.
        if (settingsStack.length) {
            var topSettings = $('.settings.' + settingsStack[settingsStack.length - 1]);
        }

        var settings = $('.settings.' + settingsName);

        // Boolean set to check if the animation process is in effect, in which case it prevents the next block
        // of code from running; this is to prevent double animation from quick tapping the same UI element
        if (!isMenuAnimating) {
            isMenuAnimating = true;
            settingsStack.push(settingsName);
            settings.css({left: '100%'}).show().animate({left: 0}, 400, 'swing', function () {
                // Optimization stuff.
                // Explicitly remove the hide class from the top page and add it to the previous page.
                var localSettingsStack = Navigation.getSettingsStack();
                $('.settings.' + localSettingsStack[localSettingsStack.length - 1]).removeClass('cssHideUsingSettingsFramework');

                if (localSettingsStack.length > 1) {
                    $('.settings.' + localSettingsStack[localSettingsStack.length - 2]).addClass('cssHideUsingSettingsFramework');
                }
                else {
                    $('.menu').addClass('cssHideUsingSettingsFramework');
                }

                isMenuAnimating = false;

                if (typeof(callback) !== 'undefined' && callback !== null) {
                    callback();
                }
            }); // Hide previous setting screen in callback.
        }

        if (settingsName === 'pairToDeviceConfirmPin') {
            JaxxUI._sUI.showPairDeviceConfirmPin('.settingsPairToDeviceConfirmPinPad', function () {
                Navigation.pushSettings('pairToDeviceConfirmed');
            });
        }

        if (settingsName === 'backupPrivateKeysConfirmPin') {
            JaxxUI._sUI.showPrivateKeysConfirmPin('.settingsBackupPrivateKeysConfirmPinPad', function () {
                Navigation.pushSettings('backupPrivateKeysConfirmed');
            });
        }

        if (settingsName === 'changePinCode') {
            g_JaxxApp.getUI().showEnterPinSettings();
        }

        if (settingsName === 'removePinCode') {
            g_JaxxApp.getUI().showRemovePinSettings();
        }

        if (window.native && window.native.setSettingsStackStatusSize) {
            window.native.setSettingsStackStatusSize(settingsStack.length);
        }

        // Log message to Android Studio:
        if (window.native && window.native.createLogMessage) {
            window.native.createLogMessage("The settings stack is " + settingsStack.join(','));
        }

        Navigation.clearFlashBanner();
    };

    var popSettings = function () {
        //@note: don't pop if the splash or terms of service are on the top of the stack.
        if (['splash', 'pageTermsOfService'].indexOf(settingsStack[settingsStack.length - 1]) === -1) {
            var settingsName = settingsStack.pop();

            if (settingsStack.length) {
                // This code block runs if popSettings stack IS NOT returning to the wallet itself.
                var nextSettings = $('.settings.' + settingsStack[settingsStack.length - 1]);
                nextSettings.removeClass('cssHideUsingSettingsFramework');
                nextSettings.animate({left: 0});
            }
            else {
                // This code block runs if popSettings stack IS returning to the wallet itself.
                $('.wallet').removeClass('cssHideUsingSettingsFramework');
                $('.menu').removeClass('cssHideUsingSettingsFramework');
            }

            var settings = $('.settings.' + settingsName);
            // Optimization related: Make sure that the top element is not hidden anymore.

            settings.animate({left: '100%'}, function () {
                settings.hide();
            });

            console.log("pop settingsName :: " + settingsName);

            if (settingsName === 'viewMnemonic') {
                if (g_JaxxApp.getUser().hasPin()) {
                    JaxxUI._sUI.showSettingsMnemonicConfirmPin('.settingsViewMnemonicConfirmPinPad', function () {
                        Navigation.pushSettings('viewMnemonicConfirmed');
                    });
                }
            }

            if (settingsName === 'viewJaxxToken' || settingsName === 'viewJaxxBackupPhrase') {
                if (g_JaxxApp.getUser().hasPin()) {
                    JaxxUI._sUI.showSettingsMnemonicConfirmPin('.settingsPairToDeviceConfirmPinPad', function () {
                        Navigation.pushSettings('pairToDeviceConfirmed');
                    });
                }
            }

            if (settingsName === 'backupPrivateKeys') {
                if (g_JaxxApp.getUser().hasPin()) {
                    JaxxUI._sUI.showSettingsMnemonicConfirmPin('.settingsBackupPrivateKeysConfirmPinPad', function () {
                        Navigation.pushSettings('backupPrivateKeysConfirmed');
                    });
                }
            }

            if (window.native && window.native.setSettingsStackStatusSize) {
                window.native.setSettingsStackStatusSize(settingsStack.length);
            }

            // Log message to Android Studio:
            if (window.native && window.native.createLogMessage) {
                window.native.createLogMessage("The settings stack size is " + settingsStack.length);
            }

            Navigation.clearFlashBanner();
        }
    };

    // switch the inputs selector for MiningFeeMainMenu
    var changeMiningViewSelector = function (miningFeeOption) {
        if (miningFeeOption === HDWalletPouch.MiningFeeLevelSlow) {
            $('input#slowMiningFeeMainMenu').prop('checked', true);
        }

        if (miningFeeOption === HDWalletPouch.MiningFeeLevelFast) {
            $('input#fastMiningFeeMainMenu').prop('checked', true);
        }

        if (miningFeeOption === HDWalletPouch.MiningFeeLevelAverage) {
            $('input#averageMiningFeeMainMenu').prop('checked', true);
        }
    };

    var flashBanner = function (text, timeout, messageType, options) {
        //flashes an orange banner on the bottom of the screen
        var options = (!!options) ? options : {};
        var getTimeout = timeout * 1000;
        var closeButton = (!!options && options.close === false) ? false : true;
        getTimeout.toString();
        toastr.options = {
            "closeButton": closeButton,
            "debug": false,
            "newestOnTop": false,
            "progressBar": true,
            "positionClass": "toast-bottom",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "400",
            "hideDuration": "400",
            "timeOut": getTimeout,
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "slideDown",
            "hideMethod": "slideUp",
            "closeOnHover": false
        };

        switch (messageType) {
            case "success":
                toastr.success(text);
                break;
            case "warning":
                toastr.warning(text);
                break;
            case "error":
                toastr.error(text);
                break;
            default:
                toastr.info(text);
                break;
        }

        if (!!$('#toast-container').length) {
            var getHeight, el = document.getElementById('transactionHistoryStart');
            getHeight = (el) ? (window.innerHeight - el.offsetTop) / 2 : 0;
            getHeight = (getHeight < 300) ? getHeight : 185;
        }
    };

    var flashBannerMultipleMessages = function (textArray, timeout) {
        /*
            Calls Navigation.flashBanner at an interval, to flash multiple messages one after another
            intervalTime is slightly longer than timeout so that messages aren't on the screen at once
            if calling this at a place in the app where Navigation.flashBanner is used, I recommend using the same timeout
        */
        var intervalTime = (parseInt(timeout) * 1000) + 600;
        var i = 0;
        var interval = setInterval(function () {
            Navigation.flashBanner(textArray[i], timeout);
            i++;
            if (i >= textArray.length) clearInterval(interval);
        }, intervalTime);
    };

    var clearFlashBanner = function () {
        $('.flashBannerNotificationFooter').empty();
    };

    var hideUI = function (fromProfileMode, toProfileMode, callbackFunc, firstUnlock, coinType) {
        JaxxUI.runAfterNextFrame(function (coinType) {
            var animSpeed = 250;
            var completionOffset = 750;

            if (firstUnlock === true) {
                completionOffset = 1250;
            }

            Navigation.clearInputFields();
            Navigation.returnToDefaultView();
            $('.theDaoInsufficientGasForSpendableWarningText').slideUp();
            $('.ethereumTokenInsufficientGasForSpendableWarningText').slideUp();

            var transitionBaseIn;
            var transitionBaseOut;

            //@note: @todo: consider switching from landscape to portrait and vise-versa.
            //would need to have a flag on hide to use portrait/landscape in/out selectively.

            transitionBaseIn = (fromProfileMode === PROFILE_PORTRAIT) ? portraitTransitionsIn : landscapeTransitionsIn;
            transitionBaseOut = (toProfileMode === PROFILE_PORTRAIT) ? portraitTransitionsOut : landscapeTransitionsOut;

            for (var eID in transitionElementNames) {
                var curElement = transitionElementNames[eID];
                $(curElement).removeClass(transitionBaseIn[curElement]);
                $(curElement).addClass(transitionBaseOut[curElement]);
            }

            setTimeout(callbackFunc, animSpeed + completionOffset);
        }, coinType);
    };

    var showUI = function (fromProfileMode, toProfileMode, callback) {
        JaxxUI.runAfterNextFrame(function () {
            var animSpeed = 250;

            //@note: @todo: consider switching from landscape to portrait and vise-versa.
            //would need to have a flag on hide to use portrait/landscape in/out selectively.

            var transitionBaseIn;
            var transitionBaseOut;

            transitionBaseIn = (fromProfileMode === PROFILE_PORTRAIT) ? portraitTransitionsIn : landscapeTransitionsIn;
            transitionBaseOut = (toProfileMode === PROFILE_PORTRAIT) ? portraitTransitionsOut : landscapeTransitionsOut;

            for (var eID in transitionElementNames) {
                var curElement = transitionElementNames[eID];
                $(curElement).removeClass(transitionBaseOut[curElement]);
                $(curElement).addClass(transitionBaseIn[curElement]);
            }
            resize();
            console.log('curTransactionTable')
            curTransactionTable = '#TransactionsTable';

            if (callback) {
                $(curTransactionTable).slideDown({complete: callback});
            }
            else {
                $(curTransactionTable).slideDown();
            }
        });
    };

    var returnToDefaultView = function () {
        var sendTab = $('.tab.' + 'send');
        var receiveTab = $('.tab.' + 'receive');

        if (g_JaxxApp.getShapeShiftHelper().getIsTriggered()) {
            g_JaxxApp.getUI().resetShapeShift();
        }

        if (sendTab.hasClass('selected') || receiveTab.hasClass('selected')) {
            Navigation.collapseTabs();
        }

        g_JaxxApp.getUI().closeQuickFiatCurrencySelector();
        g_JaxxApp.getUI().closeShapeshiftCoinList();
    };

    var clearInputFields = function () {
        Navigation.ignoreUpdateFromInputFieldEntry = true;

        clearAndTriggerIfNotEmpty = function (inputFieldName) {
            if ($(inputFieldName).val() != '') {
                $(inputFieldName).val('').trigger('keyup');
            }
        };

        clearAndTriggerIfNotEmpty('.settings.sweepPrivateKey input');
        clearAndTriggerIfNotEmpty('.settings.sweepPrivateKeyPasswordEntry input');
        clearAndTriggerIfNotEmpty('.tabContent .address input');
        clearAndTriggerIfNotEmpty('.tabContent .amount input');
        clearAndTriggerIfNotEmpty('.advancedTabContentEthereum .customGasLimit input');
        clearAndTriggerIfNotEmpty('.advancedTabContentEthereum .customData input');
        $('.ethereumChecksumAddressWarningText').slideUp();
        Navigation.ignoreUpdateFromInputFieldEntry = false;
    };

    var setupCoinUI = function (targetCoinType) {
        Navigation.hideEthereumAdvancedMode();

        //@note: @here: @token: this seems necessary.
        if (targetCoinType === COIN_BITCOIN ||
            targetCoinType === COIN_THEDAO_ETHEREUM ||
            targetCoinType === COIN_DASH ||
            targetCoinType === COIN_AUGUR_ETHEREUM ||
            targetCoinType === COIN_AUGUR_ETHEREUM ||
            targetCoinType === COIN_GOLEM_ETHEREUM ||
            targetCoinType === COIN_GNOSIS_ETHEREUM ||
            targetCoinType === COIN_ICONOMI_ETHEREUM ||
            targetCoinType === COIN_SINGULARDTV_ETHEREUM ||
            targetCoinType === COIN_DIGIX_ETHEREUM ||
            targetCoinType === COIN_BLOCKCHAINCAPITAL_ETHEREUM ||
            targetCoinType === COIN_CIVIC_ETHEREUM ||
            targetCoinType === COIN_LITECOIN ||
            targetCoinType === COIN_LISK ||
            targetCoinType === COIN_ZCASH ||
            targetCoinType === COIN_DOGE) {
            $('.tabContent .advancedTabButton').slideUp();
            $('.tabContent .advancedTabButton').hide();
        }
        else if (targetCoinType === COIN_ETHEREUM ||
            targetCoinType === COIN_ETHEREUM_CLASSIC ||
            targetCoinType === COIN_TESTNET_ROOTSTOCK) {
            Navigation.setEthereumAdvancedModeCustomGasLimitSuggestion(0, null);
            $('.advancedTabButton').unbind();
            $('.advancedTabButton').bind('click', null, function () {
                if (Navigation.ethereumAdvancedModeHidden()) {
                    Navigation.showEthereumAdvancedMode();
                }
                else {
                    Navigation.hideEthereumAdvancedMode();
                }
                console.log("toggle advanced tab");
            });

            if (!(g_JaxxApp.getShapeShiftHelper().getIsTriggered())) {
                $('.tabContent .advancedTabButton').show();
            }
        }
    };

    var ethereumSecretSelectorActivate = function () {

        if (!PlatformUtils.mobileCheck() && !PlatformUtils.extensionCheck() && !PlatformUtils.desktopCheck()) {
            var newProfileMode = (curProfileMode === PROFILE_PORTRAIT) ? PROFILE_LANDSCAPE : PROFILE_PORTRAIT;
            Navigation.setProfileMode(newProfileMode);
        }

        if (typeof(ethereumUnlocked) === 'undefined' || ethereumUnlocked === null || ethereumUnlocked === false) {

            if (ethereumSecretProgress > 1 && ethereumSecretProgress < 4) {
                ethereumSecretProgress++;

                if (ethereumSecretProgress === 4) {
                    console.log("[Unlock Ethereum]");
                    ethereumUnlocked = true;
                    storeData('ethereum_unlocked', ethereumUnlocked);
                    $('.imageLogoBannerETH').fadeTo(0, 1);
                    Navigation.switchToEthereum(true);
                }
            }
            else {
                ethereumSecretProgress = 0;
            }
        }
    };

    var startBlit = function () {
        resize();
        setTimeout(function () {
            resize();
        }, 50);

        if (hasBlit === false) {
            hasBlit = true;
            Navigation.clearInputFields();

            if (PlatformUtils.mobileCheck()) {
                console.log("< mobile mode >");

                function stopAllAnimations() {
                    for (cName in transitionElementNames) {
                        var element = $(transitionElementNames[cName]);
                        element.removeClass('animated');
                        element.addClass('animatedInstant');
                    }
                }

                stopAllAnimations();
                Navigation.hideUI(curProfileMode, curProfileMode, function () {
                }, false, curCoinType);

                setTimeout(function () {
                    function playAllAnimations() {
                        for (cName in transitionElementNames) {
                            var element = $(transitionElementNames[cName]);
                            element.removeClass('animatedInstant');
                            element.addClass('animated');
                        }
                    }

                    playAllAnimations();
                    $('.wallet').fadeTo(0, 1);
                    Navigation.showUI(curProfileMode, curProfileMode);
                }, 10);
            }
        }
    };

    //@note: @here: this function will only set it to closed properly, and doesn't
    //take into account the submenus.
    var setMainMenuOpen = function (isMainMenuOpenStatus) {
        if (isMainMenuOpenStatus === false) {
            g_JaxxApp.getUI().closeMainMenu();
        }
        specialAction('toggleMainMenuOff', null);
    };

    var tryToOpenExternalLink = function (url) {
        console.log('open external link ' + url);
        if (PlatformUtils.desktopCheck()) {
            //Desktop
//            Navigation.flashBanner("Openning up desktop browser");
            require('electron').remote.shell.openExternal(url);
        }
        if (PlatformUtils.extensionChromeCheck()) {
            //           Navigation.flashBanner("Openning up Chrome browser");
            //Chrome extension
            chrome.tabs.create({url: url});
        }
        else if (PlatformUtils.mobileAndroidCheck || PlatformUtils.mobileiOSCheck()) {
            //           Navigation.flashBanner("Openning up mobile browser");
            //Android
            if (window.native && window.native.openExternalURL) {
                native.openExternalURL(url);
            } else {
                console.log("Appears that I'm a fake mobile device");
            }
        }
        else {
            console.log("Not supported yet for this platform");
        }
    };


    var tryToOpenExternalLinkMobile = function (event) {
        var urlToOpen = event.data.param1;
        Navigation.tryToOpenExternalLink(urlToOpen);
    };

    var setProfileMode = function (newProfileMode) {
        console.log("switch to profile mode :: " + newProfileMode);
        canUpdateWalletUI = false;
        Navigation.hideUI(curProfileMode, newProfileMode, function () {
            completeSwitchToProfileMode(newProfileMode)
        }, false);
    };

    var showEthereumAdvancedMode = function () {
        ethereumAdvancedModeHidden = false;
        // when advancedmode is showing...
        $('.advancedBtnImage').hover(mouseEnterAdvancedBtnImageShowing, mouseLeaveEnterAdvancedBtnImageShowing);
        $('.tabContent .advancedTabContentEthereum').slideDown();
    };

    var mouseEnterAdvancedBtnImageShowing = function () {
        $('.advancedBtnImage').attr('src', 'img/Icon_up_hover.svg');
        $('.cssAdvancedTabButton').css('background-color', 'transparent');
    };

    var mouseLeaveEnterAdvancedBtnImageShowing = function () {
        $('.advancedBtnImage').attr('src', 'img/Icon_up.svg');
    };

    var hideEthereumAdvancedMode = function () {
        ethereumAdvancedModeHidden = true;
        // When advancedmode is not showing...
        $('.advancedBtnImage').hover(mouseEnterAdvancedBtnImageHiding, mouseLeaveEnterAdvancedBtnImageHiding);
        $('.tabContent .advancedTabContentEthereum').slideUp();
    };

    var mouseEnterAdvancedBtnImageHiding = function () {
        $('.advancedBtnImage').attr('src', 'img/Icon_down_hover.svg');
        $('.cssAdvancedTabButton').css('background-color', 'transparent');
    };

    var mouseLeaveEnterAdvancedBtnImageHiding = function () {
        $('.advancedBtnImage').attr('src', 'images/Icon_down.svg');
    };

    var ethereumAdvancedModeHidden = function () {
        return ethereumAdvancedModeHidden;
    };

    var setEthereumAdvancedModeCustomGasLimitSuggestion = function (customGasLimit, addressTypeName) {
        if (customGasLimit > 0) {
            $('.gasLimitSuggestion').text("Suggested for this " + addressTypeName + ": " + customGasLimit);
        }
        else {
            $('.gasLimitSuggestion').text("(No valid address entered)");
        }
    };

    var showEthereumLegacySweep = function (legacyEthereumBalance) {
        console.log("[ethereum] :: loaded legacy wallet support :: hasGlitchedLegacyEthereumWallet :: " + wallet.hasGlitchedLegacyEthereumWallet());

        $('.ethereumLegacySweepEtherAmount').text(HDWalletHelper.convertWeiToEther(legacyEthereumBalance) + " ETH");
        $('.ethereumLegacySweepTXCost').text(HDWalletHelper.convertWeiToEther(HDWalletHelper.getDefaultEthereumGasLimit().mul(HDWalletHelper.getDefaultEthereumGasPrice()).toString()) + " ETH");
        $('.ethereumLegacySweepConfirmButton').off('click');
        $('.ethereumLegacySweepConfirmButton').on('click', function () {
            wallet.transferLegacyEthereumAccountToHDNode();
            Navigation.closeModal();
        });

        Navigation.openModal('ethereumLegacySweepModal');
    };

    var toggleCurrency = function (pCurrency, pEnabled) {
        //Parameters: pEnabled is optional.
        var activeCurrencies = getEnabledCurrencies();
        console.log("Toggling currency Currency: " + pCurrency + " Enabled: " + pEnabled);

        if (typeof pEnabled === 'undefined') {
            // In this case we remove the currency if it is in the list and add it to the list if it is not there.
            if ($.inArray(pCurrency, activeCurrencies) > -1) {
                pEnabled = false;
            }
            else {
                pEnabled = true;
            }
        }

        if (pEnabled && (!$.inArray(pCurrency, _currenciesEnabled) > -1)) {
            // Run this if block if the user ticked the box.
            console.log("Adding currency " + pCurrency);
            wallet.getHelper().setFiatUnit(pCurrency);
            $(".exchangeRateList").find('[value=' + pCurrency + ']').addClass('cssCurrencyHighlightText'); // Set currency block to orange F27221.
            $(".exchangeRateList").find('[value=' + pCurrency + ']').find('.cssSelectedCurrency').find('.cssCircleUnchecked').css('border', 'none');
            $(".exchangeRateList").find('[value=' + pCurrency + ']').find('.cssSelectedCurrency').find('.cssCircleUnchecked').addClass('cssCurrencyisChecked');
            Navigation.updateCurrencyList();
            _currenciesEnabled.sort();
        }
        else if (!pEnabled && ($.inArray(pCurrency, activeCurrencies) > -1)) {
            if (activeCurrencies.length > 1) {
                // Now set the default currency to the most recent element pushed to _currenciesEnabled.
                // Run this if block if the user unticked the box.
                $(".exchangeRateList").find('[value=' + pCurrency + ']').removeClass('cssCurrencyHighlightText'); // Set currency block to orange F27221.
                $(".exchangeRateList").find('[value=' + pCurrency + ']').find('.cssSelectedCurrency').find('.cssCircleUnchecked').css('border', '1px solid white');
                $(".exchangeRateList").find('[value=' + pCurrency + ']').find('.cssSelectedCurrency').find('.cssCircleUnchecked').removeClass('cssCurrencyisChecked');
                Navigation.updateCurrencyList();
            }
        }

        if (Navigation.isUseFiat()) {
            $('.unitToggle .symbol').text(wallet.getHelper().getFiatUnitPrefix());
        }

        Registry.application$.triggerHandler(Registry.ON_ACTIVE_CURRENCIES_CHANGED);
    };

    var isCurrencyEnabled = function (pCurrency) {
        if ($.inArray(pCurrency, _currenciesEnabled) > -1) {
            return true;
        }
        return false;
    };

    var getEnabledCurrencies = function () {
        return Registry.getFiatPriceController().getActiveFiatCurrencies();
    };

    var updateCurrencyList = function () {
        var arrCurrencyRowsInList = $('.exchangeRateList tbody').children();
        var arrActiveFiatUnits = [];

        for (var i = 0; i < arrCurrencyRowsInList.length; i++) {
            if ($(arrCurrencyRowsInList[i]).children('.cssSelectedCurrency').children('.cssCircleUnchecked').hasClass('cssCurrencyisChecked')) {
                arrActiveFiatUnits.push($(arrCurrencyRowsInList[i]).attr('value'))
            }
        }

        var fiatController = Registry.getFiatPriceController();
        fiatController.setActiveFiatCurrencies(arrActiveFiatUnits);
    };

    var disableAllCurrencies = function () {
        Registry.getFiatPriceController().setActiveFiatCurrencies([]);
    };

    var getTopOfSettingsStack = function () {
        if (settingsStack.length > 0) {
            return settingsStack[settingsStack.length - 1];
        }
        else {
            return null;
        }
    };

    var closeMainMenu = function () {
        g_JaxxApp.getUI().closeMainMenu();
    };

    return {

        // Modal
        openModal: openModal,
        closeModal: closeModal,

        // Menu
        closeMainMenu: closeMainMenu,

        // Notification banner
        openNotificationBanner: openNotificationBanner,
        closeNotificationBanner: closeNotificationBanner,

        // Switching coins
        clearInputFields: clearInputFields,

        // Using Fiat vs. Bitcoin for units
        isUseFiat: isUseFiat,
        setUseFiat: setUseFiat,
        toggleUseFiat: toggleUseFiat,

        // Tabs
        getTab: getTab,
        collapseTabs: collapseTabs,
        showTab: showTab,
        toggleTab: toggleTab,

        // Settings
        clearSettings: clearSettings,
        pushSettings: pushSettings,
        popSettings: popSettings,
        getTopOfSettingsStack: getTopOfSettingsStack,

        // Banner
        flashBanner: flashBanner,
        flashBannerMultipleMessages: flashBannerMultipleMessages,
        clearFlashBanner: clearFlashBanner,

        // UI
        hideUI: hideUI,
        showUI: showUI,

        // Returning to default view
        returnToDefaultView: returnToDefaultView,

        // Clearing input fields
        clearInputFields: clearInputFields,

        // Setting up coin-specific ui elements
        setupCoinUI: setupCoinUI,

        // Ethereum secret selector
        ethereumSecretSelectorActivate: ethereumSecretSelectorActivate,

        // Show animations
        startBlit: startBlit,

        // Opening external link support for various platforms
        tryToOpenExternalLink: tryToOpenExternalLink,
        tryToOpenExternalLinkMobile: tryToOpenExternalLinkMobile,

        // Profile mode portrait/landscape transition
        setProfileMode: setProfileMode,

        // Ethereum specific features
        showEthereumAdvancedMode: showEthereumAdvancedMode,
        hideEthereumAdvancedMode: hideEthereumAdvancedMode,
        ethereumAdvancedModeHidden: ethereumAdvancedModeHidden,
        setEthereumAdvancedModeCustomGasLimitSuggestion: setEthereumAdvancedModeCustomGasLimitSuggestion,

        // Ethereum legacy sweeping of funds
        showEthereumLegacySweep: showEthereumLegacySweep,

        // getSettingsStack for getting the stack settings variable when debugging
        getSettingsStack: getSettingsStack,

        // Quick fiat currency selection
        toggleCurrency: toggleCurrency,
        isCurrencyEnabled: isCurrencyEnabled,
        getEnabledCurrencies: getEnabledCurrencies,
        updateCurrencyList: updateCurrencyList,
        disableAllCurrencies: disableAllCurrencies
    };
})();


function completeSwitchToProfileMode(newProfileMode) {
    switchToProfileMode(newProfileMode);
    Navigation.showUI(curProfileMode, newProfileMode);
    canUpdateWalletUI = true;
    forceUpdateWalletUI();
    resize();
}

function setupBackupPrivateKeys(coinType, symbol) {
    g_JaxxApp.getUI().updateAndLoadPrivateKeyList(coinType, symbol);
}

function setupExportPrivateKeys(coinType) {
    var printStr = g_JaxxApp.getUI()._strKeyPair;
    $('.backupPrivateKeyListcopy').attr('copy', printStr);
    $(csvExportField).text(printStr);
}


//Returns the detected coin type
function checkAndSetupSendScan(uri, targetCoinType) {
    var parsed = HDWalletHelper.parseURI(uri);

    // Invalid
    if (!parsed) {
        return -1;
    }

    // Are we the type of coin we expect?
    var baseCoinFormatAddressType = {
        bitcoin: COIN_BITCOIN,
        'ether': COIN_ETHEREUM,
        'dash': COIN_DASH,
        'litecoin': COIN_LITECOIN,
        'lisk': COIN_LISK,
        'zcash': COIN_ZCASH,
        'dogecoin': COIN_DOGE
    }[parsed.coin];

    console.log("checkAndSetupSendScan :: " + JSON.stringify(parsed) + " :: baseCoinFormatAddressType :: " + baseCoinFormatAddressType + " :: targetCoinType :: " + targetCoinType);

    if (typeof(targetCoinType) !== 'undefined') {
        if (Registry.getCurrentCryptoController().name.toLowerCase() !== parsed.coin) {
            return -1;
        }
    }

    // Fill in the UI
    $('.tabContent .address input').val(parsed.address).trigger('keyup');
    if (parsed.amount) {
        $('.tabContent .amount input').val(parsed.amount).trigger('keyup');
    }

    return baseCoinType;
}

function checkSendScan(uri) {
    var parsed = HDWalletHelper.parseURI(uri);

    // Invalid
    if (!parsed) {
        return -1;
    }

    return {
        bitcoin: COIN_BITCOIN,
        'ether': COIN_ETHEREUM,
        'dash': COIN_DASH,
        'litecoin': COIN_LITECOIN,
        'lisk': COIN_LISK,
        'zcash': COIN_ZCASH,
        'doge': COIN_DOGE
    }[parsed.coin];
}

function prepareSweepTxCallbackForPrivateKeyImport(error, info, coinType) {
    // This is called when the user enters their private key and then hits 'Next'
    var feedbackMessage = "";
    if (error) {
        // Error
        // This code runs when the private key specified is simply invalid
        console.log('Sweep error: ' + error.message);
        $('.settings.confirmSweepPrivateKey .button').hide();
        feedbackMessage = "Error Scanning Private Key";
    }
    else if (info) {
        // Plenty of funds
        // This code runs when the private key specified has plenty of funds available for a transaction
        var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinAbbreviatedName'];
        wallet.setPreparedTransactionPrivateKeyInput(info.signedTransaction);
        $('.settings.confirmSweepPrivateKey .button').addClass('enabled').addClass('cssEnabled');
        $('.settings.confirmSweepPrivateKey .button').show();
        feedbackMessage = "The Balance for this Private Key is " + info.totalValue + " " + coinAbbreviatedName;
    }
    else {
        // Not enough funds
        // This code runs when the private key specified does have enough funds for a transaction
        $('.settings.confirmSweepPrivateKey .button').hide();
        feedbackMessage = "Insufficient Balance";
    }

    $('.settings.confirmSweepPrivateKey .spinner').text(feedbackMessage);
}

function prepareSweepTxCallbackForPrivateKeyScansWithCamera(error, info) {
    // This is called when the user enters their private key and then hits 'Next'
    var feedbackMessage = "";
    if (error) {
        // Error
        // This code runs when the private key specified is simply invalid
        console.log('Sweep error: ' + error.message);
        g_JaxxApp.getUI().closeMainMenu();
        feedbackMessage = "Error Scanning Private Key";
    }
    else if (info) {
        // Plenty of funds
        // This code runs when the private key specified has plenty of funds available for a transaction
        var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).pouchParameters['coinAbbreviatedName'];
        wallet.setPreparedTransactionPrivateKeyInput(info.signedTransaction);
        $('.settings.confirmSweepPrivateKey .button').addClass('enabled').addClass('cssEnabled');
        $('.settings.confirmSweepPrivateKey .button').show();
        feedbackMessage = "The Balance for this Private Key is " + info.totalValue + coinAbbreviatedName;
    }
    else {
        // Not enough funds
        // This code runs when the private key specified does have enough funds for a transaction

        // User feeback message when the balance is insufficient for the given Private Key
        $('.settings.confirmSweepPrivateKey .amount').text('Insufficient Balance');
        $('.settings.confirmSweepPrivateKey .button').hide();
        feedbackMessage = "Insufficient Balance";
    }

    $('.settings.confirmSweepPrivateKey .amount').text(feedbackMessage);
    $('.settings.confirmSweepPrivateKey .spinner').hide();
}

function sendTransaction() {
    var now = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(now - lastSentTimestampSeconds) > 2) {
        //force two seconds before sending next tx
        lastSentTimestampSeconds = Math.floor(new Date().getTime() / 1000);
        var data = wallet.getPouchFold(curCoinType).getTransactionData();
        g_JaxxApp._dataStoreController.onSendTransactionStart(data);

        if (data) {
            if (curCoinType === COIN_BITCOIN) {
                wallet.getPouchFold(curCoinType).getPouchFoldImplementation().sendBitcoinTransaction(data.transaction, function (response, tx) {
                    if (response.status == 'success' || response == 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else {
                        Navigation.flashBanner('Error: ' + response.message, 5);
                        console.log('Error', response.message);
                    }

                    //Always update the tx history for sends
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_ETHEREUM) {
                var txArray = wallet.getPouchFold(curCoinType).getPouchFoldImplementation().constructEthereumTransactionListFromReadyTransactionList(data.readyTxArray);

                if (typeof(txArray) !== 'undefined' && txArray !== null) {
                    g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_ETHEREUM, {txArray: txArray}, function (result) {
                        console.log("sendTransaction :: result :: " + result);
                        if (result === 'success') {
                            $('.tabContent .address input').val('');
                            $('.tabContent .amount input').val('').trigger('keyup');

                            setTimeout(function () {
                                playSound("snd/balance.wav", null, null);
                                Navigation.flashBanner('Transaction Sent', 3, 'success');
                            }, 1500);

                            Navigation.returnToDefaultView();
                            Navigation.hideTransactionHistoryDetails();
                        }
                        else if (result === 'failure') {
                            //All of the batch failed
                            Navigation.flashBanner('Transaction Failed', 5, 'error');
                            console.log('Error', status);
                        }
                        else {
                            // Partial failure
                            // Some of the batch succeeded, some failed
                            $('.tabContent .address input').val('');
                            $('.tabContent .amount input').val('').trigger('keyup');
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Batch Transaction Failed', 5);
                            Navigation.returnToDefaultView();
                            Navigation.hideTransactionHistoryDetails();
                        }

                        //Always update the tx history for sends.
                        forceUpdateWalletUI();
                    });
                }
                else {
                    console.prepareAddresseslog("[ sendTransaction ] :: ethereum :: error :: cannot build txList for send :: " + txArray);
                }
            }
            else if (curCoinType === COIN_ETHEREUM_CLASSIC) {
                g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_ETHEREUM_CLASSIC, data, function (result) {
                    console.log("sendTransaction :: result :: " + result);
                    if (result === 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else if (result === 'failure') {
                        //All of the batch failed
                        Navigation.flashBanner('Transaction Failed', 5, 'error');
                        console.log('Error', status);
                    }
                    else {
                        //Partial failure.
                        //Some of the batch succeeded, some failed

                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');
                        playSound("snd/balance.wav", null, null);
                        Navigation.flashBanner('Batch Transaction Failed', 5);
                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_THEDAO_ETHEREUM ||
                curCoinType === COIN_AUGUR_ETHEREUM ||
                curCoinType === COIN_GOLEM_ETHEREUM ||
                curCoinType === COIN_GNOSIS_ETHEREUM ||
                curCoinType === COIN_ICONOMI_ETHEREUM ||
                curCoinType === COIN_SINGULARDTV_ETHEREUM ||
                curCoinType === COIN_DIGIX_ETHEREUM ||
                curCoinType === COIN_BLOCKCHAINCAPITAL_ETHEREUM ||
                curCoinType === COIN_CIVIC_ETHEREUM) {
                g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_ETHEREUM, data, function (result) {
                    console.log("sendTransaction :: result :: " + result);
                    if (result === 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else if (result === 'failure') {
                        //All of the batch failed:
                        Navigation.flashBanner('Error: Please check to ensure you have enough ether on this address', 15, 'error');
                        console.log('Error', status);
                    }
                    else {
                        //Partial failure.
                        //Some of the batch succeeded, some failed
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');
                        playSound("snd/balance.wav", null, null);
                        Navigation.flashBanner('Batch Transaction: Some Failed', 5);
                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_DASH) {
                wallet.getPouchFold(curCoinType).getPouchFoldImplementation().sendDashTransaction(data.transaction, function (response, tx) {
                    if (response.status == 'success' || response == 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else {
                        Navigation.flashBanner('Transaction Failed', 3, 'error');
                        console.log('Error', response.message);
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_LITECOIN) {
                wallet.getPouchFold(curCoinType).getPouchFoldImplementation().sendLitecoinTransaction(data.transaction, function (response, tx) {
                    if (response.status == 'success' || response == 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else {
                        Navigation.flashBanner('Transaction Failed', 3, 'error');
                        console.log('Error', response.message);
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_ZCASH) {
                wallet.getPouchFold(curCoinType).getPouchFoldImplementation().sendZCashTransaction(data.transaction, function (response, tx) {
                    if (response.status == 'success' || response == 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else {
                        Navigation.flashBanner('Transaction Failed', 3, 'error');
                        console.log('Error', response.message);
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_TESTNET_ROOTSTOCK) {
                g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_TESTNET_ROOTSTOCK, data, function (result) {
                    console.log("sendTransaction :: result :: " + result);
                    if (result === 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else if (result === 'failure') {
                        //All of the batch failed:
                        Navigation.flashBanner('Transaction Failed', 3, 'error');
                        console.log('Error', status);
                    }
                    else {
                        //Partial failure.
                        //Some of the batch succeeded, some failed:

                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');
                        playSound("snd/balance.wav", null, null);
                        Navigation.flashBanner('Batch Transaction: Some Failed', 3);
                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
            else if (curCoinType === COIN_DOGE) {
                wallet.getPouchFold(curCoinType).getPouchFoldImplementation().sendDogeTransaction(data.transaction, function (response, tx) {
                    if (response.status == 'success' || response == 'success') {
                        $('.tabContent .address input').val('');
                        $('.tabContent .amount input').val('').trigger('keyup');

                        setTimeout(function () {
                            playSound("snd/balance.wav", null, null);
                            Navigation.flashBanner('Transaction Sent', 3, 'success');
                        }, 1500);

                        Navigation.returnToDefaultView();
                        Navigation.hideTransactionHistoryDetails();
                    }
                    else {
                        console.log('Error', response.message);
                    }

                    //Always update the tx history for sends.
                    forceUpdateWalletUI();
                });
            }
        }
    }
    else {
        console.log("Already sending another tx. Please wait a few seconds");
    }
}

function specialAction(actionName, element) {

    console.log('%c specialAction ' + actionName + ' ' + element[0].className, 'color:green');

    if (actionName.indexOf(',') > -1) {
        // For multiple actions
        specialAction(actionName.slice(0, actionName.lastIndexOf(',')), element);
        actionName = actionName.slice(actionName.lastIndexOf(',') + 1, actionName.length);
    }

    if (typeof(element) !== 'undefined' && element !== null) {
        var classes = element.attr("class");

        if (classes.indexOf('optionPairFromDeviceStart') !== -1) {
            localStorage.setItem('on-start', 'pair-device');

        }
        else if (classes.indexOf('optionCreateNewWallet') !== -1) {
            localStorage.setItem('on-start', 'new-wallet');
        }

        if (classes === 'cssMenuWindowOptionItem menuWindowOptionWallets scriptAction') {
            jaxx.Registry.application.showWallets();
        }

    }
    else {

    }

    if (typeof(ethereumUnlocked) === 'undefined' || ethereumUnlocked === null || ethereumUnlocked === false) {
        if (actionName !== 'refresh' && ethereumSecretProgress !== 4) {
            ethereumSecretProgress = 0;
        }
    }

    if (actionName.substr(0, actionName.indexOf('.')) === 'jaxx_ui') {
        if (actionName.indexOf('.') < actionName.length - 1) {
            var strFunctionToCallInModule = actionName.substr(actionName.indexOf('.') + 1);
            g_JaxxApp.getUI()[strFunctionToCallInModule](element);
        }
    }

    if (actionName.substr(0, actionName.indexOf('.')) === 'jaxx_ui_intro') {
        if (actionName.indexOf('.') < actionName.length - 1) {
            var strFunctionToCallInModule = actionName.substr(actionName.indexOf('.') + 1);
            g_JaxxApp.getUI().getIntro()[strFunctionToCallInModule](element);
        }
    }

    if (actionName.substr(0, actionName.indexOf('.')) === 'jaxx_controller') {
        if (actionName.indexOf('.') < actionName.length - 1) {
            var strFunctionToCallInModule = actionName.substr(actionName.indexOf('.') + 1);
            g_JaxxApp.getController()[strFunctionToCallInModule](element);
        }
    }

    if (actionName === 'testActionopen') {
        g_JaxxApp.getUI().openSendModal();
    }

    if (actionName === 'testActionclose') {
        g_JaxxApp.getUI().closeSendModal();
    }

    if (actionName === 'refresh') {
        jaxx.Registry.current_crypto_controller.downloadBalancesAll(function (error) {
            //console.log(error);
        });

        $('.refresh').addClass('cssActive');

        setTimeout(function () {
            $('.refresh').removeClass('cssActive');
        }, 400);

    }
    else if (actionName === 'sendConfirm') {
        Navigation.closeModal();
        Navigation.closeNotificationBanner('.cssSendConfirmation');
        Navigation.closeNotificationBanner('.cssShapeShiftConfirmation');

        if (g_JaxxApp.getUser().hasPin()) {
            g_JaxxApp.getUI().showEnterPinModal(function (error) {
                if (error) {
                    console.log("enter pin error :: " + error);
                }
                else {
                    sendTransaction();
                }
            });
        }
        else {
            sendTransaction();
        }
    }
    else if (actionName === 'scanPayment') {

        if (window.native && window.native.scanCode) {

            function queryStringToJSON(input) {
                var pairs = input.slice(1).split('&');

                var result = {};
                pairs.forEach(function (pair) {
                    pair = pair.split('=');
                    result[pair[0]] = decodeURIComponent(pair[1] || '');
                });

                return result;
            }

            var processScan = function (uri) {
                console.log("scanPayment :: found uri :: " + uri);
                var foldMainCoinType = curCoinType;
                var currentCrypto = Registry.getCurrentCryptoController();

                var uriValidationRegex = new RegExp('^([A-z0-9]*):([A-z0-9]*)(\\?.*)?$');
                var address = "";
                var parameters = null;
                var isValid = false;
                var inputComponents = uriValidationRegex.exec(uri);

                if (inputComponents !== null) // did the QR code we just scanned have a form of <coinName>:<address>?parameters?
                {
                    address = inputComponents[2];
                    if (inputComponents.length >= 3 && inputComponents[3] !== undefined && inputComponents[3] !== null) {
                        var sanitzerRegex = new RegExp(/^[\%A-z0-9\=\-\_\&\?\.\"]+$/); // allows only A to z 0 to 9, =-_&?%."
                        if (sanitzerRegex.test(inputComponents[3])) // we'll only process the parameters if they pass the sanitizing test
                        {
                            parameters = queryStringToJSON(inputComponents[3])
                        }
                    }
                } else { // QR form not recognized, let's take whatever looks like a crypto address
                    var addressLookingRegex = new RegExp('([A-z0-9]{14,})'); // that means at least 14 characters with no spaces in between them
                    var detectionResult = addressLookingRegex.exec(uri);
                    if (detectionResult !== null && detectionResult.length >= 1) {
                        address = detectionResult[1];
                    }
                }

                var isValid = false;
                try {
                    isValid = currentCrypto.validateAddress(address);
                } catch (e) {
                    isValid = false;
                }
                if (isValid) {
                    $('.tabContent .address input').val(address).trigger('keyup');

                    if (parameters !== null && parameters['amount']) {
                        var amountGuardRegex = new RegExp(/^[0-9\.]+$/);

                        if (amountGuardRegex.test(parameters['amount'])) {
                            $('#amountSendInput').val(parameters['amount']);
                        }
                    }
                } else {
                    Navigation.flashBanner("QR input could not be validated.", 2, 'error', {close: false});
                }

            };

            Navigation.clearInputFields();
            native.scanCode(processScan);
        }
    }
    else if (actionName === 'scanPrivateKey') {
        if (window.native && window.native.scanCode) {
            var processScan = function (uri) {
                console.log("scanPrivateKey :: found qr :: " + uri);
                $('#privateKeySweep').val(uri).trigger('keyup');
            };

            $('#privateKeySweep').val('').trigger('keyup');
            Navigation.clearInputFields();
            native.scanCode(processScan);
        }
    }
    else if (actionName === 'quickVerifyMnemonic.prepare') {
        var words = wallet.getMnemonic().split(' ');
        var index = parseInt(Math.random() * words.length);

        var ordinalIndex = [
            'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
            'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth',
            'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', ' twenty-first', 'twenty-second',
            'twenty-third', 'twenty-fourth'
        ][index];

        var input = $('.settings.quickVerifyMnemonic input');
        input.data('word', words[index]);
        input.attr('placeholder', input.attr('placeholderFormat').replace('%s', ordinalIndex));
        input.val('');

    }
    else if (actionName === 'viewJaxxToken.prepare') {
        var mnemonic = getStoredData('mnemonic', true);
        var uri = "jaxx:" + thirdparty.bip39.mnemonicToEntropy(mnemonic);

        var qrCodeImage = thirdparty.qrImage.imageSync(uri, {
            type: "png",
            ec_level: "H"
        }).toString('base64');

        $(".settings.viewJaxxToken .jaxxToken img").attr("src", "data:image/png;base64," + qrCodeImage);
        $('.populateMnemonic').text(mnemonic);
    }
    else if (actionName === 'viewJaxxBackupPhrase.prepare') {
        var mnemonic = getStoredData('mnemonic', true);
        var uri = "jaxx:" + thirdparty.bip39.mnemonicToEntropy(mnemonic);

        var qrCodeImage = thirdparty.qrImage.imageSync(uri, {
            type: "png",
            ec_level: "H"
        }).toString('base64');

        $(".settings.viewJaxxToken.cssSettings.cssShowMnemonic img").attr("src", "data:image/png;base64," + qrCodeImage);
        $(".settings.viewJaxxBackupPhrase .jaxxToken img").attr("src", "data:image/png;base64," + qrCodeImage);
        $('.populateMnemonic').text(mnemonic);
    }
    else if (actionName === 'importMnemonic.import') {
        g_JaxxApp.getController().clickContinuePairFromDevice(element);
    }
    else if (actionName === 'confirmBackup') {
        $('#backupTextBox').val('');
        g_JaxxApp.getUI().closeMainMenu();
        wallet.confirmBackup();
    }
    else if (actionName === 'sweepPrivateKey.prepare') {
        g_JaxxApp.getUI().setStandardMessageForTransferPaperWallet();
        var privateKey = $('#privateKeySweep').val();
        var coinType = g_JaxxApp.getUI().getTransferPaperWalletCoinType();
        wallet.getPouchFold(coinType).prepareSweepTransaction(privateKey, prepareSweepTxCallbackForPrivateKeyImport);
        var privateKey = $('#privateKeySweep').val('').trigger('keyup');
    }
    else if (actionName === 'sweepPrivateKey.tryToDecrypt') {
        $('#bip38ProgressDiv').show();
        var pass = $('.settings.sweepPrivateKeyPasswordEntry input').val();
        var pvtkey = $('#privateKeySweep').val();
        var nextSweepPassBehaviours = buttonBehaviours['nextSweepPass'];
        nextSweepPassBehaviours.disableButton();

        setTimeout(function () {
            var unencrypted = "";
            var validResult = false;
            if (curCoinType === COIN_BITCOIN) {
                unencrypted = tryToDecryptBIP38KeySync(pvtkey, pass);
                // Currently there is no way to tell if the pass is wrong
                if (isValidBTCPrivateKey(unencrypted)) {
                    validResult = true;
                }
            }
            else if (curCoinType === COIN_ETHEREUM) {
                unencrypted = decryptETHKey(pvtkey, pass);
                if (isValidETHPrivateKey(unencrypted)) {
                    validResult = true;
                }
            }
            else if (curCoinType === COIN_DASH) {
                unencrypted = tryToDecryptBIP38KeySync(pvtkey, pass);
                // Currently there is no way to tell if the pass is wrong
                // This should work properly
                if (isValidBTCPrivateKey(unencrypted, HDWalletPouchDash.networkDefinitions.mainNet)) {
                    validResult = true;
                }
            }

            $('#bip38ProgressDiv').hide();

            if (validResult === true) {
                $('#privateKeySweep').val(unencrypted);
                specialAction('sweepPrivateKey.prepare');
                Navigation.pushSettings('confirmSweepPrivateKey');
                $('.settings.sweepPrivateKeyPasswordEntry input').val('').trigger('keyup');
            }
            else {
                console.log("invalid password");
                shake($('.nextSweepPass'));
            }

            var nextSweepPassBehaviours = buttonBehaviours['nextSweepPass'];
            nextSweepPassBehaviours.enableButton();

        }, 500);
    }
    else if (actionName === 'sweepPrivateKey.execute') {
        // Paper wallet replace
        var signedTransaction = wallet.getPreparedTransactionPrivateKeyInput();
        var coinType = g_JaxxApp.getUI().getTransferPaperWalletCoinType();
        var callback = g_JaxxApp.getUI().sweepPrivateKeyExecuteCallback;
        wallet.getPouchFold(coinType).getPouchFoldImplementation().sendTransaction(signedTransaction, callback, null, -1);
    }
    else if (actionName === 'onename.register') {
        var onename = $(element).data('onename');
        Onename.registerUsername(onename, wallet.getOnenameAddress(), function (error, success) {
            console.log(success, error);
            if (error) {
                console.log('Onename error', error);
            }
            else {
                wallet.setOnename(onename);
                Navigation.flashBanner('Onename request sent', 5);
                Navigation.clearSettings();
            }
        });

    }
    else if (actionName === 'scan') {
        // Middle camera button functionality
        var processScan = function (uri) {
            console.log("scan :: found uri :: " + uri);
            //Check for sending uri
            var foundScanSendCoinType = checkSendScan(uri);

            if (foundScanSendCoinType != -1) {
                console.log("scan send :: found coin type :: " + foundScanSendCoinType);
                switchToCoinType(foundScanSendCoinType, null, function () {
                    Navigation.showTab('send');
                    checkAndSetupSendScan(uri);
                });
            }
            else if (isValidBTCPrivateKey(uri)) {
                //Check this out for dash & other bitcoin-like coins
                console.log("scan ::  valid private key for BTC :: ");
                wallet.getPouchFold(COIN_BITCOIN).prepareSweepTransaction(uri, prepareSweepTxCallbackForPrivateKeyScansWithCamera);

                if (curCoinType != COIN_BITCOIN) {
                    switchToCoinType(COIN_BITCOIN, null, function () {
                        Navigation.pushSettings('confirmSweepPrivateKey');
                    });
                }
                else {
                    Navigation.pushSettings('confirmSweepPrivateKey');
                }
            }
            else if (isValidBTCPrivateKey(uri, HDWalletPouchDash.networkDefinitions.mainNet)) {
                console.log("scan ::  valid private key for DASH :: ");
                wallet.getPouchFold(COIN_DASH).prepareSweepTransaction(uri, prepareSweepTxCallbackForPrivateKeyScansWithCamera);

                if (curCoinType != COIN_DASH) {
                    switchToCoinType(COIN_DASH, null, function () {
                        Navigation.pushSettings('confirmSweepPrivateKey');
                    });
                }
                else {
                    Navigation.pushSettings('confirmSweepPrivateKey');
                }
            }
            else if (isValidBTCPrivateKey(uri, HDWalletPouchLitecoin.networkDefinitions.mainNet)) {
                console.log("scan ::  valid private key for LITECOIN :: ");
                wallet.getPouchFold(COIN_LITECOIN).prepareSweepTransaction(uri, prepareSweepTxCallbackForPrivateKeyScansWithCamera);

                if (curCoinType != COIN_LITECOIN) {
                    switchToCoinType(COIN_LITECOIN, null, function () {
                        Navigation.pushSettings('confirmSweepPrivateKey');
                    });
                }
                else {
                    Navigation.pushSettings('confirmSweepPrivateKey');
                }
            }
            else if (isValidBTCPrivateKey(uri, HDWalletPouchZCash.networkDefinitions.mainNet)) {
                console.log("scan ::  valid private key for ZCASH :: ");
                wallet.getPouchFold(COIN_ZCASH).prepareSweepTransaction(uri, prepareSweepTxCallbackForPrivateKeyScansWithCamera);

                if (curCoinType != COIN_ZCASH) {
                    switchToCoinType(COIN_ZCASH, null, function () {
                        Navigation.pushSettings('confirmSweepPrivateKey');
                    });
                }
                else {
                    Navigation.pushSettings('confirmSweepPrivateKey');
                }
            }
            else if (isValidETHPrivateKey(uri)) {
                console.log("scan ::  valid private key for ETH :: ");
                wallet.getPouchFold(COIN_ETHEREUM).prepareSweepTransaction(uri, prepareSweepTxCallbackForPrivateKeyScansWithCamera);

                if (curCoinType != COIN_ETHEREUM) {
                    switchToCoinType(COIN_ETHEREUM, null, function () {
                        Navigation.pushSettings('confirmSweepPrivateKey');
                    });
                }
                else {
                    Navigation.pushSettings('confirmSweepPrivateKey');
                }

            }
            else if (isValidETHAESkey(uri)) {
                console.log("scan ::  valid encrypted private key for ETH :: ");
                if (curCoinType != COIN_ETHEREUM) {
                    switchToCoinType(COIN_ETHEREUM, null, function () {
                        $('#privateKeySweep').val(uri).trigger('keyup');
                        Navigation.pushSettings('sweepPrivateKeyPasswordEntry');
                    });
                }
                else {
                    $('#privateKeySweep').val(uri).trigger('keyup');
                    Navigation.pushSettings('sweepPrivateKeyPasswordEntry');
                }
            }
            else if (isValidBIP38key(uri)) {
                console.log("scan ::  valid encrypted BIP38 private key for BTC :: ");
                loadScript('js/thirdparty/bip38-dist.js', callBackOnLoadBIP38Internal, callBackOnErrLoadBIP38);
                if (curCoinType != COIN_BITCOIN) {
                    switchToCoinType(COIN_BITCOIN, null, function () {
                        $('#privateKeySweep').val(uri).trigger('keyup');
                        Navigation.pushSettings('sweepPrivateKeyPasswordEntry');
                    });
                }
                else {
                    $('#privateKeySweep').val(uri).trigger('keyup');
                    Navigation.pushSettings('sweepPrivateKeyPasswordEntry');
                }
            }
            else if (isValidBTCPrivateKey(uri, HDWalletPouchDoge.networkDefinitions.mainNet)) {
                console.log("scan ::  valid private key for DOGE :: ");
                wallet.getPouchFold(COIN_DOGE).prepareSweepTransaction(uri, prepareSweepTxCallbackForPrivateKeyScansWithCamera);
                if (curCoinType != COIN_DOGE) {
                    switchToCoinType(COIN_DOGE, null, function () {
                        Navigation.pushSettings('confirmSweepPrivateKey');
                    });
                }
                else {
                    Navigation.pushSettings('confirmSweepPrivateKey');
                }
            }
            else {
                var jaxxToken = uri;

                parseJaxxToken(jaxxToken, function (err, newWallet) {
                    if (err) {
                        console.log("scan for Jaxx token :: error :: " + err);
                    }
                    else {
                        scanImportWallet = newWallet;
                        Navigation.openModal('scanPrivate');
                    }
                });
            }
        };

        Navigation.clearInputFields();
        native.scanCode(processScan);
    }
    else if (actionName === 'confirmImportPrivateKey') {
        if (typeof(scanImportWallet) !== 'undefined' && scanImportWallet != null) {
            setTimeout(function () {

                setTimeout(function () {
                    _loadWallet(scanImportWallet);
                    scanImportWallet = null;
                    Navigation.closeModal();
                }, 1000);

                Navigation.clearSettings();
                Navigation.openModal('loading');
            }, 500);
        }
        else {
            console.log("no private key code to import");
        }
    }
    else if (actionName === 'cancelImportPrivateKey') {
        scanImportWallet = null;
    }
    else if (actionName === 'resetCache') {
        g_JaxxApp._settings.resetJaxxCache();
        localStorage.setItem('walletType', 'pair-device');
        location.reload();
    }
    else if (actionName === 'showJaxxNews') {
        g_JaxxApp.getUI().closeMainMenu();
        g_JaxxApp.getUI().displayJaxxNews();
    }
    else if (actionName === "toggleQuickFiatCurrencySelector") {
        g_JaxxApp.getUI().toggleQuickFiatCurrencySelector();
    }
    else if (actionName === "setDefaultCurrencyFromMenu") {
        g_JaxxApp.getUI().setDefaultCurrencyFromMenu(element);
    }
    else if (actionName === 'quickFiatCurrencySwitch') {
        g_JaxxApp.getUI().quickFiatCurrencySwitch(element);
    }
    else if (actionName === 'showDAORefund') {
        g_JaxxApp.getUI().showDAORefund(element);
    }
    else if (actionName === 'confirmDAORefund') {
        g_JaxxApp.getUI().confirmDAORefund(element);
    }
    else if (actionName === 'toggleShapeshiftCoinSelector') {
        g_JaxxApp.getUI().toggleShapeshiftCoinList();
    }
    else if (actionName === 'toggleMainMenu') {
        g_JaxxApp.getUI().toggleMainMenu();
    }
    else if (actionName === 'enableOptionTab') {
        if (element.attr('value') === 'menu') {
            g_JaxxApp.getUI().mainMenuShowMenu();
        }
        else if (element.attr('value') === 'wallets') {
            g_JaxxApp.getUI().mainMenuShowWallets();
        }
        else if (element.attr('value') === 'currencies') {
            g_JaxxApp.getUI().mainMenuShowCurrencies();
        }
    }
    else if (actionName === 'toggleCurrency') {
        Navigation.toggleCurrency(element.attr("value"));
    }
    else if (actionName === 'toggleCryptoCurrency') {
        g_JaxxApp.getUI().toggleCryptoCurrencyIsEnabled(element.attr("value"));
    }
    else if (actionName === 'slideBannerLeft') {
        g_JaxxApp.getUI().slideBannerLeft();
    }
    else if (actionName === 'slideBannerRight') {
        g_JaxxApp.getUI().slideBannerRight();
    }
    else if (actionName === 'leftCoinBannerClicked') {
        g_JaxxApp.getUI().leftCoinBannerClicked(element.attr('value'));
    }
    else if (actionName === 'centerCoinBannerClicked') {
        g_JaxxApp.getUI().centerCoinBannerClicked(element.attr('value'));
    }
    else if (actionName === 'rightCoinBannerClicked') {
        g_JaxxApp.getUI().rightCoinBannerClicked(element.attr('value'));
    }
    else if (actionName === 'selectShapeshiftCoin') {
        g_JaxxApp.getUI().selectShapeshiftCoin(element.attr('value'));
    }
    else if (actionName === 'changeShapeshiftCoinToNextCoinType') {
        g_JaxxApp.getUI().changeShapeshiftCoinToNextCoinType(element.attr('value'));
    }
    else if (actionName === 'toggleIgnoreEtcEthSplit') {
        g_JaxxApp.getUI().toggleIgnoreEtcEthSplit();
    }
    else if (actionName === 'checkForEtcEthSplit') {
        g_JaxxApp.getUI().checkForEtcEthSplit();
    }
    else if (actionName === 'confirmEtcEthSplit') {
        g_JaxxApp.getUI().confirmEtcEthSplit();
    }
    else if (actionName === 'selectWalletsSetupOption') {
        g_JaxxApp.getUI().getIntro().selectWalletsSetupOption($(element).find('.radioBtnExpressCustom').attr('value'));
        var selectedOption = $(element).find('.radioBtnExpressCustom').attr('value');
        storeData("setUpTypeSelectedOption", selectedOption);
    }
    else if (actionName === 'pairDevicesWalletsSetupOption') {
        g_JaxxApp.getUI().getIntro().pairDevicesWalletsSetupOption($(element).find('.radioBtnPDExpressCustom').attr('value'));
    }
    else if (actionName === 'pressContinueSetupOption') {
        g_JaxxApp.getUI().getIntro().pressContinueSetupOption();
    }
    else if (actionName === 'toggleExpandSetupOption') {
        g_JaxxApp.getUI().getIntro().toggleExpandSetupOption($(element).attr('value'));
    }
    else if (actionName === 'toggleExpandPDOption') {
        g_JaxxApp.getUI().getIntro().toggleExpandPDOption($(element).attr('value'));
    }
    else if (actionName === 'TakeMeToMyWallet') {
        g_JaxxApp.getUI().getIntro().takeMeToMyWallet();
    }
    else if (actionName === 'pressContinueCustomWallets') {
        g_JaxxApp.getUI().getIntro().pressContinueCustomWallets();
    }
    else if (actionName === 'pressContinueCustomCurrencies') {
        g_JaxxApp.getUI().getIntro().pressContinueCustomCurrencies();
    }
    else if (actionName === 'toggleCoinIsEnabledCustom') {
        g_JaxxApp.getUI().getIntro().toggleCoinIsEnabledCustom(HDWalletHelper.dictCryptoCurrency[$(element).attr('value')].index);
    }
    else if (actionName === 'toggleFiatUnitCustom') {
        g_JaxxApp.getUI().getIntro().toggleFiatUnitCustom($(element).attr('value'));
    }
    else if (actionName === 'selectCoinOptionExpress') {
        g_JaxxApp.getUI().getIntro().selectCoinOptionExpress(HDWalletHelper.dictCryptoCurrency[$(element).attr('value')].index);
    }
    else if (actionName === 'pressNextButtonAtVerifyMnemonic') {
        g_JaxxApp.getUI().getIntro().pressNextAtVerifyMnemonic();
    }
    else if (actionName === 'skipPINSetup') {
        g_JaxxApp.getUI().getIntro().skipPINSetup();
    }
    else if (actionName === 'clickCheckboxTermsOfService') {
        g_JaxxApp.getUI().getIntro().clickCheckboxTermsOfService($(element).prop('checked'));
    }
    else if (actionName === 'showTermsOfService') {
        g_JaxxApp.getUI().getIntro().showTermsOfService();
    }
    else if (actionName === 'hideTermsOfService') {
        g_JaxxApp.getUI().getIntro().hideTermsOfService();
    }
    else if (actionName === 'btnContinueTermsOfService') {
        g_JaxxApp.getUI().getIntro().btnContinueTermsOfService();
    }
    else if (actionName === 'clickCancelTermsOfService') {
        g_JaxxApp.getUI().getIntro().clickCancelTermsOfService();
    }
    else if (actionName === 'toggleCheckboxTermsOfService') {
        g_JaxxApp.getUI().getIntro().toggleCheckboxTermsOfService();
    }
    else if (actionName === 'clickContinueSetupPIN') {
        g_JaxxApp.getUI().getIntro().clickContinueSetupPIN();
    }
    else if (actionName === 'clickContinueConfirmPIN') {
        g_JaxxApp.getUI().getIntro().clickContinueConfirmPIN();
    }
    else if (actionName === 'clickBackConfirmPinScreen') {
        g_JaxxApp.getUI().getIntro().clickBackConfirmPinScreen();
    }
    else if (actionName === 'enterPinCodeCustomIntroOption') {
        g_JaxxApp.getUI().getIntro().enterPinCodeCustomIntroOption();
    }
    else if (actionName === 'toggleExpandSetupSecurityPinDescription') {
        g_JaxxApp.getUI().getIntro().toggleExpandSetupSecurityPinDescription();
    }
    else if (actionName === 'toggleExpandBackupMnemonicDescription') {
        g_JaxxApp.getUI().getIntro().toggleExpandBackupMnemonicDescription();
    }
    else if (actionName === 'populateAllUserKeys') {
        g_JaxxApp.getUI().getIntro().populateAllUserKeys();
    }
    else if (actionName === 'toggleExpandSplashOption') {
        g_JaxxApp.getUI().getIntro().toggleExpandSplashOption($(element).attr('value'));
    }
    else if (actionName === 'selectSplashSetupOption') {
        g_JaxxApp.getUI().getIntro().selectSplashSetupOption($(element).find('.radioBtnSplashOption').attr('value'));
    }
    else if (actionName === 'splashOptionClicked') {
        g_JaxxApp.getUI().getIntro().splashOptionClicked($(element).attr('value'));
    }
    else if (actionName === 'pressContinueSplashOption') {
        g_JaxxApp.getUI().getIntro().pressContinueSplashOption();
    }
    else if (actionName === 'clickViewKeysButton') {
        g_JaxxApp.getUI().getIntro().clickViewKeysButton();
    }
    else if (actionName === 'toggleHeightForCurrenciesListCustomIntroOption') {
        g_JaxxApp.getUI().getIntro().toggleHeightForCurrenciesListCustomIntroOption();
        g_JaxxApp.getUI().toggleClosestAncestorExpandableText(element);
    }
    else if (actionName === 'toggleClosestAncestorExpandableText') {
        g_JaxxApp.getUI().toggleClosestAncestorExpandableText(element);
    }
    else if (actionName === 'jaxxClearAppDataIfAuthenticated') {
        g_JaxxApp.getUI().jaxxClearAppDataIfAuthenticated();
    }
    else if (actionName === 'hideVerifyMnemonicButton') {
        // Hides the target button
        $($(".settings.verifyMnemonic .validateMnemonic").attr('targetButton')).hide();
        // Hides the success text
        $('.verifyMnemonic .backupPhraseConfirmText').hide();
    }
    else if (actionName === 'clickProceedToBackupToShowMnemonic') {
        g_JaxxApp.getUI().getIntro().clickProceedToBackupToShowMnemonic();
    }
    else if (actionName === 'checkClosestAncestorCheckable') {
        g_JaxxApp.getUI().checkClosestAncestorCheckable(element);
    }
    else if (actionName === 'clickCheckboxSecurityPinSetup') {
        g_JaxxApp.getUI().getIntro().clickCheckboxSecurityPinSetup();
    }
    else if (actionName === 'clickCheckboxDisplayBackupPhraseInIntro') {
        g_JaxxApp.getUI().getIntro().clickCheckboxDisplayBackupPhraseInIntro();
    }
    else if (actionName === 'clickCheckboxSettingsBackupMnemonicPage') {
        g_JaxxApp.getUI().clickCheckboxSettingsBackupMnemonicPage();
    }
    else if (actionName === 'clickCustomCurrencies') {
        g_JaxxApp.getUI().getIntro().clickCustomCurrencies();
    }
    else if (actionName === 'clearAllData') {
        localStorage.clear();
    }
    else if (actionName === 'clickContinueConfirmPINSettings') {
        Navigation.clearSettings();
        g_JaxxApp.getUI().toggleMainMenu();
    }
}

function scrollIntoView(tableElement, tableContainer, scrollContainer) {
    var scrollAmount = $(tableElement).position().top - $(tableContainer).position().top;
    $(scrollContainer).scrollTop(scrollAmount);
}

// Called when a settings page comes on screen to handle special events
function specialOnEnter(page) {
    if (page === 'onenameComplete') {
        $('.settings.onenameComplete .populateOnename').text(wallet.getOnename());
    }
    else if (page === 'oennameTwitter') {
        $('.settings.onenameTwitter input').val('').trigger('keyup');
    }
}

function scriptAction(event) {
    var e = $(event.currentTarget);
    var effect = e.attr('effect');

    if (e.hasClass('stopPropagation')) {
        event.stopPropagation();
    }

    if (e.hasClass('disabled')) {
        return;
    }

    if (e.hasClass('button') && !e.hasClass('enabled')) {
        return;
    }

    if (e.hasClass('toggleClosestAncestorExpandableText')) {
        g_JaxxApp.getUI().toggleClosestAncestorExpandableText(event);
    }

    var pushSettings = e.attr('pushSettings');

    if (pushSettings) {
        Navigation.pushSettings(pushSettings);
        specialOnEnter(pushSettings);
    }

    if (e.attr('popSettings') == 'true') {
        Navigation.popSettings();
    }

    if (e.attr('clearSettings') == 'true') {
        Navigation.clearSettings();
    }

    var enable = (e.attr('enable') || '').split(',');

    for (var i = 0; i < enable.length; i++) {
        $(enable[i]).removeClass('disabled');
    }

    var disable = (e.attr('disable') || '').split(',');

    for (var i = 0; i < disable.length; i++) {
        $(disable[i]).addClass('disabled');
    }

    var hide = (e.attr('hide') || '').split(',');

    for (var i = 0; i < hide.length; i++) {
        if (effect === 'fade') {
            $(hide[i]).fadeOut();
        }
        else if (effect === 'slide') {
            $(hide[i]).slideUp();
        }
        else {
            $(hide[i]).hide();
        }
    }

    var show = (e.attr('show') || '').split(',');

    for (var i = 0; i < show.length; i++) {
        if (effect === 'fade') {
            $(show[i]).fadeIn();
        }
        else if (effect === 'slide') {
            $(show[i]).slideDown();
        }
        else {
            $(show[i]).show();
        }
    }

    var toggle = (e.attr('toggle') || '').split(',');

    for (var i = 0; i < toggle.length; i++) {
        if (effect === 'fade') {
            $(toggle[i]).fadeToggle();
        }
        else if (effect === 'slide') {
            $(toggle[i]).slideToggle();
        }
        else {
            $(toggle[i]).toggle();
        }
    }

    // Clear the input/textarea value in the attribute "clearValue"
    var clear = (e.attr('clearValue') || '').split(',');

    for (var i = 0; i < clear.length; i++) {
        $(clear[i]).val('').trigger('keyup');
    }

    var showTab = e.attr('showTab');

    if (showTab) {
        Navigation.showTab(showTab);
    }

    var toggleTab = e.attr('toggleTab');

    if (toggleTab) {
        Navigation.toggleTab(toggleTab);
    }

    var collapseTabs = e.attr('collapseTabs');

    if (collapseTabs === 'true') {
        Navigation.toggleTab();
    }

    var openModal = e.attr('openModal');

    if (openModal) {
        Navigation.openModal(openModal);
    }

    var closeModal = e.attr('closeModal');

    if (closeModal === 'true') {
        Navigation.closeModal();
    }

    var flashBanner = e.attr('flashBanner');

    if (flashBanner) {
        var timeout = e.attr('timeout');
        Navigation.flashBanner(flashBanner, timeout);
    }

    var special = e.attr('specialAction');

    if (special) {
        specialAction(special, e);
    }

    var specialActions = e.attr('specialActionMultipleActions');

    if (specialActions) {
        specialActionMultipleActions(specialActions, e);
    }

    var ethereumSecretSelector = e.attr('ethereumSecretSelector');

    if (typeof(ethereumUnlocked) === 'undefined' || ethereumUnlocked === null || ethereumUnlocked === false) {
        if (ethereumSecretSelector !== 'true' && !special) {
            ethereumSecretProgress = 0;
        }
    }
}

$('.tabContent .unitToggle').click(function () {
    // Open menu here
    Navigation.toggleUseFiat();
});

$('.pageSetBitcoinMiningFee .enterCustomMiningFee').keyup((function (event) {
    g_JaxxApp.getController().keyupCustomMiningOption($(event.currentTarget));
}));

$('.tabContent .address input').keyup((function () {
    //onename lookup functionality
    g_JaxxApp.getUI().updateHighlightingInSendTransactionButton();
    var input = $('.tabContent .address input');
    var onenameCache = {};

    return function () {
        if (input.val() !== "" && curCoinType === COIN_ETHEREUM) {
            var isValidAddress = ethereumAddressInputCheck();
            if (isValidAddress === false) {
                return;
            }
        }
        else {
            $('.ethereumChecksumAddressWarningText').slideUp();
        }

        var processData = function (data) {
            if (data.jaxxValue != input.val()) {
                return;
            }

            if (!data.v) {
                input.css({backgroundImage: 'none'}).removeClass('validOnename').removeClass('cssValidOnename');
                input.data('onename', false).data('address', false).data('showAddress', false);
                return;
            }

            var avatarImage = 'img/default-profile_360.png';

            if (data.avatar && data.avatar.url) {
                avatarImage = sanitizeOneNameAvatar(data.avatar.url);
            }

            input.css({backgroundImage: 'url(' + avatarImage + ')'});

            var name = 'unknown';

            if (data.name && data.name.formatted) {
                name = data.name.formatted;
            }

            var bitcoinAddress = null, truncatedBitcoinAddress = null;

            if (data.bitcoin && data.bitcoin.address) {
                bitcoinAddress = data.bitcoin.address;
                truncatedBitcoinAddress = bitcoinAddress.substring(0, 6) + '\u2026' + bitcoinAddress.substring(bitcoinAddress.length - 5);
            }

            var onenameData = {
                avatarImage: avatarImage,
                bitcoinAddress: bitcoinAddress,
                data: data,
                onename: data.jaxxValue,
                name: name,
                success: true,
                truncatedBitcoinAddress: truncatedBitcoinAddress
            };

            input.addClass('validOnename').addClass('cssValidOnename');
            input.data('onename', data.jaxxValue).data('address', bitcoinAddress).data('showAddress', truncatedBitcoinAddress);
            // Update the state of the button
            $('.tabContent .amount input').trigger('keyup');
        };

        input.data('onename', false).data('address', false);
        var continueOneNameCheck = true;
        var value = input.val()

        //Check if equals to shapeshift, avoid doing anything else
        if (value.toUpperCase() === "SHAPESHIFT") {
            console.warn(value.toUpperCase())
            if (g_JaxxApp.getShapeShiftHelper().getIsTriggered() !== true) {
                g_JaxxApp.getUI().showShapeShift();
            }

            continueOneNameCheck = false;
        }
        else {
            if (g_JaxxApp.getShapeShiftHelper().getIsTriggered()) {
                $('.spendable').slideDown(); // Hide Spendable line
                g_JaxxApp.getUI().resetShapeShift();
            }
        }

        var data = onenameCache[value];

        if (continueOneNameCheck === true && data) {
            processData(data);
        }
        else {
            RequestSerializer.getJSON('https://glacial-plains-9083.herokuapp.com/lookup.php?id=' + value, function (data) {
                data.jaxxValue = value;
                onenameCache[value] = data;
                processData(data);
            });
        }

        // Update the state of the button
        $('.tabContent .amount input').trigger('keyup');
    };

})()).change(function () {
    var input = $('.tabContent .address input');
    input.trigger('keyup');
}).focus(function () {
    var input = $('.tabContent .address input');
    if (input.data('onename') && input.data('address')) {
        input.val(input.data('onename'));
    }
}).blur(function () {
    var input = $('.tabContent .address input');
    if (input.data('onename') && input.data('address')) {
        var value = input.data('onename') + ' (' + truncate(input.data('address'), 5, 5) + ')';
        input.val(value);
    }
});

/* Limit input to 8 decimals (bitcoin) or 16 decimals (ethereum) */
function checkForDecimalLimits(inputField) {
    var returnString = "";
    var didModify = false;
    var numDecimals = 8;

    if (Navigation.isUseFiat()) {
        numDecimals = 2;
    }
    else {
        var displayNumDecimals = HDWalletPouch.getStaticCoinPouchImplementation(curCoinType).uiComponents['displayNumDecimals'];
        numDecimals = displayNumDecimals;
    }

    if (inputField.val().indexOf('.') != -1) {
        var inputFieldComponents = inputField.val().split(".");

        if (inputFieldComponents[1].length > numDecimals) {
            if (isNaN(parseFloat(inputField.val()))) {
                console.log("nan");
                return null;
            }
            didModify = true;
            returnString = parseFloat(inputFieldComponents[0] + "." + inputFieldComponents[1].substring(0, numDecimals));
        }
        else {
            didModify = false;
            returnString = inputField.val();
        }
    }
    else {
        didModify = true;
        returnString = null;
    }

    g_JaxxApp.getUI().updateHighlightingInSendTransactionButton();
    return JSON.stringify([didModify, returnString]);
}

$('.tabContent .amount input').keyup(function () {
    if ($('.tabContent .amount input').val() !== "") {
        var returnArray = JSON.parse(checkForDecimalLimits($('.tabContent .amount input')));
        var didModify = returnArray[0];
        var valueString = returnArray[1];

        if (didModify && valueString !== null) {
            $('.tabContent .amount input').val(valueString);
        }
    }

    var isSendingFullMaxSpendable = wallet.getPouchFold(curCoinType).getIsSendingFullMaxSpendable(); // Added to accomodate Anthony's business logic request: Spendable balance must empty wallet
    updateFromInputFieldEntry(isSendingFullMaxSpendable);
});

$('.tabContent .amount input').bind('paste', function (e) {
    setTimeout(function () {
        $('.tabContent .amount input').trigger('keyup');
    }, 10);
});

$('.advancedTabContentEthereum .customGasLimit input').keyup(function () {
    var didModify = false;
    var valueInt = parseInt($('.advancedTabContentEthereum .customGasLimit input').val());

    if (valueInt !== wallet.getHelper().getCustomEthereumGasLimit().toNumber()) {
        didModify = true;
    }

    if (didModify && valueInt !== null) {
        if (isNaN(valueInt)) {
            wallet.getHelper().setCustomEthereumGasLimit(wallet.getHelper().getRecommendedEthereumCustomGasLimit());
        }
        else {
            $('.advancedTabContentEthereum .customGasLimit input').val(valueInt);
            wallet.getHelper().setCustomEthereumGasLimit(valueInt);
        }

        wallet.getPouchFold(COIN_ETHEREUM).clearSpendableBalanceCache();
        updateSpendable();
        updateFromInputFieldEntry();
    }
});

$('.advancedTabContentEthereum .customData input').keyup(function () {
    updateFromInputFieldEntry();
});

var g_attachKeyupToValidateMnemonic = function (affectedMnemonic, callbackOnValidMnemonic, callbackOnInvalidMnemonic) {
    $(affectedMnemonic).keyup(function () {
        var e = $(this);
        var value = $(this).val();

        //Remove whitespace, linebreaks
        value = value.replace(/^\s+|\s+$/g, '');

        var parsedWords = value.trim().toLowerCase().split(" ");
        var numWords = 0;
        var combinedWords = "";

        for (var i = 0; i < parsedWords.length; i++) {
            if (parsedWords[i] !== "") {
                numWords++;
                combinedWords += parsedWords[i];
                if (i < parsedWords.length - 1) {
                    combinedWords += " ";
                }
            }
        }

        if (affectedMnemonic === '.settings.verifyMnemonic textarea.validateMnemonic') {

            var validateActualMnemonic = getStoredData('mnemonic', true);
            validateActualMnemonic = validateActualMnemonic.replace(/^\s+|\s+$/g, '');
            var parsedWordsActualMnemonic = validateActualMnemonic.trim().toLowerCase().split(" ");

            var is_same_backupphrase = parsedWords.length === parsedWordsActualMnemonic.length && parsedWords.every(function (element, index) {
                return element === parsedWordsActualMnemonic[index];
            });

            if (numWords == 12 && thirdparty.bip39.validateMnemonic(combinedWords) && is_same_backupphrase) {
                callbackOnValidMnemonic(e, combinedWords);
            }
            else {
                callbackOnInvalidMnemonic(e, combinedWords);
            }

        }
        else {
            if (numWords == 12 && thirdparty.bip39.validateMnemonic(combinedWords)) {
                callbackOnValidMnemonic(e, combinedWords);
            }
            else {
                callbackOnInvalidMnemonic(e, combinedWords);
            }
        }
    });
};

g_attachKeyupToValidateMnemonic('.settings.verifyMnemonic textarea.validateMnemonic', function (e, combinedWords) {
    e.val(combinedWords);
    $(e.attr('targetButton')).show();
    $('.verifyMnemonic .backupPhraseConfirmText').show();
}, function (e, combinedWords) {
    $(e.attr('targetButton')).hide();
    $('.verifyMnemonic .backupPhraseConfirmText').hide();
});

g_attachKeyupToValidateMnemonic('.settings.verifyMnemonicCustomIntroOption textarea.validateMnemonic', function () {
    g_JaxxApp.getUI().getIntro().mnemonicEnteredIsValidCustomIntroOption();
}, function () {
    g_JaxxApp.getUI().getIntro().mnemonicEnteredIsNotValidCustomIntroOption();
});

g_attachKeyupToValidateMnemonic('.settings.importMnemonic textarea.validateMnemonic', function (e, combinedWords) {
    e.val(combinedWords);
    $(e.attr('targetButton')).addClass('cssEnabled').addClass('enabled');
}, function (e, combinedWords) {
    $(e.attr('targetButton')).removeClass('cssEnabled').removeClass('enabled');
});

g_attachKeyupToValidateMnemonic('.settings.loadJaxxToken textarea.validateMnemonic', function (e, combinedWords) {
    e.val(combinedWords);
    $(e.attr('targetButton')).addClass('cssEnabled').addClass('enabled');
}, function (e, combinedWords) {
    $(e.attr('targetButton')).removeClass('cssEnabled').removeClass('enabled');
});

g_attachKeyupToValidateMnemonic('.settings.introLoadJaxxToken textarea.validateMnemonic', function (e, combinedWords) {
    e.val(combinedWords);
    $(e.attr('targetButton')).addClass('cssEnabled').addClass('enabled');
}, function (e, combinedWords) {
    $(e.attr('targetButton')).removeClass('cssEnabled').removeClass('enabled');
});

$('textarea.validateMnemonic').on('paste', function () {
    var self = this;

    setTimeout(function () {
        $(self).trigger('keyup');
    }, 100);

});

$('.settings.quickVerifyMnemonic input').keyup(function () {
    var input = $('.settings.quickVerifyMnemonic input');
    var value = input.val().toLowerCase();

    if (value === input.data('word')) {
        $(this).val(combinedWords);
        $('.settings.quickVerifyMnemonic .button').addClass('cssEnabled').addClass('enabled');
    }
    else {
        $('.settings.quickVerifyMnemonic .button').removeClass('cssEnabled').removeClass('enabled');
    }
});

$('.settings.sweepPrivateKeyPasswordEntry input').keyup(function () {
    var value = $('.sweepPrivateKeyPasswordEntry input').val();
    var nextSweepPassBehaviours = buttonBehaviours['nextSweepPass'];

    if (value != "" && value != null) {
        nextSweepPassBehaviours.enableButton();
    }
    else {
        nextSweepPassBehaviours.disableButton();
    }
});

$('.settings.onenameSelect input').keyup(function () {
    var input = $('.settings.onenameSelect input')

    var checkOnename = function (value) {
        Onename.usernameAvailable(value, function (error, available) {
            if (value !== input.val()) {
                return;
            }

            if (error) {
                console.log('Onename error', error);

            }
            else {
                if (available) {
                    $('.settings.onenameConfirm .button').data('onename', value);
                    $('.settings.onenameSelect .button').addClass('cssEnabled').addClass('enabled');
                    $('.settings.onenameConfirm .populatePendingOnename').text(value);
                }
            }
        });
    }

    var delayToken = null;

    return function () {
        $('.settings.onenameSelect .button.next').removeClass('cssEnabled').removeClass('enabled');
        var value = input.val()

        if (delayToken) {
            clearTimeout(delayToken);
        }

        delayToken = setTimeout(function () {
            delayToken = null;
            checkOnename(value)
        }, 400);
    };
}());

$('.settings.onenameTwitter input').keyup(function () {
    var input = $(this);
    input.css({backgroundImage: 'none'});
    $('.settings.onenameTwitter .button').removeClass('enabled').removeClass('cssEnabled');

    Onename.lookupTwitter(input.val(), function (username, data) {
        if (username != input.val()) {
            return;
        }
        if (data.status === 'success' && data.twitter == input.val()) {
            var avatarImage = 'img/default-profile_360.png';

            if (data.avatar && data.avatar.url) {
                avatarImage = sanitizeOneNameAvatar(data.avatar.url);
            }

            input.css({backgroundImage: 'url(' + avatarImage + ')'});
            $('.settings.onenameTwitter .button').addClass('enabled').addClass('cssEnabled');
            $('.settings.onenameTwitterProfile .populateOnename').text(wallet.getOnename());
            $('.settings.onenameTwitterProfile .populateTwitter').text(username);
            $('.settings.onenameTwitterProfile .populateName').text(data.name);

            $('.settings.onenameTwitterProfile .populateAvatar').css({
                background: 'url(' + avatarImage + ') no-repeat center center',
                backgroundSize: 'cover',
                display: 'inline-block',
            });

            $('.settings.onenameTwitterProfile .button').data('twitter', data);
        }
    });
});

function sanitizeOneNameAvatar(avatarUrl) {
    var isValidAvatar = true;
    var schemePrefixIdx = avatarUrl.indexOf("://");

    if (schemePrefixIdx !== -1) {
        var prefixScheme = avatarUrl.substr(0, schemePrefixIdx);

        if (prefixScheme !== "http" && prefixScheme !== "https") {
            console.log("avatar invalid prefix scheme :: " + prefixScheme);
            isValidAvatar = false;
        }
        else {
            var hackArray = [")", ","];

            for (var hackIdx in hackArray) {
                var curHackToCheck = hackArray[hackIdx];

                if (avatarUrl.indexOf(curHackToCheck) !== -1) {
                    console.log("avatar has inclusion hack :: " + curHackToCheck);
                    isValidAvatar = false;
                }
            }
        }
    }

    if (isValidAvatar) {
        return avatarUrl;
    }
    else {
        console.log("invalid avatar");
        return "img/default-profile_360.png";
    }
}

var buttonBehaviours = {};

function setupUIButtonBehaviours() {
    buttonBehaviours['nextSweepPass'] = {};

    buttonBehaviours['nextSweepPass'].disableButton = function () {
        var element = $('.nextSweepPass');
        element.removeClass('cssEnabled');
        element.removeClass('cssBlueButton');
        element.addClass('cssGreyButton');
        element.css('cursor', 'default');
        element.attr('specialAction', null);
        element.attr('pushSettings', null);
    };

    buttonBehaviours['nextSweepPass'].enableButton = function () {
        var element = $('.nextSweepPass');
        element.addClass('cssEnabled');
        element.addClass('cssBlueButton');
        element.removeClass('cssGreyButton');
        element.css('cursor', 'pointer');
        element.attr('specialAction', 'sweepPrivateKey.tryToDecrypt');
    };
}

// Make sure all buttons enabled by design is enabled internally
$('.button.cssEnabled').addClass('enabled');

function updateDefaultWalletList() {
    $('.settings.setDefaultWallet .setDefaultWalletList div').each(function () {
        var element = $(this);
        var elementCoinType = parseInt(element.attr('changedefaultcointype'), 10);

        if (elementCoinType === g_JaxxApp.getSettings().getDefaultCoinType()) {
            element.addClass('selected').addClass('cssSelected');
            element.find('.cssCircleUnchecked').addClass('cssCurrencyisChecked').removeClass('cssCircleUnchecked');
            g_JaxxApp.getSettings().setDefaultCoinType(elementCoinType);
            g_JaxxApp.getUI().updateSettingsUI();
        }
        else {
            element.removeClass('selected').removeClass('cssSelected');
            element.find('.cssCurrencyisChecked').removeClass('cssCurrencyisChecked').addClass('cssCircleUnchecked');
        }
    });
}

var g_Vault;

function startJaxx() {
    g_Vault = new Vault();
    g_JaxxApp.getInitializer().startJaxx();
}

function initializeJaxx(callback) {
    g_JaxxApp.getUI().updateChangeLogSummaryFromServer();
    console.log("[ Jaxx Initialize Version " + g_JaxxApp.getVersionCode() + " ]");
    $('.menusAboutVersionCode').text(g_JaxxApp.getVersionCode());
    g_JaxxApp.getUI().setupExternalLink($('.menusAboutWebsiteLink'), 'www.jaxx.io', 'https://jaxx.io/');
    g_JaxxApp.getUI().setupExternalLink($('.menusAboutWebsiteChangeLog'), 'changelog', 'https://jaxx.io/support.html#change_log_modal');
    g_JaxxApp.getUI().setupExternalLink($('.menusAboutWebsiteContact'), 'support.decentral.ca', 'https://decentral.zendesk.com/hc/en-us');
    g_JaxxApp.getUI().setupExternalLink($('.menusHelpResetWalletLink'), 'here', 'https://decentral.zendesk.com/hc/en-us/articles/218375737-How-do-I-reset-my-Jaxx-wallet-');
    g_JaxxApp.getUI().loadExtraStylesheets();
    var defaultCoinType = g_JaxxApp.getSettings().getDefaultCoinType();
    // setupDefaultWalletList();
    showPageScanAddresses(defaultCoinType);

    $('.shapeShiftToggleItem :checkbox').click(function () {
        var $this = $(this);
        var positionZero = $this.is(':checked');
        console.log("checked :: " + positionZero);
        var receiveCoinType = COIN_BITCOIN;

        while (receiveCoinType === curCoinType) {
            receiveCoinType = (receiveCoinType + 1) % COIN_NUMCOINTYPES;
        }

        g_JaxxApp.getShapeShiftHelper().setReceivePairForCoinType(curCoinType, receiveCoinType);
        g_JaxxApp.getShapeShiftHelper().clearUpdateIntervalIfNecessary();
        $('.tabContent .address input').trigger('keyup');
    });

    var receiveCoinType = COIN_BITCOIN;

    if (defaultCoinType === COIN_BITCOIN) {
        receiveCoinType = COIN_ETHEREUM;
    }
    else {
        receiveCoinType = COIN_BITCOIN;
    }

    $('.copied').slideUp(0);
    $('.ethereumChecksumAddressWarningText').slideUp(0);
    $('.ethereumTokenInsufficientGasForSpendableWarningText').slideUp(0);
    g_JaxxApp.getUI().hideShapeshiftSpinner();

    setTimeout(function () {
        $('.copied').css('position', 'relative');
    }, 1500);

    if (window.chrome && chrome.extension) {
        var backgroundPage = chrome.extension.getBackgroundPage();

        if (backgroundPage) {
            console.log("[ Jaxx :: Trying to load background wallet :: " + backgroundPage.Wallet + " ]");
        }

        if (backgroundPage && backgroundPage.Wallet) {
            console.log('Using background wallet');
            var wallet = backgroundPage.Wallet;

            if (wallet) {

                for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
                    wallet.getPouchFold(i).setLogger(console);
                    wallet.getPouchFold(i).dumpLog();
                }

                var success = _loadWallet(wallet);
                console.log('Linked to background wallet: ' + success);
            }
        }
    }

    //Disable the camera if it's not available
    if (!window.native || !native.scanCode) {
        $('.cameraPairFromDevice').hide();
        $('.imageCamera').hide();
        $('.imageQR').hide();
        $('.cameraTab').hide();
        $('.settings.loadJaxxToken .pairFromDevice').hide();
        $('.settings.loadJaxxToken .cssBackContinue .cameraButton').hide();
        $('.settings.introLoadJaxxToken .pairFromDevice').hide();
        $('.settings.introLoadJaxxToken .cssBackContinue .cameraButton').hide();
        $('.tabContent .address input').css('width', 'calc(100% - 20px)');
    }
    else {
        $('.cameraTab').hide(); // Hide the camera - added when fox icon is added
    }

    if (PlatformUtils.mobileCheck() || PlatformUtils.extensionChromeCheck()) {
        console.log("mobile check passed");
        $('.tabSend').removeClass('cssTab');
        $('.tabSend').addClass('cssTabOverrideHover');
        $('.tabReceive').removeClass('cssTab');
        $('.tabReceive').addClass('cssTabOverrideHover');
        $('#ShapeSiftFoxBtn').removeClass('cssTab');
        $('#ShapeSiftFoxBtn').addClass('cssTabOverrideHover');


        if (PlatformUtils.mobileAndroidCheck && window.native && window.native.getAndroidSoftNavbarHeight) {
            console.log("android :: navbar size :: " + window.native.getAndroidSoftNavbarHeight());
        }
    }

    var dontShowReminder = false;
    console.log('wallet ', wallet);
    var lastState = jaxx.Registry.getWalletLastState();

    if (!wallet) {
        console.warn('lastState ' + lastState);
        if (lastState === 'ready') {
            var wallet = new HDWalletMain();
            // wallet.initialize();
            _loadWallet(wallet);
            g_JaxxApp.getUI().functionToCallWhenJaxxIsFinishedLoading();
            g_JaxxApp.getUI().showModalForCoinBulletinIfNotHidden(curCoinType);
        }
        else {
            console.log("[Show Splash Screen]");
            resize();
            dontShowReminder = true;
            var createNewWalletRadioButton = $(".settings.splash .optionTrigger input:radio[value=CreateNewWallet]");
            createNewWalletRadioButton.prop('checked', true);
            specialAction('splashOptionClicked', createNewWalletRadioButton);
            Navigation.pushSettings('splash');
        }

        g_JaxxApp.getUI().hideSplashScreen();
        $('.wallet').removeClass('cssHideUsingSettingsFramework'); // Related to optimizations framework.
        callback();
    }
    else {
        g_JaxxApp.getUI().updateSettingsUI();
        Navigation.startBlit();
        callback();
    }
    jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_NEW_WALLET_END);
}

// Help Page Question Toggle

$('dd').hide();

$('dt').click(
    function () {
        var toggle = $(this).nextUntil('dt');
        toggle.slideToggle();
        $('dd').not(toggle).slideUp();
    });

/* Hover states off on mobile */
var touch = window.ontouchstart || ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
console.log("touch :: " + touch);

if (touch) {
    // remove all :hover stylesheets
    try {
        // prevent crash on browsers not supporting DOM styleSheets properly
        for (var si in document.styleSheets) {
            var styleSheet = document.styleSheets[si];
            if (!styleSheet.rules) continue;

            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
                if (!styleSheet.rules[ri].selectorText) continue;

                if (styleSheet.rules[ri].selectorText.match(':hover')) {
                    styleSheet.deleteRule(ri);
                }
            }
        }
    }
    catch (ex) {
    }
    // Check a box for the default Jaxx currency
    // Assertion: the currency has been loaded into the helper wallet
}

function setupDefaultCoinType(defaultCoinType) {
    curCoinType = defaultCoinType;
    g_JaxxApp.getUI().initializeToCoinType(defaultCoinType);
}

function resize() {
    JaxxUI.runAfterNextFrame(function () {
        g_JaxxApp.getUI().refreshSizes();
        var offsetHeight = 0;
        if (curProfileMode === PROFILE_PORTRAIT) {
            offsetHeight = $('.mainTransactionHistoryHeader').height() + $('.landscapeLeft').height();
            var calculatedHeight = ($(window).height() - $('.landscapeLeft').height() - 2 * ($('#TransactionsHeader').outerHeight()));
            // $('.landscapeRight').css({height: calculatedHeight});
        }
        else if (curProfileMode === PROFILE_LANDSCAPE) {
            var landscapeRightOffsetHeight = $('.logoBanner').height() + $('.imageLogoBannerSVG').height();
            offsetHeight = $('.mainTransactionHistoryHeader').height() + $('.logoBanner').height() + $('.imageLogoBannerSVG').height();
            var wWidth = $(window).width() / 2;
            var leftWindowWidth = wWidth;
            var rightWindowWidth = wWidth;
            var wrapTableCurrencyWidth = $('.wrapTableCurrencySelectionMenu').width();
            var wrapTableCurrencyOffset = (leftWindowWidth / 2) - (rightWindowWidth / 2);
            var positionFromRight = leftWindowWidth;
            $('.cameraTab').css('right', positionFromRight + 'px');
            $('.shapeshiftTab').css('right', positionFromRight + 'px');
            $('.wrapTableCurrencySelectionMenu').css('left', wrapTableCurrencyOffset + 'px');
            //$('.landscapeRight').css({height: ($(window).height() - landscapeRightOffsetHeight)});
        }

        $('.transactions').css({height: ($(window).height() - offsetHeight - 35)}); // For transaction history.
    });
}

var forcePortrait = false;
var forceLandscape = false;

if (PlatformUtils.mobileIphoneCheck()) {
    forcePortrait = true;
}
else if (PlatformUtils.mobileIpadCheck()) {
    forceLandscape = true;
}

if (typeof(window.iosdefaultprofilemode) !== 'undefined') {
    if (window.iosdefaultprofilemode == 1) {
        forceLandscape = true;
        forcePortrait = false;
    }
    else {
        forceLandscape = false;
        forcePortrait = true;
    }
}

if (PlatformUtils.extensionCheck()) {
    console.log("ext check");
    forcePortrait = true;
}
else if (PlatformUtils.mobileAndroidCheck) {
    var lowestScreenDim = (g_JaxxApp.getUI().getWindowHeight() < g_JaxxApp.getUI().getWindowWidth()) ? g_JaxxApp.getUI().getWindowHeight() : g_JaxxApp.getUI().getWindowWidth();
    console.log("ff check");

    if (!(lowestScreenDim > 700)) {
        forcePortrait = true;
    }
}

console.log("forcePortrait :: " + forcePortrait);
console.log("forceLandscape :: " + forceLandscape);

var loadProfileMode = PROFILE_PORTRAIT;

if (forcePortrait) {
    console.log("force portrait mode");
    loadProfileMode = PROFILE_PORTRAIT;
}
else if (forceLandscape) {
    console.log("force landscape mode");
    loadProfileMode = PROFILE_LANDSCAPE;
}
else if (g_JaxxApp.getUI().getWindowHeight() > g_JaxxApp.getUI().getWindowWidth()) {
    console.log("portrait mode detected");
    loadProfileMode = PROFILE_PORTRAIT;
}
else {
    console.log("landscape mode detected");
    loadProfileMode = PROFILE_LANDSCAPE;
}

if (loadProfileMode === PROFILE_PORTRAIT) {
    switchToProfileMode(PROFILE_PORTRAIT);
}
else {
    switchToProfileMode(PROFILE_LANDSCAPE);
    setDefaultProfileMode(PROFILE_LANDSCAPE);
}

if (PlatformUtils.extensionSafariCheck()) {
    safari.self.width = 375;
    safari.self.height = 600;
}

if (PlatformUtils.extensionCheck()) {
    // JaxxUI._sUI.resizeChromeExtension();
}

$(window).on('openurl', function (event, url) {
    console.log("received openurl event :: " + event + " :: url ::" + url);
    checkOpenUrl(url);
});

$(window).resize(resize);

var updateScreenCalled;

if (!exports) {
    var exports = {};
}