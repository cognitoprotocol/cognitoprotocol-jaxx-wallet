var jaxx;
(function (jaxx) {
    var TransactionsView = (function () {
        function TransactionsView() {
            var _this = this;
            this.dateFormat = "MMM DD YYYY";
            this.timeFormat = 'hh:mm A';
            // this array is populated at the UI layer when a transaction is successfully sent with the details of the sent transaction        
            // the addition of txes happens when the Sent Transaction controller 
            // triggers the ON_TRANSACTION_SENT event
            // in the end, these temporary TXes are inserted into the UI tx history list until the mempool transaction is downloaded
            this.tempTxes = []; // these are not saved anywhere, if the app is restarted the temp tx goes away - its purpose is to fill in until the real data comes form the backend to improve UX
            this.counter = 0;
            $('head').append('<link rel="stylesheet" href="js/app/transaction-history/transactions-history.css" type="text/css" />');
            this.$view = $('#TransactionsView');
            this.$view.load('js/app/transaction-history/transactions-history.html', function () {
                //console.warn(arguments);
                setTimeout(function () { return _this.init(); }, 50);
            });
            $.get('js/app/transaction-history/transaction-history-not-available.html').done(function (res) {
                _this.tx_history_not_avail_template = res;
            });
            $.get('js/app/transaction-history/empty-transaction-history.html').done(function (res) {
                _this.no_transactions_template = res;
            });
            $.get('js/app/transaction-history/transactions-history-row.html').done(function (res) {
                _this.template = res;
            });
        }
        TransactionsView.prototype.init = function () {
            var _this = this;
            this.$list = $('#TransactionsList');
            this.$header = $('#TransactionsHeader');
            this.$container = $('#TransactionsListContainer');
            this.initEvents();
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            jaxx.Registry.application$.on(jaxx.Registry.ON_BALANCE_RENDER, function () {
                _this.render();
            });
            jaxx.Registry.application$.on(jaxx.Registry.UI_CONFIRM_TRANSACTION_CLOSED, function () {
                _this.render();
            });
            jaxx.Registry.application$.on(jaxx.Registry.HIDE_INIT_WALLET, function () {
                _this.populateTransactionHistory();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_RESTORE_HISTORY_START, function () {
                // whenever it is initializing wallet clear previous coin/token's history
                _this.clear();
            });
            // to avoid unpredictable durations until the server registers the transaction the user just sent and it gets displayed in the TX history,
            // we temporarily store their sent transaction based on the data the Send Transaction controller submitted
            // and triggered through this ON_SEND_TRANSACTION event below
            jaxx.Registry.application$.on(jaxx.Registry.ON_SEND_TRANSACTION, function (ev, sent_tx) {
                // if the coin controller doesn't support TX history skip the whole temporary transaction process
                var transactionCoinController = jaxx.Registry.getCryptoControllerBySymbol(sent_tx.symbol);
                if (!transactionCoinController.supportsTransactionHistory()) {
                    return;
                }
                // Convert from VOSentTransaction to VOTransaction below:
                var transactionFormat;
                // VOSendTransactions are formatted differently for ETH and ERC20 tokens than for Bitcoin derived coins (ZEC, DASH, etc)
                // we handle both cases accordingly
                if (sent_tx.transactionsETH) {
                    var txDdata = sent_tx.transactionsETH[0];
                    transactionFormat = new VOTransaction({
                        txid: txDdata.txid,
                        id: txDdata.txid,
                        confirmations: 0,
                        timestamp: undefined,
                        address: txDdata.addressTo,
                        incoming: 0,
                        from: txDdata.addressFrom,
                        to: txDdata.addressTo,
                        value: sent_tx.amountInt,
                        miningFee: String(sent_tx.miningFeeDecimal),
                        symbol: sent_tx.symbol,
                    });
                }
                else {
                    transactionFormat = new VOTransaction({
                        txid: sent_tx.txid,
                        id: sent_tx.txid,
                        confirmations: 0,
                        timestamp: undefined,
                        address: sent_tx.addressTo,
                        incoming: 0,
                        from: sent_tx.inputs[0].address,
                        to: sent_tx.addressTo,
                        tos: sent_tx.outputs.map(function (output) {
                            return output.address;
                        }),
                        value: sent_tx.amountDecimalDisplay,
                        miningFee: String(sent_tx.miningFeeDecimal),
                        symbol: sent_tx.symbol,
                        values: sent_tx.outputs.map(function (output) { return jaxx.MATH.satoshiToBtc(output.amount); })
                    });
                }
                transactionFormat = _this.currentController.processTransactionForDisplay(transactionFormat);
                // register our temporary transaction
                _this.tempTxes.push(transactionFormat);
                // because this event might come after our TX history was already rendered
                // we order another render to ensure display in all situations
                setTimeout(function () {
                    _this.render();
                }, 500);
            });
            // Received from CoinControllerBase when too many unsuccessful attempts where made to download a newly sent transaction
            jaxx.Registry.application$.on(jaxx.Registry.ON_TRANSACTION_DROPPED, function (ev, dropped_txid) {
                _this.tempTxes.forEach(function (val, index) {
                    if (val.id == dropped_txid) {
                        _this.tempTxes.splice(index, 1);
                        _this.$list.remove('#' + dropped_txid);
                    }
                });
            });
        };
        /** Retrieves the transaction history from the current active controller, merges the list with temporary transactions (the temp txes are removed if they are present in the controller)
         * and calls the rendering functions to display the data in UI.
         */
        TransactionsView.prototype.populateTransactionHistory = function () {
            var _this = this;
            var ctr = jaxx.Registry.getCurrentCryptoController();
            if (!ctr) {
                console.warn(' no current controller ');
                return;
            }
            this.currentController = ctr;
            var obj = ctr.getTransactionsDisplay();
            // find and remove and temporary transactions that are also present in the saved transactions (the ones stored in localStorage)
            this.tempTxes = this.tempTxes.filter(function (tempTx) {
                return obj.transactions.filter(function (savedTx) { return savedTx.id == tempTx.id; }).length == 0;
            });
            // filter temp txes by coin symbol to make sure no TXes leak from other coins/wallets
            var filteredTempTxes = this.tempTxes.filter(function (tx) { return tx.symbol == _this.currentController.symbol; });
            // prepend all filtered temporary to the transaction list
            filteredTempTxes.forEach(function (txItem) {
                obj.transactions.unshift(txItem);
            });
            //obj.transactions = obj.transactions.concat(filteredTempTxes);
            this.displayTransactions(obj);
        };
        TransactionsView.prototype.render = function () {
            var isMobile = PlatformUtils.mobileCheck();
            var isExtension = PlatformUtils.extensionCheck();
            var transactionHeight;
            var transactionHistoryHeightMobileDeviation = 1.2;
            var isNotIPad = !(PlatformUtils.mobileIpadCheck());
            if ((isMobile || isExtension) && isNotIPad) {
                // Transaction History height is equal to the whole document minus the top menu portion
                // and then adjusted by 120% to  account for the view-port difference on mobile being set to ~80%
                transactionHeight = ($(document).height() - $('.landscapeLeft').height()) * transactionHistoryHeightMobileDeviation;
            }
            else {
                transactionHeight = "100%";
            }
            this.$view.height(transactionHeight);
            if (!jaxx.Registry.application.isWalletInitializing) {
                this.populateTransactionHistory();
            }
        };
        TransactionsView.prototype.reset = function () {
            this.$list.find('.selected').removeClass('selected');
            this.$list.find('.transactionDetails').show('fast');
        };
        TransactionsView.prototype.initEvents = function () {
            var _this = this;
            this.$list.on('click', '.cssTransactionHistoryRow', function (evt) {
                var el = $(evt.currentTarget);
                if (el.hasClass('selected')) {
                    el.removeClass('selected');
                }
                else {
                    el.addClass('selected');
                }
            });
            // Touch versus click glitch for hover CSS class
            this.$list.on('touchstart', '.cssTransactionHistoryRow', function (e) {
                $(e.currentTarget).find('.cssTransactionOverview').css('background-color', '#0D0D0D');
            });
            /**
             * Handles the click on the "copy" graphic inside the TX expanded view
             */
            this.$list.on('click', '.cssImageCopy', function (e) {
                var value_to_be_copied = e.target.getAttribute('data-jaxx-copy-value');
                var copySuccessful = false;
                if (window.native && window.native.copyToClipboard) {
                    try {
                        window.native.copyToClipboard(value_to_be_copied);
                        copySuccessful = true;
                    }
                    catch (e) {
                        copySuccessful = false;
                    }
                }
                else {
                    var temp_textarea = document.getElementById('clipboard'); // We have a global text area ready to use for copying
                    temp_textarea.value = value_to_be_copied;
                    temp_textarea.select();
                    copySuccessful = document.execCommand('copy');
                }
                if (copySuccessful) {
                    Navigation.flashBanner('Copied to clipboard', 2, 'success', { close: false });
                }
                else {
                    Navigation.flashBanner("Couldn't copy", 2, 'error', { close: false });
                }
            });
            //This is not being called when coin is switched in the navigation
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, ctr) {
                _this.currentSymbol = ctr.symbol;
                _this.currentController = ctr;
                // this.render();
                _this.$container.scrollTop(0);
            });
            // need to check where this is getting the value from
            jaxx.Registry.application$.on(jaxx.Registry.ON_TRANSACTIONS_CHANGED, function (evt, ctr) {
                var current = jaxx.Registry.getCurrentCryptoController();
                if (current && ctr.symbol === current.symbol)
                    _this.render();
            });
            jaxx.Registry.transactions$.on(jaxx.Registry.ON_TRANSACTIONS_CONFIRMATIONS, function (evt, data) {
                //  console.log(Registry.ON_TRANSACTIONS_CONFIRMATIONS, data);
                var current = jaxx.Registry.getCurrentCryptoController();
                if (data.symbol !== current.symbol)
                    return;
                _this.updateConfirmations(data.transactions);
            });
            jaxx.Registry.transactions$.on(jaxx.Registry.ON_TRANSACTION_INBLOCK, function (evt, data) {
                console.log(jaxx.Registry.ON_TRANSACTION_INBLOCK, data);
                var current = jaxx.Registry.getCurrentCryptoController();
                if (data.symbol !== current.symbol)
                    return;
                _this.updateConfirmations(data.transactions);
            });
        };
        TransactionsView.prototype.clear = function () {
            if (this.$list.html)
                this.$list.html('');
        };
        TransactionsView.prototype.updateConfirmations = function (transactions) {
            var _this = this;
            var max = this.currentController.config.trsConfirmations || 6;
            transactions.forEach(function (item) {
                var processedTx;
                var $tr = $('#' + item.id);
                // if we don't have these properties the TX is in raw format
                if (item.incoming === undefined || item.displayAddress === undefined) {
                    processedTx = _this.currentController.processTransactionForDisplay(item);
                }
                else {
                    processedTx = item;
                }
                var confirmations = '';
                if (isNaN(processedTx.confirmations) || processedTx.confirmations === null) {
                    confirmations = "0";
                }
                else if (processedTx.confirmations < max) {
                    confirmations = String(processedTx.confirmations);
                }
                else {
                    confirmations = "+" + max;
                }
                $tr.find('.confirmations').first().text(confirmations);
                var status;
                if (!processedTx.confirmations) {
                    status = 'Unconfirmed';
                }
                else if (!processedTx.incoming) {
                    status = "Sent To - " + processedTx.displayAddress;
                }
                else {
                    status = 'Confirmed';
                }
                $tr.find('.tr-status').first().text(status);
                $tr.find('.blockHeight').first().text('#' + processedTx.block);
                if (!(isNaN(processedTx.timestamp) || processedTx.timestamp === null)) {
                    $tr.find('.date').first().text(moment.unix(Number(processedTx.timestamp)).format('MMM DD YYYY'));
                    $tr.find('.time').first().text(moment.unix(Number(processedTx.timestamp)).format('hh:mm A'));
                }
            });
        };
        TransactionsView.externalLink = function (linkAddress, displayText) {
            var stringVersion;
            // if(!Registry.mobile && !Registry.chromeExtension && !Registry.desktop) {
            //     stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + displayText + "</a>";
            // } else if(Registry.chromeExtension) {
            //     stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + displayText + "</a>";
            // } else if(Registry.android || Registry.iPhone || Registry.desktop) {
            if (jaxx.Registry.chromeExtension) {
                stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + displayText + "</a>";
            }
            else {
                stringVersion = "<a href='#' onclick=\"Navigation.tryToOpenExternalLink('" + linkAddress + "')\">" + displayText + "</a>";
            }
            // } else {
            //     stringVersion = "<a href=\"" + linkAddress + "\" target=\"_blank\">" + displayText + "</a>";
            // }
            return stringVersion;
        };
        TransactionsView.formatRow = function (tr, template, symbol, maxConfirmations, blockexplorer_url) {
            var displayTime;
            var displayDate;
            var displayAddress;
            if (tr.timestamp) {
                var timestamp = moment.unix(Number(tr.timestamp));
                displayDate = timestamp.format('MMM DD YYYY');
                displayTime = timestamp.format('hh:mm A');
            }
            else {
                displayDate = 'Pending confirmation';
                displayTime = '';
            }
            var confirmations;
            var blockNo = '#';
            var url = blockexplorer_url.replace('{{txid}}', tr.id);
            var tx_blockexplorer_url = TransactionsView.externalLink(url, tr.displayTxid);
            var signPrefix = tr.incoming ? '+' : '-';
            if (+tr.displayValue === 0)
                signPrefix = '';
            var status;
            if (tr.block && tr.block != -1) {
                blockNo += String(tr.block);
            }
            else {
                blockNo = 'None';
            }
            if (!tr.confirmations) {
                status = 'Unconfirmed';
            }
            else if (!tr.incoming) {
                status = "Sent To - " + tr.displayAddress;
            }
            else {
                status = 'Confirmed';
            }
            if (isNaN(tr.confirmations) || tr.confirmations == null || tr.confirmations === undefined) {
                confirmations = "0";
            }
            else if (tr.confirmations < maxConfirmations) {
                confirmations = String(tr.confirmations);
            }
            else {
                confirmations = "+" + maxConfirmations;
            }
            return template.replace('{{addressTo}}', tr.displayAddress)
                .replace('{{date}}', displayDate)
                .replace('{{time}}', displayTime)
                .replace('{{amount}}', signPrefix + jaxx.MATH.stripTrailingZeroes(tr.displayValue) + ' ' + symbol)
                .replace('{{block}}', blockNo)
                .replace('{{status}}', status)
                .replace('{{confirmations}}', confirmations)
                .replace('{{displayAddress}}', tr.displayAddress)
                .replace('{{miningFee}}', tr.displayMiningFee)
                .replace('{{from_to}}', tr.incoming ? 'Received From' : 'Send To')
                .replace('{{address}}', tr.address)
                .replace('{{block_tx_url}}', tx_blockexplorer_url)
                .replace('{{txid}}', tr.id);
        };
        TransactionsView.prototype.displayTransactions = function (evt) {
            var symbol = evt.symbol;
            var ctr = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            var trs = evt.transactions;
            var blockexplorer_url = evt.blockexplorer_url;
            var trsConfirmations = evt.trsConfirmations || 6;
            var tpl = this.template;
            var html = '';
            if (ctr.supportsTransactionHistory() == false) {
                html = this.tx_history_not_avail_template;
            }
            else if (!!trs && trs.length) {
                trs.forEach(function (item) {
                    html += TransactionsView.formatRow(item, tpl, symbol, trsConfirmations, blockexplorer_url);
                });
            }
            else
                html = this.no_transactions_template;
            this.$list.html(html);
        };
        return TransactionsView;
    }());
    jaxx.TransactionsView = TransactionsView;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=transaction-history-view.js.map