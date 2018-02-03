///<reference path="../com/models.ts"/>
///<reference path="../archive/services/account-service.ts"/>
///<reference path="../app/Registry.ts"/>
var jaxx;
(function (jaxx) {
    var CoinStorage = (function () {
        //balancesTimestamp: number = 0;
        function CoinStorage(config) {
            this.config = config;
            // id: string;
            this.maxTransactions = 200;
            /*saveHistoryTimestamp(num: number): void {
                this.historyTimestamp = num;
                localStorage.setItem('history-timestamp-' + this.name, num + '');
            }*/
            //////////////////////////////////////
            //////////////////////////BalancesTemp ////////////////////////////
            /*  addSpending(num: number): number {
                  this.balanceSpent += num;
                  if (this.balanceSpent < 0) this.balanceSpent = 0;
                  return this.balanceSpent;
              }
      
              removeSpending(num?: number): void {
                  if (num) this.balanceSpent -= num;
                  if (this.balanceSpent < 0) this.balanceSpent = 0;
              }*/
            // balanceSpent: number = 0;
            //////////////////////////////
            /////////////////////               Balances Spent                  ////////
            /*
                    reduceBalaceSpent(address: string, amount: number): void {
            
                        let ar: VOBalanceTemp[] = this.getBalancesTemp();
            
                        for (let i = ar.length - 1; i >= 0; i--) {
                            let b: VOBalanceTemp = ar[i];
                            if (b.id === address) {
                                let precision = ar[i].spent / 100;
                                b.spent -= amount;
                                if (b.spent < precision) {
                                    console.log('%c removing balance spent ' + b.id + ' spent ' + b.spent, 'color:green');
                                    ar.splice(i, 1);
                                } else {
                                    console.log('%c balance left ' + b.id + ' spent ' + b.spent, 'color:red');
                                }
                            }
                        }
                    }*/
            /*   onBalancesDifference(diff: VOBalance[]): void {
                   let indexed: _.Dictionary<VOBalance> = {};
       
                   console.warn(this.name ,diff);
                   diff.forEach(function (b) {
                       indexed[b.id] = b
                   });
       
                   let ar: VOBalanceTemp[] = this.getBalancesTemp();
       
                   for (let i = ar.length - 1; i >= 0; i--) {
                       let b = ar[i];
                       if (indexed[b.id]) {
       
                           ///// try just remove balance temp
       
                          ar.splice(i, 1);
                          console.log('%c removing balance temp ' + b.id + ' spent ' + b.spent, 'color:red');
       /!*
       
                           if (indexed[b.id].old_new < 0) {
                               console.error(' balance spent < 0', indexed[b.id]);
                           }
                           let precision = ar[i].spent / 100;
                           //console.log('%c updating balance ' + b.id + '  ' + b.spent / 1e15 + ' - ' + indexed[b.id].spent/1e15,'color:red');
                           b.spent -= indexed[b.id].old_new;
       
                           if (b.spent < precision) {
                               console.log('%c removing balance spent ' + b.id + ' spent ' + b.spent, 'color:red');
                               ar.splice(i, 1);
                           } else {
                               // console.error('%c balance left '+ b.id +' spent '+b.spent,'color:red');
                           }
       *!/
       
                       }
                   }
       
                   if(ar.length === 0){
                      this.resetBalancesSpent();
                   }
                   ar.forEach(function (item) {
                       console.log('%c left balances temp ' + item.id + '  ' + item.spent / 1e15, 'color:red');
                   });
       
               }*/
            this.balancesTemp = [];
            this.name = config.name;
        }
        CoinStorage.prototype.getItem = function (key) {
            return localStorage.getItem(key);
        };
        CoinStorage.prototype.setItem = function (key, value) {
            return localStorage.setItem(key, value);
        };
        CoinStorage.prototype.clearStorage = function () {
            /// this will clenup data from old menemonic
            console.log(this.config.symbol + '     storage cleared ');
            if (this.getBalancesReceive(true).length)
                this.saveBalancesReceive([]);
            if (this.getBalancesChange(true).length)
                this.saveBalancesChange([]);
            ///// this was missing in 1.3.8.
            if (this.getUTXOs().length)
                this.saveUTXOs([]);
            if (this.getNonces())
                this.saveNonces(null);
            if (this.getTransactionsReceive().length) {
                this.saveTransactionsReceive([]);
            }
            this.resetHistoryTimestamp();
        };
        // History flag require to determinate is history was restored in current coin  moving this functionality from controller-base to storage
        CoinStorage.prototype.resetHistoryTimestamp = function () {
            localStorage.removeItem(this.config.symbol + 'historyTimestamp');
        };
        CoinStorage.prototype.setHistoryTimestamp = function () {
            this.historyTimestamp = (new Date()).toISOString();
            localStorage.setItem(this.config.symbol + 'historyTimestamp', this.historyTimestamp);
        };
        CoinStorage.prototype.getHistoryTimestamp = function () {
            if (!this.historyTimestamp) {
                this.historyTimestamp = localStorage.getItem(this.config.symbol + 'historyTimestamp');
            }
            return this.historyTimestamp;
        };
        CoinStorage.prototype.saveUTXOs = function (utxos) {
            // console.log(' save utxos ', utxos);
            this.UTXOs = utxos;
            localStorage.setItem(this.name + '-UTXOs', JSON.stringify(this.UTXOs));
            localStorage.setItem(this.name + '-UTXOs-timestamp', Date.now() + '');
        };
        CoinStorage.prototype.getUTXOs = function () {
            if (!this.UTXOs) {
                var storedUTXOs = localStorage.getItem(this.name + '-UTXOs');
                if (storedUTXOs !== null) {
                    try {
                        this.UTXOs = JSON.parse(storedUTXOs);
                    }
                    catch (e) {
                        console.error('Cannot read ' + this.name + ' UTXOs from cache. ' + JSON.stringify(e));
                        this.UTXOs = [];
                    }
                }
                else {
                    this.UTXOs = [];
                }
            }
            return this.UTXOs;
        };
        /** Reads the unspent transaction outputs that the user can potential spend in a new transaction.
         * Returns an array with the data or null if the data doesn't exist
         */
        CoinStorage.prototype.getUTXOsFromCache = function () {
            var cachedUTXOs = localStorage.getItem(this.name + '-UTXOs');
            if (cachedUTXOs !== null && cachedUTXOs !== undefined) {
                try {
                    return JSON.parse(cachedUTXOs);
                }
                catch (e) {
                    console.error('Cannot read ' + this.name + ' UTXOs from cache. ' + JSON.stringify(e));
                    return null;
                }
            }
            else {
                return null;
            }
        };
        CoinStorage.prototype.saveNonces = function (nonces) {
            //console.log(' save nonces ', nonces);
            this.nonces = nonces;
            localStorage.setItem(this.name + '-nonces', JSON.stringify(this.nonces));
            localStorage.setItem(this.name + '-nonces-timestamp', Date.now() + '');
        };
        CoinStorage.prototype.getNonces = function () {
            if (!this.nonces) {
                var str = localStorage.getItem(this.name + '-nonces');
                this.nonces = str ? JSON.parse(str) : {};
            }
            return this.nonces;
        };
        CoinStorage.prototype.getBalancesNot0 = function () {
            return this.getBalancesReceiveNot0().concat(this.getBalancesChangeNot0());
        };
        /*  getAddressesNo0Change(fee: number = 0): string[] {
              return Utils.getIds(this.getBalancesNot0Change(fee));
          }
  */
        /* getBalancesNot0Change(fee: number = 0): VOBalance[] {
             let out: VOBalance[] = [];
 
             let bals:VOBalance[] = this.getBalancesChange(true);
 
             bals.forEach(function (item) {
                 if (+item.balance > fee) out.push(new VOBalance({id: item.id, balance: item.balance, index: item.index}));
 
             });
             return out;
         }*/
        CoinStorage.prototype.setCreateNewWallet = function () {
            localStorage.setItem(this.name + 'createnewallet', (new Date()).toISOString());
        };
        CoinStorage.prototype.isNewWallet = function () {
            return localStorage.getItem(this.name + 'createnewallet');
        };
        CoinStorage.prototype.unsetCreateNewWalletd = function () {
            localStorage.removeItem(this.name + 'createnewallet');
        };
        /* removeNulesSpent(){
         var ar:VOBalance[] = this.getBalancesTemp();
         for(var i=ar.length-1; i>=0; i--){
         if(ar[i].balance ===0 ) ar.splice(i,1)  ;
         }
         this.balancesSpent = ar;
         }*/
        /*  checkBalancesSpent(): void {
  
              let ar: VOBalanceTemp[] = this.getBalancesTemp();
              let now: number = Date.now();
  
              let delta: number = 120000 * 1000;
  
              for (let i = ar.length - 1; i >= 0; i--) {
  
                  if ((now - ar[i].timestamp) > delta) {
                      console.warn(now + ' removing balance spent due  timestamp  id: ' + ar[i].id + ' spent: ' + ar[i].spent + ' timestamp delta : ' + (now - ar[i].timestamp));
                      ar.splice(i, 1)
                  }
              }
  
              this.balancesTemp = ar;
  
              if (ar.length === 0) {
                  clearInterval(this.spentInreval);
                  this.spentInreval = 0;
              }
  
              if (this.balancesTemp) {
                  // console.log(Utils.addresseFromBalances(this.balancesSpent));
                  // console.log('balances spent: ' + this.getBalanceSpent() / 1e15, this.balancesSpent.forEach(function(item){ console.log(item.id+' spent: '+item.spent/1e15)}));
              }
          }
  */
        // spentInreval: number = 0;
        /*  addBalancesSpent(ar: VOBalanceTemp[]) {
              console.log(this.name + ' adding balances spent ', ar);
              if (this.spentInreval === 0) this.spentInreval = setInterval(() => this.checkBalancesSpent(), 20000);
              if(this.balancesTemp.length === 0){
                  this.balancesTemp = ar;
                  this.emitter$.triggerHandler(this.ON_BALANCE_TEMP_LENGTH_NOT_0,[ar]);
                  return;
              }
  
              let out: VOBalanceTemp[] = [];
              for (let i = 0, n = ar.length; i < n; i++) {
  
                  if (isNaN(ar[i].spent)) continue;
  
                  let bal: VOBalanceTemp = this.getBalanceSpentById(ar[i].id);
  
                  if (bal) {
                      // console.log(' adding balance to existing was  ' + bal.spent/1e15 + ' + '+ ar[i].spent/1e15  )
                      bal.spent += ar[i].spent;
                      // bal.txids = bal.txids.concat(ar[i].txids);
                      //console.log(' now ' + bal.spent/1e15);
                      bal.count++;
                  }
                  else {
                      out.push(ar[i]);
                      /// console.log(' adding new balance ',ar[i]);
                  }
              }
              if (out.length) this.balancesTemp = this.balancesTemp.concat(out);
          }*/
        /*
                removeTempBalancesByTxIds(txids: string[]): void {
                    let ar: VOBalanceTemp[] = this.balancesSpent;
                    for (let i = ar.length - 1; i >= 0; i--) {
        
                        if (txids.indexOf(ar[i].txid)) {
                            // console.log('removing by txdid '+ ar[i].id +"   "+ ar[i].spent/1e10);
                            ar.splice(i, 1);
                        }
                    }
                }*/
        /*   getBalancesTemp(): VOBalanceTemp[] {
               return this.balancesTemp;
           }*/
        /* getBalanceTemp(): number {
             return this.balancesTemp.reduce(function (a, b) {
                 return a+=b.spent;
             },0);
            /!* let spent = 0;
             this.balancesSpent.forEach(function (item) {
                 spent += item.spent
             });
             return spent;*!/
         };*/
        /*
                resetBalancesSpent(): void {
                    //console.warn(' resetBalancesSpent ');
                    this.emitter$.triggerHandler(this.ON_BALANCE_TEMP_LENGTH_0);
                    this.balancesTemp = [];
                }*/
        /*      getBalanceSpentById(id: string): VOBalanceTemp {
                  let ar: VOBalanceTemp[] = this.getBalancesTemp();
                  for (let i = 0, n = ar.length; i < n; i++) if (ar[i].id === id) return ar[i];
                  return null;
              }*/
        //////////////////////////////////////////  end balances Spent///////////////////////////////////////////////////
        /*
         getBalanceTemp(): number {
         let balances: VOBalanceTemp[] = this.getBalancesTemp();
         return balances.length ? jaxx.Utils.calculateBalance(balances) : 0;
         }*/
        /* balancesTemp1: VOBalanceTemp[];

         addBalanceTemp(balance: VOBalanceTemp) {
         // console.log('added balance temp ',balance);
         let bals: VOBalanceTemp[] = this.getBalancesTemp();
         bals.push(balance);
         this.saveBalancesTemp(bals);
         }*/
        /* removeBalanceTemp(balance: VOBalanceTemp) {

         console.log('removing balance temp',balance);
         let bals: VOBalanceTemp[] = this.getBalancesTemp();

         for(let i= bals.length; i>=0 ;i++){
         if(bals[i].id === balance.id && bals[i].balance === balance.balance ) {
         bals.splice(i,1);
         console.log('found balance ', balance);
         }
         }
         this.saveBalancesTemp(bals);
         }*/
        /* addBalancesTemp(balances: VOBalanceTemp[]) {
         let bals: VOBalanceTemp[] = this.getBalancesTemp();


         bals = bals.concat(balances);
         this.saveBalancesTemp(bals);
         }
         */
        /* getBalancesTemp(): VOBalanceTemp[] {
         if (!this.balancesTemp1) {
         let str: string = localStorage.getItem('balances-temp-' + this.name);
         if (str) this.balancesTemp1 = _.map(JSON.parse(str), o => new VOBalanceTemp(o));
         else this.balancesTemp1 = [];
         }
         return this.balancesTemp1;
         }
         */
        /*saveBalancesTemp(balances: VOBalanceTemp[]): void {
         ///console.warn('saveBalancesTemp   ',balances);
         this.balancesTemp1 = balances;
         localStorage.setItem('balances-temp-' + this.name, JSON.stringify(balances));
         this.refreshBalanceTotal();

         }*/
        ////////////////////////////////////////////////////////////////// end Balance temp
        /* getBalancesHighestFirst(): VOBalance[] {
             let bals1: VOBalance[] = this.getBalancesReceive();
             let bals2: VOBalance[] = this.getBalancesChange();
             let bals = bals1.concat(bals2);
             return _.sortBy(bals, item => item.balance);
         }*/
        /* private addTempBalance(balance: VOBalance, balances: VOBalanceTemp[]): void {
         balances.forEach(function (item) {
         if (item.id == balance.id) {
         balance.balance += item.balance;
         }
         })
         }*/
        /* isAddressInternal(address: string): number {
             return (this.getAddressesChange().indexOf(address) !== -1) ? 1 : 0;
         }
 
         getAddressesNot0(): string[] {
             return this.getBalancesNot0().map(function (item) {
                 return item.id;
             })
         }*/
        /*   getAddressesNo0Receive(): string[] {
   
              // return Utils.getIds(this.getBalancesNot0Receive(fee));
   
           }*/
        /* getBalancesNot0Receive(fee: number = 0): VOBalance[] {
             let out: VOBalance[] = [];
             //let ar:VOBalance[] = this._balancesReceive;
             let bals:VOBalance[] = this.getBalancesReceive(true);
 
                 bals.forEach(function (item) {
                     if (+item.balance > fee) out.push(new VOBalance({id: item.id, balance: item.balance, index: item.index}));
                 });
 
 
             return out;
         }
 */
        CoinStorage.prototype.getBalancesChangeNot0WithSpend = function () {
            var out = [];
            var ar = this._balancesChange;
            var spent = this.balancesTemp;
            var indexed = {};
            spent.forEach(function (b) {
                indexed[b.id] = b;
            });
            ar.forEach(function (bal) {
                if (+bal.balance !== 0) {
                    var b = new VOBalance(bal);
                    if (indexed[b.id]) {
                        //TODO link to MATH
                        //+b.balance -= indexed[b.id].spent;
                    }
                    out.push(b);
                }
            });
            return out;
        };
        /* getBalancesReceiveNot0WithSpend(): VOBalance[] {
             let out: VOBalance[] = [];
             let ar: VOBalance[] = this._balancesReceive;
             let spent: VOBalanceTemp[] = this.balancesTemp;
             let indexed = {};
             spent.forEach(function (b) {
                 indexed[b.id] = b;
             });
 
             ar.forEach(function (bal) {
                 if (bal.balance !== 0) {
                     let b = new VOBalance(bal);
                     if (indexed[b.id]) {
                         b.balance -= indexed[b.id].spent;
                         // b.nonce = indexed[b.id].nonce;
 
                     }
                     out.push(b)
 
                 }
             });
             return out;
         }
 */
        /* getBalancesIndexedReceiveNot0WithIndex(): VOBalance[] {
 
             let ballances: VOBalance[] = this.getBalancesReceive();
             if (ballances.length === 0) return [];
 
             let spending: VOBalanceTemp[] = this.getBalancesTemp();
 
             let spend = {};
 
             spending.forEach(function (b) {
 
                 if (spend[b.id]) spend[b.id] += b.spent;
                 else spend[b.id] = b.spent;
                 // spend[b.id] = b;
 
             });
 
             let out: VOBalance[] = [];
 
             for (let i = 0, n = ballances.length; i < n; i++) {
                 let item: VOBalance = ballances[i];
 
                 if (item.balance) {
                     item.index = i;
                     if (spend[item.id]) item.balance -= spend[item.id];
                     out.push(item)
                 }
 
             }
 
             //console.log(out);
 
             /!*
              let addresses: string[] = this.getAddressesReceive();
              ballances.forEach((item) => {
              if (item.balance) {
              let bal: VOBalance = new VOBalance(item);
              bal.index = addresses.indexOf(item.id);
              if (balancesTemp.length) this.addTempBalance(bal, balancesTemp);
              out.push(bal);
              }
 
              })*!/
             return out;
         }
 */
        /*  getBalancesIndexedChangeNot0WithIndex(): VOBalance[] {
              let ballances: VOBalance[] = this.getBalancesChange();
              // if(ballances.length === 0 ) return [];
  
              // let addresses: string[] = this.getAddressesChange();
              let spending: VOBalanceTemp[] = this.getBalancesTemp();
              let out: VOBalance[] = [];
  
              let spend = {};
  
              spending.forEach(function (b) {
  
                  if (spend[b.id]) spend[b.id] += b.spent;
                  else spend[b.id] = b.spent;
                  // spend[b.id] = b;
  
              });
  
  
              // let spent = _.keyBy(spending, 'id');
  
              for (let i = 0, n = ballances.length; i < n; i++) {
                  let item: VOBalance = ballances[i];
                  if (item.balance) {
                      item.index = i;
                      if (spend[item.id]) item.balance -= spend[item.id];
                      out.push(item)
                  }
  
              }
              /!*  _.each(ballances, function (item) {
               if (item.balance) {
               let bal: VOBalance = new VOBalance(item);
               bal.index = addresses.indexOf(item.id);
  
               if (balancesTemp.length) this.addTempBalance(bal, balancesTemp);
               out.push(bal);
               }
  
               })*!/
              return out;
          }
  */
        CoinStorage.prototype.saveBalancesAll = function () {
            this.saveBalancesReceive();
            this.saveBalancesChange();
        };
        CoinStorage.prototype.getBalancesAll = function (orig) {
            return this.getBalancesReceive(orig).concat(this.getBalancesChange(orig));
        };
        //balancesChangePrev: VOBalance[];
        /* addBalanceChange(bal: VOBalance): void {
             if(this.getAddressesChange().indexOf(bal.id) !==-1) return;
             if(isNaN(bal.index)) bal.index = this._balancesChange.length;
             this._balancesChange.push(bal);
             this._saveBalancesChange();
            // this.saveCurrentIndexChange(this._balancesChange.length);
 
         }*/
        /* getBalancesChangePrev(): VOBalance[] {
             return this.balancesChangePrev;
         }*/
        ///set to true risky lost sequence
        CoinStorage.prototype.getBalancesChange = function (orig) {
            if (!this._balancesChange) {
                var str = localStorage.getItem('balances-change-' + this.name);
                if (str)
                    this._balancesChange = JSON.parse(str).map(function (item) {
                        return new VOBalance(item);
                    });
                else
                    this._balancesChange = [];
            }
            if (orig)
                return this._balancesChange;
            var out = [];
            this._balancesChange.forEach(function (item) {
                out.push(new VOBalance(item));
            });
            return out;
        };
        CoinStorage.prototype.getBalancesChangeNot0 = function () {
            return this.getBalancesChange(true).filter(function (item) {
                return item.balance !== '0';
            });
        };
        /*getBalanceChange(): number {
            // let balances: VOBalance[] = this.getBalancesChange();

            // console.log(this.name+' change ' + jaxx.Utils.calculateBalance( this.getBalancesChange(true)));
            return jaxx.Utils.calculateBalance(this.getBalancesChange(true));
        }*/
        /*  updateBalancesChange(ar: VOBalance[]): void {
              this.balancesChangePrev = this._balancesChange;
  
              console.log(' updateBalancesChange  ');
              console.log(ar,this.getBalancesChange());
  
              this._balancesChange =    ar;// Utils.updateOldBalances(this._balancesChange, ar);
              this._saveBalancesChange()
          }*/
        // balaceChangeTotal:number;
        CoinStorage.prototype.saveBalancesChange = function (ar) {
            if (ar)
                this._balancesChange = ar;
            /// console.log('%c'+ this.name + 'saving new balances change length ' + this._balancesChange.length,'color:red');
            localStorage.setItem('balances-change-timestamp-' + this.name, Date.now() + '');
            localStorage.setItem('balances-change-' + this.name, JSON.stringify(this._balancesChange));
        };
        /*  addBalanceChange(balance: VOBalance): number {
         let balances: VOBalance[] = this.getBalancesChange();
         balances.push(balance);
         this.saveBalancesChange(balances);
         return balances.length;
         }

         updateBalanceChange(balance: VOBalance): void {
         let balances: VOBalance[] = this.getBalancesChange();
         jaxx.Utils.updateItemById(balances, balance);
         this.saveBalancesChange(balances);
         }*/
        CoinStorage.prototype.getBalanceChangeByAddress = function (address) {
            var ar = this.getBalancesChange();
            for (var i = 0, n = ar.length; i < n; i++)
                if (ar[i].id === address)
                    return ar[i];
            return null;
        };
        /*getBalanceReceive(): number {
            // console.log(this._balancesReceive)
            //console.log( this.name + ' receive '+jaxx.Utils.calculateBalance(this.getBalancesReceive(true)))

            let bals = this.getBalancesReceive(true);
            //console.log(bals)
            return jaxx.Utils.calculateBalance(bals);
        }*/
        CoinStorage.prototype.getBalanceRecaiveByAddress = function (address) {
            var ar = this.getBalancesReceive();
            for (var i = 0, n = ar.length; i < n; i++)
                if (ar[i].id === address)
                    return ar[i];
            return null;
        };
        /*getBalancesReceivePrev():VOBalance[] {
         return this.balancesReceivePrev.slice(0);
         }*/
        CoinStorage.prototype.addBalanceReceive = function (balance) {
            var addresses = this.getAddressesReceive();
            if (addresses.indexOf(balance.id) !== -1)
                return;
            if (isNaN(balance.index))
                balance.index = this._balancesReceive.length;
            this._balancesReceive.push(balance);
            this.saveBalancesReceive();
            // this.saveCurrentIndexReceive(this._balancesReceive.length);
        };
        ///set to true risky lost sequence
        CoinStorage.prototype.getBalancesReceive = function (orig) {
            if (orig === void 0) { orig = false; }
            // wallet.getPouchFold(COIN_BITCOIN).getDataStorageController()._db
            if (!this._balancesReceive) {
                var str = localStorage.getItem('balances-receive-' + this.name);
                //console.error(str);
                if (str) {
                    var data = JSON.parse(str);
                    if (!Array.isArray(data))
                        data = [data];
                    this._balancesReceive = data.map(function (item) {
                        return new VOBalance(item);
                    });
                }
                else
                    this._balancesReceive = [];
            }
            //console.log(this.balancesReceive1[this.balancesReceive1.length-1].balance);
            if (orig)
                return this._balancesReceive;
            var out = [];
            this._balancesReceive.forEach(function (item) {
                out.push(new VOBalance(item));
            });
            return out; //JSON.parse(JSON.stringify(this.balancesReceive1));
        };
        CoinStorage.prototype.getBalancesReceiveNot0 = function () {
            return this.getBalancesReceive(true).filter(function (item) {
                return item.balance !== '0';
            });
        };
        //balancesRecaiveTotal:number;
        CoinStorage.prototype.updateBalancesReceive = function (ar) {
            this.balancesReceivePrev = this._balancesReceive;
            //console.log(' updateBalancesReceive ');
            //console.log(ar,this.getBalancesReceive());
            var indexed = _.keyBy(ar, 'id');
            var bals = this.getBalancesReceive(true);
            var stamp = Date.now();
            bals.forEach(function (item) {
                if (indexed[item.id])
                    item.balance = indexed[item.id].balance;
                item.timestamp = stamp;
            });
            //this._balancesReceive = Utils.updateOldBalances(this._balancesReceive, ar);
            // console.log(jaxx.Utils.calculateBalance(this._balancesReceive)/1e15);
            this.saveBalancesReceive();
        };
        CoinStorage.prototype.saveBalancesReceive = function (ar) {
            if (ar)
                this._balancesReceive = ar;
            var errors = this._balancesReceive.filter(function (item) {
                return item.id.length < 20;
            });
            if (errors.length) {
                console.error(errors);
            }
            localStorage.setItem('balances-receive-timestamp' + this.name, Date.now() + '');
            localStorage.setItem('balances-receive-' + this.name, JSON.stringify(this._balancesReceive));
        };
        CoinStorage.prototype.indexBalances = function () {
            this.indexBalancesReceive();
            this.indexBalancesChange();
        };
        CoinStorage.prototype.indexBalancesReceive = function () {
            var i = 0;
            this.getBalancesReceive(true).forEach(function (item) {
                item.index = i++;
            });
            this.saveBalancesReceive();
        };
        CoinStorage.prototype.indexBalancesChange = function () {
            var i = 0;
            this.getBalancesChange(true).forEach(function (item) {
                item.index = i++;
            });
            this.saveBalancesChange();
        };
        /*addBalanceReceive(balance: VOBalance): number {

         let balances: VOBalance[] = this.getBalancesReceive();
         balances.push(balance);
         this.saveBalancesReceive(balances);
         return balances.length;
         }*/
        /* getBalanceTempTransactions():number{
         let transactions:VOTransaction[] = this.getTransactionsTemp();
         return jaxx.Utils.calculateBalanceTransactions(transactions);
         }
         */
        ////////////////////////////////////////// Transactions
        /* updateTransactionsReceive(transactions: VOTransaction[]): VOTransaction[] {
         let newtransactions: VOTransaction[] = [];
         let old: VOTransaction[] = this.getTransactionsReceive();
         let indexed: Dictionary<VOTransaction> = _.keyBy(old, 'id');
         transactions.forEach(function (item) {
         if (!indexed[item.id]) {
         newtransactions.push(item);
         }
         })
         if (newtransactions.length) {
         old = old.concat(newtransactions);
         this.saveTransactionsReceive(old);
         }

         return newtransactions;
         }*/
        /////////////////////////////////////////////////// end balances   //////////////////////////////////////
        /*
         updateTransactionsChange(trs: VOTransaction[]):{newtrs: VOTransaction[],updated:VOTransaction[]} {

         let indexed = _.keyBy(trs,'id');
         let transactions:VOTransaction[] = this.getTransactionsChange();
         let out:VOTransaction[] =[];
         let updated:VOTransaction[] = [];
         let newtrs:VOTransaction[] = [];
         transactions.forEach(transaction =>{

         if(indexed[transaction.id]) {
         let tr:VOTransaction = indexed[transaction.id];
         out.push(tr);
         indexed[transaction.id] = null;
         updated.push(tr)
         }else{
         out.push(transaction);
         }
         })

         for(let str in indexed)if(indexed[str]){
         out.push(indexed[str]);
         newtrs.push(indexed[str]);

         }

         this._saveTransactionsChange(out);
         return {newtrs:newtrs,updated:updated};
         }*/
        /* private _updateTransactionsForAddress(address: string, transactionsNew: VOTransaction[], transactionsAll: VOTransaction[]): VOTransaction[] {

         let out: VOTransaction [] = _.filter(transactionsAll, function (o) {
         return o.address !== address
         });
         return out.concat(transactionsNew);
         }*/
        /* updateTransactionsForAddress(address: string, transactions: VOTransaction[], change_receive?: string): void {
         let trs: VOTransaction[];
         if (!change_receive) {
         let addressesChange: string[] = this.getAddressesChange();
         change_receive = (addressesChange.indexOf(address) === -1 ? 'receive' : 'change');
         }

         if (change_receive === 'change') {
         trs = this.getTransactionsChange();
         trs = this._updateTransactionsForAddress(address, transactions, trs);
         this.saveTransactionsChange(trs);
         } else {
         trs = this.getTransactionsReceive();
         trs = this._updateTransactionsForAddress(address, transactions, trs);
         this.saveTransactionsReceive(trs);
         }
         }*/
        CoinStorage.prototype.getTransactionsByAddressReceive = function (address) {
            var transactions = this.getTransactionsReceive();
            var out = [];
            transactions.forEach(function (item) {
                if (item.id === address)
                    out.push(item);
            });
            return out;
        };
        /* getTransactionsByAddressChange(address: string): VOTransaction[] {
             let transactions: VOTransaction[] = this.getTransactionsChange();
             let out: VOTransaction[] = [];
             transactions.forEach(function (item) {
                 if (item.id === address) out.push(item)
             });
             return out;
         }
 */
        CoinStorage.prototype.getTransactionsByAddress = function (address) {
            var out = this.getTransactionsByAddressReceive(address);
            // console.log('getTransactionsByAddressRecaive   ' + address, out);
            if (out.length)
                return out;
            //out = this.getTransactionsByAddressChange(address);
            //if (out.length) return out;
            return null;
        };
        /*
                getTransactionByIdChange(id: string): VOTransaction {
                    let transactions: VOTransaction[] = this.getTransactionsChange();
                    return this._getTransactionById(transactions, id);
                }*/
        CoinStorage.prototype.getTransactionByIdReceive = function (id) {
            var transactions = this.getTransactionsReceive();
            return this._getTransactionById(transactions, id);
        };
        CoinStorage.prototype._getTransactionById = function (transactions, id) {
            for (var i = 0, n = transactions.length; i < n; i++) {
                if (transactions[i].id === id)
                    return transactions[i];
            }
            return null;
        };
        /* getTransactionReceiveLast(): VOTransaction {
             let trs: VOTransaction[] = this.getTransactionsReceive();
             let l: number = trs.length;
             return l ? trs[trs.length - 1] : null;
         }*/
        CoinStorage.prototype.getTransactionsReceive = function () {
            if (!this.transactionsReceive) {
                this.transactionsReceive = [];
                var str = localStorage.getItem('transactions-receive-' + this.name);
                var trs = [];
                if (str) {
                    trs = JSON.parse(str); //.map(function (item) {
                    //                        return new VOTransaction(item);
                    //                    });
                }
                this.transactionsReceive = trs;
            }
            return this.transactionsReceive;
        };
        //transactionTimestampReceive: number = 0;
        /*  setTransactionsReceive(trs: VOTransaction[]): void {
              if (trs.length === 0)return;
              Utils.sortByTimestamp(trs);
              this.transactionTimestampReceive = trs[trs.length - 1].timestamp;
              this.transactionsReceive = trs;
              this.saveTransactionsReceive(trs);
          }*/
        /*updateTransactionsReceive(new_transactions:VOTransaction[]):void{
            let transactions: VOTransaction[] = this.getTransactionsReceive();
            Utils.updateOldTransactions(transactions, new_transactions);
            this.transactionsReceive = transactions;
            this.saveTransactionsReceive();
        }*/
        /*
                setTransactions(trs:VOTransaction[]):void{
                    this.transactionsReceive = trs;
                    this.saveTransactionsReceive();
                }
        
                addTempTransactions(trs:VOTransaction[]):void{
                    this.transactionsReceive = this.transactionsReceive.concat(trs);
                    this.saveTransactionsReceive();
                }*/
        /* updateTransactionsReceiveGetNew(new_transactions: VOTransaction[]): VOTransaction[] {
             let transactions: VOTransaction[] = this.getTransactionsReceive();
 
                 Utils.updateOldTransactions(transactions, new_transactions);
 
             let diff: VOTransaction[] =  Utils.getNewTransactions(transactions, new_transactions);
 
             Utils.sortByTimestamp(transactions);
 
             this.transactionsReceive = transactions.concat(diff);
 
 
             // let out:VOTransaction[] = Utils.filterLatest(trs,this.transactionTimestampReceive);
 
            // if( this.transactionsReceive.length)this.transactionTimestampReceive = this.transactionsReceive[this.transactionsReceive.length - 1].timestamp;
 
             this.saveTransactionsReceive();
 
             return diff;
         }
 */
        CoinStorage.prototype.addTransactions = function (newtrs) {
            if (!this.transactionsReceive)
                this.transactionsReceive = newtrs;
            else {
                this.transactionsReceive = _.uniqBy(this.transactionsReceive.concat(newtrs), 'id');
            }
            //this.saveTransactionsReceive();
            return newtrs;
        };
        CoinStorage.prototype.saveTransactionsReceive = function (transactionos) {
            // console.log(' saveTransactionsReceive  ', trs);
            if (transactionos) {
                this.transactionsReceive = _.uniqBy(transactionos, 'id');
            }
            this.transactionsReceive = _.orderBy(this.transactionsReceive, 'timestamp');
            // this.transactionsReceive = _.sortBy(this.transactionsReceive)
            if (this.transactionsReceive.length > this.maxTransactions) {
                console.log('%c ' + this.config.symbol + ' removing extra transactins ' + (this.transactionsReceive.length - this.maxTransactions), 'color:red');
                this.transactionsReceive = this.transactionsReceive.slice(this.transactionsReceive.length - this.maxTransactions);
            }
            console.log('%c ' + this.config.symbol + ' save transactins ' + this.transactionsReceive.length, 'color:red');
            //localStorage.setItem('transactions-receive-timestamp-' + this.name, this.transactionTimestampReceive + '');
            localStorage.setItem('transactions-receive-' + this.name, JSON.stringify(this.transactionsReceive));
        };
        //////////////// transactions change
        // private transactionsChange: VOTransaction[];
        /*getTransactionsChangeLast():VOTransaction{
         let trs:VOTransaction[] = this.getTransactionsChange();
         let l:number = trs.length;
         return l?trs[trs.length-1]:null;
         }*/
        /* getTransactionsChange(): VOTransaction[] {
             if (!this.transactionsChange) {
 
                 this.transactionTimestampReceive = Number(localStorage.getItem('transactions-change-timestamp-' + this.name));
                 let str: string = localStorage.getItem('transactions-change-' + this.name);
                 if (str) this.transactionsChange = JSON.parse(str).map(function (item) {
                     return new VOTransaction(item);
                 });
                 else this.transactionsChange = [];
             }
 
             return this.transactionsChange;
         }*/
        /* saveTransactionsChange(trs: VOTransaction[], length?: number): void {
            // if (trs.length == 0)return;
          //   console.log(' saveTransactionsChange   ',trs);
 
             this.transactionsChange = trs;
             // trs = _.sortBy(trs,['timestamp']);
             if (trs.length > this.maxTransactions) trs = trs.slice(trs.length - this.maxTransactions);
 
             localStorage.setItem('transactions-change-timestamp-' + this.name, Date.now() + '');
             localStorage.setItem('transactions-change-' + this.name, JSON.stringify(trs));
 
         }*/
        ////////////////////      Address   /////////////////////////////////////////////////////
        CoinStorage.prototype.getAddressesAll = function () {
            return this.getAddressesReceive().concat(this.getAddressesChange());
        };
        CoinStorage.prototype.getAddressesReceive = function () {
            return _.map(this.getBalancesReceive(true), 'id');
            // return this.addressesReceive;
        };
        CoinStorage.prototype.getCurrentAddressReceive = function () {
            var bals = this.getBalancesReceive(true);
            return bals.length ? _.last(bals).id : '';
        };
        CoinStorage.prototype.getCurrentIndexReceive = function () {
            return this.getBalancesReceive(true).length - 1;
        };
        CoinStorage.prototype.getAddressesChange = function () {
            return _.map(this.getBalancesChange(true), 'id');
        };
        CoinStorage.prototype.getCurrentAddressChange = function () {
            var bals = this.getBalancesChange(true);
            return bals.length ? _.last(bals).id : '';
        };
        return CoinStorage;
    }());
    jaxx.CoinStorage = CoinStorage;
})(jaxx || (jaxx = {}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=coin-storage.js.map