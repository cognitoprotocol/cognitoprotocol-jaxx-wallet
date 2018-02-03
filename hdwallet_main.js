//@note: I'm not sure if the following @TODO is still relevant.
// @TODO: Handle dust properly - only necessary because blockchain.info remembers bad transactions through its pushtx
// https://github.com/bitcoin/bitcoin/blob/9fa54a1b0c1ae1b12c292d5cb3158c58c975eb24/src/primitives/transaction.h#L138

//@note: @context:
//the allegory is a "wallet"
//there are a number of "pouches" in this "wallet", which relate to different currency types.
//there are a number of "folds" inside this "pouch" which relate to subcurrencies (tokens). the primary "fold" is always the main currency that all the tokens are derived from.
//there are a number of "account" types that are the equivalent of a savings/chequing account for the same currency type.


var ACCOUNT_HD = 0;
var ACCOUNT_REGULAR = 1;
var ACCOUNT_WATCH = 2;
var ACCOUNT_NUMACCOUNTTYPES = 3;

var w_gObj;

var HDWalletMain = function() {
    this._mnemonic = "";
    
    this._pouches = [];
    this._helper = new HDWalletHelper();
    
    this._legacyEthereumWallet = null;
    this._hasGlitchedLegacyEthereumWallet = false;
    this._hasShownLegacySweep = false;
    this._shouldSetUpLegacyEthereumSweep = false;
    this._hasSetupLegacyEthereumSweep = false;
    
    this._legacyEthereumWalletLoadCallback = null;
    this._legacyEthereumWalletUpdateCallback = null;
    
    this._etcEthAddressesToSplit = {};
    
    this._preparedTransactionPrivateKeyInput = "";
}

//HDWalletMain.TESTNET = TESTNET;

/*
HDWalletMain.ON_SEND_TRANSACTION = 'ON_SEND_TRANSACTION';
HDWalletMain.ON_USER_TRANSACTION_COFIRMED = 'ON_USER_TRANSACTION_COFIRME';
HDWalletMain.DATA_FROM_RELAY = 'DATA_FROM_RELAY';
HDWalletMain.ON_TRANSACTIONS_OBJECT = 'ON_TRANSACTIONS_OBJECT';
HDWalletMain.BEGIN_SWITCH_TO_COIN_TYPE = 'BEGIN_SWITCH_TO_COIN_TYPE';
HDWalletMain.COMPLETE_SWITCH_TO_COIN_TYPE = 'COMPLETE_SWITCH_TO_COIN_TYPE';
///////////TODO remove duplicates
HDWalletMain.TRANSACTION_BEFORE_SEND = 'TRANSACTION_BEFORE_SEND';
HDWalletMain.TRANSACTION_SENT = 'TRANSACTION_SENT';
HDWalletMain.TRANSACTION_FAILED = 'TRANSACTION_FAILED';
HDWalletMain.TRANSACTION_ASSEPTED = 'TRANSACTION_ASSEPTED';
HDWalletMain.TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED';
*/



/*HDWalletMain.prototype.initialize = function() {
    //this._helper.initialize();
    console.log('TODO');
    return;

    //var pouchesToSetup = [];
    var self = this;
/!*
    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
//    for (var i = 0; i < 1; i++) {
        var coinIsTokenSubtype = HDWalletPouch.getStaticCoinPouchImplementation(i).pouchParameters['coinIsTokenSubtype'];
        
        if (coinIsTokenSubtype !== true) {
          var hdWalletPouch = new HDWalletPouch();
            this._pouches[i] = hdWalletPouch;
            this._pouches[i].initialize(i, false, this._helper);
            //pouchesToSetup.push(i);

        }
    }*!/

    //g_JaxxApp.getDataStoreController().clearAndReset();
  ///  g_JaxxApp.getDataStoreController().setCoinTypes(this._pouches);

    /////________________________________________________
    //jaxx.Registry.application$.triggerHandler(jaxx.Registry.BEGIN_SWITCH_TO_COIN_TYPE,jaxx.Registry.currentCoinType);
    /!*
    var cryptoControllers = g_JaxxApp.getDataStoreController().getControllersAll();
    cryptoControllers.forEach(function(controller) {
        controller.emitter$.off(controller.ON_RESTORE_HISTORY_START);
        ontroller.emitter$.off(controller.ON_RESTORE_HISTORY_DONE);
        controller.emitter$.on(controller.ON_RESTORE_HISTORY_START, function (evt) {
            self.onRestoreHistoryStart(evt.currentTarget);
        });
        ontroller.emitter$.on(controller.ON_RESTORE_HISTORY_DONE, function (evt) {
            self.onRestoreHistoryDone(evt.currentTarget);
        });

    });
    *!/
//    console.log("this._pouches.length :: " + this._pouches.length);

    this.setup();
}*/
/*
HDWalletMain.prototype.setupWithEncryptedMnemonic = function(encMnemonic, callback) {


   // console.error("g_Vault :: " + g_Vault + " :: this._pouches :: " + this._pouches.length);


    console.error(encMnemonic);

 // console.error(getStoredData('mnemonic',true));


    var self = this;
    
    g_Vault.decrypt(encMnemonic, function(error, res) {

        if (!error) {
            //
            //   console.log("decrypt success :: " + self._pouches.length);
            // HDWalletPouch.storedDeriveData = JSON.parse(getStoredData('PouchDerivedData', true));
          /!*  for (var i = 0; i < self._pouches.length; i++) {
                var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(i).pouchParameters['coinAbbreviatedName'];

                console.log("pouch :: " + coinAbbreviatedName + " :: " + self._pouches[i]);
                if (typeof(self._pouches[i]) !== 'undefined' && self._pouches[i] !== null) {
                    self._pouches[i].setupWithMnemonic(encMnemonic, res);
                }
            }
            *!/
            console.error(res);
            self._mnemonic = res;

            // HDWalletPouch.pushStoredDeriveDataToLocalStorage();
            callback();
        } else {
            var errStr = "error decoding mnemonic :: " + error;
            console.log("error decoding mnemonic :: " + error);
            
            callback(errStr);
        }
    });
}*/

