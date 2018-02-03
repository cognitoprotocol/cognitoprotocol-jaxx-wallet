var jaxx;
(function (jaxx) {
    var CoinsCarouselSelectionType;
    (function (CoinsCarouselSelectionType) {
        CoinsCarouselSelectionType[CoinsCarouselSelectionType["CoinNav"] = 0] = "CoinNav";
        CoinsCarouselSelectionType[CoinsCarouselSelectionType["ShapeShift"] = 1] = "ShapeShift";
    })(CoinsCarouselSelectionType || (CoinsCarouselSelectionType = {}));
    var CoinsCarousel = (function () {
        function CoinsCarousel() {
            var _this = this;
            this.bringSelectedCoinIntoViewTimer = null; // activated by this.onArrowClicked
            this.timeToWaitUntilResettingCarouselScroll = 5000; //duration until it's checked if the user selected a coin after scrolling
            this._coinBannerCarouselAnimationTime = 300;
            this._coinBannerCarousel = null; // tiny carousel jQuery plugin instance
            this.$view = $('#scrollHeaderContainer');
            this.$carousel = $('#CarouselList');
            this.$viewPortContainer = $('#scrollHeaderContainer');
            this.$leftArrow = $('#scrollHeaderContainer a.leftArrow');
            this.$rightArrow = $('#scrollHeaderContainer a.rightArrow');
            this.$leftArrow.click(this.onArrowClicked.bind(this));
            this.$rightArrow.click(this.onArrowClicked.bind(this));
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_INTERWALLET_ANIMATION_END, function () {
                _this.onInterWalletAnimationEnded();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_ACTIVATED, function () {
                _this.activateBringActiveCoinIntoViewTimer();
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_UI_SHAPE_SHIFT_FROM_CHANGE, function () {
                // In the ShapeShift menu, when the "From" coin is changed
                // The carousel is also changed to reflect the new wallet selection
                var symbol = jaxx.Registry.getCurrentCryptoController().symbol;
                _this.setSelected(symbol, CoinsCarouselSelectionType.ShapeShift);
            });
            this.$view.on('click', 'li', function (evt) {
                var element = $(evt.currentTarget);
                var symbol = element.data('symbol');
                _this.setSelected(symbol, CoinsCarouselSelectionType.CoinNav);
            });
            this.$list = $('#CarouselList');
        }
        CoinsCarousel.prototype.onEnableChange = function (symbol, enabled) {
            var _this = this;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(function () {
                _this.render();
                _this.bringSelectedCoinIntoViewTimer = setTimeout(_this.carouselBringCurrentCoinIntoView.bind(_this), _this.timeToWaitUntilResettingCarouselScroll);
            }, 1000);
        };
        CoinsCarousel.prototype.onSequanceChange = function (coins) {
            var _this = this;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(function () {
                _this.render();
                //this.resetCoin();
            }, 200);
            if (this.bringSelectedCoinIntoViewTimer !== null) {
                clearTimeout(this.bringSelectedCoinIntoViewTimer);
            }
            this.bringSelectedCoinIntoViewTimer = setTimeout(this.carouselBringCurrentCoinIntoView.bind(this), this.timeToWaitUntilResettingCarouselScroll);
        };
        /**
         * When the user moves the mouse around the carousel, we directly cancel any pending
         * coin move.
         */
        CoinsCarousel.prototype.onMouseEnterCarousel = function (e) {
            if (this.bringSelectedCoinIntoViewTimer !== null) {
                clearTimeout(this.bringSelectedCoinIntoViewTimer);
                this.bringSelectedCoinIntoViewTimer = null;
            }
        };
        CoinsCarousel.prototype.onInterWalletAnimationEnded = function () {
            var _this = this;
            var coinControllerToBeActivated = jaxx.Registry.getCryptoControllerBySymbol(this.selectedSymbol);
            if (coinControllerToBeActivated) {
                setTimeout(function () {
                    jaxx.Registry.setCurrentControllerBySymbol(_this.selectedSymbol);
                }, 100);
            }
            else {
                jaxx.Registry.setCurrentControllerBySymbol(this.selectedSymbol);
            }
            jaxx.Registry.application.balanceController.fiatBalanceView.updatefiatWalletBalance(this.selectedSymbol);
            setTimeout(function () {
                jaxx.Registry.application.spinner.hideSpinner(function () {
                    jaxx.Registry.application.spinner.animateInAllWalletElements();
                });
            }, 1000);
        };
        /**
         * Called when any of the scrolling arrows are clicked.
         * The purpose is: if user scrolls but did not select another coin after scrolling, we set a timer and when that completes
         * we bring the active coin into view
         *
         * @param e Event
         */
        CoinsCarousel.prototype.onArrowClicked = function (e) {
            this.activateBringActiveCoinIntoViewTimer();
        };
        CoinsCarousel.prototype.resetCoin = function () {
            console.warn("SYMBOL INITIAL: ", this.selectedSymbol);
            if (this.selectedSymbol) {
                var coinIsInWallet = this.checkForCoinInWallets(this.selectedSymbol);
                if (!coinIsInWallet) {
                    this.selectDefaultCoin();
                }
                else {
                    this.setSelected(this.selectedSymbol, CoinsCarouselSelectionType.CoinNav);
                }
            }
            console.warn("SYMBOL FINAL: ", this.selectedSymbol);
        };
        CoinsCarousel.prototype.activateBringActiveCoinIntoViewTimer = function () {
            if (this.bringSelectedCoinIntoViewTimer !== null) {
                clearTimeout(this.bringSelectedCoinIntoViewTimer);
            }
            this.bringSelectedCoinIntoViewTimer = setTimeout(this.carouselBringCurrentCoinIntoView.bind(this), this.timeToWaitUntilResettingCarouselScroll);
        };
        CoinsCarousel.prototype.checkForCoinInWallets = function (checkSymbol) {
            var coins = jaxx.Registry.getWalletsEnabledSorted();
            var coinIsInWallet = false;
            for (var i = 0; i < coins.length; i++) {
                var coinSymbol = (coins[i]).symbol;
                if (coinSymbol === checkSymbol) {
                    coinIsInWallet = true;
                }
            }
            return coinIsInWallet;
        };
        CoinsCarousel.prototype.selectDefaultCoin = function () {
            console.log(' selectDefaultCoin ');
            var firstCoin = _.first(jaxx.Registry.getWalletsEnabledSorted());
            if (!firstCoin) {
                firstCoin = _.first(jaxx.Registry.getAllCryptoControllers());
            }
            this.render();
            this.setSelected(firstCoin.symbol, CoinsCarouselSelectionType.CoinNav);
            return firstCoin.coinType;
        };
        /**
         * Sets the selected coin / token in the menu based on what caused the carousel to update
         * @method setSelected
         * @param {String} symbol
         * @param {CoinsCarouselSelectionType} selection
         * */
        CoinsCarousel.prototype.setSelected = function (symbol, selection) {
            if (this.selectedSymbol === symbol) {
                console.log(' already selected ' + symbol);
            }
            this.selectedSymbol = symbol;
            jaxx.Registry.application$.trigger(jaxx.Registry.ON_UI_COIN_ACTIVATE_START, this.selectedSymbol);
            var element = this.$view.find('[data-symbol=' + symbol + ']').first();
            if (element.length) {
                if (this.$selected) {
                    // deselect the current activated item
                    this.$carousel.children('cssSelected').removeClass('cssSelected');
                    this.$carousel.children().each(function () {
                        var hueRotated;
                        var doesNeedHue;
                        if (this.style.filter) {
                            hueRotated = (this.style.filter.split('hue-rotate('))[1].split(')')[0];
                            doesNeedHue = !(typeof hueRotated === 'undefined');
                        }
                        if ($(this).data('symbol') == symbol) {
                            $(this).removeClass('cssCoinSelecterGreyFilter');
                            $(this).removeClass('cssCoinSelectGenericFilter');
                        }
                        else if (doesNeedHue) {
                            $(this).addClass('cssCoinSelectGenericFilter');
                        }
                        else {
                            $(this).addClass('cssCoinSelecterGreyFilter');
                        }
                    });
                }
                // select the newly clicked item
                element.addClass('cssSelected');
                element.removeClass('cssCoinSelecterGreyFilter');
                element.removeClass('cssCoinSelecterGreyFilter');
                this.$selected = element;
            }
            else {
                console.error("Can't find element " + symbol);
            }
            if (selection === CoinsCarouselSelectionType.CoinNav) {
                this.$list.scrollLeft(0);
                var stc = jaxx.SendTransactionsController.instance;
                stc.deactivateShapeShift();
                stc.resetAll();
                stc.currentState = '';
            }
        };
        CoinsCarousel.prototype.render = function () {
            var _this = this;
            var html = '';
            var coins = jaxx.Registry.getWalletsEnabledSorted();
            // render the coin list
            for (var i = 0; i < coins.length; i++) {
                var coin = coins[i];
                var extraCss = '';
                var hueRotation = coin.hueRotate;
                var doesNeedHue = !(typeof coin.hueRotate === 'undefined');
                if (this.selectedSymbol == coin.symbol) {
                    extraCss = 'cssSelected';
                }
                else if (doesNeedHue) {
                    extraCss = 'cssCoinSelectGenericFilter';
                }
                else {
                    extraCss = 'cssCoinSelecterGreyFilter';
                }
                html += '<li data-name="' + coin.name + '" data-symbol="' + coin.symbol + '" class="item cssItem cssCoinSelector ' + extraCss + '" switchToCoin="' + coin.name + '" value="' + coin.name + '"' +
                    ' style="background-image: url(' + coin.icon + '); filter: hue-rotate(' + hueRotation + 'deg)">' +
                    ' <span class="cssCoinButtonText"> ' + coins[i].threeLetterCode + '</span></li>';
            }
            if (coins.length > 3) {
                // then render the 1st 3 coins again having 'mirrored' css class, as it's required by tinycarousel http://baijs.com/tinycarousel/
                for (var x = 0; x < Math.min(coins.length, 3); x++) {
                    var extraCss = void 0;
                    var coin = coins[x];
                    var hueRotation = coin.hueRotate;
                    var doesNeedHue = !(typeof coin.hueRotate === 'undefined');
                    if (doesNeedHue) {
                        extraCss = 'cssCoinSelectGenericFilter';
                    }
                    else {
                        extraCss = 'cssCoinSelecterGreyFilter';
                    }
                    html += '<li data-name="' + coin.name + '" data-symbol="' + coin.symbol + '" class="item cssItem ' + extraCss + ' cssCoinSelector mirrored" switchToCoin="' + coin.name + '" value="' + coin.name + '"' +
                        ' style="background-image: url(' + coin.icon + '); filter: hue-rotate(' + hueRotation + 'deg)">' +
                        ' <span class="cssCoinButtonText"> ' + coins[x].threeLetterCode + '</span></li>';
                }
            }
            this.$list.html(html);
            // this code controls if a tinycarousel is used or not
            // it also sets the width of the viewPortContainer to specifically fit less than 3 coins (such as 1 or 2) in oder to keep the coin selector centered
            if (coins.length <= 3) {
                var items = $('#CarouselList li');
                var itemWidth = items.outerWidth(true);
                var viewPortContainerWidth = coins.length * itemWidth;
                this.$viewPortContainer.width(viewPortContainerWidth);
                var carousel = $('#scrollHeaderContainer').data('plugin_tinycarousel');
                if (carousel && carousel['move']) {
                    carousel.update();
                    carousel.move(0);
                }
                this._coinBannerCarousel = null;
                this.$leftArrow.hide();
                this.$rightArrow.hide();
            }
            else {
                this.$leftArrow.show();
                this.$rightArrow.show();
                this.$viewPortContainer.width('230px');
                var carousel = $('#scrollHeaderContainer').data('plugin_tinycarousel');
                if (carousel) {
                    this._coinBannerCarousel = carousel;
                }
                if (this._coinBannerCarousel === null) {
                    setTimeout(function () {
                        $('#scrollHeaderContainer').tinycarousel({ infinite: true, animationTime: _this._coinBannerCarouselAnimationTime });
                        _this._coinBannerCarousel = $('#scrollHeaderContainer').data('plugin_tinycarousel');
                    }, 1);
                }
                else {
                    setTimeout(function () {
                        _this._coinBannerCarousel.update();
                    }, 1);
                }
            }
        };
        CoinsCarousel.prototype.carouselBringCurrentCoinIntoView = function () {
            if (this._coinBannerCarousel && this._coinBannerCarousel.move) {
                var current_coin_id = this.carouselGetCoinIDFromSymbol(this.selectedSymbol);
                this._coinBannerCarousel.move(current_coin_id);
            }
        };
        CoinsCarousel.prototype.carouselGetCoinIDFromSymbol = function (coin_symbol) {
            var id;
            id = $('#CarouselList').children('[data-symbol="' + coin_symbol + '"]').index();
            return id;
        };
        return CoinsCarousel;
    }());
    jaxx.CoinsCarousel = CoinsCarousel;
    var CoinsMenu = (function () {
        function CoinsMenu() {
            var _this = this;
            /** Triggerred when a coin/wallet is activated/deactivated.
             *
             * Looks if it's a coin deactivation request and if that coin is the currently enabled
             * wallet, switches to the next enabled wallet.
             *
             * Then updates the coin carousel to reflect the coin selection changes.
             */
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_SATUS_CHANGED, function (evt, name, enbl, symbol) {
                var currentCrypto = null;
                currentCrypto = jaxx.Registry.getCurrentCryptoController();
                if (currentCrypto) {
                    var currentlyActivatedCoinSymbol = currentCrypto.symbol;
                    if (enbl == false && symbol == currentlyActivatedCoinSymbol) {
                        var wallets = jaxx.Registry.getWalletsEnabledSorted();
                        var loop_count = 0;
                        if (wallets.length > 1) {
                            var starting_pos = wallets.indexOf(currentCrypto) + 1;
                            var next_wallet = null;
                            do {
                                if (starting_pos >= wallets.length) {
                                    starting_pos = 0;
                                }
                                if (wallets[starting_pos].symbol != currentlyActivatedCoinSymbol) {
                                    next_wallet = wallets[starting_pos];
                                }
                                else {
                                    next_wallet = null;
                                }
                                if (loop_count > 1000) {
                                    break; // just making sure the loop won't go forever
                                }
                                loop_count++;
                            } while (next_wallet != null);
                            _this.carousel.setSelected(next_wallet.symbol, CoinsCarouselSelectionType.CoinNav);
                        }
                    }
                }
                else {
                    console.error("Couldn't active/deactivate " + name + " wallet. Cannot find the currently activated crypto controller.");
                }
                _this.carousel.onEnableChange(symbol, enbl);
            });
            jaxx.Registry.application$.on(jaxx.Registry.ON_COIN_SEQUENCE_CHANGED, function (evt, out) {
                _this.carousel.onSequanceChange(out);
            });
            CoinsMenu.instance = this;
            this.carousel = new CoinsCarousel();
            this.selector = new CoinsSelector();
        }
        CoinsMenu.prototype.selectDefaultCoin = function () {
            this.carousel.selectDefaultCoin();
        };
        return CoinsMenu;
    }());
    jaxx.CoinsMenu = CoinsMenu;
    var CoinsSelector = (function () {
        function CoinsSelector() {
        }
        return CoinsSelector;
    }());
    jaxx.CoinsSelector = CoinsSelector;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=coins-menus.js.map