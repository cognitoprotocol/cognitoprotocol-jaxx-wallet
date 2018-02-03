var cacheDebugLog = false;

var CacheUtils = function() {

};

CacheUtils.getCachedOrRun = function(cKey, runFunction) {
    var retItem = getStoredData(cKey,true);

    if (retItem != null) {
        //        console.log("@removeLog: found :: " + cKey + " :: " + retItem);
        return JSON.parse(retItem);
    } else {
        //        console.log("@removeLog: creating :: " + cKey);
        var runFunctionReturnVal = runFunction();

        storeData(cKey, JSON.stringify(runFunctionReturnVal),true);
        //        console.log("@removeLog: created :: " + cKey + " :: " + runFunctionReturnVal);
        return runFunctionReturnVal;
    }
}



//Encrypt using google crypto-js AES-base cypher
var key = "6Le0DgMTAAAAANokdfEial"; //length=22
var iv  = "mHGFxENnZLbienLyALoi.e"; //length=22
var keyB;
var ivB;

function encryptSimple(clearTxt) {
    keyB = thirdparty.CryptoJS.enc.Base64.parse(key);
    ivB = thirdparty.CryptoJS.enc.Base64.parse(iv);
    var encrypted = thirdparty.CryptoJS.AES.encrypt(clearTxt, keyB, { iv: ivB });
    var encryptedString = encrypted.toString();
    return encryptedString;
}

function decryptSimple(encryptedTxt) {
    keyB = thirdparty.CryptoJS.enc.Base64.parse(key);
    ivB = thirdparty.CryptoJS.enc.Base64.parse(iv);
    var decrypted = thirdparty.CryptoJS.AES.decrypt(encryptedTxt, keyB, { iv: ivB });
    var decryptedText = decrypted.toString(thirdparty.CryptoJS.enc.Utf8);
    return decryptedText;
}


// ------------------------- Interact with local storage via interface
// We can't always reply on HTML5 window.localStorage
// Sample Write :
//  storeData('name','nico') 
//  storeData('sensitive','secret0r',true)
// Sample Read: 
//  getStoredData('name')
//  getStoredData('sensitive',,true)
// removeStoredData('name')
// clearAllData();

function storeData(key,value,encrypt){
   // if(key ==='mnemonic') console.error(value);
    if(typeof key !== 'undefined' && typeof value !== 'undefined'){ //Check inputs
        var valueToStore = (encrypt == true) ? encryptSimple(value) : value; //Encrypt if needed
        //console.log('Request to store entry on local db - key:' + key + ' ; valueToStore:'+valueToStore+' encrypted:'+encrypt);

        //Basic implementation : use HTML local storage
        //@TODO other platform-specific implementations

        window.localStorage.setItem(key,valueToStore);
    }
    else {
        console.log('storeData() : error in the request - key:' + key + ' ; valueToStore:'+valueToStore+' encrypted:'+encrypt);
    }
}

function getStoredData(key,decrypt){
  //  if(key ==='mnemonic') console.error(key);
    if(typeof key !== 'undefined'){
        //console.log('Requested locally stored entry : ' + key );
        var value ;

        //Simple implementation 
        //@TODO other platform-specific implementations
        value = window.localStorage.getItem(key); 

        //Check if exists
        if (typeof value == 'undefined' || !value) {
            if (cacheDebugLog === true) {
                console.log('getStoredData :: Cannot find an entry for :: ' + key);
            }
            
            return null;
        }

        //Decrypt if necessary
        value = (decrypt == true) ? decryptSimple(value) : value;

        return value;
    }
    else {
        console.log('getStoredData() : error in the request - key is undefined');
    }
}



function removeStoredData(key){
    if(typeof key !== 'undefined'){
        //console.log('Requested locally stored entry : ' + key );

        //Simple implementation 
        //@TODO other platform-specific implementations
        value = window.localStorage.getItem(key); 

        //Check if exists
        if(typeof value == 'undefined' || !value){
            console.log('Cannot find an entry for : ' + key );
            return null;
        }

        if (cacheDebugLog === true) {
            console.log('Removing from storage : '+key+ ':'+value.substr(0,10)+'...');
        }
        window.localStorage.removeItem(key);

    }
    else {
        console.log('getStoredData() : error in the request - key is undefined');
    }
}

function clearAllData(){ //TODO
    //Basic implementation : using HTML local storage 
    //@TODO other platform-specific implementations
    if (cacheDebugLog === true) {
        console.log('Clearing all data!');
    }
    window.localStorage.clear();
}



// -------------------------END storage utils

//@note: @todo: @here: this needs to be somewhere proper.

//--------------------------Validate private keys utils

//returns true if starts with 0x
function isValidETHAddress(testString){
    var patt = new RegExp(/^[a-f0-9]{40}$/i);
    return patt.test(testString.substring(2)) && testString.substring(0, 2) == '0x'; 
}


function isValidETHPrivateKey(text){
    var patt = new RegExp(/^[a-f0-9]{64}$/i);
    return patt.test(text);
}


