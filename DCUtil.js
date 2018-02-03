//- DCUtil.js ---------------------------------------------------------------------------------------------------------------------
"use strict";

var DCUtil = {
    buildErrorMsg: function (message1, message2) {
        var msg = "";
            
        if (message1 && message1.length) msg = message1;
        if (message2 && message2.length) {
            if (msg.length) msg += "; ";
                msg += message2;
            }
        if (!msg.length) msg = "No Error Message provided.";   
        return msg;
    },
    get: function (url, callbackSuccess, callbackFailure) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                var json = {};

                try {
                    json = JSON.parse(req.responseText);
                    callbackSuccess(json);
                }
                catch(err) {
                    callbackFailure(DCUtil.buildErrorMsg("JSON Parse Error @ " + url, err));
                }
            }
            else if (req.readyState === 4 && (req.status === 0 || req.status === 401 || req.status === 404)) {
                callbackFailure(DCUtil.buildErrorMsg("Error: GET " + url, req.responseText));
            }
        };
        req.open("GET", url, true);
        req.send();
    }
}