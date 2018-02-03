/**
 * Created by Vlad on 10/7/2016.
 *
 */
var jaxx;
(function (jaxx) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.subtractUTXOS = function (allUtxos, spentUtxos) {
            var indexed = {};
            spentUtxos.forEach(function (item) {
                indexed[item.txid + item.address] = item;
            });
            //   let diff = _.differenceBy(utxos, spentUtxos, 'txid');
            return allUtxos.filter(function (item) {
                return !indexed[item.txid + item.address];
            });
        };
        Utils.generateQRCode = function (source, large) {
            var res = large ? 7 : 5;
            if (!Utils.qrcodes[source + res]) {
                Utils.qrcodes[source + res] = "data:image/png;base64," + thirdparty.qrImage.imageSync(source, { type: "png", ec_level: "H", size: res, margin: 1 }).toString('base64');
            }
            return Utils.qrcodes[source + res];
        };
        Utils.sumBalances = function (balances) {
            var ar = [];
            balances.forEach(function (item) {
                if (item.balance !== '0')
                    ar.push(item.balance);
            });
            return jaxx.MATH.sum(ar);
        };
        Utils.createTokenData = function (web3, amount, address) {
            //send max for tokens issue use big number library to parse value amount
            var ABI = web3.toBigNumber(amount, 10).toString(16); //amount;//parseInt(amount).toString(16);
            while (ABI.length < 64)
                ABI = '0' + ABI;
            address = address.substr(2);
            while (address.length < 64)
                address = '0' + address;
            var ethData = address + ABI;
            return '0xa9059cbb' + ethData;
        };
        Utils.mapEthereumTransaction = function (web3, addressTo, amount, nonce, gasPrice, gasLimit, data) {
            return {
                nonce: web3.toHex(nonce),
                gasPrice: web3.toHex(gasPrice),
                gasLimit: web3.toHex(gasLimit),
                to: addressTo,
                value: web3.toHex(amount),
                data: data
            };
        };
        Utils.backNavigation = function () {
            Navigation.popSettings();
        };
        Utils.remoteToggleMainMenu = function () {
            Navigation.popSettings();
            if (Utils._mainMenuIsOpen === true) {
                Utils.closeMainMenu();
            }
            else {
                Utils.openMainMenu();
            }
        };
        Utils.closeMainMenu = function () {
            Utils._mainMenuIsOpen = false;
            g_JaxxApp._ui.closeMainMenu();
        };
        Utils.openMainMenu = function () {
            Utils._mainMenuIsOpen = true;
            g_JaxxApp._ui.openMainMenu();
        };
        Utils.copyClipboard = function (copyValue) {
            // let address = this.currentAddress;
            var sandbox = $('#clipboard');
            sandbox.val(copyValue).select();
            document.execCommand('copy');
            sandbox.val('').blur();
            if (window.native && window.native.copyToClipboard) {
                window.native.copyToClipboard(copyValue);
            }
            Navigation.flashBanner('Copied to clipboard', 2, 'success', { close: false });
        };
        Utils.mapTransactionsBitcoin = function (transactions, myAddresses) {
            // object all addresses to detect is transaction incoming or outgoing
            var myAddrObj = myAddresses.reduce(function (out, val) { out[val] = 1; return out; }, {});
            transactions.forEach(function (transaction) {
                // PLEASE REMOVE THIS ASAP, A SPELLING ERROR SHOULD NOT BE HANDLED LIKE THIS
                if (!transaction.from) {
                    transaction.from = transaction.form;
                }
                /// if from not contains my address transaction incoming
                transaction.incoming = !!myAddrObj[transaction.from] ? 0 : 1;
                // if outputs more then one use function to get sum of all outputs
                if (transaction.tos.length > 1) {
                    Utils.setValueForAddresses(myAddresses, transaction);
                }
                else {
                    transaction.to = transaction.tos[0];
                    transaction.displayValue = transaction.values[0];
                }
                /*
                     if(transaction.incoming){
                         if(transaction.tos.length > 2){
     
                         }else{
     
                             if(myAddresses.indexOf(transaction.to) ===-1 && transaction.tos.length>1){
                                 transaction.to = transaction.tos[1];
                                 transaction.displayValue = transaction.values[1];
                             }
                         }
     
                     }else{
     
                         transaction.to = transaction.tos[0];
                         transaction.displayValue = transaction.values[0];
     
                         if(myAddresses.indexOf(transaction.to) !==-1 && transaction.tos.length>1){
                             transaction.to = transaction.tos[1];
                             transaction.displayValue = transaction.values[1];
                         }
                     }
     */
                // if from and to my address send yourself
                if (myAddrObj[transaction.to] && myAddrObj[transaction.from]) {
                    transaction.displayValue = '0';
                    transaction.to = 'Self';
                }
                transaction.displayMiningFee = transaction.miningFee;
                Utils.displayStringShortner(transaction);
                transaction.displayValue = Utils.getDisplayValue(transaction.displayValue);
            });
        };
        ;
        Utils.displayStringShortner = function (transaction) {
            transaction.address = transaction.incoming ? transaction.from : transaction.to;
            transaction.displayTxid = transaction.id.substr(0, 4) + '...' + transaction.id.substr(-5);
            if (transaction.address) {
                transaction.displayAddress = transaction.address.substr(0, 4) + '...' + transaction.address.substr(-5);
            }
            else {
                transaction.displayAddress = 'Self';
            }
        };
        /**
         *
         * @param {Array<string>} addresses
         * @param {VOTransaction} transaction
         * @returns {number}
         */
        Utils.setValueForAddresses = function (addresses, transaction) {
            var value = 0;
            if (transaction.incoming) {
                for (var i = 0; i < addresses.length; i++) {
                    var j = transaction.tos.indexOf(addresses[i]);
                    if (j !== -1) {
                        value = value + Number(transaction.values[j]);
                        transaction.to = transaction.tos[j];
                    }
                }
            }
            else {
                for (var i = 0; i < transaction.tos.length; i++) {
                    var j = addresses.indexOf(transaction.tos[i]);
                    if (j === -1) {
                        value = value + Number(transaction.values[i]);
                        transaction.to = transaction.tos[i];
                    }
                }
            }
            transaction.displayValue = String(value);
            //return String(value);
        };
        /**
         *
         * @param {string} value
         * @returns {string}
         */
        Utils.getDisplayValue = function (value) {
            var displayValue = String(value).split('.');
            if (displayValue.length === 2) {
                if (displayValue[0].length > 3) {
                    displayValue[1] = displayValue[1].substr(0, 2);
                }
                else {
                    displayValue[1] = displayValue[1].substr(0, 5);
                }
            }
            return displayValue.join('.');
        };
        Utils.mapDisplayTransactionsEthereum = function (trs, myAddresses, symbol) {
            trs.forEach(function (item) {
                Utils.mapDisplayTransactionEthereum(item, myAddresses, symbol);
            });
        };
        Utils.mapDisplayTransactionEthereum = function (tr, myAddresses, symbol) {
            var value = jaxx.MATH.weiToEther(tr.value);
            var ar = value.split('.');
            if (ar.length == 2) {
                if (ar[0].length > 3) {
                    ar[1] = ar[1].substr(0, 2);
                }
                else {
                    ar[1] = ar[1].substr(0, 5);
                }
            }
            tr.displayValue = ar.join('.');
            // boolean slower then number
            tr.incoming = myAddresses.indexOf(tr.from) !== -1 ? 0 : 1;
            Utils.displayStringShortner(tr);
            tr.displayMiningFee = tr.miningFee; // (MATH.weiToEther((+tr.gas*+tr.gasPrice) +'')).toString();// + ' ' + symbol;
            tr.symbol = symbol;
        };
        Utils.calculateSpendableUTXOs = function (utxos, miningFeeFixed, minIncludeInt) {
            var miningFeeDecimal = +miningFeeFixed / 1e8;
            var minIncludeDecimal = +minIncludeInt / 1e8;
            var totalDecimal = 0;
            var countInputs = 0;
            console.log('miningFeeDecimal   ' + miningFeeDecimal + ' minIncludeDecimal ' + minIncludeDecimal);
            var out = [];
            utxos.forEach(function (item) {
                if (minIncludeInt && item.decimal > minIncludeDecimal) {
                    totalDecimal += item.decimal;
                    out.push(item.satoshis);
                    console.log('totalDecimal  ' + totalDecimal + '  item.decimal  ' + item.decimal);
                    countInputs++;
                }
                else {
                    console.log('%c  DUST ' + item.decimal, 'color:red');
                    // total += item.amount;
                    // count++;
                }
            });
            var sum = jaxx.MATH.sum(out);
            console.log(sum);
            var spendableInt = jaxx.MATH.subtract(sum, miningFeeFixed);
            console.log(spendableInt);
            return jaxx.MATH.satoshiToBtc(spendableInt);
        };
        Utils.calculateSpendableBitcoinUTXOs = function (utxos, miningFeePerKilobyte, numOuts, bytesPerInput, useFilter, miningFeeFixed) {
            if (numOuts === void 0) { numOuts = 1; }
            if (bytesPerInput === void 0) { bytesPerInput = 148; }
            if (useFilter === void 0) { useFilter = true; }
            var perByteInt = miningFeePerKilobyte / 1024;
            var priceInt = bytesPerInput * perByteInt;
            var perByteDecimal = perByteInt / 1e8;
            var priceDecimals = priceInt / 1e8;
            var miningFeeDecimal = miningFeePerKilobyte / 1e8;
            var totalDecimal = 0;
            var countInputs = 0;
            if (utxos) {
                utxos.forEach(function (item) {
                    if (useFilter && item.decimal > priceDecimals) {
                        totalDecimal += item.decimal;
                        countInputs++;
                    }
                    else {
                        console.log('%c  DUST ' + item.decimal, 'color:red');
                        // total += item.amount;
                        // count++;
                    }
                });
            }
            var spendableDecimal;
            if (miningFeeFixed) {
                spendableDecimal = totalDecimal - (+miningFeeFixed / 1e8);
                return spendableDecimal;
            }
            var totalBytes = (bytesPerInput * countInputs) + (34 * numOuts) + 10;
            var feeDecimal = (totalBytes * perByteDecimal); ///1e8;
            spendableDecimal = (totalDecimal - feeDecimal);
            console.log('totalBytes    ' + totalBytes);
            console.log(' totalDecimal ' + totalDecimal);
            console.log('   feeDecimal ' + feeDecimal);
            console.log('spendableDecimal  ' + spendableDecimal);
            return spendableDecimal;
        };
        Utils.updateBalances = function (balances, new_bals) {
            var indexed = _.keyBy(new_bals, 'id');
            var stamp = Date.now();
            var out = [];
            // console.log(indexed);
            balances.forEach(function (item) {
                var new_bal = indexed[item.id];
                if (new_bal) {
                    item.timestamp = new_bal.timestamp;
                    if (item.balance !== new_bal.balance) {
                        // console.log(item.id + ' ' + item.balance + '  ' + new_bal.balance);
                        //item.delta = new_bal.decimal - item.decimal;
                        item.balance = new_bal.balance;
                        out.push(item);
                    } //else //item.delta = 0;
                }
                else
                    console.log(item.id + ' is missing ');
            });
            return out;
        };
        Utils.filterBalanceOnAddress = function (address, balances) {
            for (var i = balances.length - 1; i >= 0; i--)
                if (balances[i].id === address)
                    return balances[i].balance;
            return '';
        };
        Utils.updateUTXOS = function (old_utxo, new_utxo) {
            if (!Array.isArray(old_utxo) || !Array.isArray(new_utxo)) {
                console.error(old_utxo, new_utxo);
            }
            var n_indexed = {};
            new_utxo.forEach(function (item) {
                n_indexed[item.txid + item.index] = item;
            });
            var out = [];
            old_utxo.forEach(function (item) {
                if (n_indexed[item.txid + item.index]) {
                    //console.log( ' updating utxo old/new ',item, n_indexed[item.txid + item.index] );
                    out.push(n_indexed[item.txid + item.index]);
                }
                else {
                    out.push(item);
                }
            });
            return out;
        };
        Utils.createUTXOFromOutput = function (output) {
            return new VOutxo({});
        };
        Utils.createTempBalancesFromInputs = function (inputs, toAddress) {
            var out = [];
            var indexed = {};
            inputs.forEach(function (item) {
                if (indexed[item.address])
                    indexed[item.address].spent += (-item.amount);
                else
                    indexed[item.address] = new VOBalanceTemp({
                        id: item.address,
                        spent: -item.amount,
                        from: item.address,
                        to: toAddress,
                        timestamp: Date.now()
                    });
            });
            for (var str in indexed) {
                out.push(indexed[str]);
            }
            return out;
        };
        Utils.constartcInput2Keys = function (ar) {
            var out = [];
            ar.forEach(function (item) {
                out.push(item.previousTxId + '_' + item.previousIndex);
            });
            return out;
        };
        Utils.setInQueueUTXOsBy2Keys = function (utxos, keys2) {
            var now = Date.now();
            for (var i = utxos.length - 1; i >= 0; i--) {
                var key = utxos[i].txid + '_' + utxos[i].index;
                if (keys2.indexOf(key) !== -1) {
                    utxos[i].inqueue = true;
                    utxos[i].queueTimesatmp = now;
                }
            }
        };
        Utils.removeUTXOsBy2Keys = function (utxos, keys2) {
            for (var i = utxos.length - 1; i >= 0; i--) {
                var key = utxos[i].txid + '_' + utxos[i].index;
                if (keys2.indexOf(key) !== -1) {
                    utxos.splice(i, 1);
                }
            }
        };
        Utils.removeUTXOsBy2KeysID = function (utxos, keys2id) {
            for (var i = utxos.length - 1; i >= 0; i--) {
                var key = utxos[i].txid + '_' + utxos[i].index;
                if (key === keys2id) {
                    utxos.splice(i, 1);
                }
            }
        };
        /* static remapTransactionsToOldCode(unspent: VOTransactionUnspent[], controller: JaxxCryptoController): any[] {
 
             let out: any[] = [];
             for (let i = 0, n = unspent.length; i < n; i++) {
                 let trs = unspent[i];
 
                 out.push({
                     address: trs.address,
                     addressIndex: controller.getAddressIndex(trs.address),
                     addressInternal: controller.isAddressInternal(trs.address),
                     amount: trs.amount,
                     amountBtc: trs.amountBtc + '',
                     confirmations: trs.confirmations,
                     index: trs.index,
                     spent: false,
                     standard: true,
                     timestamp: trs.timestamp,
                     txid: trs.id
                 })
 
             }
             return out;
         }
 */
        /*
                static getTransactionsUnspentFromVORelayedTransactionList(data: VORelayedTransactionList[]): ReferenceRelaysUTXOData[] {
                    let out: ReferenceRelaysUTXOData[] = [];
                    data.forEach(function (item) {
                        var addr = item.address;
                        let utxo: any = item.utxoListDict;
                        for (let str in utxo) {
                            utxo[str].address = addr;
                            out.push(new ReferenceRelaysUTXOData(utxo[str]))
                        }
                        ;
        
                    });
        
                    return out;
                }*/
        Utils.deepCopy = function (obj) {
            var json = JSON.stringify(obj);
            var returned_object = JSON.parse(json);
            return returned_object;
        };
        Utils.addresseFromBalances = function (balances) {
            var out = [];
            balances.forEach(function (balance) {
                out.push(balance.id);
            });
            return out;
        };
        Utils.isCompleteBalances = function (addreses, balancess) {
            if (addreses.length !== balancess.length) {
                console.error(' missing balances  ');
                return false;
            }
            for (var i = 0, n = addreses.length; i < n; i++) {
                balancess[i].index = i;
                if (addreses[i] !== balancess[i].id)
                    return false;
            }
            return true;
        };
        Utils.reorderBalances = function (addreses, balancess) {
            var balIndexed = _.keyBy(balancess, 'id');
            var out = [];
            var i = 0;
            addreses.forEach(function (address) {
                var balance = balIndexed[address];
                if (balance)
                    balIndexed[address].index = i++;
                else
                    console.error('cant find balance for address: ' + address); ///balance = new VOBalance({id: address, balance: 0, timestamp: Date.now()});
                out.push(balance);
            });
            return out;
        };
        Utils.updateOldBalances2 = function (oldbalances, newbalances) {
            console.log('updateOldBalances ' + oldbalances.length + '  ' + newbalances.length);
            var out = [];
            var indexed = _.keyBy(newbalances, 'id');
            oldbalances.forEach(function (b_old) {
                var b_new = indexed[b_old.id];
                if (b_new) {
                    if (b_old.balance !== b_new.balance) {
                        console.log(' updating balance ' + b_new.id);
                        out.push(new VOBalanceDiff(b_new.id, b_old.balance, b_new.balance));
                        b_old.balance = b_new.balance;
                        b_old.timestamp = Math.floor(Date.now() / 1000);
                    }
                }
                else {
                    console.error(' unknown balance ', b_old);
                }
                // }
            });
            return out;
        };
        Utils.updateOldBalances = function (oldbalances, newbalances) {
            console.log('updateOldBalances ' + oldbalances.length + '  ' + newbalances.length);
            var out = [];
            var indexed = {};
            oldbalances.forEach(function (b) {
                indexed[b.id] = b;
            });
            newbalances.forEach(function (b_new) {
                if (!b_new) {
                    console.log(b_new);
                }
                else {
                    var b_old = indexed[b_new.id];
                    if (b_old) {
                        if (b_old.balance != b_new.balance) {
                            console.log(' updating balance ' + b_new.id);
                            out.push(new VOBalanceDiff(b_new.id, b_old.balance, b_new.balance));
                            b_old.balance = b_new.balance;
                            b_old.timestamp = Math.floor(Date.now() / 1000);
                        }
                    }
                    else {
                        console.error(' unknown balance ', b_new);
                    }
                }
            });
            return out;
        };
        Utils.transactionsDiff = function (transactions1, transactions2) {
            var diff = [];
            var indexed = {};
            if (!transactions1 || !transactions1.length)
                return transactions2;
            // this function detects new transactions downloaded from server
            // do not mark as new transactions what older then exists
            // transactions1 are transactions from localStorage
            // transactions2 are newly downloaded transactions
            var last = _.last(transactions1);
            var max = last ? last.timestamp - (60 * 60) : moment().subtract(1, 'day').unix();
            //console.log(new Date(max* 1000).toISOString());
            transactions1.forEach(function (tr) { return indexed[tr.id] = 1; });
            transactions2.forEach(function (tr) {
                //  console.log(new Date(tr.timestamp * 1000).toISOString());
                if ((tr.timestamp > max) && !indexed[tr.id])
                    diff.push(tr);
            });
            return diff;
        };
        /* static getNoncesOfAddresses(addresses:string[], transactions:VOTransaction[]):any {
         var nonces:any = {};
         addresses.forEach(function(address) {
         nonces[address] = 0;
         });

         transactions.forEach(function(transaction) {
         var from:string = transaction.from;

         if (!isNaN(nonces[from])) nonces[from]++;
         else nonces[from] = 0;

         });
         return nonces;
         }*/
        Utils.removeTempRemote = function (transactions) {
            transactions.forEach(function (transaction) {
                delete transaction.tempRemote;
                delete transaction.nonce;
                delete transaction.outs;
            });
        };
        Utils.getNoncesOfAddresses = function (transactions) {
            var nonces = {};
            /* transactions.forEach(function(trs) {
             nonces[trs.from] = 0;
             });*/
            transactions.forEach(function (transaction) {
                if (transaction.from === transaction.address) {
                    var from = transaction.from;
                    //@note: @here: @codereview: what logic is implying this isNaN switch is correct..
                    if (isNaN(nonces[from]))
                        nonces[from] = 1;
                    else
                        nonces[from]++;
                }
            });
            return nonces;
        };
        Utils.staticGetAddressesFromTransactions = function (trs) {
            var out = [];
            trs.forEach(function (item) {
                var addr = item.address;
                if (out.indexOf(addr) === -1)
                    out.push(addr);
            });
            return out;
        };
        Utils.splitInCunks = function (ar, length) {
            var out = [];
            for (var i = 0, n = ar.length; i < n; i += length) {
                out.push(ar.slice(i, i + length));
            }
            return out;
        };
        Utils.getObjectTotal = function (obj) {
            var total = 0;
            for (var str in obj) {
                total += obj[str].valueDelta;
            }
            return total;
        };
        Utils.filterLatest = function (ar, timestamp) {
            var out = [];
            ar.forEach(function (item) {
                if (item.timestamp > timestamp)
                    out.push(item);
            });
            return out;
        };
        Utils.sortByBalance = function (ar) {
            ar.sort(function (a, b) {
                if (a.balance > b.balance)
                    return 1;
                if (a.balance < b.balance)
                    return -1;
                return 0;
            });
        };
        Utils.sortTransactionsByBlock = function (ar) {
            ar.sort(function (a, b) {
                if (a.block > b.block)
                    return 1;
                if (a.block < b.block)
                    return -1;
                return 0;
            });
        };
        Utils.sortByTimestamp = function (ar) {
            ar.sort(function (a, b) {
                if (a.timestamp > b.timestamp)
                    return 1;
                if (a.timestamp < b.timestamp)
                    return -1;
                return 0;
            });
        };
        Utils.getArrayTotal = function (ar) {
            var total = 0;
            ar.forEach(function (item) {
                if (!isNaN(+item.valueDelta))
                    total += +item.valueDelta;
            });
            return total;
        };
        Utils.findAndReplaceById = function (arr, find, replace) {
            var i, n;
            for (i = 0, n = arr.length; i < n && arr[i].id != find.id; i++) {
            }
            i < n ? arr[i] = replace : arr.push(replace);
        };
        Utils.updateItemById = function (arr, item) {
            var i, n;
            for (i = 0, n = arr.length; i < n && arr[i].id != item.id; i++) {
            }
            i < n ? arr[i] = item : arr.push(item);
        };
        Utils.updateOldTransactions = function (oldtrs, newtrs) {
            var newInd = _.keyBy(newtrs, 'id');
            for (var i = oldtrs.length - 1; i >= 0; i--) {
                var id = oldtrs[i].id;
                if (newInd[id]) {
                    // if(oldtrs[i].isTemp) oldtrs.splice(i,1);
                    oldtrs[i].confirmations = newInd[id].confirmations;
                    //oldtrs[i].ti
                }
            }
            return oldtrs;
            /*oldtrs.forEach(function (trs) {
                if(newInd[trs.id]) trs = newInd[trs.id];
            });*/
        };
        Utils.getNewTransactions = function (oldtrs, newtrs) {
            var oldInd = _.keyBy(oldtrs, 'id');
            var out = [];
            newtrs.forEach(function (trs) {
                if (!oldInd[trs.id])
                    out.push(trs);
            });
            return out;
        };
        Utils.isArrayInObject = function (ar, obj) {
            for (var i = 0, n = ar.length; i < n; i++) {
                if (obj[ar[i]])
                    return true;
            }
            return false;
        };
        Utils.hasEnoughTimeElapsedToSleepJaxx = function () {
            var currentTime = new Date().getTime();
            if (typeof (jaxx.Registry.timeLastActive) === 'undefined' || jaxx.Registry.timeLastActive === null) {
                jaxx.Registry.timeLastActive = new Date();
            }
            if (currentTime - jaxx.Registry.timeLastActive.getTime() > 300000) {
                return true;
            }
            else {
                return false;
            }
        };
        return Utils;
    }());
    Utils.qrcodes = {};
    Utils.transactionsToArray = function (obj) {
        var out = [];
        for (var str in obj)
            out.push(obj[str]);
        return out;
    };
    jaxx.Utils = Utils;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=Utils.js.map