function isValidBTCPrivateKey(text, networkDef){
    //@note: @here: @todo: remove global NETWORK references.
    if (typeof(networkDef) === 'undefined' || networkDef === null) {
        networkDef = NETWORK;
    }
    var valid = false;
    try {
        var keypair = thirdparty.bitcoin.ECPair.fromWIF(text, networkDef);
        if (keypair) { valid = true; }
    } catch (err) {
        valid = false;
    }
    return valid;
}


//--------------------------END Validate keys utils

//--------------------------BIP38 utils

//temp variables used by async processes
var bip38KeyToDecrypt = "" ;
var bip38passphrase = "";

//Use this function to decrypt: will load bip38-dist.js async
function tryToDecryptBIP38KeyAsync(key,passphrase){
    bip38KeyToDecrypt = key;
    bip38passphrase = passphrase;
    loadScript('js/thirdparty/bip38-dist.js', callBackOnLoadBIP38, callBackOnErrLoadBIP38); 
}

function callBackOnLoadBIP38Internal(){
    console.log("Loaded BIP38 js library.")
}

function callBackOnLoadBIP38(){
    if(isValidBIP38key(bip38KeyToDecrypt)) {
        if(bip38passphrase!=null){      
            console.log('Unecrypted key (WIF Compressed) :'+ decryptBIP38key(bip38KeyToDecrypt,bip38passphrase)); 
        } else {
            console.log('User did not provided a passphrase');
            return;
        }
    }
    else {
        console.log('Invalid key format, not BIP38 valid.')
    }

    //reset temp variables
    bip38KeyToDecrypt = "";
    bip38passphrase = "";

}

function tryToDecryptBIP38KeySync(key,passphrase){
    if(isValidBIP38key(key)) {
        if(passphrase!=null){  
            var unencrypted =  decryptBIP38key(key,passphrase);
            return unencrypted;
        } else {
            console.log('User did not provided a passphrase');
            return;
        }
    }
    else {
        console.log('Invalid key format, not BIP38 valid.')
    }

}

callBackOnErrLoadBIP38 = function(jqXHR, textStatus, errorThrown) {
    console.log("[ Jaxx :: Error Loading bip38-dist.js :: " + errorThrown + " ]");
    //reset temp variables
    bip38KeyToDecrypt = "";
    bip38passphrase = "";
}


function decryptBIP38key(encryptedKey,passphrase)
{
    var bip38 = new Bip38();

    var privateKeyWif = bip38.decrypt(encryptedKey, passphrase, function (status) {
        $('#bip38Progress').text((status.percent | 0)+"%");
        console.log("Decrypting BIP38 key : "+(status.percent | 0)+"%") // Will print the precent every time current increases by 1000
    });
    return privateKeyWif;
}

function isValidBIP38key(testString)
{
    //58 characters base58, starts with '6P'
    var patt = new RegExp(/^[6P][1-9A-Za-z][^OIl]{56}$/);
    return patt.test(testString); 
}
//--------------------------END BIP38 utils



//--------------------------Decrypt myethereumwallet Private keys  (march2016)

function isValidETHAESkey(testString)
{

    var patt1 = new RegExp(/^[0-9A-Za-z+\/]{132}$/);
    var patt2 = new RegExp(/^[0-9A-Za-z+\/]{128}$/);

    return patt1.test(testString) || patt2.test(testString); 
}



function decryptETHKey(encryptedPrivateKey, passphrase){
    if(encryptedPrivateKey.length==128){
        var privatebytes = CryptoJS.AES.decrypt(encryptedPrivateKey, passphrase);
        var privkey = hexToStr(CryptoJS.enc.Hex.stringify(privatebytes));
    } else if(encryptedPrivateKey.length==132){
        var privatebytes = CryptoJS.AES.decrypt(encryptedPrivateKey.substr(0,128), passphrase);
        var privkey = hexToStr(CryptoJS.enc.Hex.stringify(privatebytes));
        var addressHash = encryptedPrivateKey.substr(encryptedPrivateKey.length-4);

    } else if(encryptedPrivateKey.length==64){
        var privkey = encryptedPrivateKey;
    } else {
        console.log('Error while decrypting the private key');
        return "-1";
    }
    return privkey;
}

function hexToStr(hex) {
    var hex = hex.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}



//--------------------------END Decrypt myethereumwallet Private keys 



//--------------Shake function to avoid importing the whole jquery ui library
//By bradleyhamilton

function shake(div){                                                                                                                                                                                            
    var interval = 100;                                                                                                 
    var distance = 10;                                                                                                  
    var times = 4;                                                                                                      

    $(div).css('position','relative');                                                                                  

    for(var iter=0;iter<(times+1);iter++){                                                                              
        $(div).animate({ 
            left:((iter%2==0 ? distance : distance*-1))
        },interval);                                   
    }//for                                                                                                              

    $(div).animate({ left: 0},interval);                                                                                

}//shake       


// -----------------------END ETH smartcontract detection

//clearAllData();
//
//var cVal = CacheUtils.getCachedOrRun('cVal', function() {
//    return 'cheesy'; 
//});
//
//console.log('newc :: ' + cVal);