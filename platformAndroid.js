(function () {
  "use strict";
  if (window.JaxxAndroid) {
      window.native = {};
      if (window.JaxxAndroid.scanCode) {
          window.native.scanCode = function(processScanData){
              window.JaxxAndroid.scanCode();
              window.native_gotScan = function (data) {
                  processScanData(data);
              };
          };
      }
      if (window.JaxxAndroid.getWindowWidth) {
          window.native.getWindowWidth = function() {
              return window.JaxxAndroid.getWindowWidth();
          };
      }
      if (window.JaxxAndroid.getWindowHeight) {
          window.native.getWindowHeight = function() {
              return window.JaxxAndroid.getWindowHeight();
          };
      }

      if (window.JaxxAndroid.getSoftNavbarHeight) {
          window.native.getAndroidSoftNavbarHeight = function() {
              return window.JaxxAndroid.getSoftNavbarHeight();
          };
      }

      if (window.JaxxAndroid.openExternalURL) {
          window.native.openExternalURL = function(url){
              window.JaxxAndroid.openExternalURL(url);
          };
      }

      if (window.JaxxAndroid.copyToClipboard) {
          window.native.copyToClipboard = function(textToCopy) {
              window.JaxxAndroid.copyToClipboard(textToCopy);
          };
      }

      if (window.JaxxAndroid.hideSplashScreen) {
          window.native.hideSplashScreen = function() {
              window.JaxxAndroid.hideSplashScreen(true);
          };
      }

      if (window.JaxxAndroid.setMainMenuOpenStatus) {
          window.native.setMainMenuOpenStatus = function(isMainMenuOpenStatus) {
              window.JaxxAndroid.setMainMenuOpenStatus(isMainMenuOpenStatus);
          };

          window.native_setMainMenuOpen = function(statusString) {
              if (statusString === 'false') {
                  window.Navigation.setMainMenuOpen(false);
              } else if (statusString === 'true') {
                  window.Navigation.setMainMenuOpen(true);
              }
          };
      }

    if (window.JaxxAndroid.setIsModalOpenStatus) { // True if this function is defined.
      window.native.setIsModalOpenStatus = function(isModalOpenStatus){ // Responds to calls in the webapp.
        window.JaxxAndroid.setIsModalOpenStatus(isModalOpenStatus);
      };
      window.native_closeModal = function(){ // Responds to calls from the Android front end.
        window.Navigation.closeModal();
      };

    }

    if (window.JaxxAndroid.createLogMessage) { // Sends messages to the Android Studio Console.
      window.native.createLogMessage = function(pStrMessage){
        window.JaxxAndroid.createLogMessage(pStrMessage);
      };
    }

    if (window.JaxxAndroid.setSettingsStackStatusSize || window.JaxxAndroid.createLogMessage) {
      window.JaxxAndroid.createLogMessage("getSettingsStackStatusSize method has been initialized by the Android App.");
      // @TODO: Re-implement this logic when the program needs access to the stackSettingsContent
      //		window.native_setSettingsStackStatus = function(){
      //			window.native.setSettingsStackStatus();
      //		}
      //
      //		window.native.setSettingsStackStatus = function(){
      //			// Functionality: Push settingsStackStatus to Android App.
      //			// Note: One client for this function is getSettingsStackStatus in the Android App.
      //			JaxxAndroid.setSettingsStackStatus(Navigation.getSettingsStack().join(',')); // Change Navigation settingsStack to String.
      //		}
      window.native_popSettings = function(){
        //if (Navigation.getSettingsStack().length > 0) {
        window.JaxxAndroid.createLogMessage("In window.native_popSettings, the settings stack in the web app is " + window.Navigation.getSettingsStack().join(','));
        window.Navigation.popSettings();
        window.JaxxAndroid.setSettingsStackStatusSize(window.Navigation.getSettingsStack().length);
        //}
      };

      window.native.setSettingsStackStatusSize = function(pSize) {
        window.JaxxAndroid.setSettingsStackStatusSize(pSize);
      };
    }

    window.native.setProfileMode = function(newProfileMode) {
        window.Navigation.setProfileMode(newProfileMode);
    };

    if (window.JaxxAndroid.setTabName || window.JaxxAndroid.createLogMessage) {
      window.JaxxAndroid.createLogMessage("setTabName method has been initialized by the Android App.");
      window.native.setTabName = function(pStrTabName){ // Sets the tab name in the Android file.
        if (!pStrTabName) {
          pStrTabName = "";
        }
        window.JaxxAndroid.setTabName(pStrTabName);
        window.JaxxAndroid.createLogMessage("Setting tab name in Android App to " + pStrTabName);
      };
      window.native_pullTabName = function(){ // Called from Android file
        window.native.setTabName(window.Navigation.getTab());
      };
      window.native_collapseTabs = function(){ // Called from Android file to respond to back button
        window.Navigation.collapseTabs();
      };
    }

      window.native_runBackButtonBusinessLogicInJavascript = function(){
          //@Add in modal closing functionality
          window.console.log("Running back button business logic.");
          var strTopOfSettingsStack = window.Navigation.getTopOfSettingsStack();
          if (strTopOfSettingsStack === null){
              window.console.log("The settings stack is empty.");
              if (window.g_JaxxApp.getUI().isMainMenuOpen()) {
                  window.console.log("Closing the main menu.");
                  window.g_JaxxApp.getUI().closeMainMenu();
              } else {
                  if (window.JaxxAndroid.exitApplication && window.JaxxAndroid.createLogMessage) {
                      window.console.log("Exiting Application Location BBB.");
                      window.JaxxAndroid.exitApplication();
                  }
              }
          } else {
              window.console.log("The top of the settings stack is " + strTopOfSettingsStack);
              if (window.g_JaxxApp.getSettings().isBackButtonExitApplication(strTopOfSettingsStack)) {
                  if (window.JaxxAndroid.exitApplication && window.JaxxAndroid.createLogMessage) {
                      window.console.log("Exiting Application Location AAA.");
                      window.JaxxAndroid.exitApplication();
                  }
              } else {
                  window.console.log("Popping Settings.");
                  window.Navigation.popSettings();
              }
          }
      };

  }
}());

window.$(function() {
    "use strict";
    var userAgent = parseGETparam('userAgent');
    window.storeData('userAgent',userAgent);
});

function parseGETparam(val) {
    "use strict";
    var result = "-1",
        tmp = [];
    location.search
    // this is better, there might be a question mark inside
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === val) {
          result = decodeURIComponent(tmp[1]);
        }
    });
    return result;
}