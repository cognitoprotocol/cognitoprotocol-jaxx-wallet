var jaxx;
(function (jaxx) {
    var ExportPrivateKeysViewController = (function () {
        function ExportPrivateKeysViewController() {
            var _this = this;
            ExportPrivateKeysViewController.instance = this;
            this.$view = $('#ExportPrivateKeysDynamically');
            $.get('js/app/export-private-keys/export-private-keys.html', '', function (res) {
                _this.stringViewTemplate = res;
            });
        }
        ExportPrivateKeysViewController.prototype.init = function () {
            var _this = this;
            this.$backButton = this.$view.find('.imageReturn.cssImageReturn');
            this.$backButton.on('click', function () {
                Navigation.popSettings();
            });
            this.$closeButton = this.$view.find('.cssClose');
            this.$closeButton.on('click', function () {
                Navigation.clearSettings();
                //TODO need to toggle main menu
            });
            this.$textArea = this.$view.find('textarea');
            this.addPrivateKeysToTextArea();
            this.$buttonCopyAll = this.$view.find('.cssBtnIntroRight');
            this.$buttonCopyAll.on('click', function () {
                _this.copyPrivateKeys();
            });
        };
        ExportPrivateKeysViewController.prototype.show = function () {
            var parentHTML = '';
            parentHTML += ExportPrivateKeysViewController.viewFormatter(this.stringViewTemplate, this.stringCoinName);
            this.$view.html(parentHTML);
            this.init();
        };
        ExportPrivateKeysViewController.prototype.hide = function () {
            this.$view.empty();
        };
        ExportPrivateKeysViewController.prototype.copyPrivateKeys = function () {
            jaxx.Utils.copyClipboard(this.stringExportPrivateKeys);
        };
        ExportPrivateKeysViewController.prototype.addPrivateKeysToTextArea = function () {
            this.$textArea.val(this.stringExportPrivateKeys);
        };
        ExportPrivateKeysViewController.prototype.setPrivateKeys = function (privateKeys) {
            this.stringExportPrivateKeys = privateKeys;
        };
        ExportPrivateKeysViewController.prototype.getPrivateKeys = function () {
            return this.stringExportPrivateKeys;
        };
        ExportPrivateKeysViewController.viewFormatter = function (template, coinName) {
            return template.replace('{{headerCoinName}}', coinName)
                .replace('{{contenCoinName}}', coinName);
        };
        return ExportPrivateKeysViewController;
    }());
    jaxx.ExportPrivateKeysViewController = ExportPrivateKeysViewController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=export-private-keys-view-controller.js.map