/*
Purpose:
1 Provide transaction price per byte to build transaction
2. Adjust spendable according current price
2. Store and retrieve user settings mining fee "fast | average | slow"

Functionality:
 1. download mining fee from  url  provided in config
 2. Save data in local storage
 3. Save User settings
 4. Provide price per byte according user settings

 Info:
 url in config file  for each coin  "miningFeeUrl"
 "useGasPriceApi": true  has to be set to use url otherwise
 "miningFeePerByte":150 has to be set
 if absent files will be downloaded from application local filesystem " data/miningFeeDASH.json, data/miningFeeLTC.json ......"
 data has to have specific format  similar to BTC now

{"fastestFee": 150,
    "halfHourFee": 170,
    "hourFee": 120
}

downloaded data saved in local storage with keys symbol + 'mining-fee';
data updated after 6 min expired when coin active and not updated when coin not active
if no data provided default { fast: 300, average:200, slow: 100, timestamp:0}

Interfaces added:

in coin-controller to access MiningFeeController class

interface ICoinWithMiningFee{
    getMiningFeeValueCtr():IMiningFeeValue;
    getIMiningFeeOptionCtr():IMiningFeeOption;
}
MiningFeeController has 2 interfaces for UI and DCL

For UI to set/get user options:
interface IMiningFeeOption{
    setCurrentOption(option:string)
    getCurrentOption():string
}

to access interface from UI:
 let ctr:ICoinWithMiningFee =  Registry.getCryptoControllerBySymbol('BTC');
 ctr.getIMiningFeeOptionCtr().setCurrentOption(option);

For DCL to get price per Byte and adjust spendable
interface IMiningFeeValue{
    getMiningFeePerByte():number;
    subtractMiningFee(total:string, length:number):string;
}

interface access from DCL :
let ctr:ICoinWithMiningFee =  Registry.getCryptoControllerBySymbol('BTC');
 ctr.getMiningFeeValueCtr().getMiningFeePerByte()

*/
var jaxx;
(function (jaxx) {
    var MiningFeeController = (function () {
        function MiningFeeController(config, storage) {
            this.config = config;
            this.storage = storage;
            this.keyData = config.symbol + 'mining-fee';
            this.keyOption = config.symbol + 'mining-option';
        }
        // used by controller to start update timer
        MiningFeeController.prototype.activate = function () {
            var _this = this;
            if (this.isActive)
                return;
            this.isActive = true;
            this.downloadMingFee();
            this.interval = setInterval(function () { return _this.downloadMingFee(); }, 6 * 60 * 1000);
        };
        // used by controller to stop update timer
        MiningFeeController.prototype.deactivate = function () {
            if (!this.isActive)
                return;
            this.isActive = false;
            clearInterval(this.interval);
        };
        // UI interface to set user option "fast | average | slow"
        MiningFeeController.prototype.setCurrentOption = function (option) {
            this.current = option;
            this.storage.setItem(this.keyOption, option);
        };
        // UI interface  to retrieve user option
        MiningFeeController.prototype.getCurrentOption = function () {
            if (!this.current)
                this.current = this.storage.getItem(this.keyOption) || this.config.miningFeeOption || 'average';
            return this.current;
        };
        // DCL interface  returns price ether form download data or from config file
        MiningFeeController.prototype.getMiningFeePerByte = function () {
            if (!this.config.useMiningFeeApi && this.config.miningFeePerByte)
                return this.config.miningFeePerByte;
            return this.getMiningFee();
        };
        MiningFeeController.prototype.getMiningFee = function () {
            if (!this.data) {
                this.data = JSON.parse(this.storage.getItem(this.keyData)) || { fast: 300, average: 200, slow: 100, timestamp: 0 };
            }
            return this.data[this.getCurrentOption()];
        };
        MiningFeeController.prototype.setData = function (data) {
            this.data = data;
            data.timestamp = Date.now();
            this.storage.setItem(this.keyData, JSON.stringify(data));
        };
        // DCL interface to calculate spendable taking sum of UTXOs and amount of UTXOs
        // returns amount user can spend in consideration current mining fee settings
        MiningFeeController.prototype.subtractMiningFee = function (total, length) {
            var price = this.getMiningFeePerByte();
            var bytesPerInput = 148;
            var countInputs = length;
            var numOuts = 2;
            var totalBytes = (bytesPerInput * countInputs) + (34 * numOuts) + 10;
            var feeTotal = (totalBytes * price);
            var spendable = jaxx.MATH.subtract(total, String(feeTotal));
            if (+spendable < 0) {
                // console.log('fee total '+ feeTotal  +' where utxos total ' + total);
                return '0';
            }
            return spendable;
        };
        ;
        MiningFeeController.prototype.downloadMingFee = function () {
            var _this = this;
            console.log(this.config.useMiningFeeApi);
            if (!this.config.useMiningFeeApi)
                return;
            if (this.data && this.data.timestamp && (Date.now() - this.data.timestamp) < 5 * 60 * 1000)
                return;
            var url = this.config.miningFeeUrl || 'data/miningFee' + this.config.symbol + '.json';
            console.log(url);
            $.getJSON(url).then(function (res) {
                if (res && res.fastestFee) {
                    _this.setData({
                        fast: res.fastestFee,
                        average: res.halfHourFee,
                        slow: res.hourFee
                    });
                }
                else
                    console.error(res);
            }).fail(function (err) {
                console.error(err);
            });
        };
        return MiningFeeController;
    }());
    jaxx.MiningFeeController = MiningFeeController;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=mining-fee-controller.js.map