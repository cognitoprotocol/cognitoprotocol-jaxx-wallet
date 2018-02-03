/**
 * Created by Vlad on 10/6/2016.
 */
///<reference path="../com/models.ts"/>
var starttime = Date.now();
var exports = {};
var IS_RELEASE_VERSION = true;
var COIN_BITCOIN = 0;
var COIN_ETHEREUM = 1;
var COIN_THEDAO_ETHEREUM = 2;
var COIN_DASH = 3;
var COIN_ETHEREUM_CLASSIC = 4;
var COIN_AUGUR_ETHEREUM = 5;
var COIN_LITECOIN = 6;
var COIN_LISK = 7;
var COIN_ZCASH = 8;
var COIN_TESTNET_ROOTSTOCK = 9;
//@note@:@here:@zcash
//var COIN_NUMCOINTYPES = 9;
var COIN_DOGE = 10;
var COIN_ICONOMI_ETHEREUM = 11;
var COIN_GOLEM_ETHEREUM = 12;
var COIN_GNOSIS_ETHEREUM = 13;
var COIN_SINGULARDTV_ETHEREUM = 14;
var COIN_DIGIX_ETHEREUM = 15;
var COIN_BLOCKCHAINCAPITAL_ETHEREUM = 16;
var COIN_CIVIC_ETHEREUM = 17;
var COIN_NUMCOINTYPES = 18;
var COIN_UNITLARGE = 0;
var COIN_UNITSMALL = 1;
var COIN_NUMUNITTYPES = 2;
//JAXX UTILS
var UTILS_CHANGE_LOG = 'changeLog';
var UTILS_CHANGE_LOG_SUMMARY = 'changeLogSummary';
var UTILS_TERMS_OF_SERVICE = 'termsOfService';
var UTILS_COIN_BULLETIN = 'coinBulletin';
var UTILS_NEWS = 'jaxxNews';
var UTILS_NEWS_BETA = 'jaxxNewsBeta';
var UTILS_RELEASE_NOTES = 'jaxxReleaseNotes';
var UTILS_PRIVACY_POLICY = 'jaxxPrivacyPolicy';
var jaxx;
(function (jaxx) {
    var Registry = (function () {
        function Registry() {
        }
        Registry.isTestNet = function () {
            return localStorage.getItem('testNet');
        };
        Registry.setTestNet = function (isTestNet) {
            if (isTestNet)
                localStorage.setItem('testNet', 'true');
            else
                localStorage.removeItem('testNet');
        };
        Registry.platformCheck = function () {
            if (PlatformUtils.mobileCheck()) {
                this.mobile = true;
            }
            if (PlatformUtils.extensionCheck()) {
                this.chromeExtension = true;
            }
            if (PlatformUtils.desktopCheck()) {
                this.desktop = true;
            }
            if (PlatformUtils.mobileAndroidCheck) {
                this.android = true;
            }
            if (PlatformUtils.mobileiOSCheck()) {
                this.iPhone = true;
            }
        };
        Registry.getJaxxVersion = function () {
            if (this.versionDiff()) {
                this.onUpgrade(function () {
                    return localStorage.getItem('jaxx-version');
                });
            }
            else {
                var mnemonic = getStoredData('mnemonic');
                var walletState = localStorage.getItem('wallet-last-state');
                if ((mnemonic && (mnemonic.length > 50)) && (!walletState))
                    Registry.setWalletLasttState('ready'); // TODO: change this logic
                return localStorage.getItem('jaxx-version');
            }
        };
        Registry.onUpgrade = function (cb) {
            localStorage.setItem('jaxx-version', Registry.application.appVersion);
            var mnemonic = getStoredData('mnemonic');
            if (mnemonic && (mnemonic.length > 50))
                Registry.setWalletLasttState('ready'); // TODO: change this logic
            cb();
        };
        Registry.versionDiff = function () {
            return (localStorage.getItem('jaxx-version') !== Registry.application.appVersion) ? true : false;
        };
        Registry.setJaxxVersion = function (version) {
            localStorage.setItem('jaxx-version', version);
        };
        Registry.setWalletLasttState = function (state) {
            localStorage.setItem('wallet-last-state', state);
        };
        Registry.getWalletLastState = function () {
            Registry.getJaxxVersion(); // Needed to trigger possible upgrade.
            return localStorage.getItem('wallet-last-state');
        };
        Registry.setFiatPriceController = function (controller_instance) {
            Registry.fiatController = controller_instance;
        };
        Registry.getFiatPriceController = function () {
            return Registry.fiatController;
        };
        Registry.generateMnemonic = function () {
            var mnemonic = jaxx.Seed.generateMnemonic();
            storeData('mnemonic', mnemonic, true);
            jaxx.Utils2.setMnemonic(mnemonic);
            var controllers = Registry.getAllCryptoControllers();
            controllers.forEach(function (controller) {
                controller.resetStorage(true);
            });
        };
        Registry.pairDeviceMnemonic = function (mnemonic) {
            //Ensure mnemonic should never been set to empty string. If so, warn user.
            if (mnemonic == '') {
                Navigation.flashBanner("Internal data error (ID001) occurred, please make sure you have backed up your 12-word backup phrase, restart application and check the integrity of your wallet");
                return;
            }
            storeData('mnemonic', mnemonic, true);
            // Seed.getEncryptedSeed();
            jaxx.Utils2.setMnemonic(mnemonic);
            var controllers = Registry.getAllCryptoControllers();
            controllers.forEach(function (controller) {
                controller.resetStorage(true);
                //controller.getCoinService().enabled = false;
            });
            // reset flag new-wallet to pair-device globally for all coins
            localStorage.setItem('walletType', 'pair-device');
        };
        Registry.loadMnemonic = function () {
            var mnemonic = getStoredData('mnemonic', true);
            jaxx.Utils2.setMnemonic(mnemonic);
        };
        Registry.setConfigCoins = function (ar) {
            ar.forEach(function (item, index) {
                item.index = index;
            });
            Registry.configCoins = ar;
        };
        Registry.getConfigCoins = function (ar) {
            return Registry.configCoins;
        };
        Registry.getConfigByName = function (name) {
            var coins = Registry.configCoins;
            for (var i = coins.length - 1; i >= 0; i--)
                if (coins[i].name == name)
                    return coins[i];
            return null;
        };
        Registry.getConfigBySymbol = function (symbol) {
            symbol = symbol.toUpperCase();
            var coins = Registry.configCoins;
            for (var i = coins.length - 1; i >= 0; i--)
                if (coins[i].symbol == symbol)
                    return coins[i];
            return null;
        };
        Registry.addCryptoController = function (ctr) {
            Registry.allCoins.push(ctr);
        };
        Registry.getAllCryptoControllers = function () {
            return Registry.allCoins;
        };
        Registry.getAllPrivateKeyCryptoControllers = function () {
            return Registry.getAllCryptoControllers().filter(function (coinControllers) {
                return coinControllers.displayPrivateKey;
            });
        };
        Registry.getAllSelectedPrivateKeyCryptoCrontrollers = function () {
            return Registry.getAllPrivateKeyCryptoControllers().filter(function (coinControllers) {
                return coinControllers.enabled;
            });
        };
        Registry.getDefaultWalletType = function () {
            var w = Registry.getDefaultWallet();
            return w ? w.coinType : 0;
        };
        Registry.getDefaultWallet = function () {
            console.log('//TODO set default walet');
            var enabled = Registry.getWalletsEnabledSorted();
            if (enabled.length)
                return enabled[0];
            return null;
        };
        Registry.getCryptoControllerByCoinType = function (coinType) {
            for (var i = Registry.allCoins.length - 1; i >= 0; i--)
                if (Registry.allCoins[i]._coinType === coinType)
                    return Registry.allCoins[i];
            // console.error('cant find data controller for coinType ' + coinType);
            return null;
        };
        Registry.getCryptoControllerByName = function (coinName) {
            for (var i = Registry.allCoins.length - 1; i >= 0; i--)
                if (Registry.allCoins[i].name === coinName)
                    return Registry.allCoins[i];
            console.error('cant find data controller for coinName ' + coinName);
            return null;
        };
        Registry.getCryptoControllerBySymbol = function (symbol) {
            for (var i = Registry.allCoins.length - 1; i >= 0; i--)
                if (Registry.allCoins[i].symbol === symbol)
                    return Registry.allCoins[i];
            console.error('cant find data controller by symbol ' + symbol);
            return null;
        };
        Registry.getShapeShiftEnabled = function () {
            return Registry.getAllCryptoControllers().filter(function (ctr) {
                //  console.log(ctr);
                return (ctr.shapeshift !== null);
            });
        };
        Registry.getWalletsSorted = function () {
            var out = Registry.getAllCryptoControllers(); /*.map(function (item) {
                return {
                    symbol: item.symbol,
                    sort: item.sort,
                    name: item.name,
                    icon: item.icon,
                    enabled: item.enabled,
                    testnet: item.testnet,
                    coinType:item.coinType,
                    displayName:item.displayName
                };
            })
            */
            return _.sortBy(out, 'sort');
        };
        Registry.getWalletsEnabledSorted = function () {
            return Registry.getWalletsSorted().filter(function (item) {
                return item.enabled;
            });
        };
        /* static setCurrent(ctr:ICoinController){
             console.log('%c set current crypto controller ' + ctr.symbol + ' - '+ ctr.name,'color:red');
             Registry.current_crypto_controller = ctr;
         }*/
        Registry.setCurrentControllerBySymbol = function (symbol) {
            var ctr = Registry.getCryptoControllerBySymbol(symbol);
            if (!ctr) {
                //                console.error('cant find coin '+symbol);
                return null;
            }
            Registry.getAllCryptoControllers().forEach(function (item) {
                item.deactivate();
            });
            Registry.current_crypto_controller = ctr;
            ctr.activate();
            return Registry.current_crypto_controller;
        };
        Registry.setCurrentControllerByName = function (name) {
            var ctr = Registry.getCryptoControllerByName(name);
            if (!ctr) {
                console.error('cant find coin ' + name);
                return null;
            }
            return Registry.setCurrentControllerBySymbol(ctr.symbol);
        };
        Registry.getCurrentCryptoController = function () {
            return Registry.current_crypto_controller;
        };
        Registry.updateWithShapeShiftCoinList = function (coinList) {
            var coins = Registry.getAllCryptoControllers();
            coins.forEach(function (coin) {
                var coinShapeShift = coinList.getCoinWithSymbol(coin.symbol);
                if (coinShapeShift) {
                    if (!coin.shapeshift)
                        coin.shapeshift = {};
                    coin.shapeshift.available = coinShapeShift.isAvailable();
                }
                else {
                    coin.shapeshift = null;
                }
            });
        };
        Object.defineProperty(Registry, "currentCoinType", {
            get: function () {
                return Registry._currentCoinType;
            },
            set: function (currentCoinType) {
                // console.error(' setting currentCoinType ' + currentCoinType);
                Registry._currentCoinType = currentCoinType;
            },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        Registry.onError = function (error) {
            console.error(error);
        };
        return Registry;
    }());
    Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE = 'ON_UI_SHAPE_SHIFT_FROM_CHANGE';
    Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END = 'ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END';
    Registry.ON_ERROR = 'ON_ERROR';
    Registry.ON_ERROR_RESTORE_HISTORY = 'ON_ERROR_RESTORE_HISTORY';
    Registry.ON_ERROR_RESTORE_BALANCE = "ON_RESTORE_BALANCE_ERROR";
    Registry.error$ = $({});
    // static devic
    Registry.ON_OUT_OF_SYNC = 'ON_OUT_OF_SYNC';
    //eType = '';//navigator.appVersion;
    Registry.OS = navigator.userAgent;
    Registry.ON_COIN_SEQUENCE_CHANGED = 'ON_COIN_SEQUENCE_CHANGED';
    Registry.ON_COIN_SATUS_CHANGED = 'ON_COIN_SATUS_CHANGED';
    Registry.ON_MNEMONIC_CHANGED = 'ON_MNEMONIC_CHANGED';
    Registry.ON_APPLICATION_ERROR = 'ON_APPLICATION_ERROR';
    Registry.RESET_STORAGE = 'RESET_STORAGE';
    Registry.GO_SLEEP = 'GO_SLEEP';
    Registry.WAKE_UP = 'WAKE_UP';
    Registry.MODULE_REDY = 'MODULE_REDY';
    Registry.UI_TOGGLE_TAB = 'UI_TOGGLE_TAB';
    Registry.UI_SHOW_TAB = 'UI_SHOW_TAB';
    Registry.UI_CLOSE_TAB = 'UI_CLOSE_TAB';
    Registry.BALANCE_OUT_OFF_SYNC = 'BALANCE_OUT_OFF_SYNC';
    Registry.BALANCE_IN_SYNC = 'BALANCE_IN_SYNC';
    Registry.SYNC_CHECK_START = 'SYNC_CHECK_START';
    Registry.SYNC_CHECK_END = 'SYNC_CHECK_END';
    Registry.ON_SHAPE_SHIFT_ACTIVATE = 'ON_SHAPE_SHIFT_ACTIVATE';
    Registry.ON_UTXOS_READY = 'ON_UTXOS_READY';
    Registry.ON_NONCES_READY = 'ON_NONCES_READY';
    Registry.ON_SEND_TRANSACTION = 'ON_SEND_TRANSACTION';
    Registry.ON_USER_TRANSACTION_COFIRMED = 'ON_USER_TRANSACTION_COFIRME';
    // fired when the TX monitoring system within CoinControllerBase, exceeds the configured number of attempts to retrieve the details of a transaction
    // argument passed is the transactin ID as string.
    Registry.ON_TRANSACTION_DROPPED = 'ON_TRANSACTION_DROPPED';
    Registry.DATA_FROM_RELAY = 'DATA_FROM_RELAY';
    Registry.BEGIN_SWITCH_TO_COIN_TYPE = 'BEGIN_SWITCH_TO_COIN_TYPE';
    Registry.COMPLETE_SWITCH_TO_COIN_TYPE = 'COMPLETE_SWITCH_TO_COIN_TYPE';
    ///////////TODO remove duplicates
    Registry.TRANSACTION_BEFORE_SEND = 'TRANSACTION_BEFORE_SEND';
    Registry.TRANSACTION_SENT = 'TRANSACTION_SENT';
    Registry.TRANSACTION_FAILED = 'TRANSACTION_FAILED';
    Registry.TRANSACTION_ACCEPTED = 'TRANSACTION_ACCEPTED';
    Registry.TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED';
    Registry.ON_RESTORE_HISTORY_START = 'ON_RESTORE_HISTORY_START';
    Registry.ON_RESTORE_HISTORY_ERROR = 'ON_RESTORE_HISTORY_ERROR';
    Registry.ON_RESTORE_HISTORY_DONE = 'ON_RESTORE_HISTORY_DONE';
    //Balances
    //  static ON_RESTORE_BALANCE_START = "ON_RESTORE_BALANCE_START";
    Registry.ON_RESTORE_BALANCE_ERROR = "ON_RESTORE_BALANCE_ERROR";
    //  static ON_RESTORE_BALANCE_END = "ON_RESTORE_BALANCE_END";
    Registry.ON_RESTORE_BALANCE_MANUAL_START = "ON_RESTORE_BALANCE_MANUAL_START";
    Registry.ON_RESTORE_BALANCE_MANUAL_END = "ON_RESTORE_BALANCE_MANUAL_END";
    Registry.ON_UI_COIN_ACTIVATE_START = 'ON_UI_COIN_ACTIVATE_START';
    Registry.ON_UI_COIN_ACTIVATE_END = 'ON_UI_COIN_ACTIVATE_END';
    Registry.ON_UI_INTERWALLET_ANIMATION_END = 'ON_UI_INTERWALLET_ANIMATION_END'; // triggered when the inter-wallet transitions are done. trigger by view-main-page.ts Spinner::
    Registry.ON_BALANCE_RECEIVE_CHANGE = 'ON_BALANCE_RECEIVE_CHANGE';
    Registry.ON_BALANCE_DEEMED = 'ON_BALANCE_DEEMED';
    Registry.ON_BALANCE_ACCURATE = 'ON_BALANCE_ACCURATE';
    Registry.ON_BALANCES_DOWNLOADED = 'ON_BALANCES_DOWNLOADED';
    Registry.ON_BALANCE_RENDER = 'ON_BALANCE_RENDER';
    Registry.BITCOIN_MINING_FEE = 'BITCOIN_MINING_FEE';
    Registry.ON_NEW_WALLET_START = 'ON_NEW_WALLET_START';
    Registry.ON_NEW_WALLET_END = 'ON_NEW_WALLET_END';
    Registry.ON_NEW_WALLET_CREATED = 'ON_NEW_WALLET_CREATED';
    Registry.WALLET_FIRST_INIT = 'WALLET_FIRST_INIT';
    /////////////////////////// Application events ////////////////////////////
    Registry.OFFLINE = 'OFFLINE';
    Registry.ONLINE = 'ONLINE';
    Registry.PAUSE = 'PAUSE';
    Registry.RESUME = 'RESUME';
    Registry.KILL_HISTORY = 'KILL_HISTORY';
    Registry.AMOUNT_TOO_BIG_ETHEREUM = 'AMOUNT_TOO_BIG_ETHEREUM';
    Registry.allCoins = [];
    Registry.UI_CONFIRM_TRANSACTION = 'UI_CONFIRM_TRANSACTION';
    Registry.UI_CONFIRM_TRANSACTION_CLOSED = 'UI_CONFIRM_TRANSACTION_CLOSED';
    Registry.UI_CANCEL_TRANSACTION = 'UI_CANCEL_TRANSACTION';
    Registry.registry = {};
    Registry.ON_RESTORE_HISTORY_NEXT = 'ON_RESTORE_HISTORY_NEXT';
    Registry.ON_TRANSACTIONS_CONFIRMATIONS = 'ON_TRANSACTIONS_CONFIRMATIONS';
    // static ON_TRANSACTIONS_CONFIRMED = 'ON_TRANSACTIONS_CONFIRMED';
    Registry.ON_TRANSACTION_INBLOCK = 'ON_TRANSACTION_INBLOCK';
    Registry.ON_CONFIG_UPDATED = 'ON_CONFIG_UPDATED';
    Registry.SHOW_INIT_WALLET = 'SHOW_INIT_WALLET';
    Registry.HIDE_INIT_WALLET = 'HIDE_INIT_WALLET';
    Registry.HIDE_ALL_BULLETIN = 'HIDE_ALL_BULLETIN';
    Registry.mobile = false;
    Registry.iPhone = false;
    Registry.android = false;
    Registry.desktop = false;
    Registry.chromeExtension = false;
    Registry.application$ = $({});
    Registry.transactions$ = $({});
    Registry.sendTransaction$ = $({});
    Registry.ON_WALLET_VALUE_CHANGE = 'ON_WALLET_VALUE_CHANGE';
    Registry.walletValue$ = $({});
    Registry.tempStorage = {};
    Registry.ON_KEY_INIT = 'ON_KEY_INIT';
    Registry.ON_COIN_ACTIVATED = 'ON_COIN_ACTIVATED';
    Registry.ON_COIN_DEACTIVATED = 'ON_COIN_DEACTIVATED';
    Registry.ON_BALANCE_CHANGED = 'ON_BALANCE_CHANGED';
    Registry.ON_SPENDABLE_CHANGED = 'ON_SPENDABLE_CHANGED';
    Registry.ON_ADDRESS_CHANGED = 'ON_ADDRESS_CHANGED';
    Registry.ON_TRANSACTIONS_CHANGED = 'ON_TRANSACTIONS_CHANGED';
    Registry.ON_ACTIVE_CURRENCIES_CHANGED = 'ON_ACTIVE_CURRENCIES_CHANGED'; // fired FiatPriceController::setActiveFiatCurrencies() when a fiat currency is enabled/disabled/reordered        
    Registry.ON_FIAT_MAIN_CURRENCY_CHANGE = 'ON_FIAT_MAIN_CURRENCY_CHANGE'; // fired by FiatPriceController::settActiveFiatCurrency() when the user changes the currency displayed in the wallet
    jaxx.Registry = Registry;
    Registry.start = Date.now();
})(jaxx || (jaxx = {}));
//# sourceMappingURL=Registry.js.map