/* @note: @info: 
for shapeshift api:

shapeshift.io/shift

For your first question, are you asking how long market rates are good for?  Or are you asking how long the receiving address is good for?  For the `/shift` api, a permanent conduit is created between the receiving ShapeShift address and the user’s destination address.  The user can send to the receiving address at any time into the future and a ‘shift’ will be made at market rates and sent to the destination address.


shapeshift.io/marketinfo 's limit/maxLimit returned as zero with status okay

Yes I see now.  That is normal behavior for our system when a node goes down on the backend.  Recently as you might be aware Ethereum has undergone a couple network attacks and we had to take our nodes down temporarily.  We do our best to also turn off the affected coin on the website and in the API, but sometimes a node goes down unexpectedly before we have the chance to properly disable it.  In the case that a node is down, then the system will report a limit of zero which is basically saying that no incoming amounts can be processed for that currency pair.  Once the node is back up and running then the system automatically begins to report normal values.  I hope that’s not too confusing.  Let me know if that helps.

*/

var JaxxShapeShiftHelper = function() {
    this._base = "https://shapeshift.io/";
    this._entrypoint_marketinfo = this._base + "marketinfo/";
    this._entrypoint_shift = this._base + "shift/";
    this._avatarImage = 'img/shapeshift_64x64.png';

    this._triggered = false;
    
    this._currentShiftParams = null;

    this._updateShiftMarketTaskID = null;
    //----------------------Update market info -------------------------------------------------------------------------------------------------------------- 
    //{pair:"btc_eth", depositMax:null, depositMin:null,exchangeRate:null, lastupdated: 0, depositAddress: null, shiftInitiated : false };
    this._receivePair = [];

    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        if (i === COIN_BITCOIN) {
            this._receivePair[i] = COIN_ETHEREUM;
        } else {
            this._receivePair[i] = COIN_BITCOIN;
        }
    }
    
    this._initMarketData = [];
  /*
    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        this._initMarketData[i] = [];
        
        for (var j = 0; j < COIN_NUMCOINTYPES; j++) {
            if (j !== i) {
                var coinAbbreviatedNameA = HDWalletPouch.getStaticCoinPouchImplementation(i).pouchParameters['coinAbbreviatedName'];
                
                var coinAbbreviatedNameB = HDWalletPouch.getStaticCoinPouchImplementation(j).pouchParameters['coinAbbreviatedName'];
                
                var pairName = coinAbbreviatedNameA.toLowerCase() + "_" + coinAbbreviatedNameB.toLowerCase();
                
                this._initMarketData[i][j] = {pair: pairName, depositMax: null, depositMin: null, exchangeRate: null, lastupdated: 0, depositAddress: null, shiftInitiated: false, multiShift: [{depositAddress: null, timestamp: 0}]};
            }
        }
    }
    */
//    console.log("_initMarketData :: " + JSON.stringify(this._initMarketData));
    
    //this._marketData = JSON.parse(JSON.stringify(this._initMarketData));

//    
//    this._market_sendBTCgetETH = {pair:"btc_eth", depositMax:null, depositMin:null,exchangeRate:null, lastupdated: 0, depositAddress: null, shiftInitiated : false };
//    
//    this._market_sendETHgetBTC = {pair:"eth_btc", depositMax:null, depositMin:null,exchangeRate:null, lastupdated: 0, depositAddress: null, shiftInitiated : false };
}

JaxxShapeShiftHelper.networkDefinitions = {
    "apiKey": "180aaede8f5451a52847824f4965cc25f43a5d2bb49f483c1f1ecc8afad661b65e22a01046bfd67257e31189b48f5a1ec35207653bd017f8203f4241c763074a",
};

JaxxShapeShiftHelper.prototype.initialize = function() {
    
}

JaxxShapeShiftHelper.prototype.getIsTriggered = function() {
    return this._triggered;
}

JaxxShapeShiftHelper.prototype.setIsTriggered = function(triggered) {
    this._triggered = triggered;
}

