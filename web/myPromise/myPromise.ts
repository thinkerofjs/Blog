export interface PromiseConstructor<T> {
    onfulfilled: Array<(value: any) => T>;
    onrejected: Array<(value: any) => T>;

    new<T>(executor: (resolve?: (value?: T) => void, reject?: (reason?: any) => void) => void): PromiseConstructor<T[]>;

    reject<T = never>(reason?: any): PromiseConstructor<T>;

    resolve<T>(value: T): PromiseConstructor<T>;

    resolve(): PromiseConstructor<T>;

    resolve(...args:Array<T>): PromiseConstructor<T>;

    then<TResult1 = T, TResult2 = never>(onfulfilled: (value: T) => TResult1, onrejected: (value: any) => TResult2): PromiseConstructor<T>

    catch<TResult2 = never>(onrejected: (value: any) => TResult2): PromiseConstructor<T>

    resultResolve(onfulfilled:Array<(value: any) => T>,arg:Array<any>,index?:number):void;
}

export interface myPromise <T> extends PromiseConstructor<T>{
    reject<T = never>(reason?: any): PromiseConstructor<T>;

    resolve<T>(value: T): PromiseConstructor<T>;

    resolve(): PromiseConstructor<T>;

    resolve(...args:Array<T>): PromiseConstructor<T>;
}

export class myPromise <T> implements myPromise<T>,PromiseConstructor<T>{
    onfulfilled = [];
    onrejected = [];

    constructor(executor: (resolve?: (value?: T) => void, reject?: (reason?: any) => void) => void){
        setTimeout(()=>{
            executor(this.resolve.bind(this), this.reject.bind(this));
        });
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: (value: T) => TResult1, onrejected?: (value: any) => TResult2) : any{
        if(onfulfilled){
            this.onfulfilled.push(onfulfilled)
        }
        if(onrejected){
            this.onrejected.push(onrejected)
        }
        return this;
    }

    catch<TResult2 = never>(onrejected?: (value: any) => TResult2): any{
        if(onrejected){
            this.onrejected.push(onrejected)
        }
        return this;
    }

    resultResolve(onfulfilled,arg,index = 0){
        if(typeof onfulfilled[index] === "function"){
            var value = onfulfilled[index].apply(null, arg);
            if(value && value.constructor && value.constructor.name === "myPromise"){
                value.then(res=>{
                    myPromise.prototype.resultResolve(onfulfilled,[res], index+1);
                })
            }else {
                myPromise.prototype.resultResolve(onfulfilled,[value], index+1);
            }
        }
    }

    resolve(...args:Array<T>): any{
        const onfulfilled = (this.onfulfilled || (this.onfulfilled = []));
        myPromise.prototype.resultResolve(onfulfilled,args);
        return new myPromise((resolve) => {
            resolve.apply(null,args);
        });
    }

    reject(...arg): any{
        const onrejected = (this.onrejected || (this.onrejected = []));
        myPromise.prototype.resultResolve(onrejected,arg);
        return new myPromise((resolve) => {
            resolve.apply(null,arg);
        });
    }
}

(<any>myPromise).resolve = myPromise.prototype.resolve;
(<any>myPromise).reject = myPromise.prototype.reject;

new myPromise(resolve => {}).then()
new myPromise((resolve, reject) => {
    // resolve(11);
    reject(11);
}).then(function (res){
    console.log(res, 666)
    return 667;
}).then(res=>{
    console.log(res, 22)
    return (<any>myPromise).resolve(23)
}).then(res=>{
    console.log(res, 33)
}).catch(err=>{
    console.log(err,111.111)
    return (<any>myPromise).reject(9999);
}).catch(err=>{
    console.log(err,111)
    return 454
}).then(res=>{
    console.log(res, 999)
}).catch(err=>{
    console.log(err,888)
})