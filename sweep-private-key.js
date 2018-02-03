var jaxx;
(function (jaxx) {
    var SweepPrivateKey = (function () {
        /*
        * Dynamically adds the html to index.html with appropriate content and attaches click events (scriptAction) to
        * appropriate dom elements.
        * */
        function SweepPrivateKey() {
            var _this = this;
            this.$view = $('#sweepPrivateKey');
            this.$view.load('js/app/transfer-paper-wallet/sweep-private-key.html', null, function (res) {
                setTimeout(function () {
                    _this.attachClickEvents();
                    _this.$nextButton = _this.$view.find('.continueButton');
                    _this.$nextButton.on('click', function () {
                        _this.sendTransaction();
                    });
                }, 1000);
            });
        }
        /*
        * Attaches click event to scriptAction events for the dynamically added content.
        * @method attachClickEvents
        * */
        SweepPrivateKey.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        /*
        * Attaches click events for any dom elements with the script action tag that we added dynamically.
        * @method attachClickEventForScriptAction
        * */
        SweepPrivateKey.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        /*
        * Displays the coin value on screen and the next button
        * @method setAmount
        * */
        SweepPrivateKey.prototype.setAmount = function () {
            this.$view.find('.spinner').html('The Balance for this Private Key is ' + this.amount + ' ' + this.symbol);
            this.showNextButton();
        };
        /*
        * Sends the transaction to the mempool to be approved by the miners.  If the transaction fails it pops up a
        * banner notifying the user the transaction has failed.
        * @method sendTransaction*/
        SweepPrivateKey.prototype.sendTransaction = function () {
            this.hideNextButton();
            jaxx.Registry.getCryptoControllerBySymbol(this.symbol).sendTransaction(this.signedTransaction).done(function (res) {
                if (res.success === 'success') {
                    Navigation.flashBanner('Transaction sent', 2, 'success');
                }
                else {
                    Navigation.flashBanner('Transaction failed', 2);
                    console.error(res);
                }
            }).fail(function (err) {
                Navigation.flashBanner('Transaction failed', 2);
                console.error(err);
            });
        };
        /*
        * Displays the next button in the bottom right corner.
        * @method showNextButton
        * */
        SweepPrivateKey.prototype.showNextButton = function () {
            this.$nextButton.show();
        };
        /*
        * Hide the next button in the bottom right corner.
        * @method hideNextButton
        * */
        SweepPrivateKey.prototype.hideNextButton = function () {
            this.$nextButton.hide();
        };
        return SweepPrivateKey;
    }());
    jaxx.SweepPrivateKey = SweepPrivateKey;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=sweep-private-key.js.map