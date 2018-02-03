var jaxx;
(function (jaxx) {
    var IntroPagesMain = (function () {
        function IntroPagesMain(js_instance) {
            this.js_instance = js_instance;
            this.init();
        }
        IntroPagesMain.prototype.init = function () {
            this.walletSettings = new jaxx.CoinsListSetup(this.js_instance);
        };
        return IntroPagesMain;
    }());
    jaxx.IntroPagesMain = IntroPagesMain;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=intro-pages-main.js.map