var jaxx;
(function (jaxx) {
    var TransferPaperWalletWarning = (function () {
        /*
        * Dynamically adds the html to index.html with appropriate content and attaches click events (scriptAction) to
        * appropriate dom elements.
        * */
        function TransferPaperWalletWarning() {
            var _this = this;
            this.$view = $('#transferWalletWarning');
            this.$view.load('js/app/transfer-paper-wallet/transfer-paper-wallet-warning.html', null, function (res) {
                setTimeout(function () {
                    _this.attachClickEvents();
                }, 1000);
            });
        }
        /*
        * Attaches click event to scriptAction events for the dynamically added content.
        * @method attachClickEvents
        * */
        TransferPaperWalletWarning.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        /*
        * Attaches click events for any dom elements with the script action tag that we added dynamically.
        * @method attachClickEventForScriptAction
        * */
        TransferPaperWalletWarning.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        return TransferPaperWalletWarning;
    }());
    jaxx.TransferPaperWalletWarning = TransferPaperWalletWarning;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=transfer-paper-wallet-warning.js.map