HDWalletMain.prototype.switchToCoinType = function(targetCoinType) {
    jaxx.Registry.application$.triggerHandler(jaxx.Registry.BEGIN_SWITCH_TO_COIN_TYPE,targetCoinType);
    //    if (targetCoinType === COIN_BITCOIN) {
    //
    //    } else if (targetCoinType === COIN_ETHEREUM) {
    //        if (this._mnemonic !== "") {
    //            this.setupLegacyEthereumSweep();
    //        } else {
    //            if (this._hasSetupLegacyEthereumSweep === false) {
    //                this._shouldSetUpLegacyEthereumSweep = true;
    //            }
    //        }
    //    }
}

HDWalletMain.prototype.completeSwitchToCoinType = function(targetCoinType) {
    this.getPouchFold(targetCoinType).refreshIfNecessary();
}

HDWalletMain.prototype.getHasSetupLegacyEthereumSweep = function() {
    return this._hasSetupLegacyEthereumSweep;
}

HDWalletMain.prototype.setShouldSetUpLegacyEthereumSweep = function(loadCallback, updateCallback) {
    this._shouldSetUpLegacyEthereumSweep = true;
    this._legacyEthereumWalletLoadCallback = loadCallback;
    this._legacyEthereumWalletUpdateCallback = updateCallback;
    this.setupLegacyEthereumSweep();
}

HDWalletMain.prototype.update = function() {
    for (var i = 0; i < this._pouches.length; i++) {
        this._pouches[i].update();
    }
}

HDWalletMain.prototype.setup = function() {
    if (getStoredData('fiat') === null) {
        storeData('fiat', 'USD');
    }

    w_gObj = this;

    this._log = [];
    this._logger = console;

    this._onenameAddress = null;
    this._onenamePrivateKey = null;

    this._privateKeyCache = {};

    this._spendable = null;


    var self = this;
}

HDWalletMain.prototype.confirmBackup = function() {
    storeData('lastBackupTimestamp', (new Date()).getTime());
}

HDWalletMain.prototype.shutDown = function(updateListener) {
    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        this.getHelper().removeExchangeRateListener(i, updateListener);

        this.getPouchFold(i).shutDown();

        this.getPouchFold(i).removeListener(updateListener);
        this.getPouchFold(i).setLogger(null);
    }
}



HDWalletMain.prototype.getPouchFold = function(coinType) {
    if(!this.collection)this.collection  = [];
    if(!this.collection[coinType]){
        var ctr =  jaxx.Registry.getCryptoControllerByCoinType(coinType);
        if(ctr && ctr.pouch) this.collection[coinType] = ctr.pouch;
        else  this.collection[coinType] = ctr;
    }

return this.collection[coinType];



//    console.log("this._pouches[coinType] :: " + this._pouches[coinType] + " :: coinType :: " + coinType);
    
  /*  if (coinType >= 0 && coinType < COIN_NUMCOINTYPES) {
        var coinIsTokenSubtype = HDWalletPouch.getStaticCoinPouchImplementation(coinType).pouchParameters['coinIsTokenSubtype'];
        
        if (coinIsTokenSubtype !== true) {
            return this._pouches[coinType];
        } else {
            return this._pouches[CoinToken.getMainTypeToTokenCoinHolderTypeMap(coinType)].getToken(CoinToken.getMainTypeToTokenMap(coinType));
        }
    }
    
    return null;*/
}

