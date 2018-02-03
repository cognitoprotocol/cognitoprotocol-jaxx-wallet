var jaxx;
(function (jaxx) {
    var TransactionsUtilsEthereum = (function () {
        function TransactionsUtilsEthereum() {
        }
        TransactionsUtilsEthereum.buildETH = function (requested, amountEther, addressTo, balances, nonces, signatures, //privateKeys:{[address:string]:string},
            gasPrice, gasLimit, symbol, isMax, customData) {
            //gasPrice = String(+gasPrice *3 );
            var txid = '';
            var size = 0;
            var serialized = '';
            var requestedDecimals = +amountEther;
            //let requestedWei = amountToSendWei;
            var totalSpent = '0';
            var totalMiningFee = '0';
            var miningPrice = jaxx.MATH.multiplay([gasPrice, gasLimit]);
            //let miningFeeTotalWei: string = '0';
            var isComplete = false;
            var transactions = [];
            var sendingTotal = '0';
            if (isMax) {
                var ar = balances.map(function (item) {
                    return jaxx.MATH.subtract(item.balance, miningPrice);
                });
                var maxToSend = jaxx.MATH.sum(ar);
                requested = maxToSend;
            }
            for (var i = 0, n = balances.length; i < n; i++) {
                if (isComplete)
                    break;
                var input = balances[i].balance;
                var addressFrom = balances[i].id;
                if (jaxx.MATH.greaterOrEqualAthenB(miningPrice, input)) {
                    console.warn(' DUST ' + (+input / 1e10) + '  miningPrice ' + (+miningPrice / 1e10) + '  ' + addressFrom);
                    continue;
                }
                var toSendWei = jaxx.MATH.subtract(input, miningPrice);
                totalSpent = jaxx.MATH.sum([totalSpent, input]);
                sendingTotal = jaxx.MATH.sum([sendingTotal, toSendWei]);
                var change = jaxx.MATH.subtract(sendingTotal, requested);
                // console.log(change, sendingTotal, requested, input, toSendWei, totalSpent);
                var isEmpty = true;
                if (!isMax && +change >= 0) {
                    isComplete = true;
                    if (+change > +miningPrice) {
                        isEmpty = false;
                        toSendWei = jaxx.MATH.subtract(toSendWei, change);
                        sendingTotal = jaxx.MATH.subtract(sendingTotal, change);
                        totalSpent = jaxx.MATH.subtract(totalSpent, change);
                    }
                    else {
                    }
                    //sendingTotal =  MATH.sum([sendingTotal, change]);
                }
                totalMiningFee = jaxx.MATH.sum([totalMiningFee, miningPrice]);
                var tr1 = {
                    addressFrom: addressFrom,
                    addressTo: addressTo,
                    balanceWei: input,
                    toSendWei: toSendWei,
                    isEmpty: isEmpty,
                    spendWei: jaxx.MATH.sum([toSendWei, miningPrice]),
                    nonce: nonces[addressFrom],
                    miningFeeWei: miningPrice,
                    gasPrice: gasPrice,
                    gasLimit: gasLimit,
                    hex: null,
                    txid: null,
                    error: null,
                    result: null
                };
                transactions.push(tr1);
                if (isComplete)
                    break;
            }
            //console.log(transactions);
            var web3 = thirdparty.web3;
            transactions.forEach(function (item) {
                var transaction = new thirdparty.ethereum.tx({
                    nonce: web3.toHex(+item.nonce),
                    gasPrice: web3.toHex(gasPrice),
                    gasLimit: web3.toHex(gasLimit),
                    to: addressTo,
                    value: web3.toHex(item.toSendWei),
                    data: (customData && customData.length > 5) ? customData : null
                });
                if (customData && customData.length)
                    transaction.data = customData;
                var signature = signatures[item.addressFrom] ? signatures[item.addressFrom] : signatures['address'];
                transaction.sign(signature);
                item.txid = ('0x' + transaction.hash().toString('hex'));
                var hex = transaction.serialize().toString('hex');
                item.hex = hex;
            });
            return {
                requested: requested,
                amountDecimal: +jaxx.MATH.weiToEther(sendingTotal),
                amountInt: sendingTotal,
                displayAmount: jaxx.MATH.weiToEther(sendingTotal),
                amountDecimalDisplay: jaxx.MATH.weiToEther(sendingTotal),
                miningFeeInt: totalMiningFee,
                miningFeeDecimal: +jaxx.MATH.weiToEther(totalMiningFee),
                miningFeeSymbol: null,
                totalSpent: totalSpent,
                totalSpentDecimal: +jaxx.MATH.weiToEther(totalSpent),
                txid: txid,
                size: size,
                complete: isComplete,
                hex: serialized,
                addressTo: addressTo,
                symbol: symbol,
                transactionsETH: transactions,
                isMax: isMax,
                success: null
            };
        };
        return TransactionsUtilsEthereum;
    }());
    jaxx.TransactionsUtilsEthereum = TransactionsUtilsEthereum;
    var UtilsETH = (function () {
        function UtilsETH() {
        }
        // converts string into hex
        UtilsETH.fromAscii = function (str) {
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                var n = code.toString(16);
                hex += n.length < 2 ? '0' + n : n;
            }
            return "0x" + hex;
        };
        ;
        return UtilsETH;
    }());
    jaxx.UtilsETH = UtilsETH;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=ethereum-transactions-utils.js.map