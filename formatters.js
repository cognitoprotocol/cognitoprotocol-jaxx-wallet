/**
 * Created by jnewlands on 2017-AUG-14.
 */
var jaxx;
(function (jaxx) {
    var Formatters = (function () {
        function Formatters() {
        }
        //- balanceForDisplay -----------------------------------------------------------------------------------
        Formatters.balanceForDisplay = function (balance, mantissaLength) {
            var dynamicLength = -1;
            var mLength = (mantissaLength == null) ? -1 : mantissaLength;
            var zeroBalance = "0.";
            var zeroString = "";
            if (mLength !== -1) {
                for (var i = 0; i < mLength; i++) {
                    zeroBalance += "0";
                    zeroString += "0";
                }
            }
            else {
                zeroBalance += "0";
                zeroString += "0";
            }
            if (!balance || !balance.length)
                return zeroBalance;
            if (isNaN(Number(balance)))
                return null;
            var decimalLength = 0;
            var decimalNonZeroIndex = -1;
            var decimalNonZeroLength = 0;
            var decimalZeroIndex = -1;
            var displayBalance = balance;
            var hasDecimalPoint = false;
            var leadingNonZeroIndex = -1;
            var leadingZeroIndex = -1;
            var tailingZeroIndex = -1;
            // Analyze balance string.
            for (var i = 0; i < balance.length; i++) {
                var character = balance.charAt(i);
                if (character === ".") {
                    hasDecimalPoint = true;
                }
                else if (!hasDecimalPoint) {
                    if ((character !== "0") && (leadingNonZeroIndex === -1))
                        leadingNonZeroIndex = i;
                    if ((character === "0") && (leadingNonZeroIndex === -1))
                        leadingZeroIndex = i;
                }
                else {
                    decimalLength++;
                }
            }
            // Count tailing zeros.
            if (hasDecimalPoint) {
                for (var i = balance.length; i > 0; i--) {
                    var character = balance.charAt(i - 1);
                    if ((character !== "0") && (decimalNonZeroIndex === -1))
                        decimalNonZeroIndex = i;
                    if ((character === "0") && (decimalNonZeroIndex === -1))
                        decimalNonZeroLength++;
                }
                dynamicLength = decimalLength - decimalNonZeroLength;
                if (dynamicLength === 0)
                    dynamicLength = 1;
                if (dynamicLength > 8)
                    dynamicLength = 8;
            }
            // Remove leading zeros.
            if (leadingZeroIndex !== -1) {
                displayBalance = displayBalance.substr(leadingZeroIndex + 1, displayBalance.length);
                leadingZeroIndex = -1;
            }
            // Add single leading zero if missing.
            if (hasDecimalPoint && (leadingNonZeroIndex === -1) && (leadingZeroIndex === -1))
                displayBalance = "0" + displayBalance;
            // Magic number adjustments are for zero index - adding trailing zeros.
            var desiredLength = mLength;
            if (desiredLength === -1) {
                if (decimalNonZeroIndex !== -1) {
                    desiredLength = dynamicLength;
                }
                else {
                    desiredLength = 8;
                }
            }
            if (hasDecimalPoint && (decimalLength < desiredLength))
                displayBalance += zeroString.substr(0, desiredLength - decimalLength);
            if (hasDecimalPoint && (decimalLength > desiredLength))
                displayBalance = displayBalance.substring(0, displayBalance.length - (decimalLength - desiredLength));
            // Check if empty.
            if (!displayBalance.length) {
                displayBalance = zeroBalance;
            }
            else if (!hasDecimalPoint && (desiredLength > 0)) {
                displayBalance += "." + zeroString;
            }
            return displayBalance;
        };
        /** Takes a number and returns a number with dots separating every 3 digits.
         * Example input: 1000000000 => output: 1.000.000.000
         *
        */
        Formatters.formatFinancialNumber = function (rawNumber, separator) {
            if (separator === undefined) {
                separator = ',';
            }
            var integral_part = '';
            var fractionary_part = '';
            var result = '';
            var parts = [];
            var pos2 = 0;
            if (rawNumber.indexOf('.') != -1) {
                integral_part = rawNumber.substr(0, rawNumber.indexOf('.'));
                fractionary_part = rawNumber.substr(rawNumber.indexOf('.') + 1, rawNumber.length);
            }
            else {
                integral_part = rawNumber;
            }
            for (var pos = integral_part.length; pos > -3; pos -= 3) {
                pos2 = (Math.min(3, pos) * -1);
                parts.push(integral_part.substring(pos + pos2, pos));
            }
            var part_number = parts.length - 1;
            parts.forEach(function (value) {
                if (part_number != parts.length - 1) {
                    result = result + parts[part_number];
                    if (part_number != 0) {
                        result += separator;
                    }
                }
                part_number--;
            });
            //result = result.substr(result.indexOf('.'), 1);
            if (fractionary_part.length != 0) {
                result += '.' + fractionary_part;
            }
            return result;
        };
        //- isHex -----------------------------------------------------------------------------------------------
        Formatters.isHex = function (value) {
            if (!value && !value.length)
                return true;
            var valueAsNumber = parseInt(value, 16);
            return (valueAsNumber.toString(16).toLowerCase() === value.toLowerCase());
        };
        //- shiftValue ------------------------------------------------------------------------------------------
        Formatters.shiftValue = function (value, shiftCount) {
            if (isNaN(shiftCount))
                return value;
            if (shiftCount === 0)
                return value;
            if (!value)
                return null;
            if (isNaN(Number(value)))
                return null;
            if (jaxx.MATH.isZero(value))
                return null;
            var valueBN = new thirdparty.web3.BigNumber(value);
            var shiftedValue = valueBN.shift(shiftCount);
            return shiftedValue.toString(10);
        };
        //- shiftValueLeft --------------------------------------------------------------------------------------
        Formatters.shiftValueLeft = function (value, shiftCount) {
            shiftCount = Math.abs(shiftCount);
            var shiftedValue = this.shiftValue(value, -shiftCount);
            return shiftedValue;
        };
        //- shiftValueLeftAndFormat -----------------------------------------------------------------------------
        Formatters.shiftValueLeftAndFormat = function (value, shiftCount, mantissaLength) {
            shiftCount = Math.abs(shiftCount);
            var mLength = (mantissaLength) ? mantissaLength : 18;
            var shiftedValue = this.shiftValue(value, -shiftCount);
            var retValue = this.balanceForDisplay(shiftedValue, mLength);
            return retValue;
        };
        //- shiftValueRight -------------------------------------------------------------------------------------
        Formatters.shiftValueRight = function (value, shiftCount) {
            var shiftedValue = this.shiftValue(value, Math.abs(shiftCount));
            return shiftedValue;
        };
        //- shiftValueRightAndFormat ----------------------------------------------------------------------------
        Formatters.shiftValueRightAndFormat = function (value, shiftCount, mantissaLength) {
            var mLength = (mantissaLength) ? mantissaLength : 18;
            var shiftedValue = this.shiftValue(value, Math.abs(shiftCount));
            var retValue = this.balanceForDisplay(shiftedValue, mLength);
            return retValue;
        };
        Formatters.noExponentsStringFormat = function (value) {
            // if you conver to number it will be the same result.
            var data = String(value).split(/[eE]/);
            if (data.length == 1)
                return data[0];
            var z = '', sign = value < 0 ? '-' : '', str = data[0].replace('.', ''), mag = Number(data[1]) + 1;
            if (mag < 0) {
                z = sign + '0.';
                while (mag++)
                    z += '0';
                return z + str.replace(/^\-/, '');
            }
            mag -= str.length;
            while (mag--)
                z += '0';
            return str + z;
        };
        return Formatters;
    }());
    jaxx.Formatters = Formatters;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=formatters.js.map