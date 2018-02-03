var jaxx;
(function (jaxx) {
    var PrivateKeyList = (function () {
        function PrivateKeyList() {
            var _this = this;
            PrivateKeyList.instance = this;
            this.$view = $('.dynamicPrivateKeyDisplay');
            $.get('js/app/private-key-list/private-key-list.html', '', function (res) {
                _this.stringViewTemplate = res;
            });
            $.get('js/app/private-key-list/private-key-list-item.html', '', function (res) {
                _this.privateKeyItemTemplate = res;
            });
        }
        PrivateKeyList.prototype.init = function () {
            var _this = this;
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            this.$list = this.$view.find('.cssWrapperPrivateKeys .cssKeysPrice');
            this.$backButton = this.$view.find('.imageReturn.cssImageReturn');
            this.$exportButton = this.$view.find('.cssBtnIntroRight');
            this.$backButton.on('click', function () {
                Navigation.popSettings();
            });
            this.$closeButton = this.$view.find('.cssClose');
            this.$closeButton.on('click', function () {
                Navigation.clearSettings();
                jaxx.Registry.jaxxUI.closeMainMenu();
            });
            this.$exportButton.on('click', function () {
                _this.exportPrivateKeys();
            });
            this.addInfoButtonListeners();
        };
        PrivateKeyList.prototype.displayPrivateKeys = function (privateKeys, symbol) {
            // this.addScroll();
            // this.$view.empty();
            // this.$view.append(this.stringViewTemplate);
            var _this = this;
            this.init();
            this.clearPrivateKeyList();
            var html = '';
            this.generateExportPrivateKeys(privateKeys);
            privateKeys.forEach(function (item) {
                html += PrivateKeyList.listItemFormatter(item, _this.privateKeyItemTemplate, symbol);
            });
            this.$list.html(html);
            $('.cssWrapperPrivateKeys').each(function (index, element) {
                $(element).show();
            });
            this.hideLoadingMessage();
        };
        PrivateKeyList.prototype.addInfoButtonListeners = function () {
            var _this = this;
            var infoItem = this.$view.find('.toggler');
            $.each(infoItem, function (index, element) {
                var i = ($(element).closest('.cssInitialHeight.cssExpandableText')).find('.triangleArrow.cssTriangleArrow');
                var infoButton = $(element);
                i.on('click', function () {
                    _this.toggleInfoItem(infoButton, i);
                });
            });
        };
        PrivateKeyList.prototype.hideLoadingMessage = function () {
            var loadingMessage = this.$view.find('.textDisplayMessageForPrivateKeys.cssTextDisplayMessageForPrivateKeys');
            loadingMessage.hide();
        };
        PrivateKeyList.prototype.toggleInfoItem = function (infoText, infoItem) {
            if (infoText.hasClass('hide')) {
                infoText.removeClass('hide');
                infoText.animate({ maxHeight: 120 }, 500);
                infoItem.addClass('cssFlipped');
            }
            else {
                setTimeout(function () {
                    infoText.addClass('hide');
                }, 500);
                infoText.animate({ maxHeight: 0 }, 500);
                infoItem.removeClass('cssFlipped');
            }
        };
        PrivateKeyList.prototype.generateExportPrivateKeys = function (privateKeys) {
            var privateAddress = _.map(privateKeys, function (privateKey) {
                return privateKey.address + ",\n" + privateKey.privateKey;
            });
            var stringExportPrivateKeys = "addresss,privatekey,\n";
            stringExportPrivateKeys += privateAddress.join(",\n\n");
            jaxx.ExportPrivateKeysViewController.instance.setPrivateKeys(stringExportPrivateKeys);
        };
        PrivateKeyList.prototype.isDifferentWallet = function (symbol) {
            var oldSymbol = this.$view.find('.imgTransactionBrand').data('symbol');
            if (oldSymbol !== symbol) {
                return true;
            }
            else {
                return false;
            }
        };
        PrivateKeyList.prototype.clear = function () {
            this.$view.empty();
        };
        PrivateKeyList.prototype.show = function () {
            var parentHTML = '';
            parentHTML += PrivateKeyList.viewFormatter(this.stringViewTemplate, this.strCoinName);
            this.$view.html(parentHTML);
        };
        PrivateKeyList.prototype.clearPrivateKeyList = function () {
            this.$view.find('.accountDataTableBitcoin.cssKeysPrice').empty();
        };
        PrivateKeyList.viewFormatter = function (template, coinName) {
            // let strHTML = '';
            // strHTML += this.stringViewTemplate;
            return template.replace('{{headerCoinName}}', coinName)
                .replace('{{optionCoinName}}', coinName)
                .replace('{{toggleCoinName}}', coinName);
            // this.$view.html(strHTML);
        };
        PrivateKeyList.listItemFormatter = function (privateKey, template, symbol) {
            var icon;
            var threeLetterCode = jaxx.Registry.getCryptoControllerBySymbol(symbol).threeLetterCode;
            icon = '<div class="imgTransactionBrand img' + threeLetterCode + '" data-symbol="' + symbol + '"></div>';
            return template.replace('{{amount}}', privateKey.balance)
                .replace('{{publicKey}}', privateKey.address)
                .replace('{{privateKey}}', privateKey.privateKey)
                .replace('{{symbol}}', symbol)
                .replace('{{icon}}', icon);
        };
        PrivateKeyList.prototype.exportPrivateKeys = function () {
            jaxx.ExportPrivateKeysViewController.instance.stringCoinName = this.strCoinName;
            jaxx.ExportPrivateKeysViewController.instance.hide();
            Navigation.pushSettings('exportPrivateKeysDynamically');
            jaxx.ExportPrivateKeysViewController.instance.show();
        };
        return PrivateKeyList;
    }());
    jaxx.PrivateKeyList = PrivateKeyList;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=private-key-list.js.map