HDWalletMain.prototype.getHelper = function() {
    return this._helper;
}

HDWalletMain.prototype.getMnemonic = function() {
//    console.log("mnemonic :: " + this._mnemonic);
    return this._mnemonic;
}

HDWalletMain.prototype.setupLegacyEthereumSweep = function() {
//    console.log("[ethereum] :: setup legacy sweep :: load callback :: " + this._legacyEthereumWalletLoadCallback);

    this._shouldSetUpLegacyEthereumSweep = false;
    this._hasSetupLegacyEthereumSweep = true;
    
    var setupTimeout = 1.5 * 60 * 1000;
    var legacyEthereumSweepRan = getStoredData("ethereum_legacySweepRan", false);

    if (!legacyEthereumSweepRan || legacyEthereumSweepRan !== "true" || this._legacyEthereumWalletLoadCallback !== null) {
        storeData("ethereum_legacySweepRan", "true", false);
        setupTimeout = 1500;
    }


    var self = this;
    
    setTimeout(function() {
        console.log("[ethereum] :: loading legacy wallet support");
        self._legacyEthereumWallet = new EthereumWallet();
        self._legacyEthereumWallet._finishedLoadingEthereumCallback = function(isGlitchedWallet) {
            self._hasGlitchedLegacyEthereumWallet = isGlitchedWallet;
            if (self._legacyEthereumWalletLoadCallback !== null) {
                self._legacyEthereumWalletLoadCallback();
            }
        }
        self._legacyEthereumWallet.addTXListener(function() {
            if (self._legacyEthereumWalletUpdateCallback) {
                self._legacyEthereumWalletUpdateCallback();
            }
        });
        
        self._legacyEthereumWallet.addBalanceListener(function() {
//            console.log("[ethereum] :: legacy balance :: " + self._legacyEthereumWallet.getBalance());(
            if (self._legacyEthereumWalletUpdateCallback) {
                self._legacyEthereumWalletUpdateCallback();
            }

            var legacyEthereumSpendableBalance = self._legacyEthereumWallet.getSpendableBalance();
            
            if (legacyEthereumSpendableBalance > 0) {
                if (self._hasShownLegacySweep === false) {
                    self._hasShownLegacySweep = true; Navigation.showEthereumLegacySweep(legacyEthereumSpendableBalance);
                }
            }
        });
        self._legacyEthereumWallet.initAndLoadAsync();
    }, setupTimeout);
}

HDWalletMain.prototype.hasGlitchedLegacyEthereumWallet = function() {
//    return true;
    return this._hasGlitchedLegacyEthereumWallet;
}

HDWalletMain.prototype.transferLegacyEthereumAccountToHDNode = function() {
    if (this._legacyEthereumWallet) {
        if (this._legacyEthereumWallet._address && this._legacyEthereumWallet._private) {
            var tx = this._legacyEthereumWallet.buildTransaction(this.getPouchFold(COIN_ETHEREUM).getCurrentReceiveAddress().toLowerCase(), this._legacyEthereumWallet.getSpendableBalance());
            
            if (tx) {
                this._legacyEthereumWallet.sendTransaction(tx, function(err, res) {
                    if (err) {
                        Navigation.flashBanner('Error: ' + err.message, 3);
                        console.log("transferLegacyEthereumAccountToHDNode :: error :: " + err.message);
                    } else {
                        Navigation.flashBanner('Successfully Transferred', 3);
                        console.log("transferLegacyEthereumAccountToHDNode :: success :: " + res);
                    }
                });
            } else {
                Navigation.flashBanner('Error: Invalid Transaction', 3);
            }
        }
    }
}

HDWalletMain.prototype.getAddressesAndKeysCSVForCoinType = function(coinType) {
    var returnStr = "";

    console.log(this.getPouchFold(coinType)._coinFullName + " :: export private keys");

    var accounts = this.getPouchFold(coinType).getAccountList();

    console.log("number of accounts :: " + accounts.length);
    
    for (var i = 0; i < accounts.length; i++) {
        returnStr += accounts[i].pubAddr + ", " + accounts[i].pvtKey;
        if (i !== accounts.length - 1) {
            returnStr += ",\n";
        } else {
        }
    }
    
    return returnStr;
}

HDWalletMain.prototype.getEthereumLegacyLightwalletAccount = function(coinType) {
    if (this._legacyEthereumWallet && this._legacyEthereumWallet._address && this._legacyEthereumWallet._private) {
        var accountItem = {};
        
        accountItem.pubAddr = this._legacyEthereumWallet._address;
        accountItem.pvtKey = this._legacyEthereumWallet._private.toString('hex');
        accountItem.balance = this._legacyEthereumWallet.getBalance();
//        accountItem.coinType = COIN_ETHEREUM;
        accountItem.isTheDAOAssociated = this._legacyEthereumWallet.isTheDAOAssociated();
        accountItem.isAugurAssociated = this._legacyEthereumWallet.isAugurAssociated();

//        console.log("ethereum legacy :: account :: " + JSON.stringify(accountItem));

        return accountItem;
    } else {
        return null;
    }    
}

