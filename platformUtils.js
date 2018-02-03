var PlatformUtils = function() {
    
};

PlatformUtils.outputAllChecks = function() {
    "use strict"
    console.log("browserChromeCheck :: " + PlatformUtils.browserChromeCheck());
    console.log("extensionSafariCheck :: " + PlatformUtils.extensionSafariCheck());
    console.log("extensionChromeCheck :: " + PlatformUtils.extensionChromeCheck());
    console.log("extensionFirefoxCheck :: " + PlatformUtils.extensionFirefoxCheck());
};

PlatformUtils.browserChromeCheck = function() {
    "use strict";
    if (typeof(chrome) !== "undefined" && typeof(chrome.extension) === "undefined") {
        return true;
    } else {
        return false;
    }
};

PlatformUtils.extensionSafariCheck = function() {
    "use strict";
    if (typeof(safari) !== 'undefined' && safari.self && /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
      return true;
    } else {
      return false;
    }
};

PlatformUtils.extensionChromeCheck = function() {
    "use strict";
    if (typeof(chrome) !== "undefined" && typeof(chrome.extension) !== "undefined" && typeof(chrome.extension.connect) !== "undefined") {
        //@note: this should be the final packed extension key: ilbikpphdpklejgkfhfmmllabablgcil
        var myPort = chrome.extension.connect('ilbikpphdpklejgkfhfmmllabablgcil', null);
        if (typeof(myPort) !== "undefined") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

PlatformUtils.extensionFirefoxCheck = function() {
    "use strict";
    //if (window.chrome && window.chrome.storage && window.chrome.storage.local && window.chrome.storage.local.get) {
    if (navigator.userAgent.indexOf("Firefox") > 0){
        return true;

        //@note: @todo: something about this doesn't work, but there's no debug capability in
        //FF Nightly to debug this, so I'm out of options at the moment.
        //        if (chrome.storage.local.get('firefox_extension')) {
        //            return true;
        //        } else {
        //            return false;
        //        }
    } else {
        return false;
    }
};

PlatformUtils.extensionCheck = function() {
    "use strict";
    return (PlatformUtils.extensionChromeCheck() || PlatformUtils.extensionFirefoxCheck() || PlatformUtils.extensionSafariCheck());
};

PlatformUtils.desktopCheck = function() {
    "use strict";
    if (typeof process !== 'undefined' && process.versions['electron']) {
        return true;
    } else{
        return false;
    }
};

PlatformUtils.mobileCheck = function() {
    "use strict";
    if( /webOS|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    } else {
        if (PlatformUtils.mobileIphoneCheck() || PlatformUtils.mobileIpadCheck() || PlatformUtils.mobileBlackberryCheck() || PlatformUtils.mobileAndroidCheck) {
            return true;
        } else {
            return false;
        }
    }
};

PlatformUtils.mobileIphoneCheck = function() {
    "use strict";
    if( /iPhone|iPod/i.test(navigator.userAgent) ) {
      return true;
    } else {
      return false;
    }
};

PlatformUtils.mobileIpadCheck = function() {
    "use strict";
    if( /iPad/i.test(navigator.userAgent) ) {
      return true;
    } else {
      return false;
    }
};

PlatformUtils.mobileiOSCheck = function() {
    "use strict";
    if( PlatformUtils.mobileIphoneCheck() || PlatformUtils.mobileIpadCheck() )  {
      return true;
    } else {
      return false;
    }
};


PlatformUtils.mobileBlackberryCheck = function() {
    "use strict";
    if( /BlackBerry/i.test(navigator.userAgent) ) {
      return true;
    } else {
      return false;
    }
};

PlatformUtils.mobileAndroidCheck = function() {
    "use strict";
    if( /Android/i.test(navigator.userAgent) ) {
      return true;
    } else {
      return false;
    }

};