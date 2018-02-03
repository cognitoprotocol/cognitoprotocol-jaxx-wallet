var Registry = jaxx.Registry;
var jaxx;
(function (jaxx) {
    var ViewBackupPhraseController = (function () {
        function ViewBackupPhraseController() {
            var _this = this;
            ViewBackupPhraseController.instance = this;
            this.$view = $('#ViewBackupPhrase');
            this.$view.load('js/app/view-backup-phrase/view-backup-phrase.html', '', function () {
                _this.init();
            });
        }
        ViewBackupPhraseController.prototype.init = function () {
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
        };
        return ViewBackupPhraseController;
    }());
    jaxx.ViewBackupPhraseController = ViewBackupPhraseController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=view-backup-phrase-controller.js.map