var jaxx;
(function (jaxx) {
    var DisplayPairingCodeController = (function () {
        function DisplayPairingCodeController() {
            var _this = this;
            DisplayPairingCodeController.instance = this;
            this.$view = $('.settings.viewJaxxToken.cssSettings.cssShowMnemonic');
            this.$view.load('js/app/display-pairing-code/display-pairing-code.html', "", function () {
                setTimeout(function () {
                    _this.init();
                }, 1000);
            });
        }
        DisplayPairingCodeController.prototype.init = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            this.attachClickEvents();
        };
        DisplayPairingCodeController.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        DisplayPairingCodeController.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        return DisplayPairingCodeController;
    }());
    jaxx.DisplayPairingCodeController = DisplayPairingCodeController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=display-pairing-code-controller.js.map