JaxxShapeShiftHelper.prototype.reset = function() {
//    console.log("shapeshift helper :: reset");
    
    this.clearUpdateIntervalIfNecessary();
    
    //@note: @here: deep clone the initialization array.
    this._marketData = JSON.parse(JSON.stringify(this._initMarketData));

//    this._market_sendBTCgetETH = {pair:"btc_eth", depositMax:null, depositMin:null,exchangeRate:null, lastupdated: 0, depositAddress: null, shiftInitiated : false };
//    this._market_sendETGgetBTC = {pair:"eth_btc", depositMax:null, depositMin:null,exchangeRate:null, lastupdated: 0, depositAddress: null, shiftInitiated : false };
    
    this._triggered = false;
}

JaxxShapeShiftHelper.prototype.loadReceivePairForCoinType = function(symbolSend, symbolReceive, callBack) {

    var pair = symbolSend+'_'+symbolReceive;
    var self = this;
    RequestSerializer.getJSON(this._entrypoint_marketinfo + pair, function(data, status, param) {
       // console.log(data);

        callBack(data);
       //var receiveAddress = wallet.getPouchFold(coinTypeDict.receive).getCurrentReceiveAddress();
       // var returnAddress = wallet.getPouchFold(coinTypeDict.send).getCurrentReceiveAddress();


       // self.updateShapeshiftMarketInfoCallback(data, status, param);

    }, true, null);

   // this._receivePair[coinType] = receiveType;
}

JaxxShapeShiftHelper.prototype.getReceivePairForCoinType = function(coinType) {

    return this._receivePair[coinType];
}

JaxxShapeShiftHelper.prototype.getMarketForCoinTypeSend = function(coinType) {
    var coinPair = this.getReceivePairForCoinType(coinType);

    return this._marketData[coinType][coinPair];
}

JaxxShapeShiftHelper.prototype.getMarketMinimumForCoinTypeSend = function(coinType) {


    return this._marketData[coinType][this.getReceivePairForCoinType(coinType)].depositMin;
}

//JaxxShapeShiftHelper.prototype.startShapeshift = function() {


   /* var ssMarket = this.getMarketForCoinTypeSend(coinType);


    if (this._updateShiftMarketTaskID === null) {
        console.log("setting up shapeshift market info");
        this.updateShapeShiftMarket(ssMarket);
        
        var self = this;
        //Schedule a task to update values every 30 seconds (that is how often ss updates it)
        this._updateShiftMarketTaskID = setInterval(function() {
            self.updateShapeShiftMarket(ssMarket);
        }, 30000);
    }*/
//}

JaxxShapeShiftHelper.prototype.clearUpdateIntervalIfNecessary = function(coinType) {
    clearInterval(this._updateShiftMarketTaskID);
    this._updateShiftMarketTaskID = null;
}

JaxxShapeShiftHelper.prototype.updateShapeShiftMarket = function(curMarketData) {
    var self = this;
    
    RequestSerializer.getJSON(this._entrypoint_marketinfo + curMarketData.pair, function(data, status, param) {
        self.updateShapeshiftMarketInfoCallback(data, status, param);
    }, true, curMarketData);
    
//    if (ssMarket.pair == "btc_eth") {
//        RequestSerializer.getJSON(this._entrypoint_marketinfo + this._market_sendBTCgetETH.pair, function(data, status, param) {
//            self.updateShapeshiftMarketinfoCallbackBTCETH(data, status);
//        }, true, ssMarket);
//    } else if (ssMarket.pair == "eth_btc") {
//        RequestSerializer.getJSON(this._entrypoint_marketinfo + this._market_sendETHgetBTC.pair, function(data, status, param) {
//            self.updateShapeshiftMarketinfoCallbackETHBTC(data, status);
//        }, true, ssMarket);
//    }
}
/*
JaxxShapeShiftHelper.prototype.getCoinTypeForAbbreviatedName = function(abbreviatedName) {
    for (var i = 0; i < COIN_NUMCOINTYPES; i++) {
        var coinAbbreviatedName = HDWalletPouch.getStaticCoinPouchImplementation(i).pouchParameters['coinAbbreviatedName'];
        
        if (coinAbbreviatedName.toLowerCase() === abbreviatedName) {
            return i;
        }
    }
    
    console.log("JaxxShapeShiftHelper.prototype.getCoinTypeForAbbreviatedName :: error :: abbreviatedName :: " + abbreviatedName + " not found");
    
    return 0;
}*/
/*

JaxxShapeShiftHelper.prototype.getPairCoinTypeDict = function(pair) {
    var coinArray = pair.split("_");

    var coinTypeSend = this.getCoinTypeForAbbreviatedName(coinArray[0]);
    var coinTypeReceive = this.getCoinTypeForAbbreviatedName(coinArray[1]);
    
    return {send: coinTypeSend, receive: coinTypeReceive};
}
*/


