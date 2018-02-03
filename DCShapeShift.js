//- DCShapeShift.js ---------------------------------------------------------------------------------------------------------------

"use strict";

var DCShapeShift = {
    cache: {
        lastCheck: null,
        coins: null
    },
    constants: {
        "ALL_COINS":null,
        "COIN_AVAILABLE":"available",
        "COIN_UNAVAILABLE":"unavailable"
    },
    messages: {
        "COIN_PAIR_ERROR":"Invalid Coin Pair sent to ShapeShift.",
        "COMMUNICATION_ERROR":"Unable to communicate with ShapeShift; please try again shortly.",
        "SHAPESHIFT_REGISTRY_TO_MISSING":"Registry value for 'shapeShiftTo' is invalid."
    },
    errors: {
        "UNKNOWN_PAIR":"Unknown pair"
    },
    util: {
    }
}

//- DCShapeShift.availableCoins ---------------------------------------------------------------------------------------------------
DCShapeShift.availableCoins = function(options, callbackSuccess, callbackFailure){
    var isAvailableCheck = false;
    var requiredCoins = DCShapeShift.constants.ALL_COINS;
    var symbolsOnly = false;
    var difference
    if(!this.cache.lastCheck) {
        this.cache.lastCheck = this.cache.lastCheck = new Date().getTime();
        difference = 600000;
    } else {
         difference = new Date().getTime() - this.cache.lastCheck
    }

    if(difference >= 600000) {
        this.cache.lastCheck = new Date().getTime();

        if (options) {
          if (options.isAvailable) isAvailableCheck = options.isAvailable;
          if (options.requiredCoins) requiredCoins = options.requiredCoins;
          if (options.symbolsOnly) symbolsOnly = options.symbolsOnly;
        }
        DCUtil.get(DCConfig.endpoints.SHAPESHIFT_AVAILABLE_COINS, function(coins) {
            DCShapeShift.cache.coins = coins;
            callbackSuccess(new DCCoinList(coins, requiredCoins, isAvailableCheck, symbolsOnly));
          },
          function(err) {
            if(DCShapeShift.cache.coins) {
              callbackSuccess(new DCCoinList(DCShapeShift.cache.coins, requiredCoins, isAvailableCheck, symbolsOnly));
            } else {
              callbackFailure({ "message":err, "source":DCConfig.errorSources.NETWORK });
            }
        });
    } else {
        callbackSuccess(new DCCoinList(DCShapeShift.cache.coins, requiredCoins, isAvailableCheck, symbolsOnly));
    }

}

//- DCShapeShift.marketInfo -------------------------------------------------------------------------------------------------------
DCShapeShift.marketInfo = function(options, callbackSuccess, callbackFailure){
    var requestedPair = null;
    var url = DCConfig.endpoints.SHAPESHIFT_MARKET_INFO;

    if (options) {
        if (options.fromSymbol && (options.fromSymbol.length > 0) && options.toSymbol && (options.toSymbol.length > 0)) {
            requestedPair = options.fromSymbol + '_' + options.toSymbol;
            url += '/' + requestedPair;
        }
    }
    DCUtil.get(url, function(response) {
        if (response.error) return callbackFailure({ "message":response.error, "source":DCConfig.errorSources.SERVICE });
        if (requestedPair) {
            callbackSuccess(new DCCoinPair(response));
        } else {
            callbackSuccess(new DCCoinPairList(response));
        }
    },
    function(err) {
        callbackFailure({ "message":err, "source":DCConfig.errorSources.NETWORK });
    });
}
