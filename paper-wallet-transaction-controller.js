var jaxx;
(function (jaxx) {
    var PaperWalletTransactionController = (function () {
        function PaperWalletTransactionController() {
        }
        /*
        * determines how much the user should receive when they spend all their UTXOs associated with their private key.
        * @method getSpendableCoin
        * @param {VOutxo[]} utxos
        * @param {String} symbol three letter symbol for coins ex. BTC
        * */
        PaperWalletTransactionController.prototype.getSpendableCoin = function (utxos, symbol) {
            var ar = utxos.map(function (item) {
                return item.satoshis;
            });
            var total;
            if (utxos.length > 1) {
                total = jaxx.MATH.sum(ar);
            }
            else {
                total = ar[0];
            }
            total = jaxx.Registry.getCryptoControllerBySymbol(symbol).subtractMiningFee(total, utxos.length);
            if (+total < 0 || isNaN(Number(total))) {
                return '0';
            }
            total = jaxx.MATH.satoshiToBtc(total);
            return total;
        };
        /*
        * Sweeps the private key for all UTXOs associated with it
        * @method prepareSweepTransactionCoin
        * @param {String} privateKey
        * @param {String} symbol
        * @param {Function} callback
        * */
        PaperWalletTransactionController.prototype.prepareSweepTransactionCoin = function (privateKey, symbol, callback) {
            var _this = this;
            var coinNetwork;
            coinNetwork = jaxx.Registry.getCryptoControllerBySymbol(symbol).config.network; //HDWalletPouch.getStaticCoinPouchImplementation(this._pouchManager._coinType).networkDefinitions.testNet;
            var keyPair;
            try {
                keyPair = thirdparty.bitcoin.ECPair.fromWIF(privateKey, coinNetwork);
            }
            catch (err) {
                return;
            }
            var coinController = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            var publicAddress = keyPair.getAddress();
            coinController.coinService.downlaodUTXOs([publicAddress]).done(function (res) {
                var utxos = res;
                var privateKeys = {};
                utxos.forEach(function (utxo) {
                    //this was changed to use keyPair as we already have this information saved
                    privateKeys[utxo.address] = keyPair;
                });
                var spendable = _this.getSpendableCoin(utxos, symbol);
                if (Number(spendable) > 0) {
                    var amountSatoshi = jaxx.MATH.btcToSatoshi(spendable);
                    var addressChange = coinController.getCurrentAddressChange();
                    var transaction = void 0;
                    var miningFeePerByte = coinController.getMiningPrice();
                    var isMax = true;
                    var addressTo = coinController.getCurrentAddress();
                    var symbol_1 = coinController.config.symbol;
                    var network = coinController.config.network;
                    //try catch were added to prevent UI hang ups.  This is good practice as this prevents the app
                    //from not responding in the event of an error in the functions within the try catch.
                    try {
                        if (coinController.symbol === 'BCH') {
                            transaction = jaxx.TransactionsUtilsBitcoin.buildBCHPerbyte(amountSatoshi, addressTo, utxos, privateKeys, null, addressChange, network, symbol_1, isMax, miningFeePerByte);
                        }
                        else {
                            transaction = jaxx.TransactionsUtilsBitcoin.buildBTC(amountSatoshi, addressTo, utxos, privateKeys, null, addressChange, network, symbol_1, isMax, miningFeePerByte);
                        }
                    }
                    catch (e) {
                        return callback('There is an error in the application. Jaxx is not able to sweep this private key', null);
                    }
                    if (transaction) {
                        return callback(null, {
                            signedTransaction: transaction,
                            totalValue: spendable,
                        });
                    }
                }
                callback('This private key does not have enough spendable ' + symbol + ' to move out of private key.', null);
            }).fail(function (err) {
                callback(err, null);
            });
        };
        /*
        * Sweeps the private key for the balance associated with it
        * @method prepareSweepTransactionEthereum
        * @param {String} privateKey
        * @param {Function} callback
        * */
        PaperWalletTransactionController.prototype.prepareSweepTransactionEthereum = function (symbol, privateKey, callback) {
            var privateKeyHex = new thirdparty.Buffer.Buffer(privateKey, 'hex');
            var signatures = {};
            signatures['address'] = privateKeyHex;
            var ethAddressToSweep = [this.ethereumAddressFromPrivateKey(symbol, privateKey)];
            if (ethAddressToSweep[0]) {
                var ethereumController_1 = jaxx.Registry.getCryptoControllerBySymbol(symbol);
                var spendableWei_1 = 0;
                ethereumController_1.coinService.downloadBalances(ethAddressToSweep).done(function (res) {
                    var fee = Number(ethereumController_1.config.gasPrice) * Number(ethereumController_1.config.gasLimit);
                    if (res[0]) {
                        var balances_1 = res;
                        var balanceItem = res[0];
                        if (Number(balanceItem.balance) > fee) {
                            spendableWei_1 = Number(balanceItem.balance) - fee;
                        }
                        if (spendableWei_1 <= 0) {
                            callback(null, 'zero');
                        }
                        else {
                            ethereumController_1.getNonces(ethAddressToSweep).done(function (nonces) {
                                var decimal = jaxx.MATH.weiToEther(String(spendableWei_1));
                                var transaction = jaxx.TransactionsUtilsEthereum.buildETH(String(spendableWei_1), decimal, ethereumController_1.getCurrentAddress(), balances_1, nonces, signatures, // privateKeys,
                                ethereumController_1.config.gasPrice, ethereumController_1.config.gasLimit, ethereumController_1.symbol, true, null);
                                callback(null, {
                                    signedTransaction: transaction,
                                    totalValue: decimal,
                                });
                            }).fail(function (err) {
                                callback(err, null);
                            });
                        }
                    }
                }).fail(function (err) {
                    callback(err, null);
                });
            }
            else {
                callback('Invalid ethereum address', null);
            }
        };
        /*
        * Generates a public address by doing a mock transaction and signing with private key provided.
        * @method ethereumAddressFromPrivateKey
        * @param {String} privateKey
        * @return {String}*/
        PaperWalletTransactionController.prototype.ethereumAddressFromPrivateKey = function (symbol, privateKey) {
            //Create a fake tx
            var mockUpTxRaw = {
                nonce: thirdparty.web3.toHex(1),
                gasPrice: thirdparty.web3.toHex(thirdparty.web3.toBigNumber(thirdparty.web3.toWei(21, 'shannon')).toDigits(1)),
                gasLimit: thirdparty.web3.toHex(jaxx.Registry.getCryptoControllerBySymbol(symbol).config.gasLimit),
                to: "0xbac369f138d479abd45340e7735f80617a008ee7",
                value: thirdparty.web3.toHex(1)
            };
            var mockUpTxR = new thirdparty.ethereum.tx(mockUpTxRaw);
            //Sign with the private key
            var privateKeyHex = new thirdparty.Buffer.Buffer(privateKey, 'hex');
            mockUpTxR.sign(privateKeyHex);
            var address = mockUpTxR.getSenderAddress().toString('hex');
            if (address) {
                return '0x' + address;
            }
            return null;
        };
        return PaperWalletTransactionController;
    }());
    jaxx.PaperWalletTransactionController = PaperWalletTransactionController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=paper-wallet-transaction-controller.js.map