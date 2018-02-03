var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var jaxx;
(function (jaxx) {
    var BtcTestService = (function (_super) {
        __extends(BtcTestService, _super);
        function BtcTestService(config, generator1, generator2) {
            return _super.call(this, config, generator1, generator2) || this;
        }
        /* downloadTransactionsDetails(transactions: VOTransaction[]): JQueryPromise<VOTransaction[]> {
 
             // console.log(transactions);
             let urlDetails = this.config.urlTransactionsDetails;
             let indexed = _.keyBy(transactions, 'id');
             let txIds:string[] = _.map(transactions, 'id');
             let deffered  =  <JQueryDeferred<VOTransaction[]>>jQuery.Deferred();
             let results:VOTransaction[] = [];
             let i = 0;
 
 
             let self = this;
 
             let downloadNext = function (onSuccess: Function, onFail: Function) {
                 //console.log(' downloadNext  ' + i);
                 let txid:string = txIds[i];
                 let url:string = urlDetails.replace('{{txid}}', txid);
                   // console.log(url);
 
                 $.getJSON(url).done(res => {
                      // console.log(res)
 
                    // res.id = txid;
                     onSuccess(self.parseTransaction(res))
 
 
                 }).fail(err => onFail(err));
 
             }
 
 
             let onDone = function (result) {
 
                 results.push(result);
 
                 if (++i >= txIds.length) {
                     //   console.log(results)
                     deffered.resolve(results);
                 } else downloadNext(onDone, onError);
             }
 
             let onError = function (err) {
                 deffered.reject(err);
 
             }
 
             downloadNext(onDone, onError);
             return deffered.promise();
 
         }*/
        BtcTestService.parseTransaction = function (item) {
            return {
                id: item.txid,
                txid: item.txid,
                block: item.blockheight,
                from: item.vin[0].addr,
                timestamp: item.time,
                confirmations: item.confirmations,
                tos: item.vout.reduce(function (sum, item) { return sum.concat(item.scriptPubKey.addresses); }, []),
                values: item.vout.map(function (item) { return +item.value; }),
                total: item.vin.reduce(function (sum, vin) { sum += +vin.value; }, 0),
                miningFee: item.fees
            };
        };
        BtcTestService.prototype.parseTransaction = function (data) {
            return BtcTestService.parseTransaction(data);
        };
        BtcTestService.prototype.transactionsParser = function (data, address) {
            return data.items.map(BtcTestService.parseTransaction);
        };
        return BtcTestService;
    }(jaxx.InsightApi));
    jaxx.BtcTestService = BtcTestService;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=btc-test-service.js.map