//HDWalletMain.prototype.getEthereumLegacyStableKeypair = function(coinType) {
//    return this.getPouchFold(COIN_ETHEREUM).getEthereumLegacyStableKeypair();
//}


//@note: this is an equivalence function I build for the lightwallet fiasco, it may be relevant
//at some point in the future, but isn't actually called by anything at the moment.
HDWalletMain.prototype.checkAddress = function() {

    var checkNode = HDWallet._derive(this._receiveNode, 0, false);

    console.log("private key :: " + checkNode.keyPair.toWIF() + " :: " + this._privateKey(false, 0).toWIF());

    var keyPair = checkNode.keyPair;//this._privateKey(false, 0);

    var keyPairB = thirdparty.bitcoin.ECPair.fromWIF("KxxUwg3CwN8YjpnV8TzFRHmwrzP2vbkD9TymbdFM8EQnzpnRHDra", keyPair.network);

    console.log("WIFCheck :: " + (keyPair.getPublicKeyBuffer().toString('hex') == keyPairB.getPublicKeyBuffer().toString('hex')));

    //    console.log("CryptoJS :: " + thirdparty.CryptoJS.enc.Hex.parse);
    console.log("PRE :: keyPair.compressed :: " + keyPair.compressed);

    //using the keypair, get the public key buffer.
    //then, run that through the ethereum sha3 methodology.

    var pubKey = keyPair.getPublicKeyBuffer();
    var privateKey = keyPair.d.toBuffer(32);

    console.log("A :: pubKey :: " + pubKey + " :: " + pubKey.toString('hex'));
    console.log("privateKey :: " + privateKey + " :: " + privateKey.toString('hex'));

    var pubKeyHash = thirdparty.bitcoin.crypto.hash160(pubKey);

    console.log("A2 :: pubKeyHash :: " + pubKeyHash + " :: " + pubKeyHash.length);

    var payload = new thirdparty.Buffer.Buffer(21);
    payload.writeUInt8(keyPair.network.pubKeyHash, 0);
    pubKeyHash.copy(payload, 1);

    console.log("A3 :: pubKeyHash :: " + pubKeyHash + " :: " + pubKeyHash.length);

    console.log("thirdparty.bitcoin.base58 :: " + thirdparty.bs58check);

    var address = thirdparty.bs58check.encode(payload);

    console.log("A4 :: address :: " + address + " :: " + checkNode.keyPair.getAddress());


    //@note: this looks fine, the fromWIF with a bitcoin private key does relate to the proper output public address.



    //    console.log("A2 :: .network.pubKeyHash :: " + keyPair.network.pubKeyHash)
    //    var pubKeyHex = pubKey.toString('hex');

    //    console.log("thirdparty.elliptic :: " + thirdparty.elliptic);
    //    console.log("thirdparty.elliptic.ec :: " + thirdparty.elliptic.ec);

    var secp256k1Curve = new thirdparty.elliptic.ec('secp256k1');

    //    console.log("secp256k1Curve :: " + secp256k1Curve.genKeyPair);

    var kp = secp256k1Curve.genKeyPair();

    console.log("kp :: " + kp);

    kp._importPrivate("1dd2359ba67c76414c22b068a131caba6fe4f85a918f93a263cfd4a59f7e0f77", 'hex');

    var compact = false;

    var pubKeyHex = kp.getPublic(compact, 'hex').slice(2);
    console.log("A :: pubKeyHex :: " + pubKeyHex);

    var pubKeyWordArray = thirdparty.CryptoJS.enc.Hex.parse(pubKeyHex);
    console.log("B :: pubKeyWordArray :: " + pubKeyWordArray);

    var hash = thirdparty.CryptoJS.SHA3(pubKeyWordArray, { outputLength: 256 });
    console.log("C :: hash :: " + hash);

    var address = hash.toString(thirdparty.CryptoJS.enc.Hex).slice(24);
    console.log("D :: address :: " + address);

    //@note: this looks fine, the importprivate with an ethereum private key does relate to the proper output public address.



    kp = secp256k1Curve.genKeyPair();

    //    var b58res = thirdparty.bs58check.decode("KxxUwg3CwN8YjpnV8TzFRHmwrzP2vbkD9TymbdFM8EQnzpnRHDra");

    //    console.log("b58res :: " + b58res.toString('hex'));

    //    kp._importPrivate(b58res.toString('hex'), 'hex');
    kp._importPrivate(privateKey.toString('hex'), 'hex');

    compact = true;
    pubKeyHex = kp.getPublic(compact, 'hex');//.slice(2);

    console.log("R :: " + pubKeyHex + " :: " + pubKey.toString('hex'));


    //@note: okay, so this works.


    var ethRootNode = HDWallet._derive(HDWallet._derive(HDWallet._derive(w_gObj._rootNode, 44, true), 60, true), 0, true);

    var ethAccountNode = HDWallet._derive(ethRootNode, 0, false);

    var ethKeyPair = ethAccountNode.keyPair;

    //@note: @here: hack to get the Q to regenerate on the next 'get', triggered by getPublicKeyBuffer.
    ethKeyPair.__Q = null;
    ethKeyPair.compressed = false;

    var ethKeyPairPublicKey = ethKeyPair.getPublicKeyBuffer();

    console.log("ethKeyPairPublicKey :: " + ethKeyPairPublicKey + " :: " + ethKeyPairPublicKey.toString('hex').slice(2));


    var pubKeyHexEth = ethKeyPairPublicKey.toString('hex').slice(2);
    console.log("M :: pubKeyHexEth :: " + pubKeyHexEth);

    var pubKeyWordArrayEth = thirdparty.CryptoJS.enc.Hex.parse(pubKeyHexEth);
    console.log("N :: pubKeyWordArrayEth :: " + pubKeyWordArrayEth);

    var hashEth = thirdparty.CryptoJS.SHA3(pubKeyWordArrayEth, { outputLength: 256 });
    console.log("O :: hashEth :: " + hashEth);

    var addressEth = hashEth.toString(thirdparty.CryptoJS.enc.Hex).slice(24);
    console.log("P :: addressEth :: " + addressEth + " :: " + address);

    console.log("proper conversion :: " + (addressEth === address) );




    // var gatheredBitcoinAddress = this.getBitcoinAddress(checkNode);
    // var gatheredEthereumAddress = this.getEthereumAddress(ethAccountNode);


    //    var bigNumC = thirdparty.BigInteger.fromBuffer(
    //    var keyPairC = thirdparty.bitcoin.ECPair(keyPair.network





    //    pubKeyWordArray = thirdparty.CryptoJS.enc.Hex.parse(pubKeyHex);
    //    console.log("B :: pubKeyWordArray :: " + pubKeyWordArray);
    //    hash = thirdparty.CryptoJS.SHA3(pubKeyWordArray, { outputLength: 256 });
    //    console.log("C :: hash :: " + hash);
    //    address = hash.toString(thirdparty.CryptoJS.enc.Hex).slice(24);
    //    console.log("D :: address :: " + address);

    console.log("" + this.totally.wont.exist)

    //https://github.com/ConsenSys/eth-lightwallet/blob/master/lib/keystore.js
    //    KeyStore._computeAddressFromPrivKey = function (privKey) {
    //        var keyPair = ec.genKeyPair();
    //        keyPair._importPrivate(privKey, 'hex');
    //        var compact = false;
    //        var pubKey = keyPair.getPublic(compact, 'hex').slice(2);
    //        var pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
    //        var hash = CryptoJS.SHA3(pubKeyWordArray, { outputLength: 256 });
    //        var address = hash.toString(CryptoJS.enc.Hex).slice(24);
    //
    //        return address;
    //    };

    //https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/ecpair.js

    //    ECPair.prototype.getAddress = function () {
    //        var pubKey = this.getPublicKeyBuffer()
    //        var pubKeyHash = bcrypto.hash160(pubKey)
    //
    //        var payload = new thirdparty.Buffer.Buffer(21)
    //        payload.writeUInt8(this.network.pubKeyHash, 0)
    //        pubKeyHash.copy(payload, 1)
    //
    //        return bs58check.encode(payload)
    //    }
}



