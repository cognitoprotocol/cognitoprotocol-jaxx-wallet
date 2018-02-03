if (window.webkit) {
    window.webkit.messageHandlers.Jaxx.postMessage({action: "console.log", message: "Bootstrap start"});

    (function () {
        window._scannerCallback = null;

        window.console = {};
        window.console.log = function () {
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                if ({number: true, string: true}[typeof(arguments[i])]) {
                    args.push(arguments[i]);
                } else {
                    args.push("" + arguments[i]);
                }
            }
            window.webkit.messageHandlers.Jaxx.postMessage({action: "console.log", arguments: args});
        };

        window.console.error = function (err) {
            if(err && typeof err === 'object') {
              window.webkit.messageHandlers.Jaxx.postMessage({
                action: "console.error",
                message: err.message,
                stack: err.stack
              });
            }
        };

        window.console.warn = function(warn) {
          window.webkit.messageHandlers.Jaxx.postMessage({
            action: "console.warn",
            message: warn.message,
            stack: warn.stack
          });
        }


        var nextCallbackIndex = 0;
        var callbacks = {};
        var registerCallback = function (callback) {
            var key = 'cb-' + (nextCallbackIndex++);
            callbacks[key] = callback;
            return key;
        }
        window._callCallback = function (data) {
            try {
                callbacks[data.callbackKey](data);
            } catch (error) {
                console.log("Native callback error: " + error.message);
            }
            delete callbacks[data.callbackKey];
        }

//    console.log("window.iosdefaultprofilemode :: " + window.iosdefaultprofilemode);

        window.native = {
            scanCode: function (callback) {
                if (!callback) {
                    console.log("!! ios js error :: No callback provided to scanCode !!");
                    throw new Error("No callback provided to scanCode");
                }

                window._scannerCallback = function (result) {

                    if (result && result.code) {
                        console.log("ios js result from scan :: " + result.code);
                        callback(result.code);
                    } else {
                        console.log("ios js result from scan is null");
                        callback(null);
                    }
                }

                window.webkit.messageHandlers.Jaxx.postMessage({
                    action: "native.scanCode",
                    callbackKey: registerCallback(function (data) {
                        callback(data.code);
                    })
                });
            },
            tweet: function (tweet, callback) {
                if (!tweet) {
                    return;
                }
                window._tweetCallback = function (result) {
                    if (!callback || !result) {
                        return;
                    }
                    callback(result.success);
                }

                window.webkit.messageHandlers.Jaxx.postMessage({action: "native.tweet", tweet: tweet});
            },
            openExternalURL: function (url) {
                console.log("try to open external URL : " + url);
                if (!url) {
                    return;
                }
                window.webkit.messageHandlers.Jaxx.postMessage({action: "native.openExternalURL", url: url});
            },
            copyToClipboard: function (textToCopy) {
                console.log("copy text to clipboard :: " + textToCopy);
                window.webkit.messageHandlers.Jaxx.postMessage({
                    action: "native.copyToClipboard",
                    textToCopy: textToCopy
                });
            },
            setProfileMode: function (newProfileMode) {
                Navigation.setProfileMode(newProfileMode);
            }

//        },
//        getWindowWidth: function() {
//            window.webkit.messageHandlers.Jaxx.postMessage({
//                action: "native.getWindowWidth",
//                callbackKey: registerCallback(function (data) {callback(data.code); })
//            });
//        }
        }

    })();

    console.log("Bootstrap complete");
}