var jaxx;
(function (jaxx) {
    var CryptoToFiatButtonComponent = (function () {
        function CryptoToFiatButtonComponent() {
            var _this = this;
            this.isFiat = false;
            this.$view = $('#fiatToCrypto');
            this.$view.on('click', function (evt) {
                _this.onClick();
            });
            this.$symbol = this.$view.find('.symbol').first();
        }
        return CryptoToFiatButtonComponent;
    }());
    jaxx.CryptoToFiatButtonComponent = CryptoToFiatButtonComponent;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=send-transaction-fiat-controller.js.map