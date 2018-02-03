///<reference path="./models.ts"/>
///<reference path="./Utils2.ts"/>
///<reference path="./service-mapper.ts"/>
var jaxx;
(function (jaxx) {
    var AdrType;
    (function (AdrType) {
        AdrType[AdrType["RECEIVE"] = 0] = "RECEIVE";
        AdrType[AdrType["CHANGE"] = 1] = "CHANGE";
    })(AdrType = jaxx.AdrType || (jaxx.AdrType = {}));
    var GeneratorBlockchain = (function () {
        function GeneratorBlockchain(config) {
            var _this = this;
            this.config = config;
            this.MASTER = 44;
            this.account = 0;
            this.addressesReceive = [];
            GeneratorBlockchain.emitter$.on(GeneratorBlockchain.MNEMONIC_CHANGED, function (evt, seedHex) {
                _this.coinNode = null;
            });
        }
        GeneratorBlockchain.setMnemonic = function (mnemonic) {
            GeneratorBlockchain.seedHex = thirdparty.bip39.mnemonicToSeedHex(mnemonic);
            GeneratorBlockchain.emitter$.triggerHandler(GeneratorBlockchain.MNEMONIC_CHANGED);
        };
        GeneratorBlockchain.prototype.getCoinNode = function () {
            if (!this.coinNode) {
                var mn = thirdparty.bitcoin.HDNode.fromSeedHex(GeneratorBlockchain.seedHex, this.config.network).deriveHardened(this.MASTER);
                this.coinNode = mn.deriveHardened(this.config.hd_index).deriveHardened(this.account);
            }
            return this.coinNode;
        };
        GeneratorBlockchain.prototype.getAddressNode = function (type) {
            return this.getCoinNode().derive(type);
        };
        GeneratorBlockchain.prototype.generateXpubAddress = function () {
            return jaxx.Utils2.getXpubAddress(this.config.hd_index, this.config.network);
        };
        GeneratorBlockchain.prototype.getPublicAddress = function (node) {
            return (this.config.hd_index === 60 || this.config.hd_index === 61 || this.config.hd_index === 37310)
                ? jaxx.Utils2.getEtherAddress(node) : jaxx.Utils2.getBitcoinAddress1(node);
        };
        GeneratorBlockchain.prototype.generateAddressReceive = function (index) {
            return this.getPublicAddress(this.getCoinNode().derive(0).derive(index));
        };
        GeneratorBlockchain.prototype.generateAddressChange = function (index) {
            return this.getPublicAddress(this.getCoinNode().derive(1).derive(index));
        };
        GeneratorBlockchain.prototype.generatePrivateKeyChange = function (index) {
            var node = jaxx.Utils2.getChangeNode(index, this.config.hd_index, this.config.network);
            return jaxx.Utils2.getNodePrivateKey(node, this.config.network.wif);
        };
        GeneratorBlockchain.prototype.generatePrivateKeyReceive = function (index) {
            //  let coinNetwork = HDWalletPouch.getStaticCoinPouchImplementation(this.config.coinType).networkDefinitions.mainNet;
            var node = jaxx.Utils2.getReceiveNode(index, this.config.hd_index, this.config.network);
            return jaxx.Utils2.getNodePrivateKey(node, this.config.network.wif);
        };
        /* generateAddress2(index:number, type:AddressType):string {
             // console.error('hello generateAddress');
             if (type === AddressType.RECEIVE) {
                 return this.generateAddressReceive(index);
             } else {
                 return this.generateAddressChange(index);
             }
         }*/
        GeneratorBlockchain.prototype.generateAddress = function (index, receive_change) {
            // console.error('hello generateAddress');
            if (receive_change === "receive") {
                return this.generateAddressReceive(index);
            }
            else {
                return this.generateAddressChange(index);
            }
        };
        GeneratorBlockchain.prototype.generateKeyPairReceive = function (index) {
            //    let coinNetwork = HDWalletPouch.getStaticCoinPouchImplementation(this.config.coinType).networkDefinitions.mainNet;
            //  console.warn(this.name , coinNetwork);
            var node = jaxx.Utils2.getReceiveNode(this.config.hd_index, index, this.config.network);
            // console.warn(node);
            return jaxx.Utils2.getNodeKeyPair(node);
        };
        GeneratorBlockchain.prototype.getSignatureForIndex = function (index) {
            //  console.warn('getSignatureForIndex 5555 ' + index);
            // let coinNetwork = HDWalletPouch.getStaticCoinPouchImplementation(this.config.coinType).networkDefinitions.mainNet;
            var node = jaxx.Utils2.getReceiveNode(this.config.hd_index, index, this.config.network);
            //console.log(node);
            var buffer = new thirdparty.Buffer.Buffer(node.keyPair.d.toBuffer(32), 'hex');
            // console.warn(buffer);
            return buffer;
        };
        GeneratorBlockchain.prototype.generateKeyPairChange = function (index) {
            return jaxx.Utils2.getNodeKeyPair(jaxx.Utils2.getChangeNode(this.config.hd_index, index, this.config.network));
        };
        GeneratorBlockchain.signEther = function (etehr_trans, privateKey) {
            var buff = new Buffer(privateKey, 'hex');
            var tx = new thirdparty.ethereum.tx(etehr_trans);
            // var buf = new Buffer(this._pouchManager.getPrivateKey(fromNodeInternal, fromNodeIndex).d.toBuffer(32), 'hex');
            tx.sign(buff);
            return tx.serialize();
        };
        GeneratorBlockchain.getNodeKeyPair = function (node) {
            return node.keyPair;
        };
        GeneratorBlockchain.getNodePrivateKey = function (node) {
            return node.keyPair.d.toBuffer(32).toString('hex');
        };
        GeneratorBlockchain.getPrivateKey = function (keyPair) {
            return keyPair.d.toBuffer(32).toString('hex');
        };
        GeneratorBlockchain.getKeyPairBuffer = function (keyPair) {
            return new Buffer(keyPair.d.toBuffer(32), 'hex');
        };
        GeneratorBlockchain.getEtherAddress = function (node) {
            var ethKeyPair = node.keyPair;
            var prevCompressed = ethKeyPair.compressed;
            ethKeyPair.compressed = false;
            var pubKey = ethKeyPair.getPublicKeyBuffer();
            var pubKeyHexEth = pubKey.toString('hex').slice(2);
            var pubKeyWordArrayEth = thirdparty.CryptoJS.enc.Hex.parse(pubKeyHexEth);
            var hashEth = thirdparty.CryptoJS.SHA3(pubKeyWordArrayEth, { outputLength: 256 });
            var address = hashEth.toString(thirdparty.CryptoJS.enc.Hex).slice(24);
            ethKeyPair.compressed = prevCompressed;
            return "0x" + address;
        };
        GeneratorBlockchain.getBitcoinAddress1 = function (node) {
            return node.keyPair.getAddress();
        };
        return GeneratorBlockchain;
    }());
    GeneratorBlockchain.emitter$ = $({});
    GeneratorBlockchain.MNEMONIC_CHANGED = 'MNEMONIC_CHANGED';
    jaxx.GeneratorBlockchain = GeneratorBlockchain;
})(jaxx || (jaxx = {}));
//# sourceMappingURL=generator-blockchain.js.map