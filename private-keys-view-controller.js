var jaxx;
(function (jaxx) {
    var PrivateKeysViewController = (function () {
        function PrivateKeysViewController() {
            var _this = this;
            PrivateKeysViewController.instance = this;
            this.$view = $('.backupPrivateKeys');
            this.$view.load('js/app/private-keys/private-keys.html', "", function () {
                _this.init();
            });
        }
        PrivateKeysViewController.prototype.init = function () {
            var _this = this;
            // console.warn('Private Keys window has initialized!');
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            $.get('js/app/private-keys/private-keys-list-item.html', '', function (res) {
                _this.privateKeysListItemTemplate = res;
            });
            this.$list = this.$view.find('.cssScrollableMenuListWrapper .privateKeyMenuList');
            this.$backButton = this.$view.find('.imageReturn.cssImageReturn');
            this.$backButton.on('click', function () {
                Navigation.popSettings();
            });
            this.$closeButton = this.$view.find('.cssClose');
            this.$closeButton.on('click', function () {
                Navigation.clearSettings();
                jaxx.Registry.jaxxUI.closeMainMenu();
            });
            this.addScroll();
        };
        PrivateKeysViewController.prototype.addScroll = function () {
            this.$view.find('.cssScrollableMenuListWrapper').height($(window).height() - 51);
        };
        PrivateKeysViewController.prototype.displayPrivateKeys = function () {
            var _this = this;
            this.clearPrivateKeysList();
            var coinController = jaxx.Registry.getAllSelectedPrivateKeyCryptoCrontrollers();
            var html = '';
            coinController.forEach(function (item) {
                html += PrivateKeysViewController.formatter(item.displayName, item.symbol, _this.privateKeysListItemTemplate);
                // if(item.displayPrivateKey)  g_JaxxApp.getUI().addCoinToPrivateKeyListIfMissing(item.symbol, item.displayName);
            });
            this.$list.html(html);
            this.displayPrivateKeysListItemClick();
            this.addInfoButtonListeners();
        };
        PrivateKeysViewController.prototype.displayPrivateKeysListItemClick = function () {
            var _this = this;
            this.$view.find('.optionTrigger.cssOptionTrigger').each(function (index, element) {
                element.addEventListener('click', function () {
                    // console.warn($(element).attr('data-symbol'));
                    // let coinType:string = $(element).attr('data-symbol');
                    var target = $(element).closest('.cssInitialHeight.cssExpandableText');
                    var symbol = target.data('symbol');
                    var displayName = target.data('displayname');
                    jaxx.PrivateKeyList.instance.strCoinName = displayName;
                    // let pageDisplayPrivateKeysName =  'backupPrivateKeys'; //HDWalletPouch.getStaticCoinPouchImplementation(coinType).uiComponents.pageDisplayPrivateKeysName;
                    // wallet.getPouchFold(coinType).getDataStorageController().activate();
                    $('.backupPrivateKeys .textDisplayMessageForPrivateKeys').show();
                    // $('.cssPrivateKeyViewportBox').show();
                    jaxx.PrivateKeyList.instance.clear();
                    jaxx.PrivateKeyList.instance.show();
                    Navigation.pushSettings('dynamicPrivateKeyDisplay', function () {
                        _this.setupBackupPrivateKeys(symbol);
                    });
                    // this.viewFormatter(this.$view, displayName);
                });
            });
        };
        PrivateKeysViewController.prototype.addInfoButtonListeners = function () {
            var _this = this;
            var infoItem = this.$list.find('.toggler');
            $.each(infoItem, function (index, element) {
                var i = ($(element).closest('.cssInitialHeight.cssExpandableText')).find('.triangleArrow.cssTriangleArrow');
                var infoButton = $(element);
                i.on('click', function () {
                    _this.toggleInfoItem(infoButton, i);
                });
            });
        };
        PrivateKeysViewController.prototype.setupBackupPrivateKeys = function (symbol) {
            var ctr = jaxx.Registry.getCryptoControllerBySymbol(symbol);
            ctr.getPrivateKeys().done(function (result) {
                jaxx.PrivateKeyList.instance.displayPrivateKeys(result, symbol);
            });
            // g_JaxxApp.getUI().updateAndLoadPrivateKeyList(symbol);
        };
        PrivateKeysViewController.formatter = function (displayName, symbol, template) {
            // let icon: string;
            // icon='<div class="imgTransactionBrand img'+ symbol +'" data-symbol="'+symbol+'"></div>';
            return template.replace('{{displayName}}', displayName)
                .replace('{{displaySymbol}}', symbol)
                .replace('{{walletName}}', displayName)
                .replace('{{walletNameHidden}}', displayName);
        };
        PrivateKeysViewController.prototype.clearPrivateKeysList = function () {
            this.$view.find('.cssScrollableMenuListWrapper .privateKeyMenuList').empty();
        };
        PrivateKeysViewController.prototype.toggleInfoItem = function (infoText, infoItem) {
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
        return PrivateKeysViewController;
    }());
    jaxx.PrivateKeysViewController = PrivateKeysViewController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=private-keys-view-controller.js.map