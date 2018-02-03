var jaxx;
(function (jaxx) {
    var MATH = (function () {
        function MATH() {
        }
        MATH.sumUTXOs = function (utxos) {
            return utxos.reduce(function (sum, item) { return sum += item.amount; }, 0);
        };
        MATH.toDecimal = function (value) {
            if (+value === 0)
                return '0';
            var sign = '';
            if (+value < 0) {
                sign = '-';
                value = value.substr(1);
            }
            return sign + (value.length > 12 ? MATH.weiToEther(value) : MATH.satoshiToBtc(value));
        };
        MATH.bigNum = function (value) {
            var BN = thirdparty.bnjs;
            return new BN(value);
        };
        MATH.lessAthenB = function (a, b) {
            var Bn = thirdparty.bnjs;
            return (new Bn(a)).lt(new Bn(b));
        };
        MATH.lessOrEqualAthenB = function (aInt, bInt) {
            //  return (Formatters.balanceForDisplay(a, 18) <= Formatters.balanceForDisplay(b, 18));
            var Bn = thirdparty.bnjs;
            return (new Bn(aInt)).lte(new Bn(bInt));
        };
        MATH.displayLessOrEqualAthenB = function (a, b) {
            return (jaxx.Formatters.balanceForDisplay(a, 18) <= jaxx.Formatters.balanceForDisplay(b, 18));
        };
        MATH.greaterOrEqualAthenB = function (a, b) {
            var Bn = thirdparty.bnjs;
            return (new Bn(a)).gte(new Bn(b));
        };
        MATH.greaterAthenB = function (aInt, bInt) {
            //return (Formatters.balanceForDisplay(a, 18) > Formatters.balanceForDisplay(b, 18));
            //JN: bnjs library didn't properly support this function.
            var Bn = thirdparty.bnjs;
            return (new Bn(aInt)).gt(new Bn(bInt));
        };
        MATH.dropRightCeil = function (amount, length) {
            return String(Math.ceil(Number(amount) * (10 * length)) / (10 * length));
        };
        MATH.displayGreaterAthenB = function (a, b) {
            return (jaxx.Formatters.balanceForDisplay(a, 18) > jaxx.Formatters.balanceForDisplay(b, 18));
        };
        MATH.multiplay = function (valsInt) {
            var Bn = thirdparty.bnjs;
            var res = new Bn('1');
            valsInt.forEach(function (item) {
                res = res.mul(new Bn(item));
            });
            return res.toString();
        };
        MATH.divide = function (num1Int, num2Int) {
            var Bn = thirdparty.bnjs;
            var a = new Bn(num1Int);
            return a.div(new Bn(num2Int)).toString();
        };
        MATH.subtract = function (num1, num2) {
            var Bn = thirdparty.bnjs;
            var b = new Bn(num2);
            var a = new Bn(num1);
            return a.add(b.neg()).toString();
        };
        MATH.sum = function (vals) {
            var Bn = thirdparty.bnjs;
            var res = new Bn('0');
            vals.forEach(function (item) {
                res = res.add(new Bn(item));
            });
            return res.toString();
        };
        MATH.difference = function (vals) {
            var Bn = thirdparty.bnjs;
            var res = new Bn('0');
            vals.forEach(function (item) {
                res = res.sub(new Bn(item));
            });
            return res.toString();
        };
        MATH.btcToSatoshi = function (btc) {
            // console.log(btc)
            var ar = ('' + btc).replace(',', '.').split('.');
            var suffix = '';
            if (ar.length == 1)
                suffix = '00000000';
            else {
                suffix = ar[1];
                if (suffix.length > 8) {
                    console.error(' btc not valid too long ' + btc);
                    suffix = suffix.substr(0, 8);
                }
                else
                    while (suffix.length < 8)
                        suffix += '0';
            }
            var res = ar[0] + suffix;
            while (res.length && res.substr(0, 1) === '0')
                res = res.substr(1);
            // console.log(res);
            return res;
        };
        MATH.satoshiToBtc = function (satoshi) {
            while (satoshi.length < 9)
                satoshi = '0' + satoshi;
            return satoshi.slice(0, -8) + '.' + satoshi.slice(-8);
        };
        MATH.shiftRight = function (value, length) {
            while (length--)
                value += '0';
            return value;
        };
        MATH.shiftLeft = function (value, length) {
            return value.substr(0, value.length - length);
        };
        MATH.isZero = function (a) {
            if (!a)
                return true;
            var value = a.replace(/[0|.]/g, '');
            if (value.length)
                return false;
            return true;
        };
        MATH.addTrailingZeros = function (value, coinConfig) {
            var multiplier = [];
            for (var i = 0; i < Number(coinConfig.shiftCount); i++) {
                multiplier.push("10");
            }
            multiplier.push(value);
            return this.multiplay(multiplier);
        };
        MATH.removeTrailingZeros = function (value, coinConfig) {
            var multiplier = [];
            for (var i = 0; i < Number(coinConfig.shiftCount); i++) {
                multiplier.push("10");
            }
            return this.divide(value, this.multiplay(multiplier));
        };
        /**
         * Takes a number of an ether and converts it to wei.
         * @method etherToWei
         * @param {Number|String|BigNumber} number can be a number, number string or a HEX of a decimal
         * @return {String|Object} When given a BigNumber object it returns one as well, otherwise a number
         */
        MATH.etherToWei = function (number) {
            return new BigNumber(number).multiply(MATH.etherUnitMap.ether).toString();
        };
        ;
        /**
         * Takes a number of wei and converts it to ether.
         *
         * @method fromWei
         * @param {Number|String} number can be a number, number string or a HEX of a decimal
         * @return {String|Object} When given a BigNumber object it returns one as well, otherwise a number
         */
        MATH.weiToEther = function (number) {
            return MATH.stripTrailingZeroes(new BigNumber(number).divide(MATH.etherUnitMap.ether).toString(18));
        };
        ;
        /**
         * Removes all trailing decimal zeroes on a string of numbers (i.e 1.2300 -> 1.23).  If the decimal component
         * (the mantissa) is only zeros, a whole number is returned (i.e. 10.0 -> 10).
         *
         * @method stripTrailingZeroes
         * @param {String} number in the format of a string
         * @return {String} When a string number is passed it returns a string with no trailing zeros
         */
        MATH.stripTrailingZeroes = function (number) {
            // This reqular expression first parses the whole number component ($1) and then parses the mantissa ($2).
            // All trailing zeros are removed from the mantissa; however, if the mantissa comprises of just zeros,
            // it is ignored.
            return number.replace(/\b(\d+)(?:(\.\d*?[1-9]+)|\.0*)/, '$1$2');
        };
        return MATH;
    }());
    //These are the different unit types of ether will come in handy if we plan on converting to different units.
    MATH.etherUnitMap = {
        'noether': '0',
        'wei': '1',
        'kwei': '1000',
        'Kwei': '1000',
        'babbage': '1000',
        'femtoether': '1000',
        'mwei': '1000000',
        'Mwei': '1000000',
        'lovelace': '1000000',
        'picoether': '1000000',
        'gwei': '1000000000',
        'Gwei': '1000000000',
        'shannon': '1000000000',
        'nanoether': '1000000000',
        'nano': '1000000000',
        'szabo': '1000000000000',
        'microether': '1000000000000',
        'micro': '1000000000000',
        'finney': '1000000000000000',
        'milliether': '1000000000000000',
        'milli': '1000000000000000',
        'ether': '1000000000000000000',
        'kether': '1000000000000000000000',
        'grand': '1000000000000000000000',
        'mether': '1000000000000000000000000',
        'gether': '1000000000000000000000000000',
        'tether': '1000000000000000000000000000000'
    };
    jaxx.MATH = MATH;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=math.js.map