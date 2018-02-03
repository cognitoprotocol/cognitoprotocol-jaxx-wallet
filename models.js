/**
 * Created by Vlad on 10/6/2016.
 */
///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../app/Registry.ts"/>
var VOError = (function () {
    function VOError(errorType, message, body, symbol) {
        this.errorType = errorType;
        this.message = message;
        this.body = body;
        this.symbol = symbol;
    }
    return VOError;
}());
var CoinType;
(function (CoinType) {
    CoinType[CoinType["ERC20"] = 0] = "ERC20";
})(CoinType || (CoinType = {}));
var AddressType;
(function (AddressType) {
    AddressType[AddressType["RECEIVE"] = 0] = "RECEIVE";
    AddressType[AddressType["CHANGE"] = 1] = "CHANGE";
})(AddressType || (AddressType = {}));
var VOBalance = (function () {
    function VOBalance(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOBalance;
}());
var VOBalanceTemp = (function () {
    function VOBalanceTemp(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOBalanceTemp;
}());
var VOBalanceSend = (function () {
    function VOBalanceSend(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOBalanceSend;
}());
var VOBalanceDiff = (function () {
    function VOBalanceDiff(id, balanceOld, balanceNew) {
        this.id = id;
        this.balanceOld = balanceOld;
        this.balanceNew = balanceNew;
    }
    return VOBalanceDiff;
}());
/* export class VOSendTransactionResult{
 message:string;
 confirmed:boolean;
 error:number;
 }*/
//////////////////////////////////////Bitcoin send transaction /////////////////////
var VOTransactionSent = (function () {
    function VOTransactionSent(obj) {
        for (var str in obj)
            this[str] = obj[str];
        if (this.inputs)
            this.inputs = this.inputs.map(function (o) { return new VOInput(o); });
        if (this.outputs)
            this.outputs = this.outputs.map(function (o) { return new VOOutput(o); });
    }
    return VOTransactionSent;
}());
/////////////////////////////////////////////////////////////////////////////////////
var VOTransactionView = (function () {
    function VOTransactionView(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOTransactionView;
}());
var VOTransaction = (function () {
    //
    function VOTransaction(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOTransaction;
}());
var VOutxo = (function () {
    function VOutxo(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOutxo;
}());
var VOInput = (function () {
    function VOInput(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOInput;
}());
var VOOutput = (function () {
    function VOOutput(obj) {
        for (var str in obj)
            this[str] = obj[str];
    }
    return VOOutput;
}());
//# sourceMappingURL=models.js.map