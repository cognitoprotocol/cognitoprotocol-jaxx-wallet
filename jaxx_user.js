var TESTNET = false;

var JaxxUser = function() {
    this._firstName = "John";
    this._lastName = "Smythe, Esquire";
    
    this._storageKey = "";
    
    this._pinCodeHash = "";
}

JaxxUser.prototype.initialize = function() {
    
}

JaxxUser.prototype.setupWithWallet = function() {
    var hashedPIN = this.getStoredPinHash();

    if (hashedPIN === null) {
        hashedPIN = "";
//        userPIN = thirdparty.bitcoin.crypto.sha256("0012").toString('hex');
//
//        console.log("store user pin :: " + userPIN);
//
//        storeData("userPin_" + storageKey, userPIN);
    }
    
    this._pinCodeHash = hashedPIN;
}

JaxxUser.prototype.checkForValidPin = function(pinCode) {
    //checks argument pinCode against hashed pin

    var hashedPIN = thirdparty.bitcoin.crypto.sha256(pinCode).toString('hex');

    if (this._pinCodeHash === hashedPIN) {
//        console.log("PIN correct");
        return true;
    } else {
//        console.log("PIN incorrect");
        return false;
    }
}

JaxxUser.prototype.hasPin = function() {
//    return false;
    if (this._pinCodeHash !== "") {
        return true;
    } else {
        return false;
    }
}

JaxxUser.prototype.clearPin = function() {
    console.log("[ User :: Clear PIN ]");
    
    removeStoredData("userPin_" + this._storageKey);

    this._pinCodeHash = "";
}

JaxxUser.prototype.setPin = function(pinCode) {
    console.log("[ User :: Set PIN ]");
    
    //@note: if this is ever augmented, there should be a salt + vector and a bunch
    //of hash passes.
    this.setStorageKey();
    var hashedPIN = thirdparty.bitcoin.crypto.sha256(pinCode).toString('hex');
    storeData("userPin_" + this._storageKey, hashedPIN);
    this._pinCodeHash = hashedPIN;
}
/*
This function calculates storage key used to store pin.
 */
JaxxUser.prototype.setStorageKey = function() {
    var mnemonic = getStoredData('mnemonic', true); //Get mnemonic from localstorage
    var hashMnemonicKey = mnemonic + (TESTNET ? '-test' : '-main'); //legacy options
    this._storageKey = thirdparty.bitcoin.crypto.sha256(hashMnemonicKey).toString('hex');
}
/*
This function reads stored PIN hash from local storage for current mnemonic
 */
JaxxUser.prototype.getStoredPinHash = function() {
    this.setStorageKey();
    var hashedPIN = getStoredData("userPin_" + this._storageKey);
    return hashedPIN;
}

JaxxUser.prototype.manuallyStoreHashedPin = function(hashedPIN) {
    storeData("userPin_" + this._storageKey, hashedPIN);   
}

/*
This function iterate through all 10000 possible integers, compute hashes for each of them and compare them with
the hash saved in local storage. If a match found, indicates the stored pin has is valid. Otherwise hash could be
corrupted and no possible 4-digit PIN will unlock the wallet.
 */
JaxxUser.prototype.checkPINHashIntegrity = function() {
    var pinCode = "";
    var currentHashedPIN;
    var storedPINHash = this.getStoredPinHash();

    console.log("Stored pin hash is" + storedPINHash);
    //Perform padding and stringification to transfer numbers into 4-digit string
    for(var i=0; i<10000; i++){
        //Padding
        if(i<10){
            pinCode = "000" + i;
        }
        else if(i<100){
            pinCode = "00" + i;
        } else if (i<1000){
            pinCode = "0" + i;
        } else {
            pinCode = "" + i;
        }

        currentHashedPIN = thirdparty.bitcoin.crypto.sha256(pinCode).toString('hex');

        console.log(pinCode + ":" + currentHashedPIN);

        if(storedPINHash == currentHashedPIN){
            return true;
        }
    }

    Navigation.flashBanner("Invalid PIN hash detected and removed");

    return false;
}
