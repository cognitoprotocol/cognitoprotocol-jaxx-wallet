var JaxxUtils = function() {

}

JaxxUtils.scrubInput = function(inputString) {
    //    console.log("inputString :: " + inputString);
    var mInput = thirdparty.sanitizeHtml(inputString, {
        allowedTags: [ 'h3', 'b', 'strong', 'em', 'ul', 'ol', 'li',  'p', 'br','hr'],
        allowedAttributes: [],
        selfClosing: ['br', 'hr'],
        nonTextTags: [ 'style', 'script', 'textarea', 'noscript' ],
        allowedClasses: {
            'li': ['cssJaxxMainFontColor', 'cssFunThingsColor', 'cssWarningFontColor', 'cssCurrencyFontColor' ],
            'ul': ['cssJaxxMainFontColor', 'cssFunThingsColor', 'cssWarningFontColor', 'cssCurrencyFontColor' ],
            'ol': ['cssJaxxMainFontColor', 'cssFunThingsColor', 'cssWarningFontColor', 'cssCurrencyFontColor' ],
            'p':  ['cssJaxxMainFontColor', 'cssFunThingsColor', 'cssWarningFontColor', 'cssCurrencyFontColor' ],
            'h3':  ['cssJaxxMainFontColor', 'cssFunThingsColor', 'cssWarningFontColor', 'cssCurrencyFontColor' ]
        }

    });
    //        inputString.replace(/<script.*?<\/script>/g, '').replace(/<a.*?<\/a>/g, '');

    if (mInput !== inputString) {
        //        console.log("recurse");
        mInput = JaxxUtils.scrubInput(mInput);
    }

    //    console.log("mInput :: " + mInput);
    return mInput;
}