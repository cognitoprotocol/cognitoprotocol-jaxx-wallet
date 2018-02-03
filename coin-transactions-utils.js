var jaxx;
(function (jaxx) {
    var TransactionsUtilsBitcoin = (function () {
        function TransactionsUtilsBitcoin() {
        }
        /// this function not used and stay for purpose to go back to build transactions altcoins with static fee
        TransactionsUtilsBitcoin.build = function (toSendSatoshi, addressTo, utxos, privateKeys, miningFeeSatoshi, changeAddress, network, symbol, isMax) {
            //  console.log(['toSendSatoshi','addressTo','utxos'  ,'privateKeys', 'miningFeeInt' ,'changeAddress' ,'network' ,'symbol', 'isMax']);
            //console.log(arguments);
            miningFeeSatoshi = String(miningFeeSatoshi);
            var fullAmount, totalSpent;
            /// if max true ignoring input and calculating amount derived from all UTXOs
            if (isMax) {
                fullAmount = jaxx.MATH.sum(_.map(utxos, 'satoshis'));
                toSendSatoshi = jaxx.MATH.subtract(fullAmount, miningFeeSatoshi);
                totalSpent = fullAmount;
            }
            else
                totalSpent = jaxx.MATH.sum([toSendSatoshi, miningFeeSatoshi]);
            var tx = new thirdparty.bitcoin.TransactionBuilder(network);
            var changeSatoshi;
            var outputs = [
                {
                    address: addressTo,
                    amount: toSendSatoshi,
                    value: toSendSatoshi,
                    script: thirdparty.bitcoin.address.toOutputScript(addressTo, network)
                }
            ];
            var inputs = [];
            var complete;
            var sumSatoshi = '0';
            // console.log(utxos)
            for (var i = 0, n = utxos.length; i < n; i++) {
                var utxo = utxos[i];
                var input = utxo.satoshis;
                sumSatoshi = jaxx.MATH.sum([sumSatoshi, input]);
                inputs.push(utxo);
                // console.log( 'input ' + input + ' total '+ sumSatoshi +'  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi + '  totalSpent ' + totalSpent);
                if (isMax)
                    continue;
                if (+sumSatoshi >= +totalSpent) {
                    complete = true;
                    changeSatoshi = jaxx.MATH.subtract(sumSatoshi, totalSpent);
                    //console.log(' change ' + changeSatoshi);
                    // if change less then mining fee ignoring it and amount will be added to mining fee for faster transaction
                    if (+changeSatoshi < (+miningFeeSatoshi)) {
                        miningFeeSatoshi = jaxx.MATH.sum([miningFeeSatoshi, changeSatoshi]);
                        // console.log(' keep penny ' + changeSatoshi);
                        changeSatoshi = null; // keep the penny
                    }
                    else {
                        /// if change exists adding change address to outputs;
                        outputs.push({
                            address: changeAddress,
                            amount: changeSatoshi,
                            value: changeSatoshi,
                            script: thirdparty.bitcoin.address.toOutputScript(changeAddress, network)
                        });
                    }
                    break;
                }
            }
            if (isMax) {
                complete = true;
            }
            if (!complete) {
                Navigation.flashBanner("Can\'t build transaction total", 3, 'error');
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('buildTransactionBTC', 'not complete line 74: total is less or equal to total spent' + ' cant build transaction total: ' + sumSatoshi + ' totalSpent ' + totalSpent + '  toSendSatoshi ' + toSendSatoshi + '  miningFeeSatoshi ' + miningFeeSatoshi, utxos, 'BTC'));
                console.error(' cant build transaction total: ' + sumSatoshi + ' totalSpent ' + totalSpent + '  toSendSatoshi ' + toSendSatoshi + '  miningFeeSatoshi ' + miningFeeSatoshi);
                // console.log( utxos, toSpend);
                return null;
            }
            // toSpend = thirdparty.bip69.sortInputs(toSpend);
            // outputs = thirdparty.bip69.sortOutputs(outputs);
            ///////////////////////////////////////// Building transaction using inputs and outputs
            outputs.forEach(function (output) {
                var amount = Number(output.amount);
                var address = output.address;
                tx.addOutput(address, amount);
            });
            inputs.forEach(function (input) {
                var txid = input.txid;
                var vout = input.vout;
                // console.log(txid + ' vout  ' + vout);
                tx.addInput(txid, vout);
            });
            tx.buildIncomplete();
            inputs.forEach(function (input, index) {
                var pk = privateKeys[input.address];
                // console.log('signing ');
                tx.sign(index, pk);
            });
            /////////////////////////////////////////////////////////////////// end of build
            var transaction = tx.build();
            var txidBig = transaction.getHash().toString('hex');
            var txid = '';
            for (var i = txidBig.length - 2; i >= 0; i -= 2) {
                txid += txidBig.substring(i, i + 2);
            }
            var serialized = transaction.toHex();
            //console.log('serialized  ', serialized);
            var size = serialized.length / 2 + transaction.ins.length * 107;
            return {
                txid: txid,
                requested: toSendSatoshi,
                amountInt: toSendSatoshi,
                amountDecimal: +jaxx.MATH.satoshiToBtc(toSendSatoshi),
                amountDecimalDisplay: jaxx.MATH.satoshiToBtc(toSendSatoshi),
                miningFeeInt: miningFeeSatoshi,
                miningFeeDecimal: +jaxx.MATH.satoshiToBtc(miningFeeSatoshi),
                miningFeeSymbol: null,
                totalSpent: totalSpent,
                totalSpentDecimal: +jaxx.MATH.satoshiToBtc(totalSpent),
                changeAmount: changeSatoshi,
                size: size,
                hex: serialized,
                // targetTransactionFee: targetTransactionFee,
                transactionBTC: transaction,
                changeAddress: changeAddress,
                // amountDecimal: toSendDecimal,
                outputs: outputs,
                inputs: inputs,
                addressTo: addressTo,
                symbol: symbol,
                isMax: isMax,
                success: {}
            };
        };
        TransactionsUtilsBitcoin.buildBTC = function (toSendSatoshi, addressTo, utxos, privateKeys, miningFeeIntNull, changeAddress, network, symbol, isMax, pricePerB) {
            var tx = new thirdparty.bitcoin.TransactionBuilder(network);
            var outputs = [
                {
                    address: addressTo,
                    amount: toSendSatoshi,
                    // Keys for bip69 to sort on
                    value: toSendSatoshi,
                    script: thirdparty.bitcoin.address.toOutputScript(addressTo, network)
                }
            ];
            var miningFeeDecimal = 0;
            var changeSatoshi;
            var spentUTXOs = [];
            var required = '0';
            var total = '0';
            var complete = false;
            var bytesPerInput = 148;
            var bytesPerOutput = 34;
            var totalBytes = 0;
            var numOuts = isMax ? 1 : 2;
            var countInputs = 0;
            var miningFeeInt = 0;
            var miningFeeSatoshi = '0';
            for (var i = 0, n = utxos.length; i < n; i++) {
                var utxo = utxos[i];
                var input = utxo.satoshis;
                total = jaxx.MATH.sum([total, input]);
                countInputs++;
                totalBytes = (bytesPerInput * countInputs) + (bytesPerOutput * numOuts) + 10;
                var old = miningFeeInt;
                miningFeeInt = (totalBytes * pricePerB); /// not really KB
                miningFeeSatoshi = String(miningFeeInt);
                required = jaxx.MATH.sum([toSendSatoshi, miningFeeSatoshi]);
                spentUTXOs.push(utxo);
                if (isMax)
                    continue;
                if (+total > (+required)) {
                    complete = true;
                    changeSatoshi = jaxx.MATH.subtract(total, required);
                    //// low change
                    //if change less then mining fee ignoring it and amount will be added to mining fee for faster transaction
                    if (+changeSatoshi < (bytesPerOutput * pricePerB)) {
                        console.warn(' small amount ' + changeSatoshi);
                        miningFeeSatoshi = jaxx.MATH.sum([miningFeeSatoshi, changeSatoshi]);
                        changeSatoshi = null;
                    }
                    else {
                        var realSpent = jaxx.MATH.subtract(total, changeSatoshi);
                        outputs.push({
                            address: changeAddress,
                            amount: changeSatoshi,
                            value: changeSatoshi,
                            script: thirdparty.bitcoin.address.toOutputScript(changeAddress, network)
                        });
                    }
                    break;
                }
            }
            if (isMax) {
                complete = true;
            }
            if (!complete) {
                Navigation.flashBanner("Can\'t build transaction total", 3, 'error');
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('buildTransactionBTC', 'not complete line 287: total is less or equal to total spent' + ' total ' + total + '  totalSpent ' + required + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi, utxos, 'BTC'));
                console.error(' total ' + total + '  totalSpent ' + required + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi);
                return null;
            }
            // toSpend = thirdparty.bip69.sortInputs(toSpend);
            // outputs = thirdparty.bip69.sortOutputs(outputs);
            outputs.forEach(function (output) {
                var amount = Number(output.amount);
                var address = output.address;
                tx.addOutput(address, amount);
            });
            spentUTXOs.forEach(function (input) {
                var txid = input.txid;
                var vout = input.vout;
                // console.log(txid + ' vout  ' + vout);
                tx.addInput(txid, vout);
            });
            tx.buildIncomplete();
            spentUTXOs.forEach(function (input, index) {
                var pk = privateKeys[input.address];
                // console.log('signing ', pk);
                tx.sign(index, pk);
            });
            var transaction = tx.build();
            var txidBig = transaction.getHash().toString('hex');
            var txid = '';
            for (var i = txidBig.length - 2; i >= 0; i -= 2) {
                txid += txidBig.substring(i, i + 2);
            }
            var serialized = transaction.toHex();
            var size = serialized.length / 2 + transaction.ins.length * 107;
            var targetTransactionFee = jaxx.MATH.multiplay([String(Math.ceil(size / 1024)), String(miningFeeInt)]);
            return {
                txid: txid,
                requested: toSendSatoshi,
                amountInt: toSendSatoshi,
                amountDecimal: +jaxx.MATH.satoshiToBtc(toSendSatoshi),
                amountDecimalDisplay: null,
                displayAmount: jaxx.MATH.satoshiToBtc(toSendSatoshi),
                miningFeeInt: miningFeeSatoshi,
                miningFeeDecimal: +jaxx.MATH.satoshiToBtc(miningFeeSatoshi),
                miningFeeSymbol: null,
                changeAmount: changeSatoshi,
                totalSpent: required,
                totalSpentDecimal: +jaxx.MATH.satoshiToBtc(required),
                size: size,
                hex: serialized,
                targetTransactionFee: targetTransactionFee,
                transactionBTC: transaction,
                changeAddress: outputs.length > 1 ? changeAddress : null,
                // amountDecimal: +toSendSatoshi / 1e8,
                outputs: outputs,
                inputs: spentUTXOs,
                addressTo: addressTo,
                symbol: symbol,
                isMax: isMax,
                success: {}
            };
        };
        TransactionsUtilsBitcoin.buildBCHPerbyte = function (toSendSatoshi, addressTo, utxos, privateKeys, miningFeeIntNull, changeAddress, network, symbol, isMax, pricePerB) {
            var outputs = [
                {
                    address: addressTo,
                    amount: toSendSatoshi,
                    value: toSendSatoshi,
                    script: bitcore.Script.buildDataOut(addressTo)
                }
            ];
            var miningFeeDecimal = 0;
            var changeSatoshi;
            var spentUTXOs = [];
            var required = '0';
            var total = '0';
            var complete = false;
            var bytesPerInput = 148;
            var bytesPerOutput = 34;
            var totalBytes = 0;
            var numOuts = isMax ? 1 : 2;
            var countInputs = 0;
            var miningFeeInt = 0;
            var miningFeeSatoshi = '0';
            for (var i = 0, n = utxos.length; i < n; i++) {
                var utxo = utxos[i];
                var input = utxo.satoshis;
                total = jaxx.MATH.sum([total, input]);
                countInputs++;
                totalBytes = (bytesPerInput * countInputs) + (bytesPerOutput * numOuts) + 10;
                var old = miningFeeInt;
                miningFeeInt = (totalBytes * pricePerB); /// not really KB
                miningFeeSatoshi = String(miningFeeInt);
                required = jaxx.MATH.sum([toSendSatoshi, miningFeeSatoshi]);
                spentUTXOs.push(utxo);
                // check is enough UTXOs to cover required payment
                if (+total > (+required)) {
                    complete = true;
                    changeSatoshi = jaxx.MATH.subtract(total, required);
                    /// if sending max add change satoshi to sending value else creating change
                    if (isMax) {
                        toSendSatoshi = jaxx.MATH.sum([toSendSatoshi, changeSatoshi]);
                    }
                    else {
                        //if change less then mining fee ignoring it and amount will be added to mining fee for faster transaction
                        if (+changeSatoshi < (bytesPerInput * pricePerB)) {
                            console.log(' small amount ' + changeSatoshi);
                            changeSatoshi = null;
                        }
                        else {
                            outputs.push({
                                address: changeAddress,
                                amount: changeSatoshi,
                                value: changeSatoshi,
                                script: 'change'
                            });
                            var realSpent = jaxx.MATH.subtract(total, changeSatoshi);
                        }
                    }
                    break;
                }
            }
            if (isMax) {
                complete = true;
            }
            if (!complete) {
                Navigation.flashBanner("Can\'t build transaction total", 3, 'error');
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('buildTransactionBTC', 'not complete line 287: total is less or equal to total spent' + ' total ' + total + '  totalSpent ' + required + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi, utxos, 'BTC'));
                console.error(' total ' + total + '  totalSpent ' + required + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi);
                return null;
            }
            // for BCH we need to specify mining fee and the rest goes to change address;
            var utxosAr = spentUTXOs.map(function (o) { return o.satoshis; });
            var amountUtxos = jaxx.MATH.sum(utxosAr);
            // adjusting mining fee after selected UTXOs to build transaction
            var miningFeeSatoshiAfter = jaxx.MATH.subtract(amountUtxos, toSendSatoshi);
            if (changeSatoshi)
                miningFeeSatoshiAfter = jaxx.MATH.subtract(miningFeeSatoshiAfter, changeSatoshi);
            // console.log(' amountUtxos: '+amountUtxos +' toSendSatoshi '+toSendSatoshi + ' miningFeeSatoshi '+miningFeeSatoshi+ ' length: '+ spentUTXOs.length+ ' pricePerB '+pricePerB +' changeSatoshi ' + changeSatoshi);
            var tx = new bitcore.Transaction();
            tx.to(addressTo, +toSendSatoshi);
            if (changeSatoshi)
                tx.change(changeAddress);
            tx.fee(Number(miningFeeSatoshiAfter));
            spentUTXOs.forEach(function (input) {
                var inputObj = {
                    txId: input.txid,
                    outputIndex: input.vout,
                    script: bitcore.Script.buildPublicKeyHashOut(input.address),
                    satoshis: +input.satoshis
                };
                tx.from(inputObj);
            });
            //tx.sort();
            spentUTXOs.forEach(function (input, index) {
                var pk = privateKeys[input.address];
                var signKey = bitcore.PrivateKey.fromWIF(pk.toWIF());
                tx.sign(signKey.toString());
            });
            var serialized = tx.serialize();
            var VO = tx.toJSON();
            var size = serialized.length / 2 + spentUTXOs.length * 107;
            var targetTransactionFee = jaxx.MATH.multiplay([String(Math.ceil(size / 1024)), String(miningFeeInt)]);
            return {
                txid: VO.hash,
                requested: toSendSatoshi,
                amountInt: toSendSatoshi,
                amountDecimal: +jaxx.MATH.satoshiToBtc(toSendSatoshi),
                amountDecimalDisplay: null,
                displayAmount: jaxx.MATH.satoshiToBtc(toSendSatoshi),
                miningFeeInt: miningFeeSatoshiAfter,
                miningFeeDecimal: +jaxx.MATH.satoshiToBtc(miningFeeSatoshiAfter),
                miningFeeSymbol: null,
                changeAmount: changeSatoshi,
                totalSpent: required,
                totalSpentDecimal: +jaxx.MATH.satoshiToBtc(required),
                size: 0,
                hex: serialized,
                targetTransactionFee: targetTransactionFee,
                transactionBTC: VO,
                changeAddress: outputs.length > 1 ? changeAddress : null,
                // amountDecimal: +toSendSatoshi / 1e8,
                outputs: outputs,
                inputs: spentUTXOs,
                addressTo: addressTo,
                symbol: symbol,
                isMax: isMax,
                success: {}
            };
        };
        /// this function not used and stay for purpose to go back to build transactions BCH with static fee
        TransactionsUtilsBitcoin.buildBCH = function (toSendSatoshi, addressTo, utxos, privateKeys, miningFeeInt, changeAddress, network, symbol, isMax, pricePerB) {
            var hasUTXOS = _.every(utxos, function (utxo) {
                return !!utxo.txid;
            });
            if (!hasUTXOS) {
                console.error('UTXOs are not valid');
                return null;
            }
            var tx = new bitcore.Transaction();
            var outputs = [
                {
                    address: addressTo,
                    amount: toSendSatoshi,
                    // Keys for bip69 to sort on
                    value: toSendSatoshi,
                    //script: thirdparty.bitcoin.address.toOutputScript(addressTo, network)
                    script: bitcore.Script.buildDataOut(addressTo)
                }
            ];
            var changeSatoshi;
            var spentUTXOs = [];
            var totalSpent = '0';
            var total = '0';
            var complete = false;
            var numOuts = isMax ? 1 : 2;
            var countInputs = 0;
            var miningFeeSatoshi = '0';
            for (var i = 0, n = utxos.length; i < n; i++) {
                var utxo = utxos[i];
                var input = utxo.satoshis;
                total = jaxx.MATH.sum([total, input]);
                countInputs++;
                miningFeeSatoshi = String(miningFeeInt);
                totalSpent = jaxx.MATH.sum([toSendSatoshi, miningFeeSatoshi]);
                console.log('miningFeeInt  ' + miningFeeInt);
                //console.error('Not sure about utxo.decimal - does it need to be converted?');
                //totalDecimal = MATH.sum([totalDecimal, Number(utxo.decimal).toString()]);
                //console.log('totalDecimal  '+totalDecimal + ' utxo.decimal ' + utxo.decimal);
                console.log('input ' + input + ' total ' + total + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi + '  totalSpent ' + totalSpent);
                spentUTXOs.push(utxo);
                if (+total > (+totalSpent)) {
                    complete = true;
                    changeSatoshi = jaxx.MATH.subtract(total, totalSpent);
                    /// if sending max add change satoshi to sending value
                    if (isMax) {
                        toSendSatoshi = jaxx.MATH.sum([toSendSatoshi, changeSatoshi]);
                    }
                    else {
                        console.log(' changeSatoshi ' + changeSatoshi);
                        if (+changeSatoshi < +miningFeeInt) {
                            console.log(' keep penny ' + changeSatoshi);
                            changeSatoshi = null;
                        }
                        0;
                        if (changeSatoshi)
                            totalSpent = jaxx.MATH.subtract(total, changeSatoshi);
                    }
                    break;
                }
            }
            if (isMax) {
                complete = true;
            }
            //   console.log( ' complete ' + )
            if (!complete) {
                Navigation.flashBanner("Can\'t build transaction total", 3, 'error');
                jaxx.Registry.error$.triggerHandler(jaxx.Registry.ON_ERROR, new VOError('buildTransactionBTC', 'not complete line 464: total is less or equal to total spent' + ' total ' + total + '  totalSpent ' + totalSpent + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi, utxos, 'BTC'));
                console.error(' total ' + total + '  totalSpent ' + totalSpent + '  toSendSatoshi: ' + toSendSatoshi + ' miningFeeSatoshi ' + miningFeeSatoshi);
                return null;
            }
            console.log('changeSatoshi ' + changeSatoshi + ' total  ' + total + ' toSendSatoshi ' + toSendSatoshi + ' miningFeeInt ' + miningFeeInt);
            if (changeSatoshi) {
                outputs.push({
                    address: changeAddress,
                    amount: changeSatoshi,
                    value: changeSatoshi,
                    script: thirdparty.bitcoin.address.toOutputScript(changeAddress, network)
                });
            }
            console.log('Outputs: ', jaxx.Utils.deepCopy(outputs), 'Inputs: ', jaxx.Utils.deepCopy(spentUTXOs));
            var miningFee = jaxx.Registry.getCryptoControllerBySymbol('BCH').config.miningFee;
            outputs.forEach(function (output, index) {
                var amount = Number(output.amount);
                if (isNaN(amount)) {
                    console.error('Amount not a number', amount);
                    return null;
                }
                var address = output.address;
                console.log(address, amount);
                if (index == 0)
                    tx.to(address, amount);
                else
                    tx.change(address);
            });
            tx.fee(miningFee);
            spentUTXOs.forEach(function (input) {
                /* let txid = input.txid;
                 let vout = input.vout;*/
                var inputObj = {
                    txId: input.txid,
                    outputIndex: input.vout,
                    script: bitcore.Script.buildPublicKeyHashOut(input.address),
                    satoshis: +input.satoshis
                };
                // console.log(txid + ' vout  ' + vout);
                tx.from(inputObj);
            });
            //tx.buildIncomplete();
            tx.sort();
            spentUTXOs.forEach(function (input, index) {
                var pk = privateKeys[input.address];
                //  console.log('signing ', pk);
                var signKey = bitcore.PrivateKey.fromWIF(pk.toWIF());
                //  console.log(signKey)
                tx.sign(signKey.toString());
                //tx.sign(pk);
            });
            var serialized = tx.serialize();
            // let transaction = tx;
            // console.log(tx.toJSON())
            var VO = tx.toJSON();
            return {
                txid: VO.hash,
                requested: toSendSatoshi,
                amountInt: toSendSatoshi,
                amountDecimal: +jaxx.MATH.satoshiToBtc(toSendSatoshi),
                displayAmount: jaxx.MATH.satoshiToBtc(toSendSatoshi),
                miningFeeInt: miningFeeSatoshi,
                miningFeeSymbol: null,
                miningFeeDecimal: +jaxx.MATH.satoshiToBtc(miningFeeSatoshi),
                amountDecimalDisplay: null,
                changeAmount: changeSatoshi,
                totalSpent: totalSpent,
                totalSpentDecimal: +jaxx.MATH.satoshiToBtc(totalSpent),
                size: 0,
                hex: serialized,
                targetTransactionFee: '0',
                transactionBTC: tx,
                changeAddress: outputs.length > 1 ? changeAddress : null,
                // amountDecimal: +toSendSatoshi / 1e8,
                outputs: outputs,
                inputs: spentUTXOs,
                addressTo: addressTo,
                symbol: symbol,
                isMax: isMax,
                success: {}
            };
        };
        return TransactionsUtilsBitcoin;
    }());
    jaxx.TransactionsUtilsBitcoin = TransactionsUtilsBitcoin;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=coin-transactions-utils.js.map