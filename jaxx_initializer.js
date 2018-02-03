/**
 * Created by Daniel on 2017-03-02.
 */

var JaxxInitializer = function() {

}

JaxxInitializer.prototype.initialize = function(){

}

JaxxInitializer.prototype.startJaxx = function(){
    g_JaxxApp.getUI().showApplicationLoadingScreen(); // splash
    g_JaxxApp.getUI().fetchAndStoreCoinBulletinData();
    this.startJaxxWithReleaseNotesPage();
}

JaxxInitializer.prototype.startJaxxWithReleaseNotesPage = function() {
    // Consider
    g_JaxxApp.getUI().getReleaseBulletin(function() {
        //g_JaxxApp.getUI().hideApplicationLoadingScreen(); // splash
        g_JaxxApp.getUI().displayJaxxReleaseBulletinIfUnseen();
    });
//    g_JaxxApp.getUI().startJaxxIfNoReleaseNotesAreShown();

}

JaxxInitializer.prototype.startJaxxWithTermsOfServicePage = function() {
    //console.error('xxInitializer.prototype.startJaxxWithTermsOfServicePage');
    // This is run when the user clicks 'Continue' on release notes.
    g_JaxxApp.getUser().setupWithWallet(null);
    g_JaxxApp.getUI().setStartJaxxWithTermsOfServicePageWasRun(true);
    if (getStoredData('hasShownTermsOfService')){
        initializeJaxx(function() { // Initialize Jaxx is certain to get called at least one before the main wallet screen.
            // g_JaxxApp.getUI().hideApplicationLoadingScreen(); // splash
            g_JaxxApp.getUI().hideSplashScreen();
        });
    } else {

        g_JaxxApp.getUI().getIntro().startJaxxFromTermsOfServicePage();
    }
}