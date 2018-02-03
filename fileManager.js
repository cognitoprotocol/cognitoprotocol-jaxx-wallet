var jaxx;
(function (jaxx) {
    /*
    * This is a utility class helps store json data in local storage.
    * */
    var FileManager = (function () {
        function FileManager() {
        }
        /*
        * This updates the localstorage with json file.  If it is obtainable by server it uses the server version.
        * Else it uses the local copy if not available.
        * @method updateLocalStorage
        * @param {String} url
        * @param {String} filePath
        * @param {String} key
        * @param {Function} callback
        * */
        FileManager.updateLocalStorage = function (url, filePath, key, cb) {
            FileManager.downloadFile(url, function (err, response) {
                if (err) {
                    console.error(err);
                    FileManager.downloadFile(filePath, function (localFileErr, localResponse) {
                        if (localFileErr) {
                            console.error(localFileErr);
                            cb(localFileErr);
                        }
                        else {
                            FileManager.saveLocalStorage(key, localResponse);
                            cb();
                        }
                    });
                }
                else {
                    FileManager.saveLocalStorage(key, response);
                    cb();
                }
            });
        };
        /*
        * Get file in local storage
        * @method getLocalStorage
        * @param {String} key
        * @return a stringified JSON object of what is saved in local storagfe
        * */
        FileManager.getLocalStorage = function (key) {
            return JSON.parse(localStorage.getItem(key));
        };
        /*
        * Saves file into local storage
        * @method saveLocalStorage
        * @param {String} key
        * @param {String} response
        * */
        FileManager.saveLocalStorage = function (key, response) {
            localStorage.setItem(key, response);
        };
        /*
        * Downloads JSON Object from specified URL
        * @method downloadFile
        * @param {String} url
        * @param {Function} cb (callback)
        * */
        FileManager.downloadFile = function (url, cb) {
            $.getJSON(url).done(function (response) {
                cb(null, JSON.stringify(response));
            }).fail(function (err) {
                cb(err);
            });
        };
        return FileManager;
    }());
    jaxx.FileManager = FileManager;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=fileManager.js.map