HDWalletMain.prototype.setOnename = function(onename) {
    storeData('onename-' + this._storageKey, onename);
}

HDWalletMain.prototype.getOnename = function() {
    return getStoredData('onename-' + this._storageKey);
}

HDWalletMain.prototype.getOnenameAddress = function() {
    this._load();
    if (!this._onenameAddress) {
        this._onenamePrivateKey = this._privateKey(true, 0x7fffffff);
        this._onenameAddress = this._onenamePrivateKey.getAddress();
    }
    return this._onenameAddress;
}

/*
HDWallet.prototype.registerOnename = function(passname, name, callback) {
    this._load();

    if (this.getOnename()) {
        throw new Error('Already have a onename registered');
    }
    if (!passname.match(/^[a-z]([a-z0-9-]{0,62}[a-z0-9])?$/)) {
        throw new Error('Invalid onename');
    }

    var url = 'https://glacial-plains-9083.herokuapp.com/v2/onename/register/' + passname;
    url += '?recipientAddress=' + this.getNamecoinAddress();
    url += '&bitcoinAddress=' + this._currentReceiveAddress;
    url += '&name=' + encodeURI(name);

    var self = this;
    RequestSerializer.getJSON(url, function (data) {
        self.log(data);
        //storeData('onename-' + this.getNamecoinAddress(), onename);
    });

}
*/