/*

JaxxShapeShiftHelper.prototype.updateShapeshiftMarketInfoCallback = function(ssMarket, status, curMarketData) {
    if (!ssMarket || status !== 'success') {
        console.warn("Error while updating " + ssMarket.pair + " market")
        return;
    }
    
    this.updateShapeshiftMarketInfo(curMarketData.pair, ssMarket);
}
*/

/*JaxxShapeShiftHelper.prototype.updateShapeshiftMarketInfo = function(pair, ssMarket) {
    var timestamp = new Date().getTime();
//    var temp = {pair: pair, depositMax: ssMarket.limit, depositMin: ssMarket.minimum, exchangeRate: ssMarket.rate, lastupdated: timestamp};

    var coinTypeDict = this.getPairCoinTypeDict(pair);


    console.log(" updateShapeshiftMarketInfo coinTypeDict:", coinTypeDict);

    var curMarketData = this._marketData[coinTypeDict['send']][coinTypeDict['receive']];
    curMarketData.depositMax = ssMarket.limit;
    curMarketData.depositMin = ssMarket.minimum;
    curMarketData.exchangeRate = ssMarket.rate;
    curMarketData.lastupdated = timestamp;

   // console.log("marketData :: " + JSON.stringify(this._marketData) + " :: ssMarket :: " + JSON.stringify(ssMarket, null, 4));

   // console.log("Shapeshift : market info [" + pair + "] updated  :" + JSON.stringify(curMarketData));

    //TODO Refresh shapeshift bar values

    //prepare shift

    var receiveAddress = wallet.getPouchFold(coinTypeDict.receive).getCurrentReceiveAddress();
    var returnAddress = wallet.getPouchFold(coinTypeDict.send).getCurrentReceiveAddress();

console.warn('receiveAddress ' + receiveAddress +' returnAddress ' + returnAddress );

    g_JaxxApp.getUI().updateShapeShiftDisplay(coinTypeDict, curMarketData);
}*/

JaxxShapeShiftHelper.prototype.isMultiShiftValid = function(coinType, numShiftsRequired) {
    var timestamp = new Date().getTime();

    var curMarketData = this.getMarketForCoinTypeSend(coinType);

    var coinTypeDict = this.getPairCoinTypeDict(curMarketData.pair);


    var receiveAddress = wallet.getPouchFold(coinTypeDict.receive).getCurrentReceiveAddress();    
    var returnAddress = wallet.getPouchFold(coinTypeDict.send).getCurrentReceiveAddress();
    var depositeAddress = wallet.getPouchFold(curCoinType).getShapeShiftDepositAddress(); 

    var isPreviousMultiShiftInvalid = false;

    if (this._currentShiftParams !== null) {
        var shiftHasTimedOut = (timestamp - this._currentShiftParams.timestamp) > 3 * 60 * 1000;

        if (this._currentShiftParams.numShiftsTotal !== numShiftsRequired ||
            this._currentShiftParams.receiveAddress !== receiveAddress ||
            this._currentShiftParams.returnAddress !== returnAddress ||
            this._currentShiftParams.shiftMarketData.depositAddress !== depositeAddress ||
            shiftHasTimedOut
           ) { 
            isPreviousMultiShiftInvalid = true;
        }
    } else {
        isPreviousMultiShiftInvalid = true;
    }

    return !isPreviousMultiShiftInvalid;
}

