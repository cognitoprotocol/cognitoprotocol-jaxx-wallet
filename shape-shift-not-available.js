var jaxx;
(function (jaxx) {
    var ShapeShiftNotAvailable = (function () {
        function ShapeShiftNotAvailable() {
            var _this = this;
            this.$view = $('#shapeshiftNotAvailable');
            this.$view.load('js/app/shape-shift/not-available.html', function () {
                _this.init();
            });
        }
        ShapeShiftNotAvailable.prototype.init = function () {
            var _this = this;
            this.$buttonUnderstand = this.$view.find('#shapeshiftNAUnderstand');
            this.$buttonClose = this.$view.find('.cssClose');
            this.$buttonUnderstand.on('click', function () {
                _this.hide();
            });
            this.$buttonClose.on('click', function () {
                _this.hide();
            });
        };
        ShapeShiftNotAvailable.prototype.hide = function () {
            this.$view.addClass('hideNotificationFooter');
        };
        ShapeShiftNotAvailable.prototype.show = function (callback) {
            var height;
            var isMobile = PlatformUtils.mobileCheck();
            var isExtension = PlatformUtils.extensionCheck();
            var isNotIPad = !(PlatformUtils.mobileIpadCheck());
            if ((isMobile || isExtension) && isNotIPad) {
                // Transaction History height is equal to the whole document minus the top menu portion
                height = ($(document).height() - $('#TransactionsHeader').offset().top);
            }
            else {
                height = "100%";
            }
            this.$view.find('.cssNotificationFooter').height(height);
            if (!isNotIPad) {
                this.$view.find('.cssNotificationFooter').width('50%');
                this.$view.find('.cssNotificationFooter').css('left', '50%');
            }
            this.$view.find('.coinName').text(jaxx.Registry.getCurrentCryptoController().displayName);
            this.$view.find('.coinSymbol').text(jaxx.Registry.getCurrentCryptoController().symbol);
            this.$view.removeClass('hideNotificationFooter');
            if (callback) {
                callback();
            }
        };
        return ShapeShiftNotAvailable;
    }());
    jaxx.ShapeShiftNotAvailable = ShapeShiftNotAvailable;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=shape-shift-not-available.js.map