HDWalletMain.prototype.setEtcEthAddressesToSplit = function(addressDictToSplit) {
    console.log("HDWalletMain :: setEtcEthAddressesToSplit :: " + JSON.stringify(addressDictToSplit, null, 4));
    
    var ethTargetAddress = HDWalletHelper.toEthereumNakedAddress(wallet.getPouchFold(COIN_ETHEREUM).getCurrentReceiveAddress().toLowerCase());

    var etcTargetAddress = HDWalletHelper.toEthereumNakedAddress(wallet.getPouchFold(COIN_ETHEREUM_CLASSIC).getCurrentReceiveAddress().toLowerCase());
    
    this._etcEthAddressesToSplit = {};
    this._etcEthAddressesToSplit.targetEthAddress = ethTargetAddress;
    this._etcEthAddressesToSplit.targetEtcAddress = etcTargetAddress;

    var addressesList = [];
    
    for (var i = 0; i < addressDictToSplit.length; i++) {
        var curAddressDict = addressDictToSplit[i];
        
        var curItem = {};
        curItem.ethAddress = curAddressDict.address;
        curItem.etcBalance = curAddressDict.etcBalance;
        curItem.ethAddressIndex = parseInt(wallet.getPouchFold(COIN_ETHEREUM).getInternalIndexAddressDict(curItem.ethAddress).index);
        
        addressesList.push(curItem);
    }

    this._etcEthAddressesToSplit.addressesList = addressesList;
}

HDWalletMain.prototype.getEtcEthAddressesToSplit = function() {
    var returnVal = [];
    
    if (typeof(this._etcEthAddressesToSplit.addressesList) !== 'undefined' && this._etcEthAddressesToSplit.addressesList !== null) {
        for (var i = 0; i < this._etcEthAddressesToSplit.addressesList.length; i++) {
            returnVal.push(this._etcEthAddressesToSplit.addressesList[i].ethAddress);
        }
    }
    
    return returnVal;
}

HDWalletMain.prototype.processEtcEthSplit = function(callback) {
    var gasPrice = HDWalletHelper.getDefaultEthereumGasPrice();
    var gasLimit = thirdparty.web3.toBigNumber(100000);

    var splitOpCode = HDWalletHelper.etcEthSplitOpCode;

    var txArray = [];
    var totalTXCost = 0;

    var baseGasCost = gasPrice.mul(gasLimit).toNumber();

    var ABIForkedTargetParameter = HDWalletHelper.zeroPadLeft(this._etcEthAddressesToSplit.targetEthAddress, 64);

    var ABIUnforkedTargetParameter = HDWalletHelper.zeroPadLeft(this._etcEthAddressesToSplit.targetEtcAddress, 64);

    var splitTXData = splitOpCode + ABIForkedTargetParameter + ABIUnforkedTargetParameter;
    
    var threadingParams = {totalEtcTransactions: 0, processedEtcTransactions: 0, numEtcTransactionsPassed: 0, numEtcTransactionsFailed: 0, txData: {totalTXCost: 0, txArray: []}};
    
    for (var i = 0; i < this._etcEthAddressesToSplit.addressesList.length; i++) {
        threadingParams.totalEtcTransactions++;
        
        //@note: @here: @critical: this is definitely incorrect: (parseInt(150154021000000020) === parseInt(152254021000000030)) === true
        var bigNum_valueToSendMinusBaseTxCost = thirdparty.web3.toBigNumber(this._etcEthAddressesToSplit.addressesList[i].etcBalance).minus(thirdparty.web3.toBigNumber(baseGasCost));
        
//        console.log("this._etcEthAddressesToSplit.addressesList[i].etcBalance :: " + this._etcEthAddressesToSplit.addressesList[i].etcBalance + " :: bigNum_valueToSendMinusBaseTxCost :: " + bigNum_valueToSendMinusBaseTxCost);
        
        var passthroughParams = {};
        wallet.getPouchFold(COIN_ETHEREUM_CLASSIC).getPouchFoldImplementation()._buildEthereumTransactionWithCustomEthereumLikeBlockchain(wallet.getPouchFold(COIN_ETHEREUM), false, this._etcEthAddressesToSplit.addressesList[i].ethAddressIndex, HDWalletHelper.etcEthSplitContractAddress, bigNum_valueToSendMinusBaseTxCost, gasPrice, gasLimit, splitTXData, null, function(newTx, passthroughParams) {
            if (typeof(newTx) !== 'undefined' && newTx !== null) {
                passthroughParams.txData.txArray.push(newTx);
                passthroughParams.numEtcTransactionsPassed++;
            } else {
                console.log("error :: ethereum transaction :: account failed to build :: " + this._etcEthAddressesToSplit[i]);
                passthroughParams.numEtcTransactionsFailed++;
            }
            
            passthroughParams.processedEtcTransactions++
            
            passthroughParams.txData.totalTXCost += baseGasCost;
            
            if (passthroughParams.processedEtcTransactions === passthroughParams.totalEtcTransactions) {
                console.log("HDWalletMain :: processEtcEthSplit :: txArray.length :: " + passthroughParams.txData.txArray.length + " :: txArray :: " + JSON.stringify(passthroughParams.txData.txArray, null, 4));

                if (passthroughParams.numEtcTransactionsPassed, passthroughParams.totalEtcTransactions) {
                    callback(null, passthroughParams.txData);
                } else {
                    callback("error", null)
                }
            }
        }, threadingParams);
    }
}

