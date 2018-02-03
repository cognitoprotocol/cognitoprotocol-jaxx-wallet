/**
 * Created by Vlad on 2016-11-24.
 */
var jaxx;
(function (jaxx) {
    var TransactionsUpdater = (function () {
        function TransactionsUpdater(controller, service, config) {
            this.controller = controller;
            this.service = service;
            this.config = config;
            // name:string;
            this.ON_TRANSACTION_CONFIRM_CHANGES = 'ON_TRANSACTION_CONFIRM_CHANGES';
            this.ON_TRANSACTION_INBLOCK = 'ON_TRANSACTION_INBLOCK';
            this.emitter$ = $({});
            // this.name = config.symbol;
            this.updateTime = 30000;
        }
        TransactionsUpdater.prototype.activate = function () {
            var _this = this;
            this.log('Activated.');
            clearInterval(this.updateInterval);
            this.updateInterval = setInterval(function () { return _this.onTimer(); }, this.updateTime);
            this.onTimer();
        };
        /* setTimeout(fast:boolean):void{
                 let timeout = fast?this.options.updateTimeout*3;
             if(this.updateTime !== timeout){
                 this.updateTime = timeout;
                 this.activate();
             }
         }
 */
        TransactionsUpdater.prototype.deactivate = function () {
            this.log('Deactivated.');
            clearInterval(this.updateInterval);
        };
        TransactionsUpdater.prototype.checkUnconfirmed = function (trs) {
            var _this = this;
            this.log('Checking transactions that have not been mined yet.');
            var unconfirmed = trs.filter(function (item) {
                return !item.block;
            });
            if (unconfirmed.length == 0) {
                this.log('No un-mined transactions to check.');
                return false;
            }
            this.log('found ' + unconfirmed.length + ' un-mined TX(es) that need to be updated. Downloading TX details...');
            // this.log(unconfirmed);
            this.service.downloadTransactionsDetails(unconfirmed).done(function (results) {
                var haveChanges = false;
                var indexed = _.keyBy(results, 'id');
                unconfirmed.forEach(function (item) {
                    var nt = indexed[item.id];
                    if (!!nt && nt.block > 0) {
                        item.block = nt.block;
                        item.confirmations = nt.confirmations;
                        item.timestamp = nt.timestamp;
                        haveChanges = true;
                    }
                });
                if (haveChanges) {
                    _this.log('Updated ' + unconfirmed.length + ' TX(es) within the UI.');
                    _this.emitter$.triggerHandler(_this.ON_TRANSACTION_INBLOCK, { transactions: unconfirmed });
                    // this.log(unconfirmed);
                }
                else {
                    _this.log('No new data from the backend for ' + unconfirmed.length + ' un-mined TX(es).');
                }
            }).fail(function (err) {
                console.error(err);
            });
            return true;
        };
        TransactionsUpdater.prototype.updateBlocks = function (need) {
            var lastBlock = this.prevBlock;
            var haveChanges = 0;
            need.forEach(function (item) {
                if (!!item.block) {
                    var confirmations = (lastBlock - item.block) + 1;
                    if (item.confirmations !== confirmations) {
                        item.confirmations = confirmations;
                        haveChanges++;
                    }
                    ;
                }
            });
            if (haveChanges) {
                this.log('Found ' + this.config.symbol + ' confirmation updates for ' + need.length + ' TX(es). Updating UI.');
                //this.controller
                this.emitter$.triggerHandler(this.ON_TRANSACTION_CONFIRM_CHANGES, { transactions: need });
            }
            else
                this.log('No confirmations updates for ' + need.length + ' unconfirmed transaction(s).');
        };
        TransactionsUpdater.prototype.onTimer = function () {
            var _this = this;
            if (!this.controller.isActive) {
                this.deactivate();
                return;
            }
            this.log('Refreshing un-mined and un-confirmed transactions status...');
            var trs = this.controller._db.getTransactionsReceive();
            this.checkUnconfirmed(trs);
            var confirmations = this.config.trsConfirmations || 6;
            var need = trs.filter(function (item) {
                return (item.confirmations <= confirmations);
            });
            if (need.length === 0) {
                this.log('' + this.config.symbol + ' has no transactions with less than ' + confirmations + ' confirmations. Nothing to do.');
                //this.deactivate();
                return;
            }
            ;
            var cofs = need.map(function (item) {
                return item.confirmations;
            });
            //this.log(' ' + this.config.symbol + ' needs '+confirmations + ' confirmations => have:' + cofs.toString() + '  get Block', 'color:blue');
            this.service.lastBlock().done(function (lastBlock) {
                //this.log(need);
                if (lastBlock === 0) {
                    console.warn(' ' + _this.config.symbol + ' retrieved a blockheight of 0. Invalid height, skipping updates.');
                    return;
                }
                if (!_this.prevBlock) {
                    _this.prevBlock = lastBlock;
                    _this.updateBlocks(need);
                    return;
                }
                // this.log('prevBlock:'+ this.prevBlock +'  lastBlock: '+ lastBlock);
                if (_this.prevBlock === lastBlock) {
                    _this.log('' + _this.config.symbol + ' last mined block is still the same: ' + lastBlock);
                    return;
                }
                else
                    _this.log('new mined block detected ' + lastBlock + '. Checking which TX confirmations to update in UI.');
                _this.prevBlock = lastBlock;
                _this.updateBlocks(need);
            }).fail(function (err) {
                _this.log('Failed to update last mined block. Error: ' + JSON.stringify(err));
                _this.controller.onError(err);
            });
        };
        TransactionsUpdater.prototype.log = function (msg) {
            msg = new Date().toLocaleString() + " TransactionUpdater [" + this.controller.symbol + "]: %c " + msg;
            console.log(msg, 'color: darkblue');
        };
        return TransactionsUpdater;
    }());
    jaxx.TransactionsUpdater = TransactionsUpdater;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=transactions_updater.js.map