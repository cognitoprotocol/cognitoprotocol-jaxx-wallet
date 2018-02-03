//- DCCoin.js ---------------------------------------------------------------------------------------------------------------------
"use strict";


//- DCCoin ------------------------------------------------------------------------------------------------------------------------
var DCCoin = function (shapeShiftCoin) {
    if (shapeShiftCoin) {
        this._imageUrl = shapeShiftCoin.image;
        this._imageSmallUrl = shapeShiftCoin.imageSmall;
        this._name = shapeShiftCoin.name;
        this._status = shapeShiftCoin.status;
        this._symbol = shapeShiftCoin.symbol;
    } else {
        this._imageUrl = "";
        this._imageSmallUrl = "";
        this._name = "";
        this._status = DCShapeShift.contants.COIN_UNAVAILABLE;
        this._symbol = "";
    }
}
DCCoin.prototype.imageUrl = function () { return this._imageUrl; }
DCCoin.prototype.imageSmallUrl = function () { return this._imageSmallUrl; }
DCCoin.prototype.isAvailable = function () { return(this && this._status === DCShapeShift.constants.COIN_AVAILABLE); }
DCCoin.prototype.name = function () { return this._name; }
DCCoin.prototype.status = function () { return this._status; }
DCCoin.prototype.symbol = function () { return this._symbol; }


//- DCCoinList --------------------------------------------------------------------------------------------------------------------
var DCCoinList = function (shapeShiftCoins, requiredCoins, isAvailableCheck, symbolsOnly) {
    this._dictionary = {};
    this._numberOfCoins = 0;
    this._symbolArray = null;

    if (isAvailableCheck === undefined) isAvailableCheck = false;
    if (symbolsOnly === undefined) symbolsOnly = false;
    if (shapeShiftCoins) {
        var match = null;

        if (requiredCoins && (requiredCoins instanceof Array)) {
            match = {};
            requiredCoins.forEach(function(coin) {
               match[coin] = coin;
            });
        }
        for (var key in shapeShiftCoins) {
            if (shapeShiftCoins.hasOwnProperty(key)) {
                var coin = new DCCoin(shapeShiftCoins[key]);
                var coinFound = false;

                if (match && (match[coin.name()] || match[coin.symbol()])) coinFound = true;
                if (!match || coinFound) {
                    coinFound = (isAvailableCheck) ? coin.isAvailable() : true;
                    if (coinFound) {
                      if (!symbolsOnly) this._dictionary[coin.name()] = coin;
                      this._dictionary[coin.symbol()] = coin;
                      this._numberOfCoins++;
                    }
                }
            }
        }
    }
}
DCCoinList.prototype.count = function () { return this._numberOfCoins; }
DCCoinList.prototype.getCoinWithName = function (name) { return this._dictionary[name]; }
DCCoinList.prototype.getCoinWithSymbol = function (symbol) { return this._dictionary[symbol]; }
DCCoinList.prototype.symbolArray = function () {
  if (this.numberOfCoins === 0) return [];
  if (this._symbolArray !== null) return this._symbolArray;

  var sArray = [];
  for (var key in this._dictionary) {
      if (this._dictionary.hasOwnProperty(key)) {
        var coin = this._dictionary[key];
        if (key === coin.symbol()) sArray.push(key);
      }
  }
  this._symbolArray = sArray.sort();
  return this._symbolArray;
}


//- DCCoinPair --------------------------------------------------------------------------------------------------------------------
var DCCoinPair = function (shapeShiftCoinPair) {
    if (shapeShiftCoinPair) {
        this._limit = shapeShiftCoinPair.limit,
        this._maxLimit = shapeShiftCoinPair.maxLimit,
        this._minimum = shapeShiftCoinPair.minimum,
        this._minerFee = shapeShiftCoinPair.minerFee,
        this._name = shapeShiftCoinPair.pair,
        this._rate = shapeShiftCoinPair.rate
    } else {
        this._limit = 0,
        this._maxLimit = 0,
        this._minimum = 0,
        this._minerFee = 0,
        this._name = "",
        this._rate = 0
    }
}
DCCoinPair.prototype.limit = function () { return this._limit; }
DCCoinPair.prototype.maxLimit = function () { return this._maxLimit; }
DCCoinPair.prototype.minimum = function () { return this._minimum; }
DCCoinPair.prototype.minerFee = function () { return this._minerFee; }
DCCoinPair.prototype.name = function () { return this._name; }
DCCoinPair.prototype.rate = function () { return this._rate; }


//- DCCoinPairList ----------------------------------------------------------------------------------------------------------------
var DCCoinPairList = function(shapeShiftCoinPairs) {
    this._dictionary = {};
    this._numberOfCoinPairs = 0;

    if (shapeShiftCoinPairs) {
        for (var key in shapeShiftCoinPairs) {
            if (shapeShiftCoinPairs.hasOwnProperty(key)) {
                var coinPair = new DCCoinPair(shapeShiftCoinPairs[key]);

                if ((coinPair.limit() !== 0 && coinPair.maxLimit() !== 0)) {
                    this._dictionary[coinPair.name()] = coinPair;
                    this._numberOfCoinPairs++;
                }
            }
        }
    }
}
DCCoinPairList.prototype.count = function(){ return this._numberOfCoinPairs; }
DCCoinPairList.prototype.getCoinPairWithCombination = function(coinSymbol1, coinSymbol2){
    if (coinSymbol1 && conSymbol1.length && coinSymbol2 && coinSymbol2.length) {
        return this._dictionary[coinSymbol1.toUpperCase() + "_" + coinSymbol2.toUpperCase()];
    }
    return null;
}
DCCoinPairList.prototype.getCoinPairWithName = function(name){ return this._dictionary[name]; }
