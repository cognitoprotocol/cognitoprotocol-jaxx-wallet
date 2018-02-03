var jaxx;
(function (jaxx) {
    // class checking Addresses generated in JAXX and stored in local storage are in strict sequence and no missing addresses.
    // If any case where sequence was mismatch is indicator of possible errors of data integrity and flag wasProblem raised as indicator of possibility of data corrupted
    var HealthAddressHD = (function () {
        function HealthAddressHD(balances, generator, isChange) {
            // Normalize balances now do both remove duplicates and fill gaps;
            //check  sequence covers all errors
            //if(this.hasDuplicates(balances))this.removeDuplicates(balances);
            if (!this.checkAddressesSequance(balances))
                this.normalizeAddresses(balances, generator, isChange ? 1 : 0);
            this.destroy();
        }
        //  remove duplicates and fill gaps in addresses what can cause after restore history process
        HealthAddressHD.prototype.normalizeAddresses = function (balances, generator, isChange) {
            this.wasProblem = true;
            var indexed = _.keyBy(balances, 'index');
            // balances.sort(function(a, b){return a.index-b.index});
            var receiveChange = isChange ? 'change' : 'receive';
            var out = [];
            for (var i = balances.length - 1; i >= 0; i--) {
                if (!balances[i] || balances[i].index !== i) {
                    var bal = indexed[i];
                    if (!bal)
                        bal = new VOBalance({
                            id: generator.generateAddress(i, receiveChange),
                            balance: '0',
                            decimal: 0,
                            index: i,
                            type: isChange
                        });
                    balances[i] = bal;
                }
                out.push(balances[i]);
            }
            return out.reverse();
        };
        // detects are duplicates  of address in array
        HealthAddressHD.prototype.hasDuplicates = function (balances) {
            var testObj = {};
            for (var i = balances.length - 1; i >= 0; i--) {
                if (!testObj[balances[i].id])
                    testObj[balances[i].id] = 1;
                else
                    return true;
            }
            return false;
        };
        // removes duplicate of address in array of balances to fix data integrity
        HealthAddressHD.prototype.removeDuplicates = function (balances) {
            this.wasProblem = true;
            var testObj = {};
            for (var i = balances.length - 1; i >= 0; i--) {
                if (!!testObj[balances[i].id]) {
                    balances.splice(i, 1);
                }
                testObj[balances[i].id] = 1;
            }
        };
        // this function checks  all addresses in array in strict sequence otherwise it was a problem during restore history process or
        // other processes relative to address generation what can lead to missing addresses or duplicates
        HealthAddressHD.prototype.checkAddressesSequance = function (balances) {
            return balances.every(function (item, index) {
                return item.index === index;
            });
        };
        /// this function not used yet but useful in future. it removes all balances in array from end wher balance value =0
        HealthAddressHD.prototype.removeTrailingBalances0 = function (balances) {
            //console.log('Removing trailing zeros ');
            balances.sort(function (a, b) { return a.index - b.index; });
            for (var i = balances.length - 1; i >= 0; i--) {
                if (isNaN(balances[i].index))
                    balances[i].index = i;
                if (+balances[i].balance == 0)
                    balances.splice(i, 1);
                else
                    break;
            }
        };
        HealthAddressHD.prototype.destroy = function () {
        };
        return HealthAddressHD;
    }());
    jaxx.HealthAddressHD = HealthAddressHD;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=wallet-health.js.map