JaxxShapeShiftHelper.prototype.getMultiShiftResults = function(coinType, numShiftsRequired) {
    var isShiftComplete = true;
    
    if (this.isMultiShiftValid(coinType, numShiftsRequired)) {
        for (var i = 0; i < numShiftsRequired; i++) {
            if (this._currentShiftParams.shiftMarketData.multiShift[i].depositAddress === null) {
                isShiftComplete = false;
            }
        }
    } else {
        console.log("getMultiShiftResults :: invalid multi shift :: coinType :: " + coinType + " :: numShiftsRequired :: " + numShiftsRequired);
        
        isShiftComplete = false;
    }
    
    if (isShiftComplete) {
        return this._currentShiftParams.shiftMarketData;
    } else {
        return null;
    }
}

JaxxShapeShiftHelper.prototype.requestMultiShift = function(coinType, numShiftsRequired, callback) {

    // This function makes a request to Shapeshift's API for the target coin and then after saving the deposit address and request timestamp it uses the callback given in our parameters
    var timestamp = new Date().getTime();

    var curMarketData = this.getMarketForCoinTypeSend(coinType);

    var coinTypeDict = this.getPairCoinTypeDict(curMarketData.pair);
    
    var receiveAddress = wallet.getPouchFold(coinTypeDict.receive).getCurrentReceiveAddress();    
    var returnAddress = wallet.getPouchFold(coinTypeDict.send).getCurrentReceiveAddress();    
    
    var isPreviousMultiShiftInvalid = !this.isMultiShiftValid(coinType, numShiftsRequired);

    
    if (isPreviousMultiShiftInvalid === true) {

       // console.log("requestMultiShift receiveAddress:" + receiveAddress + " returnAddress: " + returnAddress + " numShiftsRequired: " + numShiftsRequired + " curMarketData: " , curMarketData);
        
        if (curMarketData.depositMax == null || curMarketData.depositMin == null || curMarketData.exchangeRate == null) {
            //@note: @todo: @here: refresh the shapeshift info.
        } else {
            var self = this;

            g_JaxxApp.getUI().beginShapeShiftMultiShift();

            curMarketData.multiShift = [];

            var shiftOptions = {withdrawal: receiveAddress, pair: curMarketData.pair, returnAddress: returnAddress, apiKey: JaxxShapeShiftHelper.networkDefinitions.apiKey};
            
            for (var i = 0; i < numShiftsRequired; i++) {
                curMarketData.multiShift.push({depositAddress: null, timestamp: null});
            }

            var shiftParams = {numShiftsTotal: numShiftsRequired, numShiftsPassed: 0, numShiftsFailed: 0, completionCallback: callback, shiftMarketData: curMarketData, receiveAddress: receiveAddress, returnAddress: returnAddress, timestamp: timestamp};
            
            this._currentShiftParams = shiftParams;
            
            for (var i = 0; i < numShiftsRequired; i++) {
                var passthroughParams = {curMarketData: curMarketData, multiShiftDataIndex: i, shiftParams: shiftParams}
                
               // console.warn('postJSON ' + this._entrypoint_shift, shiftOptions);


                jaxx.Registry.currentTransactionTemp = shiftOptions;


                // Example parameters:
                // this._entrypoint_shift: "https://shapeshift.io/shift/"
                // shiftOptions: "{"withdrawal":"XvHvaMPkcz5bUSd5wMfFBYpWFCDTGR1SSa","pair":"btc_dash","returnAddress":"13cs8tXBGEGCFXY88o9MgE4asmMZhNYSG7","apiKey":"180aaede8f5451a52847824f4965cc25f43a5d2bb49f483c1f1ecc8afad661b65e22a01046bfd67257e31189b48f5a1ec35207653bd017f8203f4241c763074a"}"


                RequestSerializer.postJSON(this._entrypoint_shift, shiftOptions, function(shiftInfo, status, passthroughParams) {


                   // console.log("shapeShift  received status :: " + status + " :: shiftInfo :: ", shiftInfo);
                    
                    // "{"orderId":"45ca0f79-4261-42c7-8e5f-83339c100e1e","deposit":"0x6920cb9c7a62d0fc50653c847c0016bb457dec82","depositType":"ETH","withdrawal":"1LuB2pccTJoUSpUaTHgSMYqyoe4pHtzL18","withdrawalType":"BTC","public":null,"apiPubKey":"180aaede8f5451a52847824f4965cc25f43a5d2bb49f483c1f1ecc8afad661b65e22a01046bfd67257e31189b48f5a1ec35207653bd017f8203f4241c763074a","returnAddress":"0x1c456dd323fdc73a32a32d7b7c977eea8bac2dea","returnAddressType":"ETH"}" // console.log(JSON.stringify(shiftInfo))
                    // "{"curMarketData":{"pair":"eth_btc","depositMax":180.36469944,"depositMin":0.11009174,"exchangeRate":0.01083367,"lastupdated":1481231517929,"depositAddress":null,"shiftInitiated":false,"multiShift":[{"depositAddress":null,"timestamp":null}]},"multiShiftDataIndex":0,"shiftParams":{"numShiftsTotal":1,"numShiftsPassed":0,"numShiftsFailed":0,"shiftMarketData":{"pair":"eth_btc","depositMax":180.36469944,"depositMin":0.11009174,"exchangeRate":0.01083367,"lastupdated":1481231517929,"depositAddress":null,"shiftInitiated":false,"multiShift":[{"depositAddress":null,"timestamp":null}]},"receiveAddress":"1LuB2pccTJoUSpUaTHgSMYqyoe4pHtzL18","returnAddress":"0x1c456dd323fdc73a32a32d7b7c977eea8bac2dea","timestamp":1481231528896}} // console.log(JSON.stringify(passthroughParams))

                    
                    
                    if (!shiftInfo || status !== 'success' || shiftInfo.error) {
                        console.error("JaxxShapeShiftHelper :: requestMultiShift :: error :: while attempting the shift :: " + (shiftInfo && shiftInfo.error) ? " :: shiftInfo.error :: " + shiftInfo.error : "");

                        jaxx.Registry.currentTransactionTemp = null;
                        passthroughParams.shiftParams.numShiftsFailed++;
                    } else {
                        passthroughParams.shiftParams.numShiftsPassed++;

                        var sendType = self.getCoinTypeForAbbreviatedName(shiftInfo.depositType.toLowerCase());
                        var receiveType = self.getCoinTypeForAbbreviatedName(shiftInfo.withdrawalType.toLowerCase());

                        self._marketData[sendType][receiveType].depositAddress = shiftInfo.deposit; // An error here means that Shapeshift was not able to fetch a valid address to deposit the bitcoins.
                        self._marketData[sendType][receiveType].timestamp = new Date().getTime();
                        
                        self._marketData[sendType][receiveType].multiShift[passthroughParams.multiShiftDataIndex].depositAddress = shiftInfo.deposit;
                        self._marketData[sendType][receiveType].multiShift[passthroughParams.multiShiftDataIndex].timestamp = new Date().getTime();

                        //console.log("shapeShift ready: " + shiftInfo.deposit + " Type: " + sendType + " receiveType: " +
                        //    "" + receiveType + " multiShiftDataIndex: " + passthroughParams.multiShiftDataIndex);

//                        var numMultiShift = self._marketData[sendType][receiveType].multiShift.length;
//                        console.log("shapeShift :: numMultiShift :: " + numMultiShift + " :: data :: " + JSON.stringify(this._marketData[sendType][receiveType].multiShift));

                        
                        //@note: @todo: @next: @here: only callback when actually completed.
                    
                       // console.log("partial multishift passthroughParams :: ",passthroughParams);
                    }
                    
                    if (passthroughParams.shiftParams.numShiftsTotal === passthroughParams.shiftParams.numShiftsPassed + passthroughParams.shiftParams.numShiftsFailed) {
                       // console.log("finished multishift :: passthroughParams :: ", passthroughParams);
                        g_JaxxApp.getUI().endShapeShiftMultiShift();


                        passthroughParams.shiftParams.completionCallback(passthroughParams.shiftParams);
                    }

                }, true, passthroughParams); 
            }
        }
    } else {
        console.log("JaxxShapeShiftHelper :: requestMultiShift unnecessary");
    }
}
