/**
 * Created by Vlad on 10/11/2016.
 */
var jaxx;
(function (jaxx) {
    var JaxxDeveloper = (function () {
        function JaxxDeveloper() {
            this.$view = $('#JaxxLogo');
            $('<div>').attr('id', 'RestoreHistoryBtn').text('Restore').appendTo('#RefreshContainer')
                .on('click', function () {
                jaxx.Registry.current_crypto_controller.restoreHistory(null);
            });
        }
        return JaxxDeveloper;
    }());
    jaxx.JaxxDeveloper = JaxxDeveloper;
    var AddressView = (function () {
        function AddressView() {
            this.$view = $('#AddressView');
            this.$address = $('#AddressView-address');
            this.$displayName = $('#CoinDisplayName');
            this.$qrcode = $('.populateQRCode');
            this.$copyBtn = $('#CopyToClipboardBtn');
            this.$qrCodeModal = $('.modal.full');
            this.init();
        }
        AddressView.prototype.setCurrentAddress = function () {
            var address;
            var ctr = jaxx.Registry.getCurrentCryptoController();
            if (!ctr)
                address = null;
            else
                address = ctr.getCurrentAddress();
            address = address || '--------';
            this.currentAddress = address;
            this.$address.text(address);
            this.populateQRCode(address);
        };
        AddressView.prototype.setCurrentDisplayName = function () {
            var controller = jaxx.Registry.getCurrentCryptoController();
            var name = controller.config.name;
            var text = controller.config.HD ? 'Your Current ' + name + ' Address:' : 'Your ' + name + ' Address:';
            this.$displayName.text(text);
        };
        AddressView.prototype.setDisplayNameFromSymbol = function (coinSymbol) {
            var controller = jaxx.Registry.getCryptoControllerBySymbol(coinSymbol);
            var name = controller.config.name;
            var text = controller.config.HD ? 'Your Current ' + name + ' Address:' : 'Your ' + name + ' Address:';
            this.$displayName.text(text);
        };
        AddressView.prototype.init = function () {
            var _this = this;
            var self = this;
            this.$qrCodeModal.find('.imageCopy').on('click', function () {
                jaxx.Utils.copyClipboard(_this.currentAddress);
            });
            this.$qrcode.on('click', function () {
                console.log(' qrcode click');
                Navigation.closeModal();
                $('.modal #modal-wallet-name').text(jaxx.Registry.getCurrentCryptoController().displayName);
                $('.modal .populateAddress.cssAddress').text(_this.currentAddress);
                Navigation.openModal('full');
                $('.modal.visible').hide(); // replaces closeModal();
                _this.$qrCodeModal.css({ opacity: 0 }).show().animate({ opacity: 1 }).addClass('visible');
                _this.$qrCodeModal.click(function (e) {
                    if ($(e.target).hasClass('modal')) {
                        _this.closeModal();
                    }
                });
            });
            this.$copyBtn.on('click', function () {
                var address = _this.currentAddress;
                jaxx.Utils.copyClipboard(address);
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, ctr) {
                _this.setCurrentAddress();
                _this.setCurrentDisplayName();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_ADDRESS_CHANGED, function (evt, ctr) {
                var current = jaxx.Registry.getCurrentCryptoController();
                if (!current || current.symbol !== ctr.symbol)
                    return;
                _this.setCurrentAddress();
            });
        };
        AddressView.prototype.populateQRCode = function (address) {
            var qrCode = jaxx.Utils.generateQRCode(address, true);
            this.$qrcode.attr('src', qrCode);
            var modal = $('.modal.full');
            modal.find('.imageCopy').on('click', function () {
                jaxx.Utils.copyClipboard(address);
            });
        };
        AddressView.prototype.closeModal = function () {
            Navigation.closeModal();
        };
        return AddressView;
    }());
    jaxx.AddressView = AddressView;
    var SpinningCoinOverlay = (function () {
        function SpinningCoinOverlay() {
        }
        return SpinningCoinOverlay;
    }());
    jaxx.SpinningCoinOverlay = SpinningCoinOverlay;
    var Spinner = (function () {
        function Spinner() {
            this.transitions_out = {
                '#ReceiveTabBtn': 'slideOutLeft',
                '#SendTabBtn': 'slideOutRight',
                '.mainAddressBox': 'zoomOut',
                '.mainBalanceBox': 'slideOutLeft',
                '#QRContainer': 'slideOutRight',
                '.landscapeQRSeperator': 'fadeOut',
                '#TransactionsHeader': 'fadeOutDown',
                '#TransactionsListViewport': 'fadeOut',
                '.balanceBoxSeperator': 'fadeOut',
                '.shapeshiftTab': 'fadeOut',
                '.cssRefresh': 'fadeOut',
                '.cssRefreshContainer': 'fadeOut'
            };
            this.transitions_in = {
                '#ReceiveTabBtn': 'slideInLeft',
                '#SendTabBtn': 'slideInRight',
                '.mainAddressBox': 'zoomIn',
                '.mainBalanceBox': 'slideInLeft',
                '#QRContainer': 'slideInRight',
                '.landscapeQRSeperator': 'fadeIn',
                '#TransactionsListViewport': 'fadeIn',
                '#TransactionsHeader': 'fadeInUp',
                '.balanceBoxSeperator': 'fadeIn',
                '.shapeshiftTab': 'fadeIn',
                '.cssRefresh': 'fadeIn',
                '.cssRefreshContainer': 'fadeIn'
            };
            this.$view = $('#SpinnerContainer');
            this.$view.html('<div id="SpinningImageHolder" class=".cssCoinSpinningGreyFilter wow animated spinning" data-wow-duration="0.5s" style="opacity: 0; display: none;"></div>');
            this.$container = $('#SpinningImageHolder');
            this.animationEndEvent = this.checkBrowser();
            this.$shapeShiftIcon = $('#ShapeSiftFoxBtn');
        }
        Spinner.prototype.checkBrowser = function () {
            var eventName, fakeEl = document.createElement('fakeelement');
            var ANIMATION_END_EVENT_NAMES = {
                'animation': 'animationend',
                '-o-animation': 'oAnimationEnd',
                '-moz-animation': 'animationend',
                '-webkit-animation': 'webkitAnimationEnd'
            };
            for (eventName in ANIMATION_END_EVENT_NAMES) {
                if (typeof (fakeEl.style[eventName]) !== 'undefined') {
                    return ANIMATION_END_EVENT_NAMES[eventName];
                }
            }
            return null;
        };
        Spinner.prototype.newController = function (ctr, callback) {
        };
        Spinner.prototype.showShapeShiftSpinnerBySymbol = function (symbol) {
            var _this = this;
            var cfg = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            var image = cfg.icon;
            var addressView = $('#AddressView');
            this.resetTop = this.$container.css('top');
            this.resetHeight = this.$container.css('height');
            var topPosition = (addressView.offset()).top + "px";
            var calculatedHeight = $(document).height() - (addressView.offset()).top;
            // On mobile when the main section animates out we place a spinning symbol of the newly selected
            // coin in the main balance display section centered to that area which is responsive to the screen size
            this.$container.css({
                'background-image': "url('" + image + "')",
                'width': '50%',
                'height': calculatedHeight,
                'left': '25%',
                'top': topPosition,
                '-webkit-filter': 'grayscale(100%)',
                '-moz-filter': 'grayscale(100%)',
                '-o-filter': 'grayscale(100%)',
                'filter': 'grayscale(100%)',
                'transition': 'opacity 1.5s',
                'display': 'initial',
                'opacity': '0'
            });
            // On desktop and iPad where the width is much larger, we adjust the height to be almost twice
            // as large and adjust the left/top position to keep it centered in the landscape view of Jaxx
            if ($(document).width() > 1000) {
                topPosition = (addressView.offset()).top + 15 + "px";
                this.$container.css({
                    'width': '50%',
                    'height': calculatedHeight * 0.9,
                    'left': '0',
                    'top': topPosition
                });
            }
            this.animateOutAllWalletElements(function () {
                _this.$container.css({
                    'z-index': '1100',
                    'opacity': '0.4',
                });
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE_ANIMATION_END);
            });
        };
        Spinner.prototype.showSpinnerBySymbol = function (symbol) {
            var _this = this;
            var cfg = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            var image = cfg.icon;
            this.$container.css({
                'background-image': "url('" + image + "')",
                'width': '50%',
                'height': this.resetHeight,
                'left': '25%',
                'top': this.resetTop,
                '-webkit-filter': 'grayscale(100%)',
                '-moz-filter': 'grayscale(100%)',
                '-o-filter': 'grayscale(100%)',
                'filter': 'grayscale(100%)',
                'transition': 'opacity 1.5s',
                'display': 'initial',
                'opacity': '0'
            });
            this.animateOutAllWalletElements(function () {
                _this.$container.css({
                    'z-index': '1100',
                    'opacity': '0.4'
                });
                jaxx.Registry.application$.triggerHandler(jaxx.Registry.ON_UI_INTERWALLET_ANIMATION_END);
                console.log('%c ' + jaxx.Registry.ON_UI_INTERWALLET_ANIMATION_END, 'color:lime');
            });
        };
        Spinner.prototype.animateInAllWalletElements = function (onDone) {
            var _this = this;
            // for every object activated for animation
            // we add a reference to it in this array
            // then for each "animationend" event we cross that element form the array
            // when the array is empty, it means all items finished animating
            // at that point we call onDone
            var eventName = this.animationEndEvent;
            var objects_to_animate = [];
            var done_callback_invoked = false;
            function onElementAnimationEnd(e) {
                var dom_elm = e.currentTarget;
                var dom_elm_index = objects_to_animate.indexOf(dom_elm);
                if (dom_elm_index > -1) {
                    objects_to_animate.splice(dom_elm_index, 1);
                    dom_elm.removeEventListener(eventName, onElementAnimationEnd);
                }
                if (objects_to_animate.length <= 1) {
                    if (!done_callback_invoked) {
                        if (onDone) {
                            onDone();
                        }
                        done_callback_invoked = true;
                    }
                }
            }
            if ($(document).width() > 1000) {
                $('#landscapeQRCode').css('opacity', '1');
                $('#TransactionsView').css({
                    'border-top': 'solid 1px #444444',
                    'border-left': 'solid 1px #444444'
                });
            }
            Object.keys(this.transitions_in).forEach(function (cssSelector) {
                var $current_element = $(cssSelector);
                var dom_elm = $current_element.get(0);
                $current_element.removeClass(_this.transitions_out[cssSelector]);
                $current_element.addClass(_this.transitions_in[cssSelector]);
                _this.$shapeShiftIcon.css("opacity", "1");
                objects_to_animate.push(dom_elm);
                if (eventName)
                    dom_elm.addEventListener(eventName, onElementAnimationEnd);
                else
                    setTimeout(function () { return onElementAnimationEnd({ currentTarget: dom_elm }); }, 500);
            });
        };
        Spinner.prototype.animateOutAllWalletElements = function (onDone) {
            var _this = this;
            // for every object activated for animation
            // we add a reference to it in this array
            // then for each "animationend" event we cross that element form the array
            // when the array is empty, it means all items finished animating
            // at that point we call onDone
            var eventName = this.animationEndEvent;
            var objects_to_animate = [];
            var done_callback_invoked = false;
            function onElementAnimationEnd(e) {
                var dom_elm = e.currentTarget;
                var dom_elm_index = objects_to_animate.indexOf(dom_elm);
                if (dom_elm_index > -1) {
                    objects_to_animate.splice(dom_elm_index, 1);
                    dom_elm.removeEventListener(eventName, onElementAnimationEnd);
                }
                if (objects_to_animate.length <= 5) {
                    if (!done_callback_invoked) {
                        onDone();
                        done_callback_invoked = true;
                    }
                }
            }
            if ($(document).width() > 1000) {
                $('#landscapeQRCode').css('opacity', '0');
                $('#TransactionsView').css({
                    'border-top': 'none',
                    'border-left': 'none'
                });
            }
            Object.keys(this.transitions_out).forEach(function (cssSelector) {
                var $current_element = $(cssSelector);
                var dom_elm = $current_element.get(0);
                $current_element.removeClass(_this.transitions_in[cssSelector]);
                $current_element.addClass(_this.transitions_out[cssSelector]);
                _this.$shapeShiftIcon.css("opacity", "0");
                if (dom_elm) {
                    objects_to_animate.push(dom_elm);
                    if (eventName)
                        dom_elm.addEventListener(eventName, onElementAnimationEnd);
                    else
                        setTimeout(function () { return onElementAnimationEnd({ currentTarget: dom_elm }); }, 500);
                }
            });
        };
        Spinner.prototype.showSpinner = function (targetCoinType) {
            var id = targetCoinType;
            $(id).fadeTo(100, 1);
            $(id).css('z-index', '1100');
        };
        Spinner.prototype.hideSpinner = function (onDone) {
            var _this = this;
            this.$container.css('opacity', '0');
            setTimeout(function () {
                _this.$container.css('display', 'none');
                onDone();
            }, 550);
        };
        return Spinner;
    }());
    jaxx.Spinner = Spinner;
    var CurrentAddressController = (function () {
        function CurrentAddressController() {
        }
        return CurrentAddressController;
    }());
    jaxx.CurrentAddressController = CurrentAddressController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=view-main-page.js.map