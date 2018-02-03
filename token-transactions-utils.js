var jaxx;
(function (jaxx) {
    var TransactionsUtilsToken = (function () {
        function TransactionsUtilsToken() {
        }
        //buildTokenTransaction
        TransactionsUtilsToken.buildToken = function (requested, amountWei, addressTo, nonce, contractAddress, gasLimit, gasPrice, signature, symbol, isMax, customData, coinConfig) {
            //console.log(arguments);
            var tempValue;
            // if(coinConfig.shiftCount) {
            //   tempValue = MATH.addTrailingZeros(amountWei, coinConfig);
            // } else {
            // tempValue = amountWei
            // }
            //  let amountDecimal: number =  Number(MATH.weiToEther(tempValue));
            var miningFeeDecimal = jaxx.MATH.weiToEther(String(+gasPrice * +gasLimit));
            // console.warn(' nonce ' + nonce);
            var data = jaxx.Utils.createTokenData(thirdparty.web3, amountWei, addressTo);
            if (customData) {
                console.error('User supplied custom data which is being ignored!');
                console.log('Custom Data', customData);
            }
            //  console.log('Data', data);
            var raw = jaxx.Utils.mapEthereumTransaction(thirdparty.web3, contractAddress, '0', nonce, gasPrice, gasLimit, data);
            // console.log(raw);
            var transaction = new thirdparty.ethereum.tx(raw);
            //console.log(transaction);
            transaction.sign(signature);
            var serialized = transaction.serialize().toString('hex');
            var txid = ('0x' + transaction.hash().toString('hex'));
            return {
                txid: txid,
                requested: requested + '',
                hex: serialized,
                totalSpent: amountWei,
                totalSpentDecimal: +jaxx.MATH.weiToEther(amountWei),
                amountDecimal: Number(requested),
                displayAmount: requested,
                amountInt: amountWei,
                addressTo: addressTo,
                symbol: symbol,
                miningFeeDecimal: +miningFeeDecimal,
                miningFeeSymbol: 'ETH',
                amountDecimalDisplay: requested,
                miningFeeInt: null,
                success: null,
                error: null,
                transactionETH: transaction,
                isMax: isMax,
                gasLimit: gasLimit,
                gasPrice: gasPrice
            };
        };
        return TransactionsUtilsToken;
    }());
    jaxx.TransactionsUtilsToken = TransactionsUtilsToken;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=token-transactions-utils.js.map