var jaxx;
(function (jaxx) {
    var TransferPaperWalletMenu = (function () {
        /*
        * Dynamically adds the html to index.html with appropriate content and attaches click events (scriptAction) to
        * appropriate dom elements.
        * */
        function TransferPaperWalletMenu() {
            var _this = this;
            this.$view = $('#paperWalletList').first();
            this.$view.load('js/app/transfer-paper-wallet/paper-wallet-menu.html', null, function (res) {
                setTimeout(function () {
                    _this.addPaperWallets();
                }, 1000);
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_SATUS_CHANGED, function (evt, name, lbl) {
                _this.reset();
            });
        }
        /*
        * Clears out the template.
        * @method clearPaperWallet
        * */
        TransferPaperWalletMenu.prototype.clearPaperWallet = function () {
            this.$view.find('.cssScrollableMenuList').empty();
        };
        /*
        * Resets the paper wallet menu view
        * @method reset
        * */
        TransferPaperWalletMenu.prototype.reset = function () {
            var _this = this;
            setTimeout(function () {
                _this.clearPaperWallet();
                _this.addPaperWallets();
            }, 100);
        };
        /*
        * Attaches click event to scriptAction events for the dynamically added content.
        * @method attachClickEvents
        * */
        TransferPaperWalletMenu.prototype.attachClickEvents = function () {
            var elements = this.$view.find(".scriptAction").not(".scrollHeaderContainer .rightArrow").not(".scrollHeaderContainer .leftArrow"); // Exclude carousel arrows
            this.attachClickEventForScriptAction(elements);
        };
        /*
        * Attaches click events for any dom elements with the script action tag that we added dynamically.
        * @method attachClickEventForScriptAction
        * */
        TransferPaperWalletMenu.prototype.attachClickEventForScriptAction = function (jquerySelector) {
            $(jquerySelector).off('click');
            $(jquerySelector).click(function (event) {
                scriptAction(event);
            });
        };
        /*
        * Template for list item component.  These items are clickable and allows the user to navigate to proceeding
        * window to enter their private key.
        * @method getHtmlForPaperWalletItem
        * @param {String} symbolName
        * @return {String} a string with html formatted content.*/
        TransferPaperWalletMenu.prototype.getHtmlForPaperWalletItem = function (symbolName) {
            var expandedHeight = "\'[[355, \"120px\"], [2000, \"100px\"]]\'";
            var html = '<div class="settingsResetCache expandableText cssExpandableText scriptAction cssOpacity expandableDetailsAncestor cssInitialHeight" pushSettings="paperWarning" specialAction="jaxx_ui.preparePaperWarning" value="' + symbolName + '">'
                + '<div class="expandableDetailsHeader cssExpandableDetailsHeader">'
                + '<div class="triangleArrow cssTriangleArrow scriptAction stopPropagation" specialAction="jaxx_ui.toggleNearbyExpandableDetails"></div>'
                + '<div class="optionTrigger cssOptionTrigger">'
                + '<div class="optionHeading cssOptionHeading">'
                + '<label>' + 'Transfer ' + symbolName + ' Paper Wallet' + '</label>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '<div class="cssExpandableDetailsElement expandableDetailsElement" expandedheight=' + expandedHeight + '>'
                + '<div class="toggler cssToggler">'
                + '<p class="cssIntroScreenHeading"> Click this option to import your paper wallet / private key. </p>'
                + '</div>'
                + '</div>'
                + '</div>';
            return html;
        };
        /*
        * Filter out wallets that do not have paper wallets enabled.  Add the paper wallet items to the view.
        * @method addPaperWallets
        * */
        TransferPaperWalletMenu.prototype.addPaperWallets = function () {
            var _this = this;
            var wallets = jaxx.Registry.getWalletsEnabledSorted();
            wallets.forEach(function (wallet) {
                if (wallet.config.paperwallet && wallet.paperwallet.regular) {
                    _this.$view.find('.cssScrollableMenuList').append(_this.getHtmlForPaperWalletItem(wallet.symbol));
                }
            });
            this.attachClickEvents();
        };
        return TransferPaperWalletMenu;
    }());
    jaxx.TransferPaperWalletMenu = TransferPaperWalletMenu;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=transfer-paper-wallet-menu.js.map