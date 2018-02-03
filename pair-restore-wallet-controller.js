var jaxx;
(function (jaxx) {
    var PairRestoreWalletController = (function () {
        function PairRestoreWalletController() {
            var _this = this;
            PairRestoreWalletController.instance = this;
            this.$view = $('#PairRestoreWallet');
            this.$view.load('js/app/pair-restore-wallet/pair-restore-wallet.html', "", function () {
                setTimeout(function () {
                    _this.init();
                }, 1000);
            });
        }
        PairRestoreWalletController.prototype.init = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            this.attachClickEvents();
        };
        PairRestoreWalletController.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        PairRestoreWalletController.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        return PairRestoreWalletController;
    }());
    jaxx.PairRestoreWalletController = PairRestoreWalletController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=pair-restore-wallet-controller.js.map