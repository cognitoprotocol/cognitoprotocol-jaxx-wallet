/*
* User can set different options for transaction mining fee
* it  pass User option to mining fee controller
* At current moment only BTC
* */
var jaxx;
(function (jaxx) {
    var MiningFeeView = (function () {
        function MiningFeeView(config) {
            var _this = this;
            this.config = config;
            this.name = 'MiningFeeView';
            MiningFeeView.instance = this;
            // initializing view container and loadin template htm in it
            this.$view = $('#BitCoinMiningFee');
            this.$view.load('js/app/mining-fee/mining-fee.html', "", function () {
                setTimeout(function () { return _this.init(); }, 1000);
            });
        }
        // initializing template
        MiningFeeView.prototype.init = function () {
            var _this = this;
            this.$view.on('click', '.optionTrigger', function (evt) {
                // console.log($(evt.currentTarget));
                _this.onSelect($(evt.currentTarget));
            });
            jaxx.Registry.application$.triggerHandler(jaxx.Registry.MODULE_REDY, this);
            this.$backNavigation = $('#BTCMiningFeeBackNavigation');
            this.$closeNavigation = $('#BTCMiningFeeClose');
            this.$backNavigation.on('click', function () {
                _this.backNavigation();
            });
            this.$closeNavigation.on('click', function () {
                _this.remoteToggleMainMenu();
            });
        };
        MiningFeeView.prototype.remoteToggleMainMenu = function () {
            jaxx.Utils.remoteToggleMainMenu();
        };
        MiningFeeView.prototype.backNavigation = function () {
            jaxx.Utils.backNavigation();
        };
        // this function called to show previously selected by user option on screen
        MiningFeeView.prototype.selectItem = function (option) {
            var el = this.$view.find('[data-id=' + option + ']').first();
            this.selectInput(el);
        };
        // pass user selected mining fee option to controller
        MiningFeeView.prototype.setMiningFeeOption = function (option) {
            var ctr = jaxx.Registry.getCryptoControllerBySymbol('BTC');
            ctr.getIMiningFeeOptionCtr().setCurrentOption(option);
            //localStorage.setItem(this.symbol+'miningfeeOption', option);
        };
        // returned mining fee option previously selected by user
        MiningFeeView.prototype.getMiningFeeOption = function () {
            var ctr = jaxx.Registry.getCryptoControllerBySymbol('BTC');
            if (!ctr) {
                console.error(' cant find controller BTC');
                return null;
            }
            return ctr.getIMiningFeeOptionCtr().getCurrentOption();
        };
        // triggered when opens
        MiningFeeView.prototype.onOpen = function () {
            console.log('BTC mining fee onOpen     ');
            var option = this.getMiningFeeOption();
            console.log('BTC mining fee onOpen     ' + option);
            this.selectItem(option);
            // console.warn('Mining fee opens ')
            // console.log(this);
        };
        /// deselects previously selected element and selects new element
        MiningFeeView.prototype.selectInput = function (el) {
            var name = el.data('id');
            if (this.selectedOption === name)
                return;
            if (this.$selected)
                this.$selected.prop('checked', false);
            el.prop('checked', true);
            this.$selected = el;
            this.selectedOption = name;
            this.setMiningFeeOption(name);
        };
        /// this function called with user interaction with screen
        MiningFeeView.prototype.onSelect = function (el) {
            var chk = el.find('.cssMiningFeeRadioBtn input');
            this.selectInput(chk);
        };
        return MiningFeeView;
    }());
    jaxx.MiningFeeView = MiningFeeView;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=mining-fee-view.js.map