var jaxx;
(function (jaxx) {
    var ModalViewController = (function () {
        function ModalViewController() {
            var _this = this;
            var isWalletBeingCreated = false;
            var showAllBulletin = true;
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function (evt, ctr) {
                if (!isWalletBeingCreated) {
                    _this.showCoinBulletin(ctr.symbol);
                    if (showAllBulletin) {
                        // If the "Don't Show This Bulletin Again" option is clicked, on close, for one coin bulletin;
                        // it should never show the generic bulletin again for other coins
                        _this.showCoinBulletin("ALL");
                    }
                }
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_NEW_WALLET_START, function () {
                isWalletBeingCreated = true;
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_NEW_WALLET_END, function () {
                isWalletBeingCreated = false;
            });
            // If "Don't Show This Bulletin Again" option is clicked, on close, for any coin: set the boolean to false
            jaxx.Registry.application$.on(jaxx.Registry.HIDE_ALL_BULLETIN, function () {
                showAllBulletin = false;
            });
        }
        ModalViewController.prototype.showCoinBulletin = function (symbol) {
            var coinBulletinData = g_JaxxApp.getUI().getCoinBulletinData();
            var coinsInBulletin = Object.keys(coinBulletinData);
            var bulletinData = coinBulletinData[symbol];
            if (typeof (bulletinData) !== "undefined" && bulletinData !== null) {
                var version = bulletinData["version"];
                if (!g_JaxxApp.getSettings().isCoinBulletinHideOnSelect(version)) {
                    if (coinsInBulletin.indexOf(symbol) > -1) {
                        $(".coinBulletinTitle").text(bulletinData.title);
                        $(".coinBulletinDescription").html(bulletinData.description);
                        $(".coinBulletinCloseButton").attr("value", symbol);
                        Navigation.openModal("jaxxNews");
                    }
                }
            }
        };
        ModalViewController.prototype.showCoinBulletinFromMenu = function (symbol) {
            var coinBulletinData = g_JaxxApp.getUI().getCoinBulletinData();
            var coinsInBulletin = Object.keys(coinBulletinData);
            var bulletinData = coinBulletinData[symbol];
            if (typeof (bulletinData) !== "undefined" && bulletinData !== null) {
                if (coinsInBulletin.indexOf(symbol) > -1) {
                    $(".coinBulletinTitle").text(bulletinData.title);
                    $(".coinBulletinDescription").html(bulletinData.description);
                    $(".coinBulletinCloseButton").attr("value", symbol);
                    Navigation.openModal("jaxxNews");
                }
            }
        };
        return ModalViewController;
    }());
    jaxx.ModalViewController = ModalViewController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=modal-view-controller.js.map