HDWalletMain.prototype.performEtcEthSplit = function() {
    
//    console.log("HDWalletMain :: performEtcEthSplit :: " + JSON.stringify(this._etcEthAddressesToSplit, null, 4));
    
    this.processEtcEthSplit(function(err, splitTxDict) {
        if (err) {
            console.log("HDWalletMain :: performEtcEthSplit failed to build all necessary transactions :: " + JSON.stringify(this._etcEthAddressesToSplit, null, 4));
        } else {
//            console.log("HDWalletMain :: performEtcEthSplit :: success :: " + JSON.stringify(splitTxDict, null, 4));
//            return;
            
            g_JaxxApp.getTXManager().sendEthereumLikeTXList(COIN_ETHEREUM_CLASSIC, splitTxDict, function(result) {
                console.log("performEtcEthSplit :: sendTransaction :: result :: " + result);
                if (result === 'success') {
                    $('.tabContent .address input').val('');
                    $('.tabContent .amount input').val('').trigger('keyup');

                    playSound("snd/balance.wav", null, null);
                    Navigation.flashBanner('Successfully Sent', 5);

                    //@note: @todo: @here: maybe ignore for this case.
                    //            for (var i = 0; i < data.txArray.length; i++) {
                    //                //@note: @here: @next: tx members.
                    //                //                                    g_JaxxApp.getTXManager().addTXOfType(g_JaxxApp.getTXManager().getCurrentTXType(), COIN_ETHEREUM, data.txArray[i].hash);
                    //            }

                    Navigation.returnToDefaultView();
                    Navigation.hideTransactionHistoryDetails();
                } else if (result === 'failure') {
                    //@note: all of the batch failed:
                    Navigation.flashBanner('Error: ' + status, 5);
                    console.log('Error', status);
                } else { //@note: partial failure.
                    //@note: some of the batch succeeded, some failed:

                    $('.tabContent .address input').val('');
                    $('.tabContent .amount input').val('').trigger('keyup');

                    playSound("snd/balance.wav", null, null);
                    Navigation.flashBanner('Batch Transaction: Some Failed', 5);

                    Navigation.returnToDefaultView();
                    Navigation.hideTransactionHistoryDetails();
                }

                Navigation.closeModal();

                //@note: @here: always update the tx history for sends.
                forceUpdateWalletUI();
            });
        }
    });
}

HDWalletMain.prototype.convertFiatToFiat = function(sourceFiatAmount, targetFiatUnit, sourceFiatUnit, noPrefix){
    if (sourceFiatUnit === null || typeof(sourceFiatUnit) === 'undefined'){
        sourceFiatUnit = this.getHelper().getFiatUnit();
    }
    var valueInBitcoins = parseFloat(this.getPouchFold(COIN_BITCOIN).getPouchFoldImplementation().convertFiatToCoin(sourceFiatAmount, COIN_UNITLARGE));
    return wallet.getHelper().convertCoinToFiatWithFiatType(COIN_BITCOIN, valueInBitcoins, COIN_UNITLARGE, targetFiatUnit, noPrefix);
}

HDWalletMain.prototype.exportAllKeypairs = function(callback) {
    var self = this;
    
    var threadingParams = {numWalletsProcessed: 0, totalWalletsToProcess: 0, walletKeypairs: []};
    
    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        if (HDWalletHelper.isCryptoCurrencyAllowed(i) && !this.getPouchFold(i).isToken()){
            threadingParams.totalWalletsToProcess++;

            var passthroughParams = {curWalletIndex: i, threadingParams: threadingParams};

            this.getPouchFold(i).exportKeypairsSynched(function(result, passthroughParams) {
                passthroughParams.threadingParams.numWalletsProcessed++;
                passthroughParams.threadingParams.walletKeypairs[passthroughParams.curWalletIndex] = result;

                if (passthroughParams.threadingParams.numWalletsProcessed === passthroughParams.threadingParams.totalWalletsToProcess) {
                    var allUserKeypairs = "";

                    for (var j = 0; j < passthroughParams.threadingParams.walletKeypairs.length; j++) {
                        if (typeof(passthroughParams.threadingParams.walletKeypairs[j]) !== 'undefined' && passthroughParams.threadingParams.walletKeypairs[j] !== null) { // If data was fetched for this coin
                            var coinFullName = "";
                            if (self.getPouchFold(j).isTokenType()) {
                              coinFullName = self.getPouchFold(j)._tokenName;
                            } else {
                              coinFullName = self.getPouchFold(j)._coinFullName;
                            }

                            var accounts = passthroughParams.threadingParams.walletKeypairs[j];

                            console.log("[" + coinFullName + "] :: number of accounts :: " + accounts.length);

                            var keyPairStr = "";

                            for (var k = 0; k < accounts.length; k++) {
                              keyPairStr += coinFullName + ", " + accounts[k].pubAddr + ", " + accounts[k].pvtKey;
                              if (i !== accounts.length - 1) {
                                keyPairStr += ",\n";
                              } else {

                              }
                            }

                            allUserKeypairs += keyPairStr;
                        }
                    }
                  callback(allUserKeypairs);
                }
            }, passthroughParams);
        }
    }
}

HDWalletMain.createWallet = function(mnemonicEncrypted, callback){
    Navigation.closeModal();
    Navigation.startBlit();
    Navigation.clearSettings();
    Navigation.openModal('creatingWallet');


    g_JaxxApp.getUI()._jaxxUIIntro._setWalletType = "newWallet";

    jaxx.Registry.setWalletLasttState('ready');

    initializeJaxx(function() {
        Navigation.closeModal();
    });

    //@note: ignore existing architecture and use js side securerandom.
    //var  mnemonic = thirdparty.bip39.generateMnemonic();
    //storeData('mnemonic', mnemonic, true);
    // jaxx.seed.getEncryptedSeed();


   /* setTimeout(function(mnemonicEncrypted) {
        if (typeof(mnemonicEncrypted) === 'undefined' || mnemonicEncrypted === null){
            var mnemonicEncrypted = g_Vault.encryptSimple(thirdparty.bip39.generateMnemonic());
        }
       // loadFromEncryptedMnemonic(mnemonicEncrypted, callback);
        Navigation.closeModal();
        Navigation.startBlit();
    }, 1000, mnemonicEncrypted);
    // Clean up.
    Navigation.clearSettings();
    Navigation.openModal('creatingWallet');    */
}

HDWalletMain.getMnemonicFromJaxxToken = function(jaxxToken){
    var comps = HDWalletMain.getCompsFromJaxxToken(jaxxToken);
    return thirdparty.bip39.entropyToMnemonic(comps[0]);
}

HDWalletMain.getCompsFromJaxxToken = function(jaxxToken){
    // Return example: "imitate unknown again gasp lab work token zoo boy silly guess require"
    if (!jaxxToken) { return null; }

    // Support all valid entropy sizes (128-bit, 160-bit, 192-bit, 224-bit, 256-bit)
    // if (!jaxxToken.match(/^jaxx:[0-9a-f]{32,64}\/[0-9a-zA-Z]*$/) && ((jaxxToken.length - 5) % 8) == 0) {
    if (!jaxxToken.match(/^jaxx:[0-9a-f]{32,64}\/*$/) && ((jaxxToken.length - 5) % 8) == 0) {
        console.log("No match: " + jaxxToken);
        return null;
    }
    jaxxToken = jaxxToken.substring(5);

    return jaxxToken.split('/');   
}

HDWalletMain.prototype.onFinishedDownloadingTransactionsForBlockchain = function(coinType){
    this.getPouchFold(coinType).setHasFinishedFinalBalanceUpdate(true);
}

HDWalletMain.prototype.onRestoreHistoryStart = function(cryptoController) {
    console.log("restore history start hdWallet main", cryptoController)
}

HDWalletMain.prototype.onRestoreHistoryDone = function(cryptoController) {
    console.log("restore history stop hdWallet main", cryptoController)
}

HDWalletMain.prototype.getPreparedTransactionPrivateKeyInput = function(){
    return this._preparedTransactionPrivateKeyInput;
}

HDWalletMain.prototype.setPreparedTransactionPrivateKeyInput = function(newTransaction){
    this._preparedTransactionPrivateKeyInput = newTransaction;
}