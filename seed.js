/**
 * Created by Nilang.
 */
var jaxx;
(function (jaxx) {
    var Seed = (function () {
        function Seed() {
        }
        Seed.generateMnemonic = function () {
            return thirdparty.bip39.generateMnemonic();
        };
        Seed.validateSeed = function (seed) {
            return (thirdparty.bip39.validateMnemonic(seed)) ? true : false;
        };
        /*    static getEncryptedSeed(): string {
                var getSeed = getStoredData("mnemonic", true);
                if (typeof(getSeed) !== 'undefined' && getSeed !== null){
                    return getStoredData("mnemonic");
                } else {
                    return this.generateSeed();
                }
    
            }
    */
        Seed.encryptSimple = function (clearTxt) {
            this._keyB = thirdparty.CryptoJS.enc.Base64.parse(this._key);
            this._ivB = thirdparty.CryptoJS.enc.Base64.parse(this._iv);
            var encrypted = thirdparty.CryptoJS.AES.encrypt(clearTxt, this._keyB, { iv: this._ivB });
            var encryptedString = encrypted.toString();
            return encryptedString;
        };
        Seed.decryptSimple = function (encryptedTxt) {
            this._keyB = thirdparty.CryptoJS.enc.Base64.parse(this._key);
            this._ivB = thirdparty.CryptoJS.enc.Base64.parse(this._iv);
            var decrypted = thirdparty.CryptoJS.AES.decrypt(encryptedTxt, this._keyB, { iv: this._ivB });
            var decryptedText = decrypted.toString(thirdparty.CryptoJS.enc.Utf8);
            return decryptedText;
        };
        return Seed;
    }());
    //Encrypt using google crypto-js AES-base cypher
    Seed._key = "6Le0DgMTAAAAANokdfEial"; //length=22
    Seed._iv = "mHGFxENnZLbienLyALoi.e"; //length=22
    jaxx.Seed = Seed